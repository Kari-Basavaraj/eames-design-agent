// Updated: 2026-01-12 20:00:00
// Eames Design Agent - SDK Agent Execution Hook
// Connects SDK agent to React state for the Ink UI

import { useState, useCallback, useRef } from 'react';
import { SdkAgent } from '../agent/sdk-agent.js';
import type { AgentCallbacks } from '../agent/orchestrator.js';
import { generateId } from '../cli/types.js';
import type { Phase, ToolCallStatus } from '../agent/state.js';
import type { AgentProgressState } from '../components/AgentProgressView.js';
import type { ToolActivity } from '../components/ToolActivityView.js';
import type { PermissionMode, PermissionRequest } from '../types/permissions.js';
import { diffLines } from 'diff';
import { existsSync, readFileSync } from 'fs';
import { EnhancedSdkProcessor, type ToolCallEvent } from '../agent/enhanced-sdk-processor.js';
// MCP DISABLED - causing slow responses
// import { loadAllMcpServers } from '../utils/mcp-loader.js';

// ============================================================================
// Types
// ============================================================================

export interface SdkCurrentTurn {
  id: string;
  query: string;
  state: AgentProgressState;
  toolActivities: ToolActivity[];
  toolCalls: ToolCallStatus[];
  liveToolCalls: ToolCallEvent[];
}

interface UseSdkAgentExecutionOptions {
  model: string;
  permissionMode?: PermissionMode;
  onPermissionRequest?: (request: PermissionRequest) => Promise<boolean>;
}

interface UseSdkAgentExecutionResult {
  currentTurn: SdkCurrentTurn | null;
  answerStream: AsyncGenerator<string> | null;
  isProcessing: boolean;
  processQuery: (query: string) => Promise<void>;
  handleAnswerComplete: (answer: string) => void;
  cancelExecution: () => void;
  setSessionId: (sessionId: string) => void;
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Generate diff preview for file edits
 */
async function generateDiffPreview(toolName: string, toolInput: any): Promise<string | undefined> {
  if (toolName === 'Edit' || toolName === 'Write') {
    try {
      const filePath = toolInput.file_path || toolInput.path;
      const newContent = toolInput.new_string || toolInput.content;
      
      if (!filePath) return undefined;
      
      const currentContent = existsSync(filePath) 
        ? readFileSync(filePath, 'utf-8')
        : '';
      
      if (toolName === 'Edit' && !currentContent) {
        return '(New file)';
      }
      
      const diff = diffLines(currentContent, newContent);
      const diffText = diff.map(part => {
        const prefix = part.added ? '+' : part.removed ? '-' : ' ';
        return part.value.split('\n')
          .filter(line => line.length > 0)
          .slice(0, 20)  // Limit to 20 lines
          .map(line => `${prefix} ${line}`)
          .join('\n');
      }).join('\n');
      
      return diffText || '(No changes)';
    } catch (e) {
      return `(Error generating preview: ${e})`;
    }
  }
  
  if (toolName === 'Bash') {
    return toolInput.command || toolInput.cmd;
  }
  
  return undefined;
}

/**
 * Parses tool info from progress message.
 * Format: "Using ToolName: detail..." or "Using ToolName..."
 */
function parseToolFromMessage(message: string): { tool: string; detail: string } | null {
  // Match "Using ToolName: detail..." or "Using ToolName..."
  const match = message.match(/^Using (\w+):?\s*(.*?)\.\.\.$/);
  if (match) {
    return {
      tool: match[1],
      detail: match[2]?.trim() || '',
    };
  }
  return null;
}

/**
 * Parses completion info from progress message.
 * Format: "ToolName: detail completed" or "ToolName completed"
 */
function parseCompletionFromMessage(message: string): { tool: string; detail: string } | null {
  // Match "ToolName: detail completed" or "ToolName completed"
  const match = message.match(/^(\w+):?\s*(.*?)\s*completed$/);
  if (match) {
    return {
      tool: match[1],
      detail: match[2]?.trim() || '',
    };
  }
  return null;
}

/**
 * Parses failure info from progress message.
 */
function parseFailureFromMessage(message: string): { tool: string } | null {
  const match = message.match(/^(\w+) failed/);
  if (match) {
    return { tool: match[1] };
  }
  return null;
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
  permissionMode = 'default',
  onPermissionRequest,
}: UseSdkAgentExecutionOptions): UseSdkAgentExecutionResult {
  const [currentTurn, setCurrentTurn] = useState<SdkCurrentTurn | null>(null);
  const [answerStream, setAnswerStream] = useState<AsyncGenerator<string> | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [liveToolCalls, setLiveToolCalls] = useState<ToolCallEvent[]>([]);

  const isProcessingRef = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const agentRef = useRef<SdkAgent | null>(null);
  const sessionIdRef = useRef<string | null>(null);
  const processorRef = useRef<EnhancedSdkProcessor | null>(null);

  /**
   * Updates the current phase and progress message.
   */
  const setPhase = useCallback((phase: Phase) => {
    const phaseMessages: Record<Phase, string> = {
      understand: 'Understanding your request...',
      plan: 'Planning approach...',
      execute: 'Executing tasks...',
      reflect: 'Reflecting on results...',
      answer: 'Generating answer...',
      complete: 'Complete',
    };

    setCurrentTurn(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        state: {
          ...prev.state,
          currentPhase: phase,
          progressMessage: phaseMessages[phase],
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
   * Sets a progress message and tracks tool activities.
   * Keeps the phase indicator visible.
   */
  const setProgressMessage = useCallback((message: string) => {
    setCurrentTurn(prev => {
      if (!prev) return prev;

      // Parse tool activity from message
      let updatedActivities = [...prev.toolActivities];

      // Try to parse as tool start: "Using ToolName: detail..."
      const toolStart = parseToolFromMessage(message);
      if (toolStart) {
        const newActivity: ToolActivity = {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          tool: toolStart.tool,
          description: toolStart.detail || toolStart.tool.toLowerCase(),
          status: 'running',
          timestamp: Date.now(),
        };
        updatedActivities.push(newActivity);
      }

      // Try to parse as tool completion: "ToolName: detail completed"
      const toolComplete = parseCompletionFromMessage(message);
      if (toolComplete) {
        // Find the most recent running instance of this tool
        for (let i = updatedActivities.length - 1; i >= 0; i--) {
          if (updatedActivities[i].tool === toolComplete.tool && updatedActivities[i].status === 'running') {
            updatedActivities[i] = { ...updatedActivities[i], status: 'completed' };
            break;
          }
        }
      }

      // Try to parse as tool failure
      const toolFailed = parseFailureFromMessage(message);
      if (toolFailed) {
        for (let i = updatedActivities.length - 1; i >= 0; i--) {
          if (updatedActivities[i].tool === toolFailed.tool && updatedActivities[i].status === 'running') {
            updatedActivities[i] = { ...updatedActivities[i], status: 'failed' };
            break;
          }
        }
      }

      // Keep phase context in the message during execute phase
      const phasePrefix = prev.state.currentPhase === 'execute' ? '⚙️  Executing: ' : '';
      const displayMessage = prev.state.currentPhase === 'execute' 
        ? `${phasePrefix}${message}`
        : message;

      return {
        ...prev,
        toolActivities: updatedActivities,
        state: {
          ...prev.state,
          progressMessage: displayMessage,
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
   * Updates tool calls from SDK message processor.
   */
  const setToolCalls = useCallback((taskId: string, toolCalls: ToolCallStatus[]) => {
    setCurrentTurn(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        toolCalls,
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
    onTaskToolCallsSet: setToolCalls,
    onSdkMessage: (message: any) => {
      // Process SDK messages through our enhanced processor for real-time tool tracking
      if (message?.type === 'assistant') {
        console.log('[Hook] Received assistant message, processing...');
      }
      processorRef.current?.processMessage(message);
    },
  }), [setPhase, markPhaseComplete, setAnswering, setProgressMessage, setToolCalls]);

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

      // Initialize turn state starting at Understand phase
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
          progressMessage: 'Understanding your request...',
        },
        toolActivities: [],
        toolCalls: [],
        liveToolCalls: [],
      });
      
      // Initialize enhanced processor for real-time tool tracking
      processorRef.current = new EnhancedSdkProcessor({
        onToolStart: (event) => {
          console.log('[Hook] Tool started:', event.tool, event.id);
          setLiveToolCalls(calls => [...calls, event]);
          setCurrentTurn(prev => prev ? { ...prev, liveToolCalls: [...prev.liveToolCalls, event] } : prev);
        },
        onToolProgress: (event) => {
          console.log('[Hook] Tool progress:', event.tool, event.status);
          setLiveToolCalls(calls => calls.map(c => c.id === event.id ? event : c));
          setCurrentTurn(prev => prev ? { ...prev, liveToolCalls: prev.liveToolCalls.map(c => c.id === event.id ? event : c) } : prev);
        },
        onToolComplete: (event) => {
          console.log('[Hook] Tool completed:', event.tool);
          setLiveToolCalls(calls => calls.map(c => c.id === event.id ? event : c));
          setCurrentTurn(prev => prev ? { ...prev, liveToolCalls: prev.liveToolCalls.map(c => c.id === event.id ? event : c) } : prev);
          
          // Remove completed tools after 2 seconds
          setTimeout(() => {
            setLiveToolCalls(calls => calls.filter(c => c.id !== event.id));
            setCurrentTurn(prev => prev ? { ...prev, liveToolCalls: prev.liveToolCalls.filter(c => c.id !== event.id) } : prev);
          }, 2000);
        },
        onProgressMessage: (message) => {
          setProgressMessage(message);
        },
      });

      const callbacks = createAgentCallbacks();
      
      // MCP DISABLED - causing slow responses and errors
      // const mcpServers = loadAllMcpServers();
      // const mcpServerCount = Object.keys(mcpServers).length;

      try {
        const agent = new SdkAgent({
          model,
          callbacks,
          signal: abortController.signal,
          
          // Multi-turn: resume previous session if available
          resume: sessionIdRef.current ?? undefined,
          
          // Load CLAUDE.md and project settings
          settingSources: ['project'],  // Load CLAUDE.md from current project
          
          // Enable file checkpointing for undo/redo
          enableFileCheckpointing: true,
          
          // Permission mode from parameter
          permissionMode,
          
          // SDK Hooks for permission checking
          hooks: {
            PreToolUse: [{
              hooks: [async (input: any) => {
                // Skip if bypass mode
                if (permissionMode === 'bypassPermissions') {
                  return { continue: true };
                }
                
                // In plan mode, block all execution
                if (permissionMode === 'plan') {
                  if (['Write', 'Edit', 'Bash', 'Delete'].includes(input.tool_name)) {
                    return { continue: false };
                  }
                }
                
                // Check if permission needed
                const needsPermission = ['Write', 'Edit', 'Bash', 'Delete'].includes(input.tool_name);
                
                if (needsPermission && permissionMode === 'default') {
                  // Show permission prompt
                  if (onPermissionRequest) {
                    const preview = await generateDiffPreview(input.tool_name, input.tool_input);
                    
                    const approved = await onPermissionRequest({
                      type: input.tool_name === 'Bash' ? 'bash_command' : 'file_edit',
                      tool: input.tool_name,
                      description: JSON.stringify(input.tool_input, null, 2),
                      preview,
                    });
                    
                    if (!approved) {
                      return { continue: false };
                    }
                  }
                }
                
                // acceptEdits mode: auto-approve edits
                if (needsPermission && permissionMode === 'acceptEdits') {
                  return { continue: true };
                }
                
                return { continue: true };
              }],
            }],
          },
          
          // MCP servers DISABLED for now
          // mcpServers: mcpServerCount > 0 ? mcpServers : undefined,
          
          // Prevent infinite loops - limit to 30 turns
          maxTurns: 30,
          // Timeout after 90 seconds (allow time for complex queries)
          timeoutMs: 90000,
        });
        agentRef.current = agent;

        // Add a watchdog timer
        const watchdogTimeout = setTimeout(() => {
          console.error('SDK agent is taking too long, aborting...');
          abortController.abort();
        }, 120000); // 2 minutes watchdog

        try {
          await agent.run(query);
        } finally {
          clearTimeout(watchdogTimeout);
        }
        
        // Capture session ID for next turn
        const newSessionId = agent.getLastSessionId();
        if (newSessionId) {
          sessionIdRef.current = newSessionId;
        }
      } catch (e) {
        // Don't rethrow abort errors - they're expected during cancellation
        const errorMsg = (e as Error).message;
        if (errorMsg === 'Operation was cancelled' || errorMsg.includes('aborted')) {
          setCurrentTurn(prev => prev ? {
            ...prev,
            state: { ...prev.state, progressMessage: 'Cancelled' }
          } : null);
          return;
        }
        
        // Show error to user
        setCurrentTurn(prev => prev ? {
          ...prev,
          state: { ...prev.state, progressMessage: `Error: ${errorMsg}` }
        } : null);
        
        console.error('SDK Agent error:', e);
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

  /**
   * Set session ID for resuming
   */
  const setSessionId = useCallback((sessionId: string) => {
    sessionIdRef.current = sessionId;
  }, []);

  return {
    currentTurn,
    answerStream,
    isProcessing,
    processQuery,
    handleAnswerComplete,
    cancelExecution,
    setSessionId,
  };
}
