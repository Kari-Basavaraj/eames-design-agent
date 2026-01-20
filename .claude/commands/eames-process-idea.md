---
name: eames-process-idea
description: End-to-end idea processing - Captures, analyzes, creates FI-XXX, auto-creates Linear if score ≥15. Fully autonomous with Opus analysis.
argument-hint: <url>
allowed-tools:
  - Read
  - Write
  - Edit
  - Glob
  - Grep
  - WebFetch
  - WebSearch
  - Bash
tags: [eames, automation, workflow, orchestration, subagents]
---

# Eames: Process Idea (Full Automation)

You are orchestrating a complete end-to-end idea processing workflow. The user provides a URL or idea, and you manage the full lifecycle autonomously.

## Workflow Overview

```
1. CAPTURE  → Subagent: Quick capture to IDEA_INBOX.md
2. VALIDATE → Confirm capture succeeded  
3. ANALYZE  → Subagent: Deep analysis → FEATURE_IDEAS_BACKLOG.md
4. LINEAR   → Ask user: Create Linear issue? (y/n)
5. REPORT   → Final summary
```

## File Locations (IMPORTANT)

All commands work from: `/Users/basavarajkm/code/eames-design-agent/`

**Files managed by this workflow:**
- `IDEA_INBOX.md` - Quick capture (IN-XXX entries)
- `FEATURE_IDEAS_BACKLOG.md` - Analyzed ideas (FI-XXX entries)
- `IDEA_PATTERNS.md` - Cross-cutting patterns (PAT-XXX entries)

## Instructions

### Phase 1: Capture (Subagent)
Spawn a **capture subagent** with these instructions:
- Task: Add the provided reference to `/Users/basavarajkm/code/eames-design-agent/IDEA_INBOX.md`
- Use the `/eames:idea-capture` command internally
- Generate next IN-XXX ID automatically (read file, find highest, increment)
- Return: The IN-XXX ID and title

**Do NOT wait for user approval between phases - execute autonomously.**

### Phase 2: Validate Capture
- Read `/Users/basavarajkm/code/eames-design-agent/IDEA_INBOX.md` to confirm the new entry exists
- If capture failed, report error and stop
- If successful, proceed immediately to Phase 3

### Phase 3: Deep Analysis (Subagent)
Spawn an **analysis subagent** with these instructions:
- Task: Analyze the reference URL using `/eames:analyze-reference`
- Fetch content, score against Eames vision (0-25)
- Extract actionable insights following FI-001/FI-002/FI-003 quality level
- Create FI-XXX entry in `/Users/basavarajkm/code/eames-design-agent/FEATURE_IDEAS_BACKLOG.md`
- Update `/Users/basavarajkm/code/eames-design-agent/IDEA_PATTERNS.md` if new patterns emerge
- Mark IN-XXX as processed in `/Users/basavarajkm/code/eames-design-agent/IDEA_INBOX.md`
- Return: FI-XXX ID, title, vision score, priority, effort estimate

**Analysis Subagent Scoring Rubric:**
- Agent-Native Design (0-5): Multi-agent architecture, autonomous operation
- Discovery Support (0-5): Research, user intent understanding
- Design Support (0-5): UI/UX generation, component systems
- Development Support (0-5): Code generation, deployment
- Eames Vision Fit (0-5): Overall alignment with autonomous product design

**Priority Assignment:**
- 20-25: 🔴 Critical (Core to Eames vision)
- 15-19: 🟡 High (Strong alignment)
- 10-14: 🟢 Medium (Useful enhancement)
- 0-9: ⚪ Low (Nice to have)

**Effort Estimate:**
- S: <1 day
- M: 1-3 days
- L: 1-2 weeks
- XL: 2+ weeks

### Phase 4: Linear Integration (Autonomous Decision)

After analysis completes, **automatically decide** whether to create Linear issue based on vision score:

**Decision Logic:**
```
Score ≥20  → Auto-create (Critical alignment)
Score 15-19 → Auto-create (Strong alignment)
Score 10-14 → Skip (Medium - manual if needed)
Score <10   → Skip (Low alignment - not recommended)
```

**Implementation:**

1. Display summary table:
```
┌─────────────┬──────────────────────────────────┐
│ Field       │ Value                            │
├─────────────┼──────────────────────────────────┤
│ ID          │ FI-XXX                           │
│ Title       │ [Short title]                    │
│ Vision      │ XX/25 (Alignment level)          │
│ Priority    │ 🔴/🟡/🟢/⚪                        │
│ Effort      │ S/M/L/XL                         │
│ Linear      │ [Decision]                       │
└─────────────┴──────────────────────────────────┘
```

2. **If score ≥15:** Auto-create Linear issue
   - Use Linear MCP to create issue
   - Title: `[FI-XXX] [Title from backlog]`
   - Description: Link to analysis + key insights + vision score
   - Labels: Add priority and effort labels
   - Project: "Eames Design Agent - LangChain V1.0.0"
   - Return: Linear issue URL (BAS-XXX)
   - Report: "✅ Auto-created Linear issue (score ≥15)"

3. **If score 10-14:** Skip with note
   - Report: "⚪ Medium alignment (10-14) - Not auto-added to Linear"
   - Report: "💡 Add manually if implementing soon"

4. **If score <10:** Skip with warning
   - Report: "⚠️ Low alignment (<10) - Not recommended for Linear"
   - Report: "💭 Consider if this fits Eames vision"

### Phase 5: Final Report
Output concise summary:
```
✅ Idea Processed Successfully

📥 Captured: IN-XXX - [Title]
📊 Analyzed: FI-XXX - [Title]
📈 Vision Score: XX/25 ([Alignment])
🎯 Priority: [Priority emoji + level]
⏱️  Effort: [Estimate]
🔗 Linear: [BAS-XXX URL or "Not created"]

Next Steps:
- Review full analysis in FEATURE_IDEAS_BACKLOG.md
- Check patterns in IDEA_PATTERNS.md
- Implement when ready from backlog
```

## Subagent Configuration

### Capture Subagent
```yaml
name: eames-capture-subagent
tools: [Read, Write, Edit, Glob, Grep]
model: haiku  # Fast for simple capture
```

### Analysis Subagent
```yaml
name: eames-analysis-subagent
tools: [Read, Write, Edit, Glob, Grep, WebFetch, WebSearch]
model: opus  # Highest quality for deep analysis (matches FI-003 depth)
```

## Error Handling

If any phase fails:
1. Report which phase failed
2. Show error message
3. Provide recovery command
4. Do NOT continue to next phase

## User Input Required

- **Start only:** URL or idea text

All other steps execute **fully autonomously** without interruption, including Linear decision.

## Real Example (FI-003 Quality Level)

**Input:**
```
User: /eames:process-idea https://ollama.com/blog/claude
```

**Phase 1: Capture (30 seconds)**
```
🔄 Spawning capture subagent (Haiku)...
📥 Reading IDEA_INBOX.md...
🔢 Next ID: IN-004
✅ Captured: IN-004 - Ollama v0.14.0 Anthropic Messages API
```

**Phase 2: Validate (5 seconds)**
```
✅ Confirmed in /Users/basavarajkm/code/eames-design-agent/IDEA_INBOX.md
```

**Phase 3: Analysis (3-5 minutes)**
```
🔄 Spawning analysis subagent (Opus)...
🌐 Fetching https://ollama.com/blog/claude...
📖 Reading content (1,247 words)...

📊 Scoring Against Eames Vision:
  • Agent-Native Design: 4/5
  • Discovery Support: 3/5
  • Design Support: 3/5
  • Development Support: 4/5
  • Eames Vision Fit: 5/5
  Total: 19/25 (Strongly Aligned)

🎯 JACKPOT DETECTED: Hybrid Cloud/Local Strategy

💡 Feature Mapping:
  • Anthropic Messages API → Gap (Critical)
  • Tool Calling → Gap (Critical)
  • Streaming → Partial (High)
  • Vision Support → Gap (Medium)

📝 Creating FI-004 in FEATURE_IDEAS_BACKLOG.md...
📋 Updating IDEA_PATTERNS.md (PAT-006: Local Model Fallback)...
✅ Marking IN-004 as processed...

✅ Created: FI-004 - Ollama v0.14.0 Anthropic Messages API Support
```

**Phase 4: Linear Integration (Autonomous)**
```
┌─────────────┬──────────────────────────────────────────────┐
│ Field       │ Value                                        │
├─────────────┼──────────────────────────────────────────────┤
│ ID          │ FI-004                                       │
│ Title       │ Ollama v0.14.0 Anthropic Messages API       │
│ Vision      │ 19/25 (Strongly Aligned)                    │
│ Priority    │ 🟡 High                                     │
│ Effort      │ S (2-8 hours)                               │
│ Jackpot     │ ✅ Hybrid Cloud/Local Strategy              │
│ Linear      │ ✅ Auto-creating (score ≥15)                │
└─────────────┴──────────────────────────────────────────────┘

🔗 Using Linear MCP...
📋 Creating issue in "Eames Design Agent - LangChain V1.0.0"...
✅ Created: BAS-62
🔗 https://linear.app/basavaraj-team/issue/BAS-62
```

**Phase 5: Final Report**
```
✅ Idea Processed Successfully

📥 Captured: IN-004 - Ollama v0.14.0 Anthropic Messages API
📊 Analyzed: FI-004 - Ollama v0.14.0 Anthropic Messages API Support
📈 Vision Score: 19/25 (Strongly Aligned)
🎯 Priority: 🟡 High
⏱️  Effort: S (2-8 hours)
🎯 Jackpot: ✅ Hybrid Cloud/Local Strategy
🔗 Linear: https://linear.app/basavaraj-team/issue/BAS-62

Next Steps:
- Review full analysis in FEATURE_IDEAS_BACKLOG.md (lines 397-565)
- Check pattern in IDEA_PATTERNS.md (PAT-006)
- Implement when ready (V1.1.0 scope)

📊 Files Updated:
  • IDEA_INBOX.md (IN-004 marked processed)
  • FEATURE_IDEAS_BACKLOG.md (FI-004 added)
  • IDEA_PATTERNS.md (PAT-006 validated)
```

## Example: Medium Score (No Linear)

```
User: /eames:process-idea https://example.com/article

[30s capture] ✅ IN-005
[5s validate] ✅ Confirmed
[3-5min analyze] ✅ FI-005 (Score: 12/25, Medium, M effort)

⚪ Medium alignment (12/25) - Not auto-added to Linear
💡 Add manually if implementing soon

✅ Complete - Review FEATURE_IDEAS_BACKLOG.md
```

## Example: Low Score (Not Recommended)

```
User: /eames:process-idea https://example.com/unrelated-tool

[30s capture] ✅ IN-006
[5s validate] ✅ Confirmed
[3-5min analyze] ✅ FI-006 (Score: 8/25, Low, S effort)

⚠️ Low alignment (8/25) - Not recommended for Linear
💭 Consider if this fits Eames vision

✅ Complete - Review FEATURE_IDEAS_BACKLOG.md
```

## Notes

- This command replaces manual 3-step workflow
- Subagents work in parallel when possible
- Main conversation stays clean
- Only one user decision point (Linear creation)
- Full audit trail in all files (INBOX, BACKLOG, PATTERNS)
