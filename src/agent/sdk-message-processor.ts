// Updated: 2026-01-12 23:55:00
// SDK Message Processor - Testable message handling for Claude Agent SDK
// Separates message processing from SDK integration for testability
// Uses flexible typing to handle SDK message variations

import type { AgentCallbacks } from './orchestrator.js';
import type { ToolCallStatus } from './state.js';
import { generateId } from '../cli/types.js';

// ============================================================================
// Types - Flexible SDK message handling
// ============================================================================

/**
 * Base message with type discriminator
 */
export interface SDKBaseMessage {
  type: string;
}

/**
 * Assistant message with content blocks
 */
export interface SDKAssistantMessage extends SDKBaseMessage {
  type: 'assistant';
  message: {
    content: Array<{
      type: string;
      text?: string;
      id?: string;
      name?: string;
      input?: unknown;
    }>;
  };
}

/**
 * Tool result message
 */
export interface SDKToolResultMessage extends SDKBaseMessage {
  type: 'tool_result';
  tool_use_id: string;
  content: string;
  is_error?: boolean;
}

/**
 * Result message (success or error)
 */
export interface SDKResultMessage extends SDKBaseMessage {
  type: 'result';
  subtype: 'success' | 'error';
  result?: string;
  errors?: string[];
  session_id?: string;
}

/**
 * System init message
 */
export interface SDKSystemMessage extends SDKBaseMessage {
  type: 'system';
  subtype?: string;
  tools?: string[];
}

/**
 * Tool progress message
 */
export interface SDKToolProgressMessage extends SDKBaseMessage {
  type: 'tool_progress';
  tool_name: string;
  elapsed_time_seconds: number;
}

/**
 * Union of all message types we handle
 */
export type SDKMessage = SDKBaseMessage;

// ============================================================================
// Message Processor State
// ============================================================================

export interface ProcessorState {
  toolCalls: Map<string, ToolCallStatus>;
  taskId: string;
  textContent: string;
}

// ============================================================================
// Message Processor
// ============================================================================

/**
 * Processes SDK messages and converts them to Eames callbacks.
 * Designed to be testable independently of the SDK.
 */
export class SdkMessageProcessor {
  private readonly callbacks: AgentCallbacks;
  private readonly state: ProcessorState;
  private readonly maxProgressLength: number;

  constructor(callbacks: AgentCallbacks, maxProgressLength = 80) {
    this.callbacks = callbacks;
    this.maxProgressLength = maxProgressLength;
    this.state = {
      toolCalls: new Map(),
      taskId: generateId(),
      textContent: '',
    };
  }

  /**
   * Gets the current processor state (for testing).
   */
  getState(): ProcessorState {
    return this.state;
  }

  /**
   * Gets all tool calls as an array.
   */
  getToolCalls(): ToolCallStatus[] {
    return Array.from(this.state.toolCalls.values());
  }

  /**
   * Processes any SDK message type.
   * Uses type guards for flexible handling of SDK message variations.
   */
  processMessage(message: SDKMessage): string {
    switch (message.type) {
      case 'system':
        return this.processSystemMessage(message as SDKSystemMessage);
      case 'assistant':
        return this.processAssistantMessage(message as SDKAssistantMessage);
      case 'tool_result':
        return this.processToolResultMessage(message as SDKToolResultMessage);
      case 'tool_progress':
        return this.processToolProgressMessage(message as SDKToolProgressMessage);
      case 'result':
        return this.processResultMessage(message as SDKResultMessage);
      default:
        // Handle unknown message types gracefully
        return '';
    }
  }

  /**
   * Processes system init messages.
   */
  processSystemMessage(message: SDKSystemMessage): string {
    // Silently ignore system messages - don't show "Connected: X tools"
    return '';
  }

  /**
   * Processes assistant messages (text and tool use).
   */
  processAssistantMessage(message: SDKAssistantMessage): string {
    const content = message.message?.content;
    if (!content) return '';
    
    let textContent = '';

    for (const block of content) {
      if (block.type === 'text' && block.text) {
        textContent += block.text;

        // Show thinking text as progress (Claude Code shows this!)
        const text = block.text.trim();
        if (text.length > 0) {
          // Show as "Thinking: <text>" to indicate AI's thought process
          const preview = text.length > 100 ? text.slice(0, 97) + '...' : text;
          this.callbacks.onProgressMessage?.(`${preview}`);
        }
      } else if (block.type === 'tool_use' && block.name && block.id) {
        // Create tool call status
        const toolCall: ToolCallStatus = {
          name: block.name,
          tool: block.name,
          args: (block.input as Record<string, unknown>) ?? {},
          status: 'pending',
        };

        // Store with SDK's tool_use ID
        this.state.toolCalls.set(block.id, toolCall);

        // Notify callbacks
        this.callbacks.onProgressMessage?.(`Using ${block.name}...`);
        this.notifyToolCallsUpdate();
      }
    }

    this.state.textContent += textContent;
    return textContent;
  }

  /**
   * Processes tool result messages.
   */
  processToolResultMessage(message: SDKToolResultMessage): string {
    const toolCall = this.state.toolCalls.get(message.tool_use_id);

    if (toolCall) {
      if (message.is_error) {
        toolCall.status = 'failed';
        toolCall.error = message.content;
      } else {
        toolCall.status = 'completed';
        toolCall.output = message.content;
      }

      this.notifyToolCallsUpdate();
    }

    return '';
  }

  /**
   * Processes tool progress messages.
   */
  processToolProgressMessage(message: SDKToolProgressMessage): string {
    const progressMsg = `${message.tool_name} (${Math.round(message.elapsed_time_seconds)}s)...`;
    this.callbacks.onProgressMessage?.(progressMsg);

    // Update tool call status to running
    for (const toolCall of this.state.toolCalls.values()) {
      if (toolCall.tool === message.tool_name && toolCall.status === 'pending') {
        toolCall.status = 'running';
        this.notifyToolCallsUpdate();
        break;
      }
    }

    return progressMsg;
  }

  /**
   * Processes result messages (success or error).
   * Note: onAnswerStart is called by SdkAgent.run() to avoid duplicate calls.
   */
  processResultMessage(message: SDKResultMessage): string {
    if (message.subtype === 'success') {
      return message.result || '';
    } else {
      // Check if errors are just warnings (MCP config issues, etc.)
      const errors = message.errors || [];
      const errorText = errors.join(', ') || 'Unknown error';
      
      // Filter out non-fatal MCP/LSP configuration errors
      const fatalErrors = errors.filter(e => 
        !e.includes('mcp-config-invalid') && 
        !e.includes('LSP server') &&
        !e.includes('typescript-language-server')
      );
      
      if (fatalErrors.length === 0 && message.result) {
        // Non-fatal errors with a result - return the result
        this.callbacks.onProgressMessage?.(`Warning: ${errorText.slice(0, 100)}...`);
        return message.result;
      }
      
      throw new Error(`Query failed: ${errorText}`);
    }
  }

  /**
   * Signals the start of execution phase.
   */
  startExecution(): void {
    this.callbacks.onPhaseStart?.('execute');
    this.callbacks.onProgressMessage?.('Thinking...');
  }

  /**
   * Signals the end of execution phase and start of answer phase.
   */
  startAnswer(): void {
    this.callbacks.onPhaseComplete?.('execute');
    this.callbacks.onPhaseStart?.('answer');
  }

  /**
   * Signals completion of answer phase.
   */
  completeAnswer(): void {
    this.callbacks.onPhaseComplete?.('answer');
  }

  /**
   * Creates an async generator for streaming the answer.
   */
  async *createAnswerStream(answer: string, chunkSize = 50): AsyncGenerator<string> {
    if (!answer) return;

    for (let i = 0; i < answer.length; i += chunkSize) {
      yield answer.slice(i, i + chunkSize);
      // Small delay between chunks for visual effect
      await new Promise(resolve => setTimeout(resolve, 10));
    }
  }

  /**
   * Truncates text for progress display.
   */
  private truncateForProgress(text: string): string {
    const cleaned = text.replace(/\n/g, ' ').trim();
    if (cleaned.length <= this.maxProgressLength) {
      return cleaned;
    }
    return cleaned.slice(0, this.maxProgressLength - 3) + '...';
  }

  /**
   * Notifies callbacks about tool call updates.
   */
  private notifyToolCallsUpdate(): void {
    const toolCalls = this.getToolCalls();
    this.callbacks.onTaskToolCallsSet?.(this.state.taskId, toolCalls);
  }
}

// ============================================================================
// Factory Function
// ============================================================================

export function createMessageProcessor(
  callbacks: AgentCallbacks,
  maxProgressLength?: number
): SdkMessageProcessor {
  return new SdkMessageProcessor(callbacks, maxProgressLength);
}
