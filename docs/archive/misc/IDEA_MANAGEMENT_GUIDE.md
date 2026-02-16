# Eames Idea Management Guide

**Last Updated:** 2026-01-20

Complete step-by-step guide for capturing, triaging, and analyzing ideas using Claude Code commands.

---

## Prerequisites

**Location:** You MUST be in the eames-design-agent directory:
```bash
cd /Users/basavarajkm/code/eames-design-agent
```

**Files involved:**
- `IDEA_INBOX.md` - Quick capture inbox
- `FEATURE_IDEAS_BACKLOG.md` - Analyzed ideas with full details
- `IDEA_PATTERNS.md` - Cross-cutting patterns

---

## Two Workflows Available

### Option 1: Full Automation (Recommended)
```
/eames:process-idea <URL>
  → Auto-captures, analyzes, asks about Linear
  → One command, 2-3 minutes, done!
```

### Option 2: Manual Step-by-Step
```
┌─────────────────┐
│  1. CAPTURE     │  /eames:idea-capture
│  (INBOX)        │  Quick save URL/note
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  2. TRIAGE      │  /eames:idea-triage
│  (REVIEW)       │  Check what's pending
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  3. ANALYZE     │  /eames:analyze-reference
│  (BACKLOG)      │  Deep analysis → FI-XXX
└─────────────────┘
```

---

## 🚀 Quick Start: Full Automation

### Command
```
/eames:process-idea <URL>
```

### What It Does
Orchestrates the entire workflow with subagents:
1. **Capture** → Adds to IDEA_INBOX.md (30 seconds)
2. **Validate** → Confirms capture (5 seconds)
3. **Analyze** → Deep analysis, creates FI-XXX (2-3 minutes)
4. **Linear** → Asks if you want to create issue
5. **Report** → Shows summary

### When to Use
- You have a URL ready to process
- Want end-to-end automation
- Don't need to batch multiple ideas

### Example
```
You: /eames:process-idea https://ollama.com/blog/claude

[Subagents work autonomously...]

Create Linear issue? (y/n)
You: y

✅ Done! FI-004 created, BAS-62 in Linear
```

**Total Time:** ~3 minutes  
**Your Input:** URL + Linear decision (y/n)

---

## 📝 Manual Workflow (Step-by-Step)

### When to Use Manual Steps
- Capturing multiple ideas in batch
- Want to review inbox before analyzing
- Prefer more control over each phase

---

## Step 1: Capture an Idea

### Command
```
/eames:idea-capture
```

### When to use
- Found an interesting article/repo
- Want to save a quick thought
- Saw something on GitHub worth investigating

### Process
1. **Run command** (from any directory)
2. **Select type:**
   - Article/Link - Paste URL
   - GitHub Repo - Paste repo URL
   - Quick Idea - Type your thought

3. **Answer prompts:**
   - Quick note: Why is this interesting? (or skip)
   - Tags: ai-agents, patterns, etc.
   - Project: Usually "eames"

4. **Result:** New entry in `IDEA_INBOX.md` with ID (IN-001, IN-002, etc.)

### Example Session
```
You: /eames:idea-capture

Claude: What would you like to capture?
You: Article/Link

Claude: Please paste the URL:
You: https://www.nibzard.com/agentic-handbook

Claude: Quick note on why this is interesting?
You: Skip

Claude: Tags for this article?
You: ai-agents, patterns, architecture

Claude: Which project?
You: eames

✅ Captured: IN-003 - The Agentic AI Handbook
📥 Added to IDEA_INBOX.md
💡 Next: Run /eames:analyze-reference [URL] for full analysis
```

---

## Step 2: Triage Your Inbox

### Command
```
/eames:idea-triage
```

### When to use
- Check what's in your inbox
- See overall system health
- Find what needs analysis

### What you'll see
```
📊 IDEA SYSTEM DASHBOARD
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
INBOX
  📥 Unprocessed: 2
  ⏰ Oldest: 0 days

BACKLOG
  Total: 3  ✅ Analyzed: 3

PATTERNS
  Total: 6  ✅ Validated: 1

RECOMMENDATIONS
1. Process IN-003 with /eames:analyze-reference
2. Clean up template IN-001
```

### Options
```
/eames:idea-triage                  # Default: stats dashboard
/eames:idea-triage inbox            # Show inbox items
/eames:idea-triage stale            # Check stale items
```

---

## Step 3: Analyze a Reference

### Command
```
/eames:analyze-reference <URL>
```

### When to use
- After capturing an idea in inbox
- Want deep analysis of a reference
- Ready to promote inbox item to backlog

### Process
1. **Get URL from triage output**
   - Copy the URL from the recommendation
   
2. **Run analysis:**
   ```
   /eames:analyze-reference https://www.nibzard.com/agentic-handbook
   ```

3. **Claude will:**
   - Fetch and analyze the content
   - Score against Eames vision (out of 25)
   - Extract actionable insights
   - Create FI-XXX entry in FEATURE_IDEAS_BACKLOG.md
   - Update patterns if needed
   - Ask if you want to create Linear issue

4. **Result:** 
   - New FI-XXX in backlog
   - Inbox item marked as processed
   - Optional Linear issue created

### Example Output
```
✅ Analysis Complete

Summary:
┌─────────────┬──────────────────────────────────┐
│ Field       │ Value                            │
├─────────────┼──────────────────────────────────┤
│ FI-004      │ Agentic AI Handbook Patterns     │
│ Vision      │ 20/25 (Strongly Aligned)         │
│ Agent-Native│ 5/5                              │
│ Priority    │ High                             │
│ Effort      │ M (1-3 days)                     │
└─────────────┴──────────────────────────────────┘

Create Linear issue? (y/n)
```

---

## Common Issues & Solutions

### Issue 1: "I typed 'analyze IN-003' and nothing happened"
**Problem:** Not using slash command syntax
**Solution:** Use `/eames:analyze-reference <URL>`, not plain text

### Issue 2: "File not found error"
**Problem:** Wrong directory
**Solution:** 
```bash
cd /Users/basavarajkm/code/eames-design-agent
# Then run command
```

### Issue 3: "Which file should I use?"
**Answer:**
- `IDEA_INBOX.md` - Auto-managed by commands
- `FEATURE_IDEAS_BACKLOG.md` - Auto-managed by commands
- `IDEA_PATTERNS.md` - Auto-managed by commands
- **You don't edit these manually** (unless needed)

### Issue 4: "Can I run commands from anywhere?"
**Answer:** 
- `/eames:idea-capture` - Works from anywhere
- `/eames:idea-triage` - Best from eames-design-agent directory
- `/eames:analyze-reference` - Best from eames-design-agent directory

---

## Quick Reference Card

### Daily Workflow
```bash
# 1. Morning: Check inbox
cd ~/code/eames-design-agent
# In Claude Code:
/eames:idea-triage

# 2. Capture ideas throughout the day
# From anywhere in Claude Code:
/eames:idea-capture

# 3. Evening: Process inbox
/eames:analyze-reference <URL>
```

### All Commands
| Command | Purpose | Location | Time |
|---------|---------|----------|------|
| `/eames:process-idea <URL>` | **Full automation** | eames-design-agent | 3min |
| `/eames:idea-capture` | Save idea to inbox | Anywhere | 30s |
| `/eames:idea-triage` | Review inbox status | eames-design-agent | 10s |
| `/eames:analyze-reference <URL>` | Deep analysis | eames-design-agent | 2-3min |

---

## File Locations

All files are in: `/Users/basavarajkm/code/eames-design-agent/`

```
eames-design-agent/
├── IDEA_INBOX.md              ← Quick captures (IN-XXX)
├── FEATURE_IDEAS_BACKLOG.md   ← Analyzed ideas (FI-XXX)
├── IDEA_PATTERNS.md           ← Recurring patterns (PAT-XXX)
└── docs/
    └── IDEA_MANAGEMENT_GUIDE.md  ← This guide
```

---

## What Happens to Each Idea?

### Lifecycle
```
1. Capture     → IN-XXX created in INBOX
2. Triage      → See it in dashboard
3. Analyze     → Becomes FI-XXX in BACKLOG
4. (Optional)  → Create Linear issue (BAS-XXX)
5. (Later)     → Implement from backlog
```

### ID Prefixes
- **IN-XXX** - Inbox item (unprocessed)
- **FI-XXX** - Feature idea (analyzed)
- **PAT-XXX** - Pattern (cross-cutting theme)
- **BAS-XXX** - Linear issue (when promoted)

---

## Tips

1. **Capture liberally** - Don't filter while capturing
2. **Triage daily** - Keep inbox under 10 items
3. **Analyze weekly** - Process 2-3 items per week
4. **Create Linear issues** - Only for high-priority items you'll implement soon

---

## Example: Full Session

```bash
# Terminal
cd ~/code/eames-design-agent

# Claude Code
/eames:idea-capture
→ Type: Article/Link
→ URL: https://example.com/cool-article
→ Tags: ai-agents
→ Project: eames
✅ Created IN-003

/eames:idea-triage
→ See IN-003 in unprocessed
→ Shows: "Run /eames:analyze-reference https://example.com/cool-article"

/eames:analyze-reference https://example.com/cool-article
→ Analysis runs...
→ Creates FI-004 in backlog
→ "Create Linear issue? y"
→ Creates BAS-60
✅ Complete
```

---

## Getting Help

If commands don't work:
1. Check you're in the right directory
2. Use exact slash command syntax
3. Don't type commands as plain text
4. Check WARP.md rules are loaded

---

*This guide is for Claude Code commands. For Warp AI, these patterns are integrated via WARP.md rules.*
