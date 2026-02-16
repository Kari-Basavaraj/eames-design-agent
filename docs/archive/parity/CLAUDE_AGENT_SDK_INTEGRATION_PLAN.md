# Claude Agent SDK Integration Plan

**Project:** Eames Design Agent  
**Date:** 2026-01-12  
**Status:** Planning  

---

## Executive Summary

Integrate `@anthropic-ai/claude-agent-sdk` into Eames to unlock Claude Code-like capabilities (file operations, bash execution, MCP servers, sessions, hooks) while preserving the existing 5-phase agentic architecture and Ink-based terminal UI.

---

## Current Architecture

### Tech Stack
| Layer | Technology |
|-------|------------|
| Runtime | Bun |
| UI | React + Ink (terminal) |
| LLM Integration | LangChain.js + direct Anthropic SDK |
| Schema | Zod |
| Language | TypeScript |

### Agent Architecture
```
┌─────────────────────────────────────────────────────────────┐
│                      Orchestrator                           │
│  ┌──────────┐  ┌──────┐  ┌─────────┐  ┌─────────┐  ┌──────┐│
│  │Understand│→ │ Plan │→ │ Execute │→ │ Reflect │→ │Answer││
│  └──────────┘  └──────┘  └─────────┘  └─────────┘  └──────┘│
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                    Tool Executor                            │
│  • search_competitors    • search_ux_patterns               │
│  • search_design_trends  • search_accessibility             │
│  • tavily_search (web)                                      │
└─────────────────────────────────────────────────────────────┘
```

### Key Files
| File | Purpose |
|------|---------|
| `src/agent/orchestrator.ts` | Main 5-phase agent loop |
| `src/agent/claude-agent.ts` | Native Claude integration (partial) |
| `src/model/claude-native.ts` | Direct Anthropic SDK wrapper |
| `src/tools/index.ts` | LangChain tool definitions |
| `src/cli.tsx` | Ink-based terminal UI |

---

## Claude Agent SDK Capabilities

### Built-in Tools
| Tool | Description |
|------|-------------|
| `Read` | Read files from filesystem |
| `Edit` | Edit files with diffs |
| `Bash` | Execute shell commands |
| `Glob` | Find files by pattern |
| `Grep` | Search file contents |
| `WebFetch` | Fetch and process web content |
| `WebSearch` | Search the web |

### SDK Features
| Feature | Description |
|---------|-------------|
| **Agentic Loop** | Built-in `query()` with streaming messages |
| **Permissions** | `acceptEdits`, `bypassPermissions`, custom `canUseTool` |
| **Sessions** | Multi-turn conversations with `resume` |
| **Hooks** | `PreToolUse`, `PostToolUse`, `Stop` callbacks |
| **MCP Servers** | Connect to databases, APIs, external services |
| **Subagents** | Define specialized agents for subtasks |
| **Context Compaction** | Auto-summarization when approaching limits |
| **File Checkpointing** | Undo/redo file changes |
| **Skills** | Load specialized capabilities from `.claude/skills/` |
| **Slash Commands** | Custom commands from `.claude/commands/` |

---

## Integration Strategy

### Guiding Principles
1. **Non-breaking** - Existing functionality remains default
2. **Opt-in** - SDK mode activated via flag or command
3. **Incremental** - Migrate features one at a time
4. **Unified UI** - Both modes use same Ink components

---

## Phase 1: Foundation (Low Risk)

### Tasks
- [ ] Add `@anthropic-ai/claude-agent-sdk` dependency
- [ ] Create feature flag `EAMES_USE_AGENT_SDK`
- [ ] Create `src/agent/sdk-agent.ts` wrapper class
- [ ] Add `/sdk` toggle command in CLI

### New Files
```
src/
├── agent/
│   ├── sdk-agent.ts          # SDK wrapper implementing AgentCallbacks
│   └── sdk-tool-adapter.ts   # Bridge existing tools to SDK format
```

### package.json Addition
```json
{
  "dependencies": {
    "@anthropic-ai/claude-agent-sdk": "^0.2.4"
  }
}
```

### Deliverable
SDK agent runs alongside existing agent, switchable via `/sdk` command.

---

## Phase 2: Core Integration (Medium Risk)

### Tasks
- [ ] Map SDK message types to existing UI callbacks
- [ ] Implement streaming with `query()` → `onAnswerStream`
- [ ] Connect SDK tool calls to `onToolStart`/`onToolComplete`
- [ ] Preserve phase visualization in SDK mode

### Callback Mapping
| SDK Message | Eames Callback |
|-------------|----------------|
| `AssistantMessage` (text) | `onProgressMessage` |
| `AssistantMessage` (tool_use) | `onToolStart` |
| `ToolResultMessage` | `onToolComplete` |
| `ResultMessage` | `onAnswerComplete` |

### Architecture
```
┌──────────────────────────────────────────────────────────┐
│                      SdkAgent                            │
│  ┌────────────────────────────────────────────────────┐ │
│  │           Claude Agent SDK query()                 │ │
│  │  • Built-in tools (Read, Edit, Bash, etc.)        │ │
│  │  • Custom MCP tools (design research)             │ │
│  └────────────────────────────────────────────────────┘ │
│                          ↓                               │
│  ┌────────────────────────────────────────────────────┐ │
│  │           Message → Callback Adapter               │ │
│  │  Maps SDK streaming messages to AgentCallbacks    │ │
│  └────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────┘
                          ↓
┌──────────────────────────────────────────────────────────┐
│              Existing Ink UI Components                  │
│  • TaskListView  • PhaseStatusBar  • AnswerBox          │
└──────────────────────────────────────────────────────────┘
```

### Deliverable
SDK agent produces identical UI output to existing agent.

---

## Phase 3: Tool Migration (Medium Risk)

### Option A: MCP Server (Recommended)
Create an MCP server for design tools that SDK can call.

```typescript
// src/mcp/design-tools-server.ts
import { createSdkMcpServer, tool } from '@anthropic-ai/claude-agent-sdk';
import { z } from 'zod';

export const designToolsServer = createSdkMcpServer({
  name: 'eames-design-tools',
  tools: [
    tool('search_competitors', 'Find competitor features and UX patterns', 
      { query: z.string(), domain: z.string().optional() },
      async ({ query, domain }) => { /* existing logic */ }
    ),
    tool('search_ux_patterns', 'Research UX best practices',
      { topic: z.string() },
      async ({ topic }) => { /* existing logic */ }
    ),
  ]
});
```

### Option B: Custom Tools via allowedTools
Keep existing tools, expose via SDK's custom tool mechanism.

### Deliverable
Design research tools callable from SDK agent loop.

---

## Phase 4: SDK-Only Features (Low Risk)

### 4.1 File Operations
```typescript
const options = {
  allowedTools: ['Read', 'Edit', 'Glob', 'Grep'],
  permissionMode: 'acceptEdits',
};
```

**Use Case:** Generate React components, edit PRDs, create documentation.

### 4.2 Bash Execution
```typescript
const options = {
  allowedTools: ['Bash'],
  permissionMode: 'acceptEdits',
};
```

**Use Case:** Run linters, formatters, build commands on generated code.

### 4.3 Hooks for UI
```typescript
const options = {
  hooks: {
    PreToolUse: [{ 
      callback: async (toolName, input) => {
        callbacks.onToolStart?.(toolName, input);
        return { decision: 'approve' };
      }
    }],
    PostToolUse: [{
      callback: async (toolName, output) => {
        callbacks.onToolComplete?.(toolName, output);
      }
    }],
  }
};
```

### 4.4 Sessions (Multi-turn)
```typescript
// First query
const query1 = query('Design a checkout flow', { sessionId: 'design-session-1' });

// Continue later
const query2 = query('Add payment methods', { resume: 'design-session-1' });
```

### 4.5 File Checkpointing
```typescript
const options = {
  enableFileCheckpointing: true,
};
// Enables undo/redo for file changes
```

### Deliverable
Eames can read/write files, run commands, maintain sessions.

---

## Phase 5: Advanced Features (Future)

### 5.1 Subagents
```typescript
const options = {
  agents: {
    'ux-researcher': {
      systemPrompt: 'You are a UX research specialist...',
      allowedTools: ['WebSearch', 'WebFetch'],
    },
    'ui-engineer': {
      systemPrompt: 'You are a React/Tailwind expert...',
      allowedTools: ['Read', 'Edit', 'Bash'],
    },
  }
};
```

### 5.2 Skills Directory
```
.claude/
├── skills/
│   ├── figma-analysis/SKILL.md
│   ├── accessibility-audit/SKILL.md
│   └── component-generator/SKILL.md
```

### 5.3 Slash Commands
```
.claude/
├── commands/
│   ├── prd.md        # /prd - Generate PRD
│   ├── component.md  # /component - Generate React component
│   └── audit.md      # /audit - Run accessibility audit
```

---

## Migration Path

```
┌─────────────────────────────────────────────────────────────┐
│  Week 1: Phase 1                                            │
│  • Install SDK dependency                                   │
│  • Create SdkAgent wrapper                                  │
│  • Add /sdk toggle                                          │
├─────────────────────────────────────────────────────────────┤
│  Week 2: Phase 2                                            │
│  • Map SDK messages to UI callbacks                         │
│  • Test streaming parity                                    │
│  • Fix UI regressions                                       │
├─────────────────────────────────────────────────────────────┤
│  Week 3: Phase 3                                            │
│  • Create MCP server for design tools                       │
│  • Migrate search_competitors, search_ux_patterns           │
│  • Test end-to-end                                          │
├─────────────────────────────────────────────────────────────┤
│  Week 4: Phase 4                                            │
│  • Enable file operations (Read, Edit)                      │
│  • Add hooks for enhanced UI                                │
│  • Implement sessions                                       │
├─────────────────────────────────────────────────────────────┤
│  Future: Phase 5                                            │
│  • Subagents for specialized tasks                          │
│  • Skills and slash commands                                │
│  • Consider deprecating LangChain path                      │
└─────────────────────────────────────────────────────────────┘
```

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| SDK API changes | Medium | High | Pin version, monitor changelog |
| UI callback mismatch | Medium | Medium | Comprehensive adapter layer |
| Performance regression | Low | Medium | Benchmark before/after |
| Tool compatibility | Medium | Medium | MCP server abstraction |
| Breaking existing flows | Low | High | Feature flag, extensive testing |

---

## Success Criteria

### Phase 1
- [ ] SDK agent initializes without errors
- [ ] `/sdk` command toggles mode
- [ ] No impact on default (non-SDK) mode

### Phase 2
- [ ] SDK mode produces identical UI output
- [ ] Streaming works correctly
- [ ] Tool calls visible in TaskListView

### Phase 3
- [ ] Design tools work via MCP
- [ ] Research queries return expected results
- [ ] No regression in search quality

### Phase 4
- [ ] Can generate and save React components
- [ ] Can run bash commands (lint, format)
- [ ] Sessions persist across queries

---

## Appendix: Code Examples

### SdkAgent Wrapper
```typescript
// src/agent/sdk-agent.ts
import { query, ClaudeAgentOptions } from '@anthropic-ai/claude-agent-sdk';
import type { AgentCallbacks } from './orchestrator.js';

export class SdkAgent {
  constructor(private options: { model: string; callbacks?: AgentCallbacks }) {}

  async run(prompt: string): Promise<string> {
    const sdkOptions: ClaudeAgentOptions = {
      model: this.options.model,
      allowedTools: ['Read', 'Edit', 'Glob', 'WebSearch'],
      permissionMode: 'acceptEdits',
      systemPrompt: EAMES_SYSTEM_PROMPT,
    };

    let result = '';
    
    for await (const message of query(prompt, sdkOptions)) {
      if (message.type === 'assistant') {
        for (const block of message.content) {
          if ('text' in block) {
            this.options.callbacks?.onProgressMessage?.(block.text);
          } else if ('name' in block) {
            this.options.callbacks?.onToolStart?.(block.name);
          }
        }
      } else if (message.type === 'result') {
        result = message.result;
      }
    }

    return result;
  }
}
```

### CLI Toggle
```typescript
// In handleSubmit
if (query === '/sdk') {
  setUseSdkMode(prev => !prev);
  setStatusMessage(`SDK mode: ${!useSdkMode ? 'ON' : 'OFF'}`);
  return;
}
```

---

## References

- [Claude Agent SDK Documentation](https://platform.claude.com/docs/en/agent-sdk/overview)
- [TypeScript SDK Reference](https://platform.claude.com/docs/en/agent-sdk/typescript)
- [SDK GitHub Repository](https://github.com/anthropics/claude-agent-sdk-typescript)
- [Example Agents](https://github.com/anthropics/claude-agent-sdk-demos)
