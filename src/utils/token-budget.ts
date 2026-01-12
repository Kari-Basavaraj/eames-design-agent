// Updated: 2026-01-12 04:15:00
// Eames Design Agent - Token Budget Meter
// Visual token/context budget tracking

/**
 * Budget state
 */
export interface TokenBudget {
  used: number;
  limit: number;
  inputTokens: number;
  outputTokens: number;
  cacheHits?: number;
  cacheMisses?: number;
}

/**
 * Budget thresholds
 */
export interface BudgetThresholds {
  warning: number; // e.g., 0.75 (75%)
  critical: number; // e.g., 0.90 (90%)
}

export const DEFAULT_THRESHOLDS: BudgetThresholds = {
  warning: 0.75,
  critical: 0.90,
};

/**
 * Budget status
 */
export type BudgetStatus = 'ok' | 'warning' | 'critical';

/**
 * Get budget status
 */
export function getBudgetStatus(
  budget: TokenBudget,
  thresholds: BudgetThresholds = DEFAULT_THRESHOLDS
): BudgetStatus {
  const usage = budget.used / budget.limit;

  if (usage >= thresholds.critical) return 'critical';
  if (usage >= thresholds.warning) return 'warning';
  return 'ok';
}

/**
 * Get usage percentage
 */
export function getUsagePercent(budget: TokenBudget): number {
  return Math.min(100, (budget.used / budget.limit) * 100);
}

/**
 * Format token count
 */
export function formatTokenCount(tokens: number): string {
  if (tokens < 1000) return `${tokens}`;
  if (tokens < 1000000) return `${(tokens / 1000).toFixed(1)}K`;
  return `${(tokens / 1000000).toFixed(2)}M`;
}

/**
 * Meter characters
 */
const METER_CHARS = {
  full: '█',
  partial: ['▏', '▎', '▍', '▌', '▋', '▊', '▉'],
  empty: '░',
};

/**
 * Render budget meter
 */
export function renderBudgetMeter(
  budget: TokenBudget,
  width: number = 20,
  thresholds: BudgetThresholds = DEFAULT_THRESHOLDS
): string {
  const percent = getUsagePercent(budget);
  const status = getBudgetStatus(budget, thresholds);

  // Calculate filled blocks
  const filled = (percent / 100) * width;
  const fullBlocks = Math.floor(filled);
  const remainder = filled - fullBlocks;

  let meter = '';

  // Build meter with color zones
  for (let i = 0; i < width; i++) {
    const blockPercent = ((i + 1) / width) * 100;
    let char: string;

    if (i < fullBlocks) {
      char = METER_CHARS.full;
    } else if (i === fullBlocks && remainder > 0) {
      const partialIndex = Math.floor(remainder * METER_CHARS.partial.length);
      char = METER_CHARS.partial[Math.min(partialIndex, METER_CHARS.partial.length - 1)];
    } else {
      char = METER_CHARS.empty;
    }

    // Color based on zone
    if (blockPercent <= thresholds.warning * 100) {
      meter += char; // Normal
    } else if (blockPercent <= thresholds.critical * 100) {
      meter += `\x1b[33m${char}\x1b[0m`; // Yellow
    } else {
      meter += `\x1b[31m${char}\x1b[0m`; // Red
    }
  }

  return `[${meter}]`;
}

/**
 * Render compact budget display
 */
export function renderBudgetCompact(budget: TokenBudget): string {
  const status = getBudgetStatus(budget);
  const percent = getUsagePercent(budget);
  const used = formatTokenCount(budget.used);
  const limit = formatTokenCount(budget.limit);

  const colors: Record<BudgetStatus, string> = {
    ok: '\x1b[32m', // Green
    warning: '\x1b[33m', // Yellow
    critical: '\x1b[31m', // Red
  };

  const reset = '\x1b[0m';
  const color = colors[status];

  return `${color}${used}${reset}/${limit} (${percent.toFixed(0)}%)`;
}

/**
 * Render detailed budget display
 */
export function renderBudgetDetailed(
  budget: TokenBudget,
  thresholds: BudgetThresholds = DEFAULT_THRESHOLDS
): string[] {
  const lines: string[] = [];
  const status = getBudgetStatus(budget, thresholds);
  const percent = getUsagePercent(budget);

  // Status header
  const statusLabels: Record<BudgetStatus, string> = {
    ok: '\x1b[32m● OK\x1b[0m',
    warning: '\x1b[33m● WARNING\x1b[0m',
    critical: '\x1b[31m● CRITICAL\x1b[0m',
  };

  lines.push(`Token Budget ${statusLabels[status]}`);

  // Meter
  lines.push(renderBudgetMeter(budget, 30, thresholds));

  // Stats
  lines.push(`Used: ${formatTokenCount(budget.used)} / ${formatTokenCount(budget.limit)} (${percent.toFixed(1)}%)`);
  lines.push(`  Input:  ${formatTokenCount(budget.inputTokens)}`);
  lines.push(`  Output: ${formatTokenCount(budget.outputTokens)}`);

  if (budget.cacheHits !== undefined || budget.cacheMisses !== undefined) {
    const hits = budget.cacheHits || 0;
    const misses = budget.cacheMisses || 0;
    const hitRate = hits + misses > 0 ? (hits / (hits + misses)) * 100 : 0;
    lines.push(`  Cache:  ${hits} hits, ${misses} misses (${hitRate.toFixed(0)}% hit rate)`);
  }

  // Remaining
  const remaining = budget.limit - budget.used;
  lines.push(`Remaining: ${formatTokenCount(remaining)}`);

  return lines;
}

/**
 * Mini meter for status bar
 */
export function renderMiniMeter(budget: TokenBudget, width: number = 8): string {
  const status = getBudgetStatus(budget);
  const percent = getUsagePercent(budget);

  const colors: Record<BudgetStatus, string> = {
    ok: '\x1b[32m',
    warning: '\x1b[33m',
    critical: '\x1b[31m',
  };

  const reset = '\x1b[0m';

  // Simple blocks
  const filled = Math.round((percent / 100) * width);
  const meter = '▓'.repeat(filled) + '░'.repeat(width - filled);

  return `${colors[status]}${meter}${reset}`;
}

/**
 * Status bar token display
 */
export function renderStatusBarTokens(budget: TokenBudget): string {
  const status = getBudgetStatus(budget);
  const percent = getUsagePercent(budget);
  const used = formatTokenCount(budget.used);

  const colors: Record<BudgetStatus, string> = {
    ok: '\x1b[32m',
    warning: '\x1b[33m',
    critical: '\x1b[31m',
  };

  const reset = '\x1b[0m';
  const dim = '\x1b[90m';

  return `${dim}tokens:${reset} ${colors[status]}${used}${reset} ${renderMiniMeter(budget, 6)}`;
}

/**
 * Calculate estimated tokens for text
 */
export function estimateTokens(text: string): number {
  // Rough estimate: ~4 characters per token for English
  return Math.ceil(text.length / 4);
}

/**
 * Would adding this text exceed the budget?
 */
export function wouldExceedBudget(
  budget: TokenBudget,
  additionalTokens: number,
  safetyMargin: number = 0.1 // 10% safety margin
): boolean {
  const effectiveLimit = budget.limit * (1 - safetyMargin);
  return budget.used + additionalTokens > effectiveLimit;
}

/**
 * Get recommended action based on budget
 */
export function getBudgetRecommendation(budget: TokenBudget): string | null {
  const status = getBudgetStatus(budget);
  const percent = getUsagePercent(budget);

  if (status === 'critical') {
    return 'Consider starting a new conversation or using /compact';
  }

  if (status === 'warning') {
    return `Context is ${percent.toFixed(0)}% full. Consider compacting soon.`;
  }

  return null;
}

/**
 * Budget change tracking
 */
export interface BudgetDelta {
  inputDelta: number;
  outputDelta: number;
  totalDelta: number;
  timestamp: number;
}

/**
 * Track budget change
 */
export function trackBudgetChange(
  before: TokenBudget,
  after: TokenBudget
): BudgetDelta {
  return {
    inputDelta: after.inputTokens - before.inputTokens,
    outputDelta: after.outputTokens - before.outputTokens,
    totalDelta: after.used - before.used,
    timestamp: Date.now(),
  };
}

/**
 * Format budget delta
 */
export function formatBudgetDelta(delta: BudgetDelta): string {
  const sign = delta.totalDelta >= 0 ? '+' : '';
  return `${sign}${formatTokenCount(delta.totalDelta)} tokens`;
}
