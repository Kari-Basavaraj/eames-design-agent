// Updated: 2026-01-17 17:20:00
// HelpBar Component - Keyboard shortcuts reference

import React from 'react';
import { Box, Text } from 'ink';

interface Shortcut {
  key: string;
  label: string;
}

interface HelpBarProps {
  shortcuts?: Shortcut[];
}

const DEFAULT_SHORTCUTS: Shortcut[] = [
  { key: 'a', label: 'add' },
  { key: 'e', label: 'edit' },
  { key: 'space', label: 'toggle' },
  { key: 'd', label: 'delete' },
  { key: '/', label: 'search' },
  { key: 'j/k', label: 'navigate' },
  { key: 'q', label: 'quit' },
];

export function HelpBar({ shortcuts = DEFAULT_SHORTCUTS }: HelpBarProps) {
  return (
    <Box
      flexDirection="row"
      paddingX={1}
      paddingY={0}
      borderStyle="single"
      borderColor="gray"
      borderTop={true}
      borderBottom={false}
      borderLeft={false}
      borderRight={false}
    >
      {shortcuts.map((shortcut, index) => (
        <Box key={shortcut.key} marginRight={2}>
          <Text>
            <Text color="cyan" bold>{shortcut.key}</Text>
            <Text color="gray"> {shortcut.label}</Text>
          </Text>
        </Box>
      ))}
    </Box>
  );
}
