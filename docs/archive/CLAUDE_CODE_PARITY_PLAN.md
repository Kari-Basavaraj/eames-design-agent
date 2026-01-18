# Claude Code CLI 100% Parity Plan
**Created:** 2026-01-17  
**Goal:** Achieve complete feature and UI parity with Claude Code CLI

---

## Current Status: 50% Complete

### ✅ Implemented (50%)
- [x] Claude Agent SDK v0.2.11
- [x] Slash commands with dropdown menu
- [x] File autocomplete (@)
- [x] Bash mode (!)
- [x] Memory mode (#)
- [x] Command history (Up/Down)
- [x] Session resume
- [x] MCP server loading
- [x] Ctrl+C, Ctrl+U, Ctrl+W, Ctrl+L
- [x] Home/End, Left/Right arrows
- [x] /cost, /context, /compact, /doctor, /init, /stats commands

### ❌ Missing Critical Features (50%)

#### A. Input Modes (15%)
- [ ] Multiline input (`\` + Enter)
- [ ] Image paste support
- [ ] Ctrl+D exit

#### B. Keyboard Shortcuts (10%)
- [ ] Ctrl+K (delete to end)
- [ ] Ctrl+Y (yank/paste deleted)
- [ ] Ctrl+R (history search fuzzy finder)
- [ ] Alt+B/F (word navigation)
- [ ] Shift+Tab (toggle permission mode)
- [ ] Alt+P (model picker)
- [ ] Alt+T (toggle thinking mode)

#### C. Permission System (10%)
- [ ] Interactive permission prompts
- [ ] Auto-accept mode
- [ ] Plan-only mode
- [ ] Permission mode indicator in status bar

#### D. Session Management (5%)
- [ ] Session picker UI (/resume with menu)
- [ ] Session naming/renaming
- [ ] Session history sidebar

#### E. Advanced Features (10%)
- [ ] Vim mode (full modal editing)
- [ ] Ctrl+R history search with fuzzy finder
- [ ] Esc+Esc rewind/undo
- [ ] Background task management (Ctrl+B)
- [ ] Diff view for file edits
- [ ] Collapsible tool output

---

## Implementation Phases

### Phase 1: Critical Input (2 hours)
**Priority:** P0 - Essential for usability

1. **Multiline Input** (`\` + Enter)
   - Detect `\` at end of line
   - Continue input on next line with visual continuation indicator
   - Submit on Enter without trailing `\`

2. **Ctrl+K Delete to End**
   - Delete from cursor to end of line
   - Store in kill buffer for Ctrl+Y

3. **Ctrl+Y Yank/Paste**
   - Paste last killed text
   - Integrate with Ctrl+K and Ctrl+W

### Phase 2: Permission System (2 hours)
**Priority:** P0 - Core Claude Code feature

1. **Permission Modes**
   - Default: Prompt before file edits/bash
   - Auto: Auto-approve all
   - Plan: Planning only, no execution
   - Bypass: Full autonomy (current mode)

2. **Permission Prompts**
   - Show file diff before edit
   - Allow/Deny buttons
   - Remember choice for session

3. **Mode Indicator**
   - Show current mode in status bar
   - Shift+Tab to cycle modes

### Phase 3: Navigation & Search (1.5 hours)
**Priority:** P1 - Power user features

1. **Ctrl+R History Search**
   - Fuzzy finder for command history
   - Real-time filtering as you type
   - Select with Enter, cancel with Esc

2. **Alt+B/F Word Navigation**
   - Jump by word boundaries
   - Integrate with existing cursor logic

3. **Session Picker**
   - /resume shows session list
   - Arrow keys to select
   - Display session timestamp and first query

### Phase 4: Advanced Editing (2 hours)
**Priority:** P2 - Nice to have

1. **Vim Mode**
   - Normal/Insert/Visual modes
   - Basic vim commands (hjkl, w/b, d/y/p)
   - Toggle with /vim command

2. **Tool Output Management**
   - Collapsible tool output
   - Fold/unfold with arrow keys
   - Diff view for file edits

### Phase 5: Polish (1 hour)
**Priority:** P2 - Final touches

1. **Keyboard Shortcuts**
   - Alt+P: Quick model switcher
   - Alt+T: Toggle thinking mode
   - Ctrl+D: Exit

2. **Visual Improvements**
   - Thinking mode indicator
   - Model name in status bar
   - Better spacing and alignment

---

## Implementation Order (Next 8 Hours)

### Hour 1-2: Multiline + Kill Buffer
```
✓ Add multiline state to Input.tsx
✓ Handle `\` at line end
✓ Show continuation indicator (...)
✓ Implement kill buffer for Ctrl+K/W/Y
```

### Hour 3-4: Permission System
```
✓ Add permission mode state
✓ Create PermissionPrompt component
✓ Integrate with file edit tools
✓ Add Shift+Tab mode toggle
```

### Hour 5-6: Search & Sessions
```
✓ Create HistorySearch component (Ctrl+R)
✓ Add fuzzy matching
✓ Create SessionPicker component
✓ Integrate with /resume
```

### Hour 7: Word Navigation + Shortcuts
```
✓ Alt+B/F word jumping
✓ Alt+P model picker
✓ Alt+T thinking toggle
✓ Ctrl+D exit
```

### Hour 8: Vim Mode Basics
```
✓ Vim mode state machine
✓ Normal mode navigation
✓ Insert mode entry
✓ Basic commands (hjkl, w/b, i/a)
```

---

## Success Criteria

### Must Have (100% Parity)
- [ ] All keyboard shortcuts match Claude Code
- [ ] Permission prompts work correctly
- [ ] Multiline input works seamlessly
- [ ] History search is fast and intuitive
- [ ] Session picker shows all sessions
- [ ] Vim mode covers basic editing

### Should Have (Polish)
- [ ] UI matches Claude Code aesthetics
- [ ] Response time < 100ms for all inputs
- [ ] No visual glitches or flicker
- [ ] All shortcuts documented in /help

### Could Have (Future)
- [ ] Image paste support
- [ ] Background task management
- [ ] Advanced vim features
- [ ] Custom themes

---

## Testing Plan

### Manual Testing Checklist
- [ ] Test all keyboard shortcuts
- [ ] Test multiline input with real queries
- [ ] Test permission prompts with file edits
- [ ] Test history search with 100+ commands
- [ ] Test session picker with multiple sessions
- [ ] Test vim mode basic commands
- [ ] Test in different terminal sizes
- [ ] Test with different color schemes

### Automated Testing
- [ ] Add tests for multiline input parsing
- [ ] Add tests for kill buffer operations
- [ ] Add tests for permission mode logic
- [ ] Add tests for vim mode state machine

---

## Next Steps

1. Start with **Phase 1: Multiline + Kill Buffer** (highest ROI)
2. Then **Phase 2: Permission System** (core feature)
3. Continue with **Phase 3** and **Phase 4** as time permits
4. Track progress in PROGRESS_TRACKER.md

**Estimated Time to 100% Parity:** 8-10 hours of focused work
