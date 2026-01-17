// Updated: 2026-01-17 17:17:00
// Todo Hook - React hook for todo state management

import { useReducer, useCallback, useMemo } from 'react';
import type {
  Todo,
  TodoId,
  CreateTodoInput,
  UpdateTodoInput,
  TodoFilter,
  TodoSort,
} from '../types/todo.js';
import {
  todoReducer,
  initialState,
  createTodo,
  createList,
  selectFilteredTodos,
  selectTodoById,
  selectLists,
  selectTodoStats,
} from '../store/todo-store.js';

export function useTodos() {
  const [state, dispatch] = useReducer(todoReducer, initialState);

  // Actions
  const addTodo = useCallback((input: CreateTodoInput) => {
    const todo = createTodo(input);
    dispatch({ type: 'ADD_TODO', payload: todo });
    return todo;
  }, []);

  const updateTodo = useCallback((id: TodoId, updates: UpdateTodoInput) => {
    dispatch({ type: 'UPDATE_TODO', payload: { id, updates } });
  }, []);

  const deleteTodo = useCallback((id: TodoId) => {
    dispatch({ type: 'DELETE_TODO', payload: id });
  }, []);

  const toggleTodo = useCallback((id: TodoId) => {
    dispatch({ type: 'TOGGLE_TODO', payload: id });
  }, []);

  const selectTodo = useCallback((id: TodoId | null) => {
    dispatch({ type: 'SELECT_TODO', payload: id });
  }, []);

  const setFilter = useCallback((filter: Partial<TodoFilter>) => {
    dispatch({ type: 'SET_FILTER', payload: filter });
  }, []);

  const setSort = useCallback((sort: TodoSort) => {
    dispatch({ type: 'SET_SORT', payload: sort });
  }, []);

  const addList = useCallback((name: string, color?: string, icon?: string) => {
    const list = createList(name, color, icon);
    dispatch({ type: 'CREATE_LIST', payload: list });
    return list;
  }, []);

  const deleteList = useCallback((id: string) => {
    dispatch({ type: 'DELETE_LIST', payload: id });
  }, []);

  const setActiveList = useCallback((id: string | null) => {
    dispatch({ type: 'SET_ACTIVE_LIST', payload: id });
  }, []);

  // Selectors
  const todos = useMemo(() => selectFilteredTodos(state), [state]);
  const lists = useMemo(() => selectLists(state), [state]);
  const stats = useMemo(() => selectTodoStats(state), [state]);
  const selectedTodo = useMemo(
    () => (state.selectedTodoId ? selectTodoById(state, state.selectedTodoId) : null),
    [state]
  );

  return {
    // State
    todos,
    lists,
    stats,
    selectedTodo,
    selectedTodoId: state.selectedTodoId,
    filter: state.filter,
    sort: state.sort,
    activeListId: state.activeListId,

    // Actions
    addTodo,
    updateTodo,
    deleteTodo,
    toggleTodo,
    selectTodo,
    setFilter,
    setSort,
    addList,
    deleteList,
    setActiveList,
  };
}

export type UseTodosReturn = ReturnType<typeof useTodos>;
