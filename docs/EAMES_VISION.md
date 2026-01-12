# Updated: 2026-01-12 16:00:00
# Eames: Autonomous Product Design Agent - Vision & Architecture

## Executive Summary

**Eames** is an end-to-end Autonomous Product Design Agent that handles the complete product design lifecycle from **Discovery to Delivery** - outputting production-ready, tested code deployed for real customers.

Named after Charles & Ray Eames, who believed "design is a plan for arranging elements in such a way as best to accomplish a particular purpose."

---

## Vision Statement

> **Eames transforms product ideas into production-ready software through autonomous AI-powered design workflows, combining the best of Claude Agent SDK, LangChain orchestration, and Agentic UI protocols.**

### Core Principles
1. **Discovery to Delivery** - Complete product design lifecycle
2. **Production-Ready Output** - Tested, deployable code
3. **Unified AI Architecture** - Best of all AI technologies, not switching between them
4. **Human-in-the-Loop** - Transparent, controllable, reversible
5. **Enterprise-Grade** - GitHub workflow, SDLC best practices, CI/CD

---

## Product Design Lifecycle Coverage

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        EAMES PRODUCT DESIGN LIFECYCLE                        │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐  │
│  │DISCOVERY │ → │ DEFINE   │ → │ DESIGN   │ → │ DEVELOP  │ → │ DELIVER  │  │
│  └──────────┘   └──────────┘   └──────────┘   └──────────┘   └──────────┘  │
│                                                                             │
│  • User Research   • PRD           • UI/UX        • Code Gen    • Testing   │
│  • Competitor      • User Stories  • Wireframes   • Components  • CI/CD     │
│  • Market Trends   • Requirements  • Prototypes   • Integration • Deploy    │
│  • Pain Points     • Success KPIs  • Design Sys   • APIs        • Monitor   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Phase Activities

| Phase | Activities | Eames Capabilities |
|-------|------------|-------------------|
| **Discovery** | User research, competitor analysis, market trends, pain point identification | Web search, research synthesis, insight extraction |
| **Define** | PRD generation, user stories, requirements, success metrics | Document generation, structured output |
| **Design** | UI/UX design, wireframes, prototypes, design system | Component generation, A2UI specs, visual design |
| **Develop** | Code generation, component building, API integration | Claude SDK file ops, code execution, testing |
| **Deliver** | Testing, CI/CD, deployment, monitoring | GitHub integration, automated workflows |

---

## Unified AI Architecture

### Design Philosophy: Integration, Not Switching

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         EAMES UNIFIED AI CORE                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                    ORCHESTRATION LAYER                               │   │
│  │  • Multi-phase workflow (Understand → Plan → Execute → Reflect)     │   │
│  │  • Task decomposition and delegation                                 │   │
│  │  • Memory management (short-term + long-term)                        │   │
│  │  • Context window optimization                                       │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                    │                                        │
│           ┌────────────────────────┼────────────────────────┐               │
│           ▼                        ▼                        ▼               │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐         │
│  │  CLAUDE SDK     │    │   LANGCHAIN     │    │  AGENTIC UI     │         │
│  │  CAPABILITIES   │    │  CAPABILITIES   │    │  PROTOCOLS      │         │
│  ├─────────────────┤    ├─────────────────┤    ├─────────────────┤         │
│  │ • File Ops      │    │ • Tool Chains   │    │ • A2UI Spec     │         │
│  │ • Bash Exec     │    │ • Vector Store  │    │ • AG-UI Events  │         │
│  │ • MCP Servers   │    │ • RAG Pipelines │    │ • A2A Protocol  │         │
│  │ • Sessions      │    │ • Multi-LLM     │    │ • GenUI Render  │         │
│  │ • Hooks         │    │ • Embeddings    │    │ • Streaming UI  │         │
│  │ • Checkpoints   │    │ • Memory Stores │    │ • Multimodal    │         │
│  │ • Subagents     │    │ • Callbacks     │    │ • Catalogs      │         │
│  └─────────────────┘    └─────────────────┘    └─────────────────┘         │
│                                    │                                        │
│                                    ▼                                        │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                         MCP TOOL LAYER                               │   │
│  │  • Design Research Tools   • File System    • GitHub API            │   │
│  │  • Web Search/Fetch        • Database       • Figma API             │   │
│  │  • Code Analysis           • CI/CD          • Analytics             │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Technology Integration Matrix

| Capability | Claude SDK | LangChain | Agentic UI | Combined Power |
|------------|------------|-----------|------------|----------------|
| **Code Generation** | File Read/Edit/Write | - | - | Generate, validate, save |
| **Execution** | Bash, Subagents | Tool Chains | - | Run builds, tests, deploys |
| **Research** | WebSearch, WebFetch | Tavily, RAG | - | Deep research synthesis |
| **Memory** | Sessions | Vector Stores | State Sync | Cross-session persistence |
| **UI Generation** | - | - | A2UI, GenUI | Dynamic interface creation |
| **Multi-Agent** | Subagents | Agent Executor | A2A Protocol | Specialized agent swarms |
| **Streaming** | Message Stream | Callbacks | AG-UI Events | Real-time progress |

---

## Agentic UI Integration

### Protocol Stack

```
┌─────────────────────────────────────────────────────────────────┐
│                    USER INTERFACE LAYER                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │  Terminal   │  │   Web App   │  │  Mobile App │              │
│  │  (Ink TUI)  │  │  (React)    │  │  (Flutter)  │              │
│  └─────────────┘  └─────────────┘  └─────────────┘              │
├─────────────────────────────────────────────────────────────────┤
│                    AG-UI RUNTIME LAYER                           │
│  • Event streaming (RUN_STARTED, TEXT_MESSAGE, TOOL_CALL)       │
│  • State synchronization (STATE_SNAPSHOT, STATE_DELTA)          │
│  • Bi-directional communication                                  │
├─────────────────────────────────────────────────────────────────┤
│                    A2UI SPECIFICATION LAYER                      │
│  • Declarative UI as JSON (surfaceUpdate, dataModelUpdate)      │
│  • Component catalogs (design system mapping)                    │
│  • Schema validation (type-safe, secure)                         │
├─────────────────────────────────────────────────────────────────┤
│                    A2A COORDINATION LAYER                        │
│  • Agent discovery (Agent Cards)                                 │
│  • Task delegation (submitted → working → completed)            │
│  • Multi-agent orchestration                                     │
└─────────────────────────────────────────────────────────────────┘
```

### Component Catalog (Design System)

| Category | Components | Use Case |
|----------|------------|----------|
| **Primitives** | Text, Button, Icon, Badge | Basic UI elements |
| **Containers** | Card, Panel, Modal, Tabs | Layout and grouping |
| **Data** | Table, Chart, Timeline, Stats | Research findings, metrics |
| **Inputs** | TextField, Select, DatePicker | User preferences, forms |
| **Workflow** | Stepper, Checklist, Progress | Multi-step design process |
| **Design** | Wireframe, Component Preview | Visual design output |

---

## GitHub-First Development Workflow

### Branch Strategy

```
main (protected)
  │
  ├── develop (integration)
  │     │
  │     ├── feature/discovery-phase
  │     ├── feature/prd-generator
  │     ├── feature/ui-generator
  │     └── feature/deployment-automation
  │
  └── release/v1.x.x
```

### Automated Workflow

```
┌──────────────┐    ┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│   Feature    │ →  │    Tests     │ →  │   Review     │ →  │    Merge     │
│   Branch     │    │   (Auto)     │    │   (Human)    │    │   (CI/CD)    │
└──────────────┘    └──────────────┘    └──────────────┘    └──────────────┘
       │                   │                   │                   │
       ▼                   ▼                   ▼                   ▼
  Eames generates    Bun test runs      PR with summary     Deploy to
  code + tests       automatically      generated           production
```

### SDLC Integration

| Phase | Eames Role | Automation |
|-------|------------|------------|
| **Planning** | Generate PRD, user stories | Create GitHub issues |
| **Development** | Generate code, tests | Create feature branches |
| **Testing** | Run tests, fix failures | Automated test runs |
| **Review** | Generate PR summaries | AI-assisted review |
| **Deployment** | Trigger CI/CD | GitHub Actions |
| **Monitoring** | Analyze metrics | Alert on issues |

---

## Implementation Roadmap

### Phase 1: Foundation ✅ COMPLETE
- [x] Claude Agent SDK integration
- [x] Feature flag system
- [x] TDD infrastructure
- [x] Memory system

### Phase 2: Core Integration (Current)
- [ ] SDK message → UI callback mapping
- [ ] Streaming improvements
- [ ] Tool call visualization
- [ ] Phase visualization in SDK mode

### Phase 3: Unified Tool Layer
- [ ] MCP server consolidation
- [ ] LangChain tool integration
- [ ] Design research tools
- [ ] File operation tools

### Phase 4: Discovery Phase
- [ ] User research automation
- [ ] Competitor analysis
- [ ] Market trend synthesis
- [ ] Pain point identification

### Phase 5: Define Phase
- [ ] PRD generation
- [ ] User story creation
- [ ] Requirements extraction
- [ ] Success metrics definition

### Phase 6: Design Phase
- [ ] UI/UX generation (A2UI)
- [ ] Component library
- [ ] Wireframe generation
- [ ] Design system integration

### Phase 7: Develop Phase
- [ ] Code generation
- [ ] Component building
- [ ] Test generation
- [ ] API integration

### Phase 8: Deliver Phase
- [ ] GitHub automation
- [ ] CI/CD integration
- [ ] Deployment automation
- [ ] Monitoring setup

### Phase 9: Advanced Features
- [ ] Multi-agent orchestration (A2A)
- [ ] Subagent specialization
- [ ] Skills and slash commands
- [ ] Context compaction

### Phase 10: Production Hardening
- [ ] Security audit
- [ ] Performance optimization
- [ ] Error handling
- [ ] Documentation

---

## Technical Architecture

### Core Modules

```
src/
├── core/                    # Unified orchestration
│   ├── orchestrator.ts      # Main agent loop
│   ├── planner.ts           # Task decomposition
│   ├── memory.ts            # Unified memory system
│   └── context.ts           # Context management
│
├── capabilities/            # AI capability providers
│   ├── claude-sdk/          # Claude Agent SDK wrapper
│   ├── langchain/           # LangChain integrations
│   └── agentic-ui/          # A2UI, AG-UI, A2A
│
├── tools/                   # MCP tool servers
│   ├── design-research/     # Research tools
│   ├── file-ops/            # File operations
│   ├── github/              # GitHub integration
│   └── execution/           # Code execution
│
├── phases/                  # Product design phases
│   ├── discovery/           # Research & analysis
│   ├── define/              # PRD & requirements
│   ├── design/              # UI/UX generation
│   ├── develop/             # Code generation
│   └── deliver/             # Deployment
│
├── ui/                      # User interfaces
│   ├── terminal/            # Ink TUI (current)
│   ├── web/                 # Web interface (future)
│   └── components/          # Shared UI components
│
└── utils/                   # Shared utilities
    ├── config.ts
    ├── env.ts
    └── types.ts
```

### Memory Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     UNIFIED MEMORY SYSTEM                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────┐    ┌─────────────────┐    ┌──────────────┐ │
│  │  Working Memory │    │ Episodic Memory │    │Semantic Mem. │ │
│  │  (Current Task) │    │ (Session Hist.) │    │(Knowledge)   │ │
│  ├─────────────────┤    ├─────────────────┤    ├──────────────┤ │
│  │ • Current phase │    │ • Past queries  │    │ • Design     │ │
│  │ • Active tools  │    │ • Decisions     │    │   patterns   │ │
│  │ • Progress      │    │ • Learnings     │    │ • Best       │ │
│  │ • Context       │    │ • Outcomes      │    │   practices  │ │
│  └─────────────────┘    └─────────────────┘    └──────────────┤ │
│           │                     │                      │        │
│           └─────────────────────┼──────────────────────┘        │
│                                 ▼                               │
│                    ┌─────────────────────┐                      │
│                    │   Vector Store +    │                      │
│                    │   Knowledge Graph   │                      │
│                    └─────────────────────┘                      │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Success Metrics

### Phase Completion Criteria

| Phase | Success Criteria |
|-------|------------------|
| **Discovery** | Research synthesis accuracy > 85% |
| **Define** | PRD completeness score > 90% |
| **Design** | UI consistency with design system > 95% |
| **Develop** | Test coverage > 80%, build success 100% |
| **Deliver** | Deployment success rate > 99% |

### Quality Gates

- [ ] All tests passing (unit, integration, e2e)
- [ ] Type check clean
- [ ] Linting passed
- [ ] Security scan clean
- [ ] Performance benchmarks met
- [ ] Accessibility audit passed

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| SDK API changes | Version pinning, adapter layers |
| Context limits | Compaction, chunking, summarization |
| Quality variance | Human review checkpoints |
| Security | Sandboxing, permission controls |
| Complexity | Modular architecture, TDD |

---

## References

- [Claude Agent SDK Documentation](https://docs.anthropic.com/claude/docs/agent-sdk)
- [LangChain.js Documentation](https://js.langchain.com/)
- [A2UI Protocol Specification](https://github.com/anthropics/a2ui)
- [AG-UI Protocol](https://github.com/CopilotKit/ag-ui)
- [A2A Protocol](https://github.com/google/a2a)
- [Agentic UI Stack Research](./agentic-ui-research.md)

---

**Last Updated:** 2026-01-12 16:00:00
**Version:** 2.0.0
**Status:** Active Development
