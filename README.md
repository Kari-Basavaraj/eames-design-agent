# Eames 🎨 - LangChain Edition

**Last Updated:** 2026-01-18 12:15:00
**Version:** 2.0.0 (LangChain)
**Branch:** `langchain`

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Bun](https://img.shields.io/badge/Bun-%23000000.svg?style=flat&logo=bun&logoColor=white)](https://bun.sh)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![LangChain](https://img.shields.io/badge/LangChain-1C3C3C?style=flat&logo=langchain&logoColor=white)](https://js.langchain.com)
[![Linear](https://img.shields.io/badge/Linear-5E6AD2?style=flat&logo=linear&logoColor=white)](https://linear.app/basavaraj-team/project/eames-design-agent-langchain-v100-10213d90db52)

**Eames** is an end-to-end Autonomous Product Design Agent: **Discovery → Delivery**. This is the **LangChain implementation** featuring multi-provider LLM support, LLM Council pattern, and flexible agent orchestration.

> Named after Charles & Ray Eames, pioneers of design who believed "Design is a plan for arranging elements in such a way as best to accomplish a particular purpose."

## 🌟 What's New in v2.0.0

### Revolutionary Architecture
- **🧠 Intent Understanding**: Analyzes your query before execution to determine the best approach
- **💬 Ask Mode**: Generates strategic questions to gather missing context
- **📋 Plan Mode**: Proposes execution plans with only relevant phases (not rigid 5-phase pipeline)
- **⚡ Execute Mode**: Adaptive phase routing - only runs phases you need
- **🔄 Ralph Wiggum Loops**: Continuous validation in EVERY phase, not just code

### LangChain-Specific Features
- **🏛️ LLM Council**: 6 specialized agents with different models for different roles
  - Chair (Sonnet 4.5) - Orchestration
  - Strategist (Opus) - Strategic planning
  - Visionary (Claude 3.7) - Creative design
  - Architect (GPT-4.1) - Technical architecture  
  - Analyst (Gemini) - Data analysis
  - Critic (Sonnet 4.5) - Quality review
- **🔀 Multi-Provider**: Switch between Claude, OpenAI, Google, Ollama
- **📊 LangSmith**: Full observability and tracing
- **🔗 LangGraph**: Complex workflow orchestration
- **💾 Vector Memory**: Persistent context across sessions

## 📊 Project Tracking

**Linear Project**: [Eames Design Agent Langchain V1.0.0](https://linear.app/basavaraj-team/project/eames-design-agent-langchain-v100-10213d90db52)

All development is tracked via Linear. See the project board for current sprint, issues, and roadmap.

## 🚀 Quick Start

## Prerequisites

- [Bun](https://bun.sh) runtime (v1.0 or higher)
- Anthropic API key (get [here](https://console.anthropic.com)) - **Required**
- Tavily API key (get [here](https://tavily.com)) - Recommended for web search

### Installing Bun

If you don't have Bun installed:

**macOS/Linux:**
```bash
curl -fsSL https://bun.sh/install | bash
```

**Windows:**
```bash
powershell -c "irm bun.sh/install.ps1|iex"
```

After installation, restart your terminal and verify:
```bash
bun --version
```

## Installation

### Option 1: Clone and Run (Recommended)

1. Clone the repository:
```bash
git clone https://github.com/Kari-Basavaraj/eames-design-agent.git
cd eames-design-agent
```

2. Install dependencies:
```bash
bun install
```

3. Set up environment variables:
```bash
# Copy the example environment file
cp env.example .env

# Edit .env and add your API keys
# ANTHROPIC_API_KEY=your-anthropic-api-key (required)
# TAVILY_API_KEY=your-tavily-api-key (recommended)
```

### Option 2: Global Installation (Development)

For local development with global CLI access:

```bash
# Clone and install
git clone https://github.com/Kari-Basavaraj/eames-design-agent.git
cd eames-design-agent
bun install

# Link globally (makes 'eames' command available)
bun link

# Now you can run from anywhere
eames
```

### Option 3: npx (Coming Soon)

```bash
# Once published to npm
npx eames-design-agent
```

## Usage

Run Eames in interactive mode:
```bash
bun start
```

Or with watch mode for development:
```bash
bun dev
```

## Example Queries

### v2.0 Intelligent Workflows

Eames now understands your intent and adapts its approach:

**Vague Query (Triggers Ask Mode):**
```
> "Build a fintech app"

Eames: I need more context. Let me ask a few questions:
1. What specific problem does this solve?
2. Who is your target user?
3. What's your core feature?
[Ask Mode: 3-5 strategic questions]
```

**Clear Query (Triggers Plan Mode):**
```
> "Design a split bill feature for college students who share expenses"

Eames: Here's my execution plan:
- Phase 1: Discovery (research Venmo, Splitwise patterns)
- Phase 3: Design (create UI/UX specs)  
- Phase 4: Develop (generate React components)
[Skips Phase 2: Define - you already provided clear requirements]
```

**Technical Query (Direct Execute):**
```
> "Convert this Figma to React code"

Eames: Analyzing design...
[Skips Discovery/Define/Design, jumps to Phase 4: Develop]
```

### Traditional Examples Still Work
- "Research onboarding flows for fintech apps and create a PRD"
- "Compare checkout experiences between Stripe, Square, and PayPal"
- "What are the best practices for mobile form validation?"
- "Create a React component for a savings goal card"

## Architecture

### v2.0 Adaptive Orchestration

```
Stage 0: Intent Understanding
    ↓
[Analyze query clarity, context level, domain]
    ↓
┌─────────────┬─────────────┬─────────────┐
│  Ask Mode   │  Plan Mode  │ Execute Mode│
│(gather ctx) │(propose plan)│(run phases) │
└─────────────┴─────────────┴─────────────┘
```

### Three Intelligent Modes

| Mode | When Used | Output |
|------|-----------|--------|
| **Ask** | Query lacks context | 3-5 strategic questions |
| **Plan** | Clear query, complex work | Execution plan with relevant phases |
| **Execute** | Plan approved or simple query | Runs selected phases with Ralph loops |

### Product Design Phases (Adaptive)

| Phase | Focus | Ralph Loop |
|-------|-------|------------|
| **Discovery** | Research competitors, users | Research → Synthesize → Validate |
| **Define** | Create PRD, user stories | Draft → Review → Refine |
| **Design** | UI/UX, wireframes | Sketch → Prototype → Critique |
| **Develop** | Generate code | Code → Test → Fix |
| **Deliver** | Deploy to production | Deploy → Monitor → Iterate |

**Key Insight**: Not all tasks need all phases! Eames routes adaptively.

### LLM Council (LangChain-Specific)

| Role | Model | Responsibility |
|------|-------|----------------|
| **Chair** | Sonnet 4.5 | Orchestrates council, makes final decisions |
| **Strategist** | Opus | Deep strategic planning, PRD quality |
| **Visionary** | Claude 3.7 | Creative design, UX innovation |
| **Architect** | GPT-4.1 | Technical architecture, code structure |
| **Analyst** | Gemini | Data analysis, user research synthesis |
| **Critic** | Sonnet 4.5 | Quality review, design critique |

**Patterns**: Parallel (broad exploration), Sequential (build on previous), Peer Review (quality gates)

## Tools Available

### Product Design Tools
| Tool | Description |
|------|-------------|
| `search_competitors` | Find competitor features, user flows, UX analysis |
| `search_ux_patterns` | Research Nielsen Norman patterns, best practices |
| `search_design_trends` | Current Dribbble/Behance trends |
| `search_accessibility` | WCAG guidelines, a11y best practices |
| `generate_prd` | Create Product Requirements Document |
| `generate_user_stories` | Generate user stories with acceptance criteria |
| `create_wireframes` | Generate wireframe specs |
| `generate_react_app` | Create production-ready React components |

### Development Tools
| Tool | Description |
|------|-------------|
| `file_operations` | Read, write, edit files |
| `deploy_netlify` | Deploy to Netlify |
| `create_github_repo` | Create GitHub repository |
| `search_web` | General web search via Tavily |

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Runtime** | [Bun](https://bun.sh) |
| **UI** | [Ink](https://github.com/vadimdemedes/ink) (React for CLI) |
| **AI Core** | [LangChain.js](https://js.langchain.com) + [LangGraph](https://langchain-ai.github.io/langgraphjs/) |
| **LLM Providers** | Anthropic, OpenAI, Google, Ollama |
| **Observability** | [LangSmith](https://smith.langchain.com) |
| **Memory** | Vector stores (Pinecone/Chroma) |
| **Schema Validation** | [Zod](https://zod.dev) |
| **Language** | TypeScript (ESM) |
| **VCS** | Git + GitHub |
| **Project Mgmt** | Linear (via MCP) |

### Multi-Provider Support

Type `/model` in the CLI to switch between:
- **Claude Sonnet 4.5** (Anthropic) - Recommended for orchestration
- **Claude Opus** (Anthropic) - Best for strategic planning
- **GPT-4.1** (OpenAI) - Great for technical architecture
- **Gemini 3** (Google) - Excellent for data analysis
- **Ollama** - Local LLMs for privacy/cost

### LangSmith Integration

All agent executions are traced in LangSmith:
```bash
# Set up LangSmith (optional)
export LANGCHAIN_TRACING_V2=true
export LANGCHAIN_API_KEY=your-langsmith-key
export LANGCHAIN_PROJECT=eames-design-agent
```

View traces at: https://smith.langchain.com

## Development Roadmap

### Week 1-2: Intent Understanding Foundation
- [ ] Intent classifier (vague vs clear)
- [ ] Ask Mode: Question generator
- [ ] Plan Mode: Phase router
- [ ] Basic LangGraph workflow

### Week 3-4: LLM Council
- [ ] Council orchestration (6 roles)
- [ ] Parallel execution pattern
- [ ] Sequential execution pattern
- [ ] Peer review pattern

### Week 5-6: Phase Implementation
- [ ] Discovery phase with Ralph loops
- [ ] Define phase with PRD generation
- [ ] Design phase with UI/UX specs
- [ ] Develop phase with code generation

### Week 7-8: Memory & Context
- [ ] Vector memory integration
- [ ] Session persistence
- [ ] Cross-session learning
- [ ] Context window management

### Week 9-10: Delivery & Deployment
- [ ] Netlify/Vercel integration
- [ ] GitHub workflow automation
- [ ] Live preview generation
- [ ] Deliver phase completion

### Week 11-12: Polish & Production
- [ ] Error handling & resilience
- [ ] Performance optimization
- [ ] Documentation
- [ ] Production release

**Track Progress**: [Linear Project Board](https://linear.app/basavaraj-team/project/eames-design-agent-langchain-v100-10213d90db52)

## Other Implementations

Eames has three parallel implementations:

| Branch | Focus | Status |
|--------|-------|--------|
| **langchain** | Multi-provider, LLM Council | 🚧 In Development (You are here) |
| **sdk** | Claude SDK, Skills system | 📋 Planned |
| **webapp** | A2UI/AG-UI, Web interface | 📋 Planned |

Switch branches:
```bash
git checkout sdk      # Claude SDK version
git checkout webapp   # Web app version
```

## Credits

Built on top of [Dexter](https://github.com/virattt/dexter) by Virat Singh.

## License

This project is licensed under the MIT License.
