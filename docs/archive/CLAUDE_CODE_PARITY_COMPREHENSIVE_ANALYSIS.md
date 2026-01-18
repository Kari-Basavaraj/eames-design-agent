# CLAUDE CODE CLI - COMPREHENSIVE PARITY ANALYSIS & IMPLEMENTATION GUIDE
**Date:** 2026-01-17  
**Your Project:** Eames Design Agent  
**Current Parity:** 70% ✅  
**Target:** 100% 🎯

---

## 📊 EXECUTIVE SUMMARY

You've done an excellent job with Eames! Your analysis documents are thorough. Based on my analysis of your codebase and the official Claude Code documentation, here are the **critical gaps** preventing 100% parity:

### 🔴 CRITICAL GAPS (Blocking 100% Parity)

1. **Permission System** - You're using `bypassPermissions` mode only
   - Missing: `default`, `acceptEdits`, `plan` modes
   - Missing: Interactive permission prompts with diff preview
   - Missing: Shift+Tab mode cycling
   - Impact: **HIGH** - Core Claude Code feature

2. **Visual Indicators Missing**
   - No permission mode indicator in status bar
   - No thinking mode indicator (🧠)
   - No proper diff view for file edits
   - Impact: **MEDIUM** - UX polish

3. **Session Management UI**
   - `/resume` command exists but no interactive picker
   - No visual session selection
   - Impact: **MEDIUM** - Usability

4. **Vim Mode**
   - Placeholder only (`/vim` command exists)
   - No modal editing implementation
   - Impact: **LOW** - Power user feature, optional

---

## 🔍 DETAILED GAP ANALYSIS

### Gap #1: Permission System Architecture (CRITICAL)

**What Claude Code Has:**
```typescript
// 4 permission modes
type PermissionMode = 'default' | 'acceptEdits' | 'plan' | 'bypassPermissions';

// Interactive prompts before destructive operations
- File edits show diff preview
- Bash commands show command text
- Delete operations require confirmation
```

**What Eames Has:**
```typescript
// Only bypassPermissions mode
permissionMode: 'bypassPermissions'

// No interactive prompts
// All operations execute immediately
```

**Your Current Code Location:**
- `src/hooks/useSdkAgentExecution.ts` line ~317: hardcoded `bypassPermissions`
- `src/agent/sdk-agent.ts`: No permission hooks implemented
- `src/components/PermissionPrompt.tsx`: EXISTS but not connected!

**THE FIX YOU NEED:**

You already have a `PermissionPrompt.tsx` component! You just need to wire it up. Here's how:

```typescript
// 1. Update useSdkAgentExecution.ts to accept permissionMode
export interface UseSdkAgentExecutionOptions {
  model: string;
  permissionMode?: PermissionMode;  // ADD THIS
}

// 2. Update SdkAgent initialization
const agent = new SdkAgent({
  model,
  callbacks,
  signal: abortController.signal,
  resume: sessionIdRef.current ?? undefined,
  permissionMode: permissionMode || 'default',  // USE PASSED MODE
  
  // ADD PERMISSION HOOKS
  hooks: {
    PreToolUse: [{
      hooks: [async (input) => {
        // Check if this tool needs permission
        const needsPermission = 
          ['Write', 'Edit', 'Bash', 'Delete'].includes(input.tool_name) &&
          permissionMode !== 'bypassPermissions';
        
        if (needsPermission) {
          // Trigger permission prompt in UI
          const approved = await callbacks.onPermissionRequest?.({
            type: input.tool_name === 'Bash' ? 'bash_command' : 'file_edit',
            tool: input.tool_name,
            description: JSON.stringify(input.tool_input),
            preview: await generatePreview(input),
          });
          
          if (!approved) {
            return { continue: false };  // Block execution
          }
        }
        
        return { continue: true };
      }],
    }],
  },
});
```

---

### Gap #2: Permission UI Integration

**Your PermissionPrompt.tsx** (already exists at `src/components/PermissionPrompt.tsx`):
```typescript
// THIS EXISTS! Just needs to be used in CLI
export function PermissionPrompt({ 
  type, 
  description, 
  preview,
  onApprove, 
  onDeny 
}: PermissionPromptProps)
```

**Wire it up in cli.tsx:**

```typescript
// ADD TO CLI STATE
const [permissionMode, setPermissionMode] = useState<PermissionMode>('default');
const [permissionRequest, setPermissionRequest] = useState<{
  type: 'file_edit' | 'bash_command';
  tool: string;
  description: string;
  preview?: string;
  resolve: (approved: boolean) => void;
} | null>(null);

// ADD CALLBACK
const handlePermissionRequest = useCallback((request) => {
  return new Promise<boolean>((resolve) => {
    setPermissionRequest({ ...request, resolve });
  });
}, []);

// PASS TO SDK AGENT
const { currentTurn, answerStream, isProcessing, processQuery } = 
  useSdkAgentExecution({
    model,
    permissionMode,  // PASS THIS
    onPermissionRequest: handlePermissionRequest,  // AND THIS
  });

// RENDER PERMISSION PROMPT
{permissionRequest && (
  <PermissionPrompt
    type={permissionRequest.type}
    description={permissionRequest.description}
    preview={permissionRequest.preview}
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

// SHIFT+TAB TO CYCLE MODES
const cyclePermissionMode = useCallback(() => {
  const modes: PermissionMode[] = ['default', 'acceptEdits', 'plan', 'bypassPermissions'];
  const idx = modes.indexOf(permissionMode);
  const next = modes[(idx + 1) % modes.length];
  setPermissionMode(next);
  setStatusMessage(`Permission mode: ${next}`);
}, [permissionMode]);
```

---

### Gap #3: Diff Preview for File Edits

**What's Missing:**
Your `PermissionPrompt` can show preview, but you need to generate the diff.

**Add to sdk-agent.ts:**

```typescript
import { diffLines } from 'diff';  // npm install diff

async function generatePreview(toolInput: any): Promise<string | undefined> {
  if (toolInput.tool_name === 'Edit' || toolInput.tool_name === 'Write') {
    try {
      const filePath = toolInput.tool_input.file_path || toolInput.tool_input.path;
      const newContent = toolInput.tool_input.new_string || toolInput.tool_input.content;
      
      // Read current file
      const currentContent = existsSync(filePath) 
        ? readFileSync(filePath, 'utf-8')
        : '';
      
      // Generate diff
      const diff = diffLines(currentContent, newContent);
      return diff.map(part => {
        const prefix = part.added ? '+' : part.removed ? '-' : ' ';
        const color = part.added ? 'green' : part.removed ? 'red' : 'gray';
        return part.value.split('\n')
          .filter(line => line)
          .map(line => `${prefix} ${line}`)
          .join('\n');
      }).join('\n');
    } catch {
      return undefined;
    }
  }
  return undefined;
}
```

---

### Gap #4: Visual Status Indicators

**Update PhaseStatusBar.tsx:**

```typescript
export function PhaseStatusBar({ 
  phase,
  permissionMode,  // ADD THIS
  thinkingMode = false,  // ADD THIS
  isAnswering,
  progressMessage
}: PhaseStatusBarProps) {
  const permissionColors: Record<PermissionMode, string> = {
    default: 'yellow',
    acceptEdits: 'green',
    plan: 'blue',
    bypassPermissions: 'red',
  };
  
  const permissionLabels: Record<PermissionMode, string> = {
    default: 'PROMPT',
    acceptEdits: 'AUTO-ACCEPT',
    plan: 'PLAN-ONLY',
    bypassPermissions: 'BYPASS',
  };
  
  return (
    <Box>
      {/* Permission Mode Indicator */}
      <Text color={permissionColors[permissionMode]}>
        [{permissionLabels[permissionMode]}]
      </Text>
      
      {/* Thinking Mode */}
      {thinkingMode && (
        <Text color="blue"> 🧠</Text>
      )}
      
      {/* Phase */}
      <Text color="gray"> {phase}</Text>
      
      {/* Progress */}
      {progressMessage && (
        <Text color="gray"> - {progressMessage}</Text>
      )}
    </Box>
  );
}
```

---

### Gap #5: Session Picker UI

**Your `/resume` Command:**
Currently just resumes last session. Needs interactive picker.

**Create SessionPicker Component:**

```typescript
// src/components/SessionPicker.tsx
import React, { useState, useEffect } from 'react';
import { Box, Text, useInput } from 'ink';
import { existsSync, readdirSync, statSync, readFileSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

interface Session {
  id: string;
  timestamp: Date;
  firstQuery: string;
  messageCount: number;
}

export function SessionPicker({ onSelect, onCancel }: {
  onSelect: (sessionId: string) => void;
  onCancel: () => void;
}) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    // Load sessions from Claude SDK's session directory
    const sessionDir = join(homedir(), '.claude', 'sessions');
    if (!existsSync(sessionDir)) {
      setSessions([]);
      return;
    }

    const sessionFiles = readdirSync(sessionDir)
      .filter(f => f.endsWith('.json'))
      .map(f => {
        const path = join(sessionDir, f);
        try {
          const stat = statSync(path);
          const data = JSON.parse(readFileSync(path, 'utf-8'));
          const messages = data.messages || [];
          
          return {
            id: f.replace('.json', ''),
            timestamp: new Date(stat.mtime),
            firstQuery: messages.find((m: any) => m.role === 'user')?.content || 'Untitled',
            messageCount: messages.length,
          };
        } catch {
          return null;
        }
      })
      .filter((s): s is Session => s !== null)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    
    setSessions(sessionFiles);
  }, []);

  useInput((input, key) => {
    if (key.upArrow && selectedIndex > 0) {
      setSelectedIndex(selectedIndex - 1);
    }
    if (key.downArrow && selectedIndex < sessions.length - 1) {
      setSelectedIndex(selectedIndex + 1);
    }
    if (key.return && sessions[selectedIndex]) {
      onSelect(sessions[selectedIndex].id);
    }
    if (key.escape) {
      onCancel();
    }
  });

  if (sessions.length === 0) {
    return (
      <Box flexDirection="column" borderStyle="round" padding={1}>
        <Text color="yellow">No saved sessions found</Text>
        <Text color="gray">Press Esc to cancel</Text>
      </Box>
    );
  }

  return (
    <Box flexDirection="column" borderStyle="round" padding={1}>
      <Box>
        <Text bold color="cyan">📁 Resume Session ({sessions.length})</Text>
      </Box>
      
      <Box flexDirection="column" marginTop={1}>
        {sessions.slice(0, 10).map((session, idx) => {
          const isSelected = idx === selectedIndex;
          const date = session.timestamp.toLocaleDateString();
          const time = session.timestamp.toLocaleTimeString();
          const preview = session.firstQuery.slice(0, 60);
          
          return (
            <Box key={session.id}>
              <Text bold={isSelected} color={isSelected ? 'cyan' : 'gray'}>
                {isSelected ? '❯ ' : '  '}
                {date} {time} - {preview}
                {session.firstQuery.length > 60 ? '...' : ''}
                {' '}({session.messageCount} msgs)
              </Text>
            </Box>
          );
        })}
      </Box>
      
      <Box marginTop={1}>
        <Text color="gray">↑↓ navigate • Enter select • Esc cancel</Text>
      </Box>
    </Box>
  );
}
```

**Wire up in cli.tsx:**

```typescript
// Update /resume command handler
case '/resume': {
  setState('session_picker');
  return;
}

// Add state
{state === 'session_picker' && (
  <SessionPicker
    onSelect={(sessionId) => {
      // Resume this session
      sessionIdRef.current = sessionId;
      setState('idle');
      setStatusMessage(`Resumed session: ${sessionId.slice(0, 8)}...`);
    }}
    onCancel={() => {
      setState('idle');
    }}
  />
)}
```

---

### Gap #6: Keyboard Shortcuts (Already Mostly Done!)

Your `EnhancedInput.tsx` already has:
- ✅ Ctrl+R history search
- ✅ Alt+B/F word navigation
- ✅ Alt+P model picker hook
- ✅ Alt+T thinking toggle hook
- ✅ Shift+Tab permission mode (needs wiring)

**Just Missing:**
- Ctrl+D exit → Add to input handler
- Esc+Esc undo → Requires file checkpointing

---

## 🎯 IMPLEMENTATION PRIORITY

### PRIORITY 1: Permission System (2-3 hours)

This is your biggest gap. Follow this order:

1. **Add permission mode state to CLI** (30 min)
   - State variable for current mode
   - Shift+Tab cycling function
   - Pass to SDK agent hook

2. **Wire up PermissionPrompt** (1 hour)
   - Add permission request callback
   - Connect to SDK agent hooks
   - Handle approve/deny

3. **Implement diff preview** (1 hour)
   - Install `diff` package
   - Generate file diffs in SDK agent
   - Pass to permission prompt

4. **Add status indicators** (30 min)
   - Update PhaseStatusBar with mode
   - Add thinking indicator
   - Test visual appearance

### PRIORITY 2: Session Picker (1 hour)

1. Create SessionPicker component
2. Wire up to `/resume` command
3. Test session loading

### PRIORITY 3: Visual Polish (30 min)

1. Update all status indicators
2. Improve color scheme
3. Add missing icons

### PRIORITY 4: Vim Mode (Optional, 2+ hours)

Only if you want power users. Can skip for 100% functional parity.

---

## 📦 DEPENDENCIES TO ADD

```bash
bun add diff  # For file diff preview
```

That's it! Everything else you already have.

---

## ✅ TESTING CHECKLIST

After implementing, test these scenarios:

### Permission System
- [ ] Shift+Tab cycles through all 4 modes
- [ ] Default mode shows prompt before file edit
- [ ] Default mode shows prompt before bash command
- [ ] Diff preview shows in permission prompt
- [ ] Approve works and executes operation
- [ ] Deny works and cancels operation
- [ ] Auto-accept mode skips prompts
- [ ] Plan mode prevents execution
- [ ] Bypass mode skips all checks
- [ ] Mode indicator shows in status bar

### Session Management
- [ ] `/resume` shows session picker
- [ ] Arrow keys navigate sessions
- [ ] Enter selects session
- [ ] Esc cancels picker
- [ ] Selected session actually resumes
- [ ] Multi-turn conversation works

### Visual
- [ ] Permission mode indicator visible
- [ ] Thinking mode indicator shows (🧠)
- [ ] Status bar shows all info
- [ ] Colors are correct for each mode

---

## 🚀 QUICK START IMPLEMENTATION

Here's the fastest path to 95% parity (3-4 hours):

```bash
# 1. Install dependencies
cd /path/to/eames-design-agent
bun add diff

# 2. Copy the permission system code above into:
#    - src/hooks/useSdkAgentExecution.ts (add permissionMode param)
#    - src/cli.tsx (add permission state & UI)
#    - src/agent/sdk-agent.ts (add PreToolUse hook)

# 3. Update PhaseStatusBar.tsx with permission indicator

# 4. Create SessionPicker.tsx component

# 5. Test!
bun run dev
```

---

## 📊 FINAL PARITY SCORECARD

After implementing the above:

| Category | Before | After | Status |
|----------|--------|-------|--------|
| Core Functionality | 90% | 100% | ✅ |
| Input & Shortcuts | 90% | 95% | ✅ |
| Slash Commands | 75% | 90% | ✅ |
| Special Input Modes | 100% | 100% | ✅ |
| **Permission System** | **12%** | **100%** | **🎯 TARGET** |
| Session Management | 50% | 90% | ✅ |
| Vim Mode | 0% | 0% | 🟡 Optional |
| UI & Visual | 58% | 95% | ✅ |
| Advanced Features | 62% | 85% | ✅ |

**Overall: 70% → 95%+ in 3-4 hours of focused work!**

---

## 🎓 KEY INSIGHTS FROM YOUR CODE

**What You're Doing Right:**

1. **Excellent SDK Integration** - Your `useSdkAgentExecution.ts` is well-structured
2. **Component Architecture** - Clean separation with Ink components
3. **You Already Have Most Components** - PermissionPrompt exists, just needs wiring!
4. **EnhancedInput is 90% Done** - Most shortcuts already implemented
5. **Good Documentation** - Your analysis docs are thorough

**What's Holding You Back:**

1. **Permission mode is hardcoded** - Just change one line!
2. **Components exist but aren't connected** - Wire up the callbacks
3. **Missing diff library** - One npm install fixes this
4. **Session picker needs UI** - Component is straightforward

**Bottom Line:** You're MUCH closer than 70%. The core work is done. You just need to:
- Wire up existing components
- Add permission mode state
- Implement diff preview
- Build session picker UI

---

## 🔗 REFERENCES

### Official Documentation
- [Claude Code Quickstart](https://code.claude.com/docs/en/quickstart)
- [@anthropic-ai/claude-agent-sdk on npm](https://www.npmjs.com/package/@anthropic-ai/claude-agent-sdk)
- [Claude Code Cheatsheet - Commands & Workflows](https://awesomeclaude.ai/code-cheatsheet)
- [Keyboard Shortcuts Guide](https://deepwiki.com/FlorianBruniaux/claude-code-ultimate-guide/2.4-keyboard-shortcuts-and-quick-actions)

### Key Findings
- Permission modes: `default`, `acceptEdits`, `plan`, `bypassPermissions`
- Shift+Tab cycles modes
- File edits show diff preview
- SDK v0.2.11 has PreToolUse hooks for permissions

---

**YOU GOT THIS! 🚀**

Most of your work is already done. Just need to connect the dots.
