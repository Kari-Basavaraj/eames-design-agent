// Updated: 2026-02-16 14:00:00
// Eames Design Agent - SDK Agent Execution Hook
// Uses Claude Agent SDK (query) - SDK-first when available
// Full Claude Code TUI parity: tool calls, thinking, cost tracking, session persistence

import { useState, useCallback, useRef } from 'react';
import { createSdkAgent } from './agent.js';
import { generateId } from '../cli/types.js';
import { buildSdkEnvForModel, isOpenRouterKeyMissing } from './env.js';
import { trackUsage, getSessionUsage, formatTokens, formatCost, setSessionModel, saveSessionToHistory } from '../utils/cost-tracking.js';
import { buildMemoryContext } from './memory-loader.js';
import { discoverAllSkills, loadSkillContent } from './skills-loader.js';
import { discoverAllHooks } from './hooks-loader.js';
import { discoverAllAgents } from './agents-loader.js';
import type { AgentProgressState } from '../components/AgentProgressView.js';
import type {
  AskUserQuestionRequest,
  AskUserQuestionItem,
  AskUserQuestionAnswers,
  SdkToolPermissionRequest,
} from './agent.js';
import type { SdkPermissionMode } from './options.js';
import { getSetting } from '../utils/config.js';

// ============================================================================
// Types
// ============================================================================

export interface ToolCallInfo {
  toolName: string;
  description: string;
  status: 'running' | 'done';
  elapsed?: number;
  result?: string;
}

export interface CostInfo {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  estimatedCost: number;
  formattedTokens: string;
  formattedCost: string;
}

export interface SdkAskUserQuestionRequest extends AskUserQuestionRequest {
  currentIndex: number;
}

export interface SdkCurrentTurn {
  id: string;
  query: string;
  state: AgentProgressState;
  toolCalls: ToolCallInfo[];
  thinkingText: string;
  isThinking: boolean;
  cost: CostInfo;
  sessionId?: string;
}

interface UseSdkAgentExecutionOptions {
  model?: string;
  systemPrompt?: string;
  cwd?: string;
  permissionMode?: SdkPermissionMode;
  resume?: string;
  continue?: boolean;
  additionalDirectories?: string[];
}

interface UseSdkAgentExecutionResult {
  currentTurn: SdkCurrentTurn | null;
  answerStream: AsyncGenerator<string> | null;
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
  lastSessionId: string | null;
}

// ============================================================================
// Stream from callbacks
// ============================================================================

function createCallbackStream(): {
  generator: AsyncGenerator<string>;
  push: (chunk: string) => void;
  finish: () => void;
} {
  const queue: string[] = [];
  let resolve: (() => void) | null = null;
  let done = false;

  const push = (chunk: string) => {
    if (chunk) {
      queue.push(chunk);
      resolve?.();
      resolve = null;
    }
  };

  const finish = () => {
    done = true;
    resolve?.();
    resolve = null;
  };

  const generator = (async function* (): AsyncGenerator<string> {
    while (!done || queue.length > 0) {
      if (queue.length > 0) {
        yield queue.shift()!;
      } else {
        await new Promise<void>((r) => {
          resolve = r;
        });
      }
    }
  })();

  return { generator, push, finish };
}

// ============================================================================
// Hook
// ============================================================================

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
  if (matched) return { selectedLabels: [matched.label] };
  return { selectedLabels: [trimmed] };
}

// ============================================================================
// System Prompt Enrichment (Memory + Skills)
// ============================================================================

function buildEnrichedSystemPrompt(basePrompt?: string): string {
  const sections: string[] = [];

  // Base prompt (or default)
  if (basePrompt) {
    sections.push(basePrompt);
  }

  // Hierarchical CLAUDE.md memory
  const memoryContext = buildMemoryContext();
  if (memoryContext) {
    sections.push(`\n## Project Memory (CLAUDE.md)\n\n${memoryContext}`);
  }

  // Auto-loaded skills (model-invocable only)
  const skills = discoverAllSkills().filter(s => s.modelInvocable && !s.isAction);
  if (skills.length > 0) {
    const skillBlocks = skills.map(skill => {
      const content = loadSkillContent(skill.path);
      if (!content) return null;
      return `### Skill: ${skill.name}\n${skill.description ? `> ${skill.description}\n` : ''}${content}`;
    }).filter(Boolean);

    if (skillBlocks.length > 0) {
      sections.push(`\n## Active Skills\n\n${skillBlocks.join('\n\n---\n\n')}`);
    }
  }

  return sections.join('\n\n');
}

// ============================================================================
// Hooks Config Builder
// ============================================================================

function buildHooksConfig(): Record<string, unknown[]> | undefined {
  const hooks = discoverAllHooks();
  if (hooks.length === 0) return undefined;

  const config: Record<string, unknown[]> = {};
  for (const hook of hooks) {
    if (!config[hook.event]) config[hook.event] = [];
    const matcher: Record<string, unknown> = {
      hooks: [
        hook.type === 'command'
          ? { type: 'command', command: hook.value }
          : { type: 'prompt', prompt: hook.value },
      ],
    };
    if (hook.matcher !== '*') matcher.matcher = hook.matcher;
    config[hook.event].push(matcher);
  }

  return config;
}

// ============================================================================
// Agents Config Builder
// ============================================================================

function buildAgentsConfig(): Record<string, unknown> | undefined {
  const agents = discoverAllAgents();
  if (agents.length === 0) return undefined;

  const config: Record<string, unknown> = {};
  for (const agent of agents) {
    const def: Record<string, unknown> = {};
    if (agent.description) def.description = agent.description;
    if (agent.model !== 'inherit') def.model = agent.model;
    if (agent.tools.length > 0) def.allowedTools = agent.tools;
    config[agent.name] = def;
  }

  return config;
}

function buildCostInfo(): CostInfo {
  const usage = getSessionUsage();
  const totalTokens = usage.totalInputTokens + usage.totalOutputTokens;
  return {
    inputTokens: usage.totalInputTokens,
    outputTokens: usage.totalOutputTokens,
    totalTokens,
    estimatedCost: usage.estimatedCost,
    formattedTokens: formatTokens(totalTokens),
    formattedCost: formatCost(usage.estimatedCost),
  };
}

export function useSdkAgentExecution({
  model = 'claude-sonnet-4-5-20250929',
  systemPrompt,
  cwd = process.cwd(),
  permissionMode = (getSetting('sdkPermissionMode', 'default') as SdkPermissionMode) ?? 'default',
  resume,
  continue: continueSession,
  additionalDirectories,
}: UseSdkAgentExecutionOptions = {}): UseSdkAgentExecutionResult {
  const [currentTurn, setCurrentTurn] = useState<SdkCurrentTurn | null>(null);
  const [answerStream, setAnswerStream] = useState<AsyncGenerator<string> | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastSessionId, setLastSessionId] = useState<string | null>(null);
  const [askUserQuestionRequest, setAskUserQuestionRequest] =
    useState<SdkAskUserQuestionRequest | null>(null);
  const [toolPermissionRequest, setToolPermissionRequest] =
    useState<SdkToolPermissionRequest | null>(null);

  const agentRef = useRef<ReturnType<typeof createSdkAgent> | null>(null);
  const isProcessingRef = useRef(false);
  const askUserQuestionResolveRef = useRef<((a: AskUserQuestionAnswers) => void) | null>(null);
  const askUserQuestionAnswersRef = useRef<AskUserQuestionAnswers['answers']>([]);
  const askUserQuestionRequestRef = useRef<SdkAskUserQuestionRequest | null>(null);
  const toolPermissionResolveRef = useRef<((allowed: boolean) => void) | null>(null);
  const toolPermissionRequestRef = useRef<SdkToolPermissionRequest | null>(null);

  const handleAnswerComplete = useCallback((_answer: string) => {
    setCurrentTurn(null);
    setAnswerStream(null);
    saveSessionToHistory();
  }, []);

  const cancelExecution = useCallback(() => {
    agentRef.current?.cancel();
    agentRef.current = null;
    setCurrentTurn(null);
    setAnswerStream(null);
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
      const result: AskUserQuestionAnswers = {
        answers: [...askUserQuestionAnswersRef.current],
      };
      askUserQuestionResolveRef.current(result);
      askUserQuestionResolveRef.current = null;
      askUserQuestionAnswersRef.current = [];
      askUserQuestionRequestRef.current = null;
      setAskUserQuestionRequest(null);
    } else {
      const next = { ...req, currentIndex: nextIndex };
      askUserQuestionRequestRef.current = next;
      setAskUserQuestionRequest(next);
    }
  }, []);

  const onAskUserQuestion = useCallback((request: AskUserQuestionRequest): Promise<AskUserQuestionAnswers> => {
    return new Promise<AskUserQuestionAnswers>((resolve) => {
      askUserQuestionResolveRef.current = resolve;
      askUserQuestionAnswersRef.current = [];
      const req: SdkAskUserQuestionRequest = { ...request, currentIndex: 0 };
      askUserQuestionRequestRef.current = req;
      setAskUserQuestionRequest(req);
    });
  }, []);

  const processQuery = useCallback(
    async (queryText: string, options?: { resume?: string; continue?: boolean }): Promise<void> => {
      if (isProcessingRef.current) return;
      isProcessingRef.current = true;
      setIsProcessing(true);

      // Set model for cost tracking
      setSessionModel(model);

      const turnId = generateId();
      const { generator, push, finish } = createCallbackStream();

      setCurrentTurn({
        id: turnId,
        query: queryText,
        state: {
          currentPhase: 'execute',
          understandComplete: true,
          planComplete: true,
          executeComplete: false,
          reflectComplete: false,
          tasks: [],
          isAnswering: true,
          progressMessage: undefined,
        },
        toolCalls: [],
        thinkingText: '',
        isThinking: false,
        cost: buildCostInfo(),
      });
      setAnswerStream(generator);

      if (isOpenRouterKeyMissing(model)) {
        push('\nError: SDK + OpenAI/Google requires OPENROUTER_API_KEY. Get it at openrouter.ai/settings/keys and add to .env');
        finish();
        isProcessingRef.current = false;
        setIsProcessing(false);
        setCurrentTurn(null);
        setAnswerStream(null);
        return;
      }
      const sdkEnv = buildSdkEnvForModel(model);

      // Build enriched system prompt (memory + skills injected)
      const enrichedPrompt = buildEnrichedSystemPrompt(systemPrompt);

      // Build hooks and agents configs from discovery
      const hooksConfig = buildHooksConfig();
      const agentsConfig = buildAgentsConfig();

      const agent = createSdkAgent({
        model,
        systemPrompt: enrichedPrompt || undefined,
        cwd,
        permissionMode,
        resume: options?.resume ?? resume,
        continue: options?.continue ?? continueSession,
        additionalDirectories,
        env: sdkEnv,
        hooks: hooksConfig as any,
        agents: agentsConfig as any,
        onAskUserQuestion,
        onToolPermissionRequest: permissionMode === 'default' ? onToolPermissionRequest : undefined,
        callbacks: {
          onText: (text) => push(text),

          onThinking: (text) => {
            setCurrentTurn((prev) => {
              if (!prev) return prev;
              return {
                ...prev,
                thinkingText: prev.thinkingText + text,
                isThinking: true,
              };
            });
          },

          onToolStart: (toolName, description) => {
            setCurrentTurn((prev) => {
              if (!prev) return prev;
              return {
                ...prev,
                isThinking: false,
                toolCalls: [...prev.toolCalls, { toolName, description, status: 'running' }],
              };
            });
          },

          onToolProgress: (toolName, elapsed) => {
            setCurrentTurn((prev) => {
              if (!prev) return prev;
              const tools = [...prev.toolCalls];
              const last = tools.findLast(t => t.toolName === toolName && t.status === 'running');
              if (last) last.elapsed = elapsed;
              return { ...prev, toolCalls: tools };
            });
          },

          onToolEnd: (toolName, result) => {
            setCurrentTurn((prev) => {
              if (!prev) return prev;
              const tools = [...prev.toolCalls];
              const last = tools.findLast(t => t.toolName === toolName && t.status === 'running');
              if (last) {
                last.status = 'done';
                last.result = result;
              }
              return { ...prev, toolCalls: tools };
            });
          },

          onUsage: (usage) => {
            trackUsage({
              inputTokens: usage.inputTokens,
              outputTokens: usage.outputTokens,
              cacheReadTokens: usage.cacheReadTokens,
              cacheCreationTokens: usage.cacheCreationTokens,
            });
            setCurrentTurn((prev) => {
              if (!prev) return prev;
              return { ...prev, cost: buildCostInfo() };
            });
          },

          onResult: (_result, sessionId) => {
            if (sessionId) {
              setLastSessionId(sessionId);
              setCurrentTurn((prev) => prev ? { ...prev, sessionId } : prev);
            }
          },

          onSystemMessage: (text) => {
            push(`\n[system] ${text}\n`);
          },

          onProgressMessage: () => {
            // Handled by onText
          },
        },
      });
      agentRef.current = agent;

      try {
        await agent.run(queryText);
      } catch (error) {
        push(`\nError: ${error instanceof Error ? error.message : String(error)}`);
      } finally {
        finish();
        agentRef.current = null;
        isProcessingRef.current = false;
        setIsProcessing(false);

        setCurrentTurn((prev) =>
          prev
            ? {
                ...prev,
                isThinking: false,
                state: {
                  ...prev.state,
                  executeComplete: true,
                  reflectComplete: true,
                  progressMessage: undefined,
                },
              }
            : null
        );
      }
    },
    [model, systemPrompt, cwd, permissionMode, resume, continueSession, additionalDirectories, onAskUserQuestion, onToolPermissionRequest]
  );

  return {
    currentTurn,
    answerStream,
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
    lastSessionId,
  };
}
