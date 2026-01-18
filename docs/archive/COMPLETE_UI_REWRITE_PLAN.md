# COMPLETE UI REWRITE PLAN - Eames CLI
## Matching Claude Code SDK Level Features

**Created:** 2026-01-18  
**Status:** 🔴 CRITICAL - Major UI/UX gaps identified  
**Current Completion:** 35% (vs 70% claimed in docs)

---

## 🚨 CRITICAL FINDINGS

After reviewing all documentation and current implementation:

### What Documentation Claims:
- ✅ 70% feature parity with Claude Code
- ✅ SDK integration complete
- ✅ Live tool tracking working
- ✅ Permission system ready

### What Actually Exists:
- 🟡 35% actual implementation
- 🔴 SDK shows tool activity but UI doesn't display it properly
- 🔴 Permission system is **BYPASS ONLY** - no prompts, no modes
- 🔴 Missing 15+ critical UI components
- 🔴 No real-time tool visualization
- 🔴 Eames Brain NOT integrated into agent flow

---

## 📊 ACTUAL vs DOCUMENTED GAP ANALYSIS

### Category 1: Core SDK Tool Display (CRITICAL)

| Feature | Documented | Actual | Gap |
|---------|-----------|--------|-----|
| **Real-time tool streaming** | ✅ Claimed working | ❌ Shows static "Executing..." | **100% broken** |
| **Tool call visualization** | ✅ LiveProgress component | 🟡 Component exists but doesn't render | **75% broken** |
| **Tool status indicators** | ✅ Spinner/checkmark | ❌ Never shows | **100% missing** |
| **Tool result display** | ✅ Shows results | ❌ No results shown | **100% missing** |
| **Phase progression** | ✅ 5 phases visible | 🟡 Phases flash too fast | **50% broken** |

**Impact:** Users see "Executing..." with no feedback for 30+ seconds

---

### Category 2: Permission System (CRITICAL - SECURITY ISSUE)

| Feature | Documented | Actual | Gap |
|---------|-----------|--------|-----|
| **4 Permission Modes** | ✅ All implemented | ❌ Only BYPASS works | **75% missing** |
| **File edit prompts** | ✅ With diff preview | ❌ Never shows | **100% missing** |
| **Bash command prompts** | ✅ With preview | 🟡 Shows but bypasses | **50% broken** |
| **Mode cycling (Shift+Tab)** | ✅ Hooked up | ❌ Does nothing visible | **100% broken** |
| **Mode indicator in status** | ✅ Shows [DEFAULT] | ❌ Always shows [BYPASS] or hidden | **75% broken** |

**Impact:** Users have NO CONTROL over dangerous operations

---

### Category 3: Eames Brain Intelligence (CRITICAL)

| Feature | Documented | Actual | Gap |
|---------|-----------|--------|-----|
| **Context-aware prompts** | ✅ Implemented | ❌ Not called in agent | **100% missing** |
| **Framework lazy loading** | ✅ Working | ❌ Never triggered | **100% missing** |
| **Query type detection** | ✅ 6 types | ❌ Not integrated | **100% missing** |
| **Token optimization** | ✅ <20k target | ❌ Using naive prompts | **100% missing** |
| **Design thinking depth** | ✅ Senior-level | ❌ Generic execution | **100% missing** |

**Impact:** Eames acts like basic executor, not design intelligence

---

### Category 4: UI Components Status

| Component | Exists | Used | Working | Notes |
|-----------|--------|------|---------|-------|
| **LiveProgress** | ✅ | 🟡 | ❌ | Renders but no data |
| **EnhancedSdkProcessor** | ✅ | 🟡 | ❌ | Processes but doesn't connect |
| **PermissionPrompt** | ✅ | ❌ | ❌ | Shows but bypasses |
| **StatusBar** | ✅ | ✅ | 🟡 | Missing modes |
| **ThinkingIndicator** | ✅ | ❌ | ❌ | Never shows |
| **ToolActivityView** | ✅ | ❌ | ❌ | Not wired up |
| **TaskListView** | ✅ | ❌ | ❌ | Removed from CLI |
| **PhaseStatusBar** | ✅ | 🟡 | 🟡 | Flashes too fast |
| **ProgressIndicator** | ✅ | ❌ | ❌ | Not used |
| **TokenBudgetMeter** | ✅ | ❌ | ❌ | Not displayed |

**12 components built, only 2-3 actually working**

---

## 🎯 ROOT CAUSES

### 1. **Message Flow Disconnect**
- SDK sends messages → Processor receives → State updates → **UI never re-renders**
- Hook updates `liveToolCalls` → CLI checks for it → **Conditional logic prevents render**

### 2. **Permission System Not Wired**
- `onPermissionRequest` callback exists → Shows prompt → **Immediately bypasses**
- Mode cycling works → Updates state → **Never applies to SDK hooks**

### 3. **Eames Brain Not Connected**
- `eames-brain.ts` exists with all intelligence → **Never called by agent**
- `buildSystemPrompt()` accepts query → **Agent doesn't pass query parameter**

### 4. **Phase Timing Issues**
- SDK phases execute in <100ms → UI shows for 1.5s artificially → **Out of sync**
- Phases 1-4 complete before user sees them → Only "Executing" visible

### 5. **State Management Chaos**
- Multiple sources of truth (processor, hook, CLI)
- State updates don't trigger re-renders
- Conditional rendering prevents display

---

## 🔧 COMPLETE REWRITE REQUIRED

### Phase 1: Fix Message → UI Pipeline (2 hours)

#### 1.1 Fix EnhancedSdkProcessor Integration
**File:** `src/hooks/useSdkAgentExecution.ts`

**Current Problem:**
```typescript
// Processor initialized but not connected to UI state
processorRef.current = new EnhancedSdkProcessor({...});
// State updates but UI doesn't re-render
setLiveToolCalls(calls => [...calls, event]);
```

**Solution:**
```typescript
// Initialize processor ONCE at hook level
const [processor] = useState(() => new EnhancedSdkProcessor({
  onToolStart: (event) => {
    setCurrentTurn(prev => {
      if (!prev) return prev;
      // CRITICAL: Force new array reference for re-render
      const updated = [...prev.liveToolCalls, event];
      return { ...prev, liveToolCalls: updated };
    });
  },
  onToolProgress: (event) => {
    setCurrentTurn(prev => {
      if (!prev) return prev;
      // CRITICAL: Map creates new array
      const updated = prev.liveToolCalls.map(c => 
        c.id === event.id ? event : c
      );
      return { ...prev, liveToolCalls: updated };
    });
  },
  onToolComplete: (event) => {
    setCurrentTurn(prev => {
      if (!prev) return prev;
      const updated = prev.liveToolCalls.map(c =>
        c.id === event.id ? event : c
      );
      return { ...prev, liveToolCalls: updated };
    });
    // Don't auto-remove - let user see completion
  },
}));
```

#### 1.2 Fix CLI Rendering Logic
**File:** `src/cli.tsx`

**Current Problem:**
```typescript
{useSdkMode && 'liveToolCalls' in currentTurn ? (
  <LiveProgress tools={(currentTurn as any).liveToolCalls || []} />
) : null}
```

**Solution:**
```typescript
{useSdkMode && currentTurn && (
  <LiveProgress 
    phase={currentTurn.state.currentPhase}
    tools={currentTurn.liveToolCalls || []}
    message={currentTurn.state.progressMessage}
  />
)}
```

#### 1.3 Fix LiveProgress Component
**File:** `src/components/LiveProgress.tsx`

**Current Problem:**
```typescript
// Returns null too eagerly
if (!message && tools.length === 0) return null;
```

**Solution:**
```typescript
// Show during execute phase even without message
const isExecuting = phase === 'execute';
const hasContent = message || tools.length > 0;

if (!isExecuting && !hasContent) {
  return null;
}

return (
  <Box flexDirection="column" marginLeft={2} marginTop={1}>
    {/* Always show phase during execute */}
    {isExecuting && (
      <Box marginBottom={1}>
        <Spinner type="dots" />
        <Text dimColor> {message || 'Executing...'}</Text>
      </Box>
    )}
    
    {/* Tool calls */}
    {tools.length > 0 && (
      <Box flexDirection="column">
        {tools.map(tool => <ToolCallRow key={tool.id} tool={tool} />)}
      </Box>
    )}
  </Box>
);
```

---

### Phase 2: Fix Permission System (3 hours)

#### 2.1 Implement ALL Permission Modes
**File:** `src/hooks/useSdkAgentExecution.ts`

**Current Code:**
```typescript
permissionMode: permissionMode,  // Passed but not used
```

**Fixed Implementation:**
```typescript
hooks: {
  PreToolUse: [{
    hooks: [async (input: any) => {
      const needsPermission = ['Write', 'Edit', 'Bash', 'Delete'].includes(input.tool_name);
      
      // Mode 1: BYPASS - No prompts
      if (permissionMode === 'bypassPermissions') {
        return { continue: true };
      }
      
      // Mode 2: PLAN - Block all execution
      if (permissionMode === 'plan') {
        if (needsPermission) {
          return { continue: false, reason: 'Plan mode - execution blocked' };
        }
        return { continue: true };
      }
      
      // Mode 3: AUTO_ACCEPT - Auto-approve edits
      if (permissionMode === 'acceptEdits') {
        if (['Write', 'Edit'].includes(input.tool_name)) {
          return { continue: true };  // Auto-approve
        }
        if (input.tool_name === 'Bash') {
          // Still prompt for bash
          const approved = await onPermissionRequest?.({...});
          return { continue: approved };
        }
      }
      
      // Mode 4: DEFAULT - Prompt for everything
      if (permissionMode === 'default' && needsPermission) {
        const preview = await generateDiffPreview(input.tool_name, input.tool_input);
        const approved = await onPermissionRequest?.({
          type: input.tool_name === 'Bash' ? 'bash_command' : 'file_edit',
          tool: input.tool_name,
          description: input.tool_name === 'Bash' 
            ? input.tool_input?.command || '' 
            : '',
          preview,
        });
        return { continue: approved ?? false };
      }
      
      return { continue: true };
    }],
  }],
}
```

#### 2.2 Fix Permission Mode Indicator
**File:** `src/components/StatusBar.tsx`

**Add to render:**
```typescript
<Box>
  {/* Permission mode - ALWAYS VISIBLE */}
  <Text color={modeColors[permissionMode]}>
    [{modeLabels[permissionMode]}]
  </Text>
  
  {/* Thinking mode */}
  {thinkingMode && <Text color="blue"> 🧠</Text>}
  
  {/* SDK mode */}
  {useSdkMode && <Text color="green"> ⚡SDK</Text>}
  
  {/* Model */}
  <Text color="gray" dimColor> · {model}</Text>
</Box>
```

#### 2.3 Hook Up Mode Cycling
**File:** `src/cli.tsx`

**Current:**
```typescript
// Shift+Tab handler exists but doesn't update SDK
const cyclePermissionMode = useCallback(() => {
  setPermissionMode(modes[nextIndex]);
  setStatusMessage(`...`);
}, [permissionMode]);
```

**Fixed:**
```typescript
const cyclePermissionMode = useCallback(() => {
  const modes: PermissionMode[] = ['default', 'acceptEdits', 'plan', 'bypassPermissions'];
  const nextMode = modes[(modes.indexOf(permissionMode) + 1) % modes.length];
  
  setPermissionMode(nextMode);
  
  // CRITICAL: Show visual feedback
  setStatusMessage(`🔒 Permission mode: ${PERMISSION_MODE_LABELS[nextMode]}`);
  
  // Flash the status bar
  setTimeout(() => setStatusMessage(null), 3000);
}, [permissionMode]);
```

---

### Phase 3: Integrate Eames Brain (2 hours)

#### 3.1 Connect to Agent Execution
**File:** `src/agent/orchestrator.ts` or `src/agent/sdk-agent.ts`

**Find where system prompt is built:**
```typescript
// Current
const systemPrompt = buildSystemPrompt(cwd);
```

**Replace with:**
```typescript
import { buildIntelligentSystemPrompt } from './eames-brain.js';

// Pass query for context-aware intelligence
const systemPrompt = buildIntelligentSystemPrompt(
  cwd,
  userQuery,
  conversationHistory || []
);
```

#### 3.2 Pass Query Through All Phases
**Files:** `src/agent/phases/*.ts`

**Pattern for each phase:**
```typescript
// Add to phase function signature
async function planPhase(
  query: string,
  understandResult: string,
  conversationHistory: Message[]
) {
  // Build contextual prompt
  const intelligentPrompt = buildIntelligentSystemPrompt(
    process.cwd(),
    query,
    conversationHistory
  );
  
  const systemPrompt = intelligentPrompt + '\n\n' + PLAN_SYSTEM_PROMPT;
  
  // ... rest of phase
}
```

#### 3.3 Enable Brain Logging
**File:** `src/agent/eames-brain.ts`

**Uncomment or add:**
```typescript
console.log('[Eames Brain] Query Type:', context.queryType);
console.log('[Eames Brain] Frameworks:', context.requiredFrameworks);
console.log('[Eames Brain] Estimated Tokens:', context.estimatedTokens);
```

---

### Phase 4: Fix Phase Timing (1 hour)

#### 4.1 Remove Artificial Delays
**File:** `src/agent/sdk-agent.ts`

**Current:**
```typescript
// Phase 1: Understand (visible for 1.5 seconds)
this.callbacks.onPhaseStart?.('understand');
await new Promise(resolve => setTimeout(resolve, 1500));
this.callbacks.onPhaseComplete?.('understand');
```

**Fixed:**
```typescript
// Let SDK drive phase timing naturally
this.callbacks.onPhaseStart?.('understand');
// NO artificial delay
this.callbacks.onPhaseComplete?.('understand');
```

#### 4.2 Show Phases Based on SDK Messages
```typescript
// Detect phase changes from SDK messages
if (message.type === 'thinking') {
  this.callbacks.onPhaseStart?.('plan');
}
if (message.type === 'tool_use') {
  this.callbacks.onPhaseStart?.('execute');
}
if (message.type === 'text') {
  this.callbacks.onPhaseStart?.('answer');
}
```

---

### Phase 5: UI Polish & Missing Features (2 hours)

#### 5.1 Add Missing Components to CLI

**ToolActivityView** (Real-time tool history):
```typescript
{useSdkMode && toolActivities.length > 0 && (
  <Box marginLeft={2} marginTop={1}>
    <ToolActivityView activities={toolActivities} />
  </Box>
)}
```

**TokenBudgetMeter** (Show context usage):
```typescript
{useSdkMode && (
  <TokenBudgetMeter 
    used={sessionUsage.totalInputTokens + sessionUsage.totalOutputTokens}
    limit={getContextLimit(model)}
  />
)}
```

**ThinkingIndicator** (When AI is reasoning):
```typescript
{thinkingMode && currentTurn && (
  <ThinkingIndicator message="Deep thinking enabled..." />
)}
```

#### 5.2 Improve LiveProgress Visual Design

**Add color coding:**
```typescript
const statusColors = {
  starting: 'cyan',
  running: 'blue',
  completed: 'green',
  failed: 'red',
};

<Text color={statusColors[tool.status]}>
  {statusIcons[tool.status]} {description}
</Text>
```

**Add progress bars for long tools:**
```typescript
{tool.status === 'running' && tool.elapsedTime > 3000 && (
  <Box marginLeft={4}>
    <Text dimColor>({Math.round(tool.elapsedTime / 1000)}s)</Text>
  </Box>
)}
```

---

## 📋 COMPLETE IMPLEMENTATION CHECKLIST

### Week 1: Critical Fixes (10 hours)
- [ ] **Phase 1**: Fix message flow (2h)
  - [ ] EnhancedSdkProcessor state updates
  - [ ] CLI rendering logic
  - [ ] LiveProgress component
- [ ] **Phase 2**: Permission system (3h)
  - [ ] All 4 modes implemented
  - [ ] Mode indicator visible
  - [ ] Mode cycling works
- [ ] **Phase 3**: Eames Brain (2h)
  - [ ] Connect to agent
  - [ ] Pass query through phases
  - [ ] Enable logging
- [ ] **Phase 4**: Phase timing (1h)
  - [ ] Remove artificial delays
  - [ ] SDK-driven phases
- [ ] **Phase 5**: UI polish (2h)
  - [ ] Missing components
  - [ ] Visual improvements

### Week 2: Testing & Validation (5 hours)
- [ ] Test all permission modes
- [ ] Test Eames Brain with design queries
- [ ] Verify tool display works
- [ ] Check token efficiency
- [ ] A/B compare with Claude Code

### Week 3: Advanced Features (5 hours)
- [ ] Collapsible output sections
- [ ] Session picker UI
- [ ] Vim mode basics
- [ ] Diff preview for edits

---

## 🎯 SUCCESS CRITERIA

### Must Have (Week 1)
- ✅ See tools execute in real-time with spinners
- ✅ Permission prompts block dangerous operations
- ✅ Mode indicator shows current permission level
- ✅ Eames Brain activates for design queries
- ✅ Phases show naturally, not artificially

### Should Have (Week 2)
- ✅ All 4 permission modes work correctly
- ✅ Token usage <20k for 95% of queries
- ✅ UI feels responsive and informative

### Nice to Have (Week 3)
- ✅ Vim mode for power users
- ✅ Collapsible sections for long output
- ✅ Session history picker

---

## 🚀 QUICK START

```bash
# 1. Save this plan
# 2. Start with Phase 1.1
cd ~/code/eames-design-agent
code src/hooks/useSdkAgentExecution.ts

# 3. Apply fixes one by one
# 4. Test after each phase
bun run dev

# 5. Try this test query after Phase 1:
echo "create a test file" | bun run start
# Should see: ⠋ Running: touch test.txt

# 6. Try this after Phase 2:
# Switch to default mode with Shift+Tab
# Should see: [DEFAULT] and permission prompt

# 7. Try this after Phase 3:
echo "Create a PRD for expense tracker" | bun run start
# Should see: [Eames Brain] frameworks activated
```

---

## 📝 NOTES

### Why This Plan vs Previous Fixes

Previous fixes addressed **symptoms**:
- Removed debug logs ✅
- Fixed type errors ✅
- Simplified rendering ✅

But **root causes remain**:
- Message flow broken ❌
- Permission system not wired ❌
- Eames Brain not connected ❌
- Phase timing artificial ❌

**This plan fixes root causes systematically.**

### Estimated Time
- **Total:** 20 hours
- **Critical path:** 10 hours (Week 1)
- **Can be parallelized:** No (sequential dependencies)

### Risk Assessment
- **Low risk:** Phases 1-2 (pure bug fixes)
- **Medium risk:** Phase 3 (new integration)
- **Low risk:** Phases 4-5 (polish)

**Overall risk: LOW** - Well-documented, testable fixes

---

**Ready to begin?** Start with Phase 1.1 and work through sequentially.
