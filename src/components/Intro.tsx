// Updated: 2026-01-11 22:35:00
// Eames Design Agent - Intro Component

import React from 'react';
import { Box, Text } from 'ink';
import { colors, dimensions } from '../theme.js';
import packageJson from '../../package.json';

interface IntroProps {
  provider: string;
  model: string;
  useSdkMode?: boolean;
}

export function Intro({ provider, model, useSdkMode = false }: IntroProps) {
  return (
    <Box flexDirection="column" marginTop={1} marginBottom={2}>
      {/* Bordered welcome box - Claude Code style */}
      <Box 
        borderStyle="round" 
        borderColor="magenta"
        paddingX={2}
        paddingY={1}
        flexDirection="column"
      >
        <Text color={colors.primary} bold>
          Welcome to Eames v{packageJson.version}
        </Text>
        <Box marginTop={1} flexDirection="column">
          <Text color={colors.muted}>● Autonomous Product Design Agent</Text>
          <Text color={colors.muted}>● Model: <Text color={colors.primary}>{model}</Text></Text>
          <Text color={colors.muted}>● Mode: <Text color={colors.accent}>LangChain (5-phase)</Text></Text>
        </Box>
        <Box marginTop={1}>
          <Text dimColor>Type <Text color={colors.accent}>?</Text> for shortcuts</Text>
        </Box>
      </Box>
    </Box>
  );
}
