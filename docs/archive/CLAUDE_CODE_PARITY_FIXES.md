# CLAUDE CODE PARITY - IMPLEMENTATION GUIDE
**Last Updated:** 2026-01-17
**Goal:** Achieve 100% feature parity with Claude Code CLI

---

## 🎯 PRIORITY FIXES (Next 4 Hours)

### Fix #1: Permission System (CRITICAL - 1.5 hours)

Claude Code has 4 permission modes that you're currently bypassing. Implement this:

```typescript
// src/types/permissions.ts
export type PermissionMode = 'default' | 'acceptEdits' | 'bypassPermissions' | 'plan';

export interface PermissionState {
  mode: PermissionMode;
  pendingApproval: {
    type: 'file_edit' | 'bash_command' | 'file_delete';
    description: string;
    preview?: string;  // File diff for edits
    onApprove: () => void;
    onDeny: () => void;
  } | null;
}
```

**Update sdk-agent.ts:**
```typescript
// In SdkAgentOptions, change from:
permissionMode: 'bypassPermissions'

// To:
permissionMode: permissionModeFromState  // Passed from CLI state

// Add permission callbacks:
hooks: {
  PreToolUse: [{
    hooks: [async (input) => {
      // Check if permission required
      if (needsPermission(input.tool_name, permissionMode)) {
        // Trigger UI permission prompt
        const approved = await requestPermission(input);
        if (!approved) {
          return { continue: false };
        }
      }
      return { continue: true };
    }],
  }],
}
```

**Create PermissionPrompt component:**
```typescript
// src/components/PermissionPrompt.tsx
import React from 'react';
import { Box, Text, useInput } from 'ink';

export function PermissionPrompt({ 
  type, 
  description, 
  preview,
  onApprove, 
  onDeny 
}: PermissionPromptProps) {
  useInput((input, key) => {
    if (input === 'y' || input === 'Y') onApprove();
    if (input === 'n' || input === 'N') onDeny();
    if (key.escape) onDeny();
  });

  return (
    <Box flexDirection="column" borderStyle="round" borderColor="yellow">
      <Box paddingX={1}>
        <Text bold color="yellow">⚠ Permission Required</Text>
      </Box>
      <Box paddingX={1}>
        <Text>{description}</Text>
      </Box>
      {preview && (
        <Box paddingX={1} flexDirection="column">
          <Text color="gray">Preview:</Text>
          <Text>{preview}</Text>
        </Box>
      )}
      <Box paddingX={1} marginTop={1}>
        <Text bold>[Y] Approve  [N] Deny  [Esc] Cancel</Text>
      </Box>
    </Box>
  );
}
```

**Update CLI:**
```typescript
// Add permission state
const [permissionMode, setPermissionMode] = useState<PermissionMode>('default');
const [permissionRequest, setPermissionRequest] = useState<PendingPermission | null>(null);

// Shift+Tab to cycle modes
const cyclePermissionMode = useCallback(() => {
  const modes: PermissionMode[] = ['default', 'acceptEdits', 'plan', 'bypassPermissions'];
  const currentIndex = modes.indexOf(permissionMode);
  const nextIndex = (currentIndex + 1) % modes.length;
  setPermissionMode(modes[nextIndex]);
  setStatusMessage(`Permission mode: ${modes[nextIndex]}`);
}, [permissionMode]);

// Pass to EnhancedInput
<EnhancedInput
  onTogglePermissionMode={cyclePermissionMode}
  ...
/>

// Show permission prompt when needed
{permissionRequest && (
  <PermissionPrompt
    {...permissionRequest}
    onApprove={() => {
      permissionRequest.onApprove();
      setPermissionRequest(null);
    }}
    onDeny={() => {
      permissionRequest.onDeny();
      setPermissionRequest(null);
    }}
  />
)}

// Add mode indicator to StatusBar
<PhaseStatusBar
  permissionMode={permissionMode}
  ...
/>
```

---

### Fix #2: Visual Polish & UX (1 hour)

#### A. Add Thinking Mode Indicator

```typescript
// Update PhaseStatusBar.tsx
export function PhaseStatusBar({ 
  phase,
  permissionMode,
  thinkingMode = false,
  isAnswering,
  progressMessage
}) {
  return (
    <Box>
      {/* Permission mode */}
      <Text color={getPermissionColor(permissionMode)}>
        [{getPermissionLabel(permissionMode)}]
      </Text>
      
      {/* Thinking indicator */}
      {thinkingMode && (
        <Text color="blue"> 🧠 Extended Thinking</Text>
      )}
      
      {/* Phase */}
      <Text> {phase}</Text>
      
      {/* Progress */}
      {progressMessage && <Text color="gray"> - {progressMessage}</Text>}
    </Box>
  );
}
```

#### B. Improve Tool Output Display

```typescript
// Update ToolActivityView.tsx to add collapsible sections
export function ToolActivityView({ activities }: { activities: ToolActivity[] }) {
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  const toggleCollapse = (id: string) => {
    setCollapsed(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <Box flexDirection="column">
      {activities.map(activity => {
        const isCollapsed = collapsed.has(activity.id);
        const hasOutput = activity.output && activity.output.length > 0;
        
        return (
          <Box key={activity.id} flexDirection="column">
            {/* Tool header - clickable if has output */}
            <Box>
              {hasOutput && (
                <Text color="blue">
                  {isCollapsed ? '▶' : '▼'} 
                </Text>
              )}
              <Text color={getStatusColor(activity.status)}>
                {getStatusIcon(activity.status)} {activity.tool}
              </Text>
              <Text color="gray"> {activity.description}</Text>
            </Box>
            
            {/* Collapsible output */}
            {!isCollapsed && activity.output && (
              <Box marginLeft={2} flexDirection="column">
                <Text color="gray">{activity.output}</Text>
              </Box>
            )}
          </Box>
        );
      })}
    </Box>
  );
}
```

#### C. Add Diff View for File Edits

```typescript
// src/utils/diff.ts
import { diffLines } from 'diff';

export function generateDiff(original: string, modified: string): string {
  const diff = diffLines(original, modified);
  
  return diff.map(part => {
    const prefix = part.added ? '+' : part.removed ? '-' : ' ';
    return part.value.split('\n')
      .filter(line => line)
      .map(line => `${prefix} ${line}`)
      .join('\n');
  }).join('\n');
}
```

---

### Fix #3: Session Management UI (1 hour)

```typescript
// src/components/SessionPicker.tsx
import { existsSync, readdirSync, statSync, readFileSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

interface Session {
  id: string;
  timestamp: Date;
  firstQuery: string;
}

export function SessionPicker({ onSelect, onCancel }: SessionPickerProps) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    // Load sessions from ~/.eames/sessions/
    const sessionsDir = join(homedir(), '.eames', 'sessions');
    if (!existsSync(sessionsDir)) {
      setSessions([]);
      return;
    }

    const sessionFiles = readdirSync(sessionsDir)
      .filter(f => f.endsWith('.json'))
      .map(f => {
        const path = join(sessionsDir, f);
        const stat = statSync(path);
        const data = JSON.parse(readFileSync(path, 'utf-8'));
        
        return {
          id: f.replace('.json', ''),
          timestamp: new Date(stat.mtime),
          firstQuery: data.messages[0]?.content || 'Untitled',
        };
      })
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    
    setSessions(sessionFiles);
  }, []);

  useInput((input, key) => {
    if (key.upArrow) {
      setSelectedIndex(prev => Math.max(0, prev - 1));
    }
    if (key.downArrow) {
      setSelectedIndex(prev => Math.min(sessions.length - 1, prev + 1));
    }
    if (key.return && sessions[selectedIndex]) {
      onSelect(sessions[selectedIndex].id);
    }
    if (key.escape) onCancel();
  });

  return (
    <Box flexDirection="column" borderStyle="round">
      <Box paddingX={1}>
        <Text bold color="cyan">📁 Resume Session</Text>
      </Box>
      
      {sessions.length === 0 ? (
        <Box paddingX={1}>
          <Text color="gray">No saved sessions found</Text>
        </Box>
      ) : (
        sessions.slice(0, 10).map((session, idx) => (
          <Box key={session.id} paddingX={1}>
            {idx === selectedIndex ? (
              <>
                <Text bold color="cyan">❯ </Text>
                <Text bold>{formatDate(session.timestamp)}</Text>
                <Text> - </Text>
                <Text>{truncate(session.firstQuery, 60)}</Text>
              </>
            ) : (
              <>
                <Text>  </Text>
                <Text color="gray">{formatDate(session.timestamp)}</Text>
                <Text color="gray"> - </Text>
                <Text color="gray">{truncate(session.firstQuery, 60)}</Text>
              </>
            )}
          </Box>
        ))
      )}
      
      <Box paddingX={1} marginTop={1}>
        <Text color="gray">↑↓ navigate • Enter select • Esc cancel</Text>
      </Box>
    </Box>
  );
}
```

---

### Fix #4: Vim Mode Basics (30 min)

```typescript
// src/utils/vim-mode.ts
export type VimMode = 'normal' | 'insert' | 'visual';

export class VimEditor {
  mode: VimMode = 'normal';
  value: string = '';
  cursor: number = 0;
  
  // Normal mode commands
  handleNormalMode(key: string): void {
    switch (key) {
      case 'h': this.cursor = Math.max(0, this.cursor - 1); break;
      case 'l': this.cursor = Math.min(this.value.length, this.cursor + 1); break;
      case '0': this.cursor = 0; break;
      case '$': this.cursor = this.value.length; break;
      case 'w': this.jumpWordForward(); break;
      case 'b': this.jumpWordBackward(); break;
      case 'i': this.mode = 'insert'; break;
      case 'a': this.cursor++; this.mode = 'insert'; break;
      case 'I': this.cursor = 0; this.mode = 'insert'; break;
      case 'A': this.cursor = this.value.length; this.mode = 'insert'; break;
      case 'x': this.deleteChar(); break;
      case 'd': this.enterDeleteMode(); break;
    }
  }
  
  // Insert mode - normal text entry
  handleInsertMode(key: string): void {
    if (key === '\x1b') {  // Escape
      this.mode = 'normal';
      return;
    }
    // Normal character insertion
    this.value = this.value.slice(0, this.cursor) + key + this.value.slice(this.cursor);
    this.cursor++;
  }
  
  private jumpWordForward(): void {
    // Find next word boundary
    let pos = this.cursor;
    while (pos < this.value.length && !/\s/.test(this.value[pos])) pos++;
    while (pos < this.value.length && /\s/.test(this.value[pos])) pos++;
    this.cursor = pos;
  }
  
  private jumpWordBackward(): void {
    let pos = Math.max(0, this.cursor - 1);
    while (pos > 0 && /\s/.test(this.value[pos])) pos--;
    while (pos > 0 && !/\s/.test(this.value[pos])) pos--;
    this.cursor = pos === 0 ? 0 : pos + 1;
  }
}
```

---

## 🔧 INTEGRATION CHECKLIST

### 1. Update package.json dependencies
```json
{
  "dependencies": {
    "@anthropic-ai/claude-agent-sdk": "^0.2.11",
    "diff": "^5.2.0",
    "ink": "^6.5.1",
    "ink-spinner": "^5.0.0",
    "ink-text-input": "^6.0.0",
    "react": "^19.2.0"
  }
}
```

### 2. Replace Input with EnhancedInput in CLI
```typescript
// src/cli.tsx
import { EnhancedInput } from './components/EnhancedInput.js';

// Replace Input component:
<EnhancedInput 
  onSubmit={handleSubmit}
  commandHistory={commandHistory}
  onModelPicker={() => setState('model_select')}
  onToggleThinking={() => {
    setThinkingMode(prev => !prev);
    setStatusMessage(`Thinking mode: ${!thinkingMode ? 'ON' : 'OFF'}`);
  }}
  onTogglePermissionMode={cyclePermissionMode}
/>
```

### 3. Update sdk-agent.ts options
```typescript
// Pass permission mode from CLI state
const sdkAgent = useSdkAgentExecution({
  model,
  permissionMode,  // From CLI state
});
```

### 4. Add state to CLI
```typescript
const [permissionMode, setPermissionMode] = useState<PermissionMode>('default');
const [thinkingMode, setThinkingMode] = useState(false);
```

---

## 🎨 VISUAL IMPROVEMENTS

### Status Bar with All Indicators
```typescript
// Show at top of screen
<Box>
  <Text color="blue">Eames</Text>
  <Text color="gray"> | </Text>
  <Text color="green">{model}</Text>
  <Text color="gray"> | </Text>
  <Text color={getPermissionColor(permissionMode)}>
    {getPermissionLabel(permissionMode)}
  </Text>
  {thinkingMode && <Text color="blue"> 🧠</Text>}
  {useSdkMode && <Text color="cyan"> ⚡ SDK</Text>}
</Box>
```

---

## 📊 TESTING PLAN

### Manual Tests
- [ ] Ctrl+R history search with fuzzy matching
- [ ] Alt+B/F word navigation
- [ ] Shift+Tab permission mode cycling
- [ ] Alt+P model picker trigger
- [ ] Alt+T thinking mode toggle
- [ ] Permission prompts for file edits
- [ ] Session picker with arrow navigation
- [ ] Vim mode basic commands (i, a, h, j, k, l)
- [ ] Collapsible tool output
- [ ] Diff preview for file edits

### Automated Tests
```typescript
// tests/unit/vim-mode.test.ts
describe('VimEditor', () => {
  it('should move cursor with h/l', () => {
    const editor = new VimEditor();
    editor.value = 'hello';
    editor.handleNormalMode('l');
    expect(editor.cursor).toBe(1);
  });
});
```

---

## 🚀 DEPLOYMENT

### Build & Install
```bash
# Build the project
bun run typecheck
bun test

# Install globally
npm link

# Test installation
eames --version
eames "Hello world"
```

---

## 📝 REMAINING WORK (Low Priority)

- Image paste support (requires clipboard library)
- Background task management (Ctrl+B)
- Advanced vim features (visual mode, macros)
- Custom themes
- Plugin marketplace

---

## ✅ SUCCESS METRICS

You'll know you've achieved parity when:
- All keyboard shortcuts match Claude Code exactly
- Permission system works for all tool types
- Session picker shows all saved sessions
- Vim mode handles basic navigation
- UI looks polished with proper indicators
- No visual glitches or flicker
- Response time < 100ms for all inputs

**Estimated completion: 4 hours of focused work**
