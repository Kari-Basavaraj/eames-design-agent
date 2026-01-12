// Updated: 2026-01-12 04:20:00
// Eames Design Agent - History Search Component
// Ctrl+R reverse history search

import React, { useState, useEffect } from 'react';
import { Box, Text, useInput } from 'ink';
import {
  searchHistory,
  SearchResult,
  formatWithHighlights,
  getRecentQueries,
} from '../utils/history-search.js';

interface HistorySearchProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (query: string) => void;
  cwd?: string;
}

export const HistorySearch: React.FC<HistorySearchProps> = ({
  isOpen,
  onClose,
  onSelect,
  cwd,
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Update search results
  useEffect(() => {
    if (isOpen) {
      if (query) {
        const matches = searchHistory(query, { cwd, limit: 15 });
        setResults(
          matches.map((m) => ({
            entry: m.entry,
            score: m.score,
            matchIndices: m.matchIndices,
          }))
        );
      } else {
        // Show recent queries when no search
        const recent = getRecentQueries(15, cwd);
        setResults(
          recent.map((entry) => ({
            entry,
            score: 0,
            matchIndices: [],
          }))
        );
      }
      setSelectedIndex(0);
    }
  }, [query, isOpen, cwd]);

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
          onSelect(results[selectedIndex].entry.query);
          onClose();
        }
        return;
      }

      // Ctrl+R to cycle through results
      if (key.ctrl && input === 'r') {
        setSelectedIndex((i) => (i + 1) % Math.max(1, results.length));
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

  const formatTime = (timestamp: number): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - timestamp;

    if (diff < 60000) return 'just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`;

    return date.toLocaleDateString();
  };

  const highlightMatch = (text: string, indices: number[]): React.ReactNode => {
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
      borderColor="magenta"
      paddingX={1}
      width={70}
    >
      {/* Header */}
      <Box marginBottom={1}>
        <Text color="magenta" bold>
          History Search
        </Text>
        <Text color="gray"> (Ctrl+R)</Text>
      </Box>

      {/* Search input */}
      <Box marginBottom={1}>
        <Text color="magenta">(reverse-i-search)`</Text>
        <Text color="yellow">{query}</Text>
        <Text color="magenta">':</Text>
        <Text color="gray">█</Text>
      </Box>

      {/* Results */}
      <Box flexDirection="column">
        {results.length === 0 ? (
          <Text color="gray">
            {query ? 'No matching history' : 'No history yet'}
          </Text>
        ) : (
          results.slice(0, 10).map((result, index) => {
            const isSelected = index === selectedIndex;
            const truncatedQuery =
              result.entry.query.length > 55
                ? result.entry.query.slice(0, 52) + '...'
                : result.entry.query;

            return (
              <Box key={index} flexDirection="row">
                <Text color={isSelected ? 'magenta' : 'white'}>
                  {isSelected ? '❯ ' : '  '}
                </Text>
                <Box width={55}>
                  {isSelected ? (
                    highlightMatch(truncatedQuery, result.matchIndices)
                  ) : (
                    <Text dimColor={!isSelected}>
                      {truncatedQuery}
                    </Text>
                  )}
                </Box>
                <Text color="gray" dimColor>
                  {' '}
                  {formatTime(result.entry.timestamp)}
                </Text>
              </Box>
            );
          })
        )}
      </Box>

      {/* Footer */}
      {results.length > 10 && (
        <Box marginTop={1}>
          <Text color="gray">+{results.length - 10} more</Text>
        </Box>
      )}

      {/* Help */}
      <Box marginTop={1} borderStyle="single" borderColor="gray" paddingX={1}>
        <Text color="gray">
          Ctrl+R next • ↑↓ navigate • Enter select • Esc cancel
        </Text>
      </Box>
    </Box>
  );
};

export default HistorySearch;
