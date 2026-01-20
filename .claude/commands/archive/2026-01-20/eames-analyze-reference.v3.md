---
name: eames-analyze-reference
description: Analyze references and map insights to Eames Design Agent's 5-phase lifecycle with full tracking
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
  - Bash(date:*)
  - mcp__linear__list_issues
  - mcp__linear__create_issue
  - mcp__linear__list_issue_labels
---

<objective>
Analyze external references with full lifecycle tracking for Eames.

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
@./IDEA_INBOX.md
@./IDEA_PATTERNS.md
</context>

<success_criteria>
- Input validated (not empty)
- Dedup check passed (backlog + Linear + inbox + patterns)
- Source health assessed (for repos)
- Content fetched successfully
- Vision alignment scored (/25) with evidence
- Agent-native principles evaluated (/5)
- Mapped to all 5 Eames phases with subagent fit
- Tech stack alignment assessed
- Effort estimated (XS/S/M/L/XL)
- Patterns identified and linked
- Alternatives considered
- Entry added to FEATURE_IDEAS_BACKLOG.md with full template
- IDEA_PATTERNS.md updated if pattern found
- Linear issue created (if user confirms)
- IDEA_INBOX.md updated if source was from inbox
- No auto-commit
</success_criteria>

<process>

1. **Validate Input**
   If $ARGUMENTS is empty or whitespace, prompt user: "Please provide a reference URL, repo name, or search term."
   Do not proceed until valid input received.

2. **Check Inbox**
   Search IDEA_INBOX.md for this source:
   - If found, mark as "🔍 Processing"
   - Note the inbox ID for later update

3. **Dedup Check**
   Search ALL sources before deep analysis:

   **Backlog search:**
   - Use Grep tool on FEATURE_IDEAS_BACKLOG.md with keywords from reference

   **Linear search:**
   - Use mcp__linear__list_issues with query containing keywords
   - Filter by label "feature-idea" if available

   **Plan search:**
   - Use Grep tool on MASTER_IMPLEMENTATION_PLAN_V1.1.0.md

   **Pattern search:**
   - Use Grep tool on IDEA_PATTERNS.md to see if concept matches existing pattern

   If duplicate found: offer to add insights to existing entry or skip.

4. **Fetch Content**
   Determine reference type from $ARGUMENTS:

   **GitHub URL** (contains github.com/owner/repo):
   - Extract owner and repo from URL
   - Use Bash: `curl -s "https://api.github.com/repos/{owner}/{repo}"` for metadata (stars, license, updated_at)
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

5. **Source Health Assessment** (for GitHub repos)
   Extract and evaluate:

   | Metric | Status | Notes |
   |--------|--------|-------|
   | Active Development | ✅/🟡/❌ | Last commit within 30 days? |
   | Community | ✅/🟡/❌ | Stars, open issues, contributors |
   | Documentation | ✅/🟡/❌ | README quality |
   | License | ✅/🟡/❌ | MIT/Apache = ✅, GPL = 🟡, None = ❌ |
   | Breaking Change Risk | Low/Medium/High | Young project? Rapid changes? |

6. **Vision Alignment Score (/25)**
   Rate against the 5 Eames pillars WITH EVIDENCE:

   | Pillar | Score | Evidence |
   |--------|-------|----------|
   | Autonomous (minimal human input after start) | /5 | [specific feature/quote] |
   | End-to-End (full lifecycle Discovery→Deliver) | /5 | [specific feature/quote] |
   | Production-Ready (deployed, not prototyped) | /5 | [specific feature/quote] |
   | Designer-Like (real practice patterns, not just code) | /5 | [specific feature/quote] |
   | Cost-Efficient (<$1 target, prompt caching viable) | /5 | [specific feature/quote] |
   | **TOTAL** | /25 | |

   **Confidence:** High (direct code review) / Medium (README only) / Low (limited info)

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

7. **Agent-Native Principles Check (/5)**
   Evaluate against Dan Shipper's Agent-Native Architecture principles:

   | Principle | Aligned | Evidence |
   |-----------|---------|----------|
   | **Parity** (agent can do what user can do) | ✅/❌ | [evidence] |
   | **Granularity** (atomic primitives, not monoliths) | ✅/❌ | [evidence] |
   | **Composability** (tools can combine for new features) | ✅/❌ | [evidence] |
   | **Emergent Capability** (enables unexpected combinations) | ✅/❌ | [evidence] |
   | **Improvement Over Time** (accumulated context helps) | ✅/❌ | [evidence] |

   Score: /5 principles aligned

8. **Pattern Detection**
   Check if concepts match existing patterns in IDEA_PATTERNS.md:

   - If match found: Link to PAT-XXX, note as validation
   - If new pattern emerging: Note for potential new PAT entry
   - Look for: User interviewing, Approval gates, Parallel agents, Context management

9. **Map to Eames Phases**
   For each concept found, map to the 5 phases AND identify subagent fit:

   | Source Feature | Eames Current | V1.1.0 Plan | Gap? | Phase | Subagent Fit | Priority | Effort |
   |----------------|---------------|-------------|------|-------|--------------|----------|--------|
   | | | | | Discovery | Competitor/Market/User | | XS/S/M/L/XL |
   | | | | | Define | Persona/JobStory | | |
   | | | | | Design | Color/Typography/Component | | |
   | | | | | Develop | React/API/Test | | |
   | | | | | Deliver | - | | |

   Check against MASTER_IMPLEMENTATION_PLAN_V1.1.0.md for gaps.

   **Jackpot Insights** (real design practice patterns):
   - User interviewing/research → Discovery (PAT-001!)
   - Clarification Loop patterns → Define (THE MOAT!)
   - Approval gates → Phase transitions (PAT-002!)
   - UAT/validation → Deliver

10. **Tech Stack Alignment**
    Evaluate integration with Eames architecture:

    | Integration Point | Compatibility | Notes |
    |-------------------|---------------|-------|
    | LangGraph StateGraph | ✅/⚠️/❌ | |
    | DeepAgents v0.3.2+ | ✅/⚠️/❌ | |
    | CompositeBackend (/workspace, /memories, /deliverables) | ✅/⚠️/❌ | |
    | PostgreSQL checkpointing | ✅/⚠️/❌ | |
    | Middleware stack | ✅/⚠️/❌ | |
    | Eames Brain 2.0 prompts | ✅/⚠️/❌ | |
    | MCP tools | ✅/⚠️/❌ | |

    **Tech Verdict:** Native fit / Requires wrapper / Architectural conflict

11. **Effort Estimation**
    Estimate effort to adopt (based on what to adopt):

    | Size | Criteria |
    |------|----------|
    | XS | < 2 hours, single file change |
    | S | 2-8 hours (1 day), few files |
    | M | 1-3 days, new module |
    | L | 1-2 weeks, architectural change |
    | XL | > 2 weeks, major rework |

    **Total Effort:** [XS/S/M/L/XL]
    **Confidence:** High / Medium / Low

12. **Alternatives Considered**
    What else solves this problem?

    | Alternative | Why Not Chosen |
    |-------------|----------------|

13. **Risk Assessment**
    Evaluate implementation risks:

    | Risk | Likelihood | Impact | Mitigation |
    |------|------------|--------|------------|
    | Architecture changes required? | L/M/H | L/M/H | |
    | New dependencies needed? | L/M/H | L/M/H | |
    | Token cost implications? | L/M/H | L/M/H | |
    | Breaking changes to existing phases? | L/M/H | L/M/H | |

    **Reversibility:** Easy / Hard / Irreversible
    **Cost/Benefit Verdict:** Worth it? (Yes / No / Conditional)

14. **Determine Adoption**

    **What to Adopt** (grouped by priority):
    - 🔴 Critical: Mirrors real design practice OR blocks core function
    - 🟡 High: Significant workflow improvement
    - 🟢 Medium: Nice to have enhancement

    **What NOT to Adopt**:
    | Feature | Reason | Pillar Violated |
    |---------|--------|-----------------|

15. **Implementation Scope**
    | Area | Changes |
    |------|---------|
    | **Files Modified** | [list specific files] |
    | **New Modules** | [list new modules needed] |
    | **API Changes** | Additive / Breaking / None |
    | **Tests Required** | Unit / Integration / E2E |
    | **Rollout Strategy** | Feature flag / Gradual / Big bang |

16. **Success Metrics**
    | Metric | Target | How to Measure |
    |--------|--------|----------------|

17. **Document in Backlog**
    Generate next ID by reading FEATURE_IDEAS_BACKLOG.md:
    - Find last FI-XXX entry
    - Increment to get next ID
    - Calculate stale date (90 days from today)

    Add entry with ALL sections from template:
    - Metadata (Status, Priority, Effort, Confidence, Last Reviewed, Stale After, Project Tags, Related Patterns, Linear Issue)
    - Source (URL, stars, last commit, license, description)
    - Source Health Assessment (table)
    - Vision Alignment Score (/25 with evidence)
    - Agent-Native Principles (/5 with evidence)
    - JACKPOT INSIGHT (if found)
    - Feature Mapping (table with Effort column)
    - Tech Stack Alignment (table)
    - Risk Assessment (table with Reversibility)
    - Alternatives Considered (table)
    - What to Adopt (prioritized)
    - What NOT to Adopt (with reasons and pillar violated)
    - Implementation Scope (table)
    - Success Metrics (table)
    - Decision Log (initial entry)
    - Linear Tracking
    - Related Entries

18. **Update Patterns**
    If pattern found or emerging:
    - Update IDEA_PATTERNS.md with new source
    - Increment occurrence count
    - If new pattern (2+ sources), create PAT-XXX entry

19. **Linear Integration**
    Ask user: "Create Linear issue for tracking? (y/n)"

    If yes, use mcp__linear__create_issue:
    - title: "[Feature Idea] {Name}"
    - team: "Basavaraj Team"
    - description: Include source URL, vision score, agent-native score, effort, brief summary, backlog reference
    - labels: [
        "feature-idea",
        "source:external",
        appropriate phase label (discovery/define/design/develop/deliver),
        vision alignment label (vision:aligned/vision:partial/vision:low),
        effort label (effort:xs/effort:s/effort:m/effort:l/effort:xl),
        tech-fit label (tech:native/tech:wrapper/tech:conflict)
      ]
    - project: "Eames Design Agent LangChain v1.0.0"
    - priority: Based on adoption priority (Critical=1, High=2, Medium=3)

    Update backlog entry with Linear issue ID.

20. **Update Inbox**
    If source was from IDEA_INBOX.md:
    - Move entry to "✅ Recently Processed" section
    - Record backlog ID and outcome
    - Update inbox stats

</process>

<verification>
Before completing, verify:
- FEATURE_IDEAS_BACKLOG.md has new entry with ALL template sections
- Quick Reference Dashboard row added
- No duplicate entries in backlog
- Vision score has evidence for each pillar
- Agent-native principles have evidence
- All 5 phases addressed in mapping with subagent fit AND effort
- Tech stack alignment assessed with verdict
- Effort estimate provided with confidence
- Risk assessment includes reversibility
- Alternatives considered (at least mention current state)
- Implementation scope has specific files
- Success metrics are measurable
- Decision log has initial entry
- IDEA_PATTERNS.md updated if applicable
- Linear issue (if created) links correctly
- IDEA_INBOX.md updated if source was from inbox
- Backlog Summary stats updated
</verification>

<output>
Files modified:
- FEATURE_IDEAS_BACKLOG.md - New FI-XXX entry added, dashboard updated
- IDEA_PATTERNS.md - Pattern updated/created (if applicable)
- IDEA_INBOX.md - Source marked processed (if applicable)

Summary displayed:
- **FI-XXX:** [Name]
- **Vision Score:** /25 (Confidence: H/M/L)
- **Agent-Native:** /5
- **Effort:** XS/S/M/L/XL
- **Tech Fit:** Native/Wrapper/Conflict
- **Patterns:** PAT-XXX (if any)
- **Top Adoptions:** (list critical/high)
- **Linear Issue:** [ID] (if created)

Do NOT commit. User reviews changes first.
</output>

<rules>
DO: Validate input first, check inbox/dedup (all sources), assess source health, fetch before analyzing, score with EVIDENCE, evaluate agent-native principles, detect patterns, map to all 5 phases with subagent fit AND effort, assess tech stack, estimate effort, consider alternatives, assess reversibility, use FULL template, update patterns file, offer Linear integration

DO NOT: Commit without user confirmation, skip vision evidence, skip agent-native evaluation, forget effort estimates, adopt features that break architecture, proceed with empty arguments, create Linear issue without asking, forget to update patterns, leave template sections empty
</rules>
