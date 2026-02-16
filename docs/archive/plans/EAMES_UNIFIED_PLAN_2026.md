# Eames Unified Plan 2026
## OpenAI Fallback + Claude Code SDK-First + LangChain Integration

**Created:** 2026-02-16  
**Status:** Agreed — In Progress  
**Tracker:** [EAMES_PLAN_TRACKER.md](../EAMES_PLAN_TRACKER.md)  
**Repos:** eames-design-agent (V1) + Eames-Design-Agent-V2 (reference only)

---

## 1. Immediate: OpenAI Fallback (Anthropic Billing Bug)

### Problem
Anthropic API returns `400: Your credit balance is too low` — blocks Eames from running.

### Solution
Use OpenAI API as fallback when Anthropic is unavailable.

| Approach | Implementation | Effort |
|----------|----------------|--------|
| **A. Env flag** | `EAMES_USE_OPENAI=1` → default provider = openai, model = gpt-4o | 1–2 hrs |
| **B. Auto-detect** | If ANTHROPIC fails with 400/403 → retry with OPENAI_API_KEY | 2–3 hrs |
| **C. Model picker** | User selects OpenAI via `/model` (already supported) | 0 hrs |

**Recommendation:** A + C. Add `EAMES_USE_OPENAI` to auto-default to OpenAI. User can always use `/model` to switch.

### Code Touch Points
- `src/model/llm.ts` — add `gpt-` prefix to MODEL_PROVIDERS for explicit OpenAI routing
- `src/utils/config.ts` — add `preferOpenAI` / `EAMES_USE_OPENAI` handling
- `src/cli.tsx` — default provider = openai when flag set
- `env.example` — document `EAMES_USE_OPENAI=1` for Anthropic billing workaround

---

## 2. Repo Comparison: V1 vs V2

### Eames-Design-Agent (Current)
| Layer | Status | Tech |
|-------|--------|------|
| Orchestrator | ✅ Working | Custom 5-phase (Understand→Plan→Execute→Reflect→Answer) |
| LLM | ✅ Working | LangChain (Anthropic, OpenAI, Gemini, Ollama) |
| Tools | ✅ Working | LangChain tools (search, execution, design research) |
| UI | ✅ Working | Ink/React TUI |
| Claude SDK | ❌ Removed | sdk-agent.ts, sdk-message-processor.ts missing |
| Built-in tools | ❌ Missing | No Read/Edit/Bash/Glob/Grep from SDK |

### Eames-Design-Agent-V2 (Planning Only)
| Layer | Status | Vision |
|-------|--------|--------|
| Orchestrator | 🏗️ Planned | Claude Agent SDK `query()` |
| Built-in tools | 🏗️ Planned | Read, Write, Edit, Bash, Glob, Grep, WebSearch, WebFetch |
| MCP | 🏗️ Planned | Design tools via MCP (< 500ms startup) |
| UI | 🏗️ Planned | Ink TUI showing SDK messages |
| LangChain | ❌ Not in plan | Pure SDK-first |

### Gap Summary
| Capability | V1 (Current) | V2 (Vision) |
|------------|--------------|-------------|
| File read/write | Custom execution tools | SDK built-in (Read, Write, Edit) |
| Bash execution | Custom run_command | SDK built-in (Bash) |
| Codebase search | ❌ | SDK built-in (Glob, Grep) |
| Web search | Tavily (LangChain) | SDK WebSearch |
| MCP integration | Partial (mcp-loader) | Native SDK MCP |
| Sessions | ❌ | SDK sessions with resume |
| Hooks | ❌ | SDK PreToolUse, PostToolUse, etc. |
| Subagents | ❌ | SDK Task tool |
| Multi-phase planning | ✅ Custom | ❌ (SDK is single-loop) |

---

## 3. Claude Code SDK Capabilities (Reference)

From [Claude API Docs](https://platform.claude.com/docs/en/agent-sdk/overview):

| Category | Capability | SDK Support |
|----------|------------|-------------|
| **Built-in tools** | Read, Write, Edit, Bash, Glob, Grep, WebSearch, WebFetch, AskUserQuestion | ✅ |
| **Hooks** | PreToolUse, PostToolUse, Stop, SessionStart, SessionEnd, UserPromptSubmit | ✅ |
| **Subagents** | Task tool, AgentDefinition | ✅ |
| **MCP** | Connect servers (stdio, HTTP) | ✅ |
| **Sessions** | resume, session_id, context across turns | ✅ |
| **Permissions** | acceptEdits, bypassPermissions, canUseTool | ✅ |
| **Claude Code files** | Skills, Slash commands, CLAUDE.md (via settingSources) | ✅ |

---

## 4. Proposed Architecture: SDK-First + LangChain Integration

### Principle
> **Claude Agent SDK as core** for Claude Code parity. **LangChain as integration layer** for design tools, research, and non-SDK workflows.

### Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    EAMES UNIFIED ARCHITECTURE                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              CLAUDE AGENT SDK (Primary)                   │   │
│  │  • query() — agent loop                                   │   │
│  │  • Read, Write, Edit, Bash, Glob, Grep, WebSearch        │   │
│  │  • Sessions, Hooks, Permissions, Subagents                │   │
│  └────────────────────────┬─────────────────────────────────┘   │
│                            │                                     │
│                            ▼                                     │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              EAMES MCP SERVER (Design Tools)             │   │
│  │  • search_competitors, search_ux_patterns                 │   │
│  │  • search_design_trends, search_accessibility             │   │
│  │  • Tavily search (optional)                               │   │
│  │  • scaffold_project, write_file (or use SDK Write/Edit)   │   │
│  └────────────────────────┬─────────────────────────────────┘   │
│                            │                                     │
│  ┌────────────────────────┴─────────────────────────────────┐   │
│  │              LANGCHAIN (Integration Layer)               │   │
│  │  • Phases: Understand, Plan (optional Eames Brain)        │   │
│  │  • Multi-LLM: OpenAI fallback, model routing             │   │
│  │  • Tools: When SDK MCP not used, LangChain tool adapter   │   │
│  └─────────────────────────────────────────────────────────┘   │
│                            │                                     │
│                            ▼                                     │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              INK TUI (Unified)                            │   │
│  │  • SDK message → UI adapter (existing components)        │   │
│  │  • Phase display, tool progress, answer streaming         │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Modes
| Mode | When | Orchestrator | Tools |
|------|------|--------------|-------|
| **SDK** (default) | Claude Agent SDK available, user wants Claude Code parity | SDK `query()` | SDK built-in + Eames MCP |
| **LangChain** | User prefers 5-phase planning, or SDK unavailable | Custom Agent | LangChain TOOLS |

---

## 5. Implementation Phases

### Phase 0: OpenAI Fallback (This Week)
- [ ] Add `EAMES_USE_OPENAI` env support
- [ ] Default to openai + gpt-4o when set
- [ ] Add `gpt-` prefix to MODEL_PROVIDERS in llm.ts
- [ ] Document in env.example and CLAUDE.md

**Estimate:** 2–4 hours

### Phase 1: Restore SDK Agent (Weeks 1–2)
- [ ] Recreate `src/agent/sdk-agent.ts` (SDK wrapper)
- [ ] Implement `useNativeAgentExecution` or equivalent
- [ ] Map SDK messages → existing UI callbacks
- [ ] Add `/sdk` toggle to CLI (or make SDK default)
- [ ] Fix Message type import (use correct SDK export)

**Estimate:** 1–2 days

### Phase 2: Eames MCP Server (Weeks 2–3)
- [ ] Create `createSdkMcpServer` with design tools
- [ ] Migrate search_competitors, search_ux_patterns, etc. to MCP
- [ ] Keep scaffold_project, run_command as MCP tools (or rely on SDK Bash)
- [ ] Target: < 500ms MCP startup

**Estimate:** 2–3 days

### Phase 3: Mode Toggle + UX (Week 4)
- [ ] `/mode sdk` and `/mode langchain` (or config)
- [ ] Persist mode in settings
- [ ] Ensure both modes use same Ink UI components

**Estimate:** 1 day

### Phase 4: Eames Brain in SDK (Optional)
- [ ] Inject Eames Brain prompts via SDK system prompt
- [ ] Or use LangChain Understand phase before SDK query (hybrid)

**Estimate:** 2–3 days

---

## 6. V2 Repo: Merge or Reference?

### Option A: Merge V2 into eames-design-agent
- Single repo, SDK-first default
- LangChain as fallback/integration
- **Pro:** One codebase, less duplication  
- **Con:** Larger migration

### Option B: Keep V2 Separate, Port Learnings
- V2 remains planning/reference
- eames-design-agent adopts SDK-first incrementally
- **Pro:** Incremental, lower risk  
- **Con:** Two repos to maintain

### Recommendation
**Option B** for now. Use Eames-Design-Agent-V2 as architectural reference. Implement SDK-first in eames-design-agent via phases above. Revisit merge when SDK mode is stable.

---

## 7. Agreement Checklist

Before implementation, confirm:

- [ ] OpenAI fallback: Use `EAMES_USE_OPENAI` env (or alternate?)
- [ ] SDK-first: Agree SDK as primary when available
- [ ] LangChain: Keep as integration/fallback, not remove
- [ ] V2 repo: Use as reference, don’t merge yet
- [ ] Phase order: 0 → 1 → 2 → 3 (4 optional)
- [ ] Missing SDK files: Recreate sdk-agent, fix Message import, add enhanced-sdk-processor stub if needed

---

## 8. Next Steps

1. **You agree** on this plan (with edits if needed).
2. **Implement Phase 0** — OpenAI fallback (this week).
3. **Start Phase 1** — Restore SDK agent and wiring.
4. Update CLAUDE.md and AGENTS.md with this plan once agreed.

---

**Document Version:** 1.0  
**Last Updated:** 2026-02-16
