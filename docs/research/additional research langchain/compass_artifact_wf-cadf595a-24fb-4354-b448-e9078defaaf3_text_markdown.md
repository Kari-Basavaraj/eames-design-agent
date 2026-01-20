# Eames Design Agent v2.0: Complete architectural blueprint

**DeepAgents provides an excellent foundation for the 5-phase autonomous product design agent**. The framework's built-in subagent delegation, filesystem backends, context management, and LangSmith integration directly address your core requirements. Combined with patterns from Claude Code (single-threaded simplicity), Replit Agent (checkpointing), and Cursor (parallel execution), you can achieve the **<15 min, <$5, 90%+ success** targets.

---

## Is DeepAgents the right choice?

DeepAgents is **the right foundation** for Eames Design Agent v2.0. It's a TypeScript-first agent harness built on LangGraph, specifically designed for long-horizon task execution—exactly your use case. The framework provides four critical components out of the box: **planning tools** (todo list management), **filesystem backends** (context management), **subagent delegation** (isolated task execution), and **detailed system prompts** (behavioral instructions).

Alternative considerations reveal DeepAgents' advantages. Building directly on LangGraph would require reimplementing todo tracking, filesystem abstraction, summarization, and prompt caching—all included in DeepAgents. The Claude Agent SDK focuses on simpler single-turn interactions. AutoGen and CrewAI target different multi-agent paradigms less suited to sequential phase workflows. DeepAgents' middleware architecture allows adding custom tools (GitHub, deployment) while preserving battle-tested components.

**One caveat**: verify Bun compatibility with `@langchain/langgraph` before committing. LangChain.js has partial Bun support—basic operations work, but some async utilities may need workarounds. Run integration tests early.

---

## Optimal architecture for 5-phase workflow

The recommended architecture uses **LangGraph nodes for phases** with **subagents for specialized tasks within phases**. This hybrid approach balances simplicity with the isolation benefits of subagents.

```
┌─────────────────────────────────────────────────────────────────────┐
│                        MAIN ORCHESTRATOR                             │
│  (LangGraph StateGraph with phase nodes + DeepAgents middleware)    │
└─────────────────────────────────────────────────────────────────────┘
                                    │
    ┌───────────────────────────────┼───────────────────────────────┐
    │                               │                               │
┌───▼────┐  ┌────────┐  ┌───────┐  ┌▼──────┐  ┌────────┐
│DISCOVERY│→│ DEFINE │→│DESIGN │→│DEVELOP│→│DELIVER │
│  Node  │  │  Node  │  │ Node  │  │ Node  │  │  Node  │
└────────┘  └────────┘  └───────┘  └───────┘  └────────┘
    │            │           │          │          │
    ▼            ▼           ▼          ▼          ▼
┌────────┐  ┌────────┐  ┌───────┐  ┌───────┐  ┌───────┐
│Research│  │  PRD   │  │  UI   │  │ Code  │  │Deploy │
│Subagent│  │Subagent│  │Subagent│  │Subagent│  │Subagent│
│(parallel)│ │Generator│ │Designer│ │Writer │  │Runner │
└────────┘  └────────┘  └───────┘  └───────┘  └───────┘
```

**Why this hybrid approach?** Claude Code's success with a single-threaded master loop proves sophisticated behavior emerges from constraints, not complexity. Phase nodes provide deterministic sequencing and clear state boundaries. Subagents handle specialized tasks with isolated context windows—critical for preventing the **20k+ token code files** from polluting the main context.

### State flow between phases

```typescript
const EamesState = Annotation.Root({
  // Core tracking
  projectId: Annotation<string>(),
  userRequest: Annotation<string>(),
  currentPhase: Annotation<"discovery" | "define" | "design" | "develop" | "deliver">(),
  
  // Phase outputs (condensed summaries, NOT full artifacts)
  discoveryInsights: Annotation<DiscoveryOutput | null>(),
  prdSummary: Annotation<PRDSummary | null>(),
  designSpec: Annotation<DesignSpec | null>(),
  codeManifest: Annotation<CodeManifest | null>(),
  deploymentResult: Annotation<DeploymentResult | null>(),
  
  // Conversation tracking
  messages: Annotation<BaseMessage[]>({
    reducer: (a, b) => a.concat(b),
  }),
  
  // TODO tracking (DeepAgents built-in)
  todos: Annotation<Todo[]>(),
  
  // Error handling
  errorCount: Annotation<number>({ reducer: (a, b) => a + b, default: () => 0 }),
  lastError: Annotation<string | null>(),
  
  // Human-in-the-loop
  awaitingApproval: Annotation<boolean>(),
  approvalType: Annotation<"prd" | "design" | "deploy" | null>(),
});
```

**Critical pattern**: Store **condensed summaries** in state (~1,000-2,000 tokens), write **full artifacts** to filesystem. The Discovery phase returns 500 words of insights, not 50 pages of research. The Design phase returns component specifications, not complete Figma JSON. This prevents context window bloat.

### Handling phase dependencies

Use **conditional edges** with explicit dependency checking:

```typescript
const routeFromDefine = (state: EamesState): string => {
  if (!state.prdSummary) return "define"; // Retry if missing
  if (state.awaitingApproval) return "approval_gate";
  return "design";
};

const graph = new StateGraph(EamesState)
  .addNode("discovery", discoveryNode)
  .addNode("define", defineNode)
  .addNode("approval_gate", approvalNode)
  .addNode("design", designNode)
  .addNode("develop", developNode)
  .addNode("deliver", deliverNode)
  .addEdge(START, "discovery")
  .addEdge("discovery", "define")
  .addConditionalEdges("define", routeFromDefine, ["define", "approval_gate", "design"])
  .addEdge("approval_gate", "design")
  .addConditionalEdges("design", routeFromDesign, ["design", "develop"])
  .addConditionalEdges("develop", routeFromDevelop, ["develop", "deliver"])
  .addEdge("deliver", END)
  .compile({ checkpointer, interruptBefore: ["approval_gate"] });
```

### Parallel execution opportunities

**Within Discovery phase**: Competitive analysis, user research, market research can run simultaneously:

```typescript
const discoveryNode = async (state: EamesState) => {
  // Fan-out to parallel research subagents
  const [competitive, market, user] = await Promise.all([
    competitiveAnalysisSubagent.invoke({ query: state.userRequest }),
    marketResearchSubagent.invoke({ query: state.userRequest }),
    userResearchSubagent.invoke({ query: state.userRequest }),
  ]);
  
  // Synthesize results
  const insights = await synthesizeResearch(competitive, market, user);
  await Bun.write("/workspace/discovery/research.md", fullResearchReport);
  
  return { discoveryInsights: insights }; // Condensed summary only
};
```

**Within Develop phase**: Independent component files can be generated in parallel after architecture is defined.

---

## Filesystem architecture with DeepAgents backends

The proposed `/workspace/`, `/memories/`, `/deliverables/` structure maps perfectly to DeepAgents' CompositeBackend:

```typescript
import { 
  createDeepAgent, 
  CompositeBackend, 
  StateBackend, 
  StoreBackend,
  FilesystemBackend 
} from "deepagents";
import { InMemoryStore } from "@langchain/langgraph";

const store = new InMemoryStore(); // Or PostgresStore for production

const eamesBackend = (rt: RuntimeContext) => new CompositeBackend(
  // Default: ephemeral scratch space
  new StateBackend(rt),
  {
    // /workspace/: Ephemeral working files (auto-evicted)
    "/workspace/": new StateBackend(rt),
    
    // /memories/: Persistent cross-session (user prefs, project history)
    "/memories/": new StoreBackend(rt),
    
    // /deliverables/: Real filesystem (actual code output)
    "/deliverables/": new FilesystemBackend({ 
      rootDir: "./output",
      virtualMode: true 
    }),
  }
);

const agent = createDeepAgent({
  backend: eamesBackend,
  store,
  checkpointer: new PostgresSaver({ connectionString: DB_URI }),
});
```

**Path routing explained:**
- **`/workspace/research/`** → StateBackend: Research notes, intermediate analysis. Auto-evicted when exceeding 20k tokens.
- **`/workspace/drafts/`** → StateBackend: PRD drafts, design iterations. Cleared between runs.
- **`/memories/user/{userId}/preferences.json`** → StoreBackend: User coding style, brand guidelines, past decisions.
- **`/memories/projects/{projectId}/history.json`** → StoreBackend: Project-specific learnings.
- **`/deliverables/src/`** → FilesystemBackend: Actual TypeScript/React code files.
- **`/deliverables/package.json`** → FilesystemBackend: Real files pushed to GitHub.

### Handling large artifacts

The **20k token threshold** for auto-eviction is configurable via FilesystemMiddleware:

```typescript
import { createFilesystemMiddleware } from "deepagents";

const filesystemMiddleware = createFilesystemMiddleware({
  backend: eamesBackend,
  toolTokenLimitBeforeEvict: 20000, // Default, adjust as needed
  systemPrompt: `When tool outputs exceed limits, they're saved to files.
Reference files by path instead of including content in responses.`,
});
```

**Strategy for code files**: Never include full code in LLM responses. Write to `/deliverables/`, return only file paths and summaries:

```typescript
const codeWriterSubagent: SubAgent = {
  name: "code-writer",
  description: "Generates production code files",
  systemPrompt: `Write code to /deliverables/src/. 
NEVER include full file contents in responses.
Instead return: { path: "/deliverables/src/App.tsx", summary: "Main app component with routing", lines: 145 }`,
  tools: [writeFileTool, editFileTool],
};
```

### GitHub persistence flow

```typescript
// After Deliver phase completes
const persistToGitHub = async (state: EamesState) => {
  const files = await glob("/deliverables/**/*");
  
  // Create repo via GitHub API
  const repo = await github.createRepo({
    name: state.projectId,
    description: state.prdSummary?.description,
  });
  
  // Commit all deliverables
  await github.createCommit({
    repo: repo.full_name,
    files: files.map(f => ({
      path: f.replace("/deliverables/", ""),
      content: await Bun.file(f).text(),
    })),
    message: "Initial commit from Eames Design Agent",
  });
  
  return { deploymentResult: { repo: repo.html_url } };
};
```

---

## Subagent structure and interactions

### Should each phase have filesystem access?

**Yes, but with scoped paths.** Each subagent operates on specific filesystem areas:

| Subagent | Read Access | Write Access |
|----------|-------------|--------------|
| Research | Web (tools), `/memories/` | `/workspace/research/` |
| PRD Writer | `/workspace/research/`, `/memories/` | `/workspace/prd/` |
| Designer | `/workspace/prd/`, `/memories/` | `/workspace/design/`, `/deliverables/public/` |
| Developer | `/workspace/design/`, `/memories/` | `/deliverables/src/` |
| Deployer | `/deliverables/` | `/memories/projects/` |

### Passing large outputs between subagents

**Use file references, not direct content passing.** The main orchestrator passes paths:

```typescript
const defineNode = async (state: EamesState) => {
  const prdSubagent = createSubagent({
    name: "prd-writer",
    systemPrompt: `Create a PRD based on research at /workspace/research/.
Write full PRD to /workspace/prd/prd.md.
Return only a 500-word summary for the next phase.`,
  });
  
  const result = await prdSubagent.invoke({
    messages: [{ role: "user", content: `Research insights: ${state.discoveryInsights}` }],
  });
  
  // Result contains summary, full PRD is on filesystem
  return { 
    prdSummary: result.summary,
    prdPath: "/workspace/prd/prd.md" 
  };
};
```

### Can subagents spawn sub-subagents?

**Yes, but limit depth to 2.** DeepAgents supports recursive subagent spawning. Design phase example:

```typescript
const designSubagent: SubAgent = {
  name: "design-orchestrator",
  description: "Coordinates UI/UX design work",
  systemPrompt: `You coordinate design work by delegating to:
- ui-component-designer: Creates component specifications
- ux-flow-designer: Designs user flows and interactions
Write consolidated design spec to /workspace/design/spec.json`,
  subagents: [
    {
      name: "ui-component-designer",
      description: "Designs individual UI components",
      systemPrompt: "...",
      // NO sub-subagents allowed at this level
    },
    {
      name: "ux-flow-designer", 
      description: "Designs user flows",
      systemPrompt: "...",
    }
  ],
};
```

**Prevent deeper recursion** by not providing `subagents` config to leaf subagents.

### Failure and retry handling

Implement **per-subagent retry with escalation**:

```typescript
const executeWithRetry = async (
  subagent: CompiledGraph,
  input: any,
  maxRetries = 3
): Promise<SubagentResult> => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await subagent.invoke(input);
      return { success: true, result };
    } catch (error) {
      if (attempt === maxRetries) {
        return { 
          success: false, 
          error,
          escalate: true,
          context: `Failed after ${maxRetries} attempts: ${error.message}`
        };
      }
      // Exponential backoff
      await new Promise(r => setTimeout(r, 1000 * Math.pow(2, attempt)));
    }
  }
};
```

---

## Custom tools and middleware

### Critical tools (build these first)

**1. GitHub Integration Middleware:**
```typescript
import { tool } from "langchain";
import { Octokit } from "@octokit/rest";

const github = new Octokit({ auth: process.env.GITHUB_TOKEN });

const createRepoTool = tool(
  async ({ name, description, isPrivate }) => {
    const { data } = await github.repos.create({
      name,
      description,
      private: isPrivate,
      auto_init: true,
    });
    return JSON.stringify({ url: data.html_url, clone_url: data.clone_url });
  },
  {
    name: "github_create_repo",
    description: "Create a new GitHub repository",
    schema: z.object({
      name: z.string(),
      description: z.string(),
      isPrivate: z.boolean().default(false),
    }),
  }
);

const pushCodeTool = tool(
  async ({ repo, files, message }) => {
    // Implementation using GitHub Contents API or git commands
    for (const file of files) {
      await github.repos.createOrUpdateFileContents({
        owner: repo.split("/")[0],
        repo: repo.split("/")[1],
        path: file.path,
        message,
        content: Buffer.from(file.content).toString("base64"),
      });
    }
    return "Code pushed successfully";
  },
  {
    name: "github_push_code",
    description: "Push code files to a GitHub repository",
    schema: z.object({
      repo: z.string().describe("owner/repo format"),
      files: z.array(z.object({ path: z.string(), content: z.string() })),
      message: z.string(),
    }),
  }
);

class GitHubMiddleware implements AgentMiddleware {
  tools = [createRepoTool, pushCodeTool, triggerActionsTool, createPRTool];
  systemPrompt = `You can create GitHub repositories, push code, and trigger Actions workflows.`;
}
```

**2. Deployment Tools (Vercel):**
```typescript
const deployToVercelTool = tool(
  async ({ projectName, gitRepo }) => {
    const response = await fetch("https://api.vercel.com/v13/deployments", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.VERCEL_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: projectName,
        gitSource: { type: "github", repo: gitRepo },
      }),
    });
    const data = await response.json();
    return JSON.stringify({ url: data.url, status: data.status });
  },
  {
    name: "deploy_vercel",
    description: "Deploy project to Vercel from GitHub repo",
    schema: z.object({
      projectName: z.string(),
      gitRepo: z.string(),
    }),
  }
);
```

**3. QA Tools:**
```typescript
const runLintTool = tool(
  async ({ projectPath }) => {
    const proc = Bun.spawn(["bunx", "eslint", "."], { 
      cwd: projectPath,
      stdout: "pipe",
      stderr: "pipe"
    });
    const output = await proc.stdout.text();
    const exitCode = await proc.exited;
    return JSON.stringify({ success: exitCode === 0, output });
  },
  { name: "run_lint", description: "Run ESLint on project", schema: z.object({ projectPath: z.string() }) }
);

const runTypeCheckTool = tool(
  async ({ projectPath }) => {
    const proc = Bun.spawn(["bunx", "tsc", "--noEmit"], { cwd: projectPath, stdout: "pipe" });
    const output = await proc.stdout.text();
    return JSON.stringify({ success: (await proc.exited) === 0, output });
  },
  { name: "run_typecheck", description: "Run TypeScript type checking", schema: z.object({ projectPath: z.string() }) }
);
```

### Nice-to-have tools (build later)

- **Figma JSON export** (Design phase)
- **Component library lookup** (shadcn/ui component specs)
- **Accessibility checker** (axe-core integration)
- **Performance analyzer** (Lighthouse CLI)
- **Linear integration** (via MCP)

### Middleware composition

```typescript
import { createDeepAgent, type AgentMiddleware } from "deepagents";

// Custom middleware
class QAMiddleware implements AgentMiddleware {
  tools = [runLintTool, runTypeCheckTool, runTestsTool];
  systemPrompt = `Before marking any code task complete, run linting, type checking, and tests.`;
}

class DeploymentMiddleware implements AgentMiddleware {
  tools = [deployToVercelTool, setEnvVarsTool, checkDeploymentStatusTool];
  systemPrompt = `Deploy applications using Vercel. Always verify deployment status.`;
}

// Compose with built-in middleware
const agent = createDeepAgent({
  model: "claude-sonnet-4-20250514",
  middleware: [
    new GitHubMiddleware(),
    new QAMiddleware(),
    new DeploymentMiddleware(),
  ],
  // Built-in middleware (TodoList, Filesystem, SubAgent, Summarization, PromptCaching) 
  // are automatically included
});
```

---

## CLI implementation with React Ink

### Build custom CLI, don't extend deepagents-cli

The `deepagents-cli` is Python-based. Build a custom Bun/Ink CLI that interfaces with the `deepagents` npm package:

```typescript
#!/usr/bin/env bun
// src/cli.tsx
import React, { useState, useEffect } from 'react';
import { render, Box, Text, Static } from 'ink';
import { Spinner, StatusMessage, ProgressBar } from '@inkjs/ui';
import meow from 'meow';
import { EamesAgent } from './agent.js';

const cli = meow(`
  Usage
    $ eames <description>

  Options
    --resume          Resume last session
    --phase           Start from specific phase
    --approve-all     Skip approval prompts
    --dry-run         Plan without executing

  Examples
    $ eames "Build a todo app with React and Supabase"
    $ eames --resume
`, {
  importMeta: import.meta,
  flags: {
    resume: { type: 'boolean', default: false },
    phase: { type: 'string' },
    approveAll: { type: 'boolean', default: false },
    dryRun: { type: 'boolean', default: false },
  }
});

const PHASES = ['Discovery', 'Define', 'Design', 'Develop', 'Deliver'];

const App = ({ input, flags }) => {
  const [logs, setLogs] = useState<string[]>([]);
  const [currentPhase, setCurrentPhase] = useState(0);
  const [status, setStatus] = useState('initializing');
  const [awaitingApproval, setAwaitingApproval] = useState(null);
  const [streamingText, setStreamingText] = useState('');

  // Phase progress visualization
  const PhaseProgress = () => (
    <Box flexDirection="column" marginBottom={1}>
      {PHASES.map((phase, i) => (
        <Box key={phase} gap={2}>
          <Text color={i < currentPhase ? 'green' : i === currentPhase ? 'blue' : 'gray'}>
            {i < currentPhase ? '✓' : i === currentPhase ? '▶' : '○'}
          </Text>
          <Text dimColor={i > currentPhase}>{phase}</Text>
        </Box>
      ))}
    </Box>
  );

  // Approval flow component
  const ApprovalPrompt = ({ approval }) => (
    <Box flexDirection="column" borderStyle="round" borderColor="yellow" padding={1}>
      <Text bold>Approval Required: {approval.type}</Text>
      <Text>{approval.description}</Text>
      <Box marginTop={1}>
        <Text>[y] Approve  [e] Edit  [n] Reject</Text>
      </Box>
    </Box>
  );

  return (
    <Box flexDirection="column">
      <Box borderStyle="round" borderColor="blue" paddingX={2}>
        <Text bold color="blue">Eames Design Agent</Text>
      </Box>

      <PhaseProgress />

      {/* Static logs */}
      <Static items={logs}>
        {(log, i) => <Text key={i} dimColor>{log}</Text>}
      </Static>

      {/* Current activity */}
      {status === 'running' && (
        <Box gap={1}>
          <Spinner />
          <Text>{streamingText || 'Processing...'}</Text>
        </Box>
      )}

      {/* Approval prompt */}
      {awaitingApproval && <ApprovalPrompt approval={awaitingApproval} />}
    </Box>
  );
};

render(<App input={cli.input[0]} flags={cli.flags} />);
```

### State persistence for --resume

```typescript
// src/state/session.ts
const SESSION_DIR = `${process.env.HOME}/.eames/sessions`;

interface SessionState {
  id: string;
  projectDescription: string;
  startedAt: string;
  lastUpdatedAt: string;
  currentPhase: number;
  checkpointId: string;
  threadId: string;
  status: 'running' | 'suspended' | 'completed' | 'failed';
}

export async function saveSession(state: SessionState) {
  await Bun.write(
    `${SESSION_DIR}/${state.id}.json`, 
    JSON.stringify(state, null, 2)
  );
  // Also save as "latest" for easy resume
  await Bun.write(`${SESSION_DIR}/latest.json`, JSON.stringify(state, null, 2));
}

export async function loadLatestSession(): Promise<SessionState | null> {
  const file = Bun.file(`${SESSION_DIR}/latest.json`);
  if (await file.exists()) {
    return await file.json();
  }
  return null;
}

export async function resumeSession(sessionId: string) {
  const session = await loadLatestSession();
  if (!session || session.status !== 'suspended') {
    throw new Error('No suspended session to resume');
  }
  
  // Resume LangGraph from checkpoint
  const result = await agent.invoke(
    { messages: [] }, // Empty, will restore from checkpoint
    { 
      configurable: { 
        thread_id: session.threadId,
        checkpoint_id: session.checkpointId 
      }
    }
  );
  
  return result;
}
```

### User approval flows

```typescript
// src/components/ApprovalFlow.tsx
import { useInput } from 'ink';
import { ConfirmInput } from '@inkjs/ui';

const PRDApproval = ({ prd, onApprove, onEdit, onReject }) => {
  useInput((input, key) => {
    if (input === 'y') onApprove();
    if (input === 'e') onEdit();
    if (input === 'n') onReject();
  });

  return (
    <Box flexDirection="column">
      <Text bold>📋 PRD Review</Text>
      <Box borderStyle="single" padding={1} marginY={1}>
        <Text>{prd.summary}</Text>
      </Box>
      <Text dimColor>Full PRD saved to: {prd.path}</Text>
      <Box marginTop={1}>
        <Text>[y] Approve and continue to Design</Text>
        <Text>[e] Edit PRD</Text>
        <Text>[n] Reject and regenerate</Text>
      </Box>
    </Box>
  );
};
```

---

## Memory and context management

### LangGraph Store structure

```typescript
// Memory namespace structure
const MEMORY_NAMESPACES = {
  // User-level (persists across all projects)
  userPreferences: (userId: string) => [userId, "preferences"],
  userHistory: (userId: string) => [userId, "history"],
  
  // Project-level (persists for specific project)
  projectDecisions: (projectId: string) => ["projects", projectId, "decisions"],
  projectLearnings: (projectId: string) => ["projects", projectId, "learnings"],
  
  // Global (shared across all users)
  designPatterns: () => ["global", "patterns"],
  componentLibrary: () => ["global", "components"],
};

// Usage in agent nodes
const nodeWithMemory = async (state: EamesState, config: RunnableConfig) => {
  const store = config.store;
  const userId = config.configurable?.user_id;
  
  // Retrieve user preferences
  const prefs = await store.search(
    MEMORY_NAMESPACES.userPreferences(userId),
    { limit: 10 }
  );
  
  // Store design decision
  await store.put(
    MEMORY_NAMESPACES.projectDecisions(state.projectId),
    crypto.randomUUID(),
    {
      type: "tech_stack",
      decision: "React + Tailwind + Supabase",
      reasoning: "User preference for React, project needs real-time",
      timestamp: new Date().toISOString(),
    }
  );
  
  return state;
};
```

### Memory pruning strategy

```typescript
const pruneMemories = async (store: BaseStore, namespace: string[], options: PruneOptions) => {
  const memories = await store.list(namespace);
  
  // Sort by relevance score * recency
  const scored = memories.map(m => ({
    ...m,
    score: m.relevance * getRecencyScore(m.timestamp)
  }));
  
  // Keep top N
  const toKeep = scored
    .sort((a, b) => b.score - a.score)
    .slice(0, options.maxMemories);
  
  const toDelete = scored.filter(m => !toKeep.includes(m));
  
  for (const mem of toDelete) {
    await store.delete(namespace, mem.id);
  }
};

// Run pruning periodically or on project completion
const onProjectComplete = async (projectId: string) => {
  await pruneMemories(
    store, 
    MEMORY_NAMESPACES.projectDecisions(projectId),
    { maxMemories: 50 }
  );
};
```

---

## LangSmith integration

### Project structure

Use **per-project traces** with global dataset for evaluation:

```typescript
// Environment setup
process.env.LANGSMITH_TRACING = "true";
process.env.LANGSMITH_API_KEY = process.env.LANGSMITH_API_KEY;
process.env.LANGSMITH_PROJECT = "eames-agent";

// Tag traces for filtering
const runConfig = {
  configurable: { thread_id: sessionId },
  tags: ["eames", `phase-${currentPhase}`, `user-${userId}`],
  metadata: {
    projectDescription: input,
    startedAt: new Date().toISOString(),
    version: "2.0.0",
  },
};

const result = await agent.invoke(input, runConfig);
```

### Custom metrics to track

```typescript
// Track in LangSmith metadata
const metrics = {
  // Cost metrics
  totalTokens: 0,
  estimatedCost: 0,
  
  // Time metrics
  phaseLatencies: {} as Record<string, number>,
  totalDuration: 0,
  
  // Quality metrics
  lintErrors: 0,
  typeErrors: 0,
  testsPassed: 0,
  testsFailed: 0,
  
  // Deployment metrics
  deploymentSuccess: boolean,
  deploymentUrl: string,
};

// Log at end of run
await langsmith.updateRun(runId, {
  extra: { metrics },
});
```

### Quality evaluators

```typescript
import { Client } from "langsmith";

const client = new Client();

// Create evaluation dataset
await client.createDataset("eames-quality-tests", {
  inputs: [
    { request: "Build a todo app" },
    { request: "Build an e-commerce site" },
  ],
  outputs: [
    { expectedPhases: 5, shouldDeploy: true },
    { expectedPhases: 5, shouldDeploy: true },
  ],
});

// Custom evaluator
const deploymentSuccessEvaluator = async (run, example) => {
  const output = run.outputs;
  return {
    key: "deployment_success",
    score: output.deploymentResult?.success ? 1 : 0,
  };
};

const codeQualityEvaluator = async (run, example) => {
  const metrics = run.extra?.metrics;
  const score = metrics.lintErrors === 0 && metrics.typeErrors === 0 ? 1 : 0;
  return {
    key: "code_quality",
    score,
    comment: `Lint: ${metrics.lintErrors}, Types: ${metrics.typeErrors}`,
  };
};
```

---

## Error handling and recovery

### Checkpoint strategy

**Checkpoint at every phase boundary plus subtask completion:**

```typescript
const CHECKPOINT_TRIGGERS = {
  phaseComplete: true,      // After each phase
  approvalReceived: true,   // After human approval
  subtaskComplete: true,    // After each subtask in Develop
  errorRecovery: true,      // After successful retry
};

// Using LangGraph's built-in checkpointer
const agent = createDeepAgent({
  checkpointer: new PostgresSaver({ connectionString: DB_URI }),
});

// Manual checkpoint for critical points
const developNode = async (state: EamesState, config: RunnableConfig) => {
  const files = determineFilesToGenerate(state.designSpec);
  
  for (const file of files) {
    const result = await codeWriterSubagent.invoke({ file, spec: state.designSpec });
    
    // Checkpoint after each file
    await config.checkpointer?.put(
      config,
      { ...state, completedFiles: [...state.completedFiles, file] },
      { source: "subtask", step: `file-${file}` }
    );
  }
  
  return state;
};
```

### Self-healing implementation

```typescript
const selfHealingExecute = async (
  task: Task,
  context: ExecutionContext,
  maxAttempts = 3
): Promise<TaskResult> => {
  const errors: Error[] = [];
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const result = await executeTask(task, context);
      
      // Validate result
      const validation = await validateResult(result, task.expectedOutput);
      if (validation.valid) {
        return result;
      }
      
      // Self-correct based on validation feedback
      context = {
        ...context,
        previousAttempt: result,
        feedback: validation.feedback,
        instruction: `Previous attempt failed validation: ${validation.feedback}. Correct the approach.`,
      };
      
    } catch (error) {
      errors.push(error);
      
      // Classify error and determine recovery strategy
      const errorType = classifyError(error);
      
      if (errorType === 'rate_limit') {
        await exponentialBackoff(attempt);
        continue;
      }
      
      if (errorType === 'context_overflow') {
        // Summarize and retry with compressed context
        context = await compressContext(context);
        continue;
      }
      
      if (errorType === 'llm_refusal') {
        // Rephrase task
        task = rephraseTask(task, error.message);
        continue;
      }
      
      // Unknown error - escalate
      if (attempt === maxAttempts) {
        return {
          success: false,
          escalate: true,
          errors,
          recoveryOptions: generateRecoveryOptions(task, errors),
        };
      }
    }
  }
};
```

### Exposing error context to users

```typescript
const ErrorDisplay = ({ error, recoveryOptions, onSelect }) => (
  <Box flexDirection="column" borderStyle="round" borderColor="red" padding={1}>
    <Box gap={1}>
      <Text color="red">✗</Text>
      <Text bold color="red">{error.type}</Text>
    </Box>
    
    <Text wrap="wrap">{error.message}</Text>
    
    {error.context && (
      <Box flexDirection="column" marginTop={1}>
        <Text dimColor>Context:</Text>
        <Text dimColor wrap="wrap">{error.context}</Text>
      </Box>
    )}
    
    <Box flexDirection="column" marginTop={1}>
      <Text>Recovery options:</Text>
      {recoveryOptions.map((opt, i) => (
        <Text key={i}>[{i + 1}] {opt.description}</Text>
      ))}
    </Box>
  </Box>
);
```

---

## Testing strategy

### Test pyramid for Eames Agent

```
                    ┌─────────┐
                    │  E2E    │  2-3 golden path tests
                   ┌┴─────────┴┐
                   │Integration │  ~20 phase transition tests
                  ┌┴───────────┴┐
                  │    Unit     │  ~100 tool/utility tests
                 └──────────────┘
```

### Handling non-deterministic LLM outputs

**1. Structural validation over exact matching:**
```typescript
// test/unit/prd-generator.test.ts
import { expect, test, describe } from "bun:test";

describe("PRD Generator", () => {
  test("produces valid PRD structure", async () => {
    const result = await prdSubagent.invoke({ request: "Build a todo app" });
    
    // Validate structure, not content
    expect(result.summary).toBeDefined();
    expect(result.summary.length).toBeGreaterThan(100);
    expect(result.features).toBeInstanceOf(Array);
    expect(result.features.length).toBeGreaterThan(0);
    expect(result.techStack).toHaveProperty("frontend");
    expect(result.techStack).toHaveProperty("backend");
  });
});
```

**2. LLM-as-judge for quality:**
```typescript
const evaluateQuality = async (output: string, criteria: string) => {
  const judge = new ChatAnthropic({ model: "claude-3-haiku-20240307" }); // Cheap model
  
  const response = await judge.invoke([
    { role: "system", content: "Rate the following output on a scale of 1-5 based on the criteria." },
    { role: "user", content: `Criteria: ${criteria}\n\nOutput: ${output}` },
  ]);
  
  const score = parseInt(response.content.match(/\d/)?.[0] || "0");
  return score >= 4; // Pass threshold
};

test("PRD meets quality bar", async () => {
  const result = await prdSubagent.invoke({ request: "Build a todo app" });
  
  const isGood = await evaluateQuality(
    result.summary,
    "Clear, specific, actionable requirements with measurable success criteria"
  );
  
  expect(isGood).toBe(true);
});
```

**3. Response caching for CI:**
```typescript
// Cache successful responses for regression testing
const RESPONSE_CACHE = new Map<string, any>();

const cachedInvoke = async (agent: any, input: any) => {
  const cacheKey = JSON.stringify(input);
  
  if (process.env.USE_CACHE && RESPONSE_CACHE.has(cacheKey)) {
    return RESPONSE_CACHE.get(cacheKey);
  }
  
  const result = await agent.invoke(input);
  
  if (process.env.RECORD_CACHE) {
    RESPONSE_CACHE.set(cacheKey, result);
    await Bun.write("test/fixtures/cache.json", JSON.stringify([...RESPONSE_CACHE]));
  }
  
  return result;
};
```

### Integration testing phase transitions

```typescript
describe("Phase transitions", () => {
  test("Discovery → Define passes research context", async () => {
    const discoveryOutput = await discoveryNode({ 
      userRequest: "Build a todo app" 
    });
    
    expect(discoveryOutput.discoveryInsights).toBeDefined();
    
    const defineOutput = await defineNode({
      ...discoveryOutput,
      userRequest: "Build a todo app"
    });
    
    // Verify Define phase used Discovery output
    expect(defineOutput.prdSummary.features.some(
      f => f.includes(discoveryOutput.discoveryInsights.keyInsight)
    )).toBe(true);
  });
});
```

### Cost-effective testing

- **Use Haiku ($0.25/M tokens) for unit tests**, Sonnet for integration
- **Cache responses** during local development
- **Run full E2E weekly**, not on every PR
- **Golden path tests only** in CI (2-3 complete runs)
- **Estimated CI cost**: ~$5-10/week with caching

---

## Performance optimization

### Parallel execution map

| Phase | Parallelizable Tasks | Sequential Dependencies |
|-------|---------------------|------------------------|
| Discovery | Market research, Competitive analysis, User research | Synthesis requires all three |
| Define | None (single PRD generation) | Requires Discovery complete |
| Design | Component design, UX flows, Visual design | Architecture decisions first |
| Develop | Independent file generation | Architecture → Core → Features → Tests |
| Deliver | None (sequential deployment) | Requires all code complete |

### Model selection strategy

```typescript
const MODEL_CONFIG = {
  // Orchestration: needs strong reasoning
  orchestrator: "claude-sonnet-4-20250514",
  
  // Discovery: thorough research
  research: "claude-sonnet-4-20250514",
  
  // PRD: complex reasoning about requirements
  prdWriter: "claude-sonnet-4-20250514",
  
  // Design: creative + structured
  designer: "claude-sonnet-4-20250514",
  
  // Code generation: fast, accurate
  codeWriter: "claude-sonnet-4-20250514",
  
  // Validation/QA: fast checks
  validator: "claude-3-haiku-20240307", // 10x cheaper
  
  // Error analysis: fast diagnosis
  errorAnalyzer: "claude-3-haiku-20240307",
};

// Usage
const codeSubagent: SubAgent = {
  name: "code-writer",
  model: MODEL_CONFIG.codeWriter,
  // ...
};
```

### Anthropic prompt caching

DeepAgents includes `AnthropicPromptCachingMiddleware` by default. Maximize cache hits:

```typescript
// Structure prompts for caching
const systemPrompt = `
${STATIC_INSTRUCTIONS}  // Cache this (rarely changes)

---
Project Context:
${projectContext}  // Cache this (changes per project)

---
Current Task:
${currentTask}  // Don't cache (changes per turn)
`;

// Use cache_control markers
const message = {
  role: "user",
  content: [
    {
      type: "text",
      text: longDocumentation,
      cache_control: { type: "ephemeral" }  // Cache for 5 min
    },
    {
      type: "text", 
      text: currentQuestion
    }
  ]
};
```

**Expected savings**: 85-90% cost reduction on cached tokens, 85% latency reduction.

### Target budget breakdown

For **<$5 per app** with 15-minute generation:

| Phase | Tokens (est.) | Model | Cost |
|-------|--------------|-------|------|
| Discovery | 50k | Sonnet | $0.75 |
| Define | 30k | Sonnet | $0.45 |
| Design | 40k | Sonnet | $0.60 |
| Develop | 100k | Sonnet | $1.50 |
| Deliver | 20k | Sonnet + Haiku | $0.30 |
| Validation | 30k | Haiku | $0.08 |
| **Total** | 270k | Mixed | **$3.68** |

*With prompt caching, actual cost likely ~$2-3.*

---

## Biggest risks and mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| **Bun + LangChain compatibility** | High - could block development | Test integration early; fallback to direct SDK calls |
| **Context overflow in Develop** | High - code generation fails | Aggressive eviction, file-based artifacts, subagent isolation |
| **Deployment failures** | Medium - 90% success target | Comprehensive pre-deploy validation, rollback capability |
| **Cost overruns** | Medium - >$5 target | Model selection, prompt caching, aggressive summarization |
| **LLM refusals/hallucinations** | Medium - quality issues | Validation loops, self-correction, human checkpoints |
| **Long generation times** | Low - >15 min target | Parallel execution, faster models for simple tasks |

---

## MVP build order

**Week 1-2: Foundation**
1. Verify Bun + LangChain/LangGraph compatibility
2. Set up DeepAgents with basic subagents
3. Implement CompositeBackend filesystem routing
4. Basic Ink CLI scaffold

**Week 3-4: Core Workflow**
5. Implement Discovery → Define phases
6. Add PRD approval flow
7. Implement Design phase with component specs
8. LangSmith integration for tracing

**Week 5-6: Code Generation**
9. Develop phase with parallel file generation
10. QA tools (lint, typecheck, tests)
11. GitHub integration (create repo, push code)

**Week 7-8: Deployment & Polish**
12. Deliver phase with Vercel deployment
13. Error handling and self-healing
14. Resume functionality
15. Memory/learning system

**Week 9+: Optimization**
16. Performance tuning (parallelization, caching)
17. Evaluation framework
18. Production hardening

---

## Key architectural patterns worth adopting

**From Claude Code:**
- Single-threaded master loop for simplicity and debuggability
- CLAUDE.md-style project context files
- TODO tracking with reminder injection after tool calls
- "Think hard" triggers for complex reasoning

**From Replit Agent:**
- Checkpoint at every major step for reversion
- Front-load critical work (compound probability decay)
- Automated browser testing by agent itself
- Code-based DSL for tool calling (90% reliability)

**From Cursor:**
- Parallel tool execution (up to 8 simultaneous)
- 15+ specialized tools over generic ones
- `.cursorrules` for project-specific behavior

**From v0.dev:**
- Streaming validation catches errors during generation
- Quick Edit routing for small vs large changes
- Composite model architecture (swappable base + specialized layers)

---

## Conclusion

DeepAgents provides an excellent foundation for Eames Design Agent v2.0. The framework's built-in subagent delegation, filesystem backends, context management, and LangSmith integration directly address your requirements. Combined with the architectural patterns from Claude Code (simplicity), Replit (checkpointing), and v0.dev (streaming validation), you can achieve the **<15 minute, <$5, 90%+ deployment success** targets.

**Critical success factors:**
1. **Validate Bun compatibility immediately** - this is the highest-risk item
2. **Use file references, not content passing** - prevents context overflow
3. **Checkpoint aggressively** - enables recovery and debugging
4. **Start with sequential phases** - add parallelization after core works
5. **Human checkpoints at PRD and Deploy** - quality gates for 90%+ success

The hybrid LangGraph nodes + DeepAgents subagents architecture balances simplicity with the context isolation needed for large artifact generation. Build the MVP following the week-by-week roadmap, and iterate based on real-world performance metrics from LangSmith.