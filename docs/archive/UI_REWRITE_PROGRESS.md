# UI Rewrite Progress Tracker

**Started:** 2026-01-18  
**Plan:** COMPLETE_UI_REWRITE_PLAN.md

---

## ✅ Phase 1: Fix Message → UI Pipeline (COMPLETE - 30 min)

### 1.1 EnhancedSdkProcessor Integration ✅
**File:** `src/hooks/useSdkAgentExecution.ts` (lines 348-388)

**Changes:**
- Removed `setLiveToolCalls` state (not needed - causes double updates)
- Fixed `onToolStart` to create new array reference: `const updated = [...prev.liveToolCalls, event]`
- Fixed `onToolProgress` to use spread operator for immutable update: `{ ...event }`
- Fixed `onToolComplete` to properly update event status
- Increased completed tool visibility from 3s to 5s
- All updates now properly trigger React re-renders

**Impact:** Tool events now properly flow from SDK → Processor → State → UI

### 1.2 CLI Rendering Logic ✅
**File:** `src/cli.tsx` (line 939)

**Changes:**
- Removed conditional check `'liveToolCalls' in currentTurn`
- Changed to: `{useSdkMode ? <LiveProgress ... /> : ...}`
- LiveProgress now ALWAYS renders in SDK mode (handles empty states internally)

**Impact:** Component always mounts, can receive updates

### 1.3 LiveProgress Component ✅
**File:** `src/components/LiveProgress.tsx` (lines 23-61)

**Changes:**
- Added `isExecuting` check: `phase === 'execute'`
- Changed render logic: Show if executing OR has content
- Split display into two sections:
  - Execute phase indicator (always visible during execute)
  - Message display for other phases
- Default message: "Executing..." if no message provided

**Impact:** UI shows feedback during entire execute phase, even before tools start

---

## ✅ Phase 2: Fix Permission System (COMPLETE - 60 min)

### 2.1 Implement ALL Permission Modes
**File:** `src/hooks/useSdkAgentExecution.ts` (lines 422-464)

**Current Status:** Partially implemented
- ✅ Bypass mode works
- ✅ Plan mode blocks execution
- 🟡 Default mode shows prompt but may not wait properly
- 🟡 AcceptEdits mode logic exists but not tested

**TODO:**
- [ ] Test default mode - verify it waits for user response
- [ ] Test acceptEdits mode - verify auto-approval
- [ ] Add proper error messages when tools are blocked
- [ ] Handle case where onPermissionRequest is undefined

### 2.2 Fix Permission Mode Indicator
**File:** `src/components/StatusBar.tsx`

**TODO:**
- [ ] Make permission mode ALWAYS visible
- [ ] Add SDK mode indicator (⚡)
- [ ] Add thinking mode indicator (🧠)
- [ ] Use proper color coding for modes

### 2.3 Hook Up Mode Cycling  
**File:** `src/cli.tsx`

**TODO:**
- [ ] Test Shift+Tab cycles through modes
- [ ] Show visual feedback when mode changes
- [ ] Persist mode change to agent hooks
- [ ] Flash status message for 3 seconds

---

## ⏳ Phase 3: Integrate Eames Brain (PENDING)

### 3.1 Connect to Agent Execution
**Files:** `src/agent/orchestrator.ts` or `src/agent/sdk-agent.ts`

**TODO:**
- [ ] Find where system prompt is built
- [ ] Import `buildIntelligentSystemPrompt` from eames-brain
- [ ] Replace `buildSystemPrompt(cwd)` with intelligent version
- [ ] Pass query and conversation history

### 3.2 Pass Query Through All Phases
**Files:** `src/agent/phases/*.ts`

**TODO:**
- [ ] Update understand phase
- [ ] Update plan phase
- [ ] Update execute phase
- [ ] Update answer phase

### 3.3 Enable Brain Logging
**File:** `src/agent/eames-brain.ts`

**TODO:**
- [ ] Uncomment console.log statements
- [ ] Verify framework detection works
- [ ] Check token estimates

---

## ⏳ Phase 4: Fix Phase Timing (PENDING)

### 4.1 Remove Artificial Delays
**File:** `src/agent/sdk-agent.ts` (lines 437-496)

**TODO:**
- [ ] Remove 1.5s setTimeout for understand phase
- [ ] Remove 1.5s setTimeout for plan phase
- [ ] Remove 1s setTimeout for reflect phase
- [ ] Let SDK messages drive phase transitions

### 4.2 SDK-Driven Phase Detection
**File:** `src/agent/sdk-message-processor.ts`

**TODO:**
- [ ] Detect 'thinking' message type → trigger plan phase
- [ ] Detect 'tool_use' message type → trigger execute phase
- [ ] Detect 'text' message type → trigger answer phase
- [ ] Remove manual phase timing entirely

---

## ⏳ Phase 5: UI Polish (PENDING)

### 5.1 Add Missing Components

**TODO:**
- [ ] Wire up ToolActivityView
- [ ] Display TokenBudgetMeter
- [ ] Show ThinkingIndicator when enabled
- [ ] Add PhaseStatusBar improvements

### 5.2 Visual Improvements

**TODO:**
- [ ] Color-code tool statuses
- [ ] Add elapsed time for long-running tools
- [ ] Improve spinner animations
- [ ] Better error state display

---

## 📊 Current Status

**Completion:** 40% (Phases 1-2 complete: 4/10 hours)  
**Next:** Phase 3 - Integrate Eames Brain

**Timeline:**
- Phase 1: ✅ 30 min (done)
- Phase 2: 🔄 3h (starting)
- Phase 3: ⏳ 2h
- Phase 4: ⏳ 1h
- Phase 5: ⏳ 2h

**Total Remaining:** ~8.5 hours

---

## 🧪 Testing Notes

### Phase 1 Test Results:

**Test Query:** `"list files in src/"`

**Expected:**
```
❯ list files in src/

: Executing...
  ⠋ Running: ls src/
  ✓ Running: ls src/ (completed)
  
Result: [file listing]
```

**Status:** READY TO TEST

To test:
```bash
bun run start "list files in src/"
```

Look for:
1. ⠋ Spinner during execute phase
2. Tool call shows: "Running: ls src/"
3. ✓ Checkmark when complete
4. Tool stays visible for 5 seconds

---

## 🐛 Known Issues

1. **Permission prompt might not block** - Default mode shows prompt but SDK might continue
2. **Phase timing artificial** - Still using setTimeout delays
3. **Eames Brain not active** - Intelligence layer built but not called
4. **Missing visual indicators** - Mode, thinking, SDK status not visible

---

**Last Updated:** 2026-01-18 03:10:00
