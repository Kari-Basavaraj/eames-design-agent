// Updated: 2026-02-16
// SDK env for OpenRouter (OpenAI/Google models) - per openrouter.ai/docs/guides/claude-code-integration

/**
 * Build env for Claude Agent SDK when using OpenRouter (openai/, google/ models).
 * OpenRouter requires: ANTHROPIC_BASE_URL, ANTHROPIC_AUTH_TOKEN (OpenRouter key), ANTHROPIC_API_KEY=""
 * Returns undefined for Anthropic models (uses process.env as-is).
 */
export function buildSdkEnvForModel(model: string): Record<string, string> | undefined {
  const useOpenRouter = model.startsWith('openai/') || model.startsWith('google/');
  const openRouterKey = process.env.OPENROUTER_API_KEY;
  if (!useOpenRouter || !openRouterKey) return undefined;
  return {
    ...process.env,
    ANTHROPIC_BASE_URL: 'https://openrouter.ai/api',
    ANTHROPIC_AUTH_TOKEN: openRouterKey,
    ANTHROPIC_API_KEY: '', // Required: must be empty per OpenRouter docs
  } as Record<string, string>;
}

/** True if model requires OpenRouter and OPENROUTER_API_KEY is missing. */
export function isOpenRouterKeyMissing(model: string): boolean {
  const useOpenRouter = model.startsWith('openai/') || model.startsWith('google/');
  return useOpenRouter && !process.env.OPENROUTER_API_KEY;
}
