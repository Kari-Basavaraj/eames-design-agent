# Eames 🎨 - Claude SDK Edition

**Last Updated:** 2026-01-18 12:15:00
**Version:** 2.0.0 (Claude SDK)
**Branch:** `sdk`

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Bun](https://img.shields.io/badge/Bun-%23000000.svg?style=flat&logo=bun&logoColor=white)](https://bun.sh)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Claude](https://img.shields.io/badge/Claude-Agent_SDK-CC6B4C?style=flat&logo=anthropic&logoColor=white)](https://docs.anthropic.com/en/docs/agents)

**Eames** is an end-to-end Autonomous Product Design Agent: **Discovery → Delivery**. This is the **Claude SDK implementation** featuring native Claude Agent SDK integration, hierarchical Skills system, and Claude Code CLI features.

> Named after Charles & Ray Eames, pioneers of design who believed "Design is a plan for arranging elements in such a way as best to accomplish a particular purpose."

## 🌟 What's New in v2.0.0

### Revolutionary Architecture
- **🧠 Intent Understanding**: Analyzes your query before execution to determine the best approach
- **💬 Ask Mode**: Generates strategic questions to gather missing context
- **📋 Plan Mode**: Proposes execution plans with only relevant phases (not rigid 5-phase pipeline)
- **⚡ Execute Mode**: Adaptive phase routing - only runs phases you need
- **🔄 Ralph Wiggum Loops**: Continuous validation in EVERY phase, not just code

### SDK-Specific Features
- **📦 Hierarchical Skills System**: `.eames/skills/` directory structure
  - Load skills on-demand with metadata
  - Nested resources (docs, examples, templates)
  - Skills override per project
- **🤖 Sub-Agents with Context Forking**: 5 specialized sub-agents
  - Research Agent (discovery)
  - Strategy Agent (planning)
  - Design Agent (UI/UX)
  - Code Agent (implementation)
  - Review Agent (quality)
- **💻 Claude Code CLI Features**:
  - `/ask` - Gather context mode
  - `/plan` - Generate execution plan
  - `/skills` - List available skills
  - `/agents` - View sub-agent status
- **🔒 Permissions System**: Explicit approval for file/network operations
- **💾 Session Persistence**: Resume from where you left off

## 📊 Project Tracking

**Linear Project**: Coming soon for SDK version

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

## Architecture

### v2.0 Adaptive Orchestration with Skills

```
Stage 0: Intent Understanding
    ↓
[Analyze query + Load relevant skills]
    ↓
┌─────────────┬─────────────┬─────────────┐
│  Ask Mode   │  Plan Mode  │ Execute Mode│
│(gather ctx) │(propose plan)│(run phases) │
└─────────────┴─────────────┴─────────────┘
         ↓
   [Fork sub-agents for complex tasks]
```

### Hierarchical Skills System

```
.eames/
└── skills/
    ├── discovery/
    │   ├── skill.json          # Metadata
    │   ├── README.md           # Full description
    │   └── resources/
    │       ├── competitor_template.md
    │       └── research_checklist.md
    ├── design/
    │   ├── skill.json
    │   ├── README.md
    │   └── resources/
    │       ├── wireframe_spec.json
    │       └── component_library/
    └── develop/
        ├── skill.json
        └── README.md
```

**Loading Strategy**: Metadata → Full docs (on use) → Resources (on demand)

### Sub-Agents with Context Forking

| Sub-Agent | Purpose | Context |
|-----------|---------|----------|
| **Research** | Discovery phase | Forked + research tools |
| **Strategy** | Define phase, PRD | Forked + strategy skills |
| **Design** | UI/UX, wireframes | Forked + design system |
| **Code** | Implementation | Forked + code skills |
| **Review** | Quality gates | Forked + all artifacts |

**How it works**: Main agent forks context to sub-agent → sub-agent executes → results merge back

### Product Design Phases (Adaptive)

| Phase | Focus | Ralph Loop |
|-------|-------|------------|
| **Discovery** | Research competitors, users | Research → Synthesize → Validate |
| **Define** | Create PRD, user stories | Draft → Review → Refine |
| **Design** | UI/UX, wireframes | Sketch → Prototype → Critique |
| **Develop** | Generate code | Code → Test → Fix |
| **Deliver** | Deploy to production | Deploy → Monitor → Iterate |

## CLI Commands

### Slash Commands (Claude Code Style)
| Command | Description |
|---------|-------------|
| `/ask` | Enter Ask Mode - gather context via questions |
| `/plan` | Enter Plan Mode - generate execution plan |
| `/skills` | List available skills in `.eames/skills/` |
| `/agents` | View sub-agent status and context |
| `/session` | Manage session (save/load/clear) |
| `/permissions` | Review permission requests |

## Skills Catalog

### Built-in Skills
| Skill | Phase | Description |
|-------|-------|-------------|
| `discovery` | 1 | Competitor research, user research |
| `define` | 2 | PRD generation, user stories |
| `design` | 3 | Wireframes, component specs |
| `develop` | 4 | Code generation, testing |
| `deliver` | 5 | Deployment, monitoring |

### Creating Custom Skills

Create `.eames/skills/my-skill/skill.json`:
```json
{
  "name": "my-skill",
  "version": "1.0.0",
  "description": "Custom skill description",
  "phase": "design",
  "tools": ["tool1", "tool2"],
  "resources": ["README.md", "templates/"]
}
```

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Runtime** | [Bun](https://bun.sh) |
| **UI** | [Ink](https://github.com/vadimdemedes/ink) (React for CLI) |
| **AI Core** | [Claude Agent SDK](https://docs.anthropic.com/en/docs/agents) |
| **Model** | Claude Sonnet 4.5, Opus |
| **Skills System** | Hierarchical file-based loading |
| **Sub-Agents** | Context forking with SDK |
| **Session** | JSON-based persistence |
| **Schema Validation** | [Zod](https://zod.dev) |
| **Language** | TypeScript (ESM) |
| **VCS** | Git + GitHub |
| **Project Mgmt** | Linear (via MCP) |

## Development Roadmap

### Week 1-2: Skills Foundation
- [ ] Hierarchical skills loader
- [ ] Skill metadata parser
- [ ] Resource lazy loading
- [ ] Skills CLI commands

### Week 3-4: Sub-Agents
- [ ] Context forking system
- [ ] 5 specialized sub-agents
- [ ] Result merging
- [ ] Sub-agent monitoring

### Week 5-6: Claude Code Features
- [ ] Slash command parser
- [ ] Permissions system
- [ ] Session persistence
- [ ] CLI improvements

### Week 7-8: Phase Implementation
- [ ] Discovery phase + skills
- [ ] Define phase + skills
- [ ] Design phase + skills
- [ ] Develop phase + skills

### Week 9-10: Delivery & Integration
- [ ] Deliver phase completion
- [ ] GitHub workflow
- [ ] Netlify/Vercel deployment
- [ ] Live preview

### Week 11-12: Polish & Production
- [ ] Error handling
- [ ] Performance optimization
- [ ] Documentation
- [ ] Production release

## Other Implementations

Eames has three parallel implementations:

| Branch | Focus | Status |
|--------|-------|--------|
| **langchain** | Multi-provider, LLM Council | 🚀 In Development |
| **sdk** | Claude SDK, Skills system | 🚧 In Development (You are here) |
| **webapp** | A2UI/AG-UI, Web interface | 📋 Planned |

Switch branches:
```bash
git checkout langchain  # LangChain version
git checkout webapp     # Web app version
```

## Credits

Built on top of [Dexter](https://github.com/virattt/dexter) by Virat Singh.

## License

This project is licensed under the MIT License.
