// Updated: 2026-01-12 00:45:00
// Eames Design Agent - Native Claude Agent Hook
// Claude Code-like agent execution using direct Anthropic SDK

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
import { z } from 'zod';

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Tool execution status
export interface ToolExecution {
  id: string;
  name: string;
  input: unknown;
  status: 'running' | 'completed' | 'error';
  result?: string;
  error?: string;
}

// Agent state
export interface NativeAgentState {
  isProcessing: boolean;
  currentPhase: 'idle' | 'thinking' | 'tool_use' | 'responding';
  toolExecutions: ToolExecution[];
  streamingText: string;
  finalAnswer: string;
  error: string | null;
}

// Convert Zod schema to JSON Schema
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

function zodFieldToSchema(field: any): Record<string, unknown> {
  if (!field || !field._def) return { type: 'string' };
  const typeName = field._def.typeName;

  if (typeName === 'ZodOptional') return zodFieldToSchema(field._def.innerType);
  if (typeName === 'ZodString') return { type: 'string', description: field.description };
  if (typeName === 'ZodNumber') return { type: 'number', description: field.description };
  if (typeName === 'ZodBoolean') return { type: 'boolean', description: field.description };
  if (typeName === 'ZodArray') return { type: 'array', items: zodFieldToSchema(field._def.type) };
  if (typeName === 'ZodEnum') return { type: 'string', enum: Object.values(field._def.values || {}) };
  return { type: 'string' };
}

// Convert LangChain tools to Anthropic format
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

// Execute a tool by name
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

export function useNativeAgent(options: {
  model?: string;
  systemPrompt?: string;
  maxIterations?: number;
} = {}) {
  const {
    model = 'claude-sonnet-4-5-20250929',
    systemPrompt = DEFAULT_SYSTEM_PROMPT,
    maxIterations = 20,
  } = options;

  const [state, setState] = useState<NativeAgentState>({
    isProcessing: false,
    currentPhase: 'idle',
    toolExecutions: [],
    streamingText: '',
    finalAnswer: '',
    error: null,
  });

  // Conversation history
  const conversationHistory = useRef<MessageParam[]>([]);
  const abortController = useRef<AbortController | null>(null);

  // Clear conversation
  const clearConversation = useCallback(() => {
    conversationHistory.current = [];
    setState({
      isProcessing: false,
      currentPhase: 'idle',
      toolExecutions: [],
      streamingText: '',
      finalAnswer: '',
      error: null,
    });
  }, []);

  // Cancel current execution
  const cancel = useCallback(() => {
    if (abortController.current) {
      abortController.current.abort();
      abortController.current = null;
    }
    setState(prev => ({
      ...prev,
      isProcessing: false,
      currentPhase: 'idle',
    }));
  }, []);

  // Process a query with agentic loop
  const processQuery = useCallback(async (
    query: string,
    callbacks?: {
      onToolStart?: (name: string, input: unknown) => void;
      onToolEnd?: (name: string, result: string) => void;
      onStream?: (text: string) => void;
    }
  ): Promise<string> => {
    // Reset state
    setState({
      isProcessing: true,
      currentPhase: 'thinking',
      toolExecutions: [],
      streamingText: '',
      finalAnswer: '',
      error: null,
    });

    abortController.current = new AbortController();

    // Add user message
    conversationHistory.current.push({
      role: 'user',
      content: query,
    });

    let iterations = 0;
    let finalResponse = '';

    try {
      const tools = getAnthropicTools();

      while (iterations < maxIterations) {
        iterations++;

        // Check for abort
        if (abortController.current?.signal.aborted) {
          throw new Error('Cancelled');
        }

        // Make API call with streaming
        setState(prev => ({ ...prev, currentPhase: 'thinking' }));

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

        for await (const event of stream) {
          if (abortController.current?.signal.aborted) {
            throw new Error('Cancelled');
          }

          if (event.type === 'content_block_start') {
            if (event.content_block.type === 'text') {
              setState(prev => ({ ...prev, currentPhase: 'responding' }));
            } else if (event.content_block.type === 'tool_use') {
              setState(prev => ({ ...prev, currentPhase: 'tool_use' }));
            }
          }

          if (event.type === 'content_block_delta') {
            if (event.delta.type === 'text_delta') {
              streamedText += event.delta.text;
              setState(prev => ({ ...prev, streamingText: streamedText }));
              callbacks?.onStream?.(event.delta.text);
            }
          }
        }

        // Get final message
        const response = await stream.finalMessage();
        responseContent = response.content;

        // Add assistant response to history
        conversationHistory.current.push({
          role: 'assistant',
          content: responseContent,
        });

        // Check for tool calls
        const toolUseBlocks = responseContent.filter(
          (block): block is ToolUseBlock => block.type === 'tool_use'
        );

        // Extract text response
        const textBlocks = responseContent.filter(
          (block): block is TextBlock => block.type === 'text'
        );

        if (textBlocks.length > 0) {
          finalResponse = textBlocks.map(b => b.text).join('\n');
        }

        // If no tool calls, we're done
        if (toolUseBlocks.length === 0 || response.stop_reason === 'end_turn') {
          break;
        }

        // Execute tool calls
        setState(prev => ({ ...prev, currentPhase: 'tool_use' }));

        const toolResults: ToolResultBlockParam[] = [];

        for (const toolUse of toolUseBlocks) {
          const toolExecution: ToolExecution = {
            id: toolUse.id,
            name: toolUse.name,
            input: toolUse.input,
            status: 'running',
          };

          // Add to state
          setState(prev => ({
            ...prev,
            toolExecutions: [...prev.toolExecutions, toolExecution],
          }));

          callbacks?.onToolStart?.(toolUse.name, toolUse.input);

          try {
            const result = await executeTool(toolUse.name, toolUse.input as Record<string, unknown>);

            // Update state
            setState(prev => ({
              ...prev,
              toolExecutions: prev.toolExecutions.map(t =>
                t.id === toolUse.id ? { ...t, status: 'completed', result } : t
              ),
            }));

            callbacks?.onToolEnd?.(toolUse.name, result);

            toolResults.push({
              type: 'tool_result',
              tool_use_id: toolUse.id,
              content: result,
            });
          } catch (error) {
            const errorMsg = error instanceof Error ? error.message : 'Unknown error';

            setState(prev => ({
              ...prev,
              toolExecutions: prev.toolExecutions.map(t =>
                t.id === toolUse.id ? { ...t, status: 'error', error: errorMsg } : t
              ),
            }));

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

      // Done
      setState(prev => ({
        ...prev,
        isProcessing: false,
        currentPhase: 'idle',
        finalAnswer: finalResponse,
      }));

      return finalResponse;

    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      setState(prev => ({
        ...prev,
        isProcessing: false,
        currentPhase: 'idle',
        error: errorMsg,
      }));
      throw error;
    }
  }, [model, systemPrompt, maxIterations]);

  return {
    state,
    processQuery,
    cancel,
    clearConversation,
    conversationHistory: conversationHistory.current,
  };
}
