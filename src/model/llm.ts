// Updated: 2026-02-16
import { ChatOpenAI } from '@langchain/openai';
import { ChatAnthropic } from '@langchain/anthropic';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { ChatOllama } from '@langchain/ollama';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { BaseChatModel } from '@langchain/core/language_models/chat_models';
import { StructuredToolInterface } from '@langchain/core/tools';
import { Runnable } from '@langchain/core/runnables';
import { z } from 'zod';
import { DEFAULT_SYSTEM_PROMPT } from '../shared/prompts.js';

export const DEFAULT_PROVIDER = 'anthropic';
export const DEFAULT_MODEL = 'claude-sonnet-4-5-20250929';

/** Fallback model when Anthropic fails (billing, 403) */
export const FALLBACK_OPENAI_MODEL = 'gpt-4o';

/** Small/fast model for tool selection - matches user's provider to avoid cross-provider 401s */
export function getToolSelectionModel(userModel: string): string {
  if (userModel.startsWith('claude-')) return 'claude-3-5-haiku-20241022';
  if (userModel.startsWith('gpt-')) return 'gpt-4o-mini';
  if (userModel.startsWith('gemini-')) return 'gemini-1.5-flash';
  if (userModel.startsWith('ollama:')) return userModel;
  return canFallbackToOpenAI() ? 'gpt-4o-mini' : 'claude-3-5-haiku-20241022';
}

/** Check if error warrants fallback to OpenAI */
function isAnthropicUnavailableError(error: unknown): boolean {
  const msg = String((error as { message?: string })?.message ?? error ?? '');
  const status = (error as { status?: number })?.status;
  return (
    status === 400 ||
    status === 401 ||
    status === 403 ||
    /credit balance is too low/i.test(msg) ||
    /invalid x-api-key/i.test(msg) ||
    /authentication_error|Forbidden|403|401/i.test(msg)
  );
}

/** True if OpenAI can be used as fallback */
export function canFallbackToOpenAI(): boolean {
  const key = process.env.OPENAI_API_KEY;
  return Boolean(key && key.trim() && !key.trim().startsWith('your-'));
}

// Generic retry helper with exponential backoff
async function withRetry<T>(fn: () => Promise<T>, maxAttempts = 3): Promise<T> {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (e) {
      if (attempt === maxAttempts - 1) throw e;
      await new Promise((r) => setTimeout(r, 500 * 2 ** attempt));
    }
  }
  throw new Error('Unreachable');
}

// Model provider configuration
interface ModelOpts {
  streaming: boolean;
}

type ModelFactory = (name: string, opts: ModelOpts) => BaseChatModel;

function getApiKey(envVar: string, providerName: string): string {
  const apiKey = process.env[envVar];
  if (!apiKey) {
    throw new Error(`${envVar} not found in environment variables`);
  }
  return apiKey;
}

const MODEL_PROVIDERS: Record<string, ModelFactory> = {
  'claude-': (name, opts) =>
    new ChatAnthropic({
      model: name,
      ...opts,
      apiKey: getApiKey('ANTHROPIC_API_KEY', 'Anthropic'),
    }),
  'gpt-': (name, opts) =>
    new ChatOpenAI({
      model: name,
      ...opts,
      apiKey: getApiKey('OPENAI_API_KEY', 'OpenAI'),
    }),
  'gemini-': (name, opts) =>
    new ChatGoogleGenerativeAI({
      model: name,
      ...opts,
      apiKey: getApiKey('GOOGLE_API_KEY', 'Google'),
    }),
  'ollama:': (name, opts) =>
    new ChatOllama({
      model: name.replace(/^ollama:/, ''),
      ...opts,
      ...(process.env.OLLAMA_BASE_URL ? { baseUrl: process.env.OLLAMA_BASE_URL } : {}),
    }),
};

const DEFAULT_MODEL_FACTORY: ModelFactory = (name, opts) =>
  new ChatOpenAI({
    model: name,
    ...opts,
    apiKey: process.env.OPENAI_API_KEY,
  });

export function getChatModel(
  modelName: string = DEFAULT_MODEL,
  streaming: boolean = false
): BaseChatModel {
  const opts: ModelOpts = { streaming };
  const prefix = Object.keys(MODEL_PROVIDERS).find((p) => modelName.startsWith(p));
  const factory = prefix ? MODEL_PROVIDERS[prefix] : DEFAULT_MODEL_FACTORY;
  return factory(modelName, opts);
}

interface CallLlmOptions {
  model?: string;
  systemPrompt?: string;
  outputSchema?: z.ZodType<unknown>;
  tools?: StructuredToolInterface[];
}

export async function callLlm(prompt: string, options: CallLlmOptions = {}): Promise<unknown> {
  const { model = DEFAULT_MODEL, systemPrompt, outputSchema, tools } = options;
  const finalSystemPrompt = systemPrompt || DEFAULT_SYSTEM_PROMPT;

  const promptTemplate = ChatPromptTemplate.fromMessages([
    ['system', finalSystemPrompt],
    ['user', '{prompt}'],
  ]);

  const runWithModel = async (m: string) => {
    const llm = getChatModel(m, false);
    let runnable: Runnable<any, any> = llm;
    if (outputSchema) {
      runnable = llm.withStructuredOutput(outputSchema);
    } else if (tools && tools.length > 0 && llm.bindTools) {
      runnable = llm.bindTools(tools);
    }
    const chain = promptTemplate.pipe(runnable);
    return withRetry(() => chain.invoke({ prompt }));
  };

  try {
    const result = await runWithModel(model);
    if (!outputSchema && !tools && result && typeof result === 'object' && 'content' in result) {
      return (result as { content: string }).content;
    }
    return result;
  } catch (err) {
    if (
      isAnthropicUnavailableError(err) &&
      canFallbackToOpenAI() &&
      model.startsWith('claude-')
    ) {
      const result = await runWithModel(FALLBACK_OPENAI_MODEL);
      if (!outputSchema && !tools && result && typeof result === 'object' && 'content' in result) {
        return (result as { content: string }).content;
      }
      return result;
    }
    throw err;
  }
}

export async function* callLlmStream(
  prompt: string,
  options: { model?: string; systemPrompt?: string } = {}
): AsyncGenerator<string> {
  const { model = DEFAULT_MODEL, systemPrompt } = options;
  const finalSystemPrompt = systemPrompt || DEFAULT_SYSTEM_PROMPT;

  const promptTemplate = ChatPromptTemplate.fromMessages([
    ['system', finalSystemPrompt],
    ['user', '{prompt}'],
  ]);

  const streamWithModel = async function* (m: string) {
    const llm = getChatModel(m, true);
    const chain = promptTemplate.pipe(llm);
    const stream = await chain.stream({ prompt });
    for await (const chunk of stream) {
      if (chunk && typeof chunk === 'object' && 'content' in chunk) {
        const content = chunk.content;
        if (content && typeof content === 'string') {
          yield content;
        }
      }
    }
  };

  try {
    for await (const chunk of streamWithModel(model)) {
      yield chunk;
    }
  } catch (e) {
    if (
      isAnthropicUnavailableError(e) &&
      canFallbackToOpenAI() &&
      model.startsWith('claude-')
    ) {
      for await (const chunk of streamWithModel(FALLBACK_OPENAI_MODEL)) {
        yield chunk;
      }
    } else {
      throw e;
    }
  }
}
