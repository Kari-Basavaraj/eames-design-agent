# Ralph Wiggum Agentic Coding (Ralph Loop) — Practical Playbook

*Last updated: 2026-01-11*

## 1) What it is

**Ralph Wiggum agentic coding** (often shortened to **“Ralph”** or **“the Ralph Loop”**) is a technique for running an AI coding agent in a **repeat-until-done loop** instead of one big prompt.

The loop:

1. Gives the agent a **small, testable unit of work** (usually from a PRD checklist).
2. Lets the agent edit files and run commands (tests/build/lint).
3. Feeds the outcome back into the next iteration.
4. Stops only when **definition of done** is met (for example, all checklist items passed and tests are green).

Popularization is widely attributed to Geoffrey Huntley (mid-2025), and the concept went viral late-2025 / early-2026 through community repos and write-ups.  
Key explainers and timelines: Sam Couch (Jan 2026) and Dex Horthy (HumanLayer, Jan 2026).  
Sources:  
- Sam Couch: “Ralph Wiggum Coding: Ship Features While You Sleep” — Jan 8, 2026 — https://samcouch.com/articles/ralph-wiggum-coding/  
- HumanLayer (Dex): “a brief history of ralph” — Jan 6, 2026 — https://www.humanlayer.dev/blog/brief-history-of-ralph  
- VentureBeat: “How Ralph Wiggum went from ‘The Simpsons’ to the biggest name in AI right now” — Jan 2026 — https://venturebeat.com/technology/how-ralph-wiggum-went-from-the-simpsons-to-the-biggest-name-in-ai-right-now  

## 2) When to use it (and when not)

### Great fits
- **Well-scoped** features with **objective verification**
  - tests pass, build succeeds, lint is clean
- Mechanical migrations and refactors (when you can validate changes)
- Adding CRUD endpoints, routine integrations, improving coverage

### Poor fits
- Ambiguous goals (“make UI nicer” without criteria)
- High-stakes changes without guardrails (security, payments, prod infra) unless sandboxed + reviewed
- Novel architecture decisions with unclear tradeoffs

A practical heuristic from multiple community write-ups:  
If you wouldn’t leave it to a junior engineer overnight without checkpoints, don’t leave it to Ralph.

## 3) Core principles (the “Ralph Rules”)

- **Short loops beat long prompts**
  - one iteration = one meaningful step; then stop and re-run with feedback
- **External truth**
  - tests, linters, type-checkers, builds
- **Small, declarative work items**
  - acceptance criteria in bullets and checkboxes
- **Persistent memory lives in files**
  - `prd.json`, `progress.md`, `AGENTS.md`, `guardrails.md`, git commits
- **Hard stop conditions**
  - agent must emit a completion token only when verified

## 4) Minimal “Ralph Starter Kit” (folder layout)

A simple structure that works across tools:

```
/specs
  PRD.md                # user stories + acceptance criteria
  prd.json              # machine-readable checklist (optional but recommended)
  AGENTS.md             # coding rules, style guides, constraints (project-specific)
  guardrails.md         # “don’t do X again” lessons learned from failures
  progress.md           # running log of what changed each loop
/scripts
  ralph.sh              # loop runner
```

If you use Ryan Carson’s reference implementation, the pattern is already set up:
- GitHub: https://github.com/snarktank/ralph
- Docs: https://snarktank.github.io/ralph/

Sources:
- snarktank/ralph repository listing and docs: https://github.com/snarktank/ralph , https://snarktank.github.io/ralph/

## 5) Write a PRD that Ralph can actually execute

### PRD template (copy/paste)
Use small stories. Each story must have **observable acceptance criteria**.

```
# PRD: <Feature name>

## Goal
- <one sentence>

## User Stories
### US-1: <story title>
**As a** <persona>  
**I want** <capability>  
**So that** <outcome>

**Acceptance Criteria**
- [ ] AC1: <verifiable condition>
- [ ] AC2: <verifiable condition>
- [ ] AC3: <verifiable condition>

**Notes**
- Constraints: <perf, security, a11y, etc.>
- Files/touchpoints: <where to implement>
```

### Practical guidance
- Keep each story solvable in **1–3 loop iterations**
- Avoid “AND ALSO” acceptance criteria
- Prefer “When I do X, I see Y” over abstract “should be robust”

## 6) Convert PRD to machine-checkable tasks

The `snarktank/ralph` approach uses `prd.json` to track tasks as `passes: true/false`, letting the loop select the next failing item each iteration.

Reference:
- snarktank docs: https://snarktank.github.io/ralph/

Example structure (adapt as needed):

```json
{
  "project": "Example Feature",
  "items": [
    {
      "id": "US-1",
      "title": "Create endpoint",
      "requirements": [
        "Add GET /api/items",
        "Return 200 and JSON array",
        "Add tests"
      ],
      "passes": false
    }
  ]
}
```

## 7) The loop runner (generic)

The essence is “run agent → capture output → run tests → feed back → repeat”.

A minimal bash-style loop (conceptual):

```bash
#!/usr/bin/env bash
set -euo pipefail

MAX_ITERS="${MAX_ITERS:-25}"
for i in $(seq 1 "$MAX_ITERS"); do
  echo "=== Iteration $i ==="
  # 1) Run your agent with a prompt that points to PRD + repo files
  my_agent_cli --prompt-file specs/PROMPT.md | tee -a specs/progress.md

  # 2) Run verification
  npm test || true
  npm run lint || true

  # 3) Exit condition: grep for completion marker written by agent
  if grep -q "<COMPLETE>" specs/progress.md; then
    echo "Done."
    exit 0
  fi
done

echo "Max iterations reached."
exit 1
```

**Important:** keep your loop sandboxed and version-controlled.

## 8) The prompt that makes the loop work

Your agent prompt should enforce:

- Read task list (`prd.json` or `PRD.md`)
- Pick the **next failing task**
- Implement it
- Run tests/build/lint
- Update task status and logs
- Only output completion token when truly done

A practical prompt skeleton:

```
You are an autonomous coding agent.
Goal: complete all unfinished PRD items.

Rules:
- Pick exactly one unfinished item from prd.json.
- Make minimal changes required to satisfy its acceptance criteria.
- Run verification commands: <list them>.
- If verification fails, fix and rerun.
- Update prd.json (passes true/false) and append a short entry to progress.md.
- Only output <COMPLETE> when all items are passes=true AND verification is green.

Project conventions:
- Follow AGENTS.md strictly.
- Add any new “never again” lessons into guardrails.md.
```

For a modern walkthrough and rationale, see:
- Sam Couch’s technique write-up: https://samcouch.com/articles/ralph-wiggum-coding/

## 9) Guardrails (safety + quality)

### Permission and sandboxing
Ralph-style loops can execute commands repeatedly. Run in:
- a disposable dev container / VM
- a dedicated branch
- no prod secrets in environment

### Cost controls
- hard `MAX_ITERS`
- token budget per run (if your tooling supports it)
- cheaper model for early iterations; stronger model for final polish

### Code quality controls
- enforce formatting (prettier/ruff/gofmt)
- require tests for each story
- require lint clean as definition of done

## 10) Common failure modes and fixes

- **The agent “finishes” early**
  - Fix: completion token only allowed after verification + all tasks pass
- **Thrashing (back-and-forth changes)**
  - Fix: smaller tasks; add a guardrail and pin the approach; add a max “same error” counter
- **Context bloat**
  - Fix: store state in files; keep each iteration’s prompt small; rotate summaries
- **Spec drift**
  - Fix: lock PRD; don’t let the agent rewrite requirements unless explicitly allowed

Dex’s notes (timelines and lessons learned):
- https://www.humanlayer.dev/blog/brief-history-of-ralph

## 11) Implementations and tooling options

### Reference implementations (GitHub)
- snarktank/ralph (Amp loop): https://github.com/snarktank/ralph  
- Ralph docs: https://snarktank.github.io/ralph/  
- frankbria/ralph-claude-code (Claude Code wrapper): https://github.com/frankbria/ralph-claude-code  

### Recent explainers (good for onboarding a team)
- HumanLayer (Dex): https://www.humanlayer.dev/blog/brief-history-of-ralph  
- Sam Couch: https://samcouch.com/articles/ralph-wiggum-coding/  
- Dev.to: “2026 - The year of the Ralph Loop Agent”: https://dev.to/alexandergekov/2026-the-year-of-the-ralph-loop-agent-1gkj  
- Dev.to: “The Ralf Wiggum Breakdown” (plugin mechanics): https://dev.to/ibrahimpima/the-ralf-wiggum-breakdown-3mko  
- Medium explainer: https://jpcaparas.medium.com/ralph-wiggum-explained-the-claude-code-loop-that-keeps-going-3250dcc30809  

### Tips collections
- AIHero “11 Tips For AI Coding With Ralph Wiggum”: https://www.aihero.dev/tips-for-ai-coding-with-ralph-wiggum  

### Social threads (good for “what people actually do”)
- Ryan Carson on X (setup + visuals):  
  - https://x.com/ryancarson/status/2009631674984808783  
  - https://x.com/ryancarson/status/2009002434740601098  

## 12) A practical adoption plan (1 week)

### Day 1–2: Choose the right pilot
- pick a medium task with good tests
- write PRD with 5–10 small stories

### Day 3: Wire the loop
- set up `progress.md`, `AGENTS.md`, `guardrails.md`
- add `MAX_ITERS` and sandbox

### Day 4–5: Run + refine prompt
- run 5–10 iterations
- tighten acceptance criteria where it thrashes
- capture recurring mistakes into `guardrails.md`

### Day 6–7: Productize
- make it a team template repo
- standardize the prompt + verification commands
- measure: time saved, defects, review effort

## 13) Practical “done definition” checklist

Before trusting a Ralph output, confirm:

- [ ] All PRD items marked complete (or checkboxes checked)
- [ ] Tests pass
- [ ] Lint passes
- [ ] No secrets or config regressions
- [ ] PR review done by a human for critical changes
- [ ] Rollback path exists (git revert / release plan)

---

## Appendix: Source index (quick links)

**Primary sources**
- Sam Couch (Jan 8, 2026): https://samcouch.com/articles/ralph-wiggum-coding/  
- HumanLayer (Jan 6, 2026): https://www.humanlayer.dev/blog/brief-history-of-ralph  
- VentureBeat (Jan 2026): https://venturebeat.com/technology/how-ralph-wiggum-went-from-the-simpsons-to-the-biggest-name-in-ai-right-now  

**Reference implementation**
- GitHub (snarktank/ralph): https://github.com/snarktank/ralph  
- Docs: https://snarktank.github.io/ralph/  

**Other explainers**
- Dev.to (Gekov): https://dev.to/alexandergekov/2026-the-year-of-the-ralph-loop-agent-1gkj  
- Dev.to (Pima): https://dev.to/ibrahimpima/the-ralf-wiggum-breakdown-3mko  
- Medium (J.P. Caparas): https://jpcaparas.medium.com/ralph-wiggum-explained-the-claude-code-loop-that-keeps-going-3250dcc30809  
- AIHero tips: https://www.aihero.dev/tips-for-ai-coding-with-ralph-wiggum  
- Claude Code Ralph wrapper: https://github.com/frankbria/ralph-claude-code  

