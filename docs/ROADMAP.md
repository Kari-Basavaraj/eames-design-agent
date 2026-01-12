# Updated: 2026-01-12 18:15:00
# Eames Design Agent - Product Roadmap

> **Vision:** End-to-end Autonomous Product Design Agent: Discovery → Delivery
> **Linear Project:** [Eames Design Agent](https://linear.app/basavaraj-team/project/eames-design-agent-93b410b37929)
> **Based On:** [Dexter](https://github.com/virattt/dexter) by Virat Singh

---

## Executive Summary

Eames transforms complex design challenges into production-ready deliverables through autonomous research, synthesis, and generation. Starting from a fork of Dexter (a financial research agent), Eames has been adapted for product design and is being enhanced with Claude Agent SDK, LLM Council patterns, and A2UI protocols.

### Key Milestones

| Milestone | Target | Status |
|-----------|--------|--------|
| Foundation (Dexter → Eames) | Complete | ✅ Done |
| SDK Integration | Q1 2026 | 🔄 60% |
| Unified Architecture | Q1 2026 | ⏳ Planned |
| Discovery Automation | Q2 2026 | ⏳ Planned |
| Full Design Pipeline | Q3 2026 | ⏳ Planned |
| Production Ready | Q4 2026 | ⏳ Future |

---

## Timeline Overview

```
2026
├── Jan-Feb: Phase 1-3 (Foundation, SDK, Tools)
│   ├── Week 1-2: SDK Integration ← Current
│   ├── Week 3-4: Tool Visualization
│   └── Month 2: Unified MCP Layer
│
├── Mar-Apr: Phase 4-5 (Discovery, Define)
│   ├── User Research Automation
│   ├── Competitor Analysis
│   └── PRD Generation
│
├── May-Jun: Phase 6-7 (Design, Develop)
│   ├── A2UI Integration
│   ├── Wireframe Generation
│   └── Code Generation
│
├── Jul-Aug: Phase 8 (Deliver)
│   ├── GitHub Automation
│   └── CI/CD Integration
│
├── Sep-Oct: Phase 9 (LLM Council)
│   ├── Multi-Agent Orchestration
│   └── Council Patterns
│
└── Nov-Dec: Phase 10 (Production)
    ├── Security Hardening
    └── Performance Optimization
```

---

## Phase 0: Foundation ✅ COMPLETE

**Timeline:** Pre-project (Completed before Jan 2026)
**Status:** Done

### Origin Story
Eames started as a clone of [Dexter](https://github.com/virattt/dexter), an autonomous financial research agent. The codebase was adapted for product design use cases.

### Completed Work

| Feature | Linear | Description |
|---------|--------|-------------|
| Dexter Clone | [BAS-28](https://linear.app/basavaraj-team/issue/BAS-28) | Forked and set up codebase |
| Branding | [BAS-28](https://linear.app/basavaraj-team/issue/BAS-28) | Renamed to Eames |
| Design Prompts | [BAS-28](https://linear.app/basavaraj-team/issue/BAS-28) | Rewrote all agent prompts for design |
| Design Tools | [BAS-28](https://linear.app/basavaraj-team/issue/BAS-28) | Created search_competitors, search_ux_patterns, etc. |

### Technical Debt

| Issue | Linear | Priority |
|-------|--------|----------|
| Remove finance tools | [BAS-29](https://linear.app/basavaraj-team/issue/BAS-29) | Medium |
| Clean finance terminology | [BAS-30](https://linear.app/basavaraj-team/issue/BAS-30) | Low |

### Inherited Architecture (from Dexter)

```
┌─────────────────────────────────────────────────────────────┐
│                    5-Phase Agentic Loop                     │
├─────────────────────────────────────────────────────────────┤
│  1. UNDERSTAND  │  Extract intent & entities from query     │
│  2. PLAN        │  Create task list (research → synthesis)  │
│  3. EXECUTE     │  Run tools, gather research               │
│  4. REFLECT     │  Evaluate completeness                    │
│  5. ANSWER      │  Generate final deliverable               │
└─────────────────────────────────────────────────────────────┘
```

---

## Phase 1: Foundation ✅ COMPLETE

**Timeline:** Jan 12, 2026
**Status:** Done

### Features

| Feature | Linear | Status |
|---------|--------|--------|
| [F001] Claude Agent SDK Integration | [BAS-5](https://linear.app/basavaraj-team/issue/BAS-5) | ✅ Done |
| [F002] Feature Flag (useSdkMode) | [BAS-6](https://linear.app/basavaraj-team/issue/BAS-6) | ✅ Done |
| [F003] SDK Mode Toggle (/sdk) | [BAS-7](https://linear.app/basavaraj-team/issue/BAS-7) | ✅ Done |

### Deliverables
- `src/agent/sdk-agent.ts` - SDK wrapper class
- `src/hooks/useSdkAgentExecution.ts` - React hook for SDK execution
- Feature flag system for gradual rollout

---

## Phase 2: Core Integration 🔄 IN PROGRESS

**Timeline:** Jan 12-26, 2026
**Status:** 60% Complete

### Features

| Feature | Linear | Status |
|---------|--------|--------|
| [F004] SDK Agent Execution Hook | [BAS-8](https://linear.app/basavaraj-team/issue/BAS-8) | ✅ Done |
| [F005] SDK Message Processor | [BAS-9](https://linear.app/basavaraj-team/issue/BAS-9) | ✅ Done |
| [F006] Design Tools MCP Server | [BAS-10](https://linear.app/basavaraj-team/issue/BAS-10) | ✅ Done |
| [F007] Intro Component (SDK mode) | [BAS-11](https://linear.app/basavaraj-team/issue/BAS-11) | ✅ Done |
| [F008] Tool Call Visualization | [BAS-12](https://linear.app/basavaraj-team/issue/BAS-12) | 🔄 In Progress |
| [F009] TaskListView Integration | [BAS-13](https://linear.app/basavaraj-team/issue/BAS-13) | ⏳ Pending |

### Success Criteria
- [ ] SDK mode produces identical UI output to native mode
- [ ] Tool calls visible in TaskListView
- [ ] Streaming feels responsive
- [ ] All 38+ tests passing

### Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      SDK Integration                         │
├─────────────────────────────────────────────────────────────┤
│  SdkAgent                                                    │
│  ├── Claude Agent SDK                                        │
│  ├── MCP Tool Server (Design Tools)                          │
│  └── Message Handler                                         │
│                                                              │
│  SdkMessageProcessor                                         │
│  ├── system → onProgressMessage                              │
│  ├── assistant (text) → onProgressMessage                    │
│  ├── assistant (tool_use) → onTaskToolCallsSet              │
│  ├── tool_result → status update                             │
│  └── result → onAnswerStart + stream                         │
└─────────────────────────────────────────────────────────────┘
```

---

## Phase 3: Unified Tool Layer ⏳ PLANNED

**Timeline:** Feb 2026
**Status:** Not Started

### Features

| Feature | Linear | Description |
|---------|--------|-------------|
| [F010] Unified MCP Tool Layer | [BAS-14](https://linear.app/basavaraj-team/issue/BAS-14) | All tools as MCP servers |
| [F011] LangChain Tool Bridge | [BAS-15](https://linear.app/basavaraj-team/issue/BAS-15) | Bridge LangChain tools to MCP |

### Goals
- Single tool registration system
- MCP-first architecture
- Tool discovery and auto-documentation
- LangChain ecosystem access (Tavily, document loaders, etc.)

### Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Unified Tool Layer                        │
├─────────────────────────────────────────────────────────────┤
│  MCP Servers                                                 │
│  ├── Design Tools (search_competitors, search_ux_patterns)   │
│  ├── Memory Tools (context persistence)                      │
│  ├── Execution Tools (file ops, shell)                       │
│  └── LangChain Bridge (Tavily, loaders)                      │
│                                                              │
│  Tool Registry                                               │
│  ├── Auto-discovery                                          │
│  ├── Schema validation                                       │
│  └── Documentation generation                                │
└─────────────────────────────────────────────────────────────┘
```

---

## Phase 4: Discovery ⏳ PLANNED

**Timeline:** Mar 2026
**Status:** Not Started

### Features

| Feature | Linear | Description |
|---------|--------|-------------|
| [F012] User Research Automation | [BAS-16](https://linear.app/basavaraj-team/issue/BAS-16) | Interview guides, synthesis |
| [F013] Competitor Analysis | [BAS-17](https://linear.app/basavaraj-team/issue/BAS-17) | Automated competitive analysis |

### Capabilities
- Generate interview questions from problem space
- Synthesize interview transcripts into insights
- Create user personas from research
- Generate user journey maps
- Competitive feature matrices
- UX teardowns of competitor products

---

## Phase 5: Define ⏳ PLANNED

**Timeline:** Apr 2026
**Status:** Not Started

### Features

| Feature | Linear | Description |
|---------|--------|-------------|
| [F014] PRD Generator | [BAS-18](https://linear.app/basavaraj-team/issue/BAS-18) | Auto-generate PRDs |
| [F015] User Story Generator | [BAS-19](https://linear.app/basavaraj-team/issue/BAS-19) | Generate stories + criteria |

### Capabilities
- PRD template system with customization
- Auto-populate from Discovery research
- Generate user stories with acceptance criteria
- Create Linear issues automatically
- Version control integration

---

## Phase 6: Design ⏳ PLANNED

**Timeline:** May 2026
**Status:** Not Started

### Features

| Feature | Linear | Description |
|---------|--------|-------------|
| [F016] A2UI Integration | [BAS-20](https://linear.app/basavaraj-team/issue/BAS-20) | Agent-to-User Interface protocol |
| [F017] Wireframe Generator | [BAS-21](https://linear.app/basavaraj-team/issue/BAS-21) | Generate wireframes from specs |

### A2UI Protocol
See `A2UI_RESEARCH.md` for full protocol specification.

```
┌─────────────────────────────────────────────────────────────┐
│                    A2UI Architecture                         │
├─────────────────────────────────────────────────────────────┤
│  Agent Output → UI Component Selection → Render              │
│                                                              │
│  Component Catalog:                                          │
│  ├── Data Tables (comparison, metrics)                       │
│  ├── Forms (user input, preferences)                         │
│  ├── Visualizations (charts, diagrams)                       │
│  ├── Documents (PRDs, reports)                               │
│  └── Interactive (approval flows, selections)                │
└─────────────────────────────────────────────────────────────┘
```

---

## Phase 7: Develop ⏳ PLANNED

**Timeline:** Jun 2026
**Status:** Not Started

### Features

| Feature | Linear | Description |
|---------|--------|-------------|
| [F018] Code Generation | [BAS-22](https://linear.app/basavaraj-team/issue/BAS-22) | Generate production code |
| [F019] Test Generation | [BAS-23](https://linear.app/basavaraj-team/issue/BAS-23) | Generate tests from specs |

### Capabilities
- Generate React/Tailwind components from wireframes
- Support multiple frameworks (React, Vue, Svelte)
- Follow project conventions automatically
- Generate unit, integration, and e2e tests
- Test from acceptance criteria

---

## Phase 8: Deliver ⏳ PLANNED

**Timeline:** Jul-Aug 2026
**Status:** Not Started

### Features

| Feature | Linear | Description |
|---------|--------|-------------|
| [F020] GitHub Automation | [BAS-24](https://linear.app/basavaraj-team/issue/BAS-24) | Auto PRs, reviews |
| [F021] CI/CD Integration | [BAS-25](https://linear.app/basavaraj-team/issue/BAS-25) | Automated deployment |

### Capabilities
- Auto-create feature branches
- Auto-create PRs with descriptions
- Integrate with GitHub Actions
- Deployment triggers and rollbacks
- Environment management

---

## Phase 9: LLM Council ⏳ FUTURE

**Timeline:** Sep-Oct 2026
**Status:** Not Started

### Features

| Feature | Linear | Description |
|---------|--------|-------------|
| [F022] LLM Council Orchestrator | [BAS-26](https://linear.app/basavaraj-team/issue/BAS-26) | Multi-agent coordination |
| [F023] Multi-Agent Coordination | [BAS-27](https://linear.app/basavaraj-team/issue/BAS-27) | Consensus building |

### Architecture
See `llm-council-design-leadership-guide.md` for patterns.

```
┌─────────────────────────────────────────────────────────────┐
│                    LLM Council Pattern                       │
├─────────────────────────────────────────────────────────────┤
│  Main Orchestrator                                           │
│  ├── Research Agent (Haiku - fast, parallel)                 │
│  ├── Strategy Agent (Sonnet - balanced analysis)             │
│  ├── Review Agent (Opus - deep quality review)               │
│  └── Implementation Agent (Sonnet - code generation)         │
│                                                              │
│  Features:                                                   │
│  ├── Context Isolation (forked contexts)                     │
│  ├── Model Selection (match model to task)                   │
│  ├── Parallel Execution (concurrent agents)                  │
│  └── Consensus Building (synthesize perspectives)            │
└─────────────────────────────────────────────────────────────┘
```

---

## Phase 10: Production ⏳ FUTURE

**Timeline:** Nov-Dec 2026
**Status:** Not Started

### Focus Areas
- Security hardening
- Performance optimization
- Rate limiting and cost controls
- Monitoring and observability
- Multi-tenant support
- API access

---

## Feature Summary

### All Features by Phase

| ID | Feature | Phase | Linear | Status |
|----|---------|-------|--------|--------|
| F000 | Foundation (Dexter → Eames) | 0 | [BAS-28](https://linear.app/basavaraj-team/issue/BAS-28) | ✅ Done |
| F001 | Claude Agent SDK Integration | 1 | [BAS-5](https://linear.app/basavaraj-team/issue/BAS-5) | ✅ Done |
| F002 | Feature Flag (useSdkMode) | 1 | [BAS-6](https://linear.app/basavaraj-team/issue/BAS-6) | ✅ Done |
| F003 | SDK Mode Toggle | 1 | [BAS-7](https://linear.app/basavaraj-team/issue/BAS-7) | ✅ Done |
| F004 | SDK Agent Execution Hook | 2 | [BAS-8](https://linear.app/basavaraj-team/issue/BAS-8) | ✅ Done |
| F005 | SDK Message Processor | 2 | [BAS-9](https://linear.app/basavaraj-team/issue/BAS-9) | ✅ Done |
| F006 | Design Tools MCP Server | 2 | [BAS-10](https://linear.app/basavaraj-team/issue/BAS-10) | ✅ Done |
| F007 | Intro Component | 2 | [BAS-11](https://linear.app/basavaraj-team/issue/BAS-11) | ✅ Done |
| F008 | Tool Call Visualization | 2 | [BAS-12](https://linear.app/basavaraj-team/issue/BAS-12) | 🔄 In Progress |
| F009 | TaskListView Integration | 2 | [BAS-13](https://linear.app/basavaraj-team/issue/BAS-13) | ⏳ Pending |
| F010 | Unified MCP Tool Layer | 3 | [BAS-14](https://linear.app/basavaraj-team/issue/BAS-14) | ⏳ Planned |
| F011 | LangChain Tool Bridge | 3 | [BAS-15](https://linear.app/basavaraj-team/issue/BAS-15) | ⏳ Planned |
| F012 | User Research Automation | 4 | [BAS-16](https://linear.app/basavaraj-team/issue/BAS-16) | ⏳ Planned |
| F013 | Competitor Analysis | 4 | [BAS-17](https://linear.app/basavaraj-team/issue/BAS-17) | ⏳ Planned |
| F014 | PRD Generator | 5 | [BAS-18](https://linear.app/basavaraj-team/issue/BAS-18) | ⏳ Planned |
| F015 | User Story Generator | 5 | [BAS-19](https://linear.app/basavaraj-team/issue/BAS-19) | ⏳ Planned |
| F016 | A2UI Integration | 6 | [BAS-20](https://linear.app/basavaraj-team/issue/BAS-20) | ⏳ Planned |
| F017 | Wireframe Generator | 6 | [BAS-21](https://linear.app/basavaraj-team/issue/BAS-21) | ⏳ Planned |
| F018 | Code Generation | 7 | [BAS-22](https://linear.app/basavaraj-team/issue/BAS-22) | ⏳ Planned |
| F019 | Test Generation | 7 | [BAS-23](https://linear.app/basavaraj-team/issue/BAS-23) | ⏳ Planned |
| F020 | GitHub Automation | 8 | [BAS-24](https://linear.app/basavaraj-team/issue/BAS-24) | ⏳ Planned |
| F021 | CI/CD Integration | 8 | [BAS-25](https://linear.app/basavaraj-team/issue/BAS-25) | ⏳ Planned |
| F022 | LLM Council Orchestrator | 9 | [BAS-26](https://linear.app/basavaraj-team/issue/BAS-26) | ⏳ Future |
| F023 | Multi-Agent Coordination | 9 | [BAS-27](https://linear.app/basavaraj-team/issue/BAS-27) | ⏳ Future |

### Technical Debt

| ID | Issue | Linear | Priority |
|----|-------|--------|----------|
| TECH-001 | Remove legacy finance tools | [BAS-29](https://linear.app/basavaraj-team/issue/BAS-29) | Medium |
| TECH-002 | Clean finance terminology | [BAS-30](https://linear.app/basavaraj-team/issue/BAS-30) | Low |

---

## Success Metrics

### Phase Completion Criteria

| Phase | Key Metric | Target |
|-------|------------|--------|
| Phase 1-2 | SDK parity with native mode | 100% feature match |
| Phase 3 | Tool coverage | 100% tools on MCP |
| Phase 4-5 | Research quality | User validation score > 4/5 |
| Phase 6-7 | Code quality | 80%+ test coverage |
| Phase 8 | Deployment success | 99% success rate |
| Phase 9 | Council accuracy | Consensus within 2 rounds |
| Phase 10 | Production readiness | SLA compliance |

---

## References

- [Dexter (Original)](https://github.com/virattt/dexter) - Financial research agent base
- [EAMES_VISION.md](./EAMES_VISION.md) - Full architecture vision
- [PROGRESS_TRACKER.md](./PROGRESS_TRACKER.md) - Detailed task tracking
- [A2UI_RESEARCH.md](../A2UI_RESEARCH.md) - Agent-to-User Interface protocol
- [llm-council-design-leadership-guide.md](../llm-council-design-leadership-guide.md) - Multi-agent patterns

---

**Version:** 1.0.0
**Last Updated:** 2026-01-12 18:15:00
