# Updated: 2026-01-20 14:20:00
---
name: eames-idea-triage
description: Review inbox items, check staleness, manage idea lifecycle across all files
argument-hint: [inbox|backlog|stale|stats]
allowed-tools:
  - Read
  - Write
  - Grep
  - Bash(date:*)
  - Bash(printf:*)
  - mcp__linear__list_issues
---

<objective>
Review and manage ideas across the entire lifecycle system.

**Modes:**
- `inbox` - Review unprocessed inbox items
- `backlog` - Review backlog for staleness and status updates
- `stale` - Find and handle stale entries across all files
- `stats` - Show dashboard of entire system

If no $ARGUMENTS, default to `stats` mode.
</objective>

<context>
@./IDEA_INBOX.md
@./FEATURE_IDEAS_BACKLOG.md
@./IDEA_PATTERNS.md
</context>

<success_criteria>
- Mode detected from arguments
- Appropriate review performed
- User prompted for decisions where needed
- Files updated based on decisions
- Stats recalculated
- Timestamps updated
</success_criteria>

<process>

## Mode: `stats` (default)

1. **Read All Files**
   Read: IDEA_INBOX.md, FEATURE_IDEAS_BACKLOG.md, IDEA_PATTERNS.md

2. **Calculate Metrics**

   **Inbox Metrics:**
   - Total unprocessed
   - GitHub stars pending
   - Saved links pending
   - Quick ideas pending
   - Oldest unprocessed (days)

   **Backlog Metrics:**
   - Total entries by status
   - Entries by priority (Critical/High/Medium)
   - Entries by effort (XS/S/M/L/XL)
   - Stale entries (past Stale After date)
   - Entries needing review (>30 days since last reviewed)

   **Pattern Metrics:**
   - Total patterns
   - Validated (2+ sources)
   - Emerging (1 source)
   - Adopted
   - Rejected

   **Linear Sync:**
   - Query Linear for feature-idea label count
   - Compare to backlog count

3. **Display Dashboard**

   ```
   ╔═══════════════════════════════════════════════════════════╗
   ║                 📊 IDEA SYSTEM DASHBOARD                  ║
   ╠═══════════════════════════════════════════════════════════╣
   ║ INBOX                                                     ║
   ║   📥 Unprocessed: X    ⭐ GitHub: X    🔗 Links: X        ║
   ║   ⏰ Oldest: X days                                       ║
   ╠═══════════════════════════════════════════════════════════╣
   ║ BACKLOG                                                   ║
   ║   Total: X    ✅ Analyzed: X    📅 Planned: X    🚧 WIP: X ║
   ║   ⚠️ Stale: X    🔄 Needs Review: X                       ║
   ║   Priority: 🔴X  🟡X  🟢X                                  ║
   ╠═══════════════════════════════════════════════════════════╣
   ║ PATTERNS                                                  ║
   ║   Total: X    ✅ Validated: X    🔍 Emerging: X           ║
   ╠═══════════════════════════════════════════════════════════╣
   ║ LINEAR SYNC                                               ║
   ║   Backlog: X    Linear: X    [✅ In Sync / ⚠️ X Missing]  ║
   ╚═══════════════════════════════════════════════════════════╝
   ```

4. **Recommendations**
   Based on metrics, suggest:
   - "📥 X items in inbox - run `/eames-idea-triage inbox` to review"
   - "⚠️ X stale backlog entries - run `/eames-idea-triage stale` to address"
   - "🔄 X backlog items need review (>30 days)"

---

## Mode: `inbox`

1. **Read Inbox**
   Read IDEA_INBOX.md, extract unprocessed items

2. **If Empty**
   Display: "✅ Inbox is empty! No items to triage."
   Exit.

3. **Present Items**
   List all unprocessed with quick info:
   ```
   📥 INBOX TRIAGE (X items)

   1. IN-001: [Name] | [Type] | [Days old] | [Tags]
   2. IN-002: [Name] | [Type] | [Days old] | [Tags]
   ...
   ```

4. **For Each Item, Ask**
   ```
   IN-XXX: [Name]
   Type: [type] | Added: [date] | Tags: [tags]
   Note: [quick note]

   Action?
   [A] Analyze now (run /eames-analyze-reference)
   [S] Skip for now
   [D] Delete (not relevant)
   [Q] Quit triage
   ```

5. **Handle Actions**
   - **A (Analyze)**: Inform user to run `/eames-analyze-reference [source]`
   - **S (Skip)**: Move to end of queue, increment "skip count"
   - **D (Delete)**: Move to "❌ Skipped Ideas" with reason, ask for reason
   - **Q (Quit)**: Save progress, exit

6. **Update Stats**
   Update inbox stats at end of session

---

## Mode: `backlog`

1. **Read Backlog**
   Read FEATURE_IDEAS_BACKLOG.md, parse all entries

2. **Identify Issues**
   - **Stale**: Past "Stale After" date
   - **Needs Review**: Last Reviewed > 30 days ago
   - **Missing Linear**: No Linear Issue linked
   - **Status Stuck**: In same status > 14 days

3. **Present Summary**
   ```
   📋 BACKLOG HEALTH CHECK

   ⚠️ STALE (past deadline):
      FI-001: [Name] - Stale since [date]

   🔄 NEEDS REVIEW (>30 days):
      FI-002: [Name] - Last reviewed [date]

   🔗 MISSING LINEAR:
      FI-003: [Name]

   ⏸️ STATUS STUCK:
      FI-004: [Name] - In [status] for [X] days
   ```

4. **For Each Issue, Offer**
   - **Stale**: Extend deadline / Archive / Mark resolved
   - **Needs Review**: Mark reviewed now / Skip
   - **Missing Linear**: Create Linear issue / Skip
   - **Status Stuck**: Update status / Add blocker note

5. **Apply Updates**
   Update backlog entries based on decisions

---

## Mode: `stale`

1. **Scan All Files**
   Read: IDEA_INBOX.md, FEATURE_IDEAS_BACKLOG.md

2. **Calculate Staleness**

   **Inbox Staleness:**
   - Unprocessed > 14 days = Warning
   - Unprocessed > 30 days = Critical

   **Backlog Staleness:**
   - Past "Stale After" date = Stale
   - Not reviewed > 30 days = Needs attention
   - Not reviewed > 60 days = Critical

3. **Present Findings**
   ```
   🕐 STALENESS REPORT

   🔴 CRITICAL (requires action):
      [IN-001] Inbox item - 45 days unprocessed
      [FI-002] Backlog item - 90 days stale

   🟡 WARNING (attention needed):
      [IN-003] Inbox item - 20 days unprocessed
      [FI-004] Backlog item - 40 days since review

   Total: X critical, Y warnings
   ```

4. **Batch Actions**
   Offer batch actions:
   - "Archive all critical stale items?"
   - "Extend deadline for warnings by 30 days?"
   - "Mark warnings as reviewed today?"

5. **Apply Updates**
   Update files based on batch decisions

</process>

<output>

**Stats Mode:**
```
📊 System dashboard displayed
📝 Recommendations provided
```

**Inbox Mode:**
```
📥 Triaged X items
   - Analyzed: X (queued for /eames-analyze-reference)
   - Skipped: X
   - Deleted: X
```

**Backlog Mode:**
```
📋 Backlog health checked
   - Stale resolved: X
   - Reviews updated: X
   - Linear issues created: X
```

**Stale Mode:**
```
🕐 Staleness addressed
   - Critical resolved: X
   - Warnings addressed: X
   - Items archived: X
```

Files modified: [list]
Do NOT commit.
</output>

<rules>
DO: Provide clear summaries, offer batch operations, update timestamps, track decisions

DO NOT: Auto-delete without confirmation, skip user input for destructive actions, commit changes, run analysis (that's /eames-analyze-reference)
</rules>

<examples>

**Example 1: Default (stats)**
```
User: /eames-idea-triage

→ Displays full system dashboard
→ Shows recommendations based on metrics
```

**Example 2: Inbox review**
```
User: /eames-idea-triage inbox

→ Lists 5 unprocessed items
→ User analyzes 2, skips 2, deletes 1
→ Updates inbox stats
```

**Example 3: Stale check**
```
User: /eames-idea-triage stale

→ Finds 3 critical, 5 warning items
→ User archives 2 critical
→ User extends deadline for 3 warnings
→ Updates all files
```

</examples>
