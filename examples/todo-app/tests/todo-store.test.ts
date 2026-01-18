// Updated: 2026-01-17 17:25:00
// Todo Store Tests

import { describe, it, expect, beforeEach } from 'bun:test';
import {
  todoReducer,
  initialState,
  createTodo,
  createList,
  selectFilteredTodos,
  selectTodoStats,
} from '../src/store/todo-store.js';
import type { TodoAppState, Todo } from '../src/types/todo.js';

describe('Todo Store', () => {
  describe('createTodo', () => {
    it('creates a todo with default values', () => {
      const todo = createTodo({ title: 'Test todo' });

      expect(todo.title).toBe('Test todo');
      expect(todo.status).toBe('pending');
      expect(todo.priority).toBe('medium');
      expect(todo.tags).toEqual([]);
      expect(todo.id).toMatch(/^todo-/);
    });

    it('creates a todo with custom values', () => {
      const dueDate = new Date('2026-02-01');
      const todo = createTodo({
        title: 'Custom todo',
        description: 'A description',
        priority: 'high',
        tags: ['work', 'urgent'],
        dueDate,
      });

      expect(todo.title).toBe('Custom todo');
      expect(todo.description).toBe('A description');
      expect(todo.priority).toBe('high');
      expect(todo.tags).toEqual(['work', 'urgent']);
      expect(todo.dueDate).toEqual(dueDate);
    });
  });

  describe('todoReducer', () => {
    let state: TodoAppState;

    beforeEach(() => {
      state = { ...initialState, todos: new Map(), lists: new Map() };
    });

    describe('ADD_TODO', () => {
      it('adds a todo to state', () => {
        const todo = createTodo({ title: 'New todo' });
        const newState = todoReducer(state, { type: 'ADD_TODO', payload: todo });

        expect(newState.todos.size).toBe(1);
        expect(newState.todos.get(todo.id)).toEqual(todo);
      });
    });

    describe('UPDATE_TODO', () => {
      it('updates a todo', () => {
        const todo = createTodo({ title: 'Original' });
        state.todos.set(todo.id, todo);

        const newState = todoReducer(state, {
          type: 'UPDATE_TODO',
          payload: { id: todo.id, updates: { title: 'Updated' } },
        });

        expect(newState.todos.get(todo.id)?.title).toBe('Updated');
      });

      it('sets completedAt when marking as completed', () => {
        const todo = createTodo({ title: 'Test' });
        state.todos.set(todo.id, todo);

        const newState = todoReducer(state, {
          type: 'UPDATE_TODO',
          payload: { id: todo.id, updates: { status: 'completed' } },
        });

        expect(newState.todos.get(todo.id)?.completedAt).toBeDefined();
      });

      it('clears completedAt when marking as pending', () => {
        const todo = createTodo({ title: 'Test' });
        todo.status = 'completed';
        todo.completedAt = new Date();
        state.todos.set(todo.id, todo);

        const newState = todoReducer(state, {
          type: 'UPDATE_TODO',
          payload: { id: todo.id, updates: { status: 'pending' } },
        });

        expect(newState.todos.get(todo.id)?.completedAt).toBeUndefined();
      });
    });

    describe('DELETE_TODO', () => {
      it('removes a todo from state', () => {
        const todo = createTodo({ title: 'To delete' });
        state.todos.set(todo.id, todo);

        const newState = todoReducer(state, { type: 'DELETE_TODO', payload: todo.id });

        expect(newState.todos.size).toBe(0);
      });

      it('clears selection if deleted todo was selected', () => {
        const todo = createTodo({ title: 'Selected' });
        state.todos.set(todo.id, todo);
        state.selectedTodoId = todo.id;

        const newState = todoReducer(state, { type: 'DELETE_TODO', payload: todo.id });

        expect(newState.selectedTodoId).toBeNull();
      });
    });

    describe('TOGGLE_TODO', () => {
      it('toggles pending to completed', () => {
        const todo = createTodo({ title: 'Test' });
        state.todos.set(todo.id, todo);

        const newState = todoReducer(state, { type: 'TOGGLE_TODO', payload: todo.id });

        expect(newState.todos.get(todo.id)?.status).toBe('completed');
      });

      it('toggles completed to pending', () => {
        const todo = createTodo({ title: 'Test' });
        todo.status = 'completed';
        state.todos.set(todo.id, todo);

        const newState = todoReducer(state, { type: 'TOGGLE_TODO', payload: todo.id });

        expect(newState.todos.get(todo.id)?.status).toBe('pending');
      });
    });

    describe('SET_FILTER', () => {
      it('updates filter state', () => {
        const newState = todoReducer(state, {
          type: 'SET_FILTER',
          payload: { status: 'pending', priority: 'high' },
        });

        expect(newState.filter.status).toBe('pending');
        expect(newState.filter.priority).toBe('high');
      });

      it('merges with existing filter', () => {
        state.filter = { status: 'pending' };

        const newState = todoReducer(state, {
          type: 'SET_FILTER',
          payload: { priority: 'high' },
        });

        expect(newState.filter.status).toBe('pending');
        expect(newState.filter.priority).toBe('high');
      });
    });
  });

  describe('selectFilteredTodos', () => {
    let state: TodoAppState;

    beforeEach(() => {
      state = { ...initialState, todos: new Map(), lists: new Map() };

      const todos = [
        { ...createTodo({ title: 'High priority', priority: 'high' }), status: 'pending' as const },
        { ...createTodo({ title: 'Medium priority' }), status: 'pending' as const },
        { ...createTodo({ title: 'Completed task' }), status: 'completed' as const },
        { ...createTodo({ title: 'Tagged task', tags: ['work'] }), status: 'pending' as const },
      ];

      todos.forEach((todo) => state.todos.set(todo.id, todo));
    });

    it('returns all todos when no filter', () => {
      const todos = selectFilteredTodos(state);
      expect(todos.length).toBe(4);
    });

    it('filters by status', () => {
      state.filter = { status: 'pending' };
      const todos = selectFilteredTodos(state);
      expect(todos.length).toBe(3);
      expect(todos.every((t) => t.status === 'pending')).toBe(true);
    });

    it('filters by priority', () => {
      state.filter = { priority: 'high' };
      const todos = selectFilteredTodos(state);
      expect(todos.length).toBe(1);
      expect(todos[0].title).toBe('High priority');
    });

    it('filters by search', () => {
      state.filter = { search: 'Tagged' };
      const todos = selectFilteredTodos(state);
      expect(todos.length).toBe(1);
      expect(todos[0].title).toBe('Tagged task');
    });

    it('filters by tags', () => {
      state.filter = { tags: ['work'] };
      const todos = selectFilteredTodos(state);
      expect(todos.length).toBe(1);
      expect(todos[0].title).toBe('Tagged task');
    });
  });

  describe('selectTodoStats', () => {
    it('calculates stats correctly', () => {
      const state: TodoAppState = {
        ...initialState,
        todos: new Map(),
        lists: new Map(),
      };

      const todos = [
        { ...createTodo({ title: 'Pending 1' }), status: 'pending' as const },
        { ...createTodo({ title: 'Pending 2' }), status: 'pending' as const },
        { ...createTodo({ title: 'In Progress' }), status: 'in_progress' as const },
        { ...createTodo({ title: 'Completed' }), status: 'completed' as const },
      ];

      todos.forEach((todo) => state.todos.set(todo.id, todo));

      const stats = selectTodoStats(state);

      expect(stats.total).toBe(4);
      expect(stats.pending).toBe(2);
      expect(stats.inProgress).toBe(1);
      expect(stats.completed).toBe(1);
    });
  });

  describe('createList', () => {
    it('creates a list with default values', () => {
      const list = createList('My List');

      expect(list.name).toBe('My List');
      expect(list.id).toMatch(/^list-/);
      expect(list.todos).toEqual([]);
    });

    it('creates a list with custom values', () => {
      const list = createList('Work', '#ff0000', '💼');

      expect(list.name).toBe('Work');
      expect(list.color).toBe('#ff0000');
      expect(list.icon).toBe('💼');
    });
  });
});
