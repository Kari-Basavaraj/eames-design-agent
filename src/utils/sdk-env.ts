// Updated: 2026-02-16
// SDK env for OpenRouter (OpenAI/Google) vs Anthropic direct

/**
 * Build env for Claude Agent SDK when using OpenRouter (openai/, google/ models).
 * Returns undefined for Anthropic models (uses process.env as-is).
 */
export function buildSdkEnvForModel(model: string): Record<string, string> | undefined {
  const useOpenRouter = model.startsWith('openai/') || model.startsWith('google/');
  const openRouterKey = process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY;
  if (!useOpenRouter || !openRouterKey) return undefined;
  return {
    ...process.env,
    ANTHROPIC_BASE_URL: 'https://openrouter.ai/api',
    ANTHROPIC_AUTH_TOKEN: openRouterKey,
    ANTHROPIC_API_KEY: '',
  } as Record<string, string>;
}

/** True if model requires OpenRouter and key is missing. */
export function isOpenRouterKeyMissing(model: string): boolean {
  const useOpenRouter = model.startsWith('openai/') || model.startsWith('google/');
  const key = process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY;
  return useOpenRouter && !key;
}
