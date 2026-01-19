# Updated: 2026-01-19 22:30:00
# FEATURE IDEAS BACKLOG

> **Purpose:** Curated collection of ideas, patterns, and innovations from external sources, analyzed for relevance to Eames Design Agent. Each entry includes actionable insights aligned with Eames' vision.

---

## Quick Reference

| ID | Source | Category | Priority | Status |
|----|--------|----------|----------|--------|
| FI-001 | get-shit-done | Context Engineering, Multi-Agent | High | New |

---

## FI-001: Get Shit Done (GSD) by TÂCHES

### Source
- **Repository:** https://github.com/glittercowboy/get-shit-done
- **Stars:** 4,900+ (rapidly growing)
- **Created:** 2025-12-14
- **Description:** Meta-prompting, context engineering, and spec-driven development system for Claude Code

### Core Concepts

#### 1. Context Engineering (Solving "Context Rot")
**What:** Document-based context management with size limits based on where LLM quality degrades.

**Key Files:**
- `PROJECT.md` - Project vision, always loaded
- `REQUIREMENTS.md` - Scoped v1/v2 requirements with phase traceability
- `ROADMAP.md` - Where you're going, what's done
- `STATE.md` - Decisions, blockers, position (memory across sessions)
- `PLAN.md` - Atomic task with XML structure, verification steps
- `SUMMARY.md` - What happened, what changed

**Eames Relevance:** ⭐⭐⭐⭐⭐
- Eames lacks explicit context management strategy
- Our 5-phase system could benefit from similar document structure
- STATE.md concept maps directly to our phase state management needs

#### 2. Multi-Agent Orchestration Pattern
**What:** Thin orchestrator spawns specialized agents, collects results, routes to next step.

| Stage | Orchestrator | Agents |
|-------|-------------|--------|
| Research | Coordinates, presents findings | 4 parallel researchers (stack, features, architecture, pitfalls) |
| Planning | Validates, manages iteration | Planner creates, checker verifies, loop until pass |
| Execution | Groups into waves, tracks progress | Executors implement in parallel |
| Verification | Presents results, routes next | Verifier checks, debuggers diagnose failures |

**Key Insight:** "The orchestrator never does heavy lifting. It spawns agents, waits, integrates results."

**Eames Relevance:** ⭐⭐⭐⭐⭐
- Directly aligns with our LLM Council pattern
- Validates our DeepAgents phase-specific approach
- Suggests clear separation: Orchestrator (routing) vs Agents (work)

#### 3. Fresh Context Per Plan
**What:** Each task executes with fresh 200k token context - zero accumulated garbage.

**Result:** Main context stays at 30-40% while heavy work happens in subagent contexts.

**Eames Relevance:** ⭐⭐⭐⭐
- Critical for our Develop and Deliver phases
- Supports our multi-project handling requirement
- Should implement context isolation per phase execution

#### 4. XML Task Format
**What:** Structured prompts optimized for Claude:

```xml
<task type="auto">
  <name>Create login endpoint</name>
  <files>src/app/api/auth/login/route.ts</files>
  <action>
    Use jose for JWT (not jsonwebtoken - CommonJS issues).
    Validate credentials against users table.
  </action>
  <verify>curl -X POST localhost:3000/api/auth/login returns 200</verify>
  <done>Valid credentials return cookie, invalid return 401</done>
</task>
```

**Eames Relevance:** ⭐⭐⭐
- Consider for Eames Brain internal task format
- Verification steps built into every task
- May conflict with our natural language approach

#### 5. Phased Workflow with Human Checkpoints
**What:** discuss → plan → execute → verify → complete

**Key Command: `/gsd:discuss-phase`**
- Captures user preferences BEFORE research/planning
- Identifies gray areas based on what's being built
- Ensures system builds what user actually wants

**Eames Relevance:** ⭐⭐⭐⭐
- Maps to Discovery/Define phases
- Suggests adding explicit "discuss" step before each phase
- User intent capture could improve Eames' autonomous accuracy

### What to Adopt

1. **Document-Based Context Management**
   - Create `EAMES_STATE.md` per project for cross-session memory
   - Implement size limits for context documents
   - Add automatic state persistence after each phase

2. **Orchestrator Separation Pattern**
   - Ensure our LangGraph orchestrator stays thin
   - Heavy lifting in DeepAgents, not orchestrator
   - Clear routing logic, not processing logic

3. **Context Isolation**
   - Fresh context per phase execution
   - Subagent spawning for parallel work
   - Main session stays responsive

4. **Explicit Verification Steps**
   - Add verification to every generated component
   - User acceptance testing (UAT) as explicit step
   - Automated + manual verification hybrid

### What NOT to Adopt

1. **XML Task Format**
   - Eames uses natural language prompts via Eames Brain
   - XML adds complexity without matching benefit
   - Keep our markdown-based approach

2. **CLI Slash Commands**
   - GSD targets Claude Code users directly
   - Eames is a standalone agent, not a Claude Code extension
   - Different interaction paradigm

3. **Single-Project Focus**
   - GSD assumes one project at a time
   - Eames handles multi-project contexts
   - Our approach is broader

4. **Manual Phase Progression**
   - GSD requires user to trigger each step
   - Eames aims for autonomous full-cycle execution
   - Keep our autonomous-first approach

### Implementation Ideas

#### Immediate (V1.1.0 Compatible)
```
1. Add STATE.md generation after each phase
2. Implement context size monitoring
3. Add UAT step to Deliver phase
```

#### Future (V2.0)
```
1. Context isolation per subagent
2. Parallel researcher pattern for Discovery
3. Automatic context rot detection
```

### Key Quote
> "The complexity is in the system, not in your workflow. Behind the scenes: context engineering, XML prompt formatting, subagent orchestration, state management. What you see: a few commands that just work."

This aligns perfectly with Eames' vision: complex system, simple user experience.

---

## Template for New Entries

```markdown
## FI-XXX: [Name]

### Source
- **Repository/URL:** 
- **Stars/Popularity:** 
- **Description:** 

### Core Concepts
(What does this source teach us?)

### Eames Relevance
(Rate ⭐ to ⭐⭐⭐⭐⭐, explain connection to Eames)

### What to Adopt
(Specific ideas to implement)

### What NOT to Adopt
(What doesn't fit and why)

### Implementation Ideas
(Concrete next steps)
```

---

## Backlog Summary

**Total Ideas:** 1
**High Priority:** 1
**Medium Priority:** 0
**Low Priority:** 0

---

*Last Updated: 2026-01-19*
