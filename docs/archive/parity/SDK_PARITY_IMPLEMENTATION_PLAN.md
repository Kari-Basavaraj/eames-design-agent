# SDK Parity Implementation Plan
# Updated: 2026-02-16

## Principle: Two Modes, No Confusion

**SDK mode** and **LangChain mode** are **separate, independent implementations**. Do not mix them.

### Execution Order
1. **First:** Implement 100% Claude Code SDK parity in Eames (SDK mode)
2. **Then:** Implement all LangChain features (LangChain mode)

---

## Part 1: Claude Code SDK Mode — 100% Parity

### Current SDK Mode State

| Feature | Status | Notes |
|---------|--------|-------|
| Basic query() | ✅ | Works |
| Read, Edit, Glob, Grep, Bash | ✅ | In allowedTools |
| Write | ❌ | Missing from allowedTools |
| WebSearch, WebFetch | ❌ | Missing |
| AskUserQuestion | ❌ | Not in allowedTools, no canUseTool |
| canUseTool | ❌ | Not passed |
| permissionMode | ❌ | Not configurable |
| Sessions (resume, continue) | ❌ | Not wired |
| Subagents (Task tool) | ❌ | Not configured |
| MCP servers | ❌ | Not wired |
| Hooks | ❌ | Not wired |

### SDK Parity Implementation Phases

#### Phase 1: AskUserQuestion + canUseTool (Priority 1) ✅ DONE
- ✅ Use `tools: { type: 'preset', preset: 'claude_code' }` for full tool set (Read, Write, Edit, Glob, Grep, Bash, WebSearch, WebFetch, AskUserQuestion)
- ✅ Implement `canUseTool` callback that:
  - **AskUserQuestion:** Present questions via AskUserQuestionPrompt, collect answers, return `{ behavior: 'allow', updatedInput: { answers: [...] } }`
  - **Other tools:** Allow by default `{ behavior: 'allow' }`
- ✅ Wire from `useSdkAgentExecution` → `SdkAgent` → `query()` options
- ✅ CLI: AskUserQuestionPrompt, route handleSubmit to submitAskUserAnswer

#### Phase 2: Full Tool Set ✅ DONE
- ✅ Using `tools: { type: 'preset', preset: 'claude_code' }` for full parity (Read, Write, Edit, Glob, Grep, Bash, WebSearch, WebFetch, AskUserQuestion)

#### Phase 3: Permission Modes ✅ DONE
- ✅ permissionMode: default | acceptEdits | plan | bypassPermissions | dontAsk
- ✅ /permission command in SDK mode
- ✅ Tool permission prompt (Bash, Edit, Write) when default
- ✅ canUseTool respects all modes

#### Phase 4: Sessions ✅ DONE
- ✅ resume, continue passed to query()
- ✅ processQuery(query, { resume, continue })
- ✅ SessionPicker onSelect sets pendingResumeSessionId for SDK mode
- ✅ /resume opens picker; selecting session loads it for next message

#### Phase 5: Advanced (Optional)
- Subagents (Task tool, AgentDefinition)
- MCP servers for SDK
- Hooks (PreToolUse, PostToolUse, etc.)

---

## Part 2: LangChain Mode — All Features

### Current LangChain State

| Feature | Status |
|---------|--------|
| 5-phase (Understand, Plan, Execute, Reflect) | ✅ |
| Clarification (vague prompts) | ✅ |
| Proceed checkpoints | ✅ |
| Custom tools (Tavily, design, etc.) | ✅ |
| Multi-LLM | ✅ |

### LangChain Remaining (per MASTER_IMPLEMENTATION_PLAN)
- Any Phase 1–5 orchestration enhancements
- DeepAgents integration
- Eames Brain prompts
- CompositeBackend, etc.

---

## Files Reference

| Mode | Key Files |
|------|-----------|
| SDK | `src/agent/sdk-agent.ts`, `src/hooks/useSdkAgentExecution.ts` |
| LangChain | `src/agent/orchestrator.ts`, `src/hooks/useAgentExecution.ts` |
| Shared | `src/cli.tsx` (mode switch), `src/components/ClarificationPrompt.tsx`, `src/components/ProceedPrompt.tsx` |
