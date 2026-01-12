// Updated: 2026-01-12 16:45:00
// SDK Message Processor - Testable message handling for Claude Agent SDK
// Separates message processing from SDK integration for testability

import type { AgentCallbacks } from './orchestrator.js';
import type { ToolCallStatus } from './state.js';
import { generateId } from '../cli/types.js';

// ============================================================================
// Types
// ============================================================================

/**
 * SDK Message types (matches @anthropic-ai/claude-agent-sdk)
 */
export interface SDKTextBlock {
  type: 'text';
  text: string;
}

export interface SDKToolUseBlock {
  type: 'tool_use';
  id: string;
  name: string;
  input: Record<string, unknown>;
}

export type SDKContentBlock = SDKTextBlock | SDKToolUseBlock;

export interface SDKAssistantMessage {
  type: 'assistant';
  message: {
    content: SDKContentBlock[];
  };
}

export interface SDKToolResultMessage {
  type: 'tool_result';
  tool_use_id: string;
  content: string;
  is_error?: boolean;
}

export interface SDKResultMessage {
  type: 'result';
  subtype: 'success' | 'error';
  result?: string;
  errors?: string[];
}

export interface SDKSystemMessage {
  type: 'system';
  subtype: 'init';
  tools: string[];
}

export interface SDKToolProgressMessage {
  type: 'tool_progress';
  tool_name: string;
  elapsed_time_seconds: number;
}

export type SDKMessage =
  | SDKAssistantMessage
  | SDKToolResultMessage
  | SDKResultMessage
  | SDKSystemMessage
  | SDKToolProgressMessage;

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
   */
  processMessage(message: SDKMessage): string {
    switch (message.type) {
      case 'system':
        return this.processSystemMessage(message);
      case 'assistant':
        return this.processAssistantMessage(message);
      case 'tool_result':
        return this.processToolResultMessage(message);
      case 'tool_progress':
        return this.processToolProgressMessage(message);
      case 'result':
        return this.processResultMessage(message);
      default:
        return '';
    }
  }

  /**
   * Processes system init messages.
   */
  processSystemMessage(message: SDKSystemMessage): string {
    if (message.subtype === 'init') {
      const progressMsg = `Connected: ${message.tools.length} tools available`;
      this.callbacks.onProgressMessage?.(progressMsg);
      return progressMsg;
    }
    return '';
  }

  /**
   * Processes assistant messages (text and tool use).
   */
  processAssistantMessage(message: SDKAssistantMessage): string {
    const content = message.message.content;
    let textContent = '';

    for (const block of content) {
      if (block.type === 'text') {
        textContent += block.text;

        // Truncate for progress display
        const preview = this.truncateForProgress(block.text);
        if (preview.length > 0) {
          this.callbacks.onProgressMessage?.(preview);
        }
      } else if (block.type === 'tool_use') {
        // Create tool call status
        const toolCall: ToolCallStatus = {
          tool: block.name,
          args: block.input,
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
   */
  processResultMessage(message: SDKResultMessage): string {
    if (message.subtype === 'success') {
      // Notify answer start
      this.callbacks.onAnswerStart?.();
      return message.result || '';
    } else {
      const errors = message.errors?.join(', ') || 'Unknown error';
      throw new Error(`Query failed: ${errors}`);
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
