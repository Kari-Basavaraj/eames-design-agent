// Updated: 2026-01-12 00:20:00
// Eames Design Agent - Model Layer
// Unified interface for LangChain and Native Claude SDK

// Re-export LangChain interface (existing)
export {
  getChatModel,
  callLlm,
  callLlmStream,
  DEFAULT_PROVIDER,
  DEFAULT_MODEL,
} from './llm.js';

// Re-export Native Claude interface (new)
export {
  ClaudeNative,
  createClaudeAgent,
  langchainToNativeTool,
  claude,
  CLAUDE_MODELS,
  type ClaudeModel,
  type NativeTool,
} from './claude-native.js';

// Export a unified interface
export type ModelBackend = 'langchain' | 'native';

/**
 * Get the recommended backend for a task
 */
export function getRecommendedBackend(task: string): ModelBackend {
  // Use native for Claude Code-like features
  const nativeFeatures = [
    'extended thinking',
    'deep reasoning',
    'vision',
    'image analysis',
    'agentic loop',
    'tool use',
  ];

  const lowerTask = task.toLowerCase();
  if (nativeFeatures.some(f => lowerTask.includes(f))) {
    return 'native';
  }

  // Default to LangChain for multi-provider flexibility
  return 'langchain';
}
