# Eames v2.0: Master Implementation Plan
## Complete Autonomous Design-to-Deployment Agent with DeepAgents Architecture

**Version:** 1.0.0
**Date:** January 18, 2026
**Status:** Ready for Implementation
**Critical Priority:** JACKPOT - This is the culmination of all research

---

## 🎯 Executive Summary

After deep analysis of:
1. **LangChain DeepAgents Research** (30+ sources, production examples)
2. **Eames Brain 2.0 Architecture** (World-class design + full-stack intelligence)
3. **Agent-Native Architecture Principles** (Files-first, composability)
4. **Production Case Studies** (Deep Research Agent, AWS examples, HDB Search)

**WE HAVE THE COMPLETE BLUEPRINT.**

This is not incremental improvement. This is **Eames v2.0** - a complete architectural transformation that combines:

✅ **DeepAgents Framework** - Battle-tested planning, memory, subagents
✅ **Eames Brain Intelligence** - Stripe/Linear/Notion/Apple-level design craft
✅ **Agent-Native Principles** - Files as universal interface, emergent capability
✅ **Production Patterns** - Supervisor + workers, hierarchical teams, HITL

---

## 📊 Synthesis of All Research

### Critical Discovery #1: Hybrid Architecture is Optimal

**Don't choose between DeepAgents OR Custom - Use BOTH strategically**

```typescript
Architecture Decision:
├── Orchestration: Custom LangGraph (5-phase workflow control)
├── Phase Agents: DeepAgents (planning, memory, subagents, filesystem)
├── Intelligence: Eames Brain (design + engineering prompts)
└── Principles: Agent-Native (files-first, atomic tools, composability)
```

**Why Hybrid Wins:**
- ✅ Full control over 5-phase workflow (Discovery → Delivery)
- ✅ Get DeepAgents components for free (filesystem, memory, subagents)
- ✅ Easy testing (single-step tests are fast/cheap)
- ✅ Custom Ink CLI for beautiful UX
- ✅ Can fully adopt DeepAgents later if beneficial

### Critical Discovery #2: Filesystem as Universal Interface

**From Agent-Native Architecture + DeepAgents**

```
Files are the most battle-tested agent interface.
Claude Code works because bash + filesystem is universally understood.
DeepAgents CompositeBackend makes this production-ready.
```

**Eames Filesystem Strategy:**
```
/workspace/         → StateBackend (ephemeral, RAM)
  /research/        → Discovery outputs
  /planning/        → PRD, user stories
  /design/          → Design system, components
  /development/     → Build logs, test results

/memories/          → StoreBackend (PostgreSQL, persistent across sessions)
  project-context.md
  design-decisions.md
  user-preferences.md
  tech-stack.md

/deliverables/      → FilesystemBackend (real disk for Git/deploy)
  prd.md
  design-system.md
  /src/             → Generated code
  README.md
```

### Critical Discovery #3: Eames Brain + DeepAgents = Perfect Match

**Eames Brain provides WHAT to think (domain knowledge)**
- Strategic Product Thinking (JTBD, competitive analysis)
- World-Class Visual Design (Stripe/Linear/Notion/Apple)
- Full-Stack Engineering (React, Next.js, TypeScript, AI)
- Opinionated Excellence (vague prompt handling)

**DeepAgents provides HOW to think (cognitive architecture)**
- Planning (TodoListMiddleware)
- Memory (CompositeBackend with hybrid storage)
- Delegation (SubAgentMiddleware)
- Context Management (automatic large result eviction)

**Combined: World's Most Capable Design Agent**

### Critical Discovery #4: Production Patterns are Well-Established

**From AWS, DataCamp, Deep Research Agent, HDB Search**

1. **Supervisor + Specialized Workers** ✅ Proven
2. **Hierarchical Teams** ✅ Proven (research team, writing team)
3. **Scatter-Gather Parallelization** ✅ Proven (3-5 concurrent max)
4. **Filesystem Handoff Protocol** ✅ Proven (pass by reference)
5. **HITL at Milestones** ✅ Proven (PRD approval, deployment)

**We don't need to invent patterns - we adopt proven ones.**

---

## 🏗️ Technical Architecture (The Jackpot)

### System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    User (CLI / Future Web)                   │
└───────────────────────────┬─────────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────┐
│              Eames Orchestrator (Custom LangGraph)           │
│  - Controls 5-phase workflow                                │
│  - Human approval checkpoints                               │
│  - Error recovery & retry logic                             │
│  - Progress tracking & streaming                            │
└───────────────────────────┬─────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
┌───────▼───────┐  ┌────────▼────────┐  ┌──────▼──────┐
│   Discovery   │  │     Define      │  │   Design    │
│  (DeepAgent)  │  │   (DeepAgent)   │  │ (DeepAgent) │
└───────┬───────┘  └────────┬────────┘  └──────┬──────┘
        │                   │                   │
        │         ┌─────────┴─────────┐        │
        │         │                   │        │
┌───────▼─────┐  ┌▼────────┐  ┌──────▼────────▼──┐
│   Develop   │  │ Deliver │  │  Eames Brain      │
│ (DeepAgent) │  │ (Agent) │  │  (Intelligence)   │
└─────────────┘  └─────────┘  └───────────────────┘
                                      │
        ┌─────────────────────────────┴─────────────────────┐
        │                                                     │
┌───────▼────────┐  ┌──────────────┐  ┌────────────────────┐
│ CompositeBackend│  │ Subagents    │  │ Middleware Stack   │
│ (Hybrid Memory) │  │ (Specialists)│  │ (Cross-cutting)    │
└─────────────────┘  └──────────────┘  └────────────────────┘
        │
┌───────▼─────────────────────────────────────────────────────┐
│  Infrastructure                                              │
│  - PostgreSQL (state + memory)                              │
│  - LangSmith (tracing + evals)                              │
│  - Prometheus + Grafana (metrics)                           │
│  - GitHub MCP Server                                        │
│  - Tavily Search                                            │
└──────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

#### 1. Eames Orchestrator (Custom LangGraph)
```typescript
Responsibilities:
- Sequence 5 phases (Discovery → Define → Design → Develop → Deliver)
- Enforce human approval checkpoints (PRD, deployment)
- Handle errors and retry logic
- Stream progress to CLI
- Manage global context

Implementation:
- Custom StateGraph with phase nodes
- Conditional edges for approvals
- PostgreSQL checkpointer for resume
- Ink UI integration
```

#### 2. Phase Agents (DeepAgents)

**Discovery Agent**
```typescript
Tools: tavilySearch, webScraper, competitorAnalyzer
Subagents:
  - productAnalysisAgent (features, pricing)
  - pricingAnalysisAgent (pricing models, tiers)
  - featureComparisonAgent (comparison matrices)
Model: claude-sonnet-4-20250514 (creative research)
Output: /workspace/research/synthesis.md
```

**Define Agent**
```typescript
Tools: prdGenerator, userStoryCreator, acceptanceCriteriaWriter
Subagents:
  - personaGenerator (evidence-based personas)
  - jobStoryCreator (JTBD format)
Model: claude-sonnet-4-20250514 (strategic thinking)
Output: /workspace/planning/prd.md, user_stories.md
Checkpoint: [HUMAN APPROVAL REQUIRED]
```

**Design Agent**
```typescript
Tools: designSystemGenerator, componentSpecCreator, flowMapper
Subagents:
  - colorPaletteAgent (accessibility-first)
  - typographyAgent (hierarchy, scales)
  - componentArchitect (atomic design)
Model: claude-sonnet-4-20250514 (visual design)
Output: /workspace/design/design-system.md, components.md
```

**Develop Agent**
```typescript
Tools: codeGenerator, testWriter, lintRunner, buildValidator
Subagents:
  - reactComponentGenerator (TSX + Tailwind)
  - apiRouteGenerator (Next.js App Router)
  - testSuiteGenerator (Vitest)
Model: claude-sonnet-4-20250514 (Sonnet) + claude-3-5-haiku (Haiku for tests)
Output: /deliverables/src/**, package.json, tsconfig.json
Quality Gates: linting, type checking, tests must pass
```

**Deliver Agent**
```typescript
Tools: githubCreateRepo, gitPush, netlifyDeploy, vercelDeploy
Subagents: None (simple orchestration)
Model: claude-3-5-haiku-20241022 (fast, cheap)
Output: GitHub URL, deployment URL
Checkpoint: [HUMAN APPROVAL before deploy]
```

#### 3. Eames Brain (Intelligence Layer)

**Integrated into EVERY agent's system prompt:**

```typescript
const buildAgentPrompt = (phase: Phase, query: string) => {
  // Base identity + behavioral principles (always)
  let prompt = CORE_IDENTITY + BEHAVIORAL_PRINCIPLES;

  // Phase-specific intelligence
  if (phase === 'discovery' || phase === 'define') {
    prompt += DOUBLE_DIAMOND_FRAMEWORK;
    prompt += JTBD_FRAMEWORK;
    prompt += UX_RESEARCH_METHODS;
  }

  if (phase === 'design' || phase === 'develop') {
    prompt += VISUAL_DESIGN_EXCELLENCE;
    prompt += FULL_STACK_ENGINEERING;
    prompt += CODE_QUALITY_STANDARDS;
    prompt += VAGUE_PROMPT_HANDLING;
  }

  if (phase === 'discovery') {
    prompt += COMPETITIVE_ANALYSIS_PROTOCOL;
  }

  if (phase === 'define') {
    prompt += PRD_GENERATION;
  }

  // Add phase-specific instructions
  prompt += PHASE_INSTRUCTIONS[phase];

  return prompt;
};
```

#### 4. CompositeBackend (Hybrid Memory)

```typescript
const backend = (runtime) => new CompositeBackend(
  new StateBackend(runtime),  // Default: ephemeral
  {
    '/workspace/': new StateBackend(runtime),           // Ephemeral scratch
    '/memories/': new StoreBackend(runtime),            // Cross-session DB
    '/deliverables/': new FilesystemBackend({           // Real files
      rootDir: './output',
      virtualMode: true  // Sandbox security
    })
  }
);

Features:
- Automatic large result eviction (>20k tokens)
- Path-based routing
- Security: sandboxed filesystem, no path traversal
- Grep/search optimization (uses ripgrep binary)
```

#### 5. Middleware Stack

**Order matters! This is the proven production order:**

```typescript
const middleware = [
  RateLimitMiddleware(),                // Check limits FIRST
  AnthropicPromptCachingMiddleware(),   // Optimize calls (90% savings)
  HumanInTheLoopMiddleware(),           // Checkpoints
  TodoListMiddleware(),                 // Planning
  FilesystemMiddleware(),               // Context management
  SubAgentMiddleware(),                 // Delegation
  PhaseProgressMiddleware(),            // Custom: progress tracking
  GitHubMiddleware(),                   // Custom: GitHub integration
  QualityGateMiddleware(),              // Custom: validation gates
  MetricsMiddleware()                   // Custom: Prometheus metrics
];
```

---

## 🚀 Implementation Roadmap

### Phase 0: Foundation (Week 1-2)

**Objective: Set up infrastructure and prove DeepAgents works**

**Tasks:**
- [ ] Initialize TypeScript + Bun project with ESM
- [ ] Install dependencies:
  - `deepagents` (v0.3.2+)
  - `@langchain/langgraph`
  - `@langchain/anthropic`
  - `@langchain/tavily`
  - `langchain-mcp-adapters`
  - `ink` + `ink-ui`
  - `pg` (PostgreSQL)
- [ ] Set up PostgreSQL locally (Docker Compose)
- [ ] Configure LangSmith tracing (day 1!)
- [ ] Create basic DeepAgent "Hello World"
- [ ] Test CompositeBackend routing
- [ ] Create Ink CLI shell

**Success Criteria:**
- ✅ Can create and invoke a DeepAgent
- ✅ CompositeBackend routes work (/workspace, /memories, /deliverables)
- ✅ LangSmith traces appear
- ✅ Ink CLI displays agent output

**Time Estimate:** 5-7 days
**Cost to Test:** <$1 (simple prompts)

---

### Phase 1: Discovery Agent (Week 3-4)

**Objective: Autonomous competitive research with parallel subagents**

**Tasks:**
- [ ] Implement Discovery agent with Tavily search
- [ ] Create 3 specialized subagents:
  - productAnalysisAgent
  - pricingAnalysisAgent
  - featureComparisonAgent
- [ ] Test scatter-gather parallelization (max 3 concurrent)
- [ ] Implement filesystem handoff protocol
- [ ] Write synthesis logic (consolidate findings)
- [ ] Add progress streaming to Ink CLI
- [ ] Create LangSmith evaluation dataset

**Prompts to Create:**
- Discovery system prompt (with Eames Brain intelligence)
- Subagent prompts (focused, specialized)
- Synthesis prompt (consolidation)

**Success Criteria:**
- ✅ Can research 3 competitors in parallel
- ✅ Generates comparison matrix with citations
- ✅ Writes synthesis to /workspace/research/synthesis.md
- ✅ < 2 minutes execution time
- ✅ < $0.50 cost per research query

**Time Estimate:** 7-10 days
**Cost to Test:** $10-20 (multiple test runs)

---

### Phase 2: Define Agent + HITL (Week 5-6)

**Objective: PRD generation with human approval checkpoint**

**Tasks:**
- [ ] Implement Define agent
- [ ] Integrate Eames Brain (JTBD + PRD generation prompts)
- [ ] Generate structured PRD from research
- [ ] Create user stories with acceptance criteria
- [ ] Implement Human-in-the-Loop checkpoint:
  - Display PRD in Ink UI (scrollable, formatted)
  - Prompt: [A]pprove, [E]dit, [R]eject
  - Edit mode: LLM-powered refinement
  - Resume after approval
- [ ] Test rejection → loop back to Define
- [ ] Create PRD quality evaluator (LangSmith)

**Prompts to Create:**
- Define system prompt (JTBD + PRD expertise)
- PRD template/structure
- User story generator prompt

**Success Criteria:**
- ✅ Generates complete PRD with all sections
- ✅ User can approve/edit/reject in CLI
- ✅ Edit mode works (LLM refines based on feedback)
- ✅ Approved PRD saved to /workspace/planning/prd.md
- ✅ < 3 minutes execution time
- ✅ < $1.00 cost per PRD

**Time Estimate:** 7-10 days
**Cost to Test:** $15-25

---

### Phase 3: Design Agent (Week 7-8)

**Objective: Design system + component specs**

**Tasks:**
- [ ] Implement Design agent
- [ ] Integrate Eames Brain (Visual Design Excellence prompts)
- [ ] Generate design system:
  - Color palette (accessibility-first, WCAG AA)
  - Typography scale (modular scale, hierarchy)
  - Spacing system (8pt grid)
  - Component tokens (buttons, inputs, cards)
- [ ] Create component specifications (atomic design)
- [ ] Generate lo-fi wireframes (text-based or ASCII art)
- [ ] Test with multiple design styles (Stripe, Linear, Notion)
- [ ] Validate accessibility (contrast checker)

**Prompts to Create:**
- Design system prompt (color theory, typography, spacing)
- Component specification prompt (atomic design)
- Accessibility validator prompt

**Success Criteria:**
- ✅ Generates complete design system
- ✅ All colors meet WCAG AA (4.5:1 contrast)
- ✅ Typography scale is consistent
- ✅ Component specs are detailed and implementable
- ✅ < 3 minutes execution time
- ✅ < $0.75 cost per design system

**Time Estimate:** 7-10 days
**Cost to Test:** $10-20

---

### Phase 4: Develop Agent (Week 9-11)

**Objective: Production-grade code generation with quality gates**

**Tasks:**
- [ ] Implement Develop agent
- [ ] Integrate Eames Brain (Full-Stack Engineering prompts)
- [ ] Generate Next.js 14 App Router project:
  - TypeScript strict mode
  - Tailwind CSS (design system tokens)
  - Component library (from design specs)
  - API routes (if needed)
  - Tests (Vitest)
- [ ] Implement quality gates:
  - Run ESLint (must pass)
  - Run TypeScript compiler (must pass)
  - Run tests (must pass)
  - Self-healing loop (max 3 retries)
- [ ] Test with multiple app types (todo, dashboard, landing page)
- [ ] Measure bundle size (<200KB gzipped)

**Prompts to Create:**
- React component generation (TSX + Tailwind + a11y)
- Next.js project scaffolding
- Test generation (unit + integration)
- Self-healing prompt (fix lint/type/test errors)

**Success Criteria:**
- ✅ Generates working Next.js app
- ✅ All quality gates pass (lint, types, tests)
- ✅ Components match design system
- ✅ Code follows Eames Brain standards (WCAG AA, TypeScript strict)
- ✅ npm run build succeeds
- ✅ < 5 minutes execution time
- ✅ < $2.00 cost per app

**Time Estimate:** 10-14 days
**Cost to Test:** $30-50

---

### Phase 5: Deliver Agent (Week 12)

**Objective: GitHub + deployment automation**

**Tasks:**
- [ ] Implement Deliver agent
- [ ] Integrate GitHub MCP server:
  - Create repository
  - Push code with proper commits
  - Add README with deployment instructions
- [ ] Integrate Netlify/Vercel deployment:
  - Auto-detect framework (Next.js)
  - Set environment variables
  - Trigger deploy
  - Wait for completion
  - Return live URL
- [ ] Add HITL checkpoint before deploy
- [ ] Test with both Netlify and Vercel
- [ ] Handle deployment failures gracefully

**Prompts to Create:**
- GitHub commit message generator (Conventional Commits)
- Deployment configuration prompt
- Rollback/recovery prompt

**Success Criteria:**
- ✅ Creates GitHub repo with clean commits
- ✅ Deploys to Netlify or Vercel successfully
- ✅ Returns live URL (https://...)
- ✅ User can preview before final deploy
- ✅ < 2 minutes execution time
- ✅ < $0.25 cost per deployment

**Time Estimate:** 5-7 days
**Cost to Test:** $10-15

---

### Phase 6: End-to-End Integration (Week 13)

**Objective: All 5 phases working together seamlessly**

**Tasks:**
- [ ] Integrate all phases in LangGraph orchestrator
- [ ] Test complete workflow: "Build a todo app"
  - Discovery: research todo apps
  - Define: generate PRD [HUMAN APPROVAL]
  - Design: create design system
  - Develop: generate code + tests
  - Deliver: deploy to Vercel [HUMAN APPROVAL]
- [ ] Measure total time (target: <15 minutes)
- [ ] Measure total cost (target: <$5)
- [ ] Test resume capability (interrupt and resume)
- [ ] Test error recovery (simulate failures)
- [ ] Create comprehensive demo video

**Success Criteria:**
- ✅ "Build a todo app" completes end-to-end
- ✅ Total time < 15 minutes
- ✅ Total cost < $5
- ✅ User can resume after interruption
- ✅ Gracefully handles API failures
- ✅ Deployed app is accessible and works

**Time Estimate:** 5-7 days
**Cost to Test:** $50-75 (multiple full runs)

---

### Phase 7: Polish & Production (Week 14-16)

**Objective: Production-ready with observability and documentation**

**Tasks:**
- [ ] Implement comprehensive error handling
- [ ] Add retry logic with exponential backoff
- [ ] Create Grafana dashboard:
  - Phase success rates
  - Cost per deliverable
  - P95 latency by phase
  - Active projects
- [ ] Write comprehensive documentation:
  - User guide
  - Architecture guide
  - Contributing guide
  - Troubleshooting guide
- [ ] Create example projects (5-10 different app types)
- [ ] Optimize costs (use Haiku where possible)
- [ ] Security audit (sandboxing, secrets management)
- [ ] Performance optimization (prompt caching, parallel execution)

**Success Criteria:**
- ✅ All error cases handled gracefully
- ✅ Grafana dashboard shows real-time metrics
- ✅ Documentation is complete and clear
- ✅ 10 example projects in repo
- ✅ Security review passed
- ✅ Average cost < $3 per app (stretch goal)

**Time Estimate:** 10-14 days
**Cost to Test:** $50-100 (optimization experiments)

---

## 📁 Project Structure

```
eames-design-agent/
├── src/
│   ├── orchestrator/
│   │   ├── workflow.ts              # Custom LangGraph
│   │   ├── state.ts                 # AgentState definition
│   │   └── checkpoints.ts           # Resume logic
│   │
│   ├── agents/
│   │   ├── discovery.ts             # Discovery agent
│   │   ├── define.ts                # Define agent
│   │   ├── design.ts                # Design agent
│   │   ├── develop.ts               # Develop agent
│   │   └── deliver.ts               # Deliver agent
│   │
│   ├── subagents/
│   │   ├── product-analysis.ts
│   │   ├── pricing-analysis.ts
│   │   ├── feature-comparison.ts
│   │   ├── persona-generator.ts
│   │   └── ... (others)
│   │
│   ├── intelligence/
│   │   ├── eames-brain.ts           # Core intelligence
│   │   ├── prompts/
│   │   │   ├── core-identity.ts
│   │   │   ├── behavioral-principles.ts
│   │   │   ├── visual-design.ts
│   │   │   ├── engineering.ts
│   │   │   ├── frameworks.ts        # JTBD, Double Diamond, etc.
│   │   │   └── phase-prompts.ts     # Discovery, Define, etc.
│   │   └── prompt-composer.ts       # Smart prompt assembly
│   │
│   ├── middleware/
│   │   ├── phase-progress.ts        # Custom: progress tracking
│   │   ├── github-integration.ts    # Custom: GitHub middleware
│   │   ├── quality-gates.ts         # Custom: validation
│   │   └── metrics.ts               # Custom: Prometheus
│   │
│   ├── tools/
│   │   ├── search.ts                # Tavily integration
│   │   ├── github.ts                # GitHub MCP wrapper
│   │   ├── deploy.ts                # Netlify/Vercel
│   │   ├── code-generation.ts       # React/Next.js generators
│   │   └── quality-checks.ts        # Linting, tests, types
│   │
│   ├── cli/
│   │   ├── index.tsx                # Main CLI (Ink)
│   │   ├── components/
│   │   │   ├── PhaseProgress.tsx
│   │   │   ├── ApprovalPrompt.tsx
│   │   │   ├── ErrorDisplay.tsx
│   │   │   └── ResultsSummary.tsx
│   │   └── commands/
│   │       ├── build.ts             # eames build "todo app"
│   │       ├── resume.ts            # eames resume <project_id>
│   │       └── list.ts              # eames list
│   │
│   ├── storage/
│   │   ├── backends.ts              # CompositeBackend setup
│   │   ├── checkpointer.ts          # PostgreSQL checkpointer
│   │   └── store.ts                 # LangGraph Store
│   │
│   └── utils/
│       ├── tracing.ts               # LangSmith integration
│       ├── metrics.ts               # Prometheus client
│       ├── cost-calculator.ts       # Token usage tracking
│       └── validators.ts            # Input validation
│
├── docs/
│   ├── research/                    # All research docs
│   ├── architecture/                # System design docs
│   ├── guides/                      # User & developer guides
│   └── examples/                    # Example projects
│
├── examples/
│   ├── todo-app/
│   ├── dashboard/
│   ├── landing-page/
│   └── ... (10 total)
│
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
├── config/
│   ├── docker-compose.yml           # PostgreSQL, Grafana
│   ├── prometheus.yml               # Metrics config
│   └── grafana/                     # Dashboards
│
├── .deepagents/
│   └── agent.md                     # Project-level memory
│
├── EAMES_COMPLETE_VISION.md         # Vision doc
├── EAMES_BRAIN_2.0.md               # Intelligence architecture
├── MASTER_IMPLEMENTATION_PLAN.md    # This file
├── package.json
├── tsconfig.json
└── README.md
```

---

## 💰 Cost Optimization Strategy

### Model Selection by Task

```typescript
const MODEL_ROUTING = {
  // Creative, strategic work
  'discovery': 'claude-sonnet-4-20250514',      // $3/$15 per MTok
  'define': 'claude-sonnet-4-20250514',         // $3/$15 per MTok
  'design': 'claude-sonnet-4-20250514',         // $3/$15 per MTok

  // Code generation (quality matters)
  'develop_components': 'claude-sonnet-4-20250514',  // $3/$15 per MTok
  'develop_tests': 'claude-3-5-haiku-20241022',      // $0.80/$4 per MTok

  // Simple orchestration
  'deliver': 'claude-3-5-haiku-20241022',       // $0.80/$4 per MTok

  // Bulk generation (fallback)
  'bulk': 'gpt-4o-mini'                         // $0.15/$0.60 per MTok
};
```

### Prompt Caching (90% Savings)

```typescript
// DeepAgents has AnthropicPromptCachingMiddleware built-in
// Caches:
// - System prompt (Eames Brain intelligence)
// - Tool definitions
// - Filesystem context
//
// Result: 90% cost reduction on repeated calls
// Cache lifetime: 5 minutes
```

### Cost Targets

```
Phase          | Target Cost | Model              | Optimization
---------------|-------------|--------------------|--------------
Discovery      | $0.50       | Sonnet (parallel)  | 3 concurrent max
Define         | $1.00       | Sonnet             | Prompt caching
Design         | $0.75       | Sonnet             | Prompt caching
Develop        | $2.00       | Sonnet + Haiku mix | Haiku for tests
Deliver        | $0.25       | Haiku              | Simple tasks
Buffer         | $0.50       | -                  | Retries/errors
---------------|-------------|--------------------|--------------
TOTAL TARGET   | $5.00       | -                  | -
STRETCH GOAL   | $3.00       | -                  | More Haiku use
```

---

## 🧪 Testing Strategy

### Unit Tests (Fast, Cheap)

```typescript
// Test individual components
describe('Discovery Agent', () => {
  it('should generate competitor analysis', async () => {
    const agent = createDiscoveryAgent();
    const result = await agent.invoke(
      { messages: [...] },
      { recursion_limit: 1 }  // Single turn only!
    );

    expect(result.competitors).toHaveLength(3);
    expect(result.synthesis).toContain('comparison matrix');
  });
});

Cost per test: <$0.01
```

### Integration Tests (Medium)

```typescript
// Test phase handoffs
describe('Discovery → Define Handoff', () => {
  it('should pass research to Define agent', async () => {
    // Run Discovery
    const discovery = await runDiscoveryPhase(query);
    expect(discovery.output).toExist();

    // Verify file written
    const research = await readFile('/workspace/research/synthesis.md');
    expect(research).toContain('competitor analysis');

    // Run Define with research
    const define = await runDefinePhase();
    expect(define.prd).toContain(research.keyFindings);
  });
});

Cost per test: $0.50-1.00
```

### End-to-End Tests (Slow, Expensive)

```typescript
// Test full workflow
describe('Complete Workflow', () => {
  it('should build and deploy a todo app', async () => {
    const result = await eamesOrchestrator.invoke({
      userQuery: 'Build a todo app'
    });

    expect(result.deploymentUrl).toMatch(/https:\/\/.+/);

    // Verify deployed app responds
    const response = await fetch(result.deploymentUrl);
    expect(response.status).toBe(200);
  }, 600000);  // 10 minute timeout
});

Cost per test: $5-10
```

### LangSmith Evaluations

```python
# Create evaluation dataset
from langsmith.evaluation import evaluate

dataset = [
  {
    "input": "Build a todo app",
    "expected": {
      "has_prd": True,
      "has_design_system": True,
      "deployment_success": True
    }
  },
  # ... more examples
]

# Define evaluators
def prd_quality(run, example):
    prd = run.outputs['prd']
    score = 0
    if 'problem statement' in prd.lower(): score += 0.25
    if 'user stories' in prd.lower(): score += 0.25
    if 'acceptance criteria' in prd.lower(): score += 0.25
    if 'success metrics' in prd.lower(): score += 0.25
    return {"score": score}

# Run evaluation
evaluate(
    lambda input: eames_orchestrator.invoke(input),
    data=dataset,
    evaluators=[prd_quality, deployment_success, cost_under_budget]
)
```

---

## 📊 Success Metrics & KPIs

### Performance Metrics

```yaml
Execution Time:
  Target: <15 minutes total
  P50: <12 minutes
  P95: <18 minutes
  P99: <25 minutes

Per-Phase Targets:
  Discovery: <2 minutes
  Define: <3 minutes
  Design: <3 minutes
  Develop: <5 minutes
  Deliver: <2 minutes
```

### Cost Metrics

```yaml
Cost per App:
  Target: <$5.00
  Stretch: <$3.00

Per-Phase Targets:
  Discovery: <$0.50
  Define: <$1.00
  Design: <$0.75
  Develop: <$2.00
  Deliver: <$0.25

Monthly Budget (100 apps):
  Target: $500/month
  Stretch: $300/month
```

### Quality Metrics

```yaml
Success Rates:
  End-to-End: >90%
  Per Phase: >95%

Code Quality:
  Linting: 100% pass
  Type Checking: 100% pass
  Tests: >80% coverage
  Bundle Size: <200KB gzipped

Accessibility:
  WCAG AA: 100% compliance
  Color Contrast: 100% pass (4.5:1)

Deployment:
  Build Success: >95%
  Deploy Success: >90%
  URL Accessibility: >99%
```

### User Experience Metrics

```yaml
CLI UX:
  Progress Visibility: Clear phase indicators
  Error Messages: Actionable and friendly
  Resume Success: >90%

Approval Flow:
  PRD Review Time: <2 minutes average
  Edit Success: >80% (first attempt)

Output Quality (User Survey):
  "Looks professional": >90%
  "Matches vision": >80%
  "Ready to use": >70%
```

---

## ⚠️ Risk Mitigation

### Risk 1: Context Window Bloat

**Impact:** High (breaks agent)
**Probability:** High (without mitigation)

**Mitigation:**
1. CompositeBackend with automatic eviction (>20k tokens)
2. Subagents for context isolation
3. Filesystem handoff protocol (pass by reference)
4. Conversation summarization middleware

**Status:** MITIGATED (DeepAgents solves this)

### Risk 2: Cost Overruns

**Impact:** Medium (budget issues)
**Probability:** Medium

**Mitigation:**
1. Per-phase budget limits (hard stops)
2. Model routing (Haiku for simple tasks)
3. Prompt caching (90% savings)
4. Early exit heuristics
5. LangSmith cost monitoring

**Status:** MANAGEABLE (proven strategies)

### Risk 3: Quality Issues

**Impact:** High (user trust)
**Probability:** Medium

**Mitigation:**
1. Human approval checkpoints (PRD, deployment)
2. Automated quality gates (linting, tests, types)
3. LangSmith evaluations with datasets
4. Self-correction loops (max 3 retries)
5. Eames Brain intelligence (best practices embedded)

**Status:** CONTROLLED (multi-layer validation)

### Risk 4: API Failures

**Impact:** High (blocks progress)
**Probability:** Medium

**Mitigation:**
1. Retry logic with exponential backoff
2. Fallback LLM providers (Anthropic → OpenAI)
3. Checkpointing (resume from last good state)
4. Graceful degradation (skip non-critical steps)
5. User notifications (clear error messages)

**Status:** HANDLED (standard practices)

### Risk 5: Complexity Creep

**Impact:** Medium (maintenance burden)
**Probability:** High (feature requests)

**Mitigation:**
1. Start simple, add features incrementally
2. Document architecture decisions (ADRs)
3. Regular code reviews
4. Keep abstractions thin
5. Resist "one more feature" syndrome

**Status:** VIGILANCE REQUIRED

---

## 🎓 Key Learnings Applied

### From DeepAgents Research
✅ Don't reinvent the wheel - use battle-tested components
✅ Filesystem is the universal interface
✅ Subagents prevent context bloat
✅ Middleware order matters
✅ MCP is the future of tool integration

### From Eames Brain 2.0
✅ World-class intelligence requires world-class prompts
✅ Opinionated excellence > asking 100 questions
✅ Stripe/Linear/Notion/Apple standards are achievable
✅ Full-stack mindset: design + code are inseparable
✅ Vague prompts need confident decisions

### From Agent-Native Architecture
✅ Parity: agent must match UI capabilities
✅ Granularity: atomic tools > bundled features
✅ Composability: new features = new prompts
✅ Emergent capability: users will surprise you
✅ Files as universal interface: most battle-tested

### From Production Examples
✅ Supervisor + workers pattern is proven
✅ Hierarchical teams scale well
✅ Scatter-gather parallelization works (3-5 max)
✅ HITL at milestones is essential
✅ Observability is non-negotiable

---

## 📅 Timeline Summary

```
Week 1-2:   Foundation (infrastructure, DeepAgents setup)
Week 3-4:   Discovery Agent (competitive research)
Week 5-6:   Define Agent + HITL (PRD generation)
Week 7-8:   Design Agent (design system)
Week 9-11:  Develop Agent (code generation + quality gates)
Week 12:    Deliver Agent (GitHub + deployment)
Week 13:    End-to-End Integration (full workflow)
Week 14-16: Polish & Production (observability, docs)

Total: 14-16 weeks (3.5-4 months)
```

---

## 🚦 Go/No-Go Decision Points

### After Week 4 (Discovery Agent)
**Question:** Can we research competitors reliably?

**Go Criteria:**
- ✅ <2 min execution time
- ✅ <$0.50 cost
- ✅ Quality synthesis with citations

**No-Go:** Pivot to simpler research strategy

### After Week 6 (Define Agent)
**Question:** Can we generate quality PRDs?

**Go Criteria:**
- ✅ PRD has all required sections
- ✅ HITL approval flow works
- ✅ <$1.00 cost

**No-Go:** Simplify PRD template or add more examples

### After Week 11 (Develop Agent)
**Question:** Can we generate production code?

**Go Criteria:**
- ✅ Code passes linting, types, tests
- ✅ Matches design system
- ✅ <$2.00 cost

**No-Go:** This is critical - reassess approach if failing

### After Week 13 (End-to-End)
**Question:** Does the full workflow work?

**Go Criteria:**
- ✅ "Build a todo app" succeeds end-to-end
- ✅ <15 min total time
- ✅ <$5.00 total cost
- ✅ Resume works

**No-Go:** Fix critical issues before proceeding to polish

---

## 🎯 Definition of Done

**Eames v2.0 is DONE when:**

1. **Functionality**
   - [ ] All 5 phases work end-to-end
   - [ ] Human approval checkpoints function
   - [ ] Resume capability works reliably
   - [ ] Error recovery handles common failures

2. **Quality**
   - [ ] Generated apps pass linting, types, tests
   - [ ] All UIs meet WCAG AA accessibility
   - [ ] Deployed apps are accessible and functional
   - [ ] Code follows Eames Brain standards

3. **Performance**
   - [ ] <15 minutes total execution time
   - [ ] <$5.00 total cost per app
   - [ ] P95 latency meets targets
   - [ ] Prompt caching working (90% savings)

4. **User Experience**
   - [ ] Beautiful Ink CLI with progress indicators
   - [ ] Clear, actionable error messages
   - [ ] Approval flow is intuitive
   - [ ] 10 example projects included

5. **Production Readiness**
   - [ ] LangSmith tracing operational
   - [ ] Grafana dashboards deployed
   - [ ] Comprehensive documentation complete
   - [ ] Security audit passed

6. **Validation**
   - [ ] 10 successful end-to-end test runs
   - [ ] LangSmith evaluations pass (>90%)
   - [ ] User testing completed (5+ users)
   - [ ] Team demo completed

---

## 🔗 Critical Resources

### Must-Read Before Starting
1. **DeepAgents Quickstarts** - https://github.com/langchain-ai/deepagents-quickstarts
2. **Deep Research Agent** - Full production example
3. **LangGraph Supervisor Pattern** - https://github.com/langchain-ai/langgraph-supervisor-py
4. **Agent-Native Architecture** - Files in docs/research

### Reference Documentation
1. **DeepAgents Docs** - https://docs.langchain.com/oss/javascript/deepagents/overview
2. **LangGraph Docs** - https://docs.langchain.com/oss/javascript/langgraph/
3. **LangSmith Docs** - https://docs.langchain.com/langsmith/
4. **Eames Brain 2.0** - EAMES_COMPLETE_VISION.md

### Community & Support
1. LangChain GitHub Discussions
2. DeepAgents GitHub Issues
3. Discord: LangChain community
4. Anthropic Developer Discord

---

## 🎬 Next Immediate Actions

**RIGHT NOW (Day 1):**
1. ✅ Review this plan with team
2. ✅ Get stakeholder approval
3. ✅ Set up development environment:
   - Install Bun
   - Install PostgreSQL (Docker)
   - Create LangSmith account
   - Get Anthropic API key
   - Get Tavily API key
4. ✅ Clone DeepAgents quickstarts repo
5. ✅ Run "Hello World" DeepAgent
6. ✅ Create project repository
7. ✅ Initialize first commit

**Week 1 Tasks:**
- Follow Phase 0 checklist above
- Set up infrastructure
- Prove DeepAgents works
- Create basic CLI shell

---

## 🏆 Success Vision

**When Eames v2.0 is complete:**

A user types:
```bash
eames build "A mobile-first expense tracker for freelancers"
```

15 minutes later, they have:
- ✅ A GitHub repository with production code
- ✅ A live deployment at https://expense-tracker-xyz.vercel.app
- ✅ Beautiful UI with Stripe-level polish
- ✅ Full TypeScript + tests + accessibility
- ✅ Total cost: $4.50

**That's the jackpot.**

---

## 📝 Conclusion

This is **THE PLAN**.

We have:
- ✅ **Battle-tested architecture** (DeepAgents + LangGraph)
- ✅ **World-class intelligence** (Eames Brain 2.0)
- ✅ **Production patterns** (proven by AWS, Deep Research Agent, etc.)
- ✅ **Clear roadmap** (14-16 weeks, detailed milestones)
- ✅ **Risk mitigation** (every major risk addressed)
- ✅ **Cost optimization** (target: <$5 per app)

**No more research. No more planning. Time to build.**

---

**Status:** ✅ Ready for Implementation
**Version:** 1.0.0
**Date:** January 18, 2026
**Next Review:** After Phase 0 completion (Week 2)

**Let's build the world's most capable autonomous design agent.** 🚀
