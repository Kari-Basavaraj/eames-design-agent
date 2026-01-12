// Updated: 2026-01-12 02:40:00
// Eames Design Agent - Status Bar Component
// Claude Code-like status display with cost, context, and task info

import React from 'react';
import { Box, Text } from 'ink';
import { colors } from '../theme.js';
import { getUsageSummary, getSessionUsage, formatTokens, formatCost } from '../utils/cost-tracking.js';
import type { BackgroundTask } from '../utils/background-tasks.js';

interface StatusBarProps {
  model: string;
  contextPercent?: number;
  backgroundTasks?: BackgroundTask[];
  showDetails?: boolean;
}

export function StatusBar({
  model,
  contextPercent = 0,
  backgroundTasks = [],
  showDetails = false,
}: StatusBarProps) {
  const usage = getSessionUsage();
  const runningTasks = backgroundTasks.filter(t => t.status === 'running');

  // Context usage bar
  const contextBar = getContextBar(contextPercent);
  const contextColor = contextPercent >= 80 ? colors.error : contextPercent >= 60 ? colors.warning : colors.success;

  return (
    <Box
      flexDirection="row"
      justifyContent="space-between"
      borderStyle="single"
      borderColor={colors.muted}
      borderTop={true}
      borderBottom={false}
      borderLeft={false}
      borderRight={false}
      paddingX={1}
    >
      {/* Left: Model info */}
      <Box>
        <Text color={colors.muted}>
          {getModelShortName(model)}
        </Text>
      </Box>

      {/* Center: Context usage */}
      <Box>
        <Text color={contextColor}>
          {contextBar} {contextPercent}%
        </Text>
      </Box>

      {/* Right: Cost and tasks */}
      <Box gap={2}>
        {runningTasks.length > 0 && (
          <Text color={colors.primary}>
            ⏳ {runningTasks.length} task{runningTasks.length > 1 ? 's' : ''}
          </Text>
        )}
        <Text color={colors.muted}>
          {formatTokens(usage.totalInputTokens + usage.totalOutputTokens)} · {formatCost(usage.estimatedCost)}
        </Text>
      </Box>
    </Box>
  );
}

/**
 * Detailed status display
 */
interface DetailedStatusProps {
  model: string;
  contextPercent: number;
  messageCount: number;
  backgroundTasks: BackgroundTask[];
}

export function DetailedStatus({
  model,
  contextPercent,
  messageCount,
  backgroundTasks,
}: DetailedStatusProps) {
  const usage = getSessionUsage();
  const duration = Math.round((Date.now() - usage.startTime) / 1000 / 60);

  return (
    <Box flexDirection="column" paddingX={1} paddingY={1}>
      <Text color={colors.primary} bold>Session Status</Text>

      <Box marginTop={1} flexDirection="column">
        <Text color={colors.muted}>
          Model: <Text color={colors.white}>{model}</Text>
        </Text>
        <Text color={colors.muted}>
          Duration: <Text color={colors.white}>{duration} min</Text>
        </Text>
        <Text color={colors.muted}>
          Messages: <Text color={colors.white}>{messageCount}</Text>
        </Text>
      </Box>

      <Box marginTop={1} flexDirection="column">
        <Text color={colors.primary}>Token Usage</Text>
        <Text color={colors.muted}>
          Input: <Text color={colors.white}>{formatTokens(usage.totalInputTokens)}</Text>
        </Text>
        <Text color={colors.muted}>
          Output: <Text color={colors.white}>{formatTokens(usage.totalOutputTokens)}</Text>
        </Text>
        <Text color={colors.muted}>
          Cache read: <Text color={colors.white}>{formatTokens(usage.totalCacheReadTokens)}</Text>
        </Text>
        <Text color={colors.muted}>
          API calls: <Text color={colors.white}>{usage.apiCalls}</Text>
        </Text>
        <Text color={colors.muted}>
          Cost: <Text color={colors.success}>{formatCost(usage.estimatedCost)}</Text>
        </Text>
      </Box>

      <Box marginTop={1} flexDirection="column">
        <Text color={colors.primary}>Context Window</Text>
        <Text color={colors.muted}>
          Usage: <Text color={getContextColor(contextPercent)}>{contextPercent}%</Text>
        </Text>
        <Text color={colors.muted}>{getContextBar(contextPercent, 30)}</Text>
      </Box>

      {backgroundTasks.length > 0 && (
        <Box marginTop={1} flexDirection="column">
          <Text color={colors.primary}>Background Tasks</Text>
          {backgroundTasks.slice(0, 5).map(task => (
            <Text key={task.id} color={colors.muted}>
              {getTaskIcon(task.status)} {task.name}: {task.progress}%
            </Text>
          ))}
        </Box>
      )}
    </Box>
  );
}

/**
 * Compact status line
 */
interface CompactStatusProps {
  model: string;
  cost: number;
  tokens: number;
}

export function CompactStatus({ model, cost, tokens }: CompactStatusProps) {
  return (
    <Box gap={2}>
      <Text color={colors.muted} dimColor>
        {getModelShortName(model)} · {formatTokens(tokens)} · {formatCost(cost)}
      </Text>
    </Box>
  );
}

// Helper functions

function getModelShortName(model: string): string {
  if (model.includes('opus')) return 'opus';
  if (model.includes('sonnet-4-5') || model.includes('sonnet-4.5')) return 'sonnet-4.5';
  if (model.includes('sonnet')) return 'sonnet';
  if (model.includes('haiku')) return 'haiku';
  return model.split('-').pop() || model;
}

function getContextBar(percent: number, width: number = 10): string {
  const filled = Math.round((percent / 100) * width);
  const empty = width - filled;
  return `[${'█'.repeat(filled)}${'░'.repeat(empty)}]`;
}

function getContextColor(percent: number): string {
  if (percent >= 80) return colors.error;
  if (percent >= 60) return colors.warning;
  return colors.success;
}

function getTaskIcon(status: string): string {
  switch (status) {
    case 'running': return '⏳';
    case 'completed': return '✅';
    case 'failed': return '❌';
    case 'cancelled': return '⏹️';
    default: return '⏸️';
  }
}
