// Updated: 2026-02-16
// SDK mode: minimal Claude Code-style header - single line

import React from 'react';
import { Box, Text } from 'ink';
import { colors } from '../theme.js';

interface SdkIntroProps {
  /** Model in use (Claude direct or openai/gpt-5.2 via OpenRouter) */
  model: string;
}

/**
 * Minimal SDK header - Claude Code style.
 */
export function SdkIntro({ model }: SdkIntroProps) {
  return (
    <Box marginTop={1} marginBottom={1}>
      <Text color={colors.muted} dimColor>{model}</Text>
    </Box>
  );
}
