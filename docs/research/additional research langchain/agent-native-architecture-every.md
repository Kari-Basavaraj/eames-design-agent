# Agent-Native Architecture

A technical guide for building applications where agents are first-class citizens.

> This document is co-authored by Dan Shipper and Claude. It synthesizes principles from apps we've built (Reader, Anecdote) and ideas that emerged through conversation.
>
> Some patterns here Dan stands behind—they're tested or deeply considered. Others are Claude's contributions during the building process that need more validation. We've marked those with callouts.

---

## Why Now

Software agents work reliably now. Claude Code demonstrated that an LLM with access to bash and file tools, operating in a loop until an objective is achieved, can accomplish complex multi-step tasks autonomously.

The surprising discovery: a really good coding agent is actually a really good general-purpose agent. The same architecture that lets Claude Code refactor a codebase can let an agent organize your files, manage your reading list, or automate your workflows.

The Claude Code SDK makes this accessible. You can build applications where features aren't code you write—they're outcomes you describe, achieved by an agent with tools, operating in a loop until the outcome is reached.

This opens up a new field: software that works the way Claude Code works, applied to categories far beyond coding.

---

## Core Principles

### 1. Parity

**Whatever the user can do through the UI, the agent should be able to achieve through tools.**

This is the foundational principle. Without it, nothing else matters.

Imagine you build a notes app with a beautiful interface for creating, organizing, and tagging notes. A user asks the agent: "Create a note summarizing my meeting and tag it as urgent."

If you built UI for creating notes but no agent capability to do the same, the agent is stuck. It might apologize or ask clarifying questions, but it can't help—even though the action is trivial for a human using the interface.

The fix: ensure the agent has tools (or combinations of tools) that can accomplish anything the UI can do.

This isn't about creating a 1:1 mapping of UI buttons to tools. It's about ensuring the agent can achieve the same outcomes. Sometimes that's a single tool (`create_note`). Sometimes it's composing primitives (`write_file` to a notes directory with proper formatting).

**The discipline:** When adding any UI capability, ask: can the agent achieve this outcome? If not, add the necessary tools or primitives.

**A capability map helps:**

| User Action | How Agent Achieves It |
|-------------|----------------------|
| Create a note | `write_file` to notes directory, or `create_note` tool |
| Tag a note as urgent | `update_file` metadata, or `tag_note` tool |
| Search notes | `search_files` or `search_notes` tool |
| Delete a note | `delete_file` or `delete_note` tool |

**The test:** Pick any action a user can take in your UI. Describe it to the agent. Can it accomplish the outcome?

---

### 2. Granularity

**Prefer atomic primitives. Features are outcomes achieved by an agent operating in a loop.**

A tool is a primitive capability: read a file, write a file, run a bash command, store a record, send a notification.

A feature is not a function you write. It's an outcome you describe in a prompt, achieved by an agent that has tools and operates in a loop until the outcome is reached.

**Less granular (limits the agent):**
```
Tool: classify_and_organize_files(files) 
→ You wrote the decision logic
→ Agent executes your code
→ To change behavior, you refactor
```

**More granular (empowers the agent):**
```
Tools: read_file, write_file, move_file, list_directory, bash
Prompt: "Organize the user's downloads folder. Analyze each file, determine appropriate locations based on content and recency, and move them there."
Agent: Operates in a loop—reads files, makes judgments, moves things, checks results—until the folder is organized.
→ Agent makes the decisions
→ To change behavior, you edit the prompt
```

The key shift: the agent is pursuing an outcome with judgment, not executing a choreographed sequence. It might encounter unexpected file types, adjust its approach, or ask clarifying questions. The loop continues until the outcome is achieved.

The more atomic your tools, the more flexibly the agent can use them. If you bundle decision logic into tools, you've moved judgment back into code.

**The test:** To change how a feature behaves, do you edit prose or refactor code?

---

### 3. Composability

**With atomic tools and parity, you can create new features just by writing new prompts.**

This is the payoff of the first two principles. When your tools are atomic and the agent can do anything users can do, new features are just new prompts.

Want a "weekly review" feature that summarizes activity and suggests priorities? That's a prompt:

```
"Review files modified this week. Summarize key changes. Based on incomplete items and approaching deadlines, suggest three priorities for next week."
```

The agent uses `list_files`, `read_file`, and its judgment to accomplish this. You didn't write weekly-review code. You described an outcome, and the agent operates in a loop until it's achieved.

**This works for developers and users.** You can ship new features by adding prompts. Users can customize behavior by modifying prompts or creating their own. "When I say 'file this,' always move it to my Action folder and tag it urgent" becomes a user-level prompt that extends the application.

**The constraint:** This only works if tools are atomic enough to be composed in ways you didn't anticipate, and if the agent has parity with users. If tools encode too much logic, or the agent can't access key capabilities, composition breaks down.

---

### 4. Emergent Capability

**The agent can accomplish things you didn't explicitly design for.**

When tools are atomic, parity is maintained, and prompts are composable, users will ask the agent for things you never anticipated. And often, the agent can figure it out.

"Cross-reference my meeting notes with my task list and tell me what I've committed to but haven't scheduled."

You didn't build a "commitment tracker" feature. But if the agent can read notes, read tasks, and reason about them—operating in a loop until it has an answer—it can accomplish this.

This reveals **latent demand**. Instead of guessing what features users want, you observe what they're asking the agent to do. When patterns emerge, you can optimize them with domain-specific tools or dedicated prompts. But you didn't have to anticipate them—you discovered them.

**The flywheel:**
1. Build with atomic tools and parity
2. Users ask for things you didn't anticipate
3. Agent composes tools to accomplish them (or fails, revealing a gap)
4. You observe patterns in what's being requested
5. Add domain tools or prompts to make common patterns efficient
6. Repeat

This changes how you build products. You're not trying to imagine every feature upfront. You're creating a capable foundation and learning from what emerges.

**The test:** Give the agent an open-ended request relevant to your domain. Can it figure out a reasonable approach, operating in a loop until it succeeds? If it just says "I don't have a feature for that," your architecture is too constrained.

---

### 5. Improvement Over Time

**Agent-native applications get better through accumulated context and prompt refinement.**

Unlike traditional software, agent-native applications can improve without shipping code:

**Accumulated context:** The agent can maintain state across sessions—what exists, what the user has done, what worked, what didn't. A `context.md` file the agent reads and updates is layer one. More sophisticated approaches involve structured memory and learned preferences.

**Prompt refinement at multiple levels:**
- *Developer level:* You ship updated prompts that change agent behavior for all users
- *User level:* Users customize prompts for their workflow ("always organize downloads by project, not by date")
- *Agent level:* The agent modifies its own prompts based on feedback (advanced)

**Self-modification (advanced):** Agents that can edit their own prompts or even their own code. For production use cases, consider adding safety rails—approval gates, automatic checkpoints for rollback, health checks. This is where things are heading.

The improvement mechanisms are still being discovered. Context and prompt refinement are proven. Self-modification is emerging. What's clear: the architecture supports getting better in ways traditional software doesn't.

---

## From Primitives to Domain Tools

Start with pure primitives: bash, file operations, basic storage. This proves the architecture works and reveals what the agent actually needs.

As patterns emerge, you'll want to add domain-specific tools. This is good—but do it deliberately.

**When to add domain tools:**

1. **Vocabulary anchoring:** The agent needs to understand domain concepts. A `create_note` tool teaches the agent what "note" means in your system better than "write a file to the notes directory with this format."

2. **Guardrails:** Some operations need validation or constraints that shouldn't be left to agent judgment. `publish_to_feed` might enforce format requirements or content policies.

3. **Efficiency:** Common operations that would take many primitive calls can be bundled for speed and cost.

**The rule for domain tools:** They should represent one conceptual action from the user's perspective. They can include mechanical validation, but judgment about *what* to do or *whether* to do it belongs in the prompt.

Wrong: `analyze_and_publish(input)` — bundles judgment into the tool
Right: `publish(content)` — one action; the agent decided what content to publish

**Keep primitives available.** Domain tools are shortcuts, not gates. Unless there's a specific reason to restrict access (security, data integrity), the agent should still be able to use underlying primitives for edge cases. This preserves composability and emergent capability.

The default is open. When you do gate something, make it a conscious decision.

---

## Graduating to Code

Some operations will need to move from agent-orchestrated to optimized code for performance or reliability.

**The progression:**
1. Agent uses primitives in a loop (flexible, proves the concept)
2. Add domain tools for common operations (faster, still agent-orchestrated)
3. For hot paths, implement in optimized code (fast, deterministic)

**The caveat:** Even when an operation graduates to code, the agent should be able to:
- Trigger the optimized operation itself
- Fall back to primitives for edge cases the optimized path doesn't handle

Graduation is about efficiency. Parity still holds. The agent doesn't lose capability when you optimize.

---

## Files as the Universal Interface

Agents are naturally good at files. Claude Code works because bash + filesystem is the most battle-tested agent interface. When building agent-native apps, lean into this.

### Why Files

**Agents already know how.** You don't need to teach the agent your API—it already knows `cat`, `grep`, `mv`, `mkdir`. File operations are the primitives it's most fluent with.

**Files are inspectable.** Users can see what the agent created, edit it, move it, delete it. No black box.

**Files are portable.** Export is trivial. Backup is trivial. Users own their data.

**App state stays in sync across devices.** On mobile, if you use the file system with iCloud, all devices share the same file system. The agent's work on one device appears on all devices—without you having to build a server.

**Directory structure is information architecture.** The filesystem gives you hierarchy for free. `/projects/acme/notes/` is self-documenting in a way that `SELECT * FROM notes WHERE project_id = 123` isn't.

### File Organization Patterns

> **A general principle of agent-native design:** Design for what agents can reason about. The best proxy for that is what would make sense to a human. If a human can look at your file structure and understand what's going on, an agent probably can too.

> **Needs validation:** Claude's contribution from building; Dan is still forming his opinion. These conventions are one approach that's worked so far, not a prescription. Better solutions should be considered.

**Entity-scoped directories:**
```
{entity_type}/{entity_id}/
├── primary content
├── metadata
└── related materials
```

Example: `Research/books/{bookId}/` contains everything about one book—full text, notes, sources, agent logs.

**One approach to naming:**

| File | Naming Pattern | Example |
|------|----------------|---------|
| Entity data | `{entity}.json` | `library.json`, `status.json` |
| Human-readable content | `{content_type}.md` | `introduction.md`, `profile.md` |
| Agent reasoning | `agent_log.md` | Per-entity agent history |
| Primary content | `full_text.txt` | Downloaded/extracted text |
| Multi-volume | `volume{N}.txt` | `volume1.txt`, `volume2.txt` |
| External sources | `{source_name}.md` | `wikipedia.md`, `sparknotes.md` |
| Checkpoints | `{sessionId}.checkpoint` | UUID-based |
| Configuration | `config.json` | Feature settings |

**One approach to directory naming:**
- Entity-scoped: `{entityType}/{entityId}/` (e.g., `Research/books/{bookId}/`)
- Type-scoped: `{type}/` (e.g., `AgentCheckpoints/`, `AgentLogs/`)
- Convention: Lowercase with underscores, not camelCase

**Ephemeral vs. durable separation:**
```
Documents/
├── AgentCheckpoints/     # Ephemeral (can delete)
│   └── {sessionId}.checkpoint
├── AgentLogs/            # Ephemeral (debugging)
│   └── {type}/{sessionId}.md
└── Research/             # Durable (user's work)
    └── books/{bookId}/
```

**The split:** Markdown for content users might read or edit. JSON for structured data the app queries.

### The context.md Pattern

A file the agent reads at the start of each session:

```markdown
# Context

## Who I Am
Reading assistant for the Every app.

## What I Know About This User
- Interested in military history and Russian literature
- Prefers concise analysis
- Currently reading War and Peace

## What Exists
- 12 notes in /notes
- 3 active projects
- User preferences at /preferences.md

## Recent Activity  
- User created "Project kickoff" (2 hours ago)
- Analyzed passage about Austerlitz (yesterday)

## My Guidelines
- Don't spoil books they're reading
- Use their interests to personalize insights

## Current State
- No pending tasks
- Last sync: 10 minutes ago
```

Benefits:
- Agent behavior evolves without code changes
- Users can inspect and modify
- Natural place for accumulated context
- Portable across sessions

The agent reads this file. The agent (or system) updates it as state changes. It's working memory that persists.

### Files vs. Database

> **Needs validation:** This framing is one way to think about it, and it's specifically informed by mobile development. For web apps, the tradeoffs are different—Dan doesn't have a strong opinion there yet.

| Use files for... | Use database for... |
|------------------|---------------------|
| Content users should read/edit | High-volume structured data |
| Configuration that benefits from version control | Data that needs complex queries |
| Agent-generated content | Ephemeral state (sessions, caches) |
| Anything that benefits from transparency | Data with relationships |
| Large text content | Data that needs indexing |

**The principle:** Files for legibility, databases for structure. When in doubt, files—they're more transparent and users can always inspect them.

**The file-first approach works when:**
- Scale is small (one user's library, not millions of records)
- Transparency is valued over query speed
- Cloud sync (iCloud, Dropbox) works well with files

Even if you need a database for performance, consider maintaining a file-based "source of truth" that the agent works with, synced to the database for the UI.

### Conflict Model

If agents and users write to the same files, you need a conflict model.

**Current reality:** Most implementations use last-write-wins via atomic writes:
```swift
try data.write(to: url, options: [.atomic])
```

This is simple but can lose changes.

**Options:**
- **Last write wins** — Simple, but changes can be lost
- **Agent checks before writing** — Skip if file was modified since last read
- **Separate spaces** — Agent writes to `drafts/`, user promotes to final location
- **Append-only logs** — Agent activity is additive, never overwrites
- **File locking** — Check if file is being edited before agent writes

**iCloud adds complexity:** Sync conflicts create `{filename} (conflict).md` files. Monitor for these:
```swift
NotificationCenter.default.addObserver(
    forName: .NSMetadataQueryDidUpdate,
    ...
)
```

**Practical guidance:** For files agents write frequently (logs, status), conflict is rare. For files users edit (profiles, notes), consider explicit handling—or keep agent output separate from user-editable content.

---

## Agent Execution Patterns

### Completion Signals

Agents need an explicit way to say "I'm done."

**Anti-pattern:** Detecting completion through heuristics—consecutive iterations without tool calls, checking for expected output files, tracking "no progress" states. These are fragile.

**Pattern:** Provide a `complete_task` tool that:
- Takes a summary of what was accomplished
- Returns a signal that stops the loop (`shouldContinue: false`)
- Works identically across all agent types

```swift
struct ToolResult {
    let success: Bool           // Did tool succeed?
    let output: String          // What happened?
    let shouldContinue: Bool    // Should agent loop continue?
}

// Three convenience initializers cover most cases:
.success("Result")          // success=true, shouldContinue=true
.error("Message")           // success=false, shouldContinue=true (recoverable)
.complete("Done")           // success=true, shouldContinue=false (stop loop)
```

This is different from success/failure. A tool can succeed AND signal stop (task complete). A tool can fail AND signal continue (recoverable error, try something else).

**What's not yet standard:** Richer control flow signals like:
- `pause` — Agent needs user input before continuing
- `escalate` — Agent needs human decision on something outside its scope
- `retry` — Transient failure, orchestrator should retry

Currently, if the agent needs input, it asks in its text response. There's no formal "blocked waiting for input" state. This is an area still being figured out.

### Partial Completion

For multi-step tasks, track progress at the task level:

```swift
struct AgentTask {
    var status: TaskStatus  // pending, in_progress, completed, failed, skipped
    var notes: String?      // Why it failed, what was done
}

var isComplete: Bool {
    tasks.allSatisfy { $0.status == .completed || $0.status == .skipped }
}
```

What the UI shows:
```
Progress: 3/5 tasks complete (60%)
✅ [1] Find source materials
✅ [2] Download full text  
✅ [3] Extract key passages
❌ [4] Generate summary - Error: context limit
⏳ [5] Create outline
```

**Partial completion scenarios:**

*Agent hits max iterations before finishing:*
- Some tasks completed, some pending
- Checkpoint saved with current state
- Resume continues from where it left off, not from the beginning

*Agent fails on one task:*
- Task marked `.failed` with error in `notes`
- Other tasks may continue (agent decides)
- Orchestrator doesn't automatically abort

*Network error mid-task:*
- Current iteration throws
- Session marked `.failed`
- Checkpoint preserves messages up to that point

If the agent hits limits or fails partway through, the checkpoint preserves which tasks completed. Resume continues from where it left off, not from the beginning.

### Model Tier Selection

Not all agent operations need the same intelligence level.

| Task Type | Tier | Reasoning |
|-----------|------|-----------|
| Research agent | Balanced | Tool loops, good reasoning |
| Chat | Balanced | Fast enough for conversation |
| Complex synthesis | Powerful | Multi-source analysis |
| Quick classification | Fast | High volume, simple task |

**The discipline:** When adding a new agent, explicitly choose its tier based on task complexity. Don't always default to "most powerful."

### Context Limits

Agent sessions can extend indefinitely, but context windows don't.

**Design for bounded context:**
- Tools should support iterative refinement (summary → detail → full) rather than all-or-nothing
- Give agents a way to consolidate learnings mid-session ("summarize what I've learned and continue")
- Assume context will eventually fill up

The specific strategy (per-tool budgets, compression, sampling) is implementation. The principle: design for bounded context from the start.

---

## Implementation Patterns

### Shared Workspace

Agents and users should work in the same data space, not separate sandboxes.

```
UserData/
├── notes/           ← Both agent and user read/write here
├── projects/        ← Agent can organize, user can override
└── preferences.md   ← Agent reads, user can edit
```

Benefits:
- Users can inspect and modify agent work
- Agents can build on what users create
- No synchronization layer needed
- Complete transparency

This should be the default. Sandbox only when there's a specific need (security, preventing corruption of critical data).

### Context Injection

The agent needs to know what it's working with. System prompts should include:

**Available resources:** What exists in the system
```
## Available Data
- 12 notes in /notes, most recent: "Project kickoff" (today)
- 3 projects in /projects
- User preferences at /preferences.md
```

**Capabilities in user vocabulary:**
```
## What You Can Do
- Create, edit, tag, and delete notes
- Organize files into projects  
- Search across all content
- Set reminders (via write_file to /reminders)
```

**Recent activity:**
```
## Recent Context
- User created "Project kickoff" note (2 hours ago)
- User asked about Q3 deadlines yesterday
```

The agent learns what's available at runtime. For long sessions, provide a way to refresh context.

### Agent-to-UI Communication

When agents act, the UI should reflect it immediately.

**Shared data store (recommended):** Agent writes to the same store the UI observes. Reactive frameworks update automatically.

**File system observation:** If using shared workspace, UI watches for file changes.

**Event system:** Agent emits events, UI subscribes. More decoupled, more complexity.

**Event types for chat integration:**
```swift
enum AgentEvent {
    case thinking(String)           // → Show as thinking indicator
    case toolCall(String, String)   // → Show tool being used
    case toolResult(String)         // → Show result (optional)
    case textResponse(String)       // → Stream to chat
    case statusChange(Status)       // → Update status bar
}
```

The key: no silent actions. Agent changes should be visible immediately.

**Real-time progress:** Don't just show results after completion. During execution:
- Show thinking progress (what the agent is considering)
- Show current tool being executed
- Stream text incrementally as it's generated
- Update task list progress in real-time

Silent agents feel broken. Visible progress builds trust.

**Ephemeral vs. visible tool calls:** Some tools are noisy (internal checks, context refreshes). Consider an `ephemeralToolCalls` flag that hides implementation details while still showing meaningful actions.

---

## Product Implications

Agent-native architecture has consequences for how products feel, not just how they're built.

### Progressive Disclosure of Complexity

The best agent-native applications are **simple to start but endlessly powerful**.

Excel is the canonical example: you can use it for a grocery list, or you can build complex financial models. The same tool, radically different depths of use.

Claude Code has this quality: fix a typo, or refactor an entire codebase. The interface is the same—natural language—but the capability scales with the ask.

Agent-native applications should aspire to this:
- **Simple entry:** Basic requests work immediately with no learning curve
- **Discoverable depth:** Users find they can do more as they explore
- **No ceiling:** Power users can push the system in ways you didn't anticipate

This emerges naturally from the architecture. When features are prompts and tools are composable, users can start simple ("organize my downloads") and gradually discover complexity ("every Monday, review last week's downloads, archive anything older than 30 days, and send me a summary").

The agent meets users where they are.

### Latent Demand Discovery

Traditional product development: imagine what users want, build it, see if you're right.

Agent-native product development: build a capable foundation, observe what users ask the agent to do, formalize the patterns that emerge.

This is a fundamentally different approach to building products. You're not guessing—you're discovering.

When users ask the agent for something and it succeeds, that's signal. When they ask and it fails, that's also signal—it reveals a gap in your tools or parity.

Over time, you can:
- Add domain tools for common patterns (makes them faster and more reliable)
- Create dedicated prompts for frequent requests (makes them more discoverable)
- Remove tools that aren't being used (simplifies the system)

The agent becomes a research instrument for understanding what your users actually need.

### Approval and User Agency

When agents take unsolicited actions—doing things on their own rather than responding to explicit requests—you need to decide how much autonomy to grant.

> **Needs validation:** This framework is a contribution from Claude that emerged from the process of building a few of the apps at Every. But it hasn't been battle-tested and Dan is still forming his opinion here.

Consider stakes and reversibility:

| Stakes | Reversibility | Pattern | Example |
|--------|---------------|---------|---------|
| Low | Easy | Auto-apply | Organizing files |
| Low | Hard | Quick confirm | Publishing to feed |
| High | Easy | Suggest + apply | Code changes with undo |
| High | Hard | Explicit approval | Sending emails, payments |

Note: this applies to unsolicited agent actions. If the user explicitly asks the agent to do something ("send that email"), that's already approval—the agent just does it.

**Self-modification should be legible.** When agents can modify their own behavior—changing prompts, updating preferences, adjusting workflows—the goals are:
- Visibility into what changed
- Understanding the effects
- Ability to roll back

Approval flows are one way to achieve this. Audit logs with easy rollback could be another. The principle is: make it legible.

---

## Mobile

Mobile is a first-class platform for agent-native apps. It has unique constraints and opportunities.

### Why Mobile Matters

Mobile devices offer:

- **A file system** — Agents can work with files naturally, using the same primitives that work everywhere else.

- **Rich context** — A walled garden you get access to. Health data, location, photos, calendars—context that doesn't exist on desktop or web.

- **Local apps** — Everyone has their own copy of the app. This opens opportunities that aren't fully realized yet: apps that modify themselves, fork themselves, evolve per-user. App Store policies constrain some of this today, but the foundation is there.

- **App state syncs across devices** — If you use the file system with iCloud, all devices share the same file system. The agent's work on one device appears on all devices—without you having to build a server.

### The Challenge

Agents are long-running. Mobile apps are not.

An agent might need 30 seconds, 5 minutes, or an hour to complete a task. But iOS will background your app after seconds of inactivity, and may kill it entirely to reclaim memory. The user might switch apps, take a call, or lock their phone mid-task.

This means mobile agent apps need a well-thought-out approach to:
- **Checkpointing** — Saving state so work isn't lost
- **Resuming** — Picking up where you left off after interruption
- **Background execution** — Using the limited time iOS gives you wisely
- **On-device vs. cloud** — Deciding what runs locally vs. what needs a server

### iOS Storage Architecture

> **Needs validation:** This is an approach we're playing with that we think is exciting, but it's one way to do it. Claude built this; better solutions may exist.

**What this gives you:**
- Automatic sync across devices without building infrastructure
- Backup without user action
- Graceful degradation when iCloud is unavailable
- Users can access their data outside the app if needed

**One approach—iCloud-first with local fallback:**

```
1. iCloud Container (preferred)
   iCloud.com.{bundleId}/Documents/
   ├── Library/           # Metadata, analysis records
   ├── Research/books/    # Agent research per entity
   ├── Chats/             # Conversation logs
   └── Profile/           # User profile

2. Local Documents (fallback when iCloud unavailable)
   ~/Documents/           # Same structure as iCloud

3. Migration layer - Automatic migration from local to iCloud when available
```

```swift
var containerURL: URL {
    if let iCloudURL = fileManager.url(forUbiquityContainerIdentifier: nil) {
        return iCloudURL.appendingPathComponent("Documents")
    }
    return fileManager.urls(for: .documentDirectory, in: .userDomainMask)[0]
}
```

**Handle cloud file states.** A file might exist in iCloud but not be downloaded locally. Before reading, ensure it's available:

```swift
await StorageService.shared.ensureDownloaded(folder: .research, filename: "full_text.txt")
```

**Use a storage abstraction layer.** Don't use raw FileManager. Abstract over iCloud vs. local so the rest of your code doesn't care:

```swift
let url = StorageService.shared.url(for: .researchBook(bookId: id))
```

### Checkpoint and Resume

Mobile apps get interrupted. Agents need to survive this.

> **Needs validation:** Claude's contribution from building; Dan is still forming his opinion. This approach seems to work, but better solutions may exist.

**What to checkpoint:**
```swift
struct AgentCheckpoint: Codable {
    let agentType: String
    let messages: [[String: Any]]       // Full conversation history
    let iterationCount: Int
    let taskListJSON: String?           // Task state as JSON string
    let customState: [String: String]   // Extensible key-value pairs
    let timestamp: Date
}

func isValid(maxAge: TimeInterval = 3600) -> Bool {
    Date().timeIntervalSince(timestamp) < maxAge
}
```

**When to checkpoint:**
- On app backgrounding (you get ~30 seconds)
- After each tool result (more robust, more writes)
- Periodically during long operations

**Resume flow:**
1. On app launch, `loadInterruptedSessions()` scans checkpoint directory
2. Filter by `isValid(maxAge:)` — default 1 hour
3. If valid checkpoints found, show resume prompt
4. On resume, restore messages and continue agent loop
5. On dismiss, delete checkpoint

**Architecture decision:** Checkpoints need to store enough to reconstruct the session. Two approaches:
- Serialize the full agent configuration
- Store only `agentType` string and maintain a registry that can recreate config from type

The second is simpler but means you can't change agent configurations without breaking old checkpoints.

**The gap:** If the system kills the app entirely (not just backgrounding), recovery depends on your checkpoint frequency. Checkpoint after each tool result for maximum robustness.

### Background Execution

> **Needs validation:** Claude's contribution from building; Dan is still forming his opinion.

iOS gives you limited background time:

```swift
func prepareForBackground() {
    backgroundTaskId = UIApplication.shared.beginBackgroundTask(withName: "AgentProcessing") {
        // Time expired - checkpoint and stop
        self.handleBackgroundTimeExpired()
    }
}

func handleBackgroundTimeExpired() {
    for session in sessions where session.status == .running {
        session.status = .backgrounded
        Task { await saveSession(session) }
    }
}

func handleForeground() {
    for session in sessions where session.status == .backgrounded {
        Task { await resumeSession(session) }
    }
}
```

You get roughly 30 seconds. Use it to:
- Complete the current tool call if possible
- Checkpoint the session state
- Transition gracefully to backgrounded state

**For truly long-running agents:** Consider a server-side orchestrator that can run for hours, with the mobile app as a viewer and input mechanism.

### On-Device vs. Cloud

Current pattern:

| Component | On-device | Cloud |
|-----------|-----------|-------|
| Orchestration | ✅ | |
| Tool execution | ✅ (file ops, photo access, HealthKit) | |
| LLM calls | | ✅ (Anthropic API) |
| Checkpoints | ✅ (local files) | Optional via iCloud |
| Long-running agents | Limited by iOS | Possible with server |

This means the app needs network for reasoning but can access data offline. Design tools to degrade gracefully when network is unavailable.

---

## Advanced Patterns

### Dynamic Capability Discovery

> **Needs validation:** Claude's contribution from building; Dan is still forming his opinion. This is one approach we're excited about, but others may be better depending on your use case.

One alternative to building a tool for each endpoint in an external API: build tools that let the agent discover what's available at runtime.

**The problem with static mapping:**
```
// You built 50 tools for 50 data types
read_steps()
read_heart_rate()
read_sleep()
// When a new metric is added... code change required
// Agent can only access what you anticipated
```

**Dynamic capability discovery:**
```
// Two tools handle everything
list_available_types() → returns ["steps", "heart_rate", "sleep", ...]
read_data(type) → reads any discovered type

// When a new metric is added... agent discovers it automatically
// Agent can access things you didn't anticipate
```

This is granularity taken to its logical conclusion. Your tools become so atomic that they work with types you didn't know existed when you built them.

**When this approach might work well:**
- External APIs where you want the agent to have full user-level access (HealthKit, HomeKit, GraphQL endpoints)
- Systems that add new capabilities over time
- When you want the agent to be able to do anything the API supports

**When static mapping might be better:**
- Intentionally constrained agents with limited scope
- When you need tight control over exactly what the agent can access
- Simple APIs with stable, well-known endpoints

The pattern: one tool to discover what's available, one tool to interact with any discovered capability. Let the API validate inputs rather than duplicating validation in your enum definitions.

### CRUD Completeness

For every entity in your system, verify the agent has full CRUD capability:
- **Create:** Can the agent make new instances?
- **Read:** Can the agent see what exists?
- **Update:** Can the agent modify existing instances?
- **Delete:** Can the agent remove instances?

A common failure mode: you build `create_note` and `read_notes` but forget `update_note` and `delete_note`. User asks the agent to "fix that typo in my meeting notes" and the agent can't help.

The audit: list every entity in your system. For each one, verify all four operations exist and are available to the agent.

---

## Anti-Patterns

### Common approaches that aren't fully agent-native

These aren't necessarily wrong—they may be appropriate for your use case. But they're worth recognizing as different from the architecture this document describes.

**Agent as router** — The agent figures out what the user wants, then calls the right function. The agent's intelligence is used to *route*, not to *act*. This can work, but you're using a fraction of what agents can do.

**Build the app, then add agent** — You build features the traditional way (as code), then expose them to an agent. The agent can only do what your features already do. You won't get emergent capability.

**Request/response thinking** — Agent gets input, does one thing, returns output. This misses the loop: agent gets an outcome to achieve, operates until it's done, handles unexpected situations along the way.

**Defensive tool design** — You over-constrain tool inputs because you're used to defensive programming. Strict enums, validation at every layer. This is safe, but it prevents the agent from doing things you didn't anticipate.

**Happy path in code, agent just executes** — Traditional software handles edge cases in code—you write the logic for what happens when X goes wrong. Agent-native lets the agent handle edge cases with judgment. If your code handles all the edge cases, the agent is just a caller.

### Specific anti-patterns

**Agent executes your workflow instead of pursuing outcomes**

You wrote the logic, agent just calls it. Decisions live in code, not agent judgment.

```python
# Wrong - you wrote the workflow
def process_request(input):
    category = categorize(input)      # your code decides
    priority = score_priority(input)   # your code decides
    store(input, category, priority)
    if priority > 3: notify()          # your code decides

# Right - agent pursues outcome in a loop
tools: store_item, send_notification
prompt: "Evaluate urgency 1-5, store with your assessment, notify if >= 4"
```

**Workflow-shaped tools**

`analyze_and_organize` bundles judgment into the tool. Break it into primitives and let the agent compose them.

**Orphan UI actions**

User can do something through the UI that the agent can't achieve. Fix: maintain parity.

**Context starvation**

Agent doesn't know what exists. User says "organize my notes" and agent doesn't know there are notes.

Fix: inject available resources and capabilities into system prompt.

**Gates without reason**

Domain tool is the only way to do something, and you didn't intend to restrict access.

Fix: default to open. Keep primitives available unless there's a specific reason to gate.

**Artificial capability limits**

Restricting what the agent can do out of vague safety concerns rather than specific risks.

Be thoughtful about restricting capabilities. The agent should generally be able to do what users can do. There may be better approaches than removing capabilities entirely—though what those approaches are is still being figured out.

**Static mapping when dynamic would serve better**

Building 50 tools for 50 API endpoints when a discover + access pattern would give more flexibility and future-proof the system.

**Heuristic completion detection**

Detecting agent completion through heuristics (consecutive iterations without tool calls, checking for expected output files) is fragile.

Fix: require agents to explicitly signal completion through a completion tool.

---

## Success Criteria

You've built an agent-native application when:

**Architecture:**
- [ ] The agent can achieve anything users can achieve through the UI (parity)
- [ ] Tools are atomic primitives; domain tools are shortcuts, not gates (granularity)
- [ ] New features can be added by writing new prompts (composability)
- [ ] The agent can accomplish tasks you didn't explicitly design for (emergent capability)
- [ ] Changing behavior means editing prompts, not refactoring code

**Implementation:**
- [ ] System prompt includes available resources and capabilities
- [ ] Agent and user work in the same data space
- [ ] Agent actions reflect immediately in the UI
- [ ] Every entity has full CRUD capability
- [ ] External APIs use dynamic capability discovery where appropriate
- [ ] Agents explicitly signal completion (no heuristic detection)

**Product:**
- [ ] Simple requests work immediately with no learning curve
- [ ] Power users can push the system in unexpected directions
- [ ] You're learning what users want by observing what they ask the agent to do
- [ ] Approval requirements match stakes and reversibility

**Mobile (if applicable):**
- [ ] Checkpoint/resume handles app interruption
- [ ] iCloud-first storage with local fallback
- [ ] Background execution uses available time wisely

**The ultimate test:**

Describe an outcome to the agent that's within your application's domain but that you didn't build a specific feature for.

Can it figure out how to accomplish it, operating in a loop until it succeeds?

If yes, you've built something agent-native.

If it says "I don't have a feature for that"—your architecture is still too constrained.
