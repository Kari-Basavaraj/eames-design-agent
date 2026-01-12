// Updated: 2026-01-12 02:50:00
// Eames Design Agent - Thinking Indicator Component
// Claude Code-like extended thinking display

import React, { useState, useEffect } from 'react';
import { Box, Text } from 'ink';
import { colors } from '../theme.js';
import type { ThinkingLevel, ThinkingState } from '../utils/extended-thinking.js';
import { formatThinkingForDisplay, getThinkingSummary } from '../utils/extended-thinking.js';

interface ThinkingIndicatorProps {
  level: ThinkingLevel;
  state: ThinkingState;
  expanded?: boolean;
}

/**
 * Animated thinking indicator
 */
export function ThinkingIndicator({ level, state, expanded = false }: ThinkingIndicatorProps) {
  const [frame, setFrame] = useState(0);

  // Animation frames
  const frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];

  useEffect(() => {
    if (!state.isThinking) return;

    const interval = setInterval(() => {
      setFrame(f => (f + 1) % frames.length);
    }, 100);

    return () => clearInterval(interval);
  }, [state.isThinking]);

  if (!state.isThinking && !state.currentThinking) {
    return null;
  }

  const levelIcon = getLevelIcon(level);
  const levelColor = getLevelColor(level);

  return (
    <Box
      flexDirection="column"
      borderStyle="round"
      borderColor={levelColor}
      paddingX={2}
      paddingY={1}
      marginY={1}
    >
      {/* Header */}
      <Box gap={1}>
        <Text color={levelColor}>
          {state.isThinking ? frames[frame] : '✓'} {levelIcon}
        </Text>
        <Text color={levelColor} bold>
          {getLevelLabel(level)}
        </Text>
        {state.totalThinkingTokens > 0 && (
          <Text color={colors.muted} dimColor>
            ({state.totalThinkingTokens} tokens)
          </Text>
        )}
      </Box>

      {/* Thinking content */}
      {state.currentThinking && (
        <Box marginTop={1} flexDirection="column">
          {expanded ? (
            <Text color={colors.muted}>
              {formatThinkingForDisplay(state.currentThinking, 1000)}
            </Text>
          ) : (
            <Text color={colors.muted} dimColor>
              {getThinkingSummary(state.currentThinking)}
            </Text>
          )}
        </Box>
      )}

      {/* Progress indicator */}
      {state.isThinking && (
        <Box marginTop={1}>
          <Text color={colors.muted} dimColor>
            {getThinkingProgress(state)}
          </Text>
        </Box>
      )}
    </Box>
  );
}

/**
 * Compact thinking indicator (for inline use)
 */
interface CompactThinkingProps {
  isThinking: boolean;
  level: ThinkingLevel;
}

export function CompactThinking({ isThinking, level }: CompactThinkingProps) {
  const [frame, setFrame] = useState(0);
  const frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];

  useEffect(() => {
    if (!isThinking) return;

    const interval = setInterval(() => {
      setFrame(f => (f + 1) % frames.length);
    }, 100);

    return () => clearInterval(interval);
  }, [isThinking]);

  if (!isThinking || level === 'none') {
    return null;
  }

  const levelColor = getLevelColor(level);

  return (
    <Box gap={1}>
      <Text color={levelColor}>
        {frames[frame]} {getLevelIcon(level)} {getLevelLabel(level)}
      </Text>
    </Box>
  );
}

/**
 * Thinking history panel (for detailed view)
 */
interface ThinkingHistoryProps {
  history: string[];
  maxItems?: number;
}

export function ThinkingHistory({ history, maxItems = 5 }: ThinkingHistoryProps) {
  if (history.length === 0) {
    return null;
  }

  const displayHistory = history.slice(-maxItems);

  return (
    <Box flexDirection="column" marginY={1}>
      <Text color={colors.primary} bold>Thinking History</Text>
      {displayHistory.map((thinking, index) => (
        <Box key={index} marginTop={1}>
          <Text color={colors.muted} dimColor>
            {index + 1}. {getThinkingSummary(thinking)}
          </Text>
        </Box>
      ))}
      {history.length > maxItems && (
        <Text color={colors.muted} dimColor>
          ... and {history.length - maxItems} more
        </Text>
      )}
    </Box>
  );
}

// Helper functions

function getLevelIcon(level: ThinkingLevel): string {
  switch (level) {
    case 'ultra':
      return '🧠💭💭💭';
    case 'deep':
      return '🧠💭💭';
    case 'basic':
      return '🧠💭';
    default:
      return '🧠';
  }
}

function getLevelLabel(level: ThinkingLevel): string {
  switch (level) {
    case 'ultra':
      return 'Ultra Thinking';
    case 'deep':
      return 'Deep Thinking';
    case 'basic':
      return 'Thinking';
    default:
      return 'Processing';
  }
}

function getLevelColor(level: ThinkingLevel): string {
  switch (level) {
    case 'ultra':
      return colors.error; // Red for ultra
    case 'deep':
      return colors.warning; // Yellow for deep
    case 'basic':
      return colors.primary; // Blue for basic
    default:
      return colors.muted;
  }
}

function getThinkingProgress(state: ThinkingState): string {
  const dots = '.'.repeat((Date.now() / 500) % 4);
  return `Processing${dots}`;
}
