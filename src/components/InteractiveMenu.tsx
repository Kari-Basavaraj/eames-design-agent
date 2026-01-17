// Updated: 2026-01-13 02:20:00
// Reusable Interactive Menu Component - Claude Code style

import React, { useState, useEffect } from 'react';
import { Box, Text, useInput } from 'ink';
import { colors } from '../theme.js';

export interface MenuItem {
  id: string;
  label: string;
  description?: string;
  enabled?: boolean;
  icon?: string;
  category?: string;
}

interface InteractiveMenuProps {
  title: string;
  items: MenuItem[];
  onSelect?: (item: MenuItem) => void;
  onToggle?: (item: MenuItem) => void;
  onClose: () => void;
  showToggle?: boolean;
  showCategories?: boolean;
}

export function InteractiveMenu({
  title,
  items,
  onSelect,
  onToggle,
  onClose,
  showToggle = false,
  showCategories = false,
}: InteractiveMenuProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [filter, setFilter] = useState('');

  // Filter items based on search
  const filteredItems = items.filter(item =>
    item.label.toLowerCase().includes(filter.toLowerCase()) ||
    item.description?.toLowerCase().includes(filter.toLowerCase()) ||
    item.category?.toLowerCase().includes(filter.toLowerCase())
  );

  // Group by category if enabled
  const groupedItems = showCategories
    ? filteredItems.reduce((acc, item) => {
        const cat = item.category || 'Other';
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(item);
        return acc;
      }, {} as Record<string, MenuItem[]>)
    : { '': filteredItems };

  // Flatten for navigation
  const flatItems = Object.values(groupedItems).flat();

  useInput((input, key) => {
    if (key.escape) {
      onClose();
      return;
    }

    if (key.upArrow) {
      setSelectedIndex(prev => Math.max(0, prev - 1));
      return;
    }

    if (key.downArrow) {
      setSelectedIndex(prev => Math.min(flatItems.length - 1, prev + 1));
      return;
    }

    if (key.return) {
      const item = flatItems[selectedIndex];
      if (item) {
        if (showToggle && onToggle) {
          onToggle(item);
        } else if (onSelect) {
          onSelect(item);
        }
      }
      return;
    }

    // Space to toggle
    if (input === ' ' && showToggle && onToggle) {
      const item = flatItems[selectedIndex];
      if (item) {
        onToggle(item);
      }
      return;
    }

    // Filter input (printable characters)
    if (input && !key.ctrl && !key.meta) {
      if (key.backspace || key.delete) {
        setFilter(prev => prev.slice(0, -1));
      } else if (input.length === 1 && input.match(/[a-zA-Z0-9-_]/)) {
        setFilter(prev => prev + input);
        setSelectedIndex(0);
      }
    }
  });

  // Reset selection when filter changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [filter]);

  const maxVisible = 15;
  const startIndex = Math.max(0, selectedIndex - Math.floor(maxVisible / 2));
  const visibleItems = flatItems.slice(startIndex, startIndex + maxVisible);

  return (
    <Box flexDirection="column" borderStyle="round" borderColor={colors.primary} padding={1}>
      {/* Header */}
      <Box marginBottom={1}>
        <Text color={colors.primary} bold>{title}</Text>
        <Text color={colors.muted}> ({flatItems.length} items)</Text>
      </Box>

      {/* Search filter */}
      {filter && (
        <Box marginBottom={1}>
          <Text color={colors.muted}>Filter: </Text>
          <Text color={colors.white} bold>{filter}</Text>
          <Text color={colors.muted}> (backspace to clear)</Text>
        </Box>
      )}

      {/* Items */}
      {visibleItems.length === 0 ? (
        <Box>
          <Text color={colors.muted}>No items found</Text>
        </Box>
      ) : (
        visibleItems.map((item, idx) => {
          const actualIndex = startIndex + idx;
          const isSelected = actualIndex === selectedIndex;

          return (
            <Box key={item.id} paddingY={0}>
              {/* Selection indicator */}
              <Text color={isSelected ? colors.primary : colors.muted}>
                {isSelected ? '› ' : '  '}
              </Text>

              {/* Toggle checkbox if enabled */}
              {showToggle && (
                <Text color={item.enabled ? colors.success : colors.muted}>
                  {item.enabled ? '[✓] ' : '[ ] '}
                </Text>
              )}

              {/* Icon */}
              {item.icon && (
                <Text>{item.icon} </Text>
              )}

              {/* Label */}
              <Text
                color={isSelected ? colors.white : colors.muted}
                bold={isSelected}
              >
                {item.label}
              </Text>

              {/* Description */}
              {item.description && (
                <Text color={colors.muted} dimColor>
                  {' - '}{item.description.slice(0, 40)}
                  {item.description.length > 40 ? '...' : ''}
                </Text>
              )}
            </Box>
          );
        })
      )}

      {/* Scroll indicator */}
      {flatItems.length > maxVisible && (
        <Box marginTop={1}>
          <Text color={colors.muted} dimColor>
            Showing {startIndex + 1}-{Math.min(startIndex + maxVisible, flatItems.length)} of {flatItems.length}
          </Text>
        </Box>
      )}

      {/* Help */}
      <Box marginTop={1} borderStyle="single" borderTop borderBottom={false} borderLeft={false} borderRight={false} borderColor={colors.muted}>
        <Text color={colors.muted} dimColor>
          ↑↓ navigate • {showToggle ? 'Space toggle • ' : ''}Enter select • Esc close • Type to filter
        </Text>
      </Box>
    </Box>
  );
}
