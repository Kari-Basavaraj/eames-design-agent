# Updated: 2026-01-18 16:50:00
# EAMES DESIGN AGENT - MASTER CONTEXT FOR AI CODING AGENTS

> **⚠️ READ THIS FIRST when starting ANY new session with ANY coding agent**
>
> **Supported agents:** Claude Code, Cursor, Windsurf, Aider, Continue, Warp AI, GitHub Copilot, etc.

## 📝 Which File To Read?

- **AGENTS.md** / **CLAUDE.md** / **WARP.md** - Same content, synced
- **MASTER_IMPLEMENTATION_PLAN_V1.1.0.md** - Complete implementation blueprint

## 🚨 CURRENT STATUS (2026-01-18)

**✅ V1.1.0 PLAN COMPLETE:** Unified DeepAgents + LangGraph architecture defined
**📍 YOU ARE ON:** `langchain` branch
**🎯 NEXT STEPS:** Execute Phase 0 (Foundation, Days 1-10)

---

## 🎯 Vision

**Eames** is an end-to-end Autonomous Product Design Agent: **Discovery → Delivery**.
- Outputs production-ready, tested code deployed to Netlify/Vercel
- Two implementations: LangChain (flexible) + Claude SDK (production-ready)
- GitHub-first workflow with automated deployment
- Full product design lifecycle: Research → PRD → UI/UX → Code → Live Link

---

## 📊 REPOSITORY STRATEGY

### Current State
```
eames-design-agent/
├── main (branch)      ← Archive (hybrid state)
├── langchain (branch) ← Pure LangChain version  
└── sdk (branch)       ← Pure Claude SDK version
```

### Versioning
- **Branch names:** `langchain` and `sdk` (stay constant)
- **Tag names:** `langchain-v1.0.0`, `sdk-v1.0.0`, etc. (track versions)
- **See:** `VERSIONING_STRATEGY.md` for complete details

### V1.1.0 Architecture (Current)

The unified plan combines the best of all research into a **Hybrid Architecture**:

1. **Custom LangGraph Orchestrator** - 5-phase workflow control with approval gates
2. **DeepAgents Phase Agents** - Battle-tested planning, memory, and subagents
3. **Eames Brain 2.0** - Domain intelligence (design + engineering prompts)
4. **Filesystem as Universal Interface** - CompositeBackend for hybrid storage

**Key Outcomes:**
- ✅ Discovery → Define → Design → Develop → Deliver phases
- ✅ <$1 per app with prompt caching
- ✅ <15 minutes end-to-end
- ✅ GitHub + Vercel/Netlify deployment
- ✅ Human approval checkpoints (PRD, deployment)

---

## 🔄 HOW TO SWITCH BRANCHES (Simple Guide for Non-Engineers)

### See What Branch You're On
```bash
git branch --show-current
```
This shows: `main`, `langchain`, or `sdk`

### Switch to LangChain Version
```bash
cd /Users/basavarajkm/code/eames-design-agent
git checkout langchain
```
✅ Now you're on LangChain version. All your files changed automatically!

### Switch to SDK Version
```bash
git checkout sdk
```
✅ Now you're on SDK version. Files changed again!

### Go Back to Main (Archive)
```bash
git checkout main
```

### After Switching Branches
```bash
# Always install dependencies after switching
bun install

# Then you can run
bun start
```

### Important Rules
1. **Save your work first:** Before switching, commit or stash changes
2. **One branch at a time:** You can only work on one branch at a time
3. **Files change automatically:** When you switch, your files update automatically
4. **Don't panic:** You can always switch back

### Quick Reference Card
```bash
# Where am I?
git branch --show-current

# Switch to LangChain
git checkout langchain

# Switch to SDK
git checkout sdk

# Install after switching
bun install

# Run the code
bun start
```

### Troubleshooting

**Error: "Your local changes would be overwritten"**
```bash
# Save your changes first
git add .
git commit -m "WIP: saving progress"

# Now you can switch
git checkout langchain
```

**Error: "Branch not found"**
```bash
# Get latest branches from GitHub
git fetch origin

# Try again
git checkout langchain
```

**Want to see all branches?**
```bash
git branch -a
```

### What AI Agents Should Do

When user asks to work on a version:
1. Ask: "Which version? (langchain or sdk)"
2. Run: `git checkout [branch]`
3. Run: `bun install`
4. Confirm: "Now on [branch] branch, ready to work!"

---

## 📚 KEY DOCUMENTS (Priority Order)

### Start Here
1. **THIS FILE** (`AGENTS.md`) - Master context, read every session
2. **`MASTER_IMPLEMENTATION_PLAN_V1.1.0.md`** - Complete implementation blueprint (READ THIS!)
3. `docs/EAMES_VISION.md` - Original vision document

### Reference (As Needed)
- `docs/research/` - Research findings and analysis
- `WARP.md` - Warp-specific development instructions

---

## 🚀 IMMEDIATE ACTIONS (Phase 0)

**Execute V1.1.0 Phase 0: Foundation (Days 1-10)**

See `MASTER_IMPLEMENTATION_PLAN_V1.1.0.md` for complete details.

**Quick Start:**
```bash
cd /Users/basavarajkm/code/eames-design-agent
git checkout langchain

# Install dependencies
bun install

# Start PostgreSQL
docker run -d --name eames-postgres \
  -e POSTGRES_PASSWORD=eames \
  -p 5432:5432 \
  postgres:16-alpine

# Configure environment
cp env.example .env  # Add API keys

# Run
bun start
```

**Phase 0 Goals:**
- [ ] DeepAgent "Hello World" working
- [ ] CompositeBackend routing verified
- [ ] LangSmith traces appearing
- [ ] Basic Ink CLI shell

---

## 🎯 PRODUCT DESIGN LIFECYCLE (Both Versions)

### Phase 1: Discovery 🔍
- Research competitors, market trends, user needs
- Tools: search_competitors, analyze_market
- Output: Research synthesis, pain points

### Phase 2: Define 📋  
- Generate PRD, user stories, requirements
- Tools: generate_prd, create_user_stories
- Output: PRD document, acceptance criteria

### Phase 3: Design 🎨
- Create UI/UX, wireframes, components
- Tools: generate_wireframes, create_components
- Output: Component specs, design system

### Phase 4: Develop ⚙️
- Generate production-ready code
- Tools: File ops, generate_react_app
- Output: Working app on localhost

### Phase 5: Deliver 🚀
- Deploy to Netlify/Vercel, share link
- Tools: deploy_project, create_github_repo  
- Output: GitHub URL + Live site URL

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Orchestration** | LangGraph (StateGraph) |
| **Phase Agents** | DeepAgents v0.3.2+ |
| **LLM Providers** | Anthropic (Sonnet 4, Haiku) |
| **Runtime** | Bun (dev) / Node.js 20+ (prod) |
| **UI** | Ink (React for CLI) |
| **Memory** | PostgreSQL + CompositeBackend |
| **Tracing** | LangSmith |
| **Testing** | Bun test (Jest-compatible) |
| **Language** | TypeScript (ESM) |
| **VCS** | Git + GitHub |
| **Project Mgmt** | Linear (via MCP) |

---

## Project Management (Linear)

### Linear MCP Integration
Eames uses Linear for all project management via MCP.

**Setup (if needed):**
```json
// Add to Claude config
{
  "mcpServers": {
    "linear": {
      "command": "npx",
      "args": ["-y", "mcp-remote", "https://mcp.linear.app/mcp"]
    }
  }
}
```

**Available Operations:**
- Search/create/update issues
- Manage projects
- Add comments
- Track sprints

**Reference:** https://linear.app/docs/mcp

### PRD-Driven Development
Every feature MUST have:
1. **PRD** - Product Requirements Document
2. **User Stories** - As a [user], I want [feature], so that [benefit]
3. **Acceptance Criteria** - Specific, testable conditions for completion

### PRD Template
```markdown
# PRD: [Feature Name]

## Overview
Brief description of the feature.

## Problem Statement
What problem does this solve?

## Goals
- Goal 1
- Goal 2

## User Stories
### US-001: [Story Title]
**As a** [user type]
**I want** [feature]
**So that** [benefit]

**Acceptance Criteria:**
- [ ] AC1: Specific testable condition
- [ ] AC2: Another testable condition

## Technical Approach
High-level implementation approach.

## Success Metrics
How will we measure success?
```

### Linear Workflow
| Status | Description |
|--------|-------------|
| Backlog | PRD written, waiting for prioritization |
| Ready | PRD approved, user stories defined |
| In Progress | Development started |
| In Review | PR created, awaiting review |
| Done | Merged and deployed |

---

## LLM Council Pattern

### Multi-Agent Architecture
Eames can spawn specialized sub-agents for complex tasks:

```
Main Orchestrator
├── Research Agent (Haiku - fast)
├── Strategy Agent (Sonnet - balanced)
├── Review Agent (Opus - deep analysis)
└── Implementation Agent (Sonnet)
```

### Council Features
- **Context Isolation**: Each agent runs in forked context
- **Parallel Execution**: Multiple agents work simultaneously
- **Model Selection**: Match model to task complexity
- **Consensus Building**: Synthesize multiple perspectives

### When to Use Council
- Complex decisions requiring multiple viewpoints
- Deep research + strategy + implementation
- Quality reviews with different focus areas

---

## Directory Structure

```
src/
├── agent/          # Agent orchestration, SDK wrapper
├── cli/            # CLI types and utilities
├── components/     # Ink React components
├── hooks/          # React hooks for agent execution
├── model/          # LLM provider abstractions
├── tools/          # MCP tool servers
└── utils/          # Shared utilities

tests/
├── unit/           # Fast, isolated tests
├── integration/    # Component interaction tests
└── e2e/            # Full workflow tests

docs/
├── EAMES_VISION.md # Architecture & roadmap
└── *.md            # Feature documentation
```

---

## Test-Driven Development (TDD)

### Red-Green-Refactor Cycle
1. **RED**: Write failing test first
2. **GREEN**: Minimal code to pass
3. **REFACTOR**: Improve while green

### Commands
```bash
bun test                    # All tests
bun test --watch           # Watch mode
bun test tests/unit/       # Specific directory
bun test --coverage        # Coverage report
```

### Test File Naming
- Unit: `*.test.ts`
- Integration: `*.integration.test.ts`
- E2E: `*.e2e.test.ts`

### Template
```typescript
import { describe, it, expect, beforeEach, mock } from 'bun:test';

describe('ComponentName', () => {
  describe('methodName', () => {
    it('should do expected behavior', () => {
      // Arrange
      // Act
      // Assert
    });
  });
});
```

### Coverage Requirements
- New features: 80%+
- Critical paths: 90%+

---

## Memory Integration (MCP)

### Entity Types
| Type | Purpose |
|------|---------|
| `project` | Project-level context |
| `feature` | Feature implementation state |
| `decision` | Architectural decisions |
| `bug` | Known issues |
| `pattern` | Code patterns |
| `phase` | Product design phase status |

### Session Protocol

**Start:**
```
mcp__memory__read_graph → Load context
Review features, decisions, bugs
```

**During:**
```
mcp__memory__add_observations → Update progress
mcp__memory__create_relations → Link entities
```

**End:**
```
Update entity status
Document blockers/next steps
```

---

## GitHub Workflow

### Branch Strategy
```
main (protected)
├── develop (integration)
│   ├── feature/phase-2-sdk-streaming
│   ├── feature/discovery-tools
│   └── fix/type-errors
└── release/v1.x.x
```

### Commit Convention
```
type(scope): description

feat(sdk): add streaming message handler
fix(ui): resolve phase display issue
test(agent): add SDK agent unit tests
docs(readme): update installation steps
```

### PR Workflow
1. Create feature branch from `develop`
2. Implement with TDD
3. All tests passing
4. Create PR with summary
5. Review → Merge → Delete branch

---

## Development Workflow

### Before Code
1. `mcp__memory__search_nodes` - Check existing context
2. Write failing test(s)
3. `bun test` - Confirm failure
4. Create/update memory entity

### While Coding
1. Implement minimal code
2. `bun test --watch` - Frequent runs
3. Add observations as you learn
4. Refactor only when green

### After Code
1. `bun test` - All passing
2. `bun run typecheck` - Clean types
3. Update memory with status
4. Commit with convention

---

## Unified Architecture Principles

### Integration, Not Switching
- DON'T: Switch between LangChain and Claude SDK
- DO: Unified orchestration layer using best of both

### Capability Mapping
| Capability | Provider | Integration Point |
|------------|----------|------------------|
| File Ops | Claude SDK | `sdk-agent.ts` |
| Research | LangChain + Tavily | MCP tool server |
| Memory | LangChain + SDK Sessions | Unified memory module |
| UI Gen | A2UI Protocol | Component catalog |
| Multi-Agent | SDK Subagents + A2A | Orchestrator |

### Phase-Based Execution
```
Discovery → Define → Design → Develop → Deliver
    ↑                                      │
    └──────────── Feedback Loop ───────────┘
```

---

## Code Conventions

### Imports (ESM)
```typescript
// External first
import React from 'react';
import { Box, Text } from 'ink';

// Internal with .js extension
import { SdkAgent } from '../agent/sdk-agent.js';
import type { AgentCallbacks } from './orchestrator.js';
```

### Component Pattern
```typescript
// 1. Types
interface Props {
  value: string;
}

// 2. Component
export function Component({ value }: Props) {
  // Hooks first
  const [state, setState] = useState(false);

  // Callbacks
  const handleAction = useCallback(() => {}, []);

  // Render
  return <Box>{value}</Box>;
}
```

### Agent/Hook Separation
- Hooks: React state management (`src/hooks/`)
- Agents: Business logic (`src/agent/`)
- Hooks call agents; agents don't know about React

---

## Feature Flags

| Flag | Key | Description |
|------|-----|-------------|
| SDK Mode | `useSdkMode` | Claude Agent SDK execution |

### Adding Flags
1. Add to `Config` interface in `src/utils/config.ts`
2. Add default in component
3. Document here
4. Test both states

---

## Current Phase: V1.1.0 Phase 0 (Foundation)

### Goals
- Prove DeepAgents + LangGraph hybrid works
- Set up infrastructure (PostgreSQL, LangSmith)
- Create basic Ink CLI shell
- Test CompositeBackend routing

### Success Criteria
- [ ] DeepAgent invokes successfully
- [ ] CompositeBackend routes /workspace, /memories, /deliverables
- [ ] LangSmith traces appear
- [ ] CLI displays streaming output

---

## Known Issues

Track via memory: `mcp__memory__search_nodes({ query: "bug" })`

| Issue | Status | Priority |
|-------|--------|----------|
| Zod v4 type incompatibility | Open | Low |
| Missing exports (command-palette, vim-mode) | Open | Medium |

---

## Quick Reference

```bash
# Development
bun run start          # Run CLI
bun run dev            # Watch mode
bun run typecheck      # Type check

# Testing
bun test               # All tests
bun test --watch       # Watch mode
bun test --coverage    # Coverage

# Git
git checkout -b feature/name   # New feature
git add . && git commit        # Commit
gh pr create                   # Create PR
```

---

## Timestamps (Required)

All file modifications must include timestamp:
- Code: `// Updated: YYYY-MM-DD HH:MM:SS`
- Docs: `# Updated: YYYY-MM-DD HH:MM:SS`

---

**Version:** 4.0.0 (V1.1.0 Architecture)
**Last Updated:** 2026-01-18 16:50:00
