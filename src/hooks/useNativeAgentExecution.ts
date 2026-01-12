// Updated: 2026-01-12 01:20:00
// Eames Design Agent - Native Claude Agent Execution Hook
// Claude Code-like agent using direct Anthropic SDK

import { useState, useCallback, useRef } from 'react';
import Anthropic from '@anthropic-ai/sdk';
import type {
  MessageParam,
  ContentBlock,
  ToolUseBlock,
  TextBlock,
  Tool,
  ToolResultBlockParam,
} from '@anthropic-ai/sdk/resources/messages';
import { TOOLS } from '../tools/index.js';
import { DEFAULT_SYSTEM_PROMPT } from '../agent/prompts.js';
import { generateId } from '../cli/types.js';
import type { Task, Phase, TaskStatus, ToolCallStatus } from '../agent/state.js';
import type { AgentProgressState } from '../components/AgentProgressView.js';
import { z } from 'zod';

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// ============================================================================
// Types
// ============================================================================

export interface NativeCurrentTurn {
  id: string;
  query: string;
  state: AgentProgressState;
}

interface UseNativeAgentExecutionOptions {
  model?: string;
  systemPrompt?: string;
  maxIterations?: number;
}

interface UseNativeAgentExecutionResult {
  currentTurn: NativeCurrentTurn | null;
  answerStream: AsyncGenerator<string> | null;
  isProcessing: boolean;
  processQuery: (query: string) => Promise<void>;
  handleAnswerComplete: (answer: string) => void;
  cancelExecution: () => void;
  conversationHistory: MessageParam[];
  clearConversation: () => void;
}

// ============================================================================
// Zod to JSON Schema Conversion
// ============================================================================

function zodToJsonSchema(schema: z.ZodType<any>): Record<string, unknown> {
  if (schema instanceof z.ZodObject) {
    const shape = schema.shape;
    const properties: Record<string, unknown> = {};
    const required: string[] = [];

    for (const [key, value] of Object.entries(shape)) {
      const zodValue = value as z.ZodType<any>;
      properties[key] = zodFieldToSchema(zodValue);
      if (!(zodValue instanceof z.ZodOptional)) {
        required.push(key);
      }
    }

    return { type: 'object', properties, required: required.length > 0 ? required : undefined };
  }
  return { type: 'object', properties: {} };
}

function zodFieldToSchema(field: z.ZodType<any>): Record<string, unknown> {
  if (field instanceof z.ZodOptional) return zodFieldToSchema(field._def.innerType);
  if (field instanceof z.ZodString) return { type: 'string', description: field.description };
  if (field instanceof z.ZodNumber) return { type: 'number', description: field.description };
  if (field instanceof z.ZodBoolean) return { type: 'boolean', description: field.description };
  if (field instanceof z.ZodArray) return { type: 'array', items: zodFieldToSchema(field._def.type) };
  if (field instanceof z.ZodEnum) return { type: 'string', enum: field._def.values };
  return { type: 'string' };
}

// ============================================================================
// Tool Conversion
// ============================================================================

function getAnthropicTools(): Tool[] {
  return TOOLS.map(tool => {
    const schema = (tool as any).schema;
    const jsonSchema = schema ? zodToJsonSchema(schema) : { type: 'object', properties: {} };

    return {
      name: tool.name,
      description: tool.description,
      input_schema: jsonSchema as Tool['input_schema'],
    };
  });
}

async function executeTool(name: string, input: Record<string, unknown>): Promise<string> {
  const tool = TOOLS.find(t => t.name === name);
  if (!tool) {
    return JSON.stringify({ success: false, error: `Tool not found: ${name}` });
  }

  try {
    const result = await tool.invoke(input);
    return typeof result === 'string' ? result : JSON.stringify(result);
  } catch (error) {
    return JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

// ============================================================================
// Hook Implementation
// ============================================================================

export function useNativeAgentExecution({
  model = 'claude-sonnet-4-5-20250929',
  systemPrompt = DEFAULT_SYSTEM_PROMPT,
  maxIterations = 20,
}: UseNativeAgentExecutionOptions = {}): UseNativeAgentExecutionResult {
  const [currentTurn, setCurrentTurn] = useState<NativeCurrentTurn | null>(null);
  const [answerStream, setAnswerStream] = useState<AsyncGenerator<string> | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Conversation history persists across turns
  const conversationHistory = useRef<MessageParam[]>([]);
  const abortController = useRef<AbortController | null>(null);
  const isProcessingRef = useRef(false);

  // Clear conversation history
  const clearConversation = useCallback(() => {
    conversationHistory.current = [];
  }, []);

  // Handle answer complete
  const handleAnswerComplete = useCallback((answer: string) => {
    setCurrentTurn(null);
    setAnswerStream(null);
  }, []);

  // Cancel current execution
  const cancelExecution = useCallback(() => {
    if (abortController.current) {
      abortController.current.abort();
      abortController.current = null;
    }
    setCurrentTurn(null);
    setAnswerStream(null);
    isProcessingRef.current = false;
    setIsProcessing(false);
  }, []);

  // Process a query with agentic loop
  const processQuery = useCallback(async (query: string): Promise<void> => {
    if (isProcessingRef.current) return;
    isProcessingRef.current = true;
    setIsProcessing(true);

    const turnId = generateId();
    abortController.current = new AbortController();

    // Initialize turn state (Claude Code style - no phases, just execution)
    setCurrentTurn({
      id: turnId,
      query,
      state: {
        currentPhase: 'execute', // Direct execution like Claude Code
        understandComplete: true,
        planComplete: true,
        executeComplete: false,
        reflectComplete: false,
        tasks: [],
        isAnswering: false,
        progressMessage: 'Thinking...',
      },
    });

    // Add user message to history
    conversationHistory.current.push({
      role: 'user',
      content: query,
    });

    let iterations = 0;
    let finalResponse = '';
    let taskCounter = 0;

    try {
      const tools = getAnthropicTools();

      while (iterations < maxIterations) {
        iterations++;

        // Check for abort
        if (abortController.current?.signal.aborted) {
          throw new Error('Cancelled');
        }

        // Update progress message
        setCurrentTurn(prev => prev ? {
          ...prev,
          state: {
            ...prev.state,
            progressMessage: iterations === 1 ? 'Thinking...' : `Processing (iteration ${iterations})...`,
          },
        } : prev);

        // Make streaming API call
        const stream = anthropic.messages.stream({
          model,
          max_tokens: 8192,
          system: systemPrompt,
          messages: conversationHistory.current,
          tools: tools.length > 0 ? tools : undefined,
        });

        // Collect response
        let responseContent: ContentBlock[] = [];
        let streamedText = '';

        // Create async generator for streaming text
        const textGenerator = (async function* () {
          for await (const event of stream) {
            if (abortController.current?.signal.aborted) {
              return;
            }

            if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
              streamedText += event.delta.text;
              yield event.delta.text;
            }
          }
        })();

        // Set the stream for the UI
        setAnswerStream(textGenerator);
        setCurrentTurn(prev => prev ? {
          ...prev,
          state: { ...prev.state, isAnswering: true },
        } : prev);

        // Wait for stream to complete
        const response = await stream.finalMessage();
        responseContent = response.content;

        // Add assistant response to history
        conversationHistory.current.push({
          role: 'assistant',
          content: responseContent,
        });

        // Extract text and tool use blocks
        const textBlocks = responseContent.filter(
          (block): block is TextBlock => block.type === 'text'
        );
        const toolUseBlocks = responseContent.filter(
          (block): block is ToolUseBlock => block.type === 'tool_use'
        );

        if (textBlocks.length > 0) {
          finalResponse = textBlocks.map(b => b.text).join('\n');
        }

        // If no tool calls, we're done
        if (toolUseBlocks.length === 0 || response.stop_reason === 'end_turn') {
          break;
        }

        // Clear stream for tool execution phase
        setAnswerStream(null);
        setCurrentTurn(prev => prev ? {
          ...prev,
          state: { ...prev.state, isAnswering: false, progressMessage: 'Executing tools...' },
        } : prev);

        // Execute tool calls (Claude Code style - as tasks)
        const toolResults: ToolResultBlockParam[] = [];

        for (const toolUse of toolUseBlocks) {
          const taskId = `task-${++taskCounter}`;

          // Create task for this tool call
          const newTask: Task = {
            id: taskId,
            description: `${toolUse.name}`,
            status: 'in_progress' as TaskStatus,
            startTime: Date.now(),
            toolCalls: [{
              name: toolUse.name,
              input: toolUse.input as Record<string, unknown>,
              status: 'running' as ToolCallStatus['status'],
            }],
          };

          // Add task to state
          setCurrentTurn(prev => prev ? {
            ...prev,
            state: {
              ...prev.state,
              tasks: [...prev.state.tasks, newTask],
            },
          } : prev);

          try {
            const result = await executeTool(toolUse.name, toolUse.input as Record<string, unknown>);

            // Update task as completed
            setCurrentTurn(prev => prev ? {
              ...prev,
              state: {
                ...prev.state,
                tasks: prev.state.tasks.map(t =>
                  t.id === taskId
                    ? {
                        ...t,
                        status: 'completed' as TaskStatus,
                        endTime: Date.now(),
                        toolCalls: t.toolCalls?.map(tc => ({
                          ...tc,
                          status: 'completed' as ToolCallStatus['status'],
                          output: result.slice(0, 200), // Truncate for display
                        })),
                      }
                    : t
                ),
              },
            } : prev);

            toolResults.push({
              type: 'tool_result',
              tool_use_id: toolUse.id,
              content: result,
            });
          } catch (error) {
            const errorMsg = error instanceof Error ? error.message : 'Unknown error';

            // Update task as failed
            setCurrentTurn(prev => prev ? {
              ...prev,
              state: {
                ...prev.state,
                tasks: prev.state.tasks.map(t =>
                  t.id === taskId
                    ? {
                        ...t,
                        status: 'failed' as TaskStatus,
                        endTime: Date.now(),
                        toolCalls: t.toolCalls?.map(tc => ({
                          ...tc,
                          status: 'error' as ToolCallStatus['status'],
                          error: errorMsg,
                        })),
                      }
                    : t
                ),
              },
            } : prev);

            toolResults.push({
              type: 'tool_result',
              tool_use_id: toolUse.id,
              content: `Error: ${errorMsg}`,
              is_error: true,
            });
          }
        }

        // Add tool results to history
        conversationHistory.current.push({
          role: 'user',
          content: toolResults,
        });
      }

      // Mark execution complete
      setCurrentTurn(prev => prev ? {
        ...prev,
        state: {
          ...prev.state,
          executeComplete: true,
          reflectComplete: true,
          isAnswering: true,
          progressMessage: undefined,
        },
      } : prev);

      // Create final answer stream
      const finalGenerator = (async function* () {
        yield finalResponse;
      })();
      setAnswerStream(finalGenerator);

    } catch (error) {
      if ((error as Error).message !== 'Cancelled') {
        console.error('Agent error:', error);
      }
      setCurrentTurn(null);
      setAnswerStream(null);
    } finally {
      abortController.current = null;
      isProcessingRef.current = false;
      setIsProcessing(false);
    }
  }, [model, systemPrompt, maxIterations]);

  return {
    currentTurn,
    answerStream,
    isProcessing,
    processQuery,
    handleAnswerComplete,
    cancelExecution,
    conversationHistory: conversationHistory.current,
    clearConversation,
  };
}
