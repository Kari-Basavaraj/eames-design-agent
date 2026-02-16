// Updated: 2026-02-16
// AskUserQuestion prompt for SDK mode — mirrors Claude Code AskUserQuestion tool
// Shown when the SDK agent needs to ask the user multiple-choice questions

import React from 'react';
import { Box, Text } from 'ink';
import { colors } from '../theme.js';

export interface AskUserQuestionOption {
  label: string;
  description: string;
}

export interface AskUserQuestionItem {
  question: string;
  header: string;
  options: AskUserQuestionOption[];
  multiSelect?: boolean;
}

export interface AskUserQuestionRequest {
  questions: AskUserQuestionItem[];
  currentIndex: number;
}

interface AskUserQuestionPromptProps {
  request: AskUserQuestionRequest;
}

export function AskUserQuestionPrompt({ request }: AskUserQuestionPromptProps) {
  const { questions, currentIndex } = request;
  const current = questions[currentIndex];
  if (!current) return null;

  const progress = `${currentIndex + 1} of ${questions.length}`;

  return (
    <Box flexDirection="column" marginTop={1} marginBottom={1}>
      <Box marginBottom={1}>
        <Text color={colors.primary} bold>
          {'❯ '}
        </Text>
        <Text color="cyan" dimColor>
          [AskUserQuestion] {current.header}:
        </Text>
      </Box>
      <Box marginLeft={2} flexDirection="column">
        <Box marginBottom={1}>
          <Text color="yellow" bold>
            {current.question}
          </Text>
        </Box>
        <Box flexDirection="column" marginLeft={1}>
          {current.options.map((opt, i) => (
            <Box key={i} marginBottom={1}>
              <Text color="gray">
                {'  '}
                {i + 1}.
              </Text>
              <Text color="white">{' ' + opt.label}</Text>
              {opt.description && (
                <Text color="gray" dimColor>
                  {' — ' + opt.description}
                </Text>
              )}
            </Box>
          ))}
          <Box marginTop={1}>
            <Text color="gray" dimColor>
              Type option number, label, or "Other" + your answer. (Question {progress})
            </Text>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
