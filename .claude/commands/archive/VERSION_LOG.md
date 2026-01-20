# Eames Slash Command Version Log

**Last Updated:** 2026-01-20 15:45:00

## Purpose
Track versions of Eames-specific slash commands for rollback and history reference.

---

## eames-analyze-reference.md

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| v3 | 2026-01-20 | Full lifecycle tracking (262→368 lines). 20-step process. Added: Inbox check, Source Health Assessment, Pattern Detection, Effort Estimation, Alternatives, Implementation Scope, Success Metrics, File sync updates. | Claude + User |
| v2 | 2026-01-20 | Deep Eames integration (208→262 lines). Added Agent-Native principles check (/5). Added Tech Stack Alignment (LangGraph, DeepAgents, CompositeBackend). Phase mapping now includes subagent fit. THE MOAT emphasis (Clarification Loop). V1.1.0 phase references (0-7). Smart Linear labeling. | Claude + User |
| v1 | 2026-01-20 | Optimized version (182→208 lines). Added WebFetch, Grep, Linear MCP tools. Added success_criteria, verification, output tags. Restricted Bash. Added risk assessment step. | Claude + User |

---

## eames-idea-capture.md

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| v1 | 2026-01-20 | Initial version. Quick capture to IDEA_INBOX.md. Auto-detect type (GitHub/Article/Video/Note). GitHub metadata fetch. Dashboard + stats update. | Claude + User |

---

## eames-idea-triage.md

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| v1 | 2026-01-20 | Initial version. 4 modes: stats, inbox, backlog, stale. Dashboard display. Staleness detection. Batch actions. | Claude + User |

---

## Supporting Files

| File | Version | Date | Changes |
|------|---------|------|---------|
| FEATURE_IDEAS_BACKLOG.md | v1 | 2026-01-20 | Complete lifecycle template. 12 status types. Effort estimates. Pattern links. Decision log. |
| IDEA_INBOX.md | v1 | 2026-01-20 | Quick capture. GitHub stars queue. Saved links. Auto-archive rules. |
| IDEA_PATTERNS.md | v1 | 2026-01-20 | Pattern tracking. Detection mechanism. 5 initial patterns. |

### Rollback Instructions
```bash
# Rollback eames-analyze-reference to v3:
cp .claude/commands/archive/2026-01-20/eames-analyze-reference.v3.md .claude/commands/eames-analyze-reference.md

# Rollback eames-analyze-reference to v2:
cp .claude/commands/archive/2026-01-20/eames-analyze-reference.v2.md .claude/commands/eames-analyze-reference.md

# Rollback supporting files to v1:
cp .claude/commands/archive/2026-01-20/FEATURE_IDEAS_BACKLOG.v1.md FEATURE_IDEAS_BACKLOG.md
cp .claude/commands/archive/2026-01-20/IDEA_INBOX.v1.md IDEA_INBOX.md
cp .claude/commands/archive/2026-01-20/IDEA_PATTERNS.v1.md IDEA_PATTERNS.md
cp .claude/commands/archive/2026-01-20/eames-idea-capture.v1.md .claude/commands/eames-idea-capture.md
cp .claude/commands/archive/2026-01-20/eames-idea-triage.v1.md .claude/commands/eames-idea-triage.md
```

---

## Versioning Strategy
- **v1, v2, v3**: Major structural changes
- **v1.1, v1.2**: Minor improvements
- Archive folder format: `YYYY-MM-DD/command-name.vX.md`

## Sync Across Branches
This archive should be synced to all branches: `main`, `langchain`, `sdk`
