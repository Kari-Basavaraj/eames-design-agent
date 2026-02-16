# SDK Parity & Proceed Gates Analysis
# Updated: 2026-02-16

## Summary

Eames needs **intelligent follow-up questions** and **proceed checkpoints** like Claude Code: after completing a major deliverable (e.g., PRD + Research), the agent should ask "Should I proceed with implementing the code?" and wait for user confirmation before continuing.

---

## Claude Code SDK Capabilities (Reference)

From [Claude API Docs](https://platform.claude.com/docs/en/agent-sdk/user-input):

| Feature | Description | Eames Status |
|---------|-------------|--------------|
| **AskUserQuestion** | Claude asks multiple-choice questions during execution; `canUseTool` fires when `toolName === "AskUserQuestion"` | ❌ SDK agent: not in allowedTools, no canUseTool |
| **canUseTool** | Callback for tool approval (Bash, Write, Edit) AND AskUserQuestion | ❌ SDK agent: not passed |
| **Tool approval** | User approves/denies each tool use | ⚠️ LangChain: custom permission prompt; SDK: no canUseTool |
| **Clarification (vague prompts)** | Ask questions before proceeding | ✅ LangChain: implemented via onClarificationNeeded |
| **Proceed checkpoints** | "I'm done with X. Should I proceed with Y?" | ❌ Not implemented |

---

## Current Eames Architecture

### LangChain Mode (5-phase)
- **Understand** → **Clarification** (if vague) → **Plan** → **Execute** → **Reflect** → (loop or) **Answer**
- No approval gates between phase iterations
- Agent runs through entire loop without pausing for "proceed?"

### SDK Mode
- Uses `@anthropic-ai/claude-agent-sdk` ^0.2.42
- `allowedTools: ['Read', 'Edit', 'Glob', 'Grep', 'Bash']` — **AskUserQuestion missing**
- No `canUseTool` callback — Claude cannot ask questions or get tool approval via SDK
- Permission prompt exists in CLI but is for a different flow (useSdkAgentExecution)

---

## Implementation Plan

### 1. Proceed Checkpoints (LangChain) ✅ Priority 1
Add `onProceedCheckpoint` callback: when Reflect says "not complete" and we're about to start the next iteration, ask the user.

**Flow:**
```
Iteration 1: Plan (research + PRD) → Execute → Reflect (says "need implementation")
  → onProceedCheckpoint({ completed: "PRD and research", next: "implementation" })
  → User: Y → continue to Iteration 2
  → User: n → go to Answer with current output
```

### 2. SDK Agent Enhancements ✅ Priority 2
- Add `AskUserQuestion` to `allowedTools`
- Pass `canUseTool` callback that:
  - Routes `AskUserQuestion` to clarification UI (similar to LangChain)
  - Routes tool approval (Bash, Write, Edit) to permission prompt
- Wire callback from CLI through useSdkAgentExecution

### 3. Answer Phase Follow-up (Optional)
The Answer phase could include "Next deliverable options (tell me which you want)" — the content already does this. Making it interactive would require:
- Either: a proceed gate **before** Answer (when we have a "partial" deliverable)
- Or: treat user's next message as continuation (requires session/memory)

---

## SDK Version

- **Current:** `@anthropic-ai/claude-agent-sdk` ^0.2.42
- **Latest:** 0.2.42 (as of 2026-02-16)
- **Status:** Up to date

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/agent/orchestrator.ts` | Add onProceedCheckpoint, call after Reflect when !isComplete |
| `src/agent/state.ts` | Add ProceedCheckpointInfo type |
| `src/agent/phases/reflect.ts` | Emit suggestedProceedQuestion, completedSummary |
| `src/hooks/useAgentExecution.ts` | Add proceedRequest, submitProceedAnswer |
| `src/cli.tsx` | ProceedPrompt UI, route input when in proceed mode |
| `src/agent/sdk-agent.ts` | Add AskUserQuestion to allowedTools, canUseTool |
| `src/hooks/useSdkAgentExecution.ts` | Wire canUseTool, onAskUserQuestion |
