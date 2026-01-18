# Updated: 2026-01-18 03:50:00
# EAMES DESIGN AGENT - MASTER CONTEXT FOR AI AGENTS

> **⚠️ READ THIS FIRST when starting ANY new session with coding agents (Claude, Cursor, Warp, etc.)**

## 🚨 CURRENT STATUS (2026-01-18)

**WE ARE CURRENTLY:** About to commit current state and split into two clean branches
**BRANCH:** main (hybrid state - will be archived)
**NEXT STEPS:** See "IMMEDIATE ACTIONS" section below

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
├── main (branch)           ← YOU ARE HERE (hybrid/archive)
├── langchain-v1 (branch)   ← NEXT: Pure LangChain version
└── sdk-v1 (branch)         ← NEXT: Pure Claude SDK version
```

### The Problem
We tried to merge LangChain + Claude SDK + custom processors. They conflict. After $1000 spent on fixes, we discovered the architecture is fundamentally broken.

### The Solution
Split into TWO clean implementations:
1. **langchain-v1** - Pure LangChain with 5-phase orchestration (multi-provider, flexible)
2. **sdk-v1** - Pure Claude SDK with Eames Brain hooks (production-ready, simple)

**Both will have:**
- ✅ Discovery → Define → Design → Develop → Deliver phases
- ✅ Localhost preview
- ✅ GitHub integration
- ✅ Netlify/Vercel deployment
- ✅ Live link sharing

---

## 📚 KEY DOCUMENTS (Priority Order)

### Start Here
1. **THIS FILE** (`CLAUDE.md`) - Master context, read every session
2. `REPOSITORY_STRATEGY.md` - Complete plan for repository split
3. `LANGCHAIN_VS_SDK_COMPLETE.md` - Comprehensive tech comparison
4. `docs/EAMES_VISION.md` - Original vision document

### Reference (As Needed)
- `EAMES_2.0_REWRITE_PLAN.md` - SDK version implementation plan
- `COMPLETE_REWRITE_REQUIRED.md` - Root cause analysis
- `WARP.md` - Warp-specific development instructions
- `EAMES_VS_CLAUDE_CODE.md` - Feature parity analysis

---

## 🚀 IMMEDIATE ACTIONS (Phase 1)

**You should execute these NOW:**

```bash
cd /Users/basavarajkm/code/eames-design-agent

# 1. Commit everything
git add .
git commit -m "chore: archive current hybrid state

- Mixed LangChain + SDK implementation
- Analysis documents added
- Identified architectural conflicts  
- Ready to split into clean versions"

# 2. Push to GitHub
git push origin main

# 3. Tag this milestone
git tag -a v0.9.0-hybrid -m "Hybrid state before split"
git push origin v0.9.0-hybrid

# 4. Verify
git log --oneline -1
git tag -l
```

**After Phase 1:** We'll create langchain-v1 and sdk-v1 branches

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

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Runtime** | Bun |
| **UI** | Ink (React for CLI) → future: Web (React), Mobile (Flutter) |
| **AI Core** | Claude Agent SDK + LangChain |
| **Protocols** | A2UI, AG-UI, MCP |
| **Testing** | Bun test (Jest-compatible) |
| **Language** | TypeScript (ESM) |
| **VCS** | Git + GitHub |
| **Project Mgmt** | Linear (via MCP) |
| **Multi-Agent** | LLM Council pattern |

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

## Current Phase: Phase 2

### Goals
- SDK message → UI callback mapping
- Streaming improvements
- Tool call visualization
- Phase visualization in SDK mode

### Success Criteria
- [ ] SDK mode produces identical UI output
- [ ] Streaming works correctly
- [ ] Tool calls visible in TaskListView

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

**Version:** 3.0.0
**Last Updated:** 2026-01-12 17:15:00
