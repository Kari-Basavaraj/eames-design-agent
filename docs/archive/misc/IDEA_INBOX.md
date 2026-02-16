# Updated: 2026-01-20 22:30:00
# IDEA INBOX

> **Purpose:** Quick capture of ideas with minimal friction. This is the "inbox" - ideas come here first, then get processed into FEATURE_IDEAS_BACKLOG.md after analysis.

---

## 📥 How to Use This File

1. **Quick Capture** - Drop links, notes, GitHub stars here with minimal info
2. **Process Later** - Run `/eames-analyze-reference` on items to fully analyze
3. **Move to Backlog** - After analysis, entry moves to FEATURE_IDEAS_BACKLOG.md
4. **Keep Inbox Clean** - Regularly triage, don't let items rot

---

## 📊 Inbox Dashboard

|| ID | Source | Tags | Date Added | Status | Project |
||----|--------|------|------------|--------|---------|
|| IN-003 | nibzard/agentic-handbook | ai-agents, patterns, architecture | 2026-01-20 | ✅ Processed → FI-004 | eames |
|| IN-002 | ollama-blog | local-models, cost-reduction | 2026-01-20 | ✅ Processed → FI-003 | eames |
|| IN-001 | Example | ai-agent | 2026-01-20 | 📥 Template | eames |

### Status Legend
| Status | Meaning |
|--------|---------|
| 📥 Unprocessed | Just captured, needs analysis |
| 🔍 Processing | Currently being analyzed |
| ✅ Processed | Moved to backlog |
| ❌ Skipped | Decided not to analyze (with reason) |

---

## 📥 Unprocessed Ideas

### IN-003: The Agentic AI Handbook: Production-Ready Patterns
|| Field | Value |
||-------|-------|
|| **URL** | https://www.nibzard.com/agentic-handbook |
|| **Type** | Article |
|| **Tags** | ai-agents, patterns, architecture |
|| **Project Relevance** | eames |
|| **Date Added** | 2026-01-20 |
|| **Added By** | User |
|| **Quick Note** | Comprehensive guide to 113 battle-tested architectural patterns for building production AI agents |
|| **Status** | ✅ Processed → FI-004 |

---

### IN-002: Ollama v0.14.0 Anthropic Messages API
|| Field | Value |
||-------|-------|
|| **URL** | https://ollama.com/blog/claude |
|| **Type** | Article |
|| **Tags** | local-models, ollama, anthropic-api, cost-reduction |
|| **Project Relevance** | eames |
|| **Date Added** | 2026-01-20 |
|| **Added By** | User |
|| **Quick Note** | Ollama v0.14.0 adds Anthropic Messages API support - enables local Claude-compatible models |
|| **Status** | ✅ Processed → FI-003 |

---

### IN-001: [Template - Delete This]
|| Field | Value |
||-------|-------|
|| **URL** | https://example.com |
|| **Type** | GitHub / Article / Video / Tool / Concept |
|| **Tags** | ai-agent, workflow, design |
|| **Project Relevance** | eames, general-ai |
|| **Date Added** | 2026-01-20 |
|| **Added By** | User |
|| **Quick Note** | One-line description of why this is interesting |
|| **Status** | 📥 Unprocessed |

---

## 🌟 GitHub Stars Queue

> **Sync your GitHub stars here for processing**
> Use `/eames-backlog-sync` to pull recent stars

| Repo | Stars | Why Starred | Date Starred | Status |
|------|-------|-------------|--------------|--------|
| (none yet) | | | | |

### How to Add GitHub Stars
1. Star a repo on GitHub with note about why
2. Add here with quick note
3. Process with `/eames-analyze-reference <repo>`

---

## 🔗 Saved Links Queue

> **Dump saved links from bookmarks, notes apps, etc.**

| URL | Source App | Tags | Date Saved | Status |
|-----|------------|------|------------|--------|
| https://www.nibzard.com/agentic-handbook | Direct capture | ai-agents, patterns, architecture | 2026-01-20 | ✅ Processed → FI-004 |

### Sources to Check
- [ ] Browser bookmarks
- [ ] Notion saved pages
- [ ] Twitter/X bookmarks
- [ ] LinkedIn saved posts
- [ ] Pocket/Instapaper
- [ ] Email "to read" folder

---

## 💭 Quick Ideas Queue

> **Rough ideas that popped up - not from external sources**

| Idea | Context | Date | Status |
|------|---------|------|--------|
| (none yet) | | | |

---

## ✅ Recently Processed

> **Ideas that have been analyzed and moved to backlog**
> Keep last 10 for reference, then delete

|| ID | Source | Processed Date | Backlog ID | Outcome |
||----|--------|----------------|------------|---------|
|| IN-003 | nibzard.com/agentic-handbook | 2026-01-20 | FI-004 | ✅ Analyzed - 113 patterns, 3 patterns validated |
|| IN-002 | ollama.com/blog/claude | 2026-01-20 | FI-003 | ✅ Analyzed - Hybrid cloud/local strategy adopted |

---

## ❌ Skipped Ideas

> **Ideas decided NOT to analyze - with reason (so we don't revisit)**

| ID | Source | Skip Date | Reason |
|----|--------|-----------|--------|
| (none yet) | | | |

---

## 🗑️ Auto-Archived (Stale)

> **Items unprocessed for 60+ days - auto-archived to keep inbox clean**

| ID | Source | Added Date | Archived Date | Reason |
|----|--------|------------|---------------|--------|
| (none yet) | | | | |

**To revive:** Move back to "📥 Unprocessed Ideas" section, update date.

---

## 📋 Inbox Template

```markdown
### IN-XXX: [Name]
| Field | Value |
|-------|-------|
| **URL** | [link] |
| **Type** | GitHub / Article / Video / Tool / Concept |
| **Tags** | [comma-separated] |
| **Project Relevance** | eames / general-ai / [other] |
| **Date Added** | YYYY-MM-DD |
| **Added By** | User / Auto-sync |
| **Quick Note** | [one line - why interesting?] |
| **Status** | 📥 Unprocessed |
```

---

## 📊 Inbox Stats

|| Metric | Count |
||--------|-------|
|| **Total Unprocessed** | 1 (template only) |
|| **GitHub Stars Pending** | 0 |
|| **Saved Links Pending** | 0 |
|| **Quick Ideas Pending** | 0 |
|| **Processed This Week** | 2 |
|| **Skipped This Week** | 0 |

---

## ⏰ Triage Schedule & Staleness Rules

### Intended Cadence
| Activity | Frequency |
|----------|-----------|
| Quick capture (`/eames-idea-capture`) | Daily (as ideas arise) |
| Process inbox (`/eames-idea-triage inbox`) | Weekly (3-5 items) |
| Stale check (`/eames-idea-triage stale`) | Monthly |

### Staleness Rules
| Age | Status | Action |
|-----|--------|--------|
| **0-14 days** | ✅ Fresh | Normal |
| **14-30 days** | 🟡 Warning | `/eames-idea-triage stats` shows yellow warning |
| **30-60 days** | 🔴 Critical | Strong suggestion to process or skip |
| **60+ days** | 🗑️ Auto-Archive | Moved to "🗑️ Auto-Archived" section |

### Auto-Archive Policy
Items unprocessed for 60+ days are automatically moved to archive with note:
```
| IN-XXX | [Source] | 2026-XX-XX | Auto-Archived | Unprocessed for 60+ days |
```

**To revive:** Manually move back to Unprocessed, reset date.

### Schedule Tracking
**Recommended:** Review inbox weekly
**Last Triaged:** Never
**Next Triage Due:** 2026-01-27

---

*Last Updated: 2026-01-20 22:30:00*
