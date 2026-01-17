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
  const { introWidth } = dimensions;
  const welcomeText = 'Welcome to Eames';
  const versionText = ` v${packageJson.version}`;
  const fullText = welcomeText + versionText;
  const padding = Math.floor((introWidth - fullText.length - 2) / 2);

  return (
    <Box flexDirection="column" marginTop={2}>
      <Text color={colors.primary}>{'═'.repeat(introWidth)}</Text>
      <Text color={colors.primary}>
        ║{' '.repeat(padding)}
        <Text bold>{welcomeText}</Text>
        <Text color={colors.muted}>{versionText}</Text>
        {' '.repeat(introWidth - fullText.length - padding - 2)}║
      </Text>
      <Text color={colors.primary}>{'═'.repeat(introWidth)}</Text>

      <Box marginTop={1}>
        <Text color={colors.primary} bold>
          {`
███████╗ █████╗ ███╗   ███╗███████╗███████╗
██╔════╝██╔══██╗████╗ ████║██╔════╝██╔════╝
█████╗  ███████║██╔████╔██║█████╗  ███████╗
██╔══╝  ██╔══██║██║╚██╔╝██║██╔══╝  ╚════██║
███████╗██║  ██║██║ ╚═╝ ██║███████╗███████║
╚══════╝╚═╝  ╚═╝╚═╝     ╚═╝╚══════╝╚══════╝`}
        </Text>
      </Box>

      <Box marginY={1} flexDirection="column">
        <Text color={colors.muted}>Developed by <Text color={colors.primary}>Basavaraj Km</Text></Text>
        <Text>Your personal Autonomous Agentic AI Product Design Agent.</Text>
        <Text color={colors.muted}>Named after Charles & Ray Eames.</Text>
        <Text color={colors.muted}>Current model: <Text color={colors.primary}>{model}</Text></Text>
        <Text color={colors.muted}>
          Mode: <Text color={useSdkMode ? colors.primary : colors.muted}>{useSdkMode ? 'SDK (Claude Code)' : 'Standard (5-phase)'}</Text>
        </Text>
        <Text color={colors.muted}>Type /model to change provider, /sdk to toggle SDK mode.</Text>
      </Box>
    </Box>
  );
}
