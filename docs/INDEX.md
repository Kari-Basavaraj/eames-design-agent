# Eames Documentation Index

**Last Updated:** 2026-01-20
**Branch:** main

## 📚 Quick Navigation

### Essential Reading
- **[../README.md](../README.md)** - Main README (LangChain version)
- **[../WARP.md](../WARP.md)** - Master context for AI coding agents
- **[../AGENTS.md](../AGENTS.md)** - Universal agent context (same as WARP.md)
- **[../CLAUDE.md](../CLAUDE.md)** - Claude Code compatibility (same as WARP.md)

---

## 🏗️ v2.0 Architecture

**Location:** `docs/v2.0-architecture/`

### Core Architecture Documents
- **[EAMES_V2_ARCHITECTURE_LANGCHAIN.md](v2.0-architecture/EAMES_V2_ARCHITECTURE_LANGCHAIN.md)** - LangChain implementation (1,011 lines)
  - LLM Council with 6 specialized roles
  - Multi-provider support (Claude, OpenAI, Google, Ollama)
  - LangGraph workflows
  - Vector memory integration
  - 12-week implementation roadmap

- **[EAMES_V2_ARCHITECTURE_SDK.md](v2.0-architecture/EAMES_V2_ARCHITECTURE_SDK.md)** - Claude SDK implementation (1,056 lines)
  - Hierarchical Skills system (`.eames/skills/`)
  - Sub-agents with context forking
  - Claude Code CLI features
  - Session persistence

- **[EAMES_V2_ARCHITECTURE_WEBAPP.md](v2.0-architecture/EAMES_V2_ARCHITECTURE_WEBAPP.md)** - Web app implementation (1,078 lines)
  - A2UI/AG-UI protocols
  - Real-time collaboration
  - Browser-based interface

- **[EAMES_V2_ARCHITECTURE.md](v2.0-architecture/EAMES_V2_ARCHITECTURE.md)** - Original unified architecture
  - Intent Understanding (Stage 0)
  - Ask/Plan/Execute modes
  - Adaptive phase routing

### Repository Strategy
- **[REPOSITORY_STRATEGY.md](v2.0-architecture/REPOSITORY_STRATEGY.md)** - Branch and version management
- **[VERSIONING_STRATEGY.md](v2.0-architecture/VERSIONING_STRATEGY.md)** - Tagging and release process

---

## 🔬 Research

**Location:** `docs/research/`

### Agentic Patterns
- **[ralph-wiggum-agentic-coding-playbook.md](research/ralph-wiggum-agentic-coding-playbook.md)** - Ralph Wiggum loop patterns
- **[The compelete Ralph Wiggum Agentic Coding Research-Claude Desktop.md](research/The compelete Ralph Wiggum Agentic Coding Research-Claude Desktop.md)** - Full research
- **[conduct deep research on Ralph Wiggum agentic codi.md](research/conduct deep research on Ralph Wiggum agentic codi.md)** - Research process

### UI/UX Protocols
- **[A2UI_RESEARCH.md](research/A2UI_RESEARCH.md)** - A2UI protocol research
- **[The Agentic UI Stack - A Systems Map for AI-Native Interfaces.md](research/The Agentic UI Stack - A Systems Map for AI-Native Interfaces.md)** - Agentic UI systems

### LLM Council
- **[llm-council-design-leadership-guide.md](research/llm-council-design-leadership-guide.md)** - Council patterns for design

---

## 📋 Planning & Vision

**Location:** `docs/planning/`

### Vision Documents
- **[EAMES_COMPLETE_VISION.md](planning/EAMES_COMPLETE_VISION.md)** - Complete project vision
- **[EAMES_VS_CLAUDE_CODE.md](planning/EAMES_VS_CLAUDE_CODE.md)** - Feature parity analysis
- **[EAMES_VISION_ROADMAP.md](planning/EAMES_VISION_ROADMAP.md)** - Product roadmap

### Evolution (v1.0 → v2.0)
- **[Eames-Building an AI Product Design AgentV1.0.md](planning/Eames-Building an AI Product Design AgentV1.0.md)** - Original concept
- **[Eames-Building an AI Product Design AgentV1.1.md](planning/Eames-Building an AI Product Design AgentV1.1.md)** - Iteration 1
- **[Eames_Building_AI_Product_Design_Agent_V1.2.md](planning/Eames_Building_AI_Product_Design_Agent_V1.2.md)** - Iteration 2
- **[EAMES_2.0_REWRITE_PLAN.md](planning/EAMES_2.0_REWRITE_PLAN.md)** - v2.0 rewrite plan
- **[EAMES_1.0_SUNSET.md](planning/EAMES_1.0_SUNSET.md)** - v1.0 sunset plan

---

## 🗄️ Archive

**Location:** `docs/archive/`

Old implementation plans, UI rewrites, and obsolete analysis documents have been moved here for reference.

### Key Archived Documents
- `COMPLETE_REWRITE_REQUIRED.md` - Root cause analysis
- `LANGCHAIN_VS_SDK_COMPLETE.md` - Technology comparison
- Various UI/UX rewrite plans
- Claude Code parity analyses
- SDK integration status documents

---

## 📂 Examples

**Location:** `examples/`

Generated demo applications from Eames:
- `designer-todo-app/` - Designer-focused todo app
- `school-notes-app/` - School notes application
- `kids-notes-app/` - Kids notes application
- `netflix-app/` - Netflix-style UI
- `todo-app/` - Simple todo application
- `demos/` - Various demos

---

## 🔧 Current Documentation

**Location:** `docs/` (existing files)

- **[ROADMAP.md](ROADMAP.md)** - Current development roadmap
- **[PROGRESS_TRACKER.md](PROGRESS_TRACKER.md)** - Implementation progress
- **[EAMES_VISION.md](EAMES_VISION.md)** - Core vision statement
- **[EXECUTIVE_BRIEF.md](EXECUTIVE_BRIEF.md)** - Executive summary
- **[CLAUDE_AGENT_SDK_INTEGRATION_PLAN.md](CLAUDE_AGENT_SDK_INTEGRATION_PLAN.md)** - SDK integration
- **[CLAUDE_CODE_UI_FEATURES.md](CLAUDE_CODE_UI_FEATURES.md)** - UI feature set
- **[MCP_TROUBLESHOOTING.md](MCP_TROUBLESHOOTING.md)** - MCP debugging
- **[AMPcode_fixes.md](AMPcode_fixes.md)** - Code fixes

---

## 🔀 Migration Documentation

**Date:** 2026-01-20

Repository migration from `langchain` → `main` branch structure.

- **[MIGRATION_REPORT_2026-01-20.md](MIGRATION_REPORT_2026-01-20.md)** - Comprehensive migration report
  - Problem statement and alternatives considered
  - Git branch migration steps and backup tags
  - Linear project updates
  - Documentation changes
  - Verification checklist
  - Lessons learned

- **[../MIGRATION_ROLLBACK.md](../MIGRATION_ROLLBACK.md)** - Rollback procedure
  - Quick restore from tags
  - Full backup restore option
  - Recovery commands

---

## 📊 Project Management

### Linear
- **Main Project (V1.1.0)**: [Eames Design Agent V1.1.0](https://linear.app/basavaraj-team/project/eames-design-agent-v110-10213d90db52)
- **SDK Project**: [Eames Design Agent SDK](https://linear.app/basavaraj-team/project/eames-design-agent-sdk-93b410b37929)

### GitHub
- **Repository**: https://github.com/Kari-Basavaraj/eames-design-agent
- **Branches**: `main` (active), `sdk` (future), `archive/original-hybrid`

---

## 🎯 For New Contributors

Start here:
1. Read [../WARP.md](../WARP.md) for complete context
2. Review [v2.0-architecture/EAMES_V2_ARCHITECTURE_LANGCHAIN.md](v2.0-architecture/EAMES_V2_ARCHITECTURE_LANGCHAIN.md) for architecture
3. Check [Linear project](https://linear.app/basavaraj-team/project/eames-design-agent-v110-10213d90db52) for current issues
4. See [ROADMAP.md](ROADMAP.md) for current sprint

---

**Note**: This is the `main` branch (active development). For SDK version, switch branches:
```bash
git checkout sdk      # Claude SDK version (future)
```
