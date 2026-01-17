// Updated: 2026-01-17 17:23:00
// App Component - Main todo application

import React, { useState, useEffect, useCallback } from 'react';
import { Box, Text, useApp, useInput } from 'ink';
import { Header } from './Header.js';
import { TodoList } from './TodoList.js';
import { TodoInput } from './TodoInput.js';
import { HelpBar } from './HelpBar.js';
import { FilterBar } from './FilterBar.js';
import { useTodos } from '../hooks/useTodos.js';
import type { TodoStatus, TodoPriority } from '../types/todo.js';

type AppMode = 'normal' | 'add' | 'edit' | 'search' | 'confirm-delete';

export function App() {
  const { exit } = useApp();
  const {
    todos,
    stats,
    selectedTodoId,
    selectedTodo,
    filter,
    sort,
    addTodo,
    updateTodo,
    deleteTodo,
    toggleTodo,
    selectTodo,
    setFilter,
  } = useTodos();

  const [mode, setMode] = useState<AppMode>('normal');
  const [message, setMessage] = useState<string | null>(null);

  // Clear message after timeout
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 2000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  // Auto-select first todo
  useEffect(() => {
    if (todos.length > 0 && !selectedTodoId) {
      selectTodo(todos[0].id);
    }
  }, [todos, selectedTodoId, selectTodo]);

  const showMessage = useCallback((msg: string) => {
    setMessage(msg);
  }, []);

  // Keyboard input handling
  useInput((input, key) => {
    if (mode !== 'normal') return;

    // Quit
    if (input === 'q') {
      exit();
      return;
    }

    // Add new todo
    if (input === 'a') {
      setMode('add');
      return;
    }

    // Edit selected todo
    if (input === 'e' && selectedTodo) {
      setMode('edit');
      return;
    }

    // Delete selected todo
    if (input === 'd' && selectedTodo) {
      setMode('confirm-delete');
      return;
    }

    // Search
    if (input === '/') {
      setMode('search');
      return;
    }

    // Clear filter
    if (input === 'c') {
      setFilter({});
      showMessage('Filters cleared');
      return;
    }

    // Toggle todo status
    if (input === ' ' && selectedTodo) {
      toggleTodo(selectedTodo.id);
      showMessage(selectedTodo.status === 'completed' ? 'Marked as pending' : 'Marked as complete');
      return;
    }

    // Cycle priority
    if (input === 'p' && selectedTodo) {
      const priorities: TodoPriority[] = ['low', 'medium', 'high'];
      const currentIndex = priorities.indexOf(selectedTodo.priority);
      const nextPriority = priorities[(currentIndex + 1) % priorities.length];
      updateTodo(selectedTodo.id, { priority: nextPriority });
      showMessage(`Priority: ${nextPriority}`);
      return;
    }

    // Navigation
    if (input === 'j' || key.downArrow) {
      const currentIndex = todos.findIndex(t => t.id === selectedTodoId);
      if (currentIndex < todos.length - 1) {
        selectTodo(todos[currentIndex + 1].id);
      }
      return;
    }

    if (input === 'k' || key.upArrow) {
      const currentIndex = todos.findIndex(t => t.id === selectedTodoId);
      if (currentIndex > 0) {
        selectTodo(todos[currentIndex - 1].id);
      }
      return;
    }

    // Go to top/bottom
    if (input === 'g') {
      if (todos.length > 0) selectTodo(todos[0].id);
      return;
    }

    if (input === 'G') {
      if (todos.length > 0) selectTodo(todos[todos.length - 1].id);
      return;
    }

    // Filter by status
    if (input === '1') {
      setFilter({ status: 'pending' });
      showMessage('Filter: Pending');
      return;
    }
    if (input === '2') {
      setFilter({ status: 'in_progress' });
      showMessage('Filter: In Progress');
      return;
    }
    if (input === '3') {
      setFilter({ status: 'completed' });
      showMessage('Filter: Completed');
      return;
    }
    if (input === '0') {
      setFilter({ status: undefined });
      showMessage('Filter: All');
      return;
    }
  });

  // Handle add todo
  const handleAddTodo = useCallback((title: string) => {
    addTodo({ title });
    setMode('normal');
    showMessage('Todo added');
  }, [addTodo, showMessage]);

  // Handle edit todo
  const handleEditTodo = useCallback((title: string) => {
    if (selectedTodo) {
      updateTodo(selectedTodo.id, { title });
      showMessage('Todo updated');
    }
    setMode('normal');
  }, [selectedTodo, updateTodo, showMessage]);

  // Handle search
  const handleSearch = useCallback((query: string) => {
    setFilter({ search: query || undefined });
    setMode('normal');
    if (query) {
      showMessage(`Searching: "${query}"`);
    }
  }, [setFilter, showMessage]);

  // Handle delete confirmation
  useInput((input, key) => {
    if (mode !== 'confirm-delete') return;

    if (input === 'y' || input === 'Y') {
      if (selectedTodo) {
        deleteTodo(selectedTodo.id);
        showMessage('Todo deleted');
      }
      setMode('normal');
      return;
    }

    if (input === 'n' || input === 'N' || key.escape) {
      setMode('normal');
      return;
    }
  });

  // Handle escape in input modes
  useInput((input, key) => {
    if (key.escape && mode !== 'normal' && mode !== 'confirm-delete') {
      setMode('normal');
    }
  });

  return (
    <Box flexDirection="column" padding={1}>
      {/* Header */}
      <Header stats={stats} />

      {/* Filter bar */}
      <FilterBar filter={filter} sort={sort} />

      {/* Message */}
      {message && (
        <Box paddingX={1}>
          <Text color="green">✓ {message}</Text>
        </Box>
      )}

      {/* Delete confirmation */}
      {mode === 'confirm-delete' && (
        <Box paddingX={1} paddingY={1}>
          <Text color="red">
            Delete "{selectedTodo?.title}"? (y/n)
          </Text>
        </Box>
      )}

      {/* Input modes */}
      {mode === 'add' && (
        <Box marginY={1}>
          <TodoInput
            label="New:"
            placeholder="What needs to be done?"
            onSubmit={handleAddTodo}
            onCancel={() => setMode('normal')}
          />
        </Box>
      )}

      {mode === 'edit' && selectedTodo && (
        <Box marginY={1}>
          <TodoInput
            label="Edit:"
            initialValue={selectedTodo.title}
            onSubmit={handleEditTodo}
            onCancel={() => setMode('normal')}
          />
        </Box>
      )}

      {mode === 'search' && (
        <Box marginY={1}>
          <TodoInput
            label="Search:"
            placeholder="Search todos..."
            initialValue={filter.search || ''}
            onSubmit={handleSearch}
            onCancel={() => setMode('normal')}
          />
        </Box>
      )}

      {/* Todo list */}
      <Box flexDirection="column" marginY={1} flexGrow={1}>
        <TodoList
          todos={todos}
          selectedId={selectedTodoId}
          onSelect={selectTodo}
          onToggle={toggleTodo}
        />
      </Box>

      {/* Help bar */}
      <HelpBar />
    </Box>
  );
}
