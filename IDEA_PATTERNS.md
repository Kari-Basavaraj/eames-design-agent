# Updated: 2026-01-20 15:55:00
# IDEA PATTERNS

> **Purpose:** Track cross-cutting themes that appear across multiple ideas/sources. When the same concept appears in 2+ places, it's a PATTERN worth prioritizing.

---

## 🎯 Why Patterns Matter

**Single idea** = Interesting, might be niche
**Pattern (2+ sources)** = Industry trend, proven valuable
**Strong pattern (3+ sources)** = Must-have, validated by market

Patterns get **higher priority** than isolated ideas because they're independently validated.

---

## 📊 Pattern Dashboard

| ID | Pattern | Occurrences | Sources | Priority | Status |
|----|---------|-------------|---------|----------|--------|
| PAT-001 | User Interviewing Before Execution | 2 | FI-001, FI-002 | 🔴 Critical | Validated |
| PAT-002 | Approval Gates | 1 | FI-001 | 🔴 Critical | Emerging |

### Status Legend
| Status | Meaning |
|--------|---------|
| Emerging | 1 source, watching for more |
| Validated | 2+ sources, confirmed pattern |
| Adopted | Implemented in Eames |
| Rejected | Decided against (with reason) |

---

## 🔴 Critical Patterns

### PAT-001: User Interviewing Before Execution

**Occurrences:** 2 (Strong pattern)

| Source | How It Appears |
|--------|----------------|
| FI-001 (GSD) | "Questions" phase - asks until fully understood |
| FI-002 (claude-build-workflow) | BMAD Interview - interview before any autonomous execution |

**Core Insight:**
> Autonomous execution without understanding = expensive garbage.
> Upfront interviewing makes autonomy actually useful.

**Maps to Eames:**
- **Phase:** Discovery (new INTAKE substep)
- **Why Critical:** This is THE MOAT - what separates Eames from "code generator"

**Real Design Practice Equivalent:**
- User Research
- Stakeholder Interviews
- Requirements Gathering
- Scope Definition

**Implementation:**
- Add INTAKE step at start of Discovery
- Interview until: goals, constraints, preferences, edge cases captured
- User approves understanding before research begins

**Status:** 🔴 Critical - Must implement in V1.1.0 Phase 0

---

### PAT-002: Approval Gates

**Occurrences:** 1 (Emerging - watching for validation)

| Source | How It Appears |
|--------|----------------|
| FI-001 (GSD) | User approves roadmap BEFORE execution begins |

**Core Insight:**
> Autonomous ≠ Uncontrolled. Strategic checkpoints ensure alignment.

**Maps to Eames:**
- **Phases:** Discovery→Define, Define→Design, Develop→Deliver
- **Why Critical:** Prevents runaway autonomous execution

**Gates Needed:**
1. Post-Intake: "Do I understand correctly?"
2. Post-Define: "Does this roadmap match your vision?"
3. Pre-Deploy: "Ready to go live?"

**Status:** 🔴 Critical - Implement with PAT-001

---

## 🟡 High Priority Patterns

### PAT-003: Parallel Research Agents

**Occurrences:** 1 (Emerging)

| Source | How It Appears |
|--------|----------------|
| FI-001 (GSD) | 4 parallel researchers: competitor, technology, architecture, pitfalls |

**Core Insight:**
> Orchestrator coordinates, never does heavy lifting. Specialized agents work in parallel.

**Status:** 🟡 High - Implement in V1.1.0 Phase 2+

---

### PAT-004: Fresh Context Per Task

**Occurrences:** 1 (Emerging)

| Source | How It Appears |
|--------|----------------|
| FI-001 (GSD) | Each task executes with fresh 200k token context |

**Core Insight:**
> Main context stays clean while heavy work happens in subagent contexts.

**Status:** 🟡 High - Implement in V1.1.0 Phase 3+

---

## 🟢 Medium Priority Patterns

### PAT-005: Document-Based Context Management

**Occurrences:** 1 (Emerging)

|| Source | How It Appears |
||--------|----------------|
|| FI-001 (GSD) | PROJECT.md, REQUIREMENTS.md, STATE.md, PLAN.md |

**Status:** 🟢 Medium - Consider for V1.1.0

---

### PAT-006: Local Model Fallback (Hybrid Cloud/Local)

**Occurrences:** 1 (Emerging)

|| Source | How It Appears |
||--------|----------------|
|| FI-003 (Ollama v0.14.0) | Anthropic Messages API enables local models as Claude drop-in replacements |

**Core Insight:**
> Use cloud models (Claude) for high-stakes reasoning, local models (Ollama) for high-volume execution. Hybrid approach maximizes quality while minimizing cost.

**Maps to Eames:**
- **Phases:** All phases, with routing logic
- **Why Important:** Directly enables <$1 per app target (Cost-Efficient pillar)

**Real Design Practice Equivalent:**
- Outsource specialist work (strategy), in-house commodity work (production)
- Use premium tools for creative phases, efficient tools for execution

**Implementation:**
- Upgrade Ollama integration to Anthropic Messages API
- Add model router that selects cloud/local per phase
- Feature flag for user control

**Status:** 🟡 High (emerging) - Watch for validation from other local model sources

---

## 📋 Pattern Template

```markdown
### PAT-XXX: [Pattern Name]

**Occurrences:** X

| Source | How It Appears |
|--------|----------------|
| FI-XXX | [description] |
| FI-XXX | [description] |

**Core Insight:**
> [One sentence capturing the pattern's value]

**Maps to Eames:**
- **Phase:** [which phase(s)]
- **Why Important:** [Eames-specific reasoning]

**Real Design Practice Equivalent:**
- [List professional practices this mirrors]

**Implementation:**
- [Concrete steps to implement]

**Status:** [🔴 Critical / 🟡 High / 🟢 Medium / Adopted / Rejected]
```

---

## 🔍 How Pattern Detection Works

### Detection Mechanism (Semi-Automated)

```
┌─────────────────────────────────────────────────────────────┐
│ STEP 1: Extract Concepts                                    │
│ Command extracts core concepts from source                  │
│ e.g., "user interviewing", "approval gates", "parallel"     │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 2: Keyword Search                                      │
│ Grep IDEA_PATTERNS.md for concept keywords                  │
│ e.g., grep "interview" → finds PAT-001                      │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 3: Match or Flag                                       │
│ IF match found:                                             │
│   → Link to existing PAT-XXX                                │
│   → Increment occurrence count                              │
│   → Add source to pattern's table                           │
│ IF no match but concept seems recurring:                    │
│   → Flag as "emerging pattern candidate"                    │
│   → User decides whether to create new PAT-XXX              │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 4: Promotion (2+ sources)                              │
│ Pattern promoted from "Emerging" to "Validated" when:       │
│   → 2+ independent sources reference same concept           │
│   → User confirms it's the same underlying pattern          │
└─────────────────────────────────────────────────────────────┘
```

### What Detection Is NOT
- ❌ **Not semantic similarity** (no embeddings/vectors)
- ❌ **Not fully automated** (user confirms matches)
- ❌ **Not fuzzy matching** (keyword-based)

### How Patterns Get Created

1. **Via /eames-analyze-reference:** Command finds concept matching existing pattern
2. **Manual:** When reviewing backlog and noticing theme
3. **Merge:** When two ideas realize they're the same underlying pattern

---

## 📊 Pattern Stats

|| Metric | Count |
||--------|-------|
|| **Total Patterns** | 6 |
|| **🔴 Critical** | 2 |
|| **🟡 High** | 3 |
|| **🟢 Medium** | 1 |
|| **Validated (2+ sources)** | 1 |
|| **Emerging (1 source)** | 5 |
|| **Adopted** | 0 |
|| **Rejected** | 0 |

---

## ❌ Rejected Patterns

> **Patterns we explicitly decided against - with reasoning**

| ID | Pattern | Rejected Date | Reason |
|----|---------|---------------|--------|
| (none yet) | | | |

---

*Last Updated: 2026-01-20 13:25:00*
