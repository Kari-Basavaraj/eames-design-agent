// Updated: 2026-01-17 17:18:00
// TodoItem Component - Single todo item display

import React from 'react';
import { Box, Text } from 'ink';
import type { Todo } from '../types/todo.js';

interface TodoItemProps {
  todo: Todo;
  isSelected?: boolean;
  onToggle?: () => void;
  onSelect?: () => void;
}

const PRIORITY_COLORS = {
  high: 'red',
  medium: 'yellow',
  low: 'gray',
} as const;

const STATUS_ICONS = {
  pending: '○',
  in_progress: '◐',
  completed: '●',
} as const;

export function TodoItem({ todo, isSelected = false, onToggle, onSelect }: TodoItemProps) {
  const statusIcon = STATUS_ICONS[todo.status];
  const priorityColor = PRIORITY_COLORS[todo.priority];
  const isCompleted = todo.status === 'completed';

  const formatDueDate = (date?: Date) => {
    if (!date) return null;
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

    if (days < 0) return { text: `${Math.abs(days)}d overdue`, color: 'red' };
    if (days === 0) return { text: 'Today', color: 'yellow' };
    if (days === 1) return { text: 'Tomorrow', color: 'cyan' };
    if (days <= 7) return { text: `${days}d`, color: 'green' };
    return { text: date.toLocaleDateString(), color: 'gray' };
  };

  const dueInfo = formatDueDate(todo.dueDate);

  return (
    <Box flexDirection="row" paddingX={1}>
      {/* Selection indicator */}
      <Text color={isSelected ? 'cyan' : undefined}>
        {isSelected ? '▸ ' : '  '}
      </Text>

      {/* Status icon */}
      <Text color={isCompleted ? 'green' : 'white'}>{statusIcon} </Text>

      {/* Priority indicator */}
      <Text color={priorityColor}>{'■'} </Text>

      {/* Title */}
      <Box flexGrow={1}>
        <Text
          strikethrough={isCompleted}
          dimColor={isCompleted}
        >
          {todo.title}
        </Text>
      </Box>

      {/* Tags */}
      {todo.tags.length > 0 && (
        <Box marginRight={1}>
          {todo.tags.slice(0, 2).map((tag, i) => (
            <Text key={tag} color="blue" dimColor>
              {i > 0 ? ' ' : ''}#{tag}
            </Text>
          ))}
          {todo.tags.length > 2 && (
            <Text color="blue" dimColor> +{todo.tags.length - 2}</Text>
          )}
        </Box>
      )}

      {/* Due date */}
      {dueInfo && !isCompleted && (
        <Text color={dueInfo.color as any}>{dueInfo.text}</Text>
      )}
    </Box>
  );
}
