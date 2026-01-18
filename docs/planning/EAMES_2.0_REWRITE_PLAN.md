# EAMES 2.0 - Complete Rewrite Plan
**Date:** 2026-01-18  
**Status:** 🎯 Ready to Execute  
**Goal:** Claude Code SDK features + Eames Brain intelligence + Design tools

---

## 🎯 THE VISION (Unchanged)

**Eames = Claude Code + Design Intelligence**

- ✅ 100% Claude Code SDK features (file ops, MCP, sessions, permissions)
- ✅ Eames Brain (5-phase: Discovery → Define → Design → Develop → Deliver)
- ✅ Design research tools (competitors, market, PRD generation)
- ✅ Claude Code UI (clean, minimal, fast)

---

## 🔥 WHAT WENT WRONG (v1.0)

### The Mistake
You tried to merge **THREE different systems**:

```
Dexter (LangChain) ←→ Claude Agent SDK ←→ Native Anthropic SDK
       ↓                      ↓                      ↓
   5-phase orchestrator   SDK wrapper         Direct API calls
       ↓                      ↓                      ↓
   LangChain tools        Message processor    Custom tools
```

**Result:** They fight each other, nothing works properly.

### Why It Failed
1. **Dexter's orchestrator** expects LangChain tools
2. **Claude SDK** has its own orchestration (conflicts with Dexter)
3. **Custom processors** intercept SDK messages (breaks functionality)
4. **LangChain tools** can't be used with SDK directly
5. **Three execution paths** = maintenance nightmare

---

## ✅ THE CORRECT ARCHITECTURE (v2.0)

### Single Source of Truth: Claude Agent SDK

```
┌─────────────────────────────────────────────────────────────┐
│                    EAMES 2.0 ARCHITECTURE                    │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  User Query                                                  │
│      ↓                                                       │
│  ┌────────────────────────────────────────────────┐         │
│  │  EAMES BRAIN (PreQuery Hook)                   │         │
│  │  - Detect design phase (Discovery/Define/etc)  │         │
│  │  - Enrich prompt with context                  │         │
│  │  - Add relevant MCP servers dynamically        │         │
│  └────────────────────────────────────────────────┘         │
│      ↓                                                       │
│  ┌────────────────────────────────────────────────┐         │
│  │  CLAUDE AGENT SDK (Core Engine)                │         │
│  │  - All Claude Code features                    │         │
│  │  - File operations (Read/Write/Edit)           │         │
│  │  - Bash execution                              │         │
│  │  - MCP servers (including custom)              │         │
│  │  - Sessions & checkpointing                    │         │
│  │  - Permission system                           │         │
│  └────────────────────────────────────────────────┘         │
│      ↓                                                       │
│  ┌────────────────────────────────────────────────┐         │
│  │  EAMES MCP SERVERS (Design Tools)              │         │
│  │  - mcp-design-research                         │         │
│  │  - mcp-competitor-analysis                     │         │
│  │  - mcp-prd-generator                           │         │
│  │  - mcp-market-research                         │         │
│  └────────────────────────────────────────────────┘         │
│      ↓                                                       │
│  Ink UI (Passive Display)                                   │
│  - Shows SDK output                                         │
│  - Adds phase indicators                                    │
│  - Handles permissions                                      │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Key Principles
1. **SDK is the boss** - It controls execution flow
2. **Eames Brain is a hook** - Enriches queries before SDK processing
3. **Design tools are MCP servers** - SDK natively supports them
4. **UI is passive** - Displays what SDK emits, doesn't control logic

---

## 🚀 IMPLEMENTATION PLAN

### Phase 1: Clean Slate (2 hours)

**Goal:** Remove all conflicting code, keep only what works

```bash
# Archive old implementation
mkdir archive
mv src/agent/orchestrator.ts archive/
mv src/agent/phases archive/
mv src/agent/task-executor.ts archive/
mv src/agent/tool-executor.ts archive/
mv src/agent/enhanced-sdk-processor.ts archive/
mv src/agent/sdk-message-processor.ts archive/
mv src/hooks/useNativeAgent.ts archive/
mv src/model/claude-native.ts archive/

# Keep these:
# - src/cli.tsx (UI)
# - src/components/* (UI components)
# - src/tools/* (will convert to MCP)
# - src/agent/prompts.ts
# - src/utils/*
```

**Files to create:**
1. `src/eames-brain.ts` - PreQuery hook logic
2. `src/mcp-servers/` - Convert tools to MCP servers
3. `src/hooks/useClaudeSDK.ts` - Simple SDK hook

---

### Phase 2: Eames Brain as PreQuery Hook (4 hours)

**File:** `src/eames-brain.ts`

```typescript
// Eames Brain - Enriches queries before SDK processing
export interface DesignPhase {
  phase: 'discovery' | 'define' | 'design' | 'develop' | 'deliver';
  mcpServers: string[];  // Which MCP servers to load
  systemPromptAddition: string;  // Phase-specific guidance
}

export class EamesBrain {
  /**
   * Analyzes user query and determines design phase
   */
  detectPhase(query: string): DesignPhase {
    const queryLower = query.toLowerCase();
    
    // Discovery: Research, competitors, market
    if (queryLower.match(/research|competitor|market|user|pain point/i)) {
      return {
        phase: 'discovery',
        mcpServers: ['design-research', 'tavily-search'],
        systemPromptAddition: `
You are in DISCOVERY phase. Focus on:
- Understanding user needs
- Researching competitors
- Identifying market trends
- Finding pain points

Use design research tools to gather insights.
        `.trim(),
      };
    }
    
    // Define: PRD, requirements, user stories
    if (queryLower.match(/prd|requirement|user stor|spec/i)) {
      return {
        phase: 'define',
        mcpServers: ['prd-generator', 'filesystem'],
        systemPromptAddition: `
You are in DEFINE phase. Focus on:
- Writing clear requirements
- Creating user stories
- Defining success metrics
- Structuring PRDs

Generate well-structured documentation.
        `.trim(),
      };
    }
    
    // Design: UI/UX, wireframes, components
    if (queryLower.match(/design|wireframe|ui|ux|component|prototype/i)) {
      return {
        phase: 'design',
        mcpServers: ['ui-generator', 'figma'],
        systemPromptAddition: `
You are in DESIGN phase. Focus on:
- Creating wireframes
- Designing components
- Establishing patterns
- Visual hierarchy

Apply design best practices.
        `.trim(),
      };
    }
    
    // Develop: Code, tests, implementation
    if (queryLower.match(/code|implement|test|build|function/i)) {
      return {
        phase: 'develop',
        mcpServers: ['filesystem', 'bash'],
        systemPromptAddition: `
You are in DEVELOP phase. Focus on:
- Writing clean code
- Creating tests
- Following patterns
- Documentation

Generate production-ready code.
        `.trim(),
      };
    }
    
    // Deliver: Deploy, CI/CD, monitoring
    if (queryLower.match(/deploy|ship|release|ci\/cd|production/i)) {
      return {
        phase: 'deliver',
        mcpServers: ['github', 'bash'],
        systemPromptAddition: `
You are in DELIVER phase. Focus on:
- Deployment process
- CI/CD setup
- Monitoring
- Documentation

Ensure production readiness.
        `.trim(),
      };
    }
    
    // Default: General query
    return {
      phase: 'develop',  // Most common
      mcpServers: ['filesystem', 'bash'],
      systemPromptAddition: '',
    };
  }
  
  /**
   * Enriches user query with phase context
   */
  enrichQuery(query: string): { 
    enrichedQuery: string; 
    phase: DesignPhase;
    systemPrompt: string;
  } {
    const phase = this.detectPhase(query);
    
    return {
      enrichedQuery: query,  // Keep original for now
      phase,
      systemPrompt: phase.systemPromptAddition,
    };
  }
}
```

---

### Phase 3: Convert Tools to MCP Servers (6 hours)

**Why MCP?** Claude Agent SDK natively supports MCP servers, making them first-class tools.

**Create:** `src/mcp-servers/design-research/index.ts`

```typescript
// MCP Server for design research tools
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { TavilySearchResults } from '@langchain/community/tools/tavily_search';

const server = new Server(
  {
    name: 'design-research-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Tool: Search competitors
server.setRequestHandler('tools/list', async () => {
  return {
    tools: [
      {
        name: 'search_competitors',
        description: 'Search for competitor products, features, and UX patterns',
        inputSchema: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description: 'Competitor search query (e.g., "Stripe checkout flow")',
            },
            industry: {
              type: 'string',
              description: 'Industry filter (optional)',
            },
          },
          required: ['query'],
        },
      },
      {
        name: 'analyze_market',
        description: 'Analyze market trends and user needs for a product space',
        inputSchema: {
          type: 'object',
          properties: {
            market: {
              type: 'string',
              description: 'Market or product category to analyze',
            },
          },
          required: ['market'],
        },
      },
      // Add more tools...
    ],
  };
});

// Tool handler
server.setRequestHandler('tools/call', async (request) => {
  const { name, arguments: args } = request.params;
  
  switch (name) {
    case 'search_competitors': {
      // Use Tavily for web search
      const tavily = new TavilySearchResults({
        maxResults: 5,
        apiKey: process.env.TAVILY_API_KEY,
      });
      
      const searchQuery = `${args.query} competitor analysis UX patterns`;
      const results = await tavily.invoke(searchQuery);
      
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(results, null, 2),
          },
        ],
      };
    }
    
    case 'analyze_market': {
      // Market research logic
      const tavily = new TavilySearchResults({
        maxResults: 5,
        apiKey: process.env.TAVILY_API_KEY,
      });
      
      const searchQuery = `${args.market} market trends user needs 2024`;
      const results = await tavily.invoke(searchQuery);
      
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(results, null, 2),
          },
        ],
      };
    }
    
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
});

// Start server
const transport = new StdioServerTransport();
await server.connect(transport);
```

**Register in package.json:**
```json
{
  "bin": {
    "mcp-design-research": "./src/mcp-servers/design-research/index.ts"
  }
}
```

---

### Phase 4: Simple SDK Hook (2 hours)

**File:** `src/hooks/useClaudeSDK.ts`

```typescript
import { useState, useCallback, useRef } from 'react';
import { query } from '@anthropic-ai/claude-agent-sdk';
import { EamesBrain } from '../eames-brain.js';

export function useClaudeSDK() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentPhase, setCurrentPhase] = useState<string>('idle');
  const [answer, setAnswer] = useState<string>('');
  const sessionIdRef = useRef<string | null>(null);
  const brain = useRef(new EamesBrain());
  
  const execute = useCallback(async (userQuery: string) => {
    setIsProcessing(true);
    setAnswer('');
    
    try {
      // Eames Brain enriches the query
      const enriched = brain.current.enrichQuery(userQuery);
      setCurrentPhase(enriched.phase.phase);
      
      // Call Claude SDK directly
      const result = await query(userQuery, {
        model: 'claude-sonnet-4-5',
        cwd: process.cwd(),
        resume: sessionIdRef.current ?? undefined,
        permissionMode: 'default',  // Interactive prompts
        
        // Load phase-specific MCP servers
        mcpServers: enriched.phase.mcpServers.reduce((acc, name) => {
          acc[name] = {
            command: 'bun',
            args: ['run', `mcp-${name}`],
          };
          return acc;
        }, {} as Record<string, { command: string; args: string[] }>),
        
        // Add phase-specific system prompt
        appendSystemPrompt: enriched.systemPrompt,
      });
      
      // SDK returns the final answer
      setAnswer(result);
      sessionIdRef.current = result.sessionId;  // Save for multi-turn
      
    } catch (error) {
      setAnswer(`Error: ${error.message}`);
    } finally {
      setIsProcessing(false);
      setCurrentPhase('idle');
    }
  }, []);
  
  return {
    execute,
    isProcessing,
    currentPhase,
    answer,
  };
}
```

---

### Phase 5: Update CLI (1 hour)

**File:** `src/cli.tsx` - Update to use new hook

```typescript
import { useClaudeSDK } from './hooks/useClaudeSDK.js';

export function CLI() {
  const { execute, isProcessing, currentPhase, answer } = useClaudeSDK();
  
  const handleSubmit = useCallback(async (query: string) => {
    await execute(query);
  }, [execute]);
  
  return (
    <Box flexDirection="column">
      {/* Phase indicator */}
      {isProcessing && (
        <Box>
          <Text color="blue">
            {getPhaseEmoji(currentPhase)} {currentPhase}...
          </Text>
        </Box>
      )}
      
      {/* SDK output appears here automatically via stdout */}
      
      {/* Final answer */}
      {answer && (
        <Box marginTop={1}>
          <MarkdownText>{answer}</MarkdownText>
        </Box>
      )}
      
      {/* Input */}
      <EnhancedInput onSubmit={handleSubmit} disabled={isProcessing} />
    </Box>
  );
}

function getPhaseEmoji(phase: string): string {
  const emojis: Record<string, string> = {
    discovery: '🔍',
    define: '📋',
    design: '🎨',
    develop: '⚙️',
    deliver: '🚀',
  };
  return emojis[phase] || '💡';
}
```

---

## 📊 BEFORE VS AFTER

### Before (v1.0) - BROKEN
```
3000+ lines of custom orchestration
Multiple execution paths
SDK features blocked by custom processors
Tools don't work with SDK
Complex state management
70% "parity" but nothing works
```

### After (v2.0) - CLEAN
```
500 lines total
One execution path (SDK)
All SDK features work natively
Tools via MCP (SDK-native)
SDK handles state
100% parity because it IS Claude Code SDK + Eames Brain
```

---

## ⏱️ TIMELINE

| Phase | Hours | Description |
|-------|-------|-------------|
| 1. Clean Slate | 2h | Archive old code |
| 2. Eames Brain | 4h | PreQuery hook |
| 3. MCP Servers | 6h | Convert 5 main tools |
| 4. SDK Hook | 2h | Simple React hook |
| 5. CLI Update | 1h | Wire it all up |
| **TOTAL** | **15h** | **~2 days** |

---

## ✅ SUCCESS CRITERIA

After rewrite:
- [ ] CLI shows tool execution (SDK native display)
- [ ] Eames Brain detects phases correctly
- [ ] MCP design tools work
- [ ] Permission system works (all 4 modes)
- [ ] Session resume works
- [ ] File operations work
- [ ] Multi-turn conversations work
- [ ] Phase indicators show in UI
- [ ] Answer appears immediately (no delay)
- [ ] Tool results visible in real-time

---

## 🎯 DECISION TIME

**Question:** Should we do this complete rewrite?

**Pros:**
- ✅ Actually works (unlike current v1.0)
- ✅ 100% Claude Code SDK features guaranteed
- ✅ Eames Brain intelligence preserved
- ✅ Design tools via MCP (proper integration)
- ✅ Simple, maintainable codebase
- ✅ 15 hours vs infinite fixes on broken architecture

**Cons:**
- ❌ Abandon current 3000+ lines
- ❌ 2 days of focused work
- ❌ Need to rebuild MCP servers

**My recommendation:** **DO IT.** The current architecture is fundamentally broken. No amount of patches will fix it. This is why you've spent $1000 without progress - you're trying to fix an unfixable architecture.

---

## 🚀 NEXT STEPS

1. **Your decision:** Rewrite vs keep patching?
2. **If rewrite:** I can start Phase 1 immediately
3. **If patch:** We continue current approach (not recommended)

What do you want to do?
