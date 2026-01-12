// Updated: 2026-01-12 00:15:00
// Eames Design Agent - Native Claude SDK Integration
// Claude Code-like features using direct Anthropic SDK

import Anthropic from '@anthropic-ai/sdk';
import type {
  MessageParam,
  ContentBlock,
  ToolUseBlock,
  TextBlock,
  Tool,
  ToolResultBlockParam,
} from '@anthropic-ai/sdk/resources/messages';

// Initialize native Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Available Claude models
export const CLAUDE_MODELS = {
  'claude-opus-4': 'claude-opus-4-20250514',
  'claude-sonnet-4': 'claude-sonnet-4-20250514',
  'claude-sonnet-4.5': 'claude-sonnet-4-5-20250929',
  'claude-haiku-3.5': 'claude-3-5-haiku-20241022',
} as const;

export type ClaudeModel = keyof typeof CLAUDE_MODELS;

// Tool definition type for native SDK
export interface NativeTool {
  name: string;
  description: string;
  input_schema: {
    type: 'object';
    properties: Record<string, unknown>;
    required?: string[];
  };
  handler: (input: Record<string, unknown>) => Promise<string>;
}

/**
 * Native Claude client with Claude Code-like capabilities
 */
export class ClaudeNative {
  private model: string;
  private tools: NativeTool[] = [];
  private conversationHistory: MessageParam[] = [];
  private systemPrompt: string = '';

  constructor(model: ClaudeModel = 'claude-sonnet-4.5') {
    this.model = CLAUDE_MODELS[model];
  }

  /**
   * Set the system prompt
   */
  setSystemPrompt(prompt: string): this {
    this.systemPrompt = prompt;
    return this;
  }

  /**
   * Register tools for the agent
   */
  registerTools(tools: NativeTool[]): this {
    this.tools = tools;
    return this;
  }

  /**
   * Clear conversation history
   */
  clearHistory(): this {
    this.conversationHistory = [];
    return this;
  }

  /**
   * Convert native tools to Anthropic format
   */
  private getAnthropicTools(): Tool[] {
    return this.tools.map(tool => ({
      name: tool.name,
      description: tool.description,
      input_schema: tool.input_schema as Tool['input_schema'],
    }));
  }

  /**
   * Simple message (no tools, no streaming)
   */
  async message(userMessage: string): Promise<string> {
    const response = await anthropic.messages.create({
      model: this.model,
      max_tokens: 4096,
      system: this.systemPrompt || undefined,
      messages: [{ role: 'user', content: userMessage }],
    });

    const textBlock = response.content.find((block): block is TextBlock => block.type === 'text');
    return textBlock?.text || '';
  }

  /**
   * Streaming message
   */
  async *messageStream(userMessage: string): AsyncGenerator<string> {
    const stream = anthropic.messages.stream({
      model: this.model,
      max_tokens: 4096,
      system: this.systemPrompt || undefined,
      messages: [{ role: 'user', content: userMessage }],
    });

    for await (const event of stream) {
      if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
        yield event.delta.text;
      }
    }
  }

  /**
   * Agentic loop with tool use (Claude Code-like)
   * Automatically handles tool calls and continues until complete
   */
  async agentLoop(
    userMessage: string,
    options: {
      maxIterations?: number;
      onToolCall?: (name: string, input: unknown) => void;
      onToolResult?: (name: string, result: string) => void;
      onThinking?: (text: string) => void;
    } = {}
  ): Promise<string> {
    const { maxIterations = 10, onToolCall, onToolResult, onThinking } = options;

    // Add user message to history
    this.conversationHistory.push({
      role: 'user',
      content: userMessage,
    });

    let iterations = 0;
    let finalResponse = '';

    while (iterations < maxIterations) {
      iterations++;

      // Make API call
      const response = await anthropic.messages.create({
        model: this.model,
        max_tokens: 8192,
        system: this.systemPrompt || undefined,
        messages: this.conversationHistory,
        tools: this.tools.length > 0 ? this.getAnthropicTools() : undefined,
      });

      // Add assistant response to history
      this.conversationHistory.push({
        role: 'assistant',
        content: response.content,
      });

      // Check if we need to handle tool calls
      const toolUseBlocks = response.content.filter(
        (block): block is ToolUseBlock => block.type === 'tool_use'
      );

      // Extract any text response
      const textBlocks = response.content.filter(
        (block): block is TextBlock => block.type === 'text'
      );

      if (textBlocks.length > 0) {
        const text = textBlocks.map(b => b.text).join('\n');
        if (onThinking) onThinking(text);
        finalResponse = text;
      }

      // If no tool calls, we're done
      if (toolUseBlocks.length === 0 || response.stop_reason === 'end_turn') {
        break;
      }

      // Execute tool calls
      const toolResults: ToolResultBlockParam[] = [];

      for (const toolUse of toolUseBlocks) {
        const tool = this.tools.find(t => t.name === toolUse.name);

        if (onToolCall) onToolCall(toolUse.name, toolUse.input);

        if (tool) {
          try {
            const result = await tool.handler(toolUse.input as Record<string, unknown>);
            if (onToolResult) onToolResult(toolUse.name, result);

            toolResults.push({
              type: 'tool_result',
              tool_use_id: toolUse.id,
              content: result,
            });
          } catch (error) {
            const errorMsg = error instanceof Error ? error.message : 'Unknown error';
            toolResults.push({
              type: 'tool_result',
              tool_use_id: toolUse.id,
              content: `Error: ${errorMsg}`,
              is_error: true,
            });
          }
        } else {
          toolResults.push({
            type: 'tool_result',
            tool_use_id: toolUse.id,
            content: `Tool not found: ${toolUse.name}`,
            is_error: true,
          });
        }
      }

      // Add tool results to history
      this.conversationHistory.push({
        role: 'user',
        content: toolResults,
      });
    }

    return finalResponse;
  }

  /**
   * Extended thinking mode (Claude Code-like deep reasoning)
   * Uses Claude's extended thinking capability for complex problems
   */
  async thinkDeep(
    userMessage: string,
    options: {
      budgetTokens?: number;
      onThinking?: (thought: string) => void;
    } = {}
  ): Promise<{ thinking: string; response: string }> {
    const { budgetTokens = 10000, onThinking } = options;

    // Extended thinking requires specific models and beta header
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929', // Extended thinking model
      max_tokens: 16000,
      thinking: {
        type: 'enabled',
        budget_tokens: budgetTokens,
      },
      messages: [{ role: 'user', content: userMessage }],
    } as any); // Type assertion needed for beta feature

    let thinking = '';
    let responseText = '';

    for (const block of response.content) {
      if (block.type === 'thinking') {
        thinking = (block as any).thinking;
        if (onThinking) onThinking(thinking);
      } else if (block.type === 'text') {
        responseText = (block as TextBlock).text;
      }
    }

    return { thinking, response: responseText };
  }

  /**
   * Vision capability - analyze images
   */
  async analyzeImage(
    imageUrl: string,
    prompt: string = 'Describe this image in detail.'
  ): Promise<string> {
    const response = await anthropic.messages.create({
      model: this.model,
      max_tokens: 4096,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'url',
                url: imageUrl,
              },
            },
            {
              type: 'text',
              text: prompt,
            },
          ],
        },
      ],
    });

    const textBlock = response.content.find((block): block is TextBlock => block.type === 'text');
    return textBlock?.text || '';
  }

  /**
   * Analyze base64 image
   */
  async analyzeImageBase64(
    base64Data: string,
    mediaType: 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp',
    prompt: string = 'Describe this image in detail.'
  ): Promise<string> {
    const response = await anthropic.messages.create({
      model: this.model,
      max_tokens: 4096,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: mediaType,
                data: base64Data,
              },
            },
            {
              type: 'text',
              text: prompt,
            },
          ],
        },
      ],
    });

    const textBlock = response.content.find((block): block is TextBlock => block.type === 'text');
    return textBlock?.text || '';
  }
}

/**
 * Convert LangChain DynamicStructuredTool to NativeTool
 */
export function langchainToNativeTool(lcTool: {
  name: string;
  description: string;
  schema: { shape: Record<string, unknown> };
  func: (input: Record<string, unknown>) => Promise<string>;
}): NativeTool {
  // Extract schema properties from Zod
  const properties: Record<string, unknown> = {};
  const required: string[] = [];

  // This is a simplified conversion - in practice you'd need proper Zod parsing
  if (lcTool.schema && lcTool.schema.shape) {
    for (const [key, value] of Object.entries(lcTool.schema.shape)) {
      properties[key] = { type: 'string' }; // Simplified
      required.push(key);
    }
  }

  return {
    name: lcTool.name,
    description: lcTool.description,
    input_schema: {
      type: 'object',
      properties,
      required,
    },
    handler: lcTool.func,
  };
}

/**
 * Factory function to create a Claude Code-like agent
 */
export function createClaudeAgent(options: {
  model?: ClaudeModel;
  systemPrompt?: string;
  tools?: NativeTool[];
} = {}): ClaudeNative {
  const agent = new ClaudeNative(options.model);

  if (options.systemPrompt) {
    agent.setSystemPrompt(options.systemPrompt);
  }

  if (options.tools) {
    agent.registerTools(options.tools);
  }

  return agent;
}

// Export singleton for quick access
export const claude = new ClaudeNative();
