// Updated: 2026-01-12 02:25:00
// Eames Design Agent - Context Manager
// Claude Code-like auto-compact and context window management

import type { MessageParam } from '@anthropic-ai/sdk/resources/messages';
import { estimateTokens } from './cost-tracking.js';

/**
 * Model context limits
 */
const CONTEXT_LIMITS: Record<string, number> = {
  'claude-opus-4-20250514': 200000,
  'claude-sonnet-4-20250514': 200000,
  'claude-sonnet-4-5-20250929': 200000,
  'claude-3-5-haiku-20241022': 200000,
  'gpt-5.2': 128000,
  'gpt-4.1': 128000,
  'default': 200000,
};

/**
 * Get context limit for a model
 */
export function getContextLimit(model: string): number {
  return CONTEXT_LIMITS[model] || CONTEXT_LIMITS['default'];
}

/**
 * Context usage info
 */
export interface ContextUsage {
  usedTokens: number;
  maxTokens: number;
  usagePercent: number;
  remainingTokens: number;
  shouldCompact: boolean;
  shouldWarn: boolean;
}

/**
 * Estimate tokens in a message
 */
export function estimateMessageTokens(message: MessageParam): number {
  if (typeof message.content === 'string') {
    return estimateTokens(message.content);
  }

  // Array of content blocks
  let total = 0;
  for (const block of message.content) {
    if (block.type === 'text') {
      total += estimateTokens(block.text);
    } else if (block.type === 'tool_use') {
      total += estimateTokens(JSON.stringify(block.input));
      total += estimateTokens(block.name);
    } else if (block.type === 'tool_result') {
      if (typeof block.content === 'string') {
        total += estimateTokens(block.content);
      }
    }
  }
  return total;
}

/**
 * Estimate total tokens in conversation history
 */
export function estimateConversationTokens(messages: MessageParam[]): number {
  return messages.reduce((total, msg) => total + estimateMessageTokens(msg), 0);
}

/**
 * Get context usage for a conversation
 */
export function getContextUsage(messages: MessageParam[], model: string): ContextUsage {
  const usedTokens = estimateConversationTokens(messages);
  const maxTokens = getContextLimit(model);
  const usagePercent = Math.round((usedTokens / maxTokens) * 100);
  const remainingTokens = maxTokens - usedTokens;

  return {
    usedTokens,
    maxTokens,
    usagePercent,
    remainingTokens,
    shouldCompact: usagePercent >= 80,
    shouldWarn: usagePercent >= 70,
  };
}

/**
 * Summarize a conversation for compaction
 */
export function summarizeConversation(messages: MessageParam[]): string {
  const topics: string[] = [];
  const toolsUsed: Set<string> = new Set();
  const filesModified: Set<string> = new Set();

  for (const message of messages) {
    if (typeof message.content === 'string') {
      // Extract key topics from user messages
      if (message.role === 'user' && message.content.length > 20) {
        const firstLine = message.content.split('\n')[0].slice(0, 100);
        topics.push(firstLine);
      }
    } else if (Array.isArray(message.content)) {
      for (const block of message.content) {
        if (block.type === 'tool_use') {
          toolsUsed.add(block.name);
          // Extract file paths from tool inputs
          const input = block.input as Record<string, unknown>;
          if (input.file_path) filesModified.add(String(input.file_path));
          if (input.path) filesModified.add(String(input.path));
        }
      }
    }
  }

  const parts: string[] = ['[Previous conversation summary]'];

  if (topics.length > 0) {
    parts.push(`Topics discussed: ${topics.slice(0, 5).join('; ')}`);
  }

  if (toolsUsed.size > 0) {
    parts.push(`Tools used: ${Array.from(toolsUsed).join(', ')}`);
  }

  if (filesModified.size > 0) {
    parts.push(`Files modified: ${Array.from(filesModified).slice(0, 10).join(', ')}`);
  }

  parts.push(`Original messages: ${messages.length}`);

  return parts.join('\n');
}

/**
 * Compact a conversation by summarizing older messages
 */
export function compactConversation(
  messages: MessageParam[],
  keepRecentCount: number = 10
): MessageParam[] {
  if (messages.length <= keepRecentCount) {
    return messages;
  }

  const oldMessages = messages.slice(0, -keepRecentCount);
  const recentMessages = messages.slice(-keepRecentCount);

  const summary = summarizeConversation(oldMessages);

  return [
    { role: 'user', content: '[System: Previous context compacted]' },
    { role: 'assistant', content: summary },
    ...recentMessages,
  ];
}

/**
 * Auto-compact if needed
 */
export function autoCompactIfNeeded(
  messages: MessageParam[],
  model: string,
  keepRecentCount: number = 10
): { messages: MessageParam[]; wasCompacted: boolean } {
  const usage = getContextUsage(messages, model);

  if (usage.shouldCompact) {
    return {
      messages: compactConversation(messages, keepRecentCount),
      wasCompacted: true,
    };
  }

  return {
    messages,
    wasCompacted: false,
  };
}

/**
 * Get a formatted context usage bar
 */
export function getContextUsageBar(usage: ContextUsage, width: number = 20): string {
  const filled = Math.round((usage.usagePercent / 100) * width);
  const empty = width - filled;

  let bar = '';
  let color = '🟢';

  if (usage.usagePercent >= 80) {
    color = '🔴';
  } else if (usage.usagePercent >= 70) {
    color = '🟡';
  }

  bar = `${color} [${'█'.repeat(filled)}${'░'.repeat(empty)}] ${usage.usagePercent}%`;

  return bar;
}

/**
 * Get context usage summary string
 */
export function getContextSummary(messages: MessageParam[], model: string): string {
  const usage = getContextUsage(messages, model);
  const bar = getContextUsageBar(usage);

  let status = '';
  if (usage.shouldCompact) {
    status = ' (auto-compact recommended)';
  } else if (usage.shouldWarn) {
    status = ' (approaching limit)';
  }

  return `Context: ${bar}${status}`;
}

/**
 * Truncate tool output to save context
 */
export function truncateToolOutput(output: string, maxLength: number = 2000): string {
  if (output.length <= maxLength) {
    return output;
  }

  const halfLength = Math.floor(maxLength / 2) - 20;
  return `${output.slice(0, halfLength)}\n\n... [${output.length - maxLength} chars truncated] ...\n\n${output.slice(-halfLength)}`;
}

/**
 * Optimize messages by truncating large tool outputs
 */
export function optimizeMessages(messages: MessageParam[]): MessageParam[] {
  return messages.map(message => {
    if (typeof message.content === 'string') {
      return message;
    }

    const optimizedContent = message.content.map(block => {
      if (block.type === 'tool_result' && typeof block.content === 'string') {
        return {
          ...block,
          content: truncateToolOutput(block.content),
        };
      }
      return block;
    });

    return {
      ...message,
      content: optimizedContent,
    };
  });
}
