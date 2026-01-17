# ✅ Todo App

> Minimal, keyboard-driven todo app for the terminal

**Updated:** 2026-01-17 17:26:00
**Version:** 1.0.0

## Features

- **Keyboard-first** — Vim-style navigation (j/k)
- **Minimal** — No bloat, just todos
- **Fast** — Instant startup, no lag
- **Organized** — Filter by status, priority, tags
- **Persistent** — Saves to `~/.todo-app/data.json`

## Quick Start

```bash
cd todo-app
bun install
bun start
```

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `a` | Add new todo |
| `e` | Edit selected todo |
| `d` | Delete selected todo |
| `space` | Toggle complete/pending |
| `p` | Cycle priority (low → medium → high) |
| `j` / `↓` | Move selection down |
| `k` / `↑` | Move selection up |
| `g` | Go to first |
| `G` | Go to last |
| `/` | Search |
| `c` | Clear filters |
| `1` | Filter: Pending |
| `2` | Filter: In Progress |
| `3` | Filter: Completed |
| `0` | Filter: All |
| `q` | Quit |

## Architecture

```
src/
├── components/     # Ink React components
│   ├── App.tsx         # Main app
│   ├── TodoItem.tsx    # Single todo
│   ├── TodoList.tsx    # List container
│   ├── TodoInput.tsx   # Text input
│   ├── Header.tsx      # Stats header
│   ├── HelpBar.tsx     # Shortcuts bar
│   └── FilterBar.tsx   # Active filters
├── hooks/
│   └── useTodos.ts     # Todo state hook
├── store/
│   └── todo-store.ts   # Reducer & selectors
├── types/
│   └── todo.ts         # TypeScript types
├── utils/
│   ├── id.ts           # ID generation
│   └── storage.ts      # File persistence
└── index.tsx           # Entry point
```

## Data Model

```typescript
interface Todo {
  id: string;
  title: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  tags: string[];
  dueDate?: Date;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}
```

## Design Principles

1. **Keyboard-first** — Every action accessible without mouse
2. **Minimal UI** — Information density without clutter
3. **Fast feedback** — Instant visual response
4. **Vim-like** — Familiar navigation patterns
5. **Persistent** — State survives restarts

## Testing

```bash
bun test
```

## Tech Stack

- **Runtime:** Bun
- **UI:** Ink (React for terminal)
- **Language:** TypeScript
- **Testing:** Bun test
