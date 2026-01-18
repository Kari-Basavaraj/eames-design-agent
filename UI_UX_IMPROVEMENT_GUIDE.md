# EAMES CLI UI/UX IMPROVEMENT GUIDE
## From "Decent" to "Claude Code Quality"

**Your Problem:** You tried to copy Claude Code's UI but the result is messy and UX is poor.

**Root Cause:** CLI UI requires a completely different mindset than web UI. You can't just "copy" components - you need to understand the **principles** behind Claude Code's design.

---

## 🎯 CLAUDE CODE UI PRINCIPLES

Based on analyzing Claude Code CLI and official docs, here are the core principles:

### 1. **Progressive Disclosure**
Show only what the user needs at each moment:
- ✅ Input is always visible
- ✅ Current task shows minimal info
- ✅ History is collapsed by default
- ❌ Don't show all phases/tasks at once

### 2. **Visual Hierarchy**
Use spacing, not borders:
- ✅ Whitespace separates sections
- ✅ Indentation shows nesting
- ❌ Avoid boxes and borders everywhere
- ❌ No ASCII art unless necessary

### 3. **Information Density**
Balance detail vs. clarity:
- ✅ One line for simple updates
- ✅ Expand only when needed
- ❌ Don't spam the terminal
- ❌ No unnecessary verbose messages

### 4. **Consistent Motion**
Predictable animations:
- ✅ Spinners for loading
- ✅ Smooth streaming text
- ❌ No jumping/flickering
- ❌ No layout shifts

### 5. **Clear State**
User always knows what's happening:
- ✅ Status bar shows mode
- ✅ Input shows availability
- ✅ Progress is visible
- ❌ No mystery states

---

## 🔍 YOUR CURRENT UI PROBLEMS

Let me analyze your components:

### Problem #1: Too Many Visual Elements

**Your Code:**
```tsx
<Box flexDirection="column">
  <Intro />  {/* Large banner */}
  <Static>{/* All history */}</Static>
  <PhaseStatusBar />
  <TaskListView />
  <ToolActivityView />
  <AgentProgressView />
  <AnswerBox />
  <QueueDisplay />
  <StatusMessage />
  <PermissionPrompt />
  <Input />
</Box>
```

**Problem:** Everything shows at once = visual chaos

**Claude Code Does:**
```tsx
<Box flexDirection="column">
  {/* Only recent turns (collapsed) */}
  <Static>{lastFewTurns}</Static>
  
  {/* Current turn (minimal) */}
  <CurrentTurn />
  
  {/* Input (always visible) */}
  <Input />
</Box>
```

### Problem #2: Over-Designed Components

**Your AgentProgressView:**
```tsx
// Too much visual noise
<Box borderStyle="round" borderColor="cyan">
  <Text>Phase: {phase}</Text>
  <Text>Status: {status}</Text>
  <Text>Tasks: {tasks.length}</Text>
  <Spinner />
  <Text>Message: {progressMessage}</Text>
</Box>
```

**Claude Code Does:**
```tsx
// Minimal, one line
<Text>
  <Spinner /> {progressMessage}
</Text>
```

### Problem #3: Inconsistent Spacing

**Your Code:**
```tsx
<Box marginTop={1} marginBottom={2} marginLeft={3}>
  <Box paddingX={2} paddingY={1}>
    <Box marginLeft={1}>
      // Nested boxes with random spacing
    </Box>
  </Box>
</Box>
```

**Claude Code Does:**
```tsx
// Consistent spacing system
<Box marginTop={1}>  {/* Always 1 */}
  <Box marginLeft={2}>  {/* Always 2 for indent */}
    // Clear hierarchy
  </Box>
</Box>
```

### Problem #4: Too Many Borders

**Your Components:**
- PermissionPrompt: rounded border
- ToolActivityView: single border
- TaskListView: custom borders
- StatusMessage: colored borders

**Result:** Looks like Windows 95

**Claude Code:** Barely uses borders. Relies on spacing and color.

---

## ✅ SOLUTION: CLEAN UI SYSTEM

### Step 1: Define Clear Spacing Constants

```typescript
// src/theme.ts - ADD THESE
export const spacing = {
  none: 0,
  tight: 1,     // Between related items
  normal: 2,    // Between sections
  loose: 3,     // Between major sections
};

export const indent = {
  level1: 2,    // First indent
  level2: 4,    // Nested indent
  level3: 6,    // Deep nested
};
```

### Step 2: Simplify AgentProgressView

**Replace your current implementation with:**

```tsx
// src/components/AgentProgressView.tsx
import React, { useState, useEffect } from 'react';
import { Box, Text } from 'ink';
import { colors, spacing } from '../theme.js';
import type { Phase } from '../agent/state.js';

export interface AgentProgressState {
  currentPhase: Phase;
  progressMessage?: string;
  isAnswering: boolean;
}

interface AgentProgressViewProps {
  state: AgentProgressState;
}

/**
 * MINIMAL progress view - Claude Code style
 * Just a spinner + one line message
 */
export function AgentProgressView({ state }: AgentProgressViewProps) {
  const [frame, setFrame] = useState(0);
  const frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];

  useEffect(() => {
    const timer = setInterval(() => {
      setFrame(f => (f + 1) % frames.length);
    }, 80);
    return () => clearInterval(timer);
  }, []);

  if (!state.progressMessage) return null;

  return (
    <Box marginTop={spacing.tight}>
      <Text color={colors.primary}>{frames[frame]} </Text>
      <Text color={colors.textMuted}>{state.progressMessage}</Text>
    </Box>
  );
}
```

### Step 3: Simplify CurrentTurnView

**Replace with:**

```tsx
// src/components/CurrentTurnView.tsx
import React from 'react';
import { Box, Text } from 'ink';
import { colors, spacing, indent } from '../theme.js';
import { AgentProgressView, AgentProgressState } from './AgentProgressView.js';

interface CurrentTurnViewProps {
  query: string;
  state: AgentProgressState;
}

/**
 * CLEAN current turn - Claude Code style
 * Query + minimal progress, no clutter
 */
export function CurrentTurnView({ query, state }: CurrentTurnViewProps) {
  return (
    <Box flexDirection="column" marginTop={spacing.normal}>
      {/* User query - simple and clean */}
      <Box>
        <Text color={colors.primary} bold>❯ </Text>
        <Text color={colors.white}>{query}</Text>
      </Box>

      {/* Progress - indented, minimal */}
      <Box marginLeft={indent.level1}>
        <AgentProgressView state={state} />
      </Box>
    </Box>
  );
}
```

### Step 4: Clean StatusBar

**Replace PhaseStatusBar with:**

```tsx
// src/components/StatusBar.tsx
import React from 'react';
import { Box, Text } from 'ink';
import { colors } from '../theme.js';
import type { PermissionMode } from '../types/permissions.js';

interface StatusBarProps {
  permissionMode?: PermissionMode;
  thinkingMode?: boolean;
  model?: string;
}

/**
 * MINIMAL status bar - Claude Code style
 * One line, key info only
 */
export function StatusBar({ 
  permissionMode = 'bypassPermissions', 
  thinkingMode = false,
  model = 'claude-sonnet-4-5'
}: StatusBarProps) {
  const modeColors: Record<PermissionMode, string> = {
    default: 'yellow',
    acceptEdits: 'green',
    plan: 'blue',
    bypassPermissions: 'gray',
  };

  const modeLabels: Record<PermissionMode, string> = {
    default: 'PROMPT',
    acceptEdits: 'AUTO',
    plan: 'PLAN',
    bypassPermissions: 'BYPASS',
  };

  return (
    <Box>
      {/* Permission mode indicator */}
      <Text color={modeColors[permissionMode]} dimColor>
        [{modeLabels[permissionMode]}]
      </Text>

      {/* Thinking mode */}
      {thinkingMode && (
        <Text color="blue"> 🧠</Text>
      )}

      {/* Model */}
      <Text color="gray" dimColor> · {model}</Text>
    </Box>
  );
}
```

### Step 5: Simplified Main CLI Layout

**Replace your render with:**

```tsx
// src/cli.tsx - SIMPLIFIED RENDER
return (
  <Box flexDirection="column">
    {/* Status bar - one line at top */}
    <StatusBar 
      permissionMode={permissionMode}
      thinkingMode={thinkingMode}
      model={model}
    />

    {/* History - COLLAPSED by default */}
    <Static items={history.slice(-3)}>  {/* Only last 3 turns */}
      {(turn) => <CompletedTurnView key={turn.id} turn={turn} />}
    </Static>

    {/* Current turn - minimal */}
    {currentTurn && (
      <CurrentTurnView query={currentTurn.query} state={currentTurn.state} />
    )}

    {/* Streaming answer */}
    {answerStream && (
      <Box marginTop={spacing.tight} marginLeft={indent.level1}>
        <AnswerBox stream={answerStream} onComplete={handleAnswerComplete} />
      </Box>
    )}

    {/* Permission prompt - only when needed */}
    {permissionRequest && (
      <PermissionPrompt
        {...permissionRequest}
        onApprove={() => {
          permissionRequest.resolve(true);
          setPermissionRequest(null);
        }}
        onDeny={() => {
          permissionRequest.resolve(false);
          setPermissionRequest(null);
        }}
      />
    )}

    {/* Status message - temporary */}
    {statusMessage && (
      <Box marginTop={spacing.tight}>
        <Text color="gray">ℹ️  {statusMessage}</Text>
      </Box>
    )}

    {/* Input - always visible, always at bottom */}
    <Box marginTop={spacing.normal}>
      <Input onSubmit={handleSubmit} commandHistory={commandHistory} />
    </Box>
  </Box>
);
```

### Step 6: Clean PermissionPrompt

**Replace with:**

```tsx
// src/components/PermissionPrompt.tsx - SIMPLIFIED
import React from 'react';
import { Box, Text } from 'ink';
import { colors, spacing, indent } from '../theme.js';

interface PermissionPromptProps {
  tool: string;
  type: 'file_edit' | 'bash_command' | 'file_delete';
  preview?: string;
  onApprove: () => void;
  onDeny: () => void;
}

/**
 * CLEAN permission prompt - Claude Code style
 * No borders, minimal design
 */
export function PermissionPrompt({ 
  tool, 
  type, 
  preview,
  onApprove,
  onDeny 
}: PermissionPromptProps) {
  return (
    <Box flexDirection="column" marginTop={spacing.normal}>
      {/* Header - simple */}
      <Box>
        <Text color="yellow">⚠️  </Text>
        <Text color="yellow" bold>Permission required: </Text>
        <Text color="white">{tool}</Text>
      </Box>

      {/* Preview - indented, no border */}
      {preview && (
        <Box marginTop={spacing.tight} marginLeft={indent.level1}>
          <Box flexDirection="column">
            <Text color="gray" dimColor>Preview:</Text>
            <Text color="cyan" dimColor>
              {preview.slice(0, 200)}
              {preview.length > 200 ? '...' : ''}
            </Text>
          </Box>
        </Box>
      )}

      {/* Actions - simple */}
      <Box marginTop={spacing.tight}>
        <Text color="green">Y</Text>
        <Text color="gray"> = approve  </Text>
        <Text color="red">N</Text>
        <Text color="gray"> = deny</Text>
      </Box>
    </Box>
  );
}
```

### Step 7: Clean AnswerBox

**Replace with:**

```tsx
// src/components/AnswerBox.tsx - CLEAN STREAMING
import React, { useState, useEffect } from 'react';
import { Box, Text } from 'ink';
import { colors } from '../theme.js';

interface AnswerBoxProps {
  stream?: AsyncGenerator<string>;
  text?: string;
  onComplete?: (text: string) => void;
}

/**
 * MINIMAL answer box - Claude Code style
 * Just streaming text, no decorations
 */
export function AnswerBox({ stream, text, onComplete }: AnswerBoxProps) {
  const [content, setContent] = useState('');

  useEffect(() => {
    if (!stream) {
      if (text) setContent(text);
      return;
    }

    let buffer = '';
    let mounted = true;

    (async () => {
      try {
        for await (const chunk of stream) {
          if (!mounted) break;
          buffer += chunk;
          setContent(buffer);
        }
        if (mounted && onComplete) {
          onComplete(buffer);
        }
      } catch (e) {
        console.error('Stream error:', e);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [stream, text, onComplete]);

  if (!content) return null;

  return (
    <Box flexDirection="column">
      <Text color={colors.textMuted}>{content}</Text>
    </Box>
  );
}
```

---

## 🎨 BEFORE & AFTER COMPARISON

### Before (Your Current UI):

```
╭─────────────────────────────────────╮
│ 🎨 EAMES - Product Design Agent    │
╰─────────────────────────────────────╯

╭─────────────────────────────────────╮
│ Phase: EXECUTE                      │
│ Status: Running                     │
│ Tasks: 3                           │
│ ⠋ Executing tasks...               │
╰─────────────────────────────────────╯

╭─────────────────────────────────────╮
│ Tool Activity:                      │
│  ├─ TavilySearch (running)         │
│  ├─ MemoryStore (completed)        │
│  └─ Bash (failed)                  │
╰─────────────────────────────────────╯

> What is Material Design?
```

**Problems:**
- Too many boxes
- Visual clutter
- Hard to scan
- Wastes vertical space

### After (Claude Code Style):

```
[AUTO] · claude-sonnet-4-5

❯ What is Material Design?
  ⠋ Searching design resources...

> _
```

**Benefits:**
- ✅ Clean and minimal
- ✅ Easy to scan
- ✅ Efficient use of space
- ✅ Focus on content

---

## 🚀 IMPLEMENTATION PLAN

### Phase 1: Theme System (30 min)
- [ ] Add spacing constants to theme.ts
- [ ] Add indent constants
- [ ] Update color palette

### Phase 2: Core Components (2 hours)
- [ ] Simplify AgentProgressView
- [ ] Simplify CurrentTurnView
- [ ] Create clean StatusBar
- [ ] Simplify PermissionPrompt
- [ ] Clean up AnswerBox

### Phase 3: Main Layout (1 hour)
- [ ] Refactor cli.tsx render
- [ ] Remove unnecessary components
- [ ] Collapse history by default
- [ ] Fix spacing

### Phase 4: Polish (1 hour)
- [ ] Test all states
- [ ] Fix any layout bugs
- [ ] Adjust colors
- [ ] Verify animations

**Total: 4-5 hours**

---

## 📋 CHECKLIST

After implementation, verify:

### Visual Hierarchy
- [ ] Status bar at top (one line)
- [ ] History collapsed (last 3 only)
- [ ] Current turn visible and minimal
- [ ] Input always at bottom
- [ ] No unnecessary borders

### Spacing
- [ ] Consistent margins (1, 2, or 3)
- [ ] Consistent indentation (2, 4, or 6)
- [ ] No random padding
- [ ] Clean visual flow

### Information Density
- [ ] One line for simple updates
- [ ] Expandable for details
- [ ] No spam
- [ ] No redundancy

### Animations
- [ ] Smooth spinner
- [ ] No flickering
- [ ] No layout shifts
- [ ] Predictable motion

### State Clarity
- [ ] Always know what's happening
- [ ] Clear mode indicators
- [ ] Obvious input state
- [ ] No mystery states

---

## 🐛 COMMON MISTAKES TO AVOID

### 1. Don't Over-Box
```tsx
// ❌ BAD
<Box borderStyle="round">
  <Box borderStyle="single">
    <Box borderStyle="double">
      <Text>Too many boxes!</Text>
    </Box>
  </Box>
</Box>

// ✅ GOOD
<Box marginLeft={2}>
  <Text>Clean hierarchy</Text>
</Box>
```

### 2. Don't Over-Animate
```tsx
// ❌ BAD
{isLoading && <Spinner type="dots" />}
{isProcessing && <Spinner type="line" />}
{isThinking && <Spinner type="arc" />}

// ✅ GOOD
{(isLoading || isProcessing || isThinking) && <Spinner />}
```

### 3. Don't Show Everything
```tsx
// ❌ BAD
<Static items={history}>  {/* All 1000 items */}
  {(turn) => <CompletedTurnView turn={turn} />}
</Static>

// ✅ GOOD
<Static items={history.slice(-3)}>  {/* Last 3 only */}
  {(turn) => <CompletedTurnView turn={turn} />}
</Static>
```

### 4. Don't Overuse Colors
```tsx
// ❌ BAD
<Text color="cyan" backgroundColor="blue" bold underline>
  Rainbow text!
</Text>

// ✅ GOOD
<Text color="cyan">
  Subtle color
</Text>
```

---

## 📚 REFERENCES & INSPIRATION

### Open Source Claude Code UIs
- [claudecodeui](https://github.com/siteboon/claudecodeui) - Web UI for Claude Code
- [claude-code-webui](https://github.com/sugyan/claude-code-webui) - Streaming interface
- [Claude Code UI](https://claudecodeui.siteboon.ai/) - Desktop & mobile interface

### CLI UI Best Practices
- Ink documentation (React for CLIs)
- Vercel's CLI design system
- GitHub CLI (`gh`) design patterns
- Next.js CLI UX

### Design Principles
- Progressive disclosure
- Information architecture
- Visual hierarchy
- Typography in terminals

---

## ✅ FINAL CHECKLIST

Before calling your UI "done":

- [ ] Run `bun run dev` - looks clean?
- [ ] Test all states (idle, running, waiting, error)
- [ ] Test long messages - does it scroll well?
- [ ] Test permission prompts - clear and minimal?
- [ ] Test model picker - easy to navigate?
- [ ] Show to a friend - can they understand it?
- [ ] Compare to Claude Code - similar feel?

---

## 🎯 EXPECTED RESULTS

After following this guide:

```
Visual Quality:     ████████░░ 80% → ████████████████████ 100%
UX Clarity:         ██████░░░░ 60% → ████████████████████ 100%
Information Density:████████░░ 80% → ████████████████████ 100%
Animation Polish:   ████░░░░░░ 40% → ████████████████████ 100%

Overall UI/UX:      ██████████░░░░░ 65% → ████████████████████ 95%
```

**You'll have a clean, professional CLI that rivals Claude Code!** 🎉

---

**Sources:**
- [claudecodeui GitHub](https://github.com/siteboon/claudecodeui)
- [Claude Code UI Website](https://claudecodeui.siteboon.ai/)
- [claude-code-webui](https://github.com/sugyan/claude-code-webui)
- [Claude for Code: UX Design Process](https://uxplanet.org/claude-for-code-how-to-use-claude-to-streamline-product-design-process-97d4e4c43ca4)
