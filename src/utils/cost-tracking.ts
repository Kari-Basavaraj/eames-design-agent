// Updated: 2026-01-12 02:05:00
// Eames Design Agent - Cost & Token Tracking
// Claude Code-like usage tracking and display

import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

const EAMES_DIR = join(homedir(), '.eames');
const USAGE_FILE = join(EAMES_DIR, 'usage.json');

/**
 * Pricing per 1M tokens (as of 2025)
 */
const PRICING: Record<string, { input: number; output: number }> = {
  'claude-opus-4-20250514': { input: 15.0, output: 75.0 },
  'claude-sonnet-4-20250514': { input: 3.0, output: 15.0 },
  'claude-sonnet-4-5-20250929': { input: 3.0, output: 15.0 },
  'claude-3-5-haiku-20241022': { input: 0.25, output: 1.25 },
  // Fallback for unknown models
  'default': { input: 3.0, output: 15.0 },
};

/**
 * Token usage for a single API call
 */
export interface TokenUsage {
  inputTokens: number;
  outputTokens: number;
  cacheCreationTokens?: number;
  cacheReadTokens?: number;
}

/**
 * Session usage statistics
 */
export interface SessionUsage {
  totalInputTokens: number;
  totalOutputTokens: number;
  totalCacheCreationTokens: number;
  totalCacheReadTokens: number;
  apiCalls: number;
  estimatedCost: number;
  startTime: number;
  model: string;
}

/**
 * Historical usage data
 */
export interface UsageHistory {
  daily: Record<string, SessionUsage>;
  allTime: {
    totalInputTokens: number;
    totalOutputTokens: number;
    totalCost: number;
    totalApiCalls: number;
  };
}

// Current session state
let currentSession: SessionUsage = {
  totalInputTokens: 0,
  totalOutputTokens: 0,
  totalCacheCreationTokens: 0,
  totalCacheReadTokens: 0,
  apiCalls: 0,
  estimatedCost: 0,
  startTime: Date.now(),
  model: 'claude-sonnet-4-5-20250929',
};

/**
 * Get pricing for a model
 */
function getPricing(model: string): { input: number; output: number } {
  return PRICING[model] || PRICING['default'];
}

/**
 * Calculate cost for token usage
 */
export function calculateCost(usage: TokenUsage, model: string): number {
  const pricing = getPricing(model);
  const inputCost = (usage.inputTokens / 1_000_000) * pricing.input;
  const outputCost = (usage.outputTokens / 1_000_000) * pricing.output;
  return inputCost + outputCost;
}

/**
 * Set the model for current session
 */
export function setSessionModel(model: string): void {
  currentSession.model = model;
}

/**
 * Track token usage from an API response
 */
export function trackUsage(usage: TokenUsage): void {
  currentSession.totalInputTokens += usage.inputTokens;
  currentSession.totalOutputTokens += usage.outputTokens;
  currentSession.totalCacheCreationTokens += usage.cacheCreationTokens || 0;
  currentSession.totalCacheReadTokens += usage.cacheReadTokens || 0;
  currentSession.apiCalls += 1;
  currentSession.estimatedCost += calculateCost(usage, currentSession.model);
}

/**
 * Get current session usage
 */
export function getSessionUsage(): SessionUsage {
  return { ...currentSession };
}

/**
 * Reset session usage
 */
export function resetSessionUsage(): void {
  currentSession = {
    totalInputTokens: 0,
    totalOutputTokens: 0,
    totalCacheCreationTokens: 0,
    totalCacheReadTokens: 0,
    apiCalls: 0,
    estimatedCost: 0,
    startTime: Date.now(),
    model: currentSession.model,
  };
}

/**
 * Format token count for display
 */
export function formatTokens(tokens: number): string {
  if (tokens >= 1_000_000) {
    return `${(tokens / 1_000_000).toFixed(2)}M`;
  }
  if (tokens >= 1_000) {
    return `${(tokens / 1_000).toFixed(1)}K`;
  }
  return tokens.toString();
}

/**
 * Format cost for display
 */
export function formatCost(cost: number): string {
  if (cost < 0.01) {
    return `$${cost.toFixed(4)}`;
  }
  return `$${cost.toFixed(2)}`;
}

/**
 * Get a summary string for the status bar
 */
export function getUsageSummary(): string {
  const usage = getSessionUsage();
  const totalTokens = usage.totalInputTokens + usage.totalOutputTokens;
  return `${formatTokens(totalTokens)} tokens · ${formatCost(usage.estimatedCost)}`;
}

/**
 * Get detailed usage breakdown
 */
export function getDetailedUsage(): string {
  const usage = getSessionUsage();
  const duration = Math.round((Date.now() - usage.startTime) / 1000 / 60);

  return `
Session Usage (${duration} min):
  Input:  ${formatTokens(usage.totalInputTokens)} tokens
  Output: ${formatTokens(usage.totalOutputTokens)} tokens
  Cache:  ${formatTokens(usage.totalCacheReadTokens)} read, ${formatTokens(usage.totalCacheCreationTokens)} created
  Calls:  ${usage.apiCalls} API calls
  Cost:   ${formatCost(usage.estimatedCost)}
  Model:  ${usage.model}
`.trim();
}

/**
 * Load usage history from disk
 */
export function loadUsageHistory(): UsageHistory {
  try {
    if (existsSync(USAGE_FILE)) {
      const data = readFileSync(USAGE_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch {
    // Fall through to defaults
  }

  return {
    daily: {},
    allTime: {
      totalInputTokens: 0,
      totalOutputTokens: 0,
      totalCost: 0,
      totalApiCalls: 0,
    },
  };
}

/**
 * Save session usage to history
 */
export function saveSessionToHistory(): void {
  try {
    const history = loadUsageHistory();
    const today = new Date().toISOString().split('T')[0];

    // Update daily
    if (!history.daily[today]) {
      history.daily[today] = { ...currentSession };
    } else {
      history.daily[today].totalInputTokens += currentSession.totalInputTokens;
      history.daily[today].totalOutputTokens += currentSession.totalOutputTokens;
      history.daily[today].apiCalls += currentSession.apiCalls;
      history.daily[today].estimatedCost += currentSession.estimatedCost;
    }

    // Update all-time
    history.allTime.totalInputTokens += currentSession.totalInputTokens;
    history.allTime.totalOutputTokens += currentSession.totalOutputTokens;
    history.allTime.totalCost += currentSession.estimatedCost;
    history.allTime.totalApiCalls += currentSession.apiCalls;

    writeFileSync(USAGE_FILE, JSON.stringify(history, null, 2));
  } catch {
    // Silently fail
  }
}

/**
 * Get context window usage percentage
 */
export function getContextUsagePercent(currentTokens: number, maxTokens: number = 200000): number {
  return Math.round((currentTokens / maxTokens) * 100);
}

/**
 * Check if approaching context limit
 */
export function isApproachingContextLimit(currentTokens: number, maxTokens: number = 200000): boolean {
  return getContextUsagePercent(currentTokens, maxTokens) >= 80;
}

/**
 * Estimate tokens in a string (rough approximation)
 */
export function estimateTokens(text: string): number {
  // Rough estimate: ~4 characters per token for English
  return Math.ceil(text.length / 4);
}
