// Updated: 2026-02-16
// SDK Agent Execution - 100% Claude Code SDK TUI
// Uses only SDK message payloads, zero hardcoding

import { useState, useCallback, useRef } from 'react';
import { createSdkAgent } from '../agent/sdk-agent.js';
import { generateId } from '../cli/types.js';
import { loadInstalledPlugins } from '../utils/plugin-loader.js';
import { SdkTUI, type SdkTUIState } from '../components/SdkTUI.js';
import { reduceSdkMessageToState, INITIAL_SDK_TUI_STATE } from '../utils/sdk-tui-state.js';
import type {
  AskUserQuestionRequest,
  AskUserQuestionItem,
  AskUserQuestionAnswers,
  SdkToolPermissionRequest,
} from '../agent/sdk-agent.js';
import type { SdkPermissionMode } from '../agent/sdk-options.js';
import { getSetting } from '../utils/config.js';

export interface SdkAskUserQuestionRequest extends AskUserQuestionRequest {
  currentIndex: number;
}

export interface SdkCurrentTurn {
  id: string;
  query: string;
  sdkTuiState: SdkTUIState;
}

interface UseSdkAgentExecutionOptions {
  model?: string;
  systemPrompt?: string;
  cwd?: string;
  permissionMode?: SdkPermissionMode;
  resume?: string;
  continue?: boolean;
  additionalDirectories?: string[];
  onAnswerComplete?: (answer: string) => void;
}

interface UseSdkAgentExecutionResult {
  currentTurn: SdkCurrentTurn | null;
  answerStream: null;
  isProcessing: boolean;
  processQuery: (query: string, options?: { resume?: string; continue?: boolean }) => Promise<void>;
  handleAnswerComplete: (answer: string) => void;
  cancelExecution: () => void;
  clarificationRequest: null;
  submitClarificationAnswer: () => void;
  proceedCheckpoint: null;
  submitProceedAnswer: () => void;
  askUserQuestionRequest: SdkAskUserQuestionRequest | null;
  submitAskUserAnswer: (answer: string) => void;
  toolPermissionRequest: SdkToolPermissionRequest | null;
  submitToolPermissionAnswer: (allowed: boolean) => void;
}

function parseAskUserAnswer(
  raw: string,
  question: AskUserQuestionItem
): { selectedLabels: string[]; customText?: string } {
  const trimmed = raw.trim();
  if (!trimmed) return { selectedLabels: [question.options[0]?.label ?? ''] };
  const lower = trimmed.toLowerCase();
  if (lower.startsWith('other') || lower.startsWith('other:')) {
    const customText = trimmed.replace(/^other:?\s*/i, '').trim();
    return { selectedLabels: ['Other'], customText: customText || undefined };
  }
  const num = parseInt(trimmed, 10);
  if (!Number.isNaN(num) && num >= 1 && num <= question.options.length) {
    const opt = question.options[num - 1];
    return { selectedLabels: [opt?.label ?? ''] };
  }
  const matched = question.options.find(
    (o) => o.label.toLowerCase() === trimmed || o.label.toLowerCase().includes(lower)
  );
  return matched ? { selectedLabels: [matched.label] } : { selectedLabels: [trimmed] };
}

export function useSdkAgentExecution({
  model = 'claude-sonnet-4-5-20250929',
  systemPrompt,
  cwd = process.cwd(),
  permissionMode = (getSetting('sdkPermissionMode', 'default') as SdkPermissionMode) ?? 'default',
  resume,
  continue: continueSession,
  additionalDirectories,
  onAnswerComplete: onAnswerCompleteOpt,
}: UseSdkAgentExecutionOptions = {}): UseSdkAgentExecutionResult {
  const [currentTurn, setCurrentTurn] = useState<SdkCurrentTurn | null>(null);
  const [sdkTuiState, setSdkTuiState] = useState<SdkTUIState>(INITIAL_SDK_TUI_STATE);
  const [isProcessing, setIsProcessing] = useState(false);
  const [askUserQuestionRequest, setAskUserQuestionRequest] =
    useState<SdkAskUserQuestionRequest | null>(null);
  const [toolPermissionRequest, setToolPermissionRequest] =
    useState<SdkToolPermissionRequest | null>(null);

  const agentRef = useRef<ReturnType<typeof createSdkAgent> | null>(null);
  const isProcessingRef = useRef(false);
  const sdkTuiStateRef = useRef<SdkTUIState>(INITIAL_SDK_TUI_STATE);
  sdkTuiStateRef.current = sdkTuiState;
  const askUserQuestionResolveRef = useRef<((a: AskUserQuestionAnswers) => void) | null>(null);
  const askUserQuestionAnswersRef = useRef<AskUserQuestionAnswers['answers']>([]);
  const askUserQuestionRequestRef = useRef<SdkAskUserQuestionRequest | null>(null);
  const toolPermissionResolveRef = useRef<((allowed: boolean) => void) | null>(null);
  const toolPermissionRequestRef = useRef<SdkToolPermissionRequest | null>(null);
  const onAnswerCompleteRef = useRef(onAnswerCompleteOpt);
  onAnswerCompleteRef.current = onAnswerCompleteOpt;

  const handleAnswerComplete = useCallback((answer: string) => {
    onAnswerCompleteRef.current?.(answer);
    setCurrentTurn(null);
    setSdkTuiState(INITIAL_SDK_TUI_STATE);
  }, []);

  const cancelExecution = useCallback(() => {
    agentRef.current?.cancel();
    agentRef.current = null;
    setCurrentTurn(null);
    setSdkTuiState(INITIAL_SDK_TUI_STATE);
    askUserQuestionResolveRef.current = null;
    askUserQuestionRequestRef.current = null;
    setAskUserQuestionRequest(null);
    toolPermissionResolveRef.current?.(false);
    toolPermissionResolveRef.current = null;
    toolPermissionRequestRef.current = null;
    setToolPermissionRequest(null);
    isProcessingRef.current = false;
    setIsProcessing(false);
  }, []);

  const submitToolPermissionAnswer = useCallback((allowed: boolean) => {
    if (!toolPermissionResolveRef.current) return;
    toolPermissionResolveRef.current(allowed);
    toolPermissionResolveRef.current = null;
    toolPermissionRequestRef.current = null;
    setToolPermissionRequest(null);
  }, []);

  const onToolPermissionRequest = useCallback((request: SdkToolPermissionRequest): Promise<boolean> => {
    return new Promise<boolean>((resolve) => {
      toolPermissionResolveRef.current = resolve;
      toolPermissionRequestRef.current = request;
      setToolPermissionRequest(request);
    });
  }, []);

  const submitAskUserAnswer = useCallback((answer: string) => {
    const req = askUserQuestionRequestRef.current;
    if (!req || !askUserQuestionResolveRef.current) return;
    const currentQuestion = req.questions[req.currentIndex];
    if (!currentQuestion) return;
    const parsed = parseAskUserAnswer(answer, currentQuestion);
    askUserQuestionAnswersRef.current.push(parsed);
    const nextIndex = req.currentIndex + 1;
    if (nextIndex >= req.questions.length) {
      askUserQuestionResolveRef.current({ answers: [...askUserQuestionAnswersRef.current] });
      askUserQuestionResolveRef.current = null;
      askUserQuestionAnswersRef.current = [];
      askUserQuestionRequestRef.current = null;
      setAskUserQuestionRequest(null);
    } else {
      askUserQuestionRequestRef.current = { ...req, currentIndex: nextIndex };
      setAskUserQuestionRequest({ ...req, currentIndex: nextIndex });
    }
  }, []);

  const onAskUserQuestion = useCallback((request: AskUserQuestionRequest): Promise<AskUserQuestionAnswers> => {
    return new Promise<AskUserQuestionAnswers>((resolve) => {
      askUserQuestionResolveRef.current = resolve;
      askUserQuestionAnswersRef.current = [];
      askUserQuestionRequestRef.current = { ...request, currentIndex: 0 };
      setAskUserQuestionRequest({ ...request, currentIndex: 0 });
    });
  }, []);

  const processQuery = useCallback(
    async (query: string, options?: { resume?: string; continue?: boolean }): Promise<void> => {
      if (isProcessingRef.current) return;
      isProcessingRef.current = true;
      setIsProcessing(true);

      const turnId = generateId();
      const initialState = { ...INITIAL_SDK_TUI_STATE };
      setSdkTuiState(initialState);
      sdkTuiStateRef.current = initialState;

      setCurrentTurn({
        id: turnId,
        query,
        sdkTuiState: initialState,
      });

      const plugins = loadInstalledPlugins();
      const { buildSdkEnvForModel, isOpenRouterKeyMissing } = await import('../utils/sdk-env.js');
      if (isOpenRouterKeyMissing(model)) {
        const err = 'SDK + OpenAI: set OPENROUTER_API_KEY or OPENAI_API_KEY. Add your OpenAI key at openrouter.ai/settings';
        setSdkTuiState((s) => ({ ...s, statusLine: err, isStreaming: false }));
        setCurrentTurn((t) => (t ? { ...t, sdkTuiState: { ...INITIAL_SDK_TUI_STATE, statusLine: err, isStreaming: false } } : null));
        isProcessingRef.current = false;
        setIsProcessing(false);
        return;
      }
      const sdkEnv = buildSdkEnvForModel(model);
      const agent = createSdkAgent({
        model,
        systemPrompt,
        cwd,
        permissionMode,
        resume: options?.resume ?? resume,
        continue: options?.continue ?? continueSession,
        additionalDirectories,
        plugins: plugins.length ? plugins : undefined,
        env: sdkEnv,
        onAskUserQuestion,
        onToolPermissionRequest: permissionMode === 'default' ? onToolPermissionRequest : undefined,
        callbacks: {
          onProgressMessage: () => {},
          onSdkMessage: (msg) => {
            const prev = sdkTuiStateRef.current;
            const update = reduceSdkMessageToState(msg as Record<string, unknown>, prev);
            if (update) {
              const next = { ...prev, ...update };
              sdkTuiStateRef.current = next;
              setSdkTuiState(next);
              setCurrentTurn((t) => (t ? { ...t, sdkTuiState: next } : null));

              if (msg.type === 'result' && (msg as { result?: string }).result != null) {
                const result = (msg as { result: string }).result;
                queueMicrotask(() => onAnswerCompleteRef.current?.(result));
              }
            }
          },
        },
      });
      agentRef.current = agent;

      try {
        await agent.run(query);
      } catch (error) {
        const err = error instanceof Error ? error.message : String(error);
        const errorState = { ...INITIAL_SDK_TUI_STATE, statusLine: err, isStreaming: false };
        setSdkTuiState(errorState);
        setCurrentTurn((t) => (t ? { ...t, sdkTuiState: errorState } : null));
      } finally {
        agentRef.current = null;
        isProcessingRef.current = false;
        setIsProcessing(false);
      }
    },
    [
      model,
      systemPrompt,
      cwd,
      permissionMode,
      resume,
      continueSession,
      additionalDirectories,
      onAskUserQuestion,
      onToolPermissionRequest,
    ]
  );

  return {
    currentTurn,
    answerStream: null,
    isProcessing,
    processQuery,
    handleAnswerComplete,
    cancelExecution,
    clarificationRequest: null,
    submitClarificationAnswer: () => {},
    proceedCheckpoint: null,
    submitProceedAnswer: () => {},
    askUserQuestionRequest,
    submitAskUserAnswer,
    toolPermissionRequest,
    submitToolPermissionAnswer,
  };
}
