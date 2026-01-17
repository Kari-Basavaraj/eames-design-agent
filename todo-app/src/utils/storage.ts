// Updated: 2026-01-17 17:22:00
// Storage utility - Persistence layer for todos

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { homedir } from 'os';
import type { Todo, TodoList, TodoAppState } from '../types/todo.js';

const DATA_DIR = join(homedir(), '.todo-app');
const DATA_FILE = join(DATA_DIR, 'data.json');

interface StorageData {
  version: number;
  todos: Record<string, Todo>;
  lists: Record<string, TodoList>;
  activeListId: string | null;
  lastUpdated: string;
}

function ensureDataDir(): void {
  if (!existsSync(DATA_DIR)) {
    mkdirSync(DATA_DIR, { recursive: true });
  }
}

function serializeState(state: TodoAppState): StorageData {
  const todos: Record<string, Todo> = {};
  const lists: Record<string, TodoList> = {};

  state.todos.forEach((todo, id) => {
    todos[id] = {
      ...todo,
      createdAt: todo.createdAt,
      updatedAt: todo.updatedAt,
      completedAt: todo.completedAt,
      dueDate: todo.dueDate,
    };
  });

  state.lists.forEach((list, id) => {
    lists[id] = { ...list };
  });

  return {
    version: 1,
    todos,
    lists,
    activeListId: state.activeListId,
    lastUpdated: new Date().toISOString(),
  };
}

function deserializeState(data: StorageData): Partial<TodoAppState> {
  const todos = new Map<string, Todo>();
  const lists = new Map<string, TodoList>();

  Object.entries(data.todos || {}).forEach(([id, todo]) => {
    todos.set(id, {
      ...todo,
      createdAt: new Date(todo.createdAt),
      updatedAt: new Date(todo.updatedAt),
      completedAt: todo.completedAt ? new Date(todo.completedAt) : undefined,
      dueDate: todo.dueDate ? new Date(todo.dueDate) : undefined,
    });
  });

  Object.entries(data.lists || {}).forEach(([id, list]) => {
    lists.set(id, {
      ...list,
      createdAt: new Date(list.createdAt),
    });
  });

  return {
    todos,
    lists,
    activeListId: data.activeListId,
  };
}

export function loadState(): Partial<TodoAppState> | null {
  try {
    ensureDataDir();

    if (!existsSync(DATA_FILE)) {
      return null;
    }

    const content = readFileSync(DATA_FILE, 'utf-8');
    const data: StorageData = JSON.parse(content);

    return deserializeState(data);
  } catch (error) {
    console.error('Failed to load state:', error);
    return null;
  }
}

export function saveState(state: TodoAppState): boolean {
  try {
    ensureDataDir();

    const data = serializeState(state);
    writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');

    return true;
  } catch (error) {
    console.error('Failed to save state:', error);
    return false;
  }
}

export function clearState(): boolean {
  try {
    if (existsSync(DATA_FILE)) {
      writeFileSync(DATA_FILE, JSON.stringify({ version: 1, todos: {}, lists: {}, activeListId: null }), 'utf-8');
    }
    return true;
  } catch (error) {
    console.error('Failed to clear state:', error);
    return false;
  }
}

export function getDataPath(): string {
  return DATA_FILE;
}
