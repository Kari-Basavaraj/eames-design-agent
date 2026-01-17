// Updated: 2026-01-17 17:19:00
// TodoList Component - List of todo items with keyboard navigation

import React from 'react';
import { Box, Text } from 'ink';
import { TodoItem } from './TodoItem.js';
import type { Todo, TodoId } from '../types/todo.js';

interface TodoListProps {
  todos: Todo[];
  selectedId: TodoId | null;
  onSelect?: (id: TodoId) => void;
  onToggle?: (id: TodoId) => void;
  emptyMessage?: string;
}

export function TodoList({
  todos,
  selectedId,
  onSelect,
  onToggle,
  emptyMessage = 'No todos yet. Press "a" to add one.',
}: TodoListProps) {
  if (todos.length === 0) {
    return (
      <Box paddingY={1} paddingX={2}>
        <Text color="gray" italic>
          {emptyMessage}
        </Text>
      </Box>
    );
  }

  return (
    <Box flexDirection="column">
      {todos.map((todo) => (
        <TodoItem
          key={todo.id}
          todo={todo}
          isSelected={todo.id === selectedId}
          onSelect={() => onSelect?.(todo.id)}
          onToggle={() => onToggle?.(todo.id)}
        />
      ))}
    </Box>
  );
}
