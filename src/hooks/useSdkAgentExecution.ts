// Updated: 2026-01-12 15:15:00
// Eames Design Agent - SDK Agent Execution Hook
// Connects SDK agent to React state for the Ink UI

import { useState, useCallback, useRef } from 'react';
import { SdkAgent } from '../agent/sdk-agent.js';
import type { AgentCallbacks } from '../agent/orchestrator.js';
import { generateId } from '../cli/types.js';
import type { Phase, Task, TaskStatus, ToolCallStatus } from '../agent/state.js';
import type { AgentProgressState } from '../components/AgentProgressView.js';

// ============================================================================
// Types
// ============================================================================

export interface SdkCurrentTurn {
  id: string;
  query: string;
  state: AgentProgressState;
}

interface UseSdkAgentExecutionOptions {
  model: string;
}

interface UseSdkAgentExecutionResult {
  currentTurn: SdkCurrentTurn | null;
  answerStream: AsyncGenerator<string> | null;
  isProcessing: boolean;
  processQuery: (query: string) => Promise<void>;
  handleAnswerComplete: (answer: string) => void;
  cancelExecution: () => void;
}

// ============================================================================
// Hook Implementation
// ============================================================================

/**
 * Hook that connects the SDK agent to React state.
 * Provides same interface as useAgentExecution for drop-in replacement.
 */
export function useSdkAgentExecution({
  model,
}: UseSdkAgentExecutionOptions): UseSdkAgentExecutionResult {
  const [currentTurn, setCurrentTurn] = useState<SdkCurrentTurn | null>(null);
  const [answerStream, setAnswerStream] = useState<AsyncGenerator<string> | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const isProcessingRef = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const agentRef = useRef<SdkAgent | null>(null);

  const computeTaskStatus = useCallback((toolCalls: ToolCallStatus[]): TaskStatus => {
    if (toolCalls.some(toolCall => toolCall.status === 'failed')) {
      return 'failed';
    }
    if (toolCalls.length === 0) {
      return 'pending';
    }
    if (toolCalls.every(toolCall => toolCall.status === 'completed')) {
      return 'completed';
    }
    return 'in_progress';
  }, []);

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
   * Creates agent callbacks that update React state.
   */
  const createAgentCallbacks = useCallback((): AgentCallbacks => ({
    onPhaseStart: setPhase,
    onPhaseComplete: markPhaseComplete,
    onAnswerStart: () => setAnswering(true),
    onAnswerStream: (stream) => setAnswerStream(stream),
    onProgressMessage: setProgressMessage,
    onTaskToolCallsSet: (taskId, toolCalls) => {
      setCurrentTurn(prev => {
        if (!prev) return prev;

        const existingTaskIndex = prev.state.tasks.findIndex(task => task.id === taskId);
        const status = computeTaskStatus(toolCalls);

        if (existingTaskIndex >= 0) {
          const tasks = [...prev.state.tasks];
          const existingTask = tasks[existingTaskIndex];
          tasks[existingTaskIndex] = {
            ...existingTask,
            status,
            toolCalls,
          };
          return {
            ...prev,
            state: {
              ...prev.state,
              tasks,
            },
          };
        }

        const newTask: Task = {
          id: taskId,
          description: 'Running Claude SDK tools',
          status,
          toolCalls,
        };

        return {
          ...prev,
          state: {
            ...prev.state,
            tasks: [...prev.state.tasks, newTask],
          },
        };
      });
    },
  }), [setPhase, markPhaseComplete, setAnswering, setProgressMessage, computeTaskStatus]);

  /**
   * Handles the completed answer.
   */
  const handleAnswerComplete = useCallback((answer: string) => {
    setCurrentTurn(null);
    setAnswerStream(null);
  }, []);

  /**
   * Processes a single query through the SDK agent.
   */
  const processQuery = useCallback(
    async (query: string): Promise<void> => {
      if (isProcessingRef.current) return;
      isProcessingRef.current = true;
      setIsProcessing(true);

      // Create abort controller for this execution
      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      // Initialize turn state - SDK mode skips understand/plan phases
      setCurrentTurn({
        id: generateId(),
        query,
        state: {
          currentPhase: 'execute',
          understandComplete: true,  // SDK handles internally
          planComplete: true,         // SDK handles internally
          executeComplete: false,
          reflectComplete: false,
          tasks: [],
          isAnswering: false,
          progressMessage: 'Initializing SDK agent...',
        },
      });

      const callbacks = createAgentCallbacks();

      try {
        const agent = new SdkAgent({
          model,
          callbacks,
          signal: abortController.signal,
        });
        agentRef.current = agent;

        await agent.run(query);
      } catch (e) {
        // Don't rethrow abort errors - they're expected during cancellation
        if ((e as Error).message === 'Operation was cancelled') {
          return;
        }
        setCurrentTurn(null);
        throw e;
      } finally {
        abortControllerRef.current = null;
        agentRef.current = null;
        isProcessingRef.current = false;
        setIsProcessing(false);
      }
    },
    [model, createAgentCallbacks]
  );

  /**
   * Cancels the current execution.
   */
  const cancelExecution = useCallback(() => {
    // Cancel the SDK agent
    if (agentRef.current) {
      agentRef.current.cancel();
      agentRef.current = null;
    }

    // Abort the controller
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    setCurrentTurn(null);
    setAnswerStream(null);
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
  };
}
