import React from 'react';
import { Box, Text } from 'ink';
import InkSpinner from 'ink-spinner';
import type { Phase } from '../agent/state.js';
import { colors } from '../theme.js';
import { PERMISSION_MODE_LABELS, PERMISSION_MODE_COLORS } from '../types/permissions.js';
import type { PermissionMode } from '../types/permissions.js';

// ============================================================================
// Phase Labels
// ============================================================================

/**
 * Maps phase states to user-friendly labels.
 */
export const phaseLabels: Record<Phase, string> = {
  understand: 'Understanding...',
  plan: 'Planning...',
  execute: 'Working...',
  reflect: 'Reflecting...',
  answer: 'Answering...',
  complete: 'Complete',
};

// ============================================================================
// Phase Status Bar Component
// ============================================================================

interface PhaseStatusBarProps {
  phase: Phase;
  permissionMode?: PermissionMode;
  thinkingMode?: boolean;
  isAnswering?: boolean;
  progressMessage?: string;
}

/**
 * Single-line status bar showing the current phase with a spinner.
 * Positioned directly above the input component.
 * Claude Code style - shows thinking/working status.
 */
export const PhaseStatusBar = React.memo(function PhaseStatusBar({
  phase,
  permissionMode = 'bypassPermissions',
  thinkingMode = false,
  isAnswering = false,
  progressMessage,
}: PhaseStatusBarProps) {
  // Don't show anything if complete
  if (phase === 'complete') {
    return null;
  }

  // Use progress message if available, otherwise phase label
  // Claude Code shows "Thinking..." prominently during work
  const label = progressMessage
    ? progressMessage
    : (isAnswering ? phaseLabels.answer : phaseLabels[phase]);

  return (
    <Box marginTop={1} marginBottom={0}>
      {/* Permission Mode Indicator */}
      <Text color={PERMISSION_MODE_COLORS[permissionMode]}>
        [{PERMISSION_MODE_LABELS[permissionMode]}]
      </Text>
      
      {/* Thinking Mode Indicator */}
      {thinkingMode && (
        <Text color="blue"> 🧠</Text>
      )}
      
      {/* Separator */}
      <Text color="gray"> │ </Text>
      
      {/* Spinner and Phase */}
      <Text color={colors.primary} dimColor>
        <InkSpinner type="dots" />
      </Text>
      <Text> </Text>
      <Text color={colors.muted} dimColor>{label}</Text>
      <Text color={colors.mutedDark} dimColor> (esc to interrupt)</Text>
    </Box>
  );
});
