// Updated: 2026-01-12 17:30:00
// Eames Design Agent - Claude Agent SDK Wrapper
// Bridges Claude Agent SDK with existing AgentCallbacks interface

import { query } from '@anthropic-ai/claude-agent-sdk';
import type {
  Options,
  Query,
} from '@anthropic-ai/claude-agent-sdk';
import type { AgentCallbacks } from './orchestrator.js';
import { DEFAULT_SYSTEM_PROMPT } from './prompts.js';
import {
  SdkMessageProcessor,
  createMessageProcessor,
  type SDKMessage,
  type SDKAssistantMessage,
  type SDKToolResultMessage,
  type SDKResultMessage,
  type SDKSystemMessage,
  type SDKToolProgressMessage,
} from './sdk-message-processor.js';

// ============================================================================
// Types
// ============================================================================

export interface SdkAgentOptions {
  model: string;
  callbacks?: AgentCallbacks;
  signal?: AbortSignal;
  systemPrompt?: string;
}

// Design tools removed - SDK has WebSearch built-in which is more direct

// ============================================================================
// SDK Agent Implementation
// ============================================================================

/**
 * SdkAgent wraps the Claude Agent SDK to provide Eames functionality
 * while maintaining compatibility with the existing callback interface.
 */
export class SdkAgent {
  private readonly model: string;
  private readonly callbacks: AgentCallbacks;
  private readonly signal?: AbortSignal;
  private readonly systemPrompt: string;
  private readonly messageProcessor: SdkMessageProcessor;
  private currentQuery: Query | null = null;

  constructor(options: SdkAgentOptions) {
    this.model = options.model;
    this.callbacks = options.callbacks ?? {};
    this.signal = options.signal;
    this.systemPrompt = options.systemPrompt ?? DEFAULT_SYSTEM_PROMPT;
    this.messageProcessor = createMessageProcessor(this.callbacks);
  }

  /**
   * Gets the message processor (for testing/inspection).
   */
  getMessageProcessor(): SdkMessageProcessor {
    return this.messageProcessor;
  }

  /**
   * Cancels the current execution if running.
   */
  async cancel(): Promise<void> {
    if (this.currentQuery) {
      try {
        await this.currentQuery.interrupt();
      } catch {
        // Ignore interruption errors
      }
      this.currentQuery = null;
    }
  }

  /**
   * Main entry point - runs a query using the Claude Agent SDK.
   */
  async run(prompt: string): Promise<string> {
    // Create abort controller linked to external signal
    const abortController = new AbortController();
    if (this.signal) {
      this.signal.addEventListener('abort', () => abortController.abort());
    }

    // Configure SDK options - use built-in tools directly
    const options: Options = {
      model: this.model,
      abortController,
      systemPrompt: this.systemPrompt,
      permissionMode: 'acceptEdits',
      tools: ['Read', 'Edit', 'Write', 'Glob', 'Grep', 'WebSearch', 'WebFetch', 'Bash'],
      hooks: {
        PreToolUse: [{
          hooks: [async (input) => {
            if (input.hook_event_name === 'PreToolUse') {
              this.callbacks.onProgressMessage?.(`Using ${input.tool_name}...`);
            }
            return { continue: true };
          }],
        }],
        PostToolUse: [{
          hooks: [async (input) => {
            if (input.hook_event_name === 'PostToolUse') {
              this.callbacks.onProgressMessage?.(`${input.tool_name} completed`);
            }
            return { continue: true };
          }],
        }],
        PostToolUseFailure: [{
          hooks: [async (input) => {
            if (input.hook_event_name === 'PostToolUseFailure') {
              this.callbacks.onProgressMessage?.(`${input.tool_name} failed: ${input.error}`);
            }
            return { continue: true };
          }],
        }],
      },
    };

    // Start the query
    this.currentQuery = query({ prompt, options });

    let result = '';
    let finalAnswer = '';

    try {
      // Notify phase start via message processor
      this.messageProcessor.startExecution();

      // Process messages from the SDK
      for await (const message of this.currentQuery) {
        // Check for abort
        if (this.signal?.aborted) {
          throw new Error('Operation was cancelled');
        }

        // Route message through processor
        const processed = this.messageProcessor.processMessage(message as SDKMessage);

        // Capture text content and results
        if (message.type === 'assistant') {
          finalAnswer = processed;
        } else if (message.type === 'result') {
          result = processed;
        } else if (message.type === 'tool_result') {
          // Tool results are processed by the processor for status tracking
          this.messageProcessor.processToolResultMessage(message as SDKToolResultMessage);
        }
      }

      // Transition to answer phase via processor
      this.messageProcessor.startAnswer();
      this.callbacks.onAnswerStart?.();

      // Stream the final answer
      const answerToStream = result || finalAnswer;
      if (answerToStream) {
        const stream = this.messageProcessor.createAnswerStream(answerToStream);
        this.callbacks.onAnswerStream?.(stream);
      }

      // Complete answer phase
      this.messageProcessor.completeAnswer();

      return answerToStream;

    } catch (error) {
      if ((error as Error).message !== 'Operation was cancelled') {
        console.error('SDK Agent error:', error);
      }
      throw error;
    } finally {
      this.currentQuery = null;
    }
  }

  /**
   * Gets all tracked tool calls from the message processor.
   */
  getToolCalls() {
    return this.messageProcessor.getToolCalls();
  }
}

// ============================================================================
// Factory Function
// ============================================================================

/**
 * Creates a new SDK agent instance.
 */
export function createSdkAgent(options: SdkAgentOptions): SdkAgent {
  return new SdkAgent(options);
}
