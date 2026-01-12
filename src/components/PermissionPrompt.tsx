// Updated: 2026-01-12 02:35:00
// Eames Design Agent - Permission Prompt Component
// Claude Code-like permission dialog for dangerous operations

import React, { useState } from 'react';
import { Box, Text, useInput } from 'ink';
import { colors } from '../theme.js';
import type { PermissionRequest } from '../utils/permissions.js';

interface PermissionPromptProps {
  request: PermissionRequest;
  onAllow: (remember: boolean) => void;
  onDeny: (remember: boolean) => void;
}

export function PermissionPrompt({ request, onAllow, onDeny }: PermissionPromptProps) {
  const [selectedOption, setSelectedOption] = useState(0);

  const options = [
    { label: 'Allow once', action: () => onAllow(false) },
    { label: 'Allow always', action: () => onAllow(true) },
    { label: 'Deny', action: () => onDeny(false) },
  ];

  useInput((input, key) => {
    if (key.upArrow) {
      setSelectedOption(prev => Math.max(0, prev - 1));
    }
    if (key.downArrow) {
      setSelectedOption(prev => Math.min(options.length - 1, prev + 1));
    }
    if (key.return) {
      options[selectedOption].action();
    }
    // Quick keys
    if (input === 'y' || input === 'Y') {
      onAllow(false);
    }
    if (input === 'a' || input === 'A') {
      onAllow(true);
    }
    if (input === 'n' || input === 'N') {
      onDeny(false);
    }
  });

  const categoryIcons: Record<string, string> = {
    file_write: '📝',
    file_delete: '🗑️',
    command_exec: '⚡',
    network: '🌐',
    git: '📦',
    browser: '🌍',
    install: '📥',
  };

  const icon = categoryIcons[request.category] || '⚠️';

  return (
    <Box
      flexDirection="column"
      borderStyle="round"
      borderColor={colors.warning}
      paddingX={2}
      paddingY={1}
      marginY={1}
    >
      {/* Header */}
      <Box marginBottom={1}>
        <Text color={colors.warning} bold>
          {icon} Permission Required
        </Text>
      </Box>

      {/* Description */}
      <Box marginBottom={1} flexDirection="column">
        <Text color={colors.white}>
          Eames wants to: <Text bold>{request.description}</Text>
        </Text>
        <Text color={colors.muted} dimColor>
          Tool: {request.toolName} | Category: {request.category}
        </Text>
      </Box>

      {/* Input preview (truncated) */}
      {request.input && Object.keys(request.input).length > 0 && (
        <Box marginBottom={1} flexDirection="column">
          <Text color={colors.muted}>Input:</Text>
          <Text color={colors.muted} dimColor>
            {JSON.stringify(request.input).slice(0, 100)}
            {JSON.stringify(request.input).length > 100 ? '...' : ''}
          </Text>
        </Box>
      )}

      {/* Options */}
      <Box flexDirection="column" marginTop={1}>
        {options.map((option, index) => (
          <Box key={option.label}>
            <Text color={index === selectedOption ? colors.primary : colors.muted}>
              {index === selectedOption ? '❯ ' : '  '}
              {option.label}
            </Text>
          </Box>
        ))}
      </Box>

      {/* Keyboard hints */}
      <Box marginTop={1}>
        <Text color={colors.muted} dimColor>
          [Y] Allow once  [A] Allow always  [N] Deny  [↑↓] Navigate  [Enter] Select
        </Text>
      </Box>
    </Box>
  );
}

/**
 * Inline permission indicator (for status bar)
 */
interface PermissionIndicatorProps {
  pending: number;
}

export function PermissionIndicator({ pending }: PermissionIndicatorProps) {
  if (pending === 0) return null;

  return (
    <Box>
      <Text color={colors.warning}>
        ⚠️ {pending} permission{pending > 1 ? 's' : ''} pending
      </Text>
    </Box>
  );
}
