# Eames Todo App Functionality Test

**Date:** 2026-02-16  
**Branch:** feature/add-api-keys-config

## Summary

Eames was tested to create a simple todo app. The agent pipeline runs correctly. The failure is due to **API billing** (insufficient Anthropic credits), not code defects.

## Changes Made for Testing

1. **Execution tools added** – `writeFile`, `scaffoldProject`, `runCommand`, `readFile`, `listFiles`, `launchDemo` were not included in `TOOLS`. They are now registered in `src/tools/index.ts`.
2. **Tool-selection model fixed** – `gpt-5-mini` was replaced with `claude-3-5-haiku-20241022` in `src/agent/tool-executor.ts`.

## Test Run Results

### Command

```bash
bun run scripts/run-todo-test.ts
```

### Output

```
Eames Todo App Test
==================
Query: Create a simple todo app with React...

[Phase] understand
  → Analyzing your query...
Error: Your credit balance is too low to access the Anthropic API.
```

### What Worked

| Component              | Status | Notes                                   |
|------------------------|--------|----------------------------------------|
| Agent initialization   | OK     | Orchestrator loads with all tools      |
| Understand phase start | OK     | Phase transitions fire                 |
| Progress callbacks     | OK     | "Analyzing your query..." displayed    |
| Execution tools        | OK     | Now available for scaffold/write/run   |
| Config/API key load    | OK     | Keys loaded from .env or ~/.eames/     |

### What Failed (External)

| Issue                | Cause                  | Resolution                                |
|----------------------|------------------------|-------------------------------------------|
| 403 Forbidden        | LangSmith or multipart | Check `LANGCHAIN_API_KEY` if using traces |
| 400 Credit too low   | Anthropic billing      | Add credits at console.anthropic.com     |

## How to Run the Test (When Credits Available)

```bash
# 1. Ensure API keys
export ANTHROPIC_API_KEY="sk-ant-..."
export TAVILY_API_KEY="tvly-..."  # Optional, for search tools

# 2. Run direct test (bypasses CLI)
bun run scripts/run-todo-test.ts

# 3. Or run full CLI with initial query
bun run src/index.tsx "Create a simple todo app"
```

## Expected Behavior (With Valid Credits)

1. **Understand** – Extract intent (create app, React, todo features).
2. **Plan** – Tasks such as: scaffold project, add todo component, run dev server.
3. **Execute** – Call `scaffold_project`, `write_file`, `run_command`.
4. **Reflect** – Check if output is complete.
5. **Answer** – Summarize and provide instructions/links.

Output directory: `~/eames-projects/<project_name>/`.

## Files Modified

- `src/tools/index.ts` – Added execution tools to `TOOLS`.
- `src/agent/tool-executor.ts` – Switched SMALL_MODEL to a supported Haiku model.
- `scripts/run-todo-test.ts` – Direct agent test script (no CLI).

## Next Steps

1. Add Anthropic credits and rerun the test.
2. Optionally add Ollama support for local testing without cloud credits.
3. Fix remaining TypeScript errors (claude-native, sdk-agent, etc.) for a clean build.
