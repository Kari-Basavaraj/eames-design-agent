// Updated: 2026-01-17 17:21:00
// FilterBar Component - Display active filters

import React from 'react';
import { Box, Text } from 'ink';
import type { TodoFilter, TodoSort } from '../types/todo.js';

interface FilterBarProps {
  filter: TodoFilter;
  sort: TodoSort;
}

export function FilterBar({ filter, sort }: FilterBarProps) {
  const hasActiveFilters = filter.status || filter.priority || filter.search || filter.tags?.length;

  if (!hasActiveFilters) return null;

  return (
    <Box flexDirection="row" paddingX={1} gap={1}>
      <Text color="gray">Filters:</Text>

      {filter.status && (
        <Text color="blue">
          status:{Array.isArray(filter.status) ? filter.status.join(',') : filter.status}
        </Text>
      )}

      {filter.priority && (
        <Text color="yellow">
          priority:{Array.isArray(filter.priority) ? filter.priority.join(',') : filter.priority}
        </Text>
      )}

      {filter.search && (
        <Text color="green">search:"{filter.search}"</Text>
      )}

      {filter.tags && filter.tags.length > 0 && (
        <Text color="magenta">tags:{filter.tags.join(',')}</Text>
      )}

      <Text color="gray">| Sort: {sort.field} {sort.direction}</Text>
    </Box>
  );
}
