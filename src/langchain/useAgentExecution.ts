// Updated: 2026-02-16 12:00:00
import { useState, useCallback, useRef } from 'react';
import { Agent, AgentCallbacks } from './orchestrator.js';
import { MessageHistory } from './message-history.js';
import { generateId } from '../cli/types.js';
import type { Task, Phase, TaskStatus, ToolCallStatus, Plan } from '../types/state.js';
import type { AgentProgressState } from '../components/AgentProgressView.js';

// ============================================================================
// Types
// ============================================================================

/**
 * Current turn state for the agent.
 */
export interface CurrentTurn {
  id: string;
  query: string;
  state: AgentProgressState;
}

interface UseAgentExecutionOptions {
  model: string;
  messageHistory: MessageHistory;
}

/** Shown when agent needs clarification before proceeding (vague prompts) */
export interface ClarificationRequest {
  questions: string[];
  currentIndex: number;
}

/** Shown when agent completes a milestone and asks to proceed (e.g. after PRD) */
export interface ProceedCheckpointRequest {
  completed: string;
  question: string;
}

interface UseAgentExecutionResult {
  currentTurn: CurrentTurn | null;
  answerStream: AsyncGenerator<string> | null;
  isProcessing: boolean;
  processQuery: (query: string) => Promise<void>;
  handleAnswerComplete: (answer: string) => void;
  cancelExecution: () => void;
  /** When set, user input should be routed here - answers to clarifying questions */
  clarificationRequest: ClarificationRequest | null;
  submitClarificationAnswer: (answer: string) => void;
  /** When set, agent is waiting for proceed/stop before next iteration */
  proceedCheckpoint: ProceedCheckpointRequest | null;
  submitProceedAnswer: (decision: 'proceed' | 'stop') => void;
  /** SDK-only: AskUserQuestion (null in LangChain mode) */
  askUserQuestionRequest?: null;
  submitAskUserAnswer?: () => void;
  /** SDK-only: Tool permission (Bash, Edit, Write) */
  toolPermissionRequest?: null;
  submitToolPermissionAnswer?: (allowed: boolean) => void;
  setSessionId?: (sessionId: string) => void;
}

/**
 * Pending task update to be applied when tasks are available.
 */
interface PendingTaskUpdate {
  taskId: string;
  status: TaskStatus;
}

/**
 * Pending tool call update to be applied when tasks are available.
 */
interface PendingToolCallUpdate {
  taskId: string;
  toolIndex: number;
  status: ToolCallStatus['status'];
}

// ============================================================================
// Hook Implementation
// ============================================================================

/**
 * Hook that connects the agent to React state.
 * Manages phase transitions, task updates, and answer streaming.
 */
export function useAgentExecution({
  model,
  messageHistory,
}: UseAgentExecutionOptions): UseAgentExecutionResult {
  const [currentTurn, setCurrentTurn] = useState<CurrentTurn | null>(null);
  const [answerStream, setAnswerStream] = useState<AsyncGenerator<string> | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [clarificationRequest, setClarificationRequest] = useState<ClarificationRequest | null>(null);
  const [proceedCheckpoint, setProceedCheckpoint] = useState<ProceedCheckpointRequest | null>(null);

  const currentQueryRef = useRef<string | null>(null);
  const isProcessingRef = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const clarificationResolveRef = useRef<((answers: Record<string, string>) => void) | null>(null);
  const clarificationAnswersRef = useRef<Record<string, string>>({});
  const clarificationRequestRef = useRef<ClarificationRequest | null>(null);
  const proceedResolveRef = useRef<((decision: 'proceed' | 'stop') => void) | null>(null);
  
  // Track pending updates for race condition handling
  const pendingTaskUpdatesRef = useRef<PendingTaskUpdate[]>([]);
  const pendingToolCallUpdatesRef = useRef<PendingToolCallUpdate[]>([]);

  /**
   * Updates the current phase.
   */
  const setPhase = useCallback((phase: Phase) => {
    setCurrentTurn(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        state: {
          ...prev.state,
          currentPhase: phase,
        },
      };
    });
  }, []);

  /**
   * Marks a phase as complete.
   */
  const markPhaseComplete = useCallback((phase: Phase) => {
    setCurrentTurn(prev => {
      if (!prev) return prev;
      
      const updates: Partial<AgentProgressState> = {};
      
      switch (phase) {
        case 'understand':
          updates.understandComplete = true;
          break;
        case 'plan':
          updates.planComplete = true;
          break;
        case 'execute':
          updates.executeComplete = true;
          break;
        case 'reflect':
          updates.reflectComplete = true;
          break;
      }
      
      return {
        ...prev,
        state: {
          ...prev.state,
          ...updates,
        },
      };
    });
  }, []);

  /**
   * Sets the task list after plan creation.
   * Applies any pending task/tool updates that arrived before tasks were set.
   */
  const setTasksFromPlan = useCallback((plan: Plan) => {
    setCurrentTurn(prev => {
      if (!prev) return prev;
      
      // Start with plan tasks
      let tasks = [...plan.tasks];
      
      // Apply any pending task status updates
      const pendingTaskUpdates = pendingTaskUpdatesRef.current;
      for (const update of pendingTaskUpdates) {
        tasks = tasks.map(task =>
          task.id === update.taskId ? { ...task, status: update.status } : task
        );
      }
      pendingTaskUpdatesRef.current = [];
      
      // Apply any pending tool call status updates
      const pendingToolUpdates = pendingToolCallUpdatesRef.current;
      for (const update of pendingToolUpdates) {
        tasks = tasks.map(task => {
          if (task.id !== update.taskId || !task.toolCalls) return task;
          const toolCalls = task.toolCalls.map((tc, i) =>
            i === update.toolIndex ? { ...tc, status: update.status } : tc
          );
          return { ...task, toolCalls };
        });
      }
      pendingToolCallUpdatesRef.current = [];
      
      return {
        ...prev,
        state: {
          ...prev.state,
          tasks,
        },
      };
    });
  }, []);

  /**
   * Updates a task's status.
   * If tasks aren't set yet, queues the update for later.
   */
  const updateTaskStatus = useCallback((taskId: string, status: TaskStatus) => {
    setCurrentTurn(prev => {
      if (!prev) return prev;

      // If tasks aren't set yet, queue the update
      if (prev.state.tasks.length === 0) {
        pendingTaskUpdatesRef.current.push({ taskId, status });
        return prev;
      }

      const now = Date.now();
      const tasks = prev.state.tasks.map(task => {
        if (task.id !== taskId) return task;

        // Add timestamps based on status
        const updates: Partial<Task> = { status };
        if (status === 'in_progress' && !task.startTime) {
          updates.startTime = now;
        } else if (status === 'completed' || status === 'failed') {
          updates.endTime = now;
        }

        return { ...task, ...updates };
      });

      return {
        ...prev,
        state: {
          ...prev.state,
          tasks,
        },
      };
    });
  }, []);

  /**
   * Sets the tool calls for a task when they are first selected.
   */
  const setTaskToolCalls = useCallback((taskId: string, toolCalls: ToolCallStatus[]) => {
    setCurrentTurn(prev => {
      if (!prev) return prev;
      
      const tasks = prev.state.tasks.map(task =>
        task.id === taskId ? { ...task, toolCalls } : task
      );
      
      return {
        ...prev,
        state: {
          ...prev.state,
          tasks,
        },
      };
    });
  }, []);

  /**
   * Updates a tool call's status within a task.
   * If tasks aren't set yet, queues the update for later.
   */
  const updateToolCallStatus = useCallback((
    taskId: string,
    toolIndex: number,
    status: ToolCallStatus['status'],
    output?: string,
    error?: string
  ) => {
    setCurrentTurn(prev => {
      if (!prev) return prev;

      // If tasks aren't set yet, queue the update
      if (prev.state.tasks.length === 0) {
        pendingToolCallUpdatesRef.current.push({ taskId, toolIndex, status });
        return prev;
      }

      const tasks = prev.state.tasks.map(task => {
        if (task.id !== taskId || !task.toolCalls) return task;

        const toolCalls = task.toolCalls.map((tc, i) =>
          i === toolIndex ? { ...tc, status, output, error } : tc
        );

        return { ...task, toolCalls };
      });

      return {
        ...prev,
        state: {
          ...prev.state,
          tasks,
        },
      };
    });
  }, []);

  /**
   * Sets the answering state.
   */
  const setAnswering = useCallback((isAnswering: boolean) => {
    setCurrentTurn(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        state: {
          ...prev.state,
          isAnswering,
        },
      };
    });
  }, []);

  /**
   * Sets a progress message.
   */
  const setProgressMessage = useCallback((message: string) => {
    setCurrentTurn(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        state: {
          ...prev.state,
          progressMessage: message,
        },
      };
    });
  }, []);

  /**
   * Submits an answer to the current clarification question.
   * When all questions are answered, resolves the promise and agent continues.
   */
  const submitClarificationAnswer = useCallback((answer: string) => {
    const req = clarificationRequestRef.current;
    if (!req || !clarificationResolveRef.current) return;

    clarificationAnswersRef.current[String(req.currentIndex)] = answer.trim() || '(skipped)';
    const nextIndex = req.currentIndex + 1;

    if (nextIndex >= req.questions.length) {
      const answers = { ...clarificationAnswersRef.current };
      clarificationResolveRef.current(answers);
      clarificationResolveRef.current = null;
      clarificationAnswersRef.current = {};
      clarificationRequestRef.current = null;
      setClarificationRequest(null);
    } else {
      const next = { questions: req.questions, currentIndex: nextIndex };
      clarificationRequestRef.current = next;
      setClarificationRequest(next);
    }
  }, []);

  /**
   * Creates agent callbacks that update React state.
   */
  const createAgentCallbacks = useCallback((): AgentCallbacks => ({
    onPhaseStart: setPhase,
    onPhaseComplete: markPhaseComplete,
    onPlanCreated: setTasksFromPlan,
    onTaskUpdate: updateTaskStatus,
    onTaskToolCallsSet: setTaskToolCalls,
    onToolCallUpdate: updateToolCallStatus,
    onAnswerStart: () => setAnswering(true),
    onAnswerStream: (stream) => setAnswerStream(stream),
    onProgressMessage: setProgressMessage,
    onClarificationNeeded: (questions: string[]) => {
      return new Promise<Record<string, string>>((resolve) => {
        clarificationResolveRef.current = resolve;
        clarificationAnswersRef.current = {};
        const req: ClarificationRequest = { questions, currentIndex: 0 };
        clarificationRequestRef.current = req;
        setClarificationRequest(req);
      });
    },
    onProceedCheckpoint: (info: { completed: string; question: string }) => {
      return new Promise<'proceed' | 'stop'>((resolve) => {
        proceedResolveRef.current = resolve;
        setProceedCheckpoint(info);
      });
    },
  }), [setPhase, markPhaseComplete, setTasksFromPlan, updateTaskStatus, setTaskToolCalls, updateToolCallStatus, setAnswering, setProgressMessage]);

  const submitProceedAnswer = useCallback((decision: 'proceed' | 'stop') => {
    if (!proceedResolveRef.current) return;
    proceedResolveRef.current(decision);
    proceedResolveRef.current = null;
    setProceedCheckpoint(null);
  }, []);

  /**
   * Handles the completed answer.
   */
  const handleAnswerComplete = useCallback((answer: string) => {
    setCurrentTurn(null);
    setAnswerStream(null);

    // Add to message history for multi-turn context
    const query = currentQueryRef.current;
    if (query && answer) {
      messageHistory.addMessage(query, answer).catch(() => {
        // Silently ignore errors in adding to history
      });
    }
    currentQueryRef.current = null;
  }, [messageHistory]);

  /**
   * Processes a single query through the agent.
   */
  const processQuery = useCallback(
    async (query: string, _options?: { resume?: string; continue?: boolean }): Promise<void> => {
      if (isProcessingRef.current) return;
      isProcessingRef.current = true;
      setIsProcessing(true);

      // Create abort controller for this execution
      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      // Store current query for message history
      currentQueryRef.current = query;
      
      // Clear any pending updates from previous run
      pendingTaskUpdatesRef.current = [];
      pendingToolCallUpdatesRef.current = [];

      // Initialize turn state
      setCurrentTurn({
        id: generateId(),
        query,
        state: {
          currentPhase: 'understand',
          understandComplete: false,
          planComplete: false,
          executeComplete: false,
          reflectComplete: false,
          tasks: [],
          isAnswering: false,
          progressMessage: undefined,
        },
      });

      const callbacks = createAgentCallbacks();

      try {
        const agent = new Agent({ model, callbacks, signal: abortController.signal });
        await agent.run(query, messageHistory);
      } catch (e) {
        // Don't rethrow abort errors - they're expected during cancellation
        if ((e as Error).name === 'AbortError') {
          return;
        }
        setCurrentTurn(null);
        currentQueryRef.current = null;
        throw e;
      } finally {
        abortControllerRef.current = null;
        isProcessingRef.current = false;
        setIsProcessing(false);
      }
    },
    [model, messageHistory, createAgentCallbacks]
  );

  /**
   * Cancels the current execution.
   */
  const cancelExecution = useCallback(() => {
    // Abort the current agent execution
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    
    setCurrentTurn(null);
    setAnswerStream(null);
    currentQueryRef.current = null;
    isProcessingRef.current = false;
    setIsProcessing(false);
  }, []);

  return {
    currentTurn,
    answerStream,
    isProcessing,
    processQuery,
    handleAnswerComplete,
    cancelExecution,
    clarificationRequest,
    submitClarificationAnswer,
    proceedCheckpoint,
    submitProceedAnswer,
    askUserQuestionRequest: null,
    submitAskUserAnswer: () => {},
    toolPermissionRequest: null,
    submitToolPermissionAnswer: () => {},
  };
}
