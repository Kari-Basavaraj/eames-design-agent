// Updated: 2026-01-12 16:50:00
// SDK Agent Callback Mapping Tests (Phase 2)
// TDD: Tests for SDK message → callback mapping via SdkMessageProcessor

import { describe, it, expect, beforeEach } from 'bun:test';
import {
  SdkMessageProcessor,
  createMessageProcessor,
  type SDKAssistantMessage,
  type SDKToolResultMessage,
  type SDKResultMessage,
  type SDKSystemMessage,
  type SDKToolProgressMessage,
} from '../../../src/agent/sdk-message-processor.js';
import type { AgentCallbacks } from '../../../src/agent/orchestrator.js';
import type { ToolCallStatus } from '../../../src/agent/state.js';

// ============================================================================
// Test Helpers
// ============================================================================

interface TestCallbackState {
  progressMessages: string[];
  taskUpdates: Array<{ taskId: string; status: string }>;
  toolCallSets: Array<{ taskId: string; toolCalls: ToolCallStatus[] }>;
  answerStartCalled: boolean;
  phaseStarts: string[];
  phaseCompletes: string[];
}

function createTestCallbacks(): { callbacks: AgentCallbacks; state: TestCallbackState } {
  const state: TestCallbackState = {
    progressMessages: [],
    taskUpdates: [],
    toolCallSets: [],
    answerStartCalled: false,
    phaseStarts: [],
    phaseCompletes: [],
  };

  const callbacks: AgentCallbacks = {
    onProgressMessage: (msg) => state.progressMessages.push(msg),
    onTaskUpdate: (taskId, status) => state.taskUpdates.push({ taskId, status: status.status }),
    onTaskToolCallsSet: (taskId, toolCalls) => state.toolCallSets.push({ taskId, toolCalls: [...toolCalls] }),
    onAnswerStart: () => { state.answerStartCalled = true; },
    onAnswerStream: () => {},
    onPhaseStart: (phase) => state.phaseStarts.push(phase),
    onPhaseComplete: (phase) => state.phaseCompletes.push(phase),
  };

  return { callbacks, state };
}

// ============================================================================
// Test Suite: SDK Message → Callback Mapping
// ============================================================================

describe('SdkMessageProcessor', () => {
  let processor: SdkMessageProcessor;
  let state: TestCallbackState;

  beforeEach(() => {
    const result = createTestCallbacks();
    processor = createMessageProcessor(result.callbacks);
    state = result.state;
  });

  // ==========================================================================
  // Test: System messages
  // ==========================================================================
  describe('processSystemMessage', () => {
    it('should call onProgressMessage with tool count', () => {
      const message: SDKSystemMessage = {
        type: 'system',
        subtype: 'init',
        tools: ['Read', 'Edit', 'Bash', 'WebSearch'],
      };

      processor.processSystemMessage(message);

      expect(state.progressMessages).toContain('Connected: 4 tools available');
    });
  });

  // ==========================================================================
  // Test: Assistant messages with text
  // ==========================================================================
  describe('processAssistantMessage with text', () => {
    it('should call onProgressMessage with text content', () => {
      const message: SDKAssistantMessage = {
        type: 'assistant',
        message: {
          content: [{ type: 'text', text: 'Analyzing your request...' }],
        },
      };

      processor.processAssistantMessage(message);

      expect(state.progressMessages).toContain('Analyzing your request...');
    });

    it('should truncate long text for progress display', () => {
      const longText = 'A'.repeat(200);
      const message: SDKAssistantMessage = {
        type: 'assistant',
        message: {
          content: [{ type: 'text', text: longText }],
        },
      };

      processor.processAssistantMessage(message);

      const lastMessage = state.progressMessages[state.progressMessages.length - 1];
      // Now truncates at 100 chars (97 + '...')
      expect(lastMessage.length).toBeLessThanOrEqual(100);
      expect(lastMessage).toContain('...');
    });

    it('should return text content for accumulation', () => {
      const message: SDKAssistantMessage = {
        type: 'assistant',
        message: {
          content: [{ type: 'text', text: 'Hello World' }],
        },
      };

      const result = processor.processAssistantMessage(message);

      expect(result).toBe('Hello World');
    });

    it('should handle multiple text blocks', () => {
      const message: SDKAssistantMessage = {
        type: 'assistant',
        message: {
          content: [
            { type: 'text', text: 'Part 1. ' },
            { type: 'text', text: 'Part 2.' },
          ],
        },
      };

      const result = processor.processAssistantMessage(message);

      expect(result).toBe('Part 1. Part 2.');
    });
  });

  // ==========================================================================
  // Test: Assistant messages with tool_use
  // ==========================================================================
  describe('processAssistantMessage with tool_use', () => {
    it('should create ToolCallStatus with pending status', () => {
      const message: SDKAssistantMessage = {
        type: 'assistant',
        message: {
          content: [{
            type: 'tool_use',
            id: 'tool_123',
            name: 'WebSearch',
            input: { query: 'competitor analysis' },
          }],
        },
      };

      processor.processAssistantMessage(message);

      expect(state.toolCallSets.length).toBeGreaterThan(0);
      const lastToolCallSet = state.toolCallSets[state.toolCallSets.length - 1];
      expect(lastToolCallSet.toolCalls).toContainEqual(
        expect.objectContaining({
          tool: 'WebSearch',
          status: 'pending',
        })
      );
    });

    it('should call onProgressMessage with tool name', () => {
      const message: SDKAssistantMessage = {
        type: 'assistant',
        message: {
          content: [{
            type: 'tool_use',
            id: 'tool_456',
            name: 'search_competitors',
            input: { product_type: 'mobile wallet' },
          }],
        },
      };

      processor.processAssistantMessage(message);

      expect(state.progressMessages.some(m => m.includes('search_competitors'))).toBe(true);
    });

    it('should handle multiple tool calls in single message', () => {
      const message: SDKAssistantMessage = {
        type: 'assistant',
        message: {
          content: [
            { type: 'tool_use', id: 'tool_1', name: 'WebSearch', input: {} },
            { type: 'tool_use', id: 'tool_2', name: 'WebFetch', input: {} },
          ],
        },
      };

      processor.processAssistantMessage(message);

      const toolCalls = processor.getToolCalls();
      expect(toolCalls.filter(t => t.tool === 'WebSearch').length).toBe(1);
      expect(toolCalls.filter(t => t.tool === 'WebFetch').length).toBe(1);
    });

    it('should store tool args correctly', () => {
      const message: SDKAssistantMessage = {
        type: 'assistant',
        message: {
          content: [{
            type: 'tool_use',
            id: 'tool_789',
            name: 'Read',
            input: { file_path: '/test.ts' },
          }],
        },
      };

      processor.processAssistantMessage(message);

      const toolCalls = processor.getToolCalls();
      const readTool = toolCalls.find(t => t.tool === 'Read');
      expect(readTool?.args).toEqual({ file_path: '/test.ts' });
    });
  });

  // ==========================================================================
  // Test: Tool result messages
  // ==========================================================================
  describe('processToolResultMessage', () => {
    it('should update tool call status to completed on success', () => {
      // First, process tool use
      const toolUseMessage: SDKAssistantMessage = {
        type: 'assistant',
        message: {
          content: [{
            type: 'tool_use',
            id: 'tool_success',
            name: 'Read',
            input: { file_path: '/test.ts' },
          }],
        },
      };
      processor.processAssistantMessage(toolUseMessage);

      // Then, process result
      const resultMessage: SDKToolResultMessage = {
        type: 'tool_result',
        tool_use_id: 'tool_success',
        content: 'File contents here...',
      };
      processor.processToolResultMessage(resultMessage);

      const toolCalls = processor.getToolCalls();
      const readTool = toolCalls.find(t => t.tool === 'Read');
      expect(readTool?.status).toBe('completed');
      expect(readTool?.output).toBe('File contents here...');
    });

    it('should update tool call status to failed on error', () => {
      // First, process tool use
      const toolUseMessage: SDKAssistantMessage = {
        type: 'assistant',
        message: {
          content: [{
            type: 'tool_use',
            id: 'tool_error',
            name: 'Bash',
            input: { command: 'invalid_cmd' },
          }],
        },
      };
      processor.processAssistantMessage(toolUseMessage);

      // Then, process error result
      const resultMessage: SDKToolResultMessage = {
        type: 'tool_result',
        tool_use_id: 'tool_error',
        content: 'Command not found',
        is_error: true,
      };
      processor.processToolResultMessage(resultMessage);

      const toolCalls = processor.getToolCalls();
      const bashTool = toolCalls.find(t => t.tool === 'Bash');
      expect(bashTool?.status).toBe('failed');
      expect(bashTool?.error).toBe('Command not found');
    });

    it('should notify callbacks on status update', () => {
      const toolUseMessage: SDKAssistantMessage = {
        type: 'assistant',
        message: {
          content: [{
            type: 'tool_use',
            id: 'tool_notify',
            name: 'Grep',
            input: { pattern: 'test' },
          }],
        },
      };
      processor.processAssistantMessage(toolUseMessage);

      const initialCount = state.toolCallSets.length;

      const resultMessage: SDKToolResultMessage = {
        type: 'tool_result',
        tool_use_id: 'tool_notify',
        content: 'Results...',
      };
      processor.processToolResultMessage(resultMessage);

      expect(state.toolCallSets.length).toBeGreaterThan(initialCount);
    });
  });

  // ==========================================================================
  // Test: Tool progress messages
  // ==========================================================================
  describe('processToolProgressMessage', () => {
    it('should call onProgressMessage with elapsed time', () => {
      const message: SDKToolProgressMessage = {
        type: 'tool_progress',
        tool_name: 'WebSearch',
        elapsed_time_seconds: 2.5,
      };

      processor.processToolProgressMessage(message);

      expect(state.progressMessages.some(m => m.includes('WebSearch') && m.includes('3s'))).toBe(true);
    });

    it('should update tool status to running', () => {
      // First, add a pending tool
      const toolUseMessage: SDKAssistantMessage = {
        type: 'assistant',
        message: {
          content: [{
            type: 'tool_use',
            id: 'tool_progress_test',
            name: 'WebFetch',
            input: { url: 'https://example.com' },
          }],
        },
      };
      processor.processAssistantMessage(toolUseMessage);

      // Then, process progress
      const progressMessage: SDKToolProgressMessage = {
        type: 'tool_progress',
        tool_name: 'WebFetch',
        elapsed_time_seconds: 1.0,
      };
      processor.processToolProgressMessage(progressMessage);

      const toolCalls = processor.getToolCalls();
      const fetchTool = toolCalls.find(t => t.tool === 'WebFetch');
      expect(fetchTool?.status).toBe('running');
    });
  });

  // ==========================================================================
  // Test: Result messages
  // ==========================================================================
  describe('processResultMessage', () => {
    it('should NOT call onAnswerStart (called by SdkAgent.run instead)', () => {
      // Note: onAnswerStart is intentionally NOT called by processResultMessage
      // to avoid duplicate calls. SdkAgent.run() handles this directly.
      const message: SDKResultMessage = {
        type: 'result',
        subtype: 'success',
        result: 'Here is your analysis...',
      };

      processor.processResultMessage(message);

      // This should be false - onAnswerStart is called by SdkAgent.run(), not processor
      expect(state.answerStartCalled).toBe(false);
    });

    it('should return result content', () => {
      const message: SDKResultMessage = {
        type: 'result',
        subtype: 'success',
        result: 'Analysis complete: Found 5 competitors...',
      };

      const result = processor.processResultMessage(message);

      expect(result).toContain('Analysis complete');
    });

    it('should throw on error result', () => {
      const message: SDKResultMessage = {
        type: 'result',
        subtype: 'error',
        errors: ['API rate limit exceeded', 'Retry after 60s'],
      };

      expect(() => processor.processResultMessage(message)).toThrow('Query failed');
    });

    it('should handle empty result gracefully', () => {
      const message: SDKResultMessage = {
        type: 'result',
        subtype: 'success',
        result: '',
      };

      expect(() => processor.processResultMessage(message)).not.toThrow();
    });
  });

  // ==========================================================================
  // Test: Phase visualization
  // ==========================================================================
  describe('Phase visualization', () => {
    it('should call onPhaseStart with execute when starting', () => {
      processor.startExecution();

      expect(state.phaseStarts).toContain('execute');
    });

    it('should call onPhaseComplete with execute and start answer', () => {
      processor.startAnswer();

      expect(state.phaseCompletes).toContain('execute');
      expect(state.phaseStarts).toContain('answer');
    });

    it('should call onPhaseComplete with answer when done', () => {
      processor.completeAnswer();

      expect(state.phaseCompletes).toContain('answer');
    });
  });

  // ==========================================================================
  // Test: Answer streaming
  // ==========================================================================
  describe('createAnswerStream', () => {
    it('should stream answer in chunks', async () => {
      const chunks: string[] = [];
      const answer = 'Hello World, this is a test message.';

      for await (const chunk of processor.createAnswerStream(answer, 10)) {
        chunks.push(chunk);
      }

      expect(chunks.length).toBeGreaterThan(1);
      expect(chunks.join('')).toBe(answer);
    });

    it('should handle empty answer gracefully', async () => {
      const chunks: string[] = [];

      for await (const chunk of processor.createAnswerStream('', 10)) {
        chunks.push(chunk);
      }

      expect(chunks.length).toBe(0);
    });
  });

  // ==========================================================================
  // Test: Generic message processing
  // ==========================================================================
  describe('processMessage', () => {
    it('should route system messages correctly', () => {
      const message: SDKSystemMessage = {
        type: 'system',
        subtype: 'init',
        tools: ['Read'],
      };

      processor.processMessage(message);

      expect(state.progressMessages.length).toBeGreaterThan(0);
    });

    it('should route assistant messages correctly', () => {
      const message: SDKAssistantMessage = {
        type: 'assistant',
        message: {
          content: [{ type: 'text', text: 'Test' }],
        },
      };

      processor.processMessage(message);

      expect(state.progressMessages.length).toBeGreaterThan(0);
    });
  });
});
