// Updated: 2026-01-12 00:25:00
// Eames Design Agent - Native Claude Agent Mode
// Uses direct Anthropic SDK for Claude Code-like behavior

import { ClaudeNative, NativeTool, createClaudeAgent } from '../model/claude-native.js';
import { TOOLS } from '../tools/index.js';
import { DEFAULT_SYSTEM_PROMPT } from './prompts.js';
import { z } from 'zod';

/**
 * Convert Zod schema to JSON Schema for native tools
 */
function zodToJsonSchema(schema: any): Record<string, unknown> {
  // Handle ZodObject
  if (schema && schema._def && schema._def.typeName === 'ZodObject') {
    const shape = schema.shape || {};
    const properties: Record<string, unknown> = {};
    const required: string[] = [];

    for (const [key, value] of Object.entries(shape)) {
      const zodValue = value as any;
      properties[key] = zodFieldToSchema(zodValue);

      // Check if required (not optional)
      if (!(zodValue?._def?.typeName === 'ZodOptional')) {
        required.push(key);
      }
    }

    return {
      type: 'object',
      properties,
      required: required.length > 0 ? required : undefined,
    };
  }

  return { type: 'object', properties: {} };
}

function zodFieldToSchema(field: any): Record<string, unknown> {
  if (!field || !field._def) return { type: 'string' };

  const typeName = field._def.typeName;

  // Handle optional
  if (typeName === 'ZodOptional') {
    return zodFieldToSchema(field._def.innerType);
  }

  // Handle string
  if (typeName === 'ZodString') {
    const schema: Record<string, unknown> = { type: 'string' };
    if (field.description) schema.description = field.description;
    return schema;
  }

  // Handle number
  if (typeName === 'ZodNumber') {
    const schema: Record<string, unknown> = { type: 'number' };
    if (field.description) schema.description = field.description;
    return schema;
  }

  // Handle boolean
  if (typeName === 'ZodBoolean') {
    const schema: Record<string, unknown> = { type: 'boolean' };
    if (field.description) schema.description = field.description;
    return schema;
  }

  // Handle array
  if (typeName === 'ZodArray') {
    return {
      type: 'array',
      items: zodFieldToSchema(field._def.type),
      description: field.description,
    };
  }

  // Handle enum
  if (typeName === 'ZodEnum') {
    const enumValues = Object.values(field._def.values || {});
    return {
      type: 'string',
      enum: enumValues,
      description: field.description,
    };
  }

  // Default to string
  return { type: 'string' };
}

/**
 * Convert LangChain tools to native Claude tools
 */
export function convertToolsToNative(): NativeTool[] {
  const nativeTools: NativeTool[] = [];

  for (const tool of TOOLS) {
    try {
      // Get the schema from the tool
      const schema = (tool as any).schema;
      const jsonSchema = schema ? zodToJsonSchema(schema) : { type: 'object', properties: {} };

      nativeTools.push({
        name: tool.name,
        description: tool.description,
        input_schema: jsonSchema as NativeTool['input_schema'],
        handler: async (input: Record<string, unknown>) => {
          try {
            const result = await tool.invoke(input);
            return typeof result === 'string' ? result : JSON.stringify(result);
          } catch (error) {
            return JSON.stringify({
              success: false,
              error: error instanceof Error ? error.message : 'Unknown error',
            });
          }
        },
      });
    } catch (error) {
      console.error(`Failed to convert tool ${tool.name}:`, error);
    }
  }

  return nativeTools;
}

/**
 * Create a Claude Code-like Eames agent
 */
export function createEamesNativeAgent(): ClaudeNative {
  const nativeTools = convertToolsToNative();

  return createClaudeAgent({
    model: 'claude-sonnet-4.5',
    systemPrompt: DEFAULT_SYSTEM_PROMPT,
    tools: nativeTools,
  });
}

/**
 * Run Eames in native Claude mode
 */
export async function runNativeEames(
  query: string,
  options: {
    onToolCall?: (name: string, input: unknown) => void;
    onToolResult?: (name: string, result: string) => void;
    onThinking?: (text: string) => void;
    maxIterations?: number;
  } = {}
): Promise<string> {
  const agent = createEamesNativeAgent();

  return agent.agentLoop(query, {
    maxIterations: options.maxIterations || 15,
    onToolCall: options.onToolCall || ((name, input) => {
      console.log(`\n🔧 Tool: ${name}`);
      console.log(`   Input: ${JSON.stringify(input).slice(0, 100)}...`);
    }),
    onToolResult: options.onToolResult || ((name, result) => {
      console.log(`   ✓ ${name} completed`);
    }),
    onThinking: options.onThinking,
  });
}

/**
 * Run Eames with extended thinking (deep reasoning mode)
 */
export async function runDeepThinkingEames(
  query: string,
  options: {
    budgetTokens?: number;
    onThinking?: (thought: string) => void;
  } = {}
): Promise<{ thinking: string; response: string }> {
  const agent = createEamesNativeAgent();

  return agent.thinkDeep(query, {
    budgetTokens: options.budgetTokens || 10000,
    onThinking: options.onThinking || ((thought) => {
      console.log('\n💭 Thinking...');
      console.log(thought.slice(0, 500) + '...');
    }),
  });
}

/**
 * Analyze a design image with Eames
 */
export async function analyzeDesignImage(
  imageUrl: string,
  prompt?: string
): Promise<string> {
  const agent = createEamesNativeAgent();

  const designPrompt = prompt || `As a product design expert, analyze this UI/UX design:
1. Visual hierarchy and layout
2. Color scheme and typography
3. Usability and accessibility concerns
4. Suggestions for improvement
5. Similar patterns from successful products`;

  return agent.analyzeImage(imageUrl, designPrompt);
}
