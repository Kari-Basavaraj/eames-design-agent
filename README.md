# Eames — Autonomous Design Agent

> Discovery → Define → Design → Develop → Deliver

Eames is an AI-powered CLI agent for end-to-end product design and development. It combines strategic product thinking, world-class visual craft, and full-stack engineering — all from your terminal.

Built on the [Claude Agent SDK](https://docs.anthropic.com/en/docs/claude-agent-sdk) for 100% Claude Code parity, with an optional LangChain mode for custom multi-phase orchestration.

## Quick Start

### Prerequisites

- [Bun](https://bun.sh) v1.0+ (runtime)
- [Anthropic API key](https://console.anthropic.com/settings/keys)

### Install & Run

```bash
# Clone the repo
git clone https://github.com/Kari-Basavaraj/eames-design-agent.git
cd eames-design-agent

# Install dependencies
bun install

# Run Eames
bun start
```

On first run, Eames will prompt you to enter your Anthropic API key. The key is saved to `~/.eames/config.json` (global — works from any directory).

### One-liner with a prompt

```bash
bun start "create a todo app with React and TypeScript"
```

## How It Works

Eames runs in your terminal as an interactive agent. Type a request, and it will:

1. **Read** your codebase to understand context
2. **Plan** the approach
3. **Execute** — create files, edit code, run commands
4. **Deliver** — working code, deployed if requested

### Two Modes

| Mode | Description | Default |
|------|-------------|---------|
| **SDK** | Full Claude Code CLI parity (Read, Edit, Bash, Glob, Grep, etc.) | Yes |
| **LangChain** | Custom 5-phase orchestrator (Understand → Plan → Execute → Reflect → Answer) | `/mode langchain` |

Switch modes at any time with `/mode sdk` or `/mode langchain`.

## Commands

| Command | Description |
|---------|-------------|
| `/help` | Show available commands |
| `/model` | Switch AI model/provider |
| `/mode sdk` | Switch to SDK mode (Claude Code parity) |
| `/mode langchain` | Switch to LangChain mode (5-phase) |
| `/cost` | Show token usage and estimated cost |
| `/context` | Show context window usage |
| `/compact` | Clear display, keep context |
| `/status` | Show current config |
| `/doctor` | Health check |
| `/clear` | Clear conversation |
| `/exit` | Exit Eames |

### Shortcuts

| Key | Action |
|-----|--------|
| `Esc` | Cancel running operation |
| `Ctrl+C` | Cancel or exit |
| `!command` | Run a bash command via the agent |
| `#note` | Add a note to CLAUDE.md |

## Configuration

### API Keys

Eames stores API keys in `~/.eames/config.json`. You can set them:

1. **On first run** — the setup wizard prompts you
2. **Via the TUI** — use `/model` to switch providers (prompts for key if needed)
3. **Via environment** — set `ANTHROPIC_API_KEY` in your shell or `.env` file
4. **Via config file** — edit `~/.eames/config.json` directly:

```json
{
  "apiKeys": {
    "ANTHROPIC_API_KEY": "sk-ant-...",
    "OPENAI_API_KEY": "sk-...",
    "OPENROUTER_API_KEY": "sk-or-..."
  }
}
```

### Environment Variables

Create a `.env` file in your project (optional — overrides global config):

```bash
cp env.example .env
```

| Variable | Required | Description |
|----------|----------|-------------|
| `ANTHROPIC_API_KEY` | Yes | Anthropic API key |
| `OPENAI_API_KEY` | No | For OpenAI models via `/model` |
| `GOOGLE_API_KEY` | No | For Google models via `/model` |
| `OPENROUTER_API_KEY` | No | For OpenAI/Google in SDK mode |
| `TAVILY_API_KEY` | No | Web search in LangChain mode |

### Settings

Settings are saved to `~/.eames/settings.json`:

```json
{
  "provider": "anthropic",
  "modelId": "claude-sonnet-4-5-20250929",
  "useSdkMode": true,
  "sdkPermissionMode": "default"
}
```

### Permission Modes (SDK)

| Mode | Behavior |
|------|----------|
| `default` | Ask before Bash/Edit/Write |
| `acceptEdits` | Auto-approve file edits, ask for Bash |
| `plan` | Read-only, no tool execution |
| `bypass` | Auto-approve everything |

Set via `/permission <mode>` or in settings.

## Project Structure

```
src/
├── sdk/           # Claude Agent SDK (primary mode)
│   ├── agent.ts          # SDK wrapper (query, processMessage)
│   ├── useSdkExecution.ts # React hook for SDK execution
│   ├── options.ts        # Full SDK query options
│   ├── env.ts            # OpenRouter env setup
│   └── mcp-loader.ts     # MCP server config loader
├── langchain/     # LangChain orchestrator (secondary mode)
│   ├── orchestrator.ts   # 5-phase agent
│   ├── phases/           # understand, plan, execute, reflect, answer
│   ├── tools/            # search, design, execution tools
│   └── ...
├── components/    # Ink (React) TUI components
├── shared/        # Shared prompts
├── types/         # Shared type definitions
├── model/         # LLM provider abstraction
├── utils/         # Config, env, cost tracking
└── theme.ts       # Blue color palette
```

## Development

```bash
# Run in watch mode
bun run dev

# Type check
bun run typecheck

# Run tests
bun test

# Run tests in watch mode
bun test --watch
```

## Supported Models

### Anthropic (default, recommended)
- `claude-sonnet-4-5-20250929` (default)
- `claude-haiku-3-5-20241022`

### OpenAI (requires `OPENAI_API_KEY` or `OPENROUTER_API_KEY` for SDK mode)
- `gpt-4o`
- `gpt-4o-mini`

### Google (requires `GOOGLE_API_KEY` or `OPENROUTER_API_KEY` for SDK mode)
- `gemini-2.0-flash`
- `gemini-2.0-pro`

### Ollama (local, free)
- Any locally installed model

## License

MIT
