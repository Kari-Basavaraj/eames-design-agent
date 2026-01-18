// Updated: 2026-01-17 17:16:00
// Todo Store - State Management with Reducer Pattern

import type {
  Todo,
  TodoId,
  TodoList,
  TodoAppState,
  TodoAction,
  CreateTodoInput,
  UpdateTodoInput,
  TodoFilter,
  TodoSort,
} from '../types/todo.js';
import { generateTodoId, generateListId } from '../utils/id.js';

// Initial State
export const initialState: TodoAppState = {
  todos: new Map(),
  lists: new Map(),
  activeListId: null,
  filter: {},
  sort: { field: 'createdAt', direction: 'desc' },
  selectedTodoId: null,
  isEditing: false,
};

// Reducer
export function todoReducer(state: TodoAppState, action: TodoAction): TodoAppState {
  switch (action.type) {
    case 'ADD_TODO': {
      const newTodos = new Map(state.todos);
      newTodos.set(action.payload.id, action.payload);
      return { ...state, todos: newTodos };
    }

    case 'UPDATE_TODO': {
      const todo = state.todos.get(action.payload.id);
      if (!todo) return state;

      const updatedTodo: Todo = {
        ...todo,
        ...action.payload.updates,
        updatedAt: new Date(),
      };

      // Set completedAt if status changed to completed
      if (action.payload.updates.status === 'completed' && todo.status !== 'completed') {
        updatedTodo.completedAt = new Date();
      }
      // Clear completedAt if status changed from completed
      if (action.payload.updates.status && action.payload.updates.status !== 'completed') {
        updatedTodo.completedAt = undefined;
      }

      const newTodos = new Map(state.todos);
      newTodos.set(action.payload.id, updatedTodo);
      return { ...state, todos: newTodos };
    }

    case 'DELETE_TODO': {
      const newTodos = new Map(state.todos);
      newTodos.delete(action.payload);
      return {
        ...state,
        todos: newTodos,
        selectedTodoId: state.selectedTodoId === action.payload ? null : state.selectedTodoId,
      };
    }

    case 'TOGGLE_TODO': {
      const todo = state.todos.get(action.payload);
      if (!todo) return state;

      const newStatus = todo.status === 'completed' ? 'pending' : 'completed';
      return todoReducer(state, {
        type: 'UPDATE_TODO',
        payload: { id: action.payload, updates: { status: newStatus } },
      });
    }

    case 'SET_FILTER':
      return { ...state, filter: { ...state.filter, ...action.payload } };

    case 'SET_SORT':
      return { ...state, sort: action.payload };

    case 'SELECT_TODO':
      return { ...state, selectedTodoId: action.payload };

    case 'SET_ACTIVE_LIST':
      return { ...state, activeListId: action.payload };

    case 'CREATE_LIST': {
      const newLists = new Map(state.lists);
      newLists.set(action.payload.id, action.payload);
      return { ...state, lists: newLists };
    }

    case 'DELETE_LIST': {
      const newLists = new Map(state.lists);
      newLists.delete(action.payload);
      return {
        ...state,
        lists: newLists,
        activeListId: state.activeListId === action.payload ? null : state.activeListId,
      };
    }

    case 'LOAD_STATE':
      return action.payload;

    default:
      return state;
  }
}

// Action Creators
export function createTodo(input: CreateTodoInput): Todo {
  const now = new Date();
  return {
    id: generateTodoId(),
    title: input.title,
    description: input.description,
    status: 'pending',
    priority: input.priority ?? 'medium',
    tags: input.tags ?? [],
    dueDate: input.dueDate,
    createdAt: now,
    updatedAt: now,
  };
}

export function createList(name: string, color?: string, icon?: string): TodoList {
  return {
    id: generateListId(),
    name,
    color,
    icon,
    todos: [],
    createdAt: new Date(),
  };
}

// Selectors
export function selectTodos(state: TodoAppState): Todo[] {
  return Array.from(state.todos.values());
}

export function selectFilteredTodos(state: TodoAppState): Todo[] {
  let todos = selectTodos(state);
  const { filter, sort } = state;

  // Apply filters
  if (filter.status) {
    const statuses = Array.isArray(filter.status) ? filter.status : [filter.status];
    todos = todos.filter(t => statuses.includes(t.status));
  }

  if (filter.priority) {
    const priorities = Array.isArray(filter.priority) ? filter.priority : [filter.priority];
    todos = todos.filter(t => priorities.includes(t.priority));
  }

  if (filter.tags && filter.tags.length > 0) {
    todos = todos.filter(t => filter.tags!.some(tag => t.tags.includes(tag)));
  }

  if (filter.search) {
    const search = filter.search.toLowerCase();
    todos = todos.filter(
      t =>
        t.title.toLowerCase().includes(search) ||
        t.description?.toLowerCase().includes(search)
    );
  }

  if (filter.dueBeforeDate) {
    todos = todos.filter(t => t.dueDate && t.dueDate <= filter.dueBeforeDate!);
  }

  // Apply sort
  todos.sort((a, b) => {
    let comparison = 0;

    switch (sort.field) {
      case 'title':
        comparison = a.title.localeCompare(b.title);
        break;
      case 'priority': {
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        comparison = priorityOrder[a.priority] - priorityOrder[b.priority];
        break;
      }
      case 'dueDate':
        if (!a.dueDate && !b.dueDate) comparison = 0;
        else if (!a.dueDate) comparison = 1;
        else if (!b.dueDate) comparison = -1;
        else comparison = a.dueDate.getTime() - b.dueDate.getTime();
        break;
      case 'updatedAt':
        comparison = a.updatedAt.getTime() - b.updatedAt.getTime();
        break;
      case 'createdAt':
      default:
        comparison = a.createdAt.getTime() - b.createdAt.getTime();
    }

    return sort.direction === 'desc' ? -comparison : comparison;
  });

  return todos;
}

export function selectTodoById(state: TodoAppState, id: TodoId): Todo | undefined {
  return state.todos.get(id);
}

export function selectLists(state: TodoAppState): TodoList[] {
  return Array.from(state.lists.values());
}

export function selectTodoStats(state: TodoAppState) {
  const todos = selectTodos(state);
  return {
    total: todos.length,
    pending: todos.filter(t => t.status === 'pending').length,
    inProgress: todos.filter(t => t.status === 'in_progress').length,
    completed: todos.filter(t => t.status === 'completed').length,
    overdue: todos.filter(t => t.dueDate && t.dueDate < new Date() && t.status !== 'completed').length,
  };
}
