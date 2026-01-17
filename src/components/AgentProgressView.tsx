import React, { useState, useEffect } from 'react';
import { Box, Text } from 'ink';
import { colors } from '../theme.js';
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
 */
export const AgentProgressView = React.memo(function AgentProgressView({
  state
}: AgentProgressViewProps) {
  const { progressMessage, currentPhase } = state;
  const [frame, setFrame] = useState(0);
  const frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];

  useEffect(() => {
    const interval = setInterval(() => {
      setFrame(f => (f + 1) % frames.length);
    }, 80);
    return () => clearInterval(interval);
  }, []);

  // Show progress with phase indicator
  const phaseLabels: Record<Phase, string> = {
    understand: '🔍 Understanding',
    plan: '📋 Planning',
    execute: '⚙️  Executing',
    reflect: '🤔 Reflecting',
    answer: '✍️  Answering',
    complete: '✅ Complete',
  };

  const message = progressMessage || phaseLabels[currentPhase];

  return message ? (
    <Box>
      <Text color={colors.primary}>{frames[frame]}</Text>
      <Text> </Text>
      <Text color={colors.muted} dimColor>{message}</Text>
    </Box>
  ) : null;
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
 * Cleaner, more compact layout.
 */
export const CurrentTurnView = React.memo(function CurrentTurnView({ 
  query, 
  state 
}: CurrentTurnViewProps) {
  return (
    <Box flexDirection="column">
      {/* User query */}
      <Box>
        <Text color={colors.primary}>{'> '}</Text>
        <Text>{query}</Text>
      </Box>

      {/* Animated progress */}
      {state.progressMessage && (
        <Box marginTop={1} marginLeft={2}>
          <AgentProgressView state={state} />
        </Box>
      )}
    </Box>
  );
});
