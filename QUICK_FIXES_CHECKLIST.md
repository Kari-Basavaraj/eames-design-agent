# EAMES PARITY FIXES - QUICK CHECKLIST

**Time Required:** 3-4 hours  
**Parity Increase:** 70% → 95%+

---

## ✅ PRE-FLIGHT CHECKLIST

Before starting:

- [ ] Read `CLAUDE_CODE_PARITY_COMPREHENSIVE_ANALYSIS.md`
- [ ] Read `IMPLEMENTATION_GUIDE.md`
- [ ] Backup your current code: `git commit -am "Pre-parity checkpoint"`
- [ ] Ensure tests pass: `bun test`

---

## 📦 STEP 0: Install Dependencies (2 min)

```bash
bun add diff
```

---

## 🔧 STEP 1: Add Permission Types (5 min)

- [ ] Create `src/types/permissions.ts`
- [ ] Copy permission types from IMPLEMENTATION_GUIDE
- [ ] Export PermissionMode, PermissionRequest, labels, colors

**File:** `src/types/permissions.ts` (NEW FILE)

---

## 🔧 STEP 2: Update CLI State (10 min)

- [ ] Open `src/cli.tsx`
- [ ] Add `permissionMode` state (line ~170)
- [ ] Add `thinkingMode` state
- [ ] Add `permissionRequest` state
- [ ] Add `cyclePermissionMode` function
- [ ] Add `toggleThinkingMode` function
- [ ] Add `handlePermissionRequest` function

**File:** `src/cli.tsx` (MODIFY)

---

## 🔧 STEP 3: Update SDK Agent Hook (30 min)

- [ ] Open `src/hooks/useSdkAgentExecution.ts`
- [ ] Import `diff` library at top
- [ ] Add `permissionMode` to interface (line ~24)
- [ ] Add `onPermissionRequest` to interface
- [ ] Add `generateDiffPreview` helper function
- [ ] Update SdkAgent initialization (line ~317)
  - [ ] Change hardcoded `bypassPermissions` to parameter
  - [ ] Add `hooks.PreToolUse` with permission logic
- [ ] Test permission flow

**File:** `src/hooks/useSdkAgentExecution.ts` (MODIFY)

**Critical Lines:**
- Line 24: Add to interface
- Line 317: Change permission mode
- Line 320+: Add hooks

---

## 🔧 STEP 4: Wire Permission Prompt (15 min)

- [ ] Open `src/cli.tsx`
- [ ] Find `useSdkAgentExecution` call (line ~200)
- [ ] Add `permissionMode` parameter
- [ ] Add `onPermissionRequest` parameter
- [ ] Find render section (line ~600)
- [ ] Add permission prompt render block
  - [ ] Check `permissionRequest` state
  - [ ] Render `<PermissionPrompt>`
  - [ ] Wire approve/deny handlers

**File:** `src/cli.tsx` (MODIFY)

---

## 🔧 STEP 5: Update PhaseStatusBar (10 min)

- [ ] Open `src/components/PhaseStatusBar.tsx`
- [ ] Import permission types
- [ ] Add `permissionMode` prop
- [ ] Add `thinkingMode` prop
- [ ] Add permission indicator rendering
- [ ] Add thinking indicator rendering
- [ ] Add helper functions for colors/labels

**File:** `src/components/PhaseStatusBar.tsx` (MODIFY)

---

## 🔧 STEP 6: Update Keyboard Shortcuts (10 min)

- [ ] Open `src/components/EnhancedInput.tsx`
- [ ] Verify Shift+Tab handler exists (line ~150)
- [ ] Verify Alt+P handler exists
- [ ] Verify Alt+T handler exists
- [ ] Add Ctrl+D handler for exit
- [ ] Open `src/cli.tsx`
- [ ] Wire up `onTogglePermissionMode`
- [ ] Wire up `onToggleThinking`
- [ ] Wire up `onModelPicker`

**Files:**
- `src/components/EnhancedInput.tsx` (MODIFY)
- `src/cli.tsx` (MODIFY)

---

## 🔧 STEP 7: Create Session Picker (30 min)

- [ ] Create `src/components/SessionPicker.tsx`
- [ ] Copy SessionPicker component from IMPLEMENTATION_GUIDE
- [ ] Add to `src/components/index.ts` exports
- [ ] Test component loads sessions

**File:** `src/components/SessionPicker.tsx` (NEW FILE)

---

## 🔧 STEP 8: Wire Session Picker (10 min)

- [ ] Open `src/cli.tsx`
- [ ] Import SessionPicker
- [ ] Find `/resume` command handler (line ~400-500)
- [ ] Change to `setState('session_picker')`
- [ ] Add session picker render block (line ~700)
  - [ ] Check `state === 'session_picker'`
  - [ ] Render `<SessionPicker>`
  - [ ] Wire select/cancel handlers
- [ ] Add `sessionIdRef` if not exists

**File:** `src/cli.tsx` (MODIFY)

---

## 🔧 STEP 9: Update StatusBar Rendering (5 min)

- [ ] Open `src/cli.tsx`
- [ ] Find PhaseStatusBar render (search for `<PhaseStatusBar`)
- [ ] Add `permissionMode={permissionMode}`
- [ ] Add `thinkingMode={thinkingMode}`

**File:** `src/cli.tsx` (MODIFY)

---

## 🧪 STEP 10: Test Everything (30 min)

### Type Check
- [ ] Run `bun run typecheck`
- [ ] Fix any TypeScript errors

### Manual Testing
- [ ] Run `bun run dev`
- [ ] Test Shift+Tab mode cycling
  - [ ] Should see mode change in status bar
  - [ ] Should cycle through 4 modes
- [ ] Test permission prompts
  - [ ] Set to default mode
  - [ ] Try file edit command
  - [ ] Should see prompt with preview
  - [ ] Test approve (Y)
  - [ ] Test deny (N)
- [ ] Test auto-accept mode
  - [ ] Cycle to acceptEdits
  - [ ] File edit should execute without prompt
- [ ] Test plan mode
  - [ ] Cycle to plan mode
  - [ ] File edit should be blocked
- [ ] Test session picker
  - [ ] Type `/resume`
  - [ ] Should see list
  - [ ] Arrow keys work
  - [ ] Enter selects
  - [ ] Esc cancels
- [ ] Test thinking mode
  - [ ] Press Alt+T
  - [ ] Should see 🧠 in status bar
- [ ] Test model picker
  - [ ] Press Alt+P
  - [ ] Should show model selector

### Bug Fixes
- [ ] Fix any issues found
- [ ] Re-test problem areas

---

## 📊 VERIFICATION

After implementation, you should have:

### Permission System ✅
- [ ] 4 modes working (default, acceptEdits, plan, bypass)
- [ ] Shift+Tab cycles modes
- [ ] Mode indicator shows in status bar
- [ ] Permission prompts show for file edits
- [ ] Diff preview shows in prompts
- [ ] Approve/deny works correctly

### Session Management ✅
- [ ] `/resume` shows picker
- [ ] Sessions load from disk
- [ ] Arrow navigation works
- [ ] Session selection works
- [ ] Multi-turn conversations resume

### Visual Indicators ✅
- [ ] Permission mode indicator visible
- [ ] Thinking mode indicator (🧠) shows
- [ ] Status bar shows all info
- [ ] Colors correct for each mode

### Keyboard Shortcuts ✅
- [ ] Shift+Tab (permission mode)
- [ ] Alt+P (model picker)
- [ ] Alt+T (thinking mode)
- [ ] Ctrl+R (history search) - already done
- [ ] Ctrl+D (exit)
- [ ] All other shortcuts from EnhancedInput

---

## 📈 EXPECTED PARITY

```
Before:  ████████████████████████████░░░░░░░░░░░░  70%
After:   ████████████████████████████████████████  95%+

✅ Permission System: 12% → 100%
✅ Session Management: 50% → 90%
✅ Visual Indicators: 58% → 95%
✅ Overall: 70% → 95%+
```

---

## 🐛 COMMON ISSUES

### Issue: Permission prompt doesn't show
**Solution:**
- Check permissionMode is 'default'
- Verify onPermissionRequest is passed to SDK agent
- Check console for hook errors

### Issue: Diff shows "undefined"
**Solution:**
- Install diff: `bun add diff`
- Check file path in generateDiffPreview
- Verify file exists before reading

### Issue: Session picker empty
**Solution:**
- Check ~/.claude/sessions/ exists
- Try running Claude Code first to create sessions
- Check session JSON format

### Issue: Shift+Tab doesn't work
**Solution:**
- Verify raw mode is enabled in EnhancedInput
- Check event handler for '\x1b[Z'
- Test in different terminals

---

## 🎉 SUCCESS CRITERIA

You know you're done when:

1. ✅ All 4 permission modes cycle with Shift+Tab
2. ✅ File edits show diff preview in default mode
3. ✅ Session picker shows and works
4. ✅ Status bar shows mode indicator
5. ✅ All keyboard shortcuts work
6. ✅ No TypeScript errors
7. ✅ Manual tests pass

**CONGRATULATIONS! You've achieved 95%+ parity! 🚀**

---

## 📚 FILES MODIFIED SUMMARY

### New Files (2)
1. `src/types/permissions.ts`
2. `src/components/SessionPicker.tsx`

### Modified Files (5)
1. `src/cli.tsx` - Main changes
2. `src/hooks/useSdkAgentExecution.ts` - Permission logic
3. `src/components/PhaseStatusBar.tsx` - Visual indicators
4. `src/components/EnhancedInput.tsx` - Shortcuts (minor)
5. `src/components/index.ts` - Add exports

### Dependencies Added (1)
- `diff` - For file diff preview

---

## 🚀 NEXT ACTIONS

After completing this checklist:

1. **Commit your changes**
   ```bash
   git add .
   git commit -m "Achieve 95% Claude Code parity - permission system, session picker, visual polish"
   ```

2. **Update documentation**
   - Update README with new features
   - Document permission modes
   - Add keyboard shortcuts reference

3. **Optional enhancements**
   - Vim mode (if desired)
   - Image paste support
   - Custom themes
   - Additional design-specific features

**You're now at feature parity with Claude Code CLI! 🎊**

The core is solid. Time to make Eames your own! 💪
