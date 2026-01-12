// Updated: 2026-01-12 04:20:00
// Eames Design Agent - Token Budget Meter Component
// Visual context/token usage display

import React from 'react';
import { Box, Text } from 'ink';
import {
  TokenBudget,
  BudgetThresholds,
  DEFAULT_THRESHOLDS,
  getBudgetStatus,
  getUsagePercent,
  formatTokenCount,
} from '../utils/token-budget.js';

interface TokenBudgetMeterProps {
  budget: TokenBudget;
  thresholds?: BudgetThresholds;
  width?: number;
  showDetails?: boolean;
  compact?: boolean;
}

export const TokenBudgetMeter: React.FC<TokenBudgetMeterProps> = ({
  budget,
  thresholds = DEFAULT_THRESHOLDS,
  width = 20,
  showDetails = false,
  compact = false,
}) => {
  const status = getBudgetStatus(budget, thresholds);
  const percent = getUsagePercent(budget);

  const statusColors = {
    ok: 'green',
    warning: 'yellow',
    critical: 'red',
  };

  const statusIcons = {
    ok: '●',
    warning: '◐',
    critical: '○',
  };

  // Build meter bar
  const buildMeter = (): React.ReactNode => {
    const filled = Math.round((percent / 100) * width);
    const parts: React.ReactNode[] = [];

    for (let i = 0; i < width; i++) {
      const blockPercent = ((i + 1) / width) * 100;
      let color: string;

      if (blockPercent <= thresholds.warning * 100) {
        color = 'green';
      } else if (blockPercent <= thresholds.critical * 100) {
        color = 'yellow';
      } else {
        color = 'red';
      }

      const char = i < filled ? '█' : '░';
      parts.push(
        <Text key={i} color={i < filled ? (color as any) : 'gray'}>
          {char}
        </Text>
      );
    }

    return parts;
  };

  if (compact) {
    return (
      <Box>
        <Text color={statusColors[status] as any}>{statusIcons[status]} </Text>
        <Text color="gray">{formatTokenCount(budget.used)}</Text>
        <Text color="gray">/</Text>
        <Text>{formatTokenCount(budget.limit)}</Text>
      </Box>
    );
  }

  return (
    <Box flexDirection="column">
      {/* Main meter */}
      <Box>
        <Text color={statusColors[status] as any}>{statusIcons[status]} </Text>
        <Text>[</Text>
        {buildMeter()}
        <Text>]</Text>
        <Text color={statusColors[status] as any}> {percent.toFixed(0)}%</Text>
      </Box>

      {/* Token counts */}
      <Box marginLeft={2}>
        <Text color="gray">
          {formatTokenCount(budget.used)} / {formatTokenCount(budget.limit)} tokens
        </Text>
      </Box>

      {/* Details */}
      {showDetails && (
        <Box flexDirection="column" marginLeft={2} marginTop={1}>
          <Text color="gray">
            ↓ Input: {formatTokenCount(budget.inputTokens)}
          </Text>
          <Text color="gray">
            ↑ Output: {formatTokenCount(budget.outputTokens)}
          </Text>
          {budget.cacheHits !== undefined && (
            <Text color="gray">
              ⚡ Cache: {budget.cacheHits} hits / {budget.cacheMisses || 0} misses
            </Text>
          )}
        </Box>
      )}

      {/* Warning message */}
      {status === 'warning' && (
        <Box marginTop={1}>
          <Text color="yellow">
            ⚠ Context getting full. Consider using /compact
          </Text>
        </Box>
      )}

      {status === 'critical' && (
        <Box marginTop={1}>
          <Text color="red">
            ⚠ Context nearly full! Use /compact or start new conversation
          </Text>
        </Box>
      )}
    </Box>
  );
};

/**
 * Mini meter for status bar
 */
interface MiniMeterProps {
  budget: TokenBudget;
  width?: number;
}

export const MiniTokenMeter: React.FC<MiniMeterProps> = ({
  budget,
  width = 8,
}) => {
  const status = getBudgetStatus(budget);
  const percent = getUsagePercent(budget);
  const filled = Math.round((percent / 100) * width);

  const statusColors = {
    ok: 'green',
    warning: 'yellow',
    critical: 'red',
  };

  return (
    <Box>
      <Text color="gray">ctx:</Text>
      <Text color={statusColors[status] as any}>
        {'▓'.repeat(filled)}
      </Text>
      <Text color="gray">
        {'░'.repeat(width - filled)}
      </Text>
    </Box>
  );
};

/**
 * Token delta indicator
 */
interface TokenDeltaProps {
  delta: number;
}

export const TokenDelta: React.FC<TokenDeltaProps> = ({ delta }) => {
  if (delta === 0) return null;

  const sign = delta > 0 ? '+' : '';
  const color = delta > 0 ? 'yellow' : 'green';

  return (
    <Text color={color}>
      ({sign}{formatTokenCount(delta)})
    </Text>
  );
};

/**
 * Budget progress ring (compact circular display)
 */
interface BudgetRingProps {
  budget: TokenBudget;
}

export const BudgetRing: React.FC<BudgetRingProps> = ({ budget }) => {
  const percent = getUsagePercent(budget);
  const status = getBudgetStatus(budget);

  const statusColors = {
    ok: 'green',
    warning: 'yellow',
    critical: 'red',
  };

  // Unicode circle segments
  const segments = ['○', '◔', '◑', '◕', '●'];
  const segmentIndex = Math.min(
    Math.floor((percent / 100) * segments.length),
    segments.length - 1
  );

  return (
    <Box>
      <Text color={statusColors[status] as any}>
        {segments[segmentIndex]}
      </Text>
      <Text color="gray"> {percent.toFixed(0)}%</Text>
    </Box>
  );
};

export default TokenBudgetMeter;
