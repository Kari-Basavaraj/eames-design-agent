# Deep Research Prompt: Eames Design Agent v2.0 Architecture with DeepAgents

## Context for LLM

I'm building **Eames Design Agent v2.0** - an autonomous product design agent that takes users from Discovery to Delivery (live deployed product). I've discovered LangChain's DeepAgents framework and need your expert architectural guidance.

---

## Project Overview

### What is Eames?
An end-to-end autonomous product design agent that:
1. **Discovery** - Research competitors, market trends, user needs
2. **Define** - Generate PRD, user stories, requirements
3. **Design** - Create UI/UX, wireframes, component specs
4. **Develop** - Generate production-ready, tested code
5. **Deliver** - Deploy to Netlify/Vercel with GitHub repo + live link

### Current State
- **Tech Stack:** Bun runtime, TypeScript, React + Ink (CLI UI)
- **Branch:** `langchain` (pure LangChain implementation)
- **Status:** Early v2.0 implementation phase
- **Repository:** Multi-branch strategy (langchain, sdk, webapp)

### Discovery: DeepAgents Framework
I found LangChain's `deepagents` package (TypeScript/JavaScript) which provides:
- Built-in planning (`write_todos` tool)
- Filesystem tools (ls, read_file, write_file, edit_file, glob, grep)
- Subagent spawning for context isolation
- Long-term memory via LangGraph Store
- Human-in-the-loop capabilities
- CLI interface (replicates Claude Code features)
- Middleware architecture for extensibility

**Key Documentation:**
- https://docs.langchain.com/oss/javascript/deepagents/overview
- https://docs.langchain.com/oss/javascript/deepagents/cli
- https://docs.langchain.com/oss/javascript/deepagents/harness
- https://docs.langchain.com/oss/javascript/deepagents/backends
- https://docs.langchain.com/oss/javascript/deepagents/subagents
- https://docs.langchain.com/oss/javascript/deepagents/middleware
- https://www.npmjs.com/package/deepagents

---

## Research Questions

Please provide detailed, actionable guidance on the following:

### 1. Architecture Design

**Question:** How should I architect Eames v2.0 using DeepAgents?

**Specific sub-questions:**
- Should the 5 phases (Discovery, Define, Design, Develop, Deliver) be implemented as:
  - Separate subagents? (Main orchestrator → phase subagents)
  - LangGraph nodes with DeepAgents capabilities?
  - Hybrid approach?
- How should state flow between phases?
- What should the main agent vs subagent responsibilities be?
- How to handle phase dependencies? (e.g., Design needs Define output)

**Consider:**
- Each phase produces large outputs (PRDs, code files, designs)
- Need to prevent context window bloat
- Some phases can run in parallel (e.g., competitive analysis + user research)
- Need to maintain context across phases for coherent product

---

### 2. Filesystem Architecture

**Question:** How should I structure the filesystem backends for Eames?

DeepAgents supports:
- **StateBackend** - Ephemeral (per-thread)
- **FilesystemBackend** - Local disk
- **StoreBackend** - Cross-thread persistence
- **CompositeBackend** - Route paths to different backends

**Proposed structure:**
```
/workspace/           # Ephemeral working directory
  /research/          # Discovery phase outputs
  /planning/          # Define phase outputs
  /design/            # Design phase artifacts
  
/memories/            # Persistent across threads
  /project-context.md
  /design-decisions.md
  /tech-stack.md
  
/deliverables/        # Final outputs (real filesystem)
  /prd.md
  /user-stories.md
  /design-system/
  /src/
  /README.md
```

**Questions:**
- Is this structure optimal?
- Which paths should use which backend type?
- How to handle large artifacts (generated code, images)?
- Should we auto-evict large tool outputs? (DeepAgents has 20k token threshold)
- How to persist deliverables to GitHub?

---

### 3. Subagent Design

**Question:** How should I design the phase subagents?

**Current thinking:**
```typescript
Main Orchestrator Agent
├── Discovery Subagent
│   ├── Tools: Tavily search, web scraping, competitor analysis
│   ├── Output: Research synthesis (condensed)
│   └── Model: Claude 3.5 Sonnet
├── Define Subagent
│   ├── Tools: PRD generator, user story creator
│   ├── Input: Discovery output
│   ├── Output: PRD + user stories (condensed)
│   └── Model: Claude 3.5 Sonnet
├── Design Subagent
│   ├── Tools: Wireframe generator, component spec creator
│   ├── Input: PRD + user stories
│   ├── Output: Design system + component specs
│   └── Model: Claude 3.5 Sonnet
├── Develop Subagent
│   ├── Tools: Code generator, file writer, test runner
│   ├── Input: Design specs
│   ├── Output: Working application code
│   └── Model: Claude 3.5 Sonnet (or Haiku for speed)
└── Deliver Subagent
    ├── Tools: GitHub API, Netlify/Vercel API
    ├── Input: Complete codebase
    ├── Output: Deployed URL + repo link
    └── Model: Claude 3.5 Haiku (simple orchestration)
```

**Questions:**
- Should each subagent have filesystem access?
- How to pass large outputs between subagents efficiently?
- Should subagents write to shared `/workspace/` or isolated directories?
- Can subagents spawn their own sub-subagents? (e.g., Design → UI subagent + UX subagent)
- How to handle subagent failures/retries?

---

### 4. Custom Tools & Middleware

**Question:** What custom tools and middleware should I implement?

**Required custom tools:**
1. **GitHub Integration**
   - Create repo
   - Initialize with README, .gitignore
   - Push generated code
   - Set up GitHub Actions (optional)

2. **Deployment Tools**
   - Netlify deploy
   - Vercel deploy
   - Environment variable management
   - Custom domain setup (future)

3. **Design Tools**
   - Generate design tokens (colors, typography, spacing)
   - Create component library scaffolding
   - Export Figma-compatible JSON (future)

4. **Quality Assurance**
   - Linting (ESLint, Prettier)
   - Type checking (TypeScript)
   - Test runner (Vitest, Jest)
   - Accessibility checker

**Middleware considerations:**
- Should I create custom middleware or just add tools?
- How to integrate with existing DeepAgents middleware?
- Can middleware modify agent behavior between phases?
- Best practices for middleware composition?

---

### 5. CLI Design

**Question:** How should the Eames CLI work?

DeepAgents provides a CLI that replicates Claude Code. I want:

```bash
# Start interactive session
eames

# Quick mode (one-shot)
eames "Build a todo app with React and deploy to Netlify"

# Resume previous project
eames --resume project-abc123

# Specify output directory
eames --output ./my-project
```

**Questions:**
- Should I extend `deepagents` CLI or build custom?
- How to persist project state for `--resume`?
- Should CLI show phase progress? (Discovery → Define → ...)
- How to handle user approvals? (e.g., approve PRD before Design phase)
- Streaming output considerations?

---

### 6. Memory & Context Management

**Question:** How to manage long-term memory across sessions?

**Use cases:**
1. **User preferences** - "Always use Tailwind CSS", "Deploy to Vercel", "Use TypeScript"
2. **Design decisions** - "This project uses dark mode", "Mobile-first approach"
3. **Project history** - "Previous iteration had performance issues with X"
4. **Learning** - Agent remembers patterns from successful projects

**DeepAgents provides:**
- LangGraph Store for cross-thread persistence
- `/memories/` path convention
- StoreBackend implementation

**Questions:**
- What memory structure should I use?
- Should memories be per-user or per-project?
- How to search/retrieve relevant memories?
- Memory pruning strategy? (avoid bloat)
- How to expose memory management to users?

---

### 7. LangSmith Integration

**Question:** How should I set up observability and evaluation?

**Goals:**
- Trace every phase execution
- Monitor costs (track tokens per phase)
- Evaluate quality (PRD quality, code quality, design coherence)
- A/B test different prompts/models
- Production monitoring (error rates, latency)

**Questions:**
- How to structure LangSmith projects? (one per Eames project? or one global?)
- What custom metrics should I track?
- How to implement quality evaluators?
- Should I use LangSmith Deployment for production?
- Integration with existing Bun/Ink CLI?

---

### 8. Error Handling & Recovery

**Question:** How should Eames handle failures gracefully?

**Scenarios:**
1. API rate limits (Anthropic, OpenAI)
2. LLM refuses to generate code (safety filters)
3. Deployment failure (Netlify/Vercel errors)
4. Invalid PRD (missing critical information)
5. Test failures in generated code

**Questions:**
- Should subagents have retry logic?
- How to implement "self-healing" (agent fixes its own errors)?
- Should main agent orchestrate retries or delegate to subagents?
- Checkpoint strategy for long-running workflows?
- How to expose error context to users?

---

### 9. Testing Strategy

**Question:** How do I test a multi-phase agentic system?

**Test levels:**
1. **Unit tests** - Individual tools, middleware
2. **Integration tests** - Subagent interactions
3. **End-to-end tests** - Full Discovery → Delivery flow
4. **Evaluation tests** - Quality of outputs

**Challenges:**
- Non-deterministic LLM outputs
- Long execution times (full flow might take 10+ minutes)
- External API dependencies (GitHub, Netlify)
- Cost of running tests (LLM API calls)

**Questions:**
- Should I mock LLM responses for tests?
- How to test subagent coordination?
- Best practices for agentic system testing?
- Using LangSmith for evaluation?

---

### 10. Performance Optimization

**Question:** How to make Eames fast and cost-effective?

**Considerations:**
- Each phase might require multiple LLM calls
- Subagents add overhead (spawn, context setup)
- Streaming for better UX
- Model selection (Opus vs Sonnet vs Haiku)
- Parallel execution where possible

**Questions:**
- Which phases can run in parallel?
- When to use cheaper models (Haiku)?
- Caching strategies for repeated operations?
- Should I use prompt caching (Anthropic feature)?
- How to balance speed vs quality?

---

## Desired Output

Please provide:

1. **Architectural recommendations** with reasoning
2. **Code examples** (TypeScript) for critical components
3. **Trade-off analysis** for different approaches
4. **Best practices** from similar agentic systems
5. **Potential pitfalls** and how to avoid them
6. **Implementation roadmap** (what to build first)

---

## Additional Context

### Similar Systems
- **Claude Code** - Coding assistant (inspiration for DeepAgents)
- **v0.dev** - UI generation (similar to our Design phase)
- **Cursor** - AI-powered IDE
- **Replit Agent** - Full-stack app generation

### Technical Constraints
- Must use Bun runtime (not Node.js)
- TypeScript (ESM modules)
- React + Ink for CLI UI
- Multi-provider LLM support (not just Anthropic)
- Git-based version control
- Linear for project management (via MCP)

### Success Criteria
- Generate production-ready apps in <15 minutes
- 90%+ deployment success rate
- User can provide minimal input ("Build X") and get working product
- Cost < $5 per app generation
- Apps pass basic quality checks (linting, types, tests)

---

## Example Workflow (Expected)

```
User: "Build a modern todo app with React, TypeScript, and Tailwind"

Eames:
├─ Discovery Phase (2 min)
│  ├─ Research modern todo app patterns
│  ├─ Analyze competitor features
│  └─ Output: Research synthesis
│
├─ Define Phase (3 min)
│  ├─ Generate PRD
│  ├─ Create user stories
│  ├─ Define acceptance criteria
│  └─ [HUMAN APPROVAL: Show PRD to user]
│
├─ Design Phase (3 min)
│  ├─ Generate design system (colors, typography)
│  ├─ Create component specs
│  ├─ Generate wireframes (text-based)
│  └─ Output: Component library plan
│
├─ Develop Phase (5 min)
│  ├─ Generate React components
│  ├─ Set up Tailwind config
│  ├─ Write tests
│  ├─ Run linting & type checking
│  └─ Output: Complete codebase
│
└─ Deliver Phase (2 min)
   ├─ Create GitHub repo
   ├─ Push code
   ├─ Deploy to Netlify
   └─ Output: https://my-todo-app.netlify.app

Total: ~15 minutes, $3.50 in API costs
```

---

## Questions for You (LLM)

After analyzing this, please answer:

1. Is DeepAgents the right foundation for this use case? Or should I consider alternatives?
2. What's the optimal architecture for the 5-phase workflow?
3. How should I structure subagents and their interactions?
4. What custom middleware/tools are critical vs nice-to-have?
5. What are the biggest risks/challenges in this architecture?
6. What should I build first? (MVP components)
7. Any architectural patterns I'm missing?
8. How does this compare to similar systems you know?

---

## Request

Please provide a comprehensive architectural analysis and implementation strategy. Be specific with code examples where helpful. Identify gaps in my thinking and suggest improvements. Consider both short-term MVP and long-term scalability.

Thank you!
