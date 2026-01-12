// Updated: 2026-01-12 02:45:00
// Eames Design Agent - Extended Thinking Mode
// Claude Code-like deep thinking/reasoning display

import type { MessageParam, ContentBlock } from '@anthropic-ai/sdk/resources/messages';

/**
 * Extended thinking configuration
 */
export interface ExtendedThinkingConfig {
  enabled: boolean;
  budgetTokens: number; // Max tokens for thinking
  showThinking: boolean; // Show thinking in UI
}

/**
 * Default thinking config
 */
export const DEFAULT_THINKING_CONFIG: ExtendedThinkingConfig = {
  enabled: false,
  budgetTokens: 10000,
  showThinking: true,
};

/**
 * Thinking block from Claude's response
 */
export interface ThinkingBlock {
  type: 'thinking';
  thinking: string;
}

/**
 * Check if a block is a thinking block
 */
export function isThinkingBlock(block: ContentBlock | ThinkingBlock): block is ThinkingBlock {
  return block.type === 'thinking' && 'thinking' in block;
}

/**
 * Extract thinking blocks from response content
 */
export function extractThinkingBlocks(content: (ContentBlock | ThinkingBlock)[]): ThinkingBlock[] {
  return content.filter(isThinkingBlock);
}

/**
 * Extract non-thinking blocks from response content
 */
export function extractNonThinkingBlocks(content: (ContentBlock | ThinkingBlock)[]): ContentBlock[] {
  return content.filter(block => !isThinkingBlock(block)) as ContentBlock[];
}

/**
 * Format thinking for display
 */
export function formatThinkingForDisplay(thinking: string, maxLength: number = 500): string {
  if (thinking.length <= maxLength) {
    return thinking;
  }

  // Truncate intelligently at sentence boundaries
  const truncated = thinking.slice(0, maxLength);
  const lastPeriod = truncated.lastIndexOf('.');
  const lastNewline = truncated.lastIndexOf('\n');
  const cutPoint = Math.max(lastPeriod, lastNewline);

  if (cutPoint > maxLength * 0.5) {
    return truncated.slice(0, cutPoint + 1) + '\n... [thinking truncated]';
  }

  return truncated + '... [thinking truncated]';
}

/**
 * Get thinking summary (first few sentences)
 */
export function getThinkingSummary(thinking: string): string {
  const sentences = thinking.split(/[.!?]+/).filter(s => s.trim());
  const summary = sentences.slice(0, 2).join('. ');
  return summary ? summary + '.' : 'Processing...';
}

/**
 * Thinking mode levels
 */
export type ThinkingLevel = 'none' | 'basic' | 'deep' | 'ultra';

/**
 * Get budget tokens for thinking level
 */
export function getThinkingBudget(level: ThinkingLevel): number {
  switch (level) {
    case 'none':
      return 0;
    case 'basic':
      return 4000;
    case 'deep':
      return 10000;
    case 'ultra':
      return 32000;
    default:
      return 0;
  }
}

/**
 * Parse thinking level from user input
 */
export function parseThinkingLevel(input: string): ThinkingLevel | null {
  const normalized = input.toLowerCase().trim();

  if (normalized.includes('--ultrathink') || normalized.includes('--ultra')) {
    return 'ultra';
  }
  if (normalized.includes('--think-hard') || normalized.includes('--deep')) {
    return 'deep';
  }
  if (normalized.includes('--think') || normalized.includes('--basic')) {
    return 'basic';
  }
  if (normalized.includes('--no-think')) {
    return 'none';
  }

  return null;
}

/**
 * Remove thinking flags from input
 */
export function removeThinkingFlags(input: string): string {
  return input
    .replace(/--ultrathink/gi, '')
    .replace(/--ultra/gi, '')
    .replace(/--think-hard/gi, '')
    .replace(/--deep/gi, '')
    .replace(/--think/gi, '')
    .replace(/--basic/gi, '')
    .replace(/--no-think/gi, '')
    .trim();
}

/**
 * Create API parameters for extended thinking
 */
export function createThinkingParams(config: ExtendedThinkingConfig): Record<string, unknown> | null {
  if (!config.enabled || config.budgetTokens <= 0) {
    return null;
  }

  return {
    thinking: {
      type: 'enabled',
      budget_tokens: config.budgetTokens,
    },
  };
}

/**
 * Thinking state for UI
 */
export interface ThinkingState {
  isThinking: boolean;
  currentThinking: string;
  thinkingHistory: string[];
  totalThinkingTokens: number;
}

/**
 * Create initial thinking state
 */
export function createThinkingState(): ThinkingState {
  return {
    isThinking: false,
    currentThinking: '',
    thinkingHistory: [],
    totalThinkingTokens: 0,
  };
}

/**
 * Update thinking state with new thinking block
 */
export function updateThinkingState(
  state: ThinkingState,
  thinking: string,
  tokens: number = 0
): ThinkingState {
  return {
    isThinking: true,
    currentThinking: thinking,
    thinkingHistory: [...state.thinkingHistory, thinking],
    totalThinkingTokens: state.totalThinkingTokens + tokens,
  };
}

/**
 * Finalize thinking state
 */
export function finalizeThinkingState(state: ThinkingState): ThinkingState {
  return {
    ...state,
    isThinking: false,
  };
}

/**
 * Format thinking indicator for terminal
 */
export function formatThinkingIndicator(level: ThinkingLevel): string {
  switch (level) {
    case 'ultra':
      return '🧠💭💭💭 Ultra-thinking...';
    case 'deep':
      return '🧠💭💭 Deep thinking...';
    case 'basic':
      return '🧠💭 Thinking...';
    default:
      return '';
  }
}

/**
 * Check if model supports extended thinking
 */
export function supportsExtendedThinking(model: string): boolean {
  // Claude 3.5+ models support extended thinking
  return model.includes('claude-3') ||
         model.includes('claude-opus') ||
         model.includes('claude-sonnet');
}
