// Updated: 2026-01-17 17:15:00
// Todo App - Core Type Definitions

export type TodoId = string;
export type TodoPriority = 'low' | 'medium' | 'high';
export type TodoStatus = 'pending' | 'in_progress' | 'completed';

export interface Todo {
  id: TodoId;
  title: string;
  description?: string;
  status: TodoStatus;
  priority: TodoPriority;
  tags: string[];
  dueDate?: Date;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

export interface TodoList {
  id: string;
  name: string;
  color?: string;
  icon?: string;
  todos: TodoId[];
  createdAt: Date;
}

export interface CreateTodoInput {
  title: string;
  description?: string;
  priority?: TodoPriority;
  tags?: string[];
  dueDate?: Date;
  listId?: string;
}

export interface UpdateTodoInput {
  title?: string;
  description?: string;
  status?: TodoStatus;
  priority?: TodoPriority;
  tags?: string[];
  dueDate?: Date;
}

export interface TodoFilter {
  status?: TodoStatus | TodoStatus[];
  priority?: TodoPriority | TodoPriority[];
  tags?: string[];
  search?: string;
  dueBeforeDate?: Date;
  listId?: string;
}

export interface TodoSort {
  field: 'createdAt' | 'updatedAt' | 'dueDate' | 'priority' | 'title';
  direction: 'asc' | 'desc';
}

// UI State Types
export interface TodoAppState {
  todos: Map<TodoId, Todo>;
  lists: Map<string, TodoList>;
  activeListId: string | null;
  filter: TodoFilter;
  sort: TodoSort;
  selectedTodoId: TodoId | null;
  isEditing: boolean;
}

export type TodoAction =
  | { type: 'ADD_TODO'; payload: Todo }
  | { type: 'UPDATE_TODO'; payload: { id: TodoId; updates: UpdateTodoInput } }
  | { type: 'DELETE_TODO'; payload: TodoId }
  | { type: 'TOGGLE_TODO'; payload: TodoId }
  | { type: 'SET_FILTER'; payload: Partial<TodoFilter> }
  | { type: 'SET_SORT'; payload: TodoSort }
  | { type: 'SELECT_TODO'; payload: TodoId | null }
  | { type: 'SET_ACTIVE_LIST'; payload: string | null }
  | { type: 'CREATE_LIST'; payload: TodoList }
  | { type: 'DELETE_LIST'; payload: string }
  | { type: 'LOAD_STATE'; payload: TodoAppState };
