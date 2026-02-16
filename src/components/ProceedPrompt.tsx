// Updated: 2026-02-16
// Proceed checkpoint - agent asks "Should I proceed?" before next phase
// Like Claude Code's intelligent follow-up questions

import React from 'react';
import { Box, Text } from 'ink';
import { colors } from '../theme.js';
import type { ProceedCheckpointRequest } from '../langchain/useAgentExecution.js';

interface ProceedPromptProps {
  request: ProceedCheckpointRequest;
}

export function ProceedPrompt({ request }: ProceedPromptProps) {
  const { completed, question } = request;

  return (
    <Box flexDirection="column" marginTop={1} marginBottom={1}>
      <Box marginBottom={1}>
        <Text color={colors.primary} bold>
          {'❯ '}
        </Text>
        <Text color="green" dimColor>
          I've completed {completed}.
        </Text>
      </Box>
      <Box marginLeft={2} flexDirection="column">
        <Box marginBottom={1}>
          <Text color="yellow" bold>
            {question}
          </Text>
        </Box>
        <Box>
          <Text color="gray" dimColor>
            (Y) Proceed  (n) Stop and show results
          </Text>
        </Box>
      </Box>
    </Box>
  );
}
