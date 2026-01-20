# Eames Design Agent v2.0: Architectural Blueprint for Autonomous Product Design

**DeepAgents provides the foundation, but a LangGraph-wrapped hybrid with custom phase coordination delivers the production-grade 5-phase workflow this system requires.** After analyzing framework capabilities, production systems like v0.dev and Replit Agent, and implementation constraints, the recommended approach combines DeepAgents' subagent isolation and filesystem abstractions with a custom LangGraph orchestration layer—achieving the <15min, <$5 targets while maintaining 90%+ success rates.

## Executive summary and recommendation matrix

The research reveals that **pure DeepAgents** handles context isolation well but lacks the fine-grained phase control needed for strict 5-phase workflows with HITL gates. **Pure custom LangGraph** offers complete control but requires rebuilding planning, filesystem, and subagent patterns from scratch. The **hybrid approach** leverages DeepAgents' middleware (write_todos, filesystem, subagents) while wrapping phases in a LangGraph StateGraph for checkpointing, conditional routing, and HITL approval gates.

| Criterion | DeepAgents Only | Custom LangGraph | **Hybrid (Recommended)** |
|-----------|-----------------|------------------|--------------------------|
| Time to MVP | 2-3 weeks | 6-8 weeks | 4-5 weeks |
| Maintenance | Low (abstractions) | High (custom code) | Medium |
| Extensibility | Moderate | Excellent | Excellent |
| Performance | Good | Best | Near-optimal |
| Risk | Medium (black box) | Low (full control) | Low |
| 5-Phase Control | Limited | Full | Full |

## DeepAgents deep-dive reveals key capabilities and gaps

DeepAgents, built on LangGraph, provides four core components that accelerate development: **planning tools** (write_todos for task decomposition), **subagent spawning** (context isolation via the `task` tool), **filesystem abstractions** (StateBackend, StoreBackend, FilesystemBackend, CompositeBackend), and **HITL integration** (approve/edit/reject patterns). The TypeScript package `deepagents` (v1.4.2) is MIT-licensed with 294 GitHub stars.

**Built-in tool middleware automatically attached:**
- `write_todos` for planning and progress tracking
- `ls`, `read_file`, `write_file`, `edit_file`, `glob`, `grep` for filesystem operations
- `task` for spawning isolated subagents

**Critical limitation discovered:** Nested sub-subagent spawning is not a first-class feature. While technically possible by passing a `CompiledSubAgent` with its own graph, the architecture assumes a flat agent-subagent hierarchy. For 5-phase workflows where Design might need UI and UX sub-subagents, this requires workarounds.

**Context bloat prevention:** DeepAgents automatically evicts large tool results exceeding `tool_token_limit_before_evict` to filesystem state, replacing inline content with `TOO_LARGE_TOOL_MSG` references. This is essential for handling PRDs and codebases.

```typescript
// DeepAgents subagent definition pattern
const designSubagent: SubAgent = {
  name: "design-agent",
  description: "Generates UI/UX specifications from PRD",
  systemPrompt: "You are an expert product designer...",
  tools: [figmaTool, componentLibraryTool],
  model: "claude-sonnet-4-5-20250929" // Override for design-heavy work
};
```

## LangGraph provides the orchestration layer for phase control

LangGraph's StateGraph enables the precise 5-phase coordination DeepAgents lacks natively. Key patterns for the product design workflow include **conditional routing** for phase gates, **checkpointing** for resume/retry, **parallel execution** via Send API for subtasks within phases, and **HITL interrupts** for approval workflows.

**State schema for 5-phase product design:**

```typescript
const ProductDesignState = Annotation.Root({
  projectId: Annotation<string>,
  currentPhase: Annotation<"discovery" | "define" | "design" | "develop" | "deliver">,
  
  // Phase summaries (compressed to prevent bloat)
  discoverySummary: Annotation<string>,
  prd: Annotation<string>,
  designSpecs: Annotation<string>,
  codeArtifacts: Annotation<string[]>({ 
    reducer: (x, y) => x.concat(y), 
    default: () => [] 
  }),
  deploymentUrl: Annotation<string>,
  
  // Large artifacts stored by reference
  artifactRefs: Annotation<Record<string, string>>,
  
  // Control flow
  phaseApproved: Annotation<boolean>({ default: () => false }),
  errors: Annotation<string[]>({ reducer: (x, y) => x.concat(y), default: () => [] }),
});
```

**Checkpointing for resume/retry:** Use `PostgresSaver` in production, with `interruptBefore: ["approval_gate"]` for HITL. LangGraph stores pending writes from completed parallel nodes, preventing re-execution on resume.

## Lessons from production systems reveal architectural patterns

**v0.dev's composite model pipeline** achieves **93.87% error-free generation** through a multi-stage architecture: RAG retrieval → base LLM (Sonnet 4) → streaming AutoFix model → linter. The custom AutoFix model, trained via Reinforcement Fine-Tuning, runs **10-40x faster** than GPT-4o-mini. Key insight: don't rely on a single LLM call—pipeline multiple specialized models.

**Replit Agent's multi-agent system** uses Manager → Editor → Verifier architecture with LangGraph + LangSmith. Critical finding: they use a **custom Python-based DSL for tool calling** instead of native function calling because it's more reliable for 30+ tools. Their checkpoint system enables Git-commit-like reversion.

**Claude Code's single-threaded master loop** (Gather Context → Take Action → Verify Work → Repeat) deliberately avoids complex multi-agent patterns. It uses **progressive disclosure** for context—loading skills/instructions only when needed through SKILL.md files with referenced sub-files. Notably, it uses **grep/regex search instead of vector databases** for code navigation.

**Common patterns across all systems:**
- Composite models: base LLM + specialized fixer + linter
- Context compression between phases via summarization
- Checkpoint/reversion systems as first-class features
- Browser-based testing (Replit: 3x faster, 10x cheaper than Computer Use)

## Recommended architecture: DeepAgents phases within LangGraph orchestration

The optimal architecture uses **DeepAgents to create isolated phase agents** (Discovery, Define, Design, Develop, Deliver) while **LangGraph manages the overall workflow graph** with checkpointing, HITL gates, and phase transitions.

```
┌────────────────────────────────────────────────────────────────────────┐
│                     LangGraph Orchestration Layer                       │
├────────────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐    ┌───────────┐    ┌──────────────┐                 │
│  │  Discovery   │───▶│ Approval  │───▶│    Define    │                 │
│  │  DeepAgent   │    │   Gate    │    │  DeepAgent   │                 │
│  │  (Haiku)     │    │   (HITL)  │    │  (Sonnet)    │                 │
│  └──────────────┘    └───────────┘    └──────────────┘                 │
│         │                                     │                         │
│         └── [Research, Competitor Analysis]   └── [PRD Generation]      │
│                                                       │                 │
│  ┌──────────────┐    ┌───────────┐    ┌──────────────┐                 │
│  │    Design    │◀───│ Approval  │◀───│   (PRD)      │                 │
│  │  DeepAgent   │    │   Gate    │    └──────────────┘                 │
│  │  (Sonnet)    │    │   (HITL)  │                                     │
│  └──────────────┘    └───────────┘                                     │
│         │                                                               │
│         └── [Wireframes, Components, Design System]                     │
│                      │                                                  │
│  ┌──────────────┐    ▼              ┌──────────────┐                   │
│  │   Develop    │◀───────────────────│ Parallel:    │                   │
│  │  DeepAgent   │                    │ UI + Backend │                   │
│  │  (Sonnet)    │                    └──────────────┘                   │
│  └──────────────┘                                                       │
│         │                                                               │
│         └── [Code Gen, Testing, GitHub Commit]                          │
│                      │                                                  │
│  ┌──────────────┐    ▼              ┌──────────────┐                   │
│  │   Deliver    │───────────────────▶│ Deployed URL │                   │
│  │  DeepAgent   │                    │ (Netlify/    │                   │
│  │  (Haiku)     │                    │  Vercel)     │                   │
│  └──────────────┘                    └──────────────┘                   │
├────────────────────────────────────────────────────────────────────────┤
│  Persistence: PostgresSaver (checkpoints) + StoreBackend (artifacts)   │
│  Observability: LangSmith (tracing per phase, cost tracking)           │
│  Runtime: Bun (with Node.js fallback for edge cases)                   │
└────────────────────────────────────────────────────────────────────────┘
```

### Answer: Should 5 phases be separate DeepAgents subagents, LangGraph nodes, or hybrid?

**Hybrid:** Each phase is a DeepAgents instance (with its own tools, middleware, filesystem state) wrapped as a LangGraph node. The parent LangGraph manages transitions, checkpointing, and HITL gates. This provides subagent isolation benefits while maintaining precise orchestration control.

```typescript
import { createDeepAgent, StateBackend, SubAgent } from "deepagents";
import { StateGraph, Annotation, START, END } from "@langchain/langgraph";

// Create phase-specific DeepAgents
const discoveryAgent = createDeepAgent({
  model: "claude-haiku-4-5",
  tools: [webSearchTool, competitorAnalysisTool],
  systemPrompt: DISCOVERY_PROMPT,
  backend: (config) => new StateBackend(config),
});

const defineAgent = createDeepAgent({
  model: "claude-sonnet-4-5",
  tools: [prdTemplateTool, userStoryGenerator],
  systemPrompt: DEFINE_PROMPT,
});

// Wrap as LangGraph nodes
async function discoveryNode(state: typeof ProductDesignState.State) {
  const result = await discoveryAgent.invoke({
    messages: [{ role: "user", content: `Research product: ${state.projectId}` }]
  });
  // Compress output for next phase
  const summary = await summarize(result.messages);
  return { discoverySummary: summary, currentPhase: "discovery" };
}

// LangGraph orchestration with HITL
const workflow = new StateGraph(ProductDesignState)
  .addNode("discovery", discoveryNode)
  .addNode("define", defineNode)
  .addNode("approval_gate", approvalGateNode)
  .addNode("design", designNode)
  .addNode("develop", developNode)
  .addNode("deliver", deliverNode)
  .addEdge(START, "discovery")
  .addEdge("discovery", "approval_gate")
  .addConditionalEdges("approval_gate", routeAfterApproval)
  .addEdge("define", "approval_gate")
  .addEdge("design", "develop")
  .addEdge("develop", "deliver")
  .addEdge("deliver", END)
  .compile({ checkpointer: new PostgresSaver(connectionString) });
```

### Answer: How to structure filesystem backends?

Use **CompositeBackend** combining StateBackend (ephemeral phase state) with StoreBackend (persistent cross-session artifacts). Large outputs (PRDs, codebases) should be stored in StoreBackend with only references in state.

```typescript
import { CompositeBackend, StateBackend, StoreBackend } from "deepagents";
import { InMemoryStore } from "@langchain/langgraph-checkpoint";

const store = new PostgresStore(connectionString); // Production

const phaseAgent = createDeepAgent({
  backend: (config) => new CompositeBackend({
    state: new StateBackend(config),      // Per-phase working memory
    store: config.store ? new StoreBackend(config) : undefined, // Persistent artifacts
  }),
  store,
  checkpointer: new PostgresSaver(connectionString),
});

// Store large artifact by reference
async function storePRD(state: State, prdContent: string) {
  const artifactId = await store.put(
    [state.projectId, "artifacts"],
    crypto.randomUUID(),
    { type: "prd", content: prdContent, timestamp: Date.now() }
  );
  return { prdRef: artifactId, prd: undefined }; // Clear from state
}
```

### Answer: Can/should subagents spawn sub-subagents?

**Avoid nested sub-subagents.** DeepAgents doesn't support this as a first-class pattern, and it introduces complexity that impacts debugging and cost tracking. Instead, use **parallel subagents within a phase** via LangGraph's Send API:

```typescript
// Design phase fans out to UI and UX subagents in parallel
function designOrchestrator(state: State) {
  return [
    Send("ui_subagent", { task: "wireframes", specs: state.designSpecs }),
    Send("ux_subagent", { task: "user_flows", specs: state.designSpecs }),
  ];
}

graph.addConditionalEdges("design_orchestrator", designOrchestrator, ["ui_subagent", "ux_subagent"]);
graph.addEdge("ui_subagent", "design_synthesizer");
graph.addEdge("ux_subagent", "design_synthesizer");
```

## Implementation specifics for production deployment

### Passing large outputs efficiently

**Pattern 1: Summarize-and-Reference.** Each phase produces a compressed summary for the LLM context and stores full content externally.

```typescript
async function passToNextPhase(state: State, artifact: string, type: "prd" | "code") {
  // 1. Store full artifact
  const ref = await store.put([state.projectId, type], uuid(), { content: artifact });
  
  // 2. Generate summary for context (using Haiku for speed/cost)
  const summary = await haiku.invoke([
    { role: "system", content: "Summarize this for the next phase in <500 tokens" },
    { role: "user", content: artifact.slice(0, 10000) }
  ]);
  
  return { [`${type}Ref`]: ref, [`${type}Summary`]: summary.content };
}
```

**Pattern 2: Tool-based retrieval.** Provide next phase a `read_artifact` tool to fetch full content on-demand.

### Custom tool integration for GitHub and deployment

```typescript
// GitHub: Create repo and commit codebase
const commitCodebaseTool = tool(
  async ({ projectName, files, commitMessage }) => {
    const octo = new Octokit({ auth: process.env.GITHUB_TOKEN });
    
    // Create repo if not exists
    const { data: repo } = await octo.repos.createForAuthenticatedUser({
      name: projectName,
      private: true,
      auto_init: true
    });
    
    // Batch commit using Git Data API (efficient for many files)
    const parentSha = (await octo.git.getRef({ 
      owner: repo.owner.login, repo: projectName, ref: "heads/main" 
    })).data.object.sha;
    
    const blobs = await Promise.all(
      files.map(f => octo.git.createBlob({ 
        owner: repo.owner.login, repo: projectName, 
        content: Buffer.from(f.content).toString("base64"), 
        encoding: "base64" 
      }))
    );
    
    const tree = await octo.git.createTree({
      owner: repo.owner.login, repo: projectName,
      tree: files.map((f, i) => ({ 
        path: f.path, mode: "100644", type: "blob", sha: blobs[i].data.sha 
      })),
      base_tree: (await octo.git.getCommit({ 
        owner: repo.owner.login, repo: projectName, commit_sha: parentSha 
      })).data.tree.sha
    });
    
    const commit = await octo.git.createCommit({
      owner: repo.owner.login, repo: projectName,
      message: commitMessage,
      tree: tree.data.sha,
      parents: [parentSha]
    });
    
    await octo.git.updateRef({ 
      owner: repo.owner.login, repo: projectName, 
      ref: "heads/main", sha: commit.data.sha 
    });
    
    return JSON.stringify({ repoUrl: repo.html_url, commitSha: commit.data.sha });
  },
  { name: "commit_codebase", schema: z.object({ ... }) }
);

// Vercel: Deploy from GitHub
const deployToVercelTool = tool(
  async ({ repoUrl, projectName }) => {
    const response = await fetch("https://api.vercel.com/v9/projects", {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.VERCEL_TOKEN}` },
      body: JSON.stringify({
        name: projectName,
        gitRepository: { type: "github", repo: repoUrl.replace("https://github.com/", "") }
      })
    });
    const project = await response.json();
    
    // Trigger deployment
    const deploy = await fetch(`https://api.vercel.com/v13/deployments`, {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.VERCEL_TOKEN}` },
      body: JSON.stringify({ name: projectName, target: "production" })
    });
    
    return JSON.stringify({ deployUrl: deploy.url, status: "deploying" });
  },
  { name: "deploy_vercel", schema: z.object({ ... }) }
);
```

### CLI design: Extend DeepAgents CLI or build custom with Ink?

**Build custom with Ink.** DeepAgents' CLI is designed for their demo flow. A product design agent needs:
- Phase progress visualization
- HITL approval prompts with artifact preview
- Cost tracking display
- Resume from checkpoint selection

```typescript
import React from "react";
import { render, Box, Text, useInput } from "ink";
import Spinner from "ink-spinner";

function EamesAgent({ workflow }) {
  const [phase, setPhase] = useState("discovery");
  const [status, setStatus] = useState("running");
  const [cost, setCost] = useState(0);
  
  return (
    <Box flexDirection="column">
      <Box>
        <Text color="cyan">Eames Design Agent v2.0</Text>
      </Box>
      <Box marginY={1}>
        {["discovery", "define", "design", "develop", "deliver"].map(p => (
          <Box key={p} marginRight={2}>
            <Text color={p === phase ? "green" : "gray"}>
              {p === phase && <Spinner type="dots" />} {p}
            </Text>
          </Box>
        ))}
      </Box>
      <Box>
        <Text dimColor>Cost: ${cost.toFixed(2)} | Time: {elapsed}</Text>
      </Box>
      {status === "approval" && <ApprovalPrompt artifact={currentArtifact} />}
    </Box>
  );
}
```

### Memory architecture: Per-user vs per-project

**Per-project with user namespace.** Structure: `{userId}/{projectId}/artifacts|sessions|config`

```typescript
// LangGraph Store namespace pattern
const namespace = [userId, projectId, "artifacts"];

// Store project context
await store.put(namespace, "brand_guidelines", { 
  colors: [...], fonts: [...], tone: "professional" 
});

// Retrieve across sessions
const memories = await store.search(namespace, { limit: 10 });
```

**Pruning strategy:**
- Keep last 5 sessions per project
- Retain all final artifacts indefinitely
- Prune intermediate phase outputs after 30 days
- Use semantic search index for project history recall

## Error handling and production reliability

### Retry and self-healing patterns

```typescript
import { RetryPolicy } from "@langchain/langgraph";

graph.addNode("develop", developNode, {
  retry: [
    // Rate limits: aggressive backoff
    RetryPolicy({ 
      retry_on: [RateLimitError], 
      max_attempts: 5, 
      backoff_factor: 3.0,
      initial_interval: 1.0 
    }),
    // Timeouts: moderate retry
    RetryPolicy({ 
      retry_on: [TimeoutError], 
      max_attempts: 3, 
      backoff_factor: 2.0 
    }),
    // Model errors: try different model
    RetryPolicy({
      retry_on: [ModelOverloadedError],
      max_attempts: 2,
      on_retry: async (state) => ({ 
        ...state, 
        model: "claude-haiku-4-5" // Fallback model
      })
    })
  ]
});
```

### Checkpointing for resume

```typescript
// Resume from last successful checkpoint
async function resumeWorkflow(projectId: string) {
  const config = { configurable: { thread_id: projectId } };
  const stateHistory = await workflow.getStateHistory(config);
  
  // Find last successful phase
  for (const snapshot of stateHistory) {
    if (snapshot.metadata.status === "success") {
      return workflow.invoke(null, { 
        configurable: { thread_id: projectId, checkpoint_id: snapshot.checkpoint_id }
      });
    }
  }
  
  // No successful checkpoint, restart
  return workflow.invoke({ projectId }, config);
}
```

## Model selection and cost optimization

### Phase-specific model allocation

| Phase | Model | Rationale | Est. Input | Est. Output | Cost |
|-------|-------|-----------|------------|-------------|------|
| Discovery | Haiku 4.5 | Fast research, simple analysis | 5K | 2K | $0.02 |
| Define | Sonnet 4.5 | Requirements synthesis | 15K | 5K | $0.12 |
| Design | Sonnet 4.5 | Architecture, UI/UX decisions | 20K | 8K | $0.18 |
| Develop | Sonnet 4.5 | Code generation (best coding) | 50K | 30K | $0.60 |
| Deliver | Haiku 4.5 | Deployment orchestration | 10K | 3K | $0.03 |
| **Total** | | | 100K | 48K | **~$0.95** |

**With prompt caching (90% savings on cached reads):** **~$0.50-0.70 per run**

### Prompt caching implementation

```typescript
const cachedSystemPrompt = {
  type: "text",
  text: `You are Eames Design Agent, an expert autonomous product designer...
         [2000+ tokens of instructions, guidelines, examples]`,
  cache_control: { type: "ephemeral" } // 5-min TTL, 90% cost reduction
};

// Cache design system reference (reused across projects)
const designSystemCache = {
  type: "text",
  text: JSON.stringify(designSystemTokens),
  cache_control: { type: "ephemeral", ttl: "1h" } // 1-hour for shared resources
};
```

### Parallelization opportunities

| Parallelizable | Within Phase | Cross-Phase |
|----------------|--------------|-------------|
| ✅ Discovery | Research + Competitor Analysis + User Interviews | No (sequential) |
| ✅ Design | UI Wireframes + UX Flows + Component Library | No (depends on PRD) |
| ✅ Develop | Frontend + Backend + Tests | Partially (if API-first) |
| ❌ Define | Sequential (PRD is monolithic) | — |
| ❌ Deliver | Sequential (deploy → verify) | — |

## Testing strategy for non-deterministic workflows

### Three-layer testing pyramid

**Layer 1: Deterministic (unit tests)**
```typescript
import { describe, test, expect } from "bun:test";

describe("Tool schemas", () => {
  test("commit_codebase validates file structure", () => {
    const result = commitCodebaseSchema.safeParse({
      projectName: "test",
      files: [{ path: "index.html", content: "<html>" }]
    });
    expect(result.success).toBe(true);
  });
});
```

**Layer 2: Recorded (integration tests)**
```typescript
// Record LLM responses for deterministic replay
const mockProvider = new RecordingProvider("./fixtures/llm-responses.json");

test("define phase generates valid PRD structure", async () => {
  const result = await defineAgent.invoke(mockInput, { provider: mockProvider });
  expect(result.prd).toContain("## User Stories");
  expect(result.prd).toContain("## Requirements");
});
```

**Layer 3: Evals (LLM-as-judge, run pre-release)**
```typescript
const taskCompletionEval = async (input: string, output: string) => {
  const judge = new ChatAnthropic({ model: "claude-haiku-4-5" });
  const score = await judge.invoke([
    { role: "system", content: "Score task completion 0-1" },
    { role: "user", content: `Task: ${input}\nOutput: ${output}` }
  ]);
  return parseFloat(score.content);
};

// Run on-demand, not in CI
describe.skipIf(process.env.CI)("Evals", () => {
  test("90% success rate on test suite", async () => {
    const results = await Promise.all(testCases.map(runAndEval));
    const successRate = results.filter(r => r > 0.8).length / results.length;
    expect(successRate).toBeGreaterThanOrEqual(0.9);
  });
});
```

## Bun runtime compatibility assessment

**Status: Functional with caveats.** LangChain.js runs on Bun but has known issues:
- ❌ `bun build --compile` fails due to circular dependencies
- ⚠️ Some middleware compatibility issues with older LangChain versions
- ✅ `bun run` works for development and production

**Recommendation:** Use `bun run` directly or Docker with Bun runtime. Keep Node.js 20+ as fallback.

```dockerfile
FROM oven/bun:1.1
WORKDIR /app
COPY package.json bun.lockb ./
RUN bun install --production
COPY . .
CMD ["bun", "run", "src/index.ts"]
```

## Alternative framework consideration

**Google ADK** deserves special mention—its native `SequentialAgent`, `ParallelAgent`, and `LoopAgent` make 5-phase workflows trivial in TypeScript. However, it's currently **alpha status** with a smaller community. For production in 2026, the LangGraph ecosystem's maturity, LangSmith observability, and DeepAgents' battle-tested patterns offer lower risk.

**When to reconsider:**
- If Google ADK reaches stable v1.0 with TypeScript, evaluate for v3.0
- If Vercel AI SDK adds native workflow graphs, consider for simpler projects
- If cost exceeds $2/run consistently, explore fine-tuned smaller models

## Implementation roadmap

### Phase 1: MVP (Weeks 1-3)
- [ ] LangGraph orchestration with 5 phases as simple nodes
- [ ] StateBackend for in-memory prototyping
- [ ] Sonnet 4.5 for all phases (simplicity over optimization)
- [ ] Basic CLI with phase progress
- [ ] GitHub commit tool, Vercel deploy tool
- [ ] LangSmith tracing setup

### Phase 2: Production Hardening (Weeks 4-6)
- [ ] DeepAgents middleware for planning, filesystem
- [ ] PostgresSaver checkpointing
- [ ] HITL approval gates after Define and Design
- [ ] Model selection logic (Haiku for simple, Sonnet for complex)
- [ ] Prompt caching implementation
- [ ] Error handling with retry policies

### Phase 3: Optimization (Weeks 7-8)
- [ ] Parallel subagents within phases
- [ ] StoreBackend for cross-session memory
- [ ] Cost tracking dashboard in CLI
- [ ] Eval suite with LLM-as-judge
- [ ] Resume from checkpoint UI
- [ ] Custom Ink CLI with full UX

## Risk analysis and mitigation

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Bun compatibility issues | Medium | High | Docker runtime, Node.js fallback ready |
| Context bloat in Develop phase | High | Medium | Summarize-and-reference pattern, 10K token limit per phase output |
| Cost exceeds $5 | Low | Medium | Prompt caching, model selection, batch API for non-critical paths |
| LLM rate limits during peak | Medium | High | Retry policies with exponential backoff, fallback to Haiku |
| DeepAgents breaking changes | Low | High | Pin versions, maintain thin wrapper abstraction |
| 15-min timeout exceeded | Medium | Medium | Parallel execution, checkpoint resume, aggressive context pruning |

## Conclusion: The path forward is hybrid orchestration

The Eames Design Agent v2.0 architecture combines the best of both worlds: **DeepAgents' proven patterns for planning, filesystem abstraction, and subagent isolation** with **LangGraph's fine-grained control over phase transitions, checkpointing, and HITL workflows**. This hybrid approach delivers on the constraints—sub-$2 cost per run (with caching), <15 minute execution through parallelization, and 90%+ success rates via robust error handling.

The key architectural decisions are:
1. **Each phase as a wrapped DeepAgent node** in a parent LangGraph StateGraph
2. **CompositeBackend** combining ephemeral state with persistent artifact storage
3. **Summarize-and-reference pattern** for large outputs between phases
4. **Model tiering**: Haiku for Discovery/Deliver, Sonnet for Define/Design/Develop
5. **Custom Ink CLI** for the specialized UX this workflow requires

Start with the MVP roadmap, validate end-to-end flow with simple nodes, then incrementally add DeepAgents middleware and production hardening. The modular architecture ensures each improvement is isolated and reversible.