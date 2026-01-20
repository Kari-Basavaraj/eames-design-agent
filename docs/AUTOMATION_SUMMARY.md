# Idea Management Automation Summary

**Created:** 2026-01-20  
**Commit:** 2f29bad

## What We Built

A **fully automated idea processing workflow** using Claude Code's latest subagent orchestration features.

---

## The Problem

**Before:**
```
❌ User had to run 3 separate commands
❌ Manual steps between each command
❌ Easy to forget which command comes next
❌ Unclear where files are located
❌ No quality examples to follow
```

**User's struggle (from transcript):**
- Typed "analyze IN-003" (wrong syntax)
- Not sure which directory to be in
- Unclear which command to run first
- No end-to-end workflow

---

## The Solution

### 1. Master Orchestration Command

**File:** `.claude/commands/eames-process-idea.md`

```
/eames:process-idea <URL>
```

**What it does:**
- Spawns 2 specialized subagents (capture, analysis)
- Manages full workflow autonomously
- Only asks user once: "Create Linear issue? (y/n)"
- Takes 2-3 minutes total
- Updates 3 files automatically

**Phases:**
1. **Capture** (30s) → Haiku subagent adds to IDEA_INBOX.md
2. **Validate** (5s) → Confirms capture succeeded
3. **Analyze** (2-3min) → Sonnet subagent creates FI-XXX
4. **Linear** (ask user) → Optional issue creation
5. **Report** → Summary with file locations

---

### 2. Specialized Subagents

#### Capture Subagent
**File:** `.claude/agents/eames-capture-subagent.md`

- Model: Haiku (fast, cheap)
- Tools: Read, Write, Edit, Glob, Grep
- Task: Quick capture to IDEA_INBOX.md
- Time: <30 seconds

#### Analysis Subagent
**File:** `.claude/agents/eames-analysis-subagent.md`

- Model: Sonnet (deep reasoning)
- Tools: Read, Write, Edit, Glob, Grep, WebFetch, WebSearch
- Task: Deep analysis → FI-XXX in FEATURE_IDEAS_BACKLOG.md
- Quality: Matches FI-001/FI-002/FI-003 depth
- Includes:
  - Source Health Assessment
  - Vision Alignment scoring (0-25)
  - Agent-Native Principles (0-5)
  - JACKPOT detection (if score ≥20)
  - Feature mapping table
  - Tech stack compatibility
  - Risk assessment
  - What to adopt (3-tier: Critical/High/Medium)
  - What NOT to adopt with reasons
  - Implementation scope
  - Success metrics

---

### 3. Updated Usage Guide

**File:** `docs/IDEA_MANAGEMENT_GUIDE.md`

**Added:**
- Full automation workflow (Option 1)
- Real example based on FI-003
- Explicit file paths
- Time estimates for each command
- "When to use" guidance

**Two workflows now available:**
1. **Full Automation** → `/eames:process-idea <URL>` (3 min)
2. **Manual Steps** → capture → triage → analyze (as before)

---

## Key Features

### 1. Explicit File Paths

All files use **absolute paths**:
```
/Users/basavarajkm/code/eames-design-agent/IDEA_INBOX.md
/Users/basavarajkm/code/eames-design-agent/FEATURE_IDEAS_BACKLOG.md
/Users/basavarajkm/code/eames-design-agent/IDEA_PATTERNS.md
```

No more confusion about "where are the files?"

### 2. Quality Examples

Used FI-003 as quality benchmark:
- 168 lines of detailed analysis
- 12 major sections
- Tables for mapping, risks, alternatives
- Evidence-based scoring

Subagent instructions reference: "Match depth/detail of FI-003 (lines 397-565)"

### 3. Subagent Orchestration

**How it works:**

```
Main Agent (Claude Code)
  └─> Spawns Capture Subagent (isolated context)
      └─> Returns IN-XXX
  └─> Validates capture
  └─> Spawns Analysis Subagent (isolated context)
      └─> Returns FI-XXX + metadata
  └─> Asks user about Linear
  └─> Final summary
```

**Benefits:**
- Main conversation stays clean
- Parallel execution possible
- Token efficiency (isolated contexts)
- Specialized prompts per task

### 4. Linear Integration

Uses Linear MCP to:
- Create issue with `[FI-XXX]` title
- Add description with analysis link
- Set priority/effort labels
- Assign to "Eames Design Agent - LangChain V1.0.0" project
- Return BAS-XXX URL

---

## Real-World Example

**Input:**
```
/eames:process-idea https://ollama.com/blog/claude
```

**Output (3 minutes later):**
```
✅ Idea Processed Successfully

📥 Captured: IN-004 - Ollama v0.14.0 Anthropic Messages API
📊 Analyzed: FI-004 - Ollama v0.14.0 Anthropic Messages API Support
📈 Vision Score: 19/25 (Strongly Aligned)
🎯 Priority: 🟡 High
⏱️  Effort: S (2-8 hours)
🎯 Jackpot: ✅ Hybrid Cloud/Local Strategy
🔗 Linear: https://linear.app/basavaraj-team/issue/BAS-62

📊 Files Updated:
  • IDEA_INBOX.md (IN-004 marked processed)
  • FEATURE_IDEAS_BACKLOG.md (FI-004 added)
  • IDEA_PATTERNS.md (PAT-006 validated)
```

---

## Files Created/Modified

### Created (5 files)
1. `.claude/commands/eames-process-idea.md` - Master command
2. `.claude/agents/eames-capture-subagent.md` - Capture specialist
3. `.claude/agents/eames-analysis-subagent.md` - Analysis specialist
4. `docs/IDEA_MANAGEMENT_GUIDE.md` - Updated guide
5. `docs/AUTOMATION_SUMMARY.md` - This file

### Modified (1 file)
1. `docs/IDEA_MANAGEMENT_GUIDE.md` - Added automation section

---

## How to Use

### Quick Start
```bash
cd ~/code/eames-design-agent
# In Claude Code:
/eames:process-idea https://example.com/article
```

### Manual Control
```bash
# Still available if you prefer step-by-step:
/eames:idea-capture
/eames:idea-triage
/eames:analyze-reference <URL>
```

---

## Technical Implementation

### Subagent YAML Frontmatter

**Capture subagent:**
```yaml
---
name: eames-capture-subagent
description: Fast idea capture to IDEA_INBOX.md
tools: [Read, Write, Edit, Glob, Grep]
model: haiku
---
```

**Analysis subagent:**
```yaml
---
name: eames-analysis-subagent
description: Deep analysis of references against Eames vision
tools: [Read, Write, Edit, Glob, Grep, WebFetch, WebSearch]
model: sonnet
---
```

### Command YAML Frontmatter

```yaml
---
description: End-to-end idea processing with subagent orchestration
tags: [eames, automation, workflow, orchestration]
---
```

---

## Benefits

| Before | After |
|--------|-------|
| 3 manual commands | 1 automated command |
| ~5 minutes + thinking | ~3 minutes autonomous |
| User runs each step | Subagents handle steps |
| Unclear file paths | Explicit absolute paths |
| No quality examples | FI-003 as template |
| Easy to make mistakes | Validated workflow |

---

## Next Steps

### For Users
1. Try: `/eames:process-idea <URL>` with a real article
2. Compare output to FI-003 quality
3. Create Linear issues for high-priority ideas
4. Process IN-003 (Agentic Handbook) that's in inbox

### For Development
1. Monitor subagent performance
2. Adjust prompts based on output quality
3. Add error recovery if subagents fail
4. Consider parallel subagents for speed
5. Add telemetry to track usage

---

## Research References

Based on Claude Code latest features (Jan 2026):

**Key Concepts:**
- **Subagents:** Isolated Claude instances with own context
- **Skills:** Auto-invoked knowledge packages
- **Commands:** User-triggered workflows
- **Hooks:** Lifecycle event automation
- **MCP:** External tool integrations

**Sources:**
- https://code.claude.com/docs/en/sub-agents
- https://www.youngleaders.tech/p/claude-skills-commands-subagents-plugins
- https://alexop.dev/posts/claude-code-customization-guide-claudemd-skills-subagents/
- https://github.com/wshobson/agents (108+ agent examples)

---

## Commit History

```
2f29bad - feat: Add full automation command with subagent orchestration
fb696cd - docs: Add comprehensive idea management workflow guide
a0f8cc0 - (previous migration work)
```

---

**Status:** ✅ Complete and deployed  
**Next:** Use it for real ideas!
