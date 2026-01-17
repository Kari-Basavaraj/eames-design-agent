// History Search Component (Ctrl+R)
// Fuzzy finder for command history - Claude Code style

import React from 'react';
import { Box, Text } from 'ink';
import { colors } from '../theme.js';

interface HistorySearchProps {
  commands: string[];
  query: string;
  selectedIndex: number;
  visible: boolean;
}

export function HistorySearch({ commands, query, selectedIndex, visible }: HistorySearchProps) {
  if (!visible || commands.length === 0) return null;

  // Show up to 10 results
  const visibleCommands = commands.slice(0, 10);

  return (
    <Box flexDirection="column" marginBottom={1} borderStyle="round" borderColor={colors.accent}>
      <Box paddingX={1}>
        <Text bold color={colors.accent}>History Search</Text>
        {query && <Text color={colors.muted}> - "{query}"</Text>}
      </Box>
      
      {visibleCommands.map((cmd, idx) => {
        const isSelected = idx === selectedIndex;
        const displayCmd = cmd.length > 80 ? cmd.slice(0, 77) + '...' : cmd;
        
        return (
          <Box key={idx} paddingX={1}>
            {isSelected ? (
              <>
                <Text color={colors.primary} bold>❯ </Text>
                <Text backgroundColor={colors.selectedBg} color={colors.white}>{displayCmd}</Text>
              </>
            ) : (
              <>
                <Text color={colors.muted}>  </Text>
                <Text color={colors.text}>{displayCmd}</Text>
              </>
            )}
          </Box>
        );
      })}
      
      {commands.length > 10 && (
        <Box paddingX={1}>
          <Text color={colors.muted} dimColor>
            ... {commands.length - 10} more (keep typing to filter)
          </Text>
        </Box>
      )}
      
      <Box paddingX={1} marginTop={1}>
        <Text color={colors.muted} dimColor>
          ↑↓ navigate • Enter select • Esc cancel • Ctrl+R cycle
        </Text>
      </Box>
    </Box>
  );
}
