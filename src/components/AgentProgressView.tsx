import React, { useState, useEffect } from 'react';
import { Box, Text } from 'ink';
import { colors, spacing } from '../theme.js';
import { TaskListView } from './TaskListView.js';
import { getPhaseMessage } from '../utils/progress-messages.js';
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
  taskCount?: number;
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
  const { progressMessage, currentPhase, tasks, taskCount } = state;
  const [frame, setFrame] = useState(0);
  const [message, setMessage] = useState(progressMessage || '');
  const frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
  
  // Count active tasks
  const activeTaskCount = taskCount || tasks?.length || 0;

  // Rotate spinner frames
  useEffect(() => {
    const interval = setInterval(() => {
      setFrame(f => (f + 1) % frames.length);
    }, 80);
    return () => clearInterval(interval);
  }, []);

  // Rotate fun messages every 2 seconds if no specific message
  useEffect(() => {
    if (!progressMessage && currentPhase) {
      setMessage(getPhaseMessage(currentPhase));
      const interval = setInterval(() => {
        setMessage(getPhaseMessage(currentPhase));
      }, 2000);
      return () => clearInterval(interval);
    } else if (progressMessage) {
      setMessage(progressMessage);
    }
  }, [progressMessage, currentPhase]);

  if (!message && activeTaskCount === 0) return null;

  // Phase emoji indicators
  const phaseEmoji: Record<string, string> = {
    understand: '🔍',
    plan: '📋',
    execute: '⚙️',
    reflect: '🧐',
    answer: '✨',
  };

  const emoji = currentPhase ? phaseEmoji[currentPhase] || '' : '';
  
  // Show task count when executing
  const showingTaskCount = currentPhase === 'execute' && activeTaskCount > 0;
  const displayMessage = showingTaskCount 
    ? `Executing ${activeTaskCount} task${activeTaskCount !== 1 ? 's' : ''}...`
    : message;

  return (
    <Box marginTop={spacing.tight}>
      <Text color={colors.primary}>{frames[frame]} </Text>
      {showingTaskCount && <Text color="yellow">⚡ </Text>}
      {!showingTaskCount && emoji && <Text>{emoji} </Text>}
      <Text color={colors.muted} dimColor>{displayMessage}</Text>
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