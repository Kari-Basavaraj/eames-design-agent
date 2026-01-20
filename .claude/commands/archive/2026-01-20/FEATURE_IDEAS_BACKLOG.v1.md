# Updated: 2026-01-20 13:15:00
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

| ID | Source | Status | Priority | Effort | Patterns | Last Reviewed | Project Tags |
|----|--------|--------|----------|--------|----------|---------------|--------------|
| FI-001 | get-shit-done | ✅ Analyzed | High | M | PAT-001, PAT-002 | 2026-01-20 | eames |
| FI-002 | claude-build-workflow | ✅ Analyzed | High | M | PAT-001 | 2026-01-19 | eames |

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
| **Linear Issue** | Pending |

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
- **Linear Issue:** Pending
- **Status:** Analyzed, ready for planning

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
| **Linear Issue** | Pending |

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

## 📋 Entry Template

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

| Metric | Count |
|--------|-------|
| **Total Ideas** | 2 |
| **✅ Analyzed** | 2 |
| **📋 Triaged** | 0 |
| **📅 Planned** | 0 |
| **🚧 In Progress** | 0 |
| **✔️ Implemented** | 0 |
| **❌ Rejected** | 0 |
| **Promoted to Linear** | 0 |

| Pattern | Occurrences | Priority |
|---------|-------------|----------|
| PAT-001 (User Interviewing) | 2 | 🔴 Critical |
| PAT-002 (Approval Gates) | 1 | 🔴 Critical |

---

## 📦 Archived Entries

*Move entries here after implemented or explicitly rejected*

(none yet)

---

*Last Updated: 2026-01-20 13:15:00*
