# Eames Unified Plan — Dedicated Tracker

**Created:** 2026-02-16  
**Plan:** [EAMES_UNIFIED_PLAN_2026.md](docs/EAMES_UNIFIED_PLAN_2026.md)  
**Repo:** eames-design-agent (V1)

---

## Agreed Decisions

| Decision | Choice |
|----------|--------|
| **OpenAI fallback** | Auto-detect: if Anthropic fails (400/403) → retry with OpenAI |
| **SDK-first** | Yes — SDK primary when available, LangChain fallback |
| **V2 repo** | Keep separate; work on V1 only; V2 as reference |
| **Phase order** | 0 → 1 → 2 → 3 |
| **OpenAI API** | Required for fallback |

---

## Phase Status

### Phase 0: Auto-detect LLM Fallback
| Task | Status | Assignee | Notes |
|------|--------|----------|-------|
| Add `gpt-` prefix to MODEL_PROVIDERS in llm.ts | ✅ | | 2026-02-16 |
| Implement retry-with-OpenAI on Anthropic 400/403 | ✅ | | callLlm + callLlmStream |
| Provider/model resolution: prefer Anthropic, fallback OpenAI | ✅ | | isAnthropicUnavailableError + canFallbackToOpenAI |
| Document in env.example | ✅ | | | |

### Phase 1: Restore SDK Agent
| Task | Status | Assignee | Notes |
|------|--------|----------|-------|
| Recreate src/agent/sdk-agent.ts | ✅ | | 2026-02-16 |
| Fix Message type import | ✅ | | MessageParam in prompts/eames-brain |
| SDK message → UI callback mapping | ✅ | | onProgressMessage, onSdkMessage |
| useSdkAgentExecution hook | ✅ | | |
| /mode sdk | /mode langchain toggle | ✅ | | EAMES_USE_SDK=1 env |

### Phase 2: Eames MCP Server
| Task | Status | Assignee | Notes |
|------|--------|----------|-------|
| createSdkMcpServer with design tools | ⬜ | | |
| Migrate search_competitors, search_ux_patterns | ⬜ | | |
| Target < 500ms startup | ⬜ | | |

### Phase 3: Mode Toggle
| Task | Status | Assignee | Notes |
|------|--------|----------|-------|
| /mode sdk | /mode langchain | ✅ | | 2026-02-16 |
| Persist in settings | ✅ | | useSdkMode in .eames/settings.json |
| Unified Ink UI for both modes | ✅ | | Same AnswerBox, AgentProgressView |

---

## Progress Log

| Date | Phase | Update |
|------|-------|--------|
| 2026-02-16 | — | Tracker created, plan agreed |
| 2026-02-16 | 0 | Phase 0 complete: auto-detect fallback, gpt- prefix, env.example |
| 2026-02-16 | 1 | Phase 1 complete: sdk-agent.ts, useSdkAgentExecution, /mode toggle, MessageParam fix |

---

**Legend:** ⬜ Pending | 🔄 In Progress | ✅ Done | ⏸ Blocked
