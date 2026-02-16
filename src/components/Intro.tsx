// Updated: 2026-02-16 00:00:00
// Eames Design Agent - Intro Component
// Claude Code-inspired layout with Eames branding and blue theme

import React from 'react';
import { Box, Text } from 'ink';
import { colors } from '../theme.js';
import packageJson from '../../package.json';

interface IntroProps {
  provider: string;
  model: string;
  useSdkMode?: boolean;
}

export function Intro({ provider, model, useSdkMode = false }: IntroProps) {
  const version = packageJson.version;
  const modeLabel = useSdkMode ? 'SDK' : 'LangChain';

  return (
    <Box flexDirection="column" marginTop={1} marginBottom={1}>
      {/* Eames ASCII Art - compact and clean */}
      <Text color={colors.primary} bold>
{`  ███████╗ █████╗ ███╗   ███╗███████╗███████╗
  ██╔════╝██╔══██╗████╗ ████║██╔════╝██╔════╝
  █████╗  ███████║██╔████╔██║█████╗  ███████╗
  ██╔══╝  ██╔══██║██║╚██╔╝██║██╔══╝  ╚════██║
  ███████╗██║  ██║██║ ╚═╝ ██║███████╗███████║
  ╚══════╝╚═╝  ╚═╝╚═╝     ╚═╝╚══════╝╚══════╝`}
      </Text>

      <Box marginTop={1} flexDirection="column">
        <Text>
          <Text color={colors.primary} bold>✦ Eames</Text>
          <Text color={colors.muted}> v{version}</Text>
          <Text color={colors.muted}> — Autonomous Design Agent</Text>
        </Text>
      </Box>

      <Box marginTop={1} flexDirection="column">
        <Text color={colors.muted}>  model: <Text color={colors.white}>{model}</Text></Text>
        <Text color={colors.muted}>  mode:  <Text color={colors.white}>{modeLabel}</Text></Text>
        <Text color={colors.muted}>  cwd:   <Text color={colors.white}>{process.cwd()}</Text></Text>
      </Box>

      <Box marginTop={1}>
        <Text color={colors.muted}>  Type <Text color={colors.primary}>/help</Text> for commands, <Text color={colors.primary}>Esc</Text> to cancel</Text>
      </Box>
    </Box>
  );
}
