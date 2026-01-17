// Updated: 2026-01-17 17:20:00
// Header Component - App title and stats

import React from 'react';
import { Box, Text } from 'ink';

interface HeaderProps {
  title?: string;
  stats: {
    total: number;
    pending: number;
    inProgress: number;
    completed: number;
    overdue: number;
  };
}

export function Header({ title = '✅ Todo', stats }: HeaderProps) {
  const completionRate = stats.total > 0
    ? Math.round((stats.completed / stats.total) * 100)
    : 0;

  return (
    <Box flexDirection="column" paddingX={1} paddingY={1} borderStyle="single" borderColor="gray">
      <Box flexDirection="row" justifyContent="space-between">
        <Text bold color="cyan">{title}</Text>
        <Box>
          <Text color="gray">
            {stats.completed}/{stats.total} done ({completionRate}%)
          </Text>
        </Box>
      </Box>

      <Box flexDirection="row" marginTop={1} gap={2}>
        <Text>
          <Text color="yellow">○ {stats.pending}</Text>
          <Text color="gray"> pending</Text>
        </Text>
        <Text>
          <Text color="blue">◐ {stats.inProgress}</Text>
          <Text color="gray"> in progress</Text>
        </Text>
        <Text>
          <Text color="green">● {stats.completed}</Text>
          <Text color="gray"> done</Text>
        </Text>
        {stats.overdue > 0 && (
          <Text>
            <Text color="red">⚠ {stats.overdue}</Text>
            <Text color="gray"> overdue</Text>
          </Text>
        )}
      </Box>
    </Box>
  );
}
