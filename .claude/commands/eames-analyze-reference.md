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
- Mapped to all 5 Eames phases
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

4. **Vision Alignment Score**
   Rate against the 5 Eames pillars:

   | Pillar | Score | Notes |
   |--------|-------|-------|
   | Autonomous (minimal human input) | /5 | |
   | End-to-End (full lifecycle) | /5 | |
   | Production-Ready (deployed output) | /5 | |
   | Designer-Like (real practice patterns) | /5 | |
   | Cost-Efficient (<$1 target) | /5 | |
   | **TOTAL** | /25 | |

   Interpretation:
   - 20-25: Strongly Aligned - full analysis
   - 15-19: Partially Aligned - proceed with caution
   - 10-14: Weakly Aligned - document concerns
   - <10: Misaligned - document but recommend against

   **Red Flags** (3+ = stop analysis):
   - Requires constant human input
   - Only handles single phase
   - No deployment path
   - Token-expensive approach
   - Conflicts with LangGraph architecture

5. **Map to Eames Phases**
   For each concept found, map to the 5 phases:

   | Source Feature | Discovery | Define | Design | Develop | Deliver | Priority |
   |----------------|-----------|--------|--------|---------|---------|----------|

   Check against MASTER_IMPLEMENTATION_PLAN_V1.1.0.md for gaps.

   **Jackpot insights:** Look for patterns matching real design practice:
   - User interviewing/research
   - Requirements gathering
   - Approval gates
   - UAT/validation
   These are HIGH PRIORITY.

6. **Risk Assessment**
   Evaluate implementation risks:

   | Risk | Likelihood | Impact | Mitigation |
   |------|------------|--------|------------|

   Consider:
   - Architecture changes required?
   - New dependencies needed?
   - API/integration changes?
   - Cost implications?

   **Cost/Benefit Verdict:** Worth it? (Yes / No / Conditional)

7. **Determine Adoption**

   **What to Adopt** (grouped by priority):
   - Critical: Mirrors real design practice OR blocks core function
   - High: Significant workflow improvement
   - Medium: Nice to have enhancement

   **What NOT to Adopt**:
   - List with clear reasons for each exclusion

8. **Document in Backlog**
   Generate next ID by reading FEATURE_IDEAS_BACKLOG.md:
   - Find last FI-XXX entry
   - Increment to get next ID

   Add entry with all sections:
   - Source (URL, stars, description)
   - Vision Score (/25 with pillar breakdown)
   - Phase Mapping (table from step 5)
   - Risk Assessment (from step 6)
   - What to Adopt (prioritized)
   - What NOT to Adopt (with reasons)
   - Implementation Notes (tied to V1.1.0 phases)

9. **Linear Integration**
   Ask user: "Create Linear issue for tracking? (y/n)"

   If yes, use mcp__linear__create_issue:
   - title: "[Feature Idea] {Name}"
   - team: "Basavaraj Team"
   - description: Include source URL, vision score, brief summary, backlog reference
   - labels: ["feature-idea", "source:external", appropriate phase label, vision alignment label]
   - project: "Eames Design Agent LangChain v1.0.0"
   - priority: Based on adoption priority (Critical=1, High=2, Medium=3)

   Update backlog entry with Linear issue ID.

</process>

<verification>
Before completing, verify:
- FEATURE_IDEAS_BACKLOG.md has new entry with all required sections
- No duplicate entries in backlog
- Vision score has pillar breakdown and reasoning
- All 5 phases addressed in mapping
- Linear issue (if created) links correctly to project
- Risk assessment includes mitigation strategies
</verification>

<output>
Files modified:
- FEATURE_IDEAS_BACKLOG.md - New FI-XXX entry added
- Linear issue created (optional) - ID added to backlog entry

Do NOT commit. User reviews changes first.
</output>

<rules>
DO: Validate input first, check dedup (backlog + Linear), fetch before analyzing, score against all 5 pillars, map to all 5 phases, check V1.1.0 plan for gaps, look for design practice patterns, offer Linear integration
DO NOT: Commit without user confirmation, skip vision check, adopt misaligned features, proceed with empty arguments, create Linear issue without asking
</rules>
