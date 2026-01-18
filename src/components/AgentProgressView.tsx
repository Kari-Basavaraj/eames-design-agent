import React, { useState, useEffect } from 'react';
import { Box, Text } from 'ink';
import { colors, spacing } from '../theme.js';
import { TaskListView } from './TaskListView.js';
import type { Phase, Task } from '../agent/state.js';

// ============================================================================
// Types
// ============================================================================

/**
 * State for the agent progress view.
 */
export interface AgentProgressState {
  currentPhase: Phase;
  understandComplete: boolean;
  planComplete: boolean;
  executeComplete: boolean;
  reflectComplete: boolean;
  tasks: Task[];
  isAnswering: boolean;
  progressMessage?: string;
}

// ============================================================================
// Agent Progress View - Claude Code Style
// ============================================================================

interface AgentProgressViewProps {
  state: AgentProgressState;
}

/**
 * Displays the agent's progress with animated spinner
 * MINIMAL - Claude Code style: just spinner + one line message
 */
export const AgentProgressView = React.memo(function AgentProgressView({
  state
}: AgentProgressViewProps) {
  const { progressMessage } = state;
  const [frame, setFrame] = useState(0);
  const frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];

  useEffect(() => {
    const interval = setInterval(() => {
      setFrame(f => (f + 1) % frames.length);
    }, 80);
    return () => clearInterval(interval);
  }, []);

  if (!progressMessage) return null;

  return (
    <Box marginTop={spacing.tight}>
      <Text color={colors.primary}>{frames[frame]} </Text>
      <Text color={colors.muted} dimColor>{progressMessage}</Text>
    </Box>
  );
});

// ============================================================================
// Current Turn View - Claude Code Style
// ============================================================================

interface CurrentTurnViewProps {
  query: string;
  state: AgentProgressState;
}

/**
 * Full current turn view - Claude Code style.
 * CLEAN and MINIMAL: Query + progress only, no clutter
 */
export const CurrentTurnView = React.memo(function CurrentTurnView({ 
  query, 
  state 
}: CurrentTurnViewProps) {
  return (
    <Box flexDirection="column" marginTop={spacing.normal}>
      {/* User query - simple and clean */}
      <Box>
        <Text color={colors.primary} bold>❯ </Text>
        <Text color={colors.white}>{query}</Text>
      </Box>

      {/* Progress - indented, minimal */}
      {state.progressMessage && (
        <Box marginLeft={2}>
          <AgentProgressView state={state} />
        </Box>
      )}
    </Box>
  );
});