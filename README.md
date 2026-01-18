# Eames 🎨 - Autonomous Product Design Agent

**Version:** 2.1.0
**Branch:** `main` (📦 Archive - See branches below for active development)
**Last Updated:** 2026-01-18

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Bun](https://img.shields.io/badge/Bun-%23000000.svg?style=flat&logo=bun&logoColor=white)](https://bun.sh)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Linear](https://img.shields.io/badge/Linear-5E6AD2?style=flat&logo=linear&logoColor=white)](https://linear.app/basavaraj-team/project/eames-design-agent-langchain-v100-10213d90db52)

**Eames** is an end-to-end Autonomous Product Design Agent: **Discovery → Delivery**. Transform ideas into production-ready, visually stunning applications deployed to Vercel or Netlify.

> Named after Charles & Ray Eames, pioneers of design who believed "Design is a plan for arranging elements in such a way as best to accomplish a particular purpose."

---

## 🚨 Choose Your Implementation

> **⚠️ This is the `main` branch (ARCHIVE).** Switch to an active branch:

| Branch | Architecture | Status |
|--------|--------------|--------|
| **[🚀 langchain](../../tree/langchain)** | DeepAgents + LangGraph | ✅ **Active Development** |
| **[📋 sdk](../../tree/sdk)** | Claude SDK | 📋 Planned |
| **[📦 main](../../tree/main)** | Archive | 📦 Archived |

### Quick Start

```bash
# Clone the repository
git clone https://github.com/Kari-Basavaraj/eames-design-agent.git
cd eames-design-agent

# Choose your implementation:
git checkout langchain  # Multi-provider, LLM Council
# OR
git checkout sdk        # Claude SDK, Skills system
# OR  
git checkout webapp     # Web app (coming soon)

# Install and run
bun install
bun start
```

## 🌟 What's New in v2.0.0

### Revolutionary Architecture (All Implementations)
- **🧠 Intent Understanding**: Analyzes your query before execution
- **💬 Ask Mode**: Gathers missing context via strategic questions
- **📋 Plan Mode**: Proposes execution plans with only relevant phases
- **⚡ Execute Mode**: Adaptive phase routing - not rigid 5-phase pipeline
- **🔄 Ralph Wiggum Loops**: Continuous validation in EVERY phase

### Implementation-Specific Features

#### LangChain Version
- 🏛️ **LLM Council**: 6 specialized agents with different models
- 🔀 **Multi-Provider**: Claude, OpenAI, Google, Ollama
- 📊 **LangSmith**: Full observability and tracing
- 🔗 **LangGraph**: Complex workflow orchestration

#### SDK Version
- 📦 **Skills System**: `.eames/skills/` hierarchical loading
- 🤖 **Sub-Agents**: Context forking with 5 specialized agents
- 💻 **Claude Code CLI**: Slash commands, permissions, sessions
- 🔒 **Native Claude SDK**: Production-ready, simple

#### WebApp Version (Planned)
- 🎨 **A2UI Protocol**: Structured UI generation
- 🔄 **AG-UI Events**: Real-time progress streaming
- 🤝 **A2A Coordination**: Multi-agent workflows
- 🌐 **Browser-Based**: No CLI required

## Vision

Eames transforms product design from idea to deployed application:

1. **Discovery** 🔍: Research competitors, users, patterns
2. **Define** 📋: Generate PRDs, user stories, requirements
3. **Design** 🎨: Create UI/UX, wireframes, components
4. **Develop** ⚙️: Generate production-ready code
5. **Deliver** 🚀: Deploy to Netlify/Vercel with live link

**Key Insight**: Not all tasks need all phases! v2.0 routes adaptively based on your query.

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

Try asking Eames:
- "Design a 'Split Bill' feature for a mobile wallet app targeting college students"
- "Research onboarding flows for fintech apps and create a PRD"
- "Compare checkout experiences between Stripe, Square, and PayPal"
- "What are the best practices for mobile form validation?"
- "Create a React component for a savings goal card"

Eames will automatically:
1. Break down your request into research tasks
2. Search for competitor patterns and best practices
3. Synthesize findings into personas and requirements
4. Generate a comprehensive deliverable (PRD, code, or analysis)

## Example Workflows

### Ask Mode (Vague Query)
```
> "Build a fintech app"

Eames: I need more context. Let me ask a few questions:
1. What specific problem does this solve?
2. Who is your target user?
3. What's your core feature?
```

### Plan Mode (Clear Query)
```
> "Design a split bill feature for college students"

Eames: Here's my execution plan:
- Phase 1: Discovery (research Venmo, Splitwise)
- Phase 3: Design (create UI/UX specs)
- Phase 4: Develop (generate React components)
[Skips Phase 2 - you provided clear requirements]
```

### Execute Mode (Technical Query)
```
> "Convert this Figma to React code"

Eames: Analyzing design...
[Jumps directly to Phase 4: Develop]
```

## Documentation

### Architecture Documents
- **[EAMES_V2_ARCHITECTURE_LANGCHAIN.md](EAMES_V2_ARCHITECTURE_LANGCHAIN.md)** - LangChain implementation details
- **[EAMES_V2_ARCHITECTURE_SDK.md](EAMES_V2_ARCHITECTURE_SDK.md)** - Claude SDK implementation details
- **[EAMES_V2_ARCHITECTURE_WEBAPP.md](EAMES_V2_ARCHITECTURE_WEBAPP.md)** - WebApp implementation details
- **[WARP.md](WARP.md)** - Development guidelines for AI agents

### Project Management
- **Linear Project**: [Eames Design Agent](https://linear.app/basavaraj-team/project/eames-design-agent-93b410b37929)
- **LangChain Project**: [LangChain v1.0.0](https://linear.app/basavaraj-team/project/eames-design-agent-langchain-v100-10213d90db52)

## Tech Stack (All Implementations)

| Layer | Technology |
|-------|------------|
| **Runtime** | Bun |
| **UI** | Ink (CLI) / React (Web) |
| **AI Core** | LangChain + Claude SDK |
| **Protocols** | A2UI, AG-UI, MCP |
| **Language** | TypeScript (ESM) |
| **VCS** | Git + GitHub |
| **Project Mgmt** | Linear |
| **Deployment** | Netlify/Vercel |

## Contributing

Eames is under active development. Contributions welcome!

1. Choose an implementation branch
2. Check the Linear project board for issues
3. Create a feature branch
4. Submit a PR

## Repository Structure

```
eames-design-agent/
├── main (branch)          ← You are here (archive/docs)
├── langchain (branch)     ← LangChain implementation
├── sdk (branch)           ← Claude SDK implementation
└── webapp (branch)        ← Web app implementation (planned)
```

### Version Tags
```
langchain-v1.0.0 → v1.0.1 → v1.0.2 → v1.1.0 → v1.1.1 → v1.2.0 → v2.0.0
sdk-v1.0.0 → v2.0.0
v0.9.0-hybrid (main branch archive)
```

## Credits

Built on top of [Dexter](https://github.com/virattt/dexter) by Virat Singh.

## License

This project is licensed under the MIT License.
