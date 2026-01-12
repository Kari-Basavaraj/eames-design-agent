# Eames 🎨

**Last Updated:** 2026-01-12 18:45:00
**Version:** 1.0.0

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Bun](https://img.shields.io/badge/Bun-%23000000.svg?style=flat&logo=bun&logoColor=white)](https://bun.sh)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

Eames is an autonomous Product Design agent that researches, synthesizes, and creates. It conducts deep research on user needs, design patterns, and competitors, then outputs actionable deliverables like PRDs and React components. Think Claude Code, but built specifically for Product Design.

> Named after Charles & Ray Eames, pioneers of design who believed "Design is a plan for arranging elements in such a way as best to accomplish a particular purpose."

## Overview

Eames takes complex design challenges and turns them into clear, step-by-step research plans. It searches for competitor patterns, synthesizes findings into personas and requirements, and generates production-ready deliverables.

**Key Capabilities:**
- **Intelligent Task Planning**: Decomposes design requests into research, synthesis, and execution phases
- **Autonomous Research**: Searches for competitor features, UX patterns, and design trends
- **Synthesis Engine**: Creates personas, user journeys, and requirements from research
- **Output Generation**: Produces PRDs, user stories, and React/Tailwind components
- **Self-Validation**: Reflects on research completeness before generating outputs

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

Eames uses a 5-phase agentic loop:

1. **Understand**: Extract intent and entities from your design request
2. **Plan**: Create task list (research → synthesis → execution)
3. **Execute**: Run tools to gather design research
4. **Reflect**: Evaluate research completeness
5. **Answer**: Generate final deliverable

### Agent Roles

| Role | Responsibility |
|------|----------------|
| Design Ops Lead | Plans and sequences research tasks |
| UX Researcher | Searches for patterns and competitor analysis |
| Synthesis Engine | Creates personas and requirements |
| UI/Product Engineer | Outputs PRDs and React components |

## Tools Available

| Tool | Description |
|------|-------------|
| `search_competitors` | Find competitor features, user flows, UX analysis |
| `search_ux_patterns` | Research Nielsen Norman patterns, best practices |
| `search_design_trends` | Current Dribbble/Behance trends |
| `search_accessibility` | WCAG guidelines, a11y best practices |
| `search_web` | General web search via Tavily |

## Tech Stack

- **Runtime**: [Bun](https://bun.sh)
- **UI Framework**: [React](https://react.dev) + [Ink](https://github.com/vadimdemedes/ink) (terminal UI)
- **LLM Integration**: [LangChain.js](https://js.langchain.com) with multi-provider support
- **Schema Validation**: [Zod](https://zod.dev)
- **Language**: TypeScript

### Changing Models

Type `/model` in the CLI to switch between:
- Claude Sonnet 4.5 (Anthropic) - **Recommended**
- GPT 4.1 (OpenAI)
- Gemini 3 (Google)
- Ollama (Local LLMs)

## Credits

Built on top of [Dexter](https://github.com/virattt/dexter) by Virat Singh.

## License

This project is licensed under the MIT License.
