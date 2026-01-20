# Eames 🎨 - Autonomous Product Design Agent

**Version:** 2.1.0 (LangChain/DeepAgents)
**Branch:** `main`
**Last Updated:** 2026-01-20

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Bun](https://img.shields.io/badge/Bun-%23000000.svg?style=flat&logo=bun&logoColor=white)](https://bun.sh)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![LangChain](https://img.shields.io/badge/LangChain-1C3C3C?style=flat&logo=langchain&logoColor=white)](https://js.langchain.com)
[![Linear](https://img.shields.io/badge/Linear-5E6AD2?style=flat&logo=linear&logoColor=white)](https://linear.app/basavaraj-team/project/eames-design-agent-v110-10213d90db52)

**Eames** is an end-to-end Autonomous Product Design Agent: **Discovery → Delivery**. Transform ideas into production-ready, visually stunning applications deployed to Vercel or Netlify.

> Named after Charles & Ray Eames, pioneers of design who believed "Design is a plan for arranging elements in such a way as best to accomplish a particular purpose."

---

## 🌟 What is Eames?

Eames is the world's most capable autonomous design agent, combining:

- **Strategic Product Thinking** - JTBD, competitive analysis, PRD generation
- **World-Class Visual Design** - Stripe, Linear, Notion, Apple-level craft
- **Full-Stack Engineering** - React, Next.js, TypeScript, Tailwind
- **Autonomous Deployment** - GitHub repos + live Vercel/Netlify URLs

### The Complete Pipeline

```
┌─────────────────────────────────────────────────────────────────┐
│  "Build a mobile expense tracker for freelancers"               │
└───────────────────────────┬─────────────────────────────────────┘
                            ▼
┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐
│ Discovery │→│  Define   │→│  Design   │→│  Develop  │→│  Deliver  │
│  Research │ │    PRD    │ │  UI/UX    │ │   Code    │ │  Deploy   │
└───────────┘ └───────────┘ └───────────┘ └───────────┘ └───────────┘
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│  ✅ GitHub: github.com/user/expense-tracker                     │
│  ✅ Live:   https://expense-tracker-xyz.vercel.app              │
│  ✅ Cost:   $0.79  |  Time: 12 minutes                          │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🏗️ Architecture

This implementation uses the **Hybrid Architecture** combining:

- **Custom LangGraph Orchestrator** - 5-phase workflow control with human approval gates
- **DeepAgents Phase Agents** - Battle-tested planning, memory, and subagent capabilities  
- **Eames Brain 2.0** - Domain intelligence (design + engineering prompts)
- **Filesystem as Universal Interface** - CompositeBackend for hybrid storage

### System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    EAMES ORCHESTRATOR (LangGraph)                │
│  StateGraph • PostgreSQL Checkpointer • Approval Gates          │
└───────────────────────────┬─────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        ▼                   ▼                   ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Discovery  │     │   Define    │     │   Design    │
│ (DeepAgent) │     │ (DeepAgent) │     │ (DeepAgent) │
│   Sonnet    │     │   Sonnet    │     │   Sonnet    │
└─────────────┘     └─────────────┘     └─────────────┘
        │                   │                   │
        ▼                   ▼                   ▼
┌─────────────┐     ┌─────────────┐
│   Develop   │     │   Deliver   │
│ (DeepAgent) │     │ (DeepAgent) │
│Sonnet+Haiku │     │   Haiku     │
└─────────────┘     └─────────────┘
```

### Key Technologies

| Layer | Technology |
|-------|------------|
| **Orchestration** | LangGraph (StateGraph) |
| **Phase Agents** | DeepAgents v0.3.2+ |
| **LLM Providers** | Anthropic (Sonnet 4, Haiku) |
| **Runtime** | Bun (dev) / Node.js 20+ (prod) |
| **CLI** | Ink (React for terminal) |
| **Memory** | PostgreSQL + CompositeBackend |
| **Tracing** | LangSmith |
| **Deployment** | Vercel, Netlify, GitHub |

---

## 🚀 Quick Start

### Prerequisites

- [Bun](https://bun.sh) v1.1+ (or Node.js 20+)
- PostgreSQL (via Docker)
- Anthropic API key
- Tavily API key (for research)
- GitHub token (for deployment)
- Vercel/Netlify token (for deployment)

### Installation

```bash
# Clone the repository
git clone https://github.com/Kari-Basavaraj/eames-design-agent.git
cd eames-design-agent
# Main branch is now the default (previously langchain)

# Install dependencies
bun install

# Start PostgreSQL
docker run -d --name eames-postgres \
  -e POSTGRES_PASSWORD=eames \
  -p 5432:5432 \
  postgres:16-alpine

# Configure environment
cp env.example .env
# Edit .env with your API keys

# Run Eames
bun start
```

### Environment Variables

```bash
# Required
ANTHROPIC_API_KEY=sk-ant-...
TAVILY_API_KEY=tvly-...
DATABASE_URL=postgresql://postgres:eames@localhost:5432/eames

# Optional (for deployment)
GITHUB_TOKEN=ghp_...
VERCEL_TOKEN=...
NETLIFY_TOKEN=...

# Observability
LANGCHAIN_TRACING_V2=true
LANGCHAIN_API_KEY=ls__...
LANGCHAIN_PROJECT=eames-design-agent
```

---

## 📖 Usage

### Basic Commands

```bash
# Start interactive mode
bun start

# Build a specific app
eames "Build a todo app for developers with GitHub integration"

# Resume a previous project
eames resume <project_id>

# List projects
eames list
```

### Example Workflows

**Vague Request → Clarification Loop:**
```
> eames "Build a productivity app"

🎨 Eames: I need a bit more context:

1. Who is the primary user? (teams, individuals, developers)
2. What's the key differentiator from existing solutions?
3. Any specific integrations needed?

> For solo developers, with Pomodoro and GitHub commit tracking

✅ Got it! Starting Discovery phase...
```

**Clear Request → Direct Execution:**
```
> eames "Build a minimalist expense tracker inspired by Linear's design"

🔍 Discovery: Researching expense tracker patterns...
📋 Define: Generating PRD... [Approve? Y/n]
🎨 Design: Creating design system...
⚙️ Develop: Generating Next.js 14 app...
🚀 Deliver: Deploying to Vercel...

✅ Done in 11:42

GitHub: https://github.com/user/expense-tracker
Live:   https://expense-tracker-abc.vercel.app
Cost:   $0.82
```

---

## 📊 Performance & Cost

### Target Metrics

| Metric | Target | With Caching |
|--------|--------|-------------|
| **Total Time** | <15 min | <10 min |
| **Total Cost** | <$5 | **<$1** |
| **Success Rate** | >90% | >90% |

### Per-Phase Costs

| Phase | Fresh | Cached (90% off) |
|-------|-------|------------------|
| Discovery | $0.07 | $0.01 |
| Define | $0.10 | $0.02 |
| Design | $0.14 | $0.02 |
| Develop | $0.50 | $0.12 |
| Deliver | $0.02 | <$0.01 |
| **Total** | $0.99 | **$0.30** |

---

## 📅 Roadmap

**120-day implementation plan (V1.1.0):**

| Phase | Days | Focus |
|-------|------|-------|
| 0. Foundation | 1-10 | DeepAgents + LangGraph proof |
| 1. Develop | 11-25 | Code generation with quality gates |
| 2. Deliver | 26-35 | GitHub + Vercel deployment |
| 3. E2E | 36-42 | Develop → Deliver pipeline |
| 4. Define | 43-55 | PRD + Clarification Loop |
| 5. Design | 56-70 | Design system generation |
| 6. Discovery | 71-85 | Parallel research agents |
| 7. Integration | 86-100 | Full 5-phase workflow |
| 8. Polish | 101-120 | Production readiness |

See [`MASTER_IMPLEMENTATION_PLAN_V1.1.0.md`](./MASTER_IMPLEMENTATION_PLAN_V1.1.0.md) for complete details.

---

## 📁 Project Structure

```
eames-design-agent/
├── src/
│   ├── orchestrator/       # LangGraph workflow
│   ├── agents/             # Phase agents (DeepAgents)
│   ├── intelligence/       # Eames Brain 2.0 prompts
│   ├── middleware/         # Custom middleware
│   ├── tools/              # Tool definitions
│   ├── cli/                # Ink CLI components
│   └── storage/            # CompositeBackend setup
├── docs/
│   ├── research/           # Research documents
│   └── planning/           # Architecture docs
├── tests/
│   ├── unit/               # Fast, isolated tests
│   ├── integration/        # Component interaction
│   └── e2e/                # Full workflow tests
└── MASTER_IMPLEMENTATION_PLAN_V1.1.0.md
```

---

## 🔀 Other Implementations

Eames has parallel implementations:

| Branch | Architecture | Status |
|--------|--------------|--------|
| **main** | DeepAgents + LangGraph | 🚧 Active Development |
| **sdk** | Pure Claude SDK | 📋 Planned |
| **archive/original-hybrid** | Original exploration | 📦 Archived |

```bash
# Switch branches
git checkout main  # DeepAgents version (you are here)
git checkout sdk   # Claude SDK version (future)
```

---

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [MASTER_IMPLEMENTATION_PLAN_V1.1.0.md](./MASTER_IMPLEMENTATION_PLAN_V1.1.0.md) | Complete implementation blueprint |
| [CLAUDE.md](./CLAUDE.md) | Context for AI coding agents |
| [docs/EAMES_VISION.md](./docs/EAMES_VISION.md) | Original vision document |

---

## 🤝 Contributing

1. Read `CLAUDE.md` for development context
2. Check [Linear project](https://linear.app/basavaraj-team/project/eames-design-agent-v110-10213d90db52) for open issues
3. Follow TDD (write tests first)
4. Use conventional commits

```bash
# Development workflow
bun test              # Run tests
bun run typecheck     # Type check
bun run lint          # Lint code
```

---

## 📄 License

MIT License - see [LICENSE](./LICENSE) for details.

---

*"The details are not the details. They make the design."* — Charles Eames
