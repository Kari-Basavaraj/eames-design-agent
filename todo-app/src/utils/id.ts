// Updated: 2026-01-17 17:15:00
// Simple ID generation utility

export function generateId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

export function generateTodoId(): string {
  return `todo-${generateId()}`;
}

export function generateListId(): string {
  return `list-${generateId()}`;
}
