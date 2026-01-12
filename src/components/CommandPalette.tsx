// Updated: 2026-01-12 04:20:00
// Eames Design Agent - Command Palette Component
// Ctrl+P command palette

import React, { useState, useEffect, useCallback } from 'react';
import { Box, Text, useInput } from 'ink';
import { searchCommands, Command, CATEGORIES } from '../utils/command-palette.js';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (command: Command) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onSelect,
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Command[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Update search results
  useEffect(() => {
    if (isOpen) {
      const matches = searchCommands(query);
      setResults(matches);
      setSelectedIndex(0);
    }
  }, [query, isOpen]);

  // Reset on open
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Handle keyboard input
  useInput(
    (input, key) => {
      if (!isOpen) return;

      if (key.escape) {
        onClose();
        return;
      }

      if (key.return) {
        if (results[selectedIndex]) {
          onSelect(results[selectedIndex]);
          onClose();
        }
        return;
      }

      if (key.upArrow || (key.ctrl && input === 'p')) {
        setSelectedIndex((i) => Math.max(0, i - 1));
        return;
      }

      if (key.downArrow || (key.ctrl && input === 'n')) {
        setSelectedIndex((i) => Math.min(results.length - 1, i + 1));
        return;
      }

      if (key.backspace || key.delete) {
        setQuery((q) => q.slice(0, -1));
        return;
      }

      if (input && !key.ctrl && !key.meta) {
        setQuery((q) => q + input);
      }
    },
    { isActive: isOpen }
  );

  if (!isOpen) return null;

  const getCategoryInfo = (category: string) => {
    return CATEGORIES[category] || { name: category, color: 'white', icon: '○' };
  };

  return (
    <Box
      flexDirection="column"
      borderStyle="round"
      borderColor="cyan"
      paddingX={1}
      width={60}
    >
      {/* Header */}
      <Box marginBottom={1}>
        <Text color="cyan" bold>
          Command Palette
        </Text>
        <Text color="gray"> (Ctrl+P)</Text>
      </Box>

      {/* Search input */}
      <Box marginBottom={1}>
        <Text color="yellow">❯ </Text>
        <Text>{query}</Text>
        <Text color="gray">█</Text>
      </Box>

      {/* Results */}
      <Box flexDirection="column">
        {results.length === 0 ? (
          <Text color="gray">No commands found</Text>
        ) : (
          results.slice(0, 10).map((cmd, index) => {
            const isSelected = index === selectedIndex;
            const catInfo = getCategoryInfo(cmd.category);

            return (
              <Box key={cmd.id}>
                <Text color={isSelected ? 'cyan' : 'white'}>
                  {isSelected ? '❯ ' : '  '}
                </Text>
                <Text color={catInfo.color as any}>{catInfo.icon} </Text>
                <Text bold={isSelected}>{cmd.name}</Text>
                {cmd.shortcut && (
                  <Text color="gray"> [{cmd.shortcut}]</Text>
                )}
              </Box>
            );
          })
        )}
      </Box>

      {/* Footer */}
      {results.length > 10 && (
        <Box marginTop={1}>
          <Text color="gray">
            +{results.length - 10} more results
          </Text>
        </Box>
      )}

      {/* Help */}
      <Box marginTop={1} borderStyle="single" borderColor="gray" paddingX={1}>
        <Text color="gray">
          ↑↓ navigate • Enter select • Esc close
        </Text>
      </Box>
    </Box>
  );
};

export default CommandPalette;
