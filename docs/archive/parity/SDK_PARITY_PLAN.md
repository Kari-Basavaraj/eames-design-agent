# Updated: 2026-02-16 12:00:00
# Eames SDK Parity Plan: 100% Claude Code CLI Feature Parity

## Vision

**Eames** is the world's first complete **Autonomous Product Design Agent** — Discovery → Delivery.
It combines strategic product thinking, world-class visual craft, and full-stack engineering.

**TUI Design**: 100% matching Claude Code CLI except:
- **Intro**: Eames ASCII art branding with "Autonomous Design Agent" tagline
- **Color**: Blue theme (#58A6FF) instead of Claude Code's default

**SDK**: 100% parity with Claude Code CLI via `@anthropic-ai/claude-agent-sdk`.
All 16+ SDK message types handled. All control methods available.

**LangChain**: Secondary mode for custom 5-phase orchestration (Understand → Plan → Execute → Reflect → Answer).

## Architecture

```
src/
├── sdk/                        # PRIMARY: Claude Agent SDK mode
│   ├── agent.ts                # Wraps query(), streams SDKMessage
│   ├── options.ts              # Full SDK Options type
│   ├── message-processor.ts    # SDKMessage → UI state mapper
│   └── types.ts                # SDK-related type exports
│
├── langchain/                  # SECONDARY: LangChain 5-phase mode
│   ├── orchestrator.ts         # StateGraph orchestrator
│   ├── phases/                 # understand, plan, execute, reflect, answer
│   ├── tools/                  # LangChain tool definitions
│   ├── prompts.ts              # Phase prompts
│   ├── schemas.ts              # Zod schemas
│   └── state.ts                # Phase state types
│
├── components/                 # Shared Ink UI components
│   ├── App.tsx                 # Main app (routes SDK vs LangChain)
│   ├── Input.tsx               # User input with completions
│   ├── AnswerBox.tsx           # Markdown answer renderer
│   ├── ToolProgress.tsx        # Real-time tool call display
│   ├── ThinkingIndicator.tsx   # Extended thinking display
│   ├── PermissionPrompt.tsx    # Tool permission (Y/n)
│   ├── AskUserQuestion.tsx     # Multi-choice question UI
│   ├── StatusBar.tsx           # Model, permission mode, cost
│   ├── SessionPicker.tsx       # Resume session UI
│   ├── ModelSelector.tsx       # Provider + model picker
│   └── Intro.tsx               # Welcome banner
│
├── hooks/                      # React hooks
│   ├── useSdkExecution.ts      # SDK agent execution hook
│   ├── useLangChainExecution.ts # LangChain execution hook
│   └── useQueryQueue.ts        # Query queuing
│
├── utils/                      # Shared utilities
│   ├── config.ts               # Settings management
│   ├── cost-tracking.ts        # Token/cost tracking
│   ├── env.ts                  # API key management
│   └── mcp-loader.ts           # MCP server config loader
│
├── cli.tsx                     # Main CLI component
├── index.tsx                   # Entry point
└── theme.ts                    # Color palette
```

## SDK Message Types → UI Mapping (16 types)

| SDK Message Type | Status | UI Treatment |
|-----------------|--------|-------------|
| `system` (init) | Partial | Show tools, MCP servers, model in status bar |
| `system` (status) | Missing | Show "Compacting..." indicator |
| `system` (compact_boundary) | Missing | Show compact notification |
| `system` (hook_started/progress/response) | Missing | Show hook activity |
| `system` (task_notification) | Missing | Show subagent status |
| `system` (files_persisted) | Missing | Silent/log |
| `assistant` | Done | Extract text, show streaming |
| `stream_event` | Done | Delta text streaming |
| `user` (replay) | Missing | Show resumed messages |
| `result` (success) | Done | Final answer |
| `result` (error) | Partial | Show error with details |
| `tool_progress` | Partial | Show tool name + elapsed time |
| `tool_use_summary` | Missing | Show tool execution summary |
| `auth_status` | Missing | Show auth progress |

## SDK Control Methods → Feature Mapping

| Control Method | Status | UI Feature |
|---------------|--------|-----------|
| `interrupt()` | Done | Escape/Ctrl+C |
| `setPermissionMode()` | Done | /permission command |
| `setModel()` | Missing | /model should call this mid-session |
| `setMaxThinkingTokens()` | Missing | Alt+T toggle |
| `supportedCommands()` | Missing | Populate slash command menu from SDK |
| `supportedModels()` | Missing | Populate model picker from SDK |
| `mcpServerStatus()` | Missing | /mcp command |
| `accountInfo()` | Missing | /status command |
| `rewindFiles()` | Missing | /rewind command |
| `reconnectMcpServer()` | Missing | MCP manager |
| `toggleMcpServer()` | Missing | MCP manager |
| `setMcpServers()` | Missing | Dynamic MCP management |
| `streamInput()` | Missing | Multi-turn streaming |
| `stopTask()` | Missing | Stop background subagents |
| `close()` | Done | Cleanup on exit |

## Phase 1: Dead Code Cleanup (This Session)
- Remove files not imported by any active code
- Remove dead LangChain-related modules from src/agent/
- Clean up barrel exports

## Phase 2: Architecture Separation
- Move LangChain code to src/langchain/
- Move SDK code to src/sdk/ (or keep in src/agent/ with clear naming)
- Clean CLI to clearly route between modes

## Phase 3: Complete SDK Message Processing
- Handle all 16 message types in sdk-agent.ts
- Emit structured UI events (not just text concatenation)
- Proper tool call tracking with start/progress/complete states

## Phase 4: UI Components
- Tool progress with spinner + elapsed time
- Thinking indicator (adaptive/enabled/disabled)
- Subagent task notifications
- Compact boundary indicator
- Auth status display

## Phase 5: Session & Control Features
- Multi-turn via streamInput()
- Get slash commands from SDK (supportedCommands())
- Get models from SDK (supportedModels())
- File checkpointing + /rewind
- Account info in /status

## Phase 6: Advanced Features
- Hook system integration
- Plugin loading
- Custom subagents via agents option
- Structured output support
- Sandbox settings
