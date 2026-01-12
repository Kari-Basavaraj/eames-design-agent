// Updated: 2026-01-12 04:20:00
// Eames Design Agent - Fuzzy File Finder Component
// Quick file navigation

import React, { useState, useEffect, useMemo } from 'react';
import { Box, Text, useInput } from 'ink';
import {
  searchFiles,
  FileSearchResult,
  getFileIndex,
  getFileIcon,
  formatFileSize,
} from '../utils/fuzzy-finder.js';

interface FuzzyFinderProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (path: string) => void;
  cwd?: string;
}

export const FuzzyFinder: React.FC<FuzzyFinderProps> = ({
  isOpen,
  onClose,
  onSelect,
  cwd = process.cwd(),
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<FileSearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [loading, setLoading] = useState(false);

  // Load file index
  const fileIndex = useMemo(() => {
    if (!isOpen) return [];
    setLoading(true);
    const index = getFileIndex(cwd);
    setLoading(false);
    return index;
  }, [isOpen, cwd]);

  // Update search results
  useEffect(() => {
    if (isOpen && fileIndex.length > 0) {
      const matches = searchFiles(query, fileIndex, 15);
      setResults(matches);
      setSelectedIndex(0);
    }
  }, [query, isOpen, fileIndex]);

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
          onSelect(results[selectedIndex].entry.path);
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

  const highlightMatch = (
    text: string,
    indices: number[]
  ): React.ReactNode => {
    if (indices.length === 0) return <Text>{text}</Text>;

    const parts: React.ReactNode[] = [];
    let lastIndex = 0;

    for (const index of indices) {
      if (index > lastIndex) {
        parts.push(
          <Text key={`text-${lastIndex}`}>{text.slice(lastIndex, index)}</Text>
        );
      }
      parts.push(
        <Text key={`match-${index}`} color="yellow" bold>
          {text[index]}
        </Text>
      );
      lastIndex = index + 1;
    }

    if (lastIndex < text.length) {
      parts.push(<Text key={`text-${lastIndex}`}>{text.slice(lastIndex)}</Text>);
    }

    return <>{parts}</>;
  };

  return (
    <Box
      flexDirection="column"
      borderStyle="round"
      borderColor="green"
      paddingX={1}
      width={70}
    >
      {/* Header */}
      <Box marginBottom={1}>
        <Text color="green" bold>
          Find File
        </Text>
        <Text color="gray"> ({fileIndex.length} files indexed)</Text>
      </Box>

      {/* Search input */}
      <Box marginBottom={1}>
        <Text color="green">❯ </Text>
        <Text>{query}</Text>
        <Text color="gray">█</Text>
      </Box>

      {/* Loading state */}
      {loading && (
        <Box>
          <Text color="gray">Indexing files...</Text>
        </Box>
      )}

      {/* Results */}
      <Box flexDirection="column">
        {!loading && results.length === 0 ? (
          <Text color="gray">
            {query ? 'No matching files' : 'Type to search files'}
          </Text>
        ) : (
          results.slice(0, 12).map((result, index) => {
            const isSelected = index === selectedIndex;
            const entry = result.entry;
            const icon = getFileIcon(entry);

            // Truncate path if too long
            const maxPathLen = 50;
            const displayPath =
              entry.relativePath.length > maxPathLen
                ? '...' + entry.relativePath.slice(-maxPathLen + 3)
                : entry.relativePath;

            return (
              <Box key={entry.path} flexDirection="row">
                <Text color={isSelected ? 'green' : 'white'}>
                  {isSelected ? '❯ ' : '  '}
                </Text>
                <Text>{icon} </Text>
                <Box width={52}>
                  {isSelected ? (
                    highlightMatch(displayPath, result.matchIndices)
                  ) : (
                    <Text dimColor={!isSelected}>{displayPath}</Text>
                  )}
                </Box>
                <Text color="gray" dimColor>
                  {formatFileSize(entry.size)}
                </Text>
              </Box>
            );
          })
        )}
      </Box>

      {/* Preview hint */}
      {results[selectedIndex] && (
        <Box marginTop={1} borderStyle="single" borderColor="gray" paddingX={1}>
          <Text color="gray">
            {results[selectedIndex].entry.path}
          </Text>
        </Box>
      )}

      {/* Help */}
      <Box marginTop={1}>
        <Text color="gray">
          ↑↓ navigate • Enter open • Esc close
        </Text>
      </Box>
    </Box>
  );
};

export default FuzzyFinder;
