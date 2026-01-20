---
name: eames-analyze-reference
description: Analyze references and map insights to Eames Design Agent's 5-phase lifecycle with Linear integration
argument-hint: <url or repo or search term>
allowed-tools:
  - Read
  - Write
  - Grep
  - WebSearch
  - WebFetch
  - Bash(curl -s:*)
  - Bash(grep:*)
  - Bash(printf:*)
  - mcp__linear__list_issues
  - mcp__linear__create_issue
  - mcp__linear__list_issue_labels
---

<objective>
Analyze external references mapped to Eames' vision and 5-phase lifecycle.

If no $ARGUMENTS provided, ask user for a URL, repo name, or search term before proceeding.

**EAMES VISION (Never Deviate!):**
- INPUT: "Build me a landing page for my SaaS"
- OUTPUT: Live deployed app + GitHub repo + shareable link
- Metrics: <$1 per app, <15 minutes, zero intervention after approval

**Vision Pillars:** Autonomous, End-to-End, Production-Ready, Designer-Like, Cost-Efficient

**Eames 5 Phases:** Discovery → Define → Design → Develop → Deliver

**Architecture Stack:** LangGraph StateGraph, DeepAgents v0.3.2+, CompositeBackend, Eames Brain 2.0
</objective>

<context>
@./CLAUDE.md
@./WARP.md
@./MASTER_IMPLEMENTATION_PLAN_V1.1.0.md
@./FEATURE_IDEAS_BACKLOG.md
</context>

<success_criteria>
- Input validated (not empty)
- Dedup check passed (backlog + Linear)
- Content fetched successfully
- Vision alignment scored (/25)
- Agent-native principles evaluated
- Mapped to all 5 Eames phases with specific subagent fit
- Tech stack alignment assessed
- Entry added to FEATURE_IDEAS_BACKLOG.md
- Linear issue created (if user confirms)
- No auto-commit
</success_criteria>

<process>

1. **Validate Input**
   If $ARGUMENTS is empty or whitespace, prompt user: "Please provide a reference URL, repo name, or search term."
   Do not proceed until valid input received.

2. **Dedup Check**
   Search for existing entries before deep analysis:

   **Backlog search:**
   - Use Grep tool on FEATURE_IDEAS_BACKLOG.md with keywords from reference

   **Linear search:**
   - Use mcp__linear__list_issues with query containing keywords
   - Filter by label "feature-idea" if available

   **Plan search:**
   - Use Grep tool on MASTER_IMPLEMENTATION_PLAN_V1.1.0.md

   If duplicate found: offer to add insights to existing entry or skip.

3. **Fetch Content**
   Determine reference type from $ARGUMENTS:

   **GitHub URL** (contains github.com/owner/repo):
   - Extract owner and repo from URL
   - Use Bash: `curl -s "https://api.github.com/repos/{owner}/{repo}"` for metadata
   - Use Bash: `curl -s "https://raw.githubusercontent.com/{owner}/{repo}/main/README.md"` for README
   - If main branch fails, try master branch

   **GitHub shorthand** (format: owner/repo):
   - Same as above, construct URLs from shorthand

   **Article/Website URL** (starts with http):
   - Use WebFetch tool to retrieve content

   **Search term** (anything else):
   - Use WebSearch tool to find relevant results
   - Present top results to user for selection

   **Error handling**: If fetch fails, inform user and suggest alternative URL or manual input.

4. **Vision Alignment Score (/25)**
   Rate against the 5 Eames pillars:

   | Pillar | Score | Evidence |
   |--------|-------|----------|
   | Autonomous (minimal human input after start) | /5 | |
   | End-to-End (full lifecycle Discovery→Deliver) | /5 | |
   | Production-Ready (deployed, not prototyped) | /5 | |
   | Designer-Like (real practice patterns, not just code) | /5 | |
   | Cost-Efficient (<$1 target, prompt caching viable) | /5 | |
   | **TOTAL** | /25 | |

   **Interpretation:**
   - 20-25: Strongly Aligned - full analysis, high priority
   - 15-19: Partially Aligned - proceed with caution
   - 10-14: Weakly Aligned - document concerns
   - <10: Misaligned - document but recommend against

   **Red Flags** (3+ = stop analysis):
   - Requires constant human input (breaks Autonomous)
   - Only handles single phase (breaks End-to-End)
   - No deployment path (breaks Production-Ready)
   - Token-expensive approach (breaks Cost-Efficient)
   - Conflicts with LangGraph/DeepAgents architecture

5. **Agent-Native Principles Check**
   Evaluate against Dan Shipper's Agent-Native Architecture principles:

   | Principle | Alignment | Notes |
   |-----------|-----------|-------|
   | **Parity** (agent can do what user can do) | ✅/❌ | |
   | **Granularity** (atomic primitives, not monoliths) | ✅/❌ | |
   | **Composability** (tools can combine for new features) | ✅/❌ | |
   | **Emergent Capability** (enables unexpected combinations) | ✅/❌ | |
   | **Improvement Over Time** (accumulated context helps) | ✅/❌ | |

   Score: /5 principles aligned

6. **Map to Eames Phases**
   For each concept found, map to the 5 phases AND identify subagent fit:

   | Source Feature | Phase | Subagent Fit | Current Gap? | Priority |
   |----------------|-------|--------------|--------------|----------|
   | | Discovery | Competitor/Market/User | | |
   | | Define | Persona/JobStory | | |
   | | Design | Color/Typography/Component | | |
   | | Develop | React/API/Test | | |
   | | Deliver | - | | |

   Check against MASTER_IMPLEMENTATION_PLAN_V1.1.0.md for gaps.

   **Jackpot Insights** (real design practice patterns):
   - User interviewing/research → Discovery
   - Clarification Loop patterns → Define (THE MOAT!)
   - Approval gates → Phase transitions
   - UAT/validation → Deliver

7. **Tech Stack Alignment**
   Evaluate integration with Eames architecture:

   | Integration Point | Compatibility | Notes |
   |-------------------|---------------|-------|
   | LangGraph StateGraph | ✅/⚠️/❌ | |
   | DeepAgents v0.3.2+ | ✅/⚠️/❌ | |
   | CompositeBackend (/workspace, /memories, /deliverables) | ✅/⚠️/❌ | |
   | PostgreSQL checkpointing | ✅/⚠️/❌ | |
   | Middleware stack (RateLimit→PromptCache→HITL→TodoList→Filesystem→SubAgent) | ✅/⚠️/❌ | |
   | Eames Brain 2.0 prompts | ✅/⚠️/❌ | |
   | MCP tools | ✅/⚠️/❌ | |

   **Tech Verdict:** Native fit / Requires wrapper / Architectural conflict

8. **Risk Assessment**
   Evaluate implementation risks:

   | Risk | Likelihood | Impact | Mitigation |
   |------|------------|--------|------------|
   | Architecture changes required? | L/M/H | L/M/H | |
   | New dependencies needed? | L/M/H | L/M/H | |
   | Token cost implications? | L/M/H | L/M/H | |
   | Breaking changes to existing phases? | L/M/H | L/M/H | |

   **Cost/Benefit Verdict:** Worth it? (Yes / No / Conditional)

9. **Determine Adoption**

   **What to Adopt** (grouped by priority):
   - 🔴 Critical: Mirrors real design practice OR blocks core function
   - 🟡 High: Significant workflow improvement
   - 🟢 Medium: Nice to have enhancement

   **What NOT to Adopt**:
   - List with clear reasons for each exclusion
   - Reference which pillar or principle it violates

10. **Document in Backlog**
    Generate next ID by reading FEATURE_IDEAS_BACKLOG.md:
    - Find last FI-XXX entry
    - Increment to get next ID

    Add entry with all sections:
    - Source (URL, stars, description)
    - Vision Score (/25 with pillar breakdown)
    - Agent-Native Score (/5 principles)
    - Phase Mapping (table from step 6)
    - Tech Stack Alignment (from step 7)
    - Risk Assessment (from step 8)
    - What to Adopt (prioritized)
    - What NOT to Adopt (with reasons)
    - Implementation Notes (tied to V1.1.0 phases: 0-7)

11. **Linear Integration**
    Ask user: "Create Linear issue for tracking? (y/n)"

    If yes, use mcp__linear__create_issue:
    - title: "[Feature Idea] {Name}"
    - team: "Basavaraj Team"
    - description: Include source URL, vision score, agent-native score, brief summary, backlog reference
    - labels: [
        "feature-idea",
        "source:external",
        appropriate phase label (discovery/define/design/develop/deliver),
        vision alignment label (aligned/partial/misaligned),
        tech-fit label (native/wrapper/conflict)
      ]
    - project: "Eames Design Agent LangChain v1.0.0"
    - priority: Based on adoption priority (Critical=1, High=2, Medium=3)

    Update backlog entry with Linear issue ID.

</process>

<verification>
Before completing, verify:
- FEATURE_IDEAS_BACKLOG.md has new entry with all required sections
- No duplicate entries in backlog
- Vision score has pillar breakdown and evidence
- Agent-native principles explicitly evaluated
- All 5 phases addressed in mapping with subagent fit
- Tech stack alignment assessed
- Linear issue (if created) links correctly to project
- Risk assessment includes mitigation strategies
- Implementation notes reference specific V1.1.0 phases (0-7)
</verification>

<output>
Files modified:
- FEATURE_IDEAS_BACKLOG.md - New FI-XXX entry added

Summary displayed:
- Vision Score: /25
- Agent-Native Score: /5
- Tech Fit: Native/Wrapper/Conflict
- Top Priority Adoptions: (list)
- Linear Issue: (ID if created)

Do NOT commit. User reviews changes first.
</output>

<rules>
DO: Validate input first, check dedup (backlog + Linear), fetch before analyzing, score against all 5 pillars, evaluate agent-native principles, map to all 5 phases with subagent fit, assess tech stack alignment, check V1.1.0 plan for gaps, look for Clarification Loop patterns (THE MOAT!), offer Linear integration

DO NOT: Commit without user confirmation, skip vision check, skip agent-native evaluation, adopt features that break architecture, proceed with empty arguments, create Linear issue without asking, forget to reference V1.1.0 implementation phases
</rules>
