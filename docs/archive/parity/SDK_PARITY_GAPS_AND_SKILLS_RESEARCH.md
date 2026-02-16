# SDK Parity Gaps & Universal Skills Research
# Updated: 2026-02-16

## 1. Is 100% Claude Code SDK Parity Achieved?

**No.** Significant gaps remain.

### Implemented ✅
- Tools: Full preset (Read, Write, Edit, Glob, Grep, Bash, WebSearch, WebFetch, AskUserQuestion)
- canUseTool: AskUserQuestion, tool permission (Bash/Edit/Write)
- permissionMode: default | acceptEdits | plan | bypassPermissions | dontAsk
- Sessions: resume, continue
- MCP: Load from ~/.claude, .claude, plugin cache
- Env: CLAUDE_AGENT_SDK_CLIENT_APP
- persistSession, additionalDirectories, thinking, effort, maxTurns

### Not Yet Implemented ❌

| Gap | SDK Option | Impact | Effort |
|-----|------------|--------|--------|
| **Plugins** | `plugins: [{ type: 'local', path }]` | Plugins provide commands, agents, skills, hooks | Medium |
| **Skills** | Via plugins OR settingSources | Skills are SKILL.md files agents load on demand | High |
| **Hooks** | `hooks: { PreToolUse, PostToolUse, ... }` | Extensibility, validation, notifications | Medium |
| **Subagents** | `agents: { name: AgentDefinition }` | Task tool, custom subagents | Medium |
| **Sandbox** | `sandbox: { enabled, ... }` | Command isolation | Low |
| **settingSources** | `settingSources: ['user','project','local']` | Where Claude Code reads settings | Low |
| **File checkpointing** | `enableFileCheckpointing` | Rewind file changes | Low |

### Critical Gap: Skills & Plugins

**Skills** = SKILL.md files with YAML frontmatter (name, description) + Markdown instructions.  
Agents load them on demand for specialized tasks (PDF, frontend-design, etc.).

**Plugins** = Directories containing skills/, commands/, agents/, .mcp.json.  
Claude Code discovers them from ~/.claude/plugins/cache/.

**Eames today:** Does NOT pass `plugins` to the SDK. Does NOT load Claude Code skills.  
The SDK subprocess runs Claude Code CLI — if we pass `plugins`, it would use them. But we don't wire Claude Code's installed plugins path.

---

## 2. Universal Skills: Install Once, Every Agent Uses Them

### Open Standard: Agent Skills (agentskills.io)

- **Format:** `SKILL.md` with YAML frontmatter (name, description)
- **Spec:** [agentskills.io/specification](https://agentskills.io/specification)
- **Adopters:** Claude Code, Cursor, Codex, OpenCode, Windsurf, Aider, VS Code Copilot

### Tools for Universal Install

| Tool | Purpose | Install to |
|------|---------|------------|
| **OpenSkills** (8k+ stars) | `npx openskills install anthropics/skills` | `.claude/skills/` or `.agent/skills/` (universal) |
| **agent-skills-cli** (Karanjot786) | Sync to 42+ platforms | Auto-detects Cursor, Claude Code, etc. |
| **claude-plugins.dev** | Registry + discovery | Same format, install via OpenSkills/skills install |

### Priority Order (OpenSkills)

```
.agent/skills/     (universal - multi-agent)
~/.agent/skills/
.claude/skills/    (Claude Code)
~/.claude/skills/
```

**Universal mode:** `.agent/skills/` — one folder, every agent (Claude Code, Cursor, Eames, etc.) can read.

### How Agents Use Skills

1. **Claude Code:** Has built-in Skill() tool, loads from plugins/skills
2. **OpenSkills approach:** Injects `<available-skills>` XML into AGENTS.md; agents run `npx openskills read <name>` to load content
3. **Eames (today):** Neither — no skill loading

---

## 3. What Eames Should Do

### A. Pick Up Claude Code Plugins & Skills (SDK Path)

**When Eames uses SDK mode**, the subprocess IS Claude Code CLI. Claude Code reads:
- `~/.claude/plugins/cache/` — installed plugins (from Claude Code marketplace)
- `~/.claude/settings.json` — mcpServers, etc.

**Fix:** Pass `plugins` to query() with paths to Claude Code's plugin cache:

```typescript
plugins: [
  { type: 'local', path: join(homedir(), '.claude', 'plugins', 'cache', 'plugin-name') },
  // Or scan and add all installed
]
```

**Caveat:** The SDK runs Claude Code with `CLAUDE_CODE_ENTRYPOINT=sdk-ts`. The CLI may already load plugins from its usual locations. We need to verify: does the SDK inherit Claude Code's plugin discovery, or do we MUST pass `plugins`?

**Action:** Pass `plugins` by scanning `~/.claude/plugins/cache/*` and `~/.claude/plugins/installed_plugins.json` to get installed plugin paths.

### B. Support Universal Skills (.agent/skills)

**OpenSkills** installs to `.agent/skills/` for universal use. Eames (and any agent) can:

1. **Read AGENTS.md** — if it contains `<available-skills>` block (from `npx openskills sync`)
2. **On task match** — run `npx openskills read <skill-name>` and inject content into context
3. **Or:** Pre-scan `.agent/skills/` and `.claude/skills/`, add to system prompt or tool

**Eames-specific:** 
- Add a "Load skill" step: when user asks for something, check if a skill exists (by name/description match), load it, and use it
- Integrate OpenSkills: `npx openskills read <name>` as a tool or pre-step
- Support AGENTS.md with `<available-skills>` and Skill() invocation pattern

### C. LangChain Mode: Skill Loading

LangChain mode doesn't use Claude Code CLI. We need our own skill loader:
- Scan `.agent/skills/`, `.claude/skills/`, `~/.claude/skills/`
- Parse SKILL.md frontmatter for name + description
- On relevant task, inject skill content into the prompt (or as a tool that returns skill body)

---

## 4. Recommended Implementation Order

### Phase 6: Plugins & Skills (High Value)

1. **SDK: Auto-load Claude Code plugins**
   - Scan `~/.claude/plugins/installed_plugins.json` and `~/.claude/plugins/cache/`
   - Build `plugins: [{ type: 'local', path }]` array
   - Pass to query()

2. **Universal skills path**
   - Add `skillsPaths` config: `['.agent/skills', '.claude/skills', '~/.claude/skills']`
   - At session start, scan for SKILL.md, extract name + description
   - Inject skill index into system prompt (or Eames Brain) so the agent knows what skills exist

3. **Skill loading tool (both modes)**
   - Tool: `load_skill(name: string)` → reads SKILL.md, returns content
   - Agent invokes when task matches skill description

### Phase 7: Hooks, Subagents, Sandbox (Lower Priority)

- Hooks: PreToolUse, PostToolUse for custom validation
- Subagents: Task tool with custom AgentDefinitions
- Sandbox: For safer Bash execution

---

## 5. References

| Resource | URL |
|----------|-----|
| Agent Skills Spec | https://agentskills.io/specification |
| OpenSkills | https://github.com/numman-ali/openskills |
| agent-skills-cli | https://github.com/Karanjot786/agent-skills-cli |
| Claude Plugins Discovery | https://claude-plugins.dev/skills |
| SDK Plugins Docs | https://platform.claude.com/docs/en/agent-sdk/plugins |
