# Eames Design Agent v2.0: DeepAgents Architecture and Strategy

**Introduction**  
Eames v2.0 is an ambitious autonomous product design agent that guides a project from Discovery through Delivery. LangChain’s **DeepAgents** framework is well-suited to this complex, multi-phase workflow, providing built-in planning, context management via a virtual filesystem, subagent orchestration, and persistent memory.  

This document details an architecture using DeepAgents to implement Eames’s five phases (Discovery, Define, Design, Develop, Deliver), address filesystem and memory design, subagent coordination, custom tools, CLI design, error handling, testing, and performance considerations. It also compares this approach to similar systems and outlines an MVP roadmap.

---

## Table of Contents
1. Architecture Design (Phased Agent Orchestration)
2. Filesystem Architecture (Backends and Directory Design)
3. Subagent Design (Phase Specialization and Coordination)
4. Custom Tools and Middleware (Extending Capabilities)
5. CLI Design (User Interface and Control Flow)
6. Memory and Context Management (Long-Term Memory Design)
7. LangSmith Integration (Observability and Evaluation)
8. Error Handling and Recovery (Robustness)
9. Testing Strategy (Ensuring Reliability of an Agentic System)
10. Performance Optimization (Speed and Cost)
11. Comparison to Similar Systems and Final Recommendations
12. MVP Roadmap

---

## 1) Architecture Design (Phased Agent Orchestration)

DeepAgents is designed for autonomous, long-running agents that handle complex, multi-step tasks. It combines a planning tool, file system context, and subagents to allow an agent to break down work into discrete steps and manage large context over long sessions. This aligns well with Eames’s phased workflow.

### Main Orchestrator vs. LangGraph Workflow

- **Option A: Single DeepAgent with Subagents**  
  Use one main agent (the orchestrator) and implement each phase as a specialized subagent. The main agent coordinates and delegates each phase via the built-in `task(...)` tool. This keeps the main agent’s context clean while subagents handle heavy work.

- **Option B: LangGraph-Orchestrated Flow**  
  Build a LangGraph state machine where each phase is a node in a graph. This provides strict control of ordering, gating, and concurrency, but requires more code and can duplicate some DeepAgents functionality.

- **Option C: Hybrid**  
  Start with Option A, and add minimal external orchestration for user approvals and parallelizable tasks.

### Recommended Approach

Implement Eames v2.0 as a **main orchestrator agent with five specialized phase subagents**, augmented with lightweight external orchestration for milestone approvals and optional parallel work.

### State Flow Between Phases

Use the virtual filesystem to pass artifacts between phases instead of carrying large content in conversation history:

- Discovery writes research outputs to `/workspace/research/*`
- Define reads research files and writes PRD and user stories to `/workspace/planning/*`
- Design reads PRD and writes specs to `/workspace/design/*`
- Develop reads requirements and writes code to `/deliverables/src/*`
- Deliver pushes and deploys from `/deliverables/*`

This prevents context overflow by offloading long artifacts to files.

### Keeping Coherence Across Phases

Maintain global context in persistent memory files (for example `/memories/project-context.md`) to store product vision, key decisions, assumptions, and constraints.

---

## 2) Filesystem Architecture (Backends and Directory Design)

### Proposed Directory Structure

```text
/workspace/            # Ephemeral working directory for intermediate files
  /research/           # Discovery outputs
  /planning/           # Define outputs
  /design/             # Design artifacts
  /development/        # Interim build logs, test results

/memories/             # Persistent memory across sessions
  project-context.md
  design-decisions.md
  tech-stack.md
  user-preferences.md

/deliverables/         # Final outputs ready for Git and deployment
  prd.md
  user-stories.md
  design-system.md
  /src/
  README.md
```

### Mapping to Backends (CompositeBackend)

Use a CompositeBackend that routes paths to different backends:

- `/workspace/` -> **StateBackend** (ephemeral, in-memory)
- `/memories/` -> **StoreBackend** (persistent, LangGraph Store)
- `/deliverables/` -> **FilesystemBackend** (real disk folder for export)

This provides:
- fast scratch work in `/workspace`
- true persistence across sessions in `/memories`
- tangible project output on disk in `/deliverables`

### Large Output Eviction

DeepAgents can automatically evict large tool outputs to files and keep only references in message history. This is a core mechanism to avoid context window blowups.

---

## 3) Subagent Design (Phase Specialization and Coordination)

Implement each phase as a dedicated subagent. Each subagent has:
- a focused system prompt
- a narrow toolset
- explicit file paths for inputs and outputs
- optional model specialization

### Main Orchestrator Agent
- Responsibilities: plan, sequence phases, delegate tasks, enforce checkpoints, handle retries
- Tools: planning, subagent spawning, filesystem utilities
- Model: fast and reliable (often smaller than phase agents)

### Discovery Subagent
- Responsibilities: competitor analysis, market signals, user pains, trend synthesis
- Tools: web search, optional page fetch, filesystem write
- Outputs: `/workspace/research/summary.md`, plus supporting files

### Define Subagent
- Responsibilities: PRD, user stories, acceptance criteria, scope, constraints
- Tools: filesystem read/write
- Outputs: `/workspace/planning/prd.md`, `/workspace/planning/user_stories.md`, plus a short summary file

### Design Subagent
- Responsibilities: IA, flows, screen specs, design system primitives, component specs
- Tools: filesystem read/write
- Outputs: `/workspace/design/design-system.md`, `/workspace/design/components.md`, `/workspace/design/flows.md`

### Develop Subagent
- Responsibilities: generate production-grade codebase, tests, linting, build
- Tools: filesystem, shell execution (`npm test`, `npm run build`, `tsc`)
- Outputs: full app in `/deliverables/src/` plus config files

Recommended internal loop:
1. generate code
2. run tests and typecheck
3. fix failures
4. repeat until green or max retries reached

### Deliver Subagent
- Responsibilities: GitHub repo creation, push, deploy (Netlify or Vercel), output URLs
- Tools: GitHub API tool or git shell tool, deployment tool or CLI wrappers
- Outputs: final repo URL, deploy URL, deployment logs if needed

---

## 4) Custom Tools and Middleware (Extending Capabilities)

### Must-have Tools
- **Internet search** (Discovery)
- **Shell execution** (Develop and Deliver)
- **GitHub create repo and push** (Deliver)
- **Deploy Netlify or Vercel** (Deliver)

### Optional Tools
- PRD evaluator tool (LLM or checklist-based)
- Lint and typecheck helpers
- Accessibility checks (later)
- Template generators (component scaffolds, design token templates)

### Middleware
Use built-in middleware:
- TodoListMiddleware (planning)
- FilesystemMiddleware (filesystem tools)
- SubAgentMiddleware (subagent spawning)

Add custom middleware later only if you need:
- token budgeting and enforcement
- telemetry and structured logging
- tool gating for approvals

---

## 5) CLI Design (User Interface and Control Flow)

### Core Commands
- `eames` (interactive)
- `eames "Build X"` (one-shot)
- `eames --resume <project_id>`
- `eames --output <dir>`

### UX Goals
- Show phase-by-phase progress
- Stream meaningful outputs
- Avoid printing large code blocks, prefer file-write confirmations
- Support optional milestone approvals (PRD, deployment)

### Resuming
Persist a mapping of:
- `project_id -> thread_id`
- `project_id -> output_dir`

On resume, reuse `thread_id` so `/memories` loads correctly.

---

## 6) Memory and Context Management (Long-Term Memory Design)

### What to Store
- Project context: vision, target user, key decisions
- Design decisions: rationale and trade-offs
- Tech stack: frameworks and constraints
- User preferences: styling, libraries, conventions
- Progress: completed phases and next steps

### Best Practices
- Keep memory structured and discoverable
- Use short append-only logs for decisions
- Periodically summarize or prune if files grow large
- Teach agents to read memory files when needed, not always preloading them

---

## 7) LangSmith Integration (Observability and Evaluation)

Enable tracing and evaluation to improve reliability:

### What to Track
- tokens and cost per run and per phase
- time per phase
- number of tool calls and retries
- build and test pass rates
- deploy success rate
- user edits or rejections at checkpoints

### Evaluation Ideas
- PRD completeness grader
- design consistency grader (requirements to specs)
- code quality metrics (lint errors, type errors, test failures)

---

## 8) Error Handling and Recovery (Robustness)

### Expected Failures
- API rate limits (LLM, search, GitHub, deploy)
- tool errors (path issues, missing env vars)
- build failures on deploy
- repeated test failures during development
- partial outputs from a subagent

### Strategies
- retries with backoff for flaky external calls
- local build and test before deploy
- bounded self-heal loops (max retries)
- clear, actionable error reports to the user
- checkpoint artifacts to files so resume is possible

---

## 9) Testing Strategy (Ensuring Reliability)

### Unit Tests
- tool functions: GitHub, deploy, search wrappers, shell runner
- parsers: to-do extraction, log parsing

### Integration Tests
- phase handoff: files written by one phase read by the next
- memory routing: `/memories` persists across thread resume
- error simulations: deploy fails, tests fail, search fails

### End-to-End Tests
- run full workflow on a small prompt
- verify deliverables exist and build succeeds
- optionally validate deployed URL responds

Use outcome-based assertions, not exact text matches.

---

## 10) Performance Optimization (Speed and Cost)

### Primary Levers
- store large artifacts in files, not chat
- avoid re-reading full documents unnecessarily
- constrain search queries and results
- use smaller models for orchestration and delivery tasks
- run local checks once, avoid redundant rebuilds

### Optional Improvements
- parallelize independent research tasks
- cache repeated search queries within a run
- add a fast mode vs quality mode flag in CLI

---

## 11) Comparison to Similar Systems and Final Recommendations

### Claude Code
Similar core pattern: system prompt, to-do planning, filesystem, subagents. Eames generalizes this beyond coding into product discovery and design.

### v0.dev and Bolt.new
v0 is primarily UI generation. Bolt targets full-stack generation. Eames differentiates by a structured, phase-based workflow plus PRD, design specs, tests, and automated deployment.

### Cursor and IDE assistants
Great for iterative pair programming. Eames is designed for autonomous end-to-end project creation, then can hand off to IDE tools for refinement.

### Key Risks
- hallucinations in early phases
- error accumulation across phases
- external tool brittleness
- debugging complexity without tracing

### Key Mitigations
- file-based context passing
- milestone checkpoints and validation
- LangSmith traces and metrics
- bounded retries and graceful resume

---

## 12) MVP Roadmap

A practical MVP sequence:

1. **Core Orchestrator + Develop + Deliver**  
   Prove you can reliably generate a working React + TypeScript + Tailwind app and deploy it.

2. **Add Define Phase**  
   Generate PRD and user stories, add optional user approval before proceeding.

3. **Add Discovery Phase**  
   Integrate web search and produce research summaries that feed requirements.

4. **Add Design Phase**  
   Produce component and flow specs that guide development.

5. **Add Evaluators and Guardrails**  
   Add checklists and graders for PRD completeness, code quality, and deploy readiness.

6. **Add Resume and Multi-Project Management**  
   Persist thread IDs and output dirs, add `list`, `reset`, and robust resume behavior.

---

## Notes

This markdown captures the full content available from the prior response in this chat. If you want an expanded version with a full implementation blueprint (code scaffolds, prompts for each agent, and tool interface specs), tell me what runtime and provider you want to target (LangChain JS in Bun, Node, or Python).
