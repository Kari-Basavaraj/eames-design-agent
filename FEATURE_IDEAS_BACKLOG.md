# Updated: 2026-01-20 16:37:05
# FEATURE IDEAS BACKLOG

> **Purpose:** Complete lifecycle management of ideas from discovery to implementation. Every idea is tracked, analyzed, decided upon, and either implemented or explicitly rejected with reasoning.

---

## 🎯 EAMES VISION (Reference for All Entries)

```
End-to-end Autonomous Product Design Agent: Discovery → Delivery

• INPUT:  "Build me a landing page for my SaaS"
• OUTPUT: Live deployed app + GitHub repo + shareable link

Key Metrics:
• <$1 per app (with prompt caching)
• <15 minutes end-to-end
• Zero human intervention after approval gates
```

**Vision Pillars (Score each entry against these):**
| Pillar | Description |
|--------|-------------|
| **Autonomous** | Runs without constant human input |
| **End-to-End** | Discovery through Delivery, not just code |
| **Production-Ready** | Deployed, tested, shareable output |
| **Designer-Like** | Follows real design practice patterns |
| **Cost-Efficient** | <$1 per app target |

**⚠️ NEVER adopt features that pull us away from this vision!**

---

## 📖 Reference: Agent-Native Principles

> Source: Dan Shipper's "Agent-Native Apps" (Every.to)

| Principle | Definition | How to Evaluate |
|-----------|------------|-----------------|
| **Parity** | Agent can do anything a user can do | Can an agent trigger this feature programmatically? |
| **Granularity** | Atomic primitives, not monolithic actions | Is it a small, focused action or a complex workflow? |
| **Composability** | Tools combine for new capabilities | Can this combine with other tools in unexpected ways? |
| **Emergent Capability** | Enables unexpected combinations | Does it unlock workflows we didn't explicitly design? |
| **Improvement Over Time** | Context accumulates, agent gets better | Does it leverage or contribute to persistent memory? |

**Scoring:** Count how many principles the idea supports (0-5)

---

## 📊 Quick Reference Dashboard

|| ID | Source | Status | Priority | Effort | Patterns | Last Reviewed | Project Tags |
||----|--------|--------|----------|--------|----------|---------------|--------------|
|| FI-001 | get-shit-done | ✅ Analyzed | High | M | PAT-001, PAT-002 | 2026-01-20 | eames |
|| FI-002 | claude-build-workflow | ✅ Analyzed | High | M | PAT-001 | 2026-01-19 | eames |
|| FI-003 | ollama-anthropic-api | ✅ Analyzed | High | S | PAT-006 | 2026-01-20 | eames |

### Status Legend
| Status | Meaning |
|--------|---------|
| 📥 Inbox | Captured, not yet analyzed |
| 🔍 Analyzing | Currently being evaluated |
| ✅ Analyzed | Full analysis complete |
| 📋 Triaged | Prioritized, waiting for planning |
| 📅 Planned | Assigned to milestone/phase |
| 🚧 In Progress | Implementation started |
| ✔️ Implemented | Code complete |
| ✅ Validated | Tested and verified |
| 📦 Archived | Done, kept for reference |
| ❌ Rejected | Explicitly decided not to do |
| ⏸️ Deferred | Good idea, not now |
| 🚫 Blocked | Waiting on dependency |

### Effort Legend
| Size | Meaning |
|------|---------|
| XS | < 2 hours |
| S | 2-8 hours (1 day) |
| M | 1-3 days |
| L | 1-2 weeks |
| XL | > 2 weeks |

---

## 🔗 Related Files

| File | Purpose |
|------|---------|
| `IDEA_INBOX.md` | Quick capture, GitHub stars, unprocessed ideas |
| `IDEA_PATTERNS.md` | Cross-cutting themes across multiple ideas |
| `IDEA_DECISIONS.md` | Audit trail of all decisions with reasoning |
| `Linear` | Promoted ideas tracked as issues |

---

## 📋 Backlog Entries

---

## FI-001: Get Shit Done (GSD) by TÂCHES

### Metadata
| Field | Value |
|-------|-------|
| **Status** | ✅ Analyzed |
| **Priority** | High |
| **Effort** | M (1-3 days to adopt core patterns) |
| **Confidence** | High |
| **Last Reviewed** | 2026-01-20 |
| **Stale After** | 2026-04-20 (90 days) |
| **Project Tags** | eames, general-ai |
| **Related Patterns** | PAT-001 (User Interviewing), PAT-002 (Approval Gates) |
|| **Linear Issue** | BAS-56 |

### Source
- **Repository:** https://github.com/glittercowboy/get-shit-done
- **Stars:** 4,900+ (rapidly growing)
- **Last Commit:** Active (2026-01)
- **Contributors:** 5+
- **License:** MIT ✅
- **Issues Open:** ~20
- **Description:** Meta-prompting, context engineering, and spec-driven development system for Claude Code

### Source Health Assessment
| Metric | Status | Notes |
|--------|--------|-------|
| Active Development | ✅ Good | Commits within last week |
| Community | ✅ Good | Growing stars, active issues |
| Documentation | ✅ Good | Comprehensive README |
| License | ✅ MIT | No restrictions |
| Breaking Change Risk | 🟡 Medium | Young project, patterns may evolve |

### 🎯 Vision Alignment
**Score:** 22/25 ✅ Strongly Aligned

| Pillar | Score | Evidence |
|--------|-------|----------|
| **Autonomous** | 4/5 | Enables autonomous execution AFTER proper setup; requires initial user interview |
| **End-to-End** | 5/5 | Questions → Research → Requirements → Roadmap → Build covers full lifecycle |
| **Production-Ready** | 4/5 | Atomic commits, verification built in; deployment not explicit |
| **Designer-Like** | 5/5 | ⭐ User interviewing, scope definition, UAT mirror real design practice |
| **Cost-Efficient** | 4/5 | Fresh context per task reduces token waste |

**Red Flags:** None detected
**Confidence in Score:** High (direct code review)

### Agent-Native Principles (/5)
| Principle | Aligned | Evidence |
|-----------|---------|----------|
| Parity | ✅ | Commands do what user would do manually |
| Granularity | ✅ | Atomic tasks, not monolithic |
| Composability | ✅ | Phases can combine differently |
| Emergent Capability | ✅ | Patterns enable unexpected workflows |
| Improvement Over Time | ✅ | Context accumulates across sessions |

**Score:** 5/5 ✅ Fully Agent-Native

### 🎯 JACKPOT INSIGHT: User Interviewing = Designer's Discovery

**GSD's "Questions" step mirrors what real designers do:**
> "Questions — Asks until it understands your idea completely (goals, constraints, tech preferences, edge cases)"

In real design practice:
- **User Research** - Interview stakeholders until you truly understand
- **Requirements Gathering** - Goals, constraints, edge cases, preferences
- **Scope Definition** - What's v1, v2, and explicitly out-of-scope
- **Approval Gate** - User approves roadmap BEFORE execution begins

**Why This Matters for Eames:**
- Without proper understanding, autonomous = expensive garbage
- **Upfront planning makes autonomous execution actually useful**
- User intent capture BEFORE autonomy = aligned output

### Feature Mapping: GSD → Eames

| GSD Step | What It Does | Eames Current | Eames Gap | Priority | Effort |
|----------|--------------|---------------|-----------|----------|--------|
| **Questions** | Asks until fully understood | ❌ Missing | Add "Intake" to Discovery | 🔴 Critical | S |
| **Research** | Parallel domain investigation | Discovery (basic) | Add parallel researchers | 🟡 High | M |
| **Requirements** | v1/v2/out-of-scope extraction | Define/PRD | Add explicit scope tiering | 🟡 High | S |
| **Roadmap** | Phases mapped to requirements | Implicit in Define | Generate explicit ROADMAP.md | 🟢 Medium | S |
| **Discuss Phase** | Capture preferences before each phase | ❌ Missing | Pre-phase intent capture | 🟡 High | S |
| **Plan Phase** | Research + atomic plans + verify | Scattered | Unified per-phase planning | 🟢 Medium | M |
| **Execute Phase** | Parallel fresh-context workers | Develop/Deliver | Add context isolation | 🟡 High | L |
| **Verify Work** | UAT with user | ❌ Missing | Add validation loop per phase | 🔴 Critical | M |

### Tech Stack Alignment
| Integration Point | Compatibility | Notes |
|-------------------|---------------|-------|
| LangGraph StateGraph | ✅ Native | Phase workflow maps directly |
| DeepAgents v0.3.2+ | ✅ Native | Subagent pattern matches |
| CompositeBackend | ✅ Native | Document storage aligns |
| Middleware Stack | ✅ Native | Follows similar pattern |
| Eames Brain 2.0 | ✅ Native | Prompts can incorporate |

**Tech Verdict:** ✅ Native fit - patterns, not code dependencies

### Risk Assessment
| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Scope creep (too many patterns) | Medium | Medium | Adopt incrementally, validate each |
| Over-engineering intake | Low | Medium | Start simple, iterate |
| User fatigue from questions | Medium | High | Make interview conversational, not interrogation |

**Reversibility:** ✅ Easy - patterns can be removed without breaking changes

### Alternatives Considered
| Alternative | Why Not Chosen |
|-------------|----------------|
| No interview (just build) | Current state - leads to misaligned output |
| Static questionnaire | Less effective than adaptive conversation |
| AI-only requirements | Misses user's implicit knowledge |

### What to Adopt (Prioritized)

#### 🔴 Critical (V1.1.0 Phase 0-1)
1. **User Interview/Intake System** - Add INTAKE step at start of Discovery
2. **User Approval Gates** - Approval before research, design, deployment
3. **User Acceptance Testing (UAT)** - Verification step in Deliver

#### 🟡 High (V1.1.0 Phase 2-4)
4. **Parallel Researcher Pattern** - 4 specialized Discovery researchers
5. **Document-Based Context Management** - PROJECT.md, STATE.md, etc.
6. **Context Isolation** - Fresh context per phase execution

#### 🟢 Medium (V1.1.0 Phase 5+)
7. **Orchestrator Separation** - Keep LangGraph thin
8. **Pre-Phase Discussion** - Capture preferences before each phase

### What NOT to Adopt
| Feature | Reason | Pillar Violated |
|---------|--------|-----------------|
| XML Task Format | Eames uses natural language via Eames Brain | None (style choice) |
| CLI Slash Commands | Eames is standalone, not Claude Code extension | None (architecture) |
| Single-Project Focus | Eames handles multi-project | End-to-End |
| Manual Phase Progression | Eames aims for autonomous full-cycle | Autonomous |

### Implementation Scope
| Area | Changes |
|------|---------|
| **Files Modified** | `src/agent/discovery-agent.ts`, `src/agent/deliver-agent.ts`, orchestrator |
| **New Modules** | `src/agent/intake-agent.ts`, `src/utils/approval-gate.ts` |
| **API Changes** | Additive (new phase substeps) |
| **Tests Required** | Unit (intake logic), Integration (approval flow), E2E (full workflow) |
| **Rollout Strategy** | Feature flag for intake, gradual enable |

### Success Metrics
| Metric | Target | How to Measure |
|--------|--------|----------------|
| Requirement capture rate | 90%+ | User confirms understanding |
| Rework reduction | 50%+ | Fewer iterations after approval |
| User satisfaction | 4/5+ | Post-session survey |

### Decision Log
| Date | Decision | Reason | By |
|------|----------|--------|-----|
| 2026-01-19 | ✅ Adopt core patterns | Strongly aligned (22/25), validates Clarification Loop direction | User + Claude |
| 2026-01-20 | Prioritize INTAKE + UAT | These mirror real design practice (THE MOAT) | User + Claude |

### Linear Tracking
- **Linear Issue:** BAS-56
- **Status:** Analyzed, tracked in Linear

---

## FI-002: Claude Build Workflow (rohunj)

### Metadata
| Field | Value |
|-------|-------|
| **Status** | ✅ Analyzed |
| **Priority** | High |
| **Effort** | M (1-3 days) |
| **Confidence** | High |
| **Last Reviewed** | 2026-01-19 |
| **Stale After** | 2026-04-19 (90 days) |
| **Project Tags** | eames |
| **Related Patterns** | PAT-001 (User Interviewing) |
|| **Linear Issue** | BAS-57 |

### Source
- **Repository:** https://github.com/rohunj/claude-build-workflow
- **Stars:** 169 (1 day old, fast growth)
- **Last Commit:** Active (2026-01)
- **License:** MIT ✅
- **Description:** Automated workflow for building apps with Claude Code - interview, PRD, build autonomously

### Source Health Assessment
| Metric | Status | Notes |
|--------|--------|-------|
| Active Development | ✅ Good | Very new, actively developed |
| Community | 🟡 Early | Fast growth, limited track record |
| Documentation | ✅ Good | Clear README |
| License | ✅ MIT | No restrictions |
| Breaking Change Risk | 🟡 Medium | New project, likely to evolve |

### 🎯 Vision Alignment
**Score:** 20/25 ✅ Strongly Aligned

| Pillar | Score | Evidence |
|--------|-------|----------|
| **Autonomous** | 5/5 | ⭐ Runs 100 iterations without intervention |
| **End-to-End** | 4/5 | Interview → PRD → Architecture → Build (no deploy step) |
| **Production-Ready** | 3/5 | Builds app but deployment not included |
| **Designer-Like** | 5/5 | ⭐ BMAD interview = real discovery process |
| **Cost-Efficient** | 3/5 | Not explicitly addressed |

**Red Flags:** None (missing deploy is minor)
**Confidence in Score:** High

### Agent-Native Principles (/5)
**Score:** 4/5 (missing explicit improvement over time)

### 🎯 JACKPOT INSIGHTS

> **1. BMAD Interview Method = Designer's Discovery**
> Interview user until fully understood BEFORE any autonomous execution.
> **VALIDATES FI-001 insight** - this is a PATTERN (PAT-001)

> **2. Story Validation Before Building**
> Validate stories have enough context for autonomous success BEFORE starting.

> **3. "Close Laptop and Walk Away"**
> True autonomous execution with notifications when done.

### Feature Mapping: claude-build-workflow → Eames
| Source Feature | Eames Current | V1.1.0 Plan | Gap? | Priority | Effort |
|----------------|---------------|-------------|------|----------|--------|
| BMAD Interview | ❌ Missing | Partial | Yes | 🔴 Critical | S |
| PRD Generation | ✅ Define | Planned | No | - | - |
| Architecture Design | ⚠️ Partial | Not explicit | Yes | 🟡 High | M |
| Edge Case Analysis | ❌ Missing | Not planned | Yes | 🟡 High | S |
| Story Validation | ❌ Missing | Not planned | Yes | 🔴 Critical | S |
| Ralph Loop (100 iter) | ⚠️ Partial | LangGraph | Partial | 🟡 High | M |
| Phone Notifications | ❌ Missing | Not planned | Yes | 🟢 Medium | S |

### Tech Stack Alignment
**Tech Verdict:** ✅ Native fit - patterns portable to our stack

### Risk Assessment
| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Prompt patterns may not transfer | Low | Medium | Test with Eames Brain |
| Over-automation before validation | Medium | High | Keep approval gates |

**Reversibility:** ✅ Easy

### Alternatives Considered
| Alternative | Why Not Chosen |
|-------------|----------------|
| Build without interview | Leads to misalignment |
| Manual architecture step | Slower, Eames should automate |

### What to Adopt (Prioritized)
#### 🔴 Critical
1. **BMAD Interview Pattern** - Reinforces PAT-001
2. **Story Validation Step** - Gate before Design

#### 🟡 High
3. **Edge Case Analysis** - New step in Define
4. **Architecture Design Step** - Explicit in Design
5. **Ralph Loop Study** - Inform LangGraph iteration logic

#### 🟢 Medium
6. **Phone Notifications (ntfy)** - Async UX improvement

### What NOT to Adopt
| Feature | Reason | Pillar Violated |
|---------|--------|-----------------|
| Shell implementation | Eames uses TypeScript/LangGraph | None (tech choice) |
| GitHub Codespaces flow | Different deployment model | None (architecture) |

### Implementation Scope
| Area | Changes |
|------|---------|
| **Files Modified** | `src/agent/define-agent.ts`, `src/agent/design-agent.ts` |
| **New Modules** | `src/utils/story-validator.ts` |
| **Tests Required** | Unit, Integration |

### Success Metrics
| Metric | Target | How to Measure |
|--------|--------|----------------|
| Story validation catch rate | 80%+ | Issues caught before build |
| Build success rate | 90%+ | First-time success after validation |

### Decision Log
| Date | Decision | Reason | By |
|------|----------|--------|-----|
| 2026-01-19 | ✅ Adopt interview + validation patterns | Validates FI-001 direction, adds story validation | User + Claude |

### Related Entries
- **FI-001 (GSD):** Both emphasize user interviewing → PAT-001

---

## FI-003: Ollama v0.14.0 Anthropic Messages API Support

### Metadata
| Field | Value |
|-------|-------|
| **Status** | ✅ Analyzed |
| **Priority** | High |
| **Effort** | S (2-8 hours) |
| **Confidence** | High |
| **Last Reviewed** | 2026-01-20 |
| **Stale After** | 2026-04-20 (90 days) |
| **Project Tags** | eames |
| **Related Patterns** | PAT-006 (Local Model Fallback - validated) |
| **Linear Issue** | Pending |

### Source
- **URL:** https://ollama.com/blog/claude
- **Type:** Official Blog Post
- **Published:** 2026-01 (recent)
- **License:** MIT (Ollama)
- **Description:** Ollama v0.14.0 adds Anthropic Messages API support, enabling local models as Claude drop-in replacements

### Source Health Assessment
| Metric | Status | Notes |
|--------|--------|-------|
| Source Authority | ✅ Good | Official Ollama blog |
| Recency | ✅ Good | v0.14.0 release (2026-01) |
| Documentation Quality | ✅ Good | Code examples, clear API docs |
| Trustworthiness | ✅ Good | First-party announcement |

### 🎯 Vision Alignment
**Score:** 19/25 (Partially Aligned)
**Confidence:** High (direct feature documentation)

| Pillar | Score | Evidence |
|--------|-------|----------|
| **Autonomous** | 4/5 | Local models run without API rate limits or network dependency; 24/7 operation |
| **End-to-End** | 3/5 | Supports all phases via tool calling, streaming, vision - quality varies by model |
| **Production-Ready** | 4/5 | Tool calling, streaming, vision all supported; production viable |
| **Designer-Like** | 3/5 | Quality depends on local model; may not match Claude's design reasoning |
| **Cost-Efficient** | 5/5 | ⭐ ZERO API cost after hardware - directly enables <$1 target |

**Red Flags:** None
**Key Strength:** Directly supports Cost-Efficient pillar - <$1 per app becomes trivially achievable

### Agent-Native Principles (/5)
| Principle | Aligned | Evidence |
|-----------|---------|----------|
| **Parity** | ✅ | Anthropic Messages API = same interface; `ANTHROPIC_BASE_URL` swap |
| **Granularity** | ✅ | Tool calling with defined schemas; atomic operations |
| **Composability** | ✅ | Mix local/cloud via base URL; per-phase routing possible |
| **Emergent Capability** | ✅ | Enables offline workflows, privacy-sensitive use cases |
| **Improvement Over Time** | ✅ | Local context stays on machine; no external API logging |

**Score:** 5/5 ✅ Fully Agent-Native

### 🎯 JACKPOT INSIGHT: Hybrid Cloud/Local Model Strategy

> **The insight:** Use Claude (cloud) for high-stakes phases where reasoning quality matters (Discovery, Define), use local models (Ollama) for high-volume phases where cost dominates (Develop, Deliver).

**Hybrid Strategy:**
| Phase | Model Strategy | Rationale |
|-------|----------------|-----------|
| Discovery | Claude (cloud) | Best reasoning for user understanding |
| Define | Claude (cloud) | PRD quality is critical |
| Design | Hybrid | Claude for decisions, local for iterations |
| Develop | Local (Ollama) | High token volume, lower reasoning bar |
| Deliver | Local (Ollama) | Deployment scripts are formulaic |

**Cost Impact:**
- Current: ~$0.50-$2 per app (all Claude)
- With hybrid: ~$0.10-$0.30 per app (70%+ reduction)
- With full local: $0 API cost (hardware only)

### Feature Mapping: Ollama v0.14.0 → Eames

| Source Feature | Eames Current | V1.1.0 Plan | Gap? | Phase | Subagent Fit | Priority | Effort |
|----------------|---------------|-------------|------|-------|--------------|----------|--------|
| Anthropic Messages API | Native Ollama API | Not planned | Yes | All | All subagents | 🔴 Critical | S |
| Tool Calling | ❌ Not via Ollama | Not planned | Yes | Develop | Code/Test agents | 🔴 Critical | S |
| Streaming | ⚠️ Partial | Planned | Partial | All | All subagents | 🟡 High | XS |
| Extended Thinking | ❌ Not supported | Not planned | Yes | Define/Design | Strategy agents | 🟢 Medium | S |
| Vision Support | ❌ Not via Ollama | Not planned | Yes | Design | Component agents | 🟢 Medium | S |
| 64k+ Context Models | ✅ Supported | N/A | No | All | All | - | - |

### Tech Stack Alignment
| Integration Point | Compatibility | Notes |
|-------------------|---------------|-------|
| LangGraph StateGraph | ✅ Native | LangChain supports Ollama via ChatOllama |
| DeepAgents v0.3.2+ | ✅ Native | Can configure base_url for Anthropic SDK |
| CompositeBackend | ✅ Native | No changes needed - storage agnostic |
| PostgreSQL checkpointing | ✅ Native | Unaffected by LLM provider |
| Middleware stack | ⚠️ Minor | Need model router for phase-based selection |
| Eames Brain 2.0 prompts | ✅ Native | Prompts work with any Claude-compatible API |
| MCP tools | ✅ Native | Tool calling supported via Messages API |

**Tech Verdict:** ✅ Native fit - Ollama v0.14.0 designed as drop-in replacement

### Risk Assessment
| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Local model quality < Claude | High | Medium | Hybrid strategy: Claude for critical phases |
| Tool calling reliability varies | Medium | High | Test matrix per model, graceful fallback |
| Extended thinking not universal | Medium | Low | Feature flag, graceful degradation |
| Hardware requirements | Medium | Medium | Document min specs, cloud fallback |

**Reversibility:** ✅ Easy - Feature flag, always fall back to cloud
**Cost/Benefit Verdict:** ✅ Worth it - High ROI for cost reduction

### Alternatives Considered
| Alternative | Why Not Chosen |
|-------------|----------------|
| Continue cloud-only | Doesn't achieve <$1 target reliably |
| OpenAI local | OpenAI doesn't offer local execution |
| Wait for Claude local | Anthropic has no announced local offering |
| LM Studio | Less mature API, smaller community |
| vLLM | More complex setup, less Claude-compatible |

### What to Adopt (Prioritized)

#### 🔴 Critical (V1.1.0 Scope)
1. **Upgrade Ollama integration to Messages API** - Replace `/api/chat` with Anthropic-compatible endpoint
2. **Enable tool calling via local models** - Critical for Develop phase local execution
3. **Hybrid model router** - Route phases to cloud/local based on config

#### 🟡 High (V1.2.0 Scope)
4. **Streaming support for local models** - Improve UX during local execution
5. **Model quality benchmarking** - Test local models against Claude for each phase

#### 🟢 Medium (Future)
6. **Extended thinking for local models** - When model support matures
7. **Vision support for Design phase** - Screenshot analysis locally

### What NOT to Adopt
| Feature | Reason | Pillar Violated |
|---------|--------|-----------------|
| Full local-only mode | Quality tradeoff too high for Discovery/Define | Designer-Like |
| Auto model selection | User should control cost/quality tradeoff | Autonomous (user agency) |

### Implementation Scope
| Area | Changes |
|------|---------|
| **Files Modified** | `src/utils/ollama.ts`, `src/model/llm.ts`, `src/components/ModelSelector.tsx` |
| **New Modules** | `src/utils/model-router.ts` (hybrid routing logic) |
| **API Changes** | Additive (new provider config options) |
| **Tests Required** | Unit (API compatibility), Integration (tool calling), E2E (full workflow) |
| **Rollout Strategy** | Feature flag `useLocalModels`, gradual enable per phase |

### Success Metrics
| Metric | Target | How to Measure |
|--------|--------|----------------|
| Cost per app (hybrid) | <$0.30 | Track API spend per session |
| Local tool call success | >90% | Test suite pass rate |
| Latency increase | <2x | Benchmark Develop phase |
| User adoption | >30% | Feature flag analytics |

### Decision Log
| Date | Decision | Reason | By |
|------|----------|--------|-----|
| 2026-01-20 | ✅ Adopt hybrid cloud/local strategy | Directly enables <$1 target, low risk | User + Claude |

### Linear Tracking
- **Linear Issue:** BAS-59
- **Status:** Analyzed, tracked in Linear

### Related Entries
- **Existing Ollama code:** `src/utils/ollama.ts`, `src/components/ModelSelector.tsx`
- **Pattern validated:** PAT-006 (Local Model Fallback) - now 2 sources

---

<!--
## [BACKUP - Warp Analysis 2026-01-20] FI-003: Ollama v0.14.0 Anthropic Messages API Support

### Metadata
|| Field | Value |
||-------|-------|
|| **Status** | ✅ Analyzed |
|| **Priority** | High |
|| **Effort** | S (2-8 hours) |
|| **Confidence** | High |
|| **Last Reviewed** | 2026-01-20 |
|| **Stale After** | 2026-04-20 (90 days) |
|| **Project Tags** | eames |
|| **Related Patterns** | PAT-006 (Local Model Fallback - validated) |
|| **Linear Issue** | BAS-59 |

### Source
- **URL:** https://ollama.com/blog/claude
- **Type:** Official Blog Post
- **Published:** 2026-01 (recent)
- **License:** N/A (feature announcement)
- **Description:** Ollama v0.14.0 adds Anthropic Messages API support, enabling local models to serve as Claude drop-in replacements

### Source Health Assessment
|| Metric | Status | Notes |
||--------|--------|-------|
|| Active Development | ✅ Good | Ollama is actively maintained, major release |
|| Community | ✅ Good | Ollama has strong community, wide adoption |
|| Documentation | ✅ Good | Clear API docs, usage examples |
|| License | ✅ MIT | Ollama is MIT licensed |
|| Breaking Change Risk | 🟡 Medium | API additions are stable, but young feature |

### 🎯 Vision Alignment
**Score:** 19/25 ✅ Strongly Aligned
**Confidence:** High (direct feature analysis)

|| Pillar | Score | Evidence |
||--------|-------|----------|
|| **Autonomous** | 4/5 | Local models can run 24/7 without API limits or rate limiting |
|| **End-to-End** | 3/5 | Supports all phases but may have quality tradeoffs vs Claude |
|| **Production-Ready** | 4/5 | Tool calling, streaming, vision all supported; production viable for cost-sensitive deploys |
|| **Designer-Like** | 3/5 | Quality depends on local model; may not match Claude's design reasoning |
|| **Cost-Efficient** | 5/5 | ⭐ ZERO API cost after hardware - directly enables <$1 target |

**Red Flags:** None
**Key Strength:** Directly supports Cost-Efficient pillar - the <$1 per app target becomes trivially achievable with local execution.

### Agent-Native Principles (/5)
|| Principle | Aligned | Evidence |
||-----------|---------|----------|
|| Parity | ✅ | Anthropic Messages API = same interface as Claude |
|| Granularity | ✅ | Works with existing tool calling primitives |
|| Composability | ✅ | Can mix local/cloud models per phase |
|| Emergent Capability | ✅ | Enables offline workflows, privacy-sensitive use cases |
|| Improvement Over Time | ✅ | Local context stays on machine, no API logging |

**Score:** 5/5 ✅ Fully Agent-Native

### 🎯 JACKPOT INSIGHT: Hybrid Cloud/Local Model Strategy

> **The insight:** Use Claude for high-stakes phases (Discovery, Define) where reasoning quality matters most, but use local models for high-volume phases (Develop, iterations) where cost dominates.

**Hybrid Strategy:**
|| Phase | Model Strategy | Rationale |
||-------|----------------|----------|
|| Discovery | Claude (cloud) | Needs best reasoning for user understanding |
|| Define | Claude (cloud) | PRD quality is critical |
|| Design | Hybrid | Claude for decisions, local for iterations |
|| Develop | Local (Ollama) | High token volume, lower reasoning bar |
|| Deliver | Local (Ollama) | Deployment scripts are formulaic |

**Cost Impact:**
- Current: ~$0.50-$2 per app (all Claude)
- With hybrid: ~$0.10-$0.30 per app (70%+ reduction)
- With full local: $0 API cost (hardware only)

### Feature Mapping: Ollama v0.14.0 → Eames

|| Source Feature | Eames Current | V1.1.0 Plan | Gap? | Phase | Subagent Fit | Priority | Effort |
||----------------|---------------|-------------|------|-------|--------------|----------|--------|
|| Anthropic Messages API | Uses native Ollama API | Not planned | Yes | All | All subagents | 🔴 Critical | S |
|| Tool Calling | ❌ Not via Ollama | Not planned | Yes | Develop | Code/Test agents | 🔴 Critical | S |
|| Streaming | ⚠️ Partial | Planned | Partial | All | All subagents | 🟡 High | XS |
|| Extended Thinking | ❌ Not supported | Not planned | Yes | Define/Design | Strategy agents | 🟢 Medium | S |
|| Vision Support | ❌ Not via Ollama | Not planned | Yes | Design | Component agents | 🟢 Medium | S |
|| Model Switching | ✅ UI exists | N/A | No | - | - | - | - |

### Tech Stack Alignment
|| Integration Point | Compatibility | Notes |
||-------------------|---------------|-------|
|| LangGraph StateGraph | ✅ Native | LangChain supports Ollama via ChatOllama |
|| DeepAgents v0.3.2+ | ✅ Native | Can configure base_url for Anthropic SDK |
|| CompositeBackend | ✅ Native | No changes needed |
|| Middleware Stack | ⚠️ Minor change | Need to route model selection |
|| Eames Brain 2.0 | ✅ Native | Prompts work with any Claude-compatible model |
|| MCP tools | ✅ Native | Tool calling now supported via Messages API |

**Tech Verdict:** ✅ Native fit - Ollama v0.14.0 is designed as drop-in replacement

### Risk Assessment
|| Risk | Likelihood | Impact | Mitigation |
||------|------------|--------|------------|
|| Local model quality lower than Claude | High | Medium | Use hybrid strategy, Claude for critical phases |
|| Tool calling reliability varies by model | Medium | High | Test each model, maintain compatibility matrix |
|| Extended thinking not all models support | Medium | Low | Feature flag, graceful degradation |
|| Hardware requirements for local models | Medium | Medium | Document minimum specs, offer cloud fallback |

**Reversibility:** ✅ Easy - Feature flag, can always fall back to cloud
**Cost/Benefit Verdict:** ✅ Worth it - High ROI for cost reduction

### Alternatives Considered
|| Alternative | Why Not Chosen |
||-------------|----------------|
|| Continue cloud-only | Doesn't achieve <$1 target reliably |
|| Use OpenAI local (no such thing) | OpenAI doesn't offer local execution |
|| Wait for Claude local | Anthropic has no announced local offering |
|| Use LM Studio | Less mature API, smaller community |

### What to Adopt (Prioritized)

#### 🔴 Critical (V1.1.0 Scope)
1. **Upgrade Ollama integration to Messages API** - Replace `/api/chat` with Anthropic-compatible endpoint
2. **Enable tool calling via local models** - Critical for Develop phase local execution
3. **Hybrid model router** - Route phases to cloud/local based on config

#### 🟡 High (V1.2.0 Scope)
4. **Streaming support for local models** - Improve UX during local execution
5. **Model quality benchmarking** - Test local models against Claude for each phase

#### 🟢 Medium (Future)
6. **Extended thinking for local models** - When model support matures
7. **Vision support for Design phase** - Screenshot analysis locally

### What NOT to Adopt
|| Feature | Reason | Pillar Violated |
||---------|--------|-----------------|
|| Full local-only mode | Quality tradeoff too high for Discovery/Define | Designer-Like |
|| Auto model selection | User should control cost/quality tradeoff | Autonomous (user agency) |

### Implementation Scope
|| Area | Changes |
||------|---------|
|| **Files Modified** | `src/utils/ollama.ts`, `src/model/llm.ts`, `src/components/ModelSelector.tsx` |
|| **New Modules** | `src/utils/model-router.ts` (hybrid routing logic) |
|| **API Changes** | Additive (new provider config options) |
|| **Tests Required** | Unit (API compatibility), Integration (tool calling), E2E (full workflow with local) |
|| **Rollout Strategy** | Feature flag `useLocalModels`, gradual enable per phase |

### Success Metrics
|| Metric | Target | How to Measure |
||--------|--------|----------------|
|| Cost per app (hybrid mode) | <$0.30 | Track API spend per session |
|| Local model tool call success rate | >90% | Test suite pass rate |
|| Latency increase (local vs cloud) | <2x | Benchmark Develop phase |
|| User adoption of local mode | >30% | Feature flag analytics |

### Decision Log
|| Date | Decision | Reason | By |
||------|----------|--------|-----|
|| 2026-01-20 | ✅ Adopt hybrid cloud/local strategy | Directly enables <$1 target, low risk | User + Warp |

### Linear Tracking
- **Linear Issue:** Pending (offer to create)
- **Status:** Analyzed, ready for planning

### Related Entries
- **Existing Ollama code:** `src/utils/ollama.ts`, `src/components/ModelSelector.tsx`
- **New pattern emerging:** PAT-006 (Local Model Fallback)
-->

---

## 📝 Entry Template

```markdown
## FI-XXX: [Name]

### Metadata
| Field | Value |
|-------|-------|
| **Status** | 📥 Inbox / 🔍 Analyzing / ✅ Analyzed / 📋 Triaged / 📅 Planned / 🚧 In Progress / ✔️ Implemented / ✅ Validated / 📦 Archived / ❌ Rejected / ⏸️ Deferred / 🚫 Blocked |
| **Priority** | Critical / High / Medium / Low |
| **Effort** | XS / S / M / L / XL |
| **Confidence** | High / Medium / Low |
| **Last Reviewed** | YYYY-MM-DD |
| **Stale After** | YYYY-MM-DD |
| **Project Tags** | eames, general-ai, [other] |
| **Related Patterns** | PAT-XXX |
| **Linear Issue** | BAS-XXX or Pending |

### Source
- **Repository/URL:** [url]
- **Stars:** [if applicable]
- **Last Commit:** [date or "Active"]
- **License:** [MIT/Apache/etc] ✅/⚠️/❌
- **Description:** [one line]

### Source Health Assessment
| Metric | Status | Notes |
|--------|--------|-------|
| Active Development | ✅/🟡/❌ | |
| Community | ✅/🟡/❌ | |
| Documentation | ✅/🟡/❌ | |
| License | ✅/🟡/❌ | |
| Breaking Change Risk | Low/Medium/High | |

### 🎯 Vision Alignment
**Score:** X/25
**Confidence:** High / Medium / Low

| Pillar | Score | Evidence |
|--------|-------|----------|
| Autonomous | /5 | |
| End-to-End | /5 | |
| Production-Ready | /5 | |
| Designer-Like | /5 | |
| Cost-Efficient | /5 | |

**Red Flags:** [None / List]

### Agent-Native Principles (/5)
| Principle | Aligned | Evidence |
|-----------|---------|----------|
| Parity | ✅/❌ | |
| Granularity | ✅/❌ | |
| Composability | ✅/❌ | |
| Emergent Capability | ✅/❌ | |
| Improvement Over Time | ✅/❌ | |

### 🎯 JACKPOT INSIGHT (if any)
> [Key insight that maps to real design practice]

### Feature Mapping: [Source] → Eames
| Source Feature | Eames Current | V1.1.0 Plan | Gap? | Priority | Effort |
|----------------|---------------|-------------|------|----------|--------|

### Tech Stack Alignment
| Integration Point | Compatibility | Notes |
|-------------------|---------------|-------|
| LangGraph StateGraph | ✅/⚠️/❌ | |
| DeepAgents v0.3.2+ | ✅/⚠️/❌ | |
| CompositeBackend | ✅/⚠️/❌ | |
| Middleware Stack | ✅/⚠️/❌ | |
| Eames Brain 2.0 | ✅/⚠️/❌ | |

**Tech Verdict:** Native fit / Requires wrapper / Architectural conflict

### Risk Assessment
| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|

**Reversibility:** Easy / Hard / Irreversible

### Alternatives Considered
| Alternative | Why Not Chosen |
|-------------|----------------|

### What to Adopt (Prioritized)
#### 🔴 Critical
#### 🟡 High
#### 🟢 Medium

### What NOT to Adopt
| Feature | Reason | Pillar Violated |
|---------|--------|-----------------|

### Implementation Scope
| Area | Changes |
|------|---------|
| **Files Modified** | |
| **New Modules** | |
| **API Changes** | Additive / Breaking / None |
| **Tests Required** | Unit / Integration / E2E |
| **Rollout Strategy** | Feature flag / Gradual / Big bang |

### Success Metrics
| Metric | Target | How to Measure |
|--------|--------|----------------|

### Decision Log
| Date | Decision | Reason | By |
|------|----------|--------|-----|

### Linear Tracking
- **Linear Issue:** [BAS-XXX or "Pending"]
- **Status:** [Ideation / Planned / In Progress / Done]

### Related Entries
- [Links to related FI-XXX entries]
```

---

## 📊 Backlog Summary

|| Metric | Count |
||--------|-------|
|| **Total Ideas** | 3 |
|| **✅ Analyzed** | 3 |
|| **📋 Triaged** | 0 |
|| **📅 Planned** | 0 |
|| **🚧 In Progress** | 0 |
|| **✔️ Implemented** | 0 |
|| **❌ Rejected** | 0 |
|| **Promoted to Linear** | 0 |

|| Pattern | Occurrences | Priority |
||---------|-------------|----------|
|| PAT-001 (User Interviewing) | 2 | 🔴 Critical |
|| PAT-002 (Approval Gates) | 1 | 🔴 Critical |
|| PAT-006 (Local Model Fallback) | 1 | 🟡 High (emerging) |

---

## 📦 Archived Entries

*Move entries here after implemented or explicitly rejected*

(none yet)

---

*Last Updated: 2026-01-20 13:15:00*
