// Updated: 2026-02-16 14:00:00
// Eames Design Agent - Cost/Token Counter
// Claude Code-style real-time usage display shown after each turn

import React from 'react';
import { Box, Text } from 'ink';
import { colors } from '../theme.js';
import type { CostInfo } from '../sdk/useSdkExecution.js';

interface CostViewProps {
  cost: CostInfo;
  sessionId?: string;
}

export function CostView({ cost, sessionId }: CostViewProps) {
  if (cost.totalTokens === 0) return null;

  return (
    <Box marginTop={0}>
      <Text color={colors.muted}>
        {cost.formattedTokens} tokens · {cost.formattedCost}
      </Text>
      {sessionId && (
        <Text color={colors.mutedDark}> · session {sessionId.slice(0, 8)}</Text>
      )}
    </Box>
  );
}
