// Updated: 2026-02-16
// Clarification prompt shown when agent detects a vague user query
// Gathers details before proceeding to research/plan

import React from 'react';
import { Box, Text } from 'ink';
import { colors } from '../theme.js';
import type { ClarificationRequest } from '../langchain/useAgentExecution.js';

interface ClarificationPromptProps {
  request: ClarificationRequest;
}

export function ClarificationPrompt({ request }: ClarificationPromptProps) {
  const { questions, currentIndex } = request;
  const currentQuestion = questions[currentIndex];
  const progress = `${currentIndex + 1} of ${questions.length}`;

  return (
    <Box flexDirection="column" marginTop={1} marginBottom={1}>
      <Box marginBottom={1}>
        <Text color={colors.primary} bold>
          {'❯ '}
        </Text>
        <Text color="cyan" dimColor>
          To scope your request, a few questions:
        </Text>
      </Box>
      <Box marginLeft={2} flexDirection="column">
        <Box marginBottom={1}>
          <Text color="yellow" bold>
            {currentQuestion}
          </Text>
        </Box>
        <Box>
          <Text color="gray" dimColor>
            (Question {progress} — press Enter to skip)
          </Text>
        </Box>
      </Box>
    </Box>
  );
}
