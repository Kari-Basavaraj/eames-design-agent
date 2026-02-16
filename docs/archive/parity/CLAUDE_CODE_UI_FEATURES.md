# Updated: 2026-01-17 18:15:00
# Claude Code CLI UI Features - Complete Audit

## Overview

This document tracks all Claude Code CLI UI features and their implementation status in Eames.

## UI Match Status

✅ **Core UI Layout**: 100% matches Claude Code's minimal, clean design
✅ **Query Display**: Simple `> query` format without background colors
✅ **Progress Display**: Single inline progress with spinner (no duplicate messages)
✅ **Tool Activity**: Real-time tool execution display with status
✅ **Answer Streaming**: Claude Code style markdown rendering
✅ **Error Handling**: Graceful handling of MCP configuration errors
✅ **Thinking Display**: Shows AI's thought process inline with dimmed spinner
✅ **No Status Bar**: Progress shown inline only (Claude Code style)

---

## Input Modes

| Feature | Claude Code | Eames | Status |
|---------|-------------|-------|--------|
| **Regular text input** | ✅ | ✅ | ✅ Done |
| **Slash commands (`/`)** | ✅ | ✅ | ✅ Done |
| **File mentions (`@`)** | ✅ | ✅ | ✅ Done |
| **Bash mode (`!`)** | ✅ | ✅ | ✅ Done |
| **Memory edit (`#`)** | ✅ | ✅ | ✅ Done |
| **Multiline input** | ✅ `\` + Enter | ❌ | 📋 TODO |
| **Paste images** | ✅ | ❌ | 📋 TODO |

---

## Slash Command Autocomplete

| Feature | Claude Code | Eames | Status |
|---------|-------------|-------|--------|
| **Dropdown menu** | ✅ | ✅ | ✅ Done |
| **Keyboard navigation** | ✅ ↑↓ | ✅ | ✅ Done |
| **Tab to select** | ✅ | ✅ | ✅ Done |
| **Enter to select** | ✅ | ✅ | ✅ Done |
| **Escape to close** | ✅ | ✅ | ✅ Done |
| **Filter by typing** | ✅ | ✅ | ✅ Done |
| **Category display** | ✅ | ✅ | ✅ Done |

---

## File Autocomplete (`@` mentions)

| Feature | Claude Code | Eames | Status |
|---------|-------------|-------|--------|
| **Dropdown menu** | ✅ | ✅ | ✅ Done |
| **Directory navigation** | ✅ | ✅ | ✅ Done |
| **File icons** | ✅ | ✅ | ✅ Done |
| **Hidden files** | ✅ `.` prefix | ✅ | ✅ Done |

---

## Keyboard Shortcuts

| Shortcut | Claude Code | Eames | Status |
|----------|-------------|-------|--------|
| **Ctrl+C** | Cancel/Exit | ✅ | ✅ Done |
| **Ctrl+D** | Exit | ❌ | 📋 TODO |
| **Ctrl+L** | Clear screen | ✅ | ✅ Done |
| **Ctrl+U** | Clear line | ✅ | ✅ Done |
| **Ctrl+W** | Delete word | ✅ | ✅ Done |
| **Ctrl+K** | Delete to end | ❌ | 📋 TODO |
| **Ctrl+Y** | Paste deleted | ❌ | 📋 TODO |
| **Ctrl+R** | History search | ❌ | 📋 TODO |
| **Ctrl+O** | Toggle verbose | ❌ | 📋 TODO |
| **Ctrl+B** | Background task | ❌ | 📋 TODO |
| **Esc+Esc** | Rewind | ❌ | 📋 TODO |
| **Shift+Tab** | Toggle mode | ❌ | 📋 TODO |
| **Alt+P** | Switch model | ❌ | 📋 TODO |
| **Alt+T** | Toggle thinking | ❌ | 📋 TODO |
| **Home/Ctrl+A** | Start of line | ✅ | ✅ Done |
| **End/Ctrl+E** | End of line | ✅ | ✅ Done |
| **Left/Right arrows** | Cursor move | ✅ | ✅ Done |
| **Up/Down arrows** | History | ✅ | ✅ Done |
| **Alt+B** | Word backward | ❌ | 📋 TODO |
| **Alt+F** | Word forward | ❌ | 📋 TODO |

---

## Vim Mode

| Feature | Claude Code | Eames | Status |
|---------|-------------|-------|--------|
| **Enable via `/vim`** | ✅ | ❌ | 📋 TODO |
| **Mode switching** | ✅ | ❌ | 📋 TODO |
| **Navigation** | ✅ | ❌ | 📋 TODO |
| **Editing** | ✅ | ❌ | 📋 TODO |
| **Text objects** | ✅ | ❌ | 📋 TODO |

---

## Slash Commands (Built-in)

| Command | Description | Eames | Status |
|---------|-------------|-------|--------|
| `/help` | Show usage help | ✅ | ✅ Done |
| `/clear` | Clear history | ✅ | ✅ Done |
| `/compact` | Compact conversation | ✅ | ✅ Done |
| `/model` | Change model | ✅ | ✅ Done |
| `/config` | Settings | ✅ | ✅ Done |
| `/status` | Show status | ✅ | ✅ Done |
| `/cost` | Token usage | ✅ | ✅ Done |
| `/context` | Context visualization | ❌ | 📋 TODO |
| `/permissions` | View permissions | ❌ | 📋 TODO |
| `/mcp` | MCP servers | ❌ | 📋 TODO |
| `/memory` | CLAUDE.md | ✅ | ✅ Done |
| `/plugin` | Plugins | ❌ | 📋 TODO |
| `/agents` | Subagents | ❌ | 📋 TODO |
| `/resume` | Resume session | ❌ | 📋 TODO |
| `/rename` | Rename session | ❌ | 📋 TODO |
| `/init` | Initialize project | ❌ | 📋 TODO |
| `/review` | Code review | ❌ | 📋 TODO |
| `/todos` | TODO items | ❌ | 📋 TODO |
| `/theme` | Color theme | ❌ | 📋 TODO |
| `/vim` | Vim mode | ❌ | 📋 TODO |
| `/doctor` | Health check | ❌ | 📋 TODO |
| `/bug` | Report bug | ❌ | 📋 TODO |
| `/exit` | Exit | ✅ | ✅ Done |
| `/quit` | Exit | ✅ | ✅ Done |
| `/sdk` | Toggle SDK mode | ✅ | ✅ Done |

---

## Permission Modes

| Mode | Claude Code | Eames | Status |
|------|-------------|-------|--------|
| **Default** | Interactive prompts | ❌ | 📋 TODO |
| **Auto-Accept** | Auto-approve edits | ❌ | 📋 TODO |
| **Plan** | Planning only | ❌ | 📋 TODO |
| **Bypass** | Full autonomy | ✅ | ✅ Done |

---

## Tool Activity Display

| Feature | Claude Code | Eames | Status |
|---------|-------------|-------|--------|
| **Tool name** | ✅ | ✅ | ✅ Done |
| **Tool arguments** | ✅ | ✅ | ✅ Done |
| **Status indicator** | ✅ Running/Done/Failed | ✅ | ✅ Done |
| **Collapsible output** | ✅ | ❌ | 📋 TODO |
| **Diff view** | ✅ | ❌ | 📋 TODO |

---

## Session Features

| Feature | Claude Code | Eames | Status |
|---------|-------------|-------|--------|
| **Multi-turn** | ✅ | ✅ | ✅ Done |
| **Session resume** | ✅ | ✅ | ✅ Done |
| **Session naming** | ✅ | ❌ | 📋 TODO |
| **Session picker** | ✅ | ❌ | 📋 TODO |
| **Command history** | ✅ Up/Down | ❌ | 📋 TODO |
| **Ctrl+R search** | ✅ | ❌ | 📋 TODO |

---

## UI Components

| Component | Claude Code | Eames | Status |
|-----------|-------------|-------|--------|
| **Intro banner** | ✅ | ✅ | ✅ Done |
| **Model indicator** | ✅ | ✅ | ✅ Done |
| **Status bar** | ✅ | ✅ | ✅ Done |
| **Progress indicator** | ✅ | ✅ | ✅ Done |
| **Query display** | ✅ | ✅ | ✅ Done |
| **Answer box** | ✅ Markdown | ✅ | ✅ Done |
| **Queue display** | ✅ | ✅ | ✅ Done |
| **Interrupted indicator** | ✅ | ✅ | ✅ Done |
| **Context grid** | ✅ `/context` | ❌ | 📋 TODO |
| **Usage stats** | ✅ `/stats` | ❌ | 📋 TODO |

---

## Priority Implementation Order

### Phase 1: Critical Fixes (Now)
1. ✅ Fix `showMenu` bug in Input.tsx
2. ✅ Fix slash command dropdown
3. ✅ Fix file autocomplete dropdown

### Phase 2: Essential Input Modes
1. Bash mode (`!`)
2. Memory edit (`#`)
3. Multiline input (`\` + Enter)
4. Command history (Up/Down)

### Phase 3: Keyboard Shortcuts
1. Ctrl+R history search
2. Alt+B/F word navigation
3. Ctrl+K delete to end
4. Ctrl+Y paste deleted

### Phase 4: Advanced Features
1. Vim mode
2. Permission mode toggle (Shift+Tab)
3. Context visualization
4. Session picker

---

## References

- [Claude Code Interactive Mode](https://code.claude.com/docs/en/interactive-mode)
- [Claude Code Slash Commands](https://code.claude.com/docs/en/slash-commands)
- [Claude Code CLI Reference](https://code.claude.com/docs/en/cli-reference)
