# Eames 1.0 Sunset Document 🌅

**Date:** January 17, 2026  
**Version:** 1.0.0  
**Status:** End of Life  
**Next Version:** Eames 2.0 (Fresh Start)

---

## Executive Summary

After extensive development and integration attempts, we've made the strategic decision to sunset **Eames 1.0** and rebuild from the ground up as **Eames 2.0**. This document chronicles our journey, learnings, challenges, and the path forward.

**TL;DR:** We tried to merge two different architectures (Dexter's 5-phase orchestrator + Claude Agent SDK) and learned that sometimes a clean slate is better than retrofitting.

---

## Table of Contents

1. [The Vision](#the-vision)
2. [The Journey](#the-journey)
3. [What We Built](#what-we-built)
4. [What We Learned](#what-we-learned)
5. [Why We're Sunsetting](#why-were-sunsetting)
6. [The Right Approach](#the-right-approach)
7. [Eames 2.0 Vision](#eames-20-vision)
8. [Acknowledgments](#acknowledgments)

---

## The Vision

### Original Goal
Create an **Autonomous Product Design Agent** that handles the complete product design lifecycle from Discovery to Delivery, outputting production-ready code.

### Core Promise
- **Discovery to Delivery**: Complete product design lifecycle coverage
- **100% Claude Code SDK**: All Claude Code capabilities (file ops, MCP, sessions, etc.)
- **Eames Design Features**: Custom tools for market research, PRD generation, competitor analysis
- **5-Phase Intelligence**: Autonomous orchestration (Understand → Plan → Execute → Reflect → Answer)
- **Claude Code UI**: Beautiful TUI matching Claude Code's look and feel

### Named After
Charles & Ray Eames, pioneers who believed "Design is a plan for arranging elements in such a way as best to accomplish a particular purpose."

---

## The Journey

### Phase 0: Foundation (Completed)
**Based On:** [Dexter](https://github.com/virattt/dexter) by Virat Singh

**What We Did:**
1. Forked Dexter's architecture as starting point
2. Rebranded from Dexter → Eames
3. Adapted for Product Design domain
4. Created design-specific tools:
   - Market research tools
   - Competitor analysis
   - PRD generation
   - User persona creation
   - Financial analysis APIs
   - Design pattern research

**What Worked:**
- ✅ Dexter's 5-phase orchestration was brilliant
- ✅ Clean separation of concerns
- ✅ Excellent test coverage (61/61 tests passing)
- ✅ Beautiful Ink TUI implementation
- ✅ Custom LangChain tools for design research

**What We Inherited:**
- LangChain-based tool system
- Custom orchestrator (Agent class)
- Manual tool execution
- No built-in file operations
- No session persistence
- Limited context window

### Phase 1: SDK Integration Attempt (Dec 2025 - Jan 2026)

**Goal:** Add Claude Agent SDK to get Claude Code features

**Approach:**
```typescript
// We tried to run BOTH systems simultaneously
if (useSdkMode) {
  // Use Claude Agent SDK (new)
  await sdkAgent.run(query);
} else {
  // Use original 5-phase orchestrator (old)
  await agent.run(query);
}
```

**What We Added:**
- Claude Agent SDK v0.2.11 integration
- SDK message processor
- SDK execution hook (`useSdkAgentExecution`)
- Mode toggle (`/sdk` command)
- Session resume support
- File checkpointing
- Extended context (1M tokens)

**What We Lost:**
- ❌ Eames custom design tools (MCP not fast enough)
- ❌ Unified architecture (two separate paths)
- ❌ Clean abstractions (adapter layer complexity)

### Phase 2: UI Overhaul (Jan 2026)

**Goal:** Match Claude Code UI 100%

**Iterations:**
1. **Iteration 1**: Remove verbose displays
2. **Iteration 2**: Add animations
3. **Iteration 3**: Fix duplicate messages
4. **Iteration 4**: Phase visibility improvements
5. **Iteration 5**: Tool execution display

**What We Achieved:**
- ✅ Animated spinner (⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏)
- ✅ Phase indicators (🔍 📋 ⚙️ 🤔 ✍️)
- ✅ Clean query/answer layout
- ✅ Inline progress messages
- ✅ Markdown rendering with streaming

**What Didn't Work:**
- Phases transitioning too fast (invisible)
- SDK bypassing our orchestrator
- Tools not showing up in UI initially
- Timeouts causing aborts

### Phase 3: The Reckoning (Jan 17, 2026)

**The Discovery:**
```typescript
// SDK mode completely bypassed our 5-phase orchestrator!
async run(query: string) {
  // Our phases:
  await this.understandPhase.run();
  await this.planPhase.run();
  await this.executePhase.run();
  await this.reflectPhase.run();
  await this.answerPhase.run();
  
  // But SDK just does:
  await query({ prompt, options });  // 🤯
}
```

**Realizations:**
1. SDK has its own internal orchestration
2. Our 5-phase system conflicts with SDK's flow
3. Custom tools can't be added directly to SDK
4. MCP servers too slow (30+ second startup)
5. We're fighting the SDK's design instead of embracing it

---

## What We Built

### ✅ Successes

#### 1. Beautiful TUI (Ink + React)
- Clean, minimal Claude Code aesthetic
- Animated progress indicators
- Markdown rendering with syntax highlighting
- Command history and shortcuts
- Status messages and error handling

#### 2. Comprehensive Testing
- 61/61 unit tests passing
- SDK agent callbacks tested
- Message processor tested
- Hook integration tested

#### 3. Design Research Tools
```typescript
// Custom LangChain tools we created
- searchCompetitors
- analyzeMarket  
- getUserPersonas
- analyzePainPoints
- generatePRD
- generateUserStories
- generateWireframes
- getFinancialMetrics
- getCryptoPrices
```

#### 4. Documentation
- EAMES_VISION.md (381 lines)
- PROGRESS_TRACKER.md (367 lines)
- SDK_INTEGRATION_STATUS.md (comprehensive analysis)
- CLAUDE_CODE_PARITY_PLAN.md
- Multiple implementation guides

#### 5. Advanced Features
- Multi-turn conversations with session resume
- CLAUDE.md memory integration
- File checkpointing (undo/redo)
- Extended 1M token context
- Command history (Up/Down arrows)
- Ctrl+L, Ctrl+U, Ctrl+W shortcuts
- Bash mode (`!command`)
- Memory mode (`#instruction`)

### ⚠️ Architectural Challenges

#### 1. Dual Orchestration Problem
```
┌─────────────────────────────────────────────┐
│         EAMES 1.0 ARCHITECTURE              │
├─────────────────────────────────────────────┤
│                                             │
│  ┌──────────────────┐  ┌─────────────────┐ │
│  │ Dexter 5-Phase   │  │ Claude SDK      │ │
│  │ Orchestrator     │  │ Orchestrator    │ │
│  ├──────────────────┤  ├─────────────────┤ │
│  │ • Understand     │  │ • query()       │ │
│  │ • Plan           │  │ • Internal flow │ │
│  │ • Execute        │  │ • Tool routing  │ │
│  │ • Reflect        │  │ • Streaming     │ │
│  │ • Answer         │  │ • Sessions      │ │
│  └──────────────────┘  └─────────────────┘ │
│          ↓                      ↓           │
│    LangChain Tools      Claude Code Tools   │
│                                             │
│  ❌ Conflict: Two orchestrators fight       │
│  ❌ No clean integration path               │
│  ❌ Custom tools inaccessible in SDK        │
└─────────────────────────────────────────────┘
```

#### 2. Tool System Incompatibility
```typescript
// Dexter/LangChain approach
const tools = [
  new DynamicStructuredTool({
    name: "searchCompetitors",
    func: async (input) => { /* custom logic */ }
  })
];

// Claude SDK approach  
const options = {
  tools: { type: 'preset', preset: 'claude_code' },  // ← Can't add custom!
  mcpServers: { /* MCP only */ }  // ← 30+ sec startup
};
```

#### 3. Performance vs Features Tradeoff
- **Enable MCP**: Get custom tools, but 30+ second delays
- **Disable MCP**: Fast responses, but lose design features
- **No middle ground**: SDK all-or-nothing

#### 4. UI State Management Complexity
```typescript
// We had 3 different state systems:
1. Ink/React state (UI components)
2. Dexter orchestrator state (5 phases)
3. SDK message stream state (Claude Code flow)

// All fighting for control
```

---

## What We Learned

### 🎓 Technical Learnings

#### 1. Don't Fight the Framework
**Mistake:** Tried to wrap SDK in our orchestrator  
**Lesson:** SDK has its own orchestration - embrace it or don't use it

#### 2. Architecture Must Match Domain
**Mistake:** Mixing two different architectural patterns  
**Lesson:** Choose one approach and commit fully

#### 3. MCP is Powerful but Has Constraints
**Mistake:** Expected instant MCP server startup  
**Lesson:** MCP is for long-running tool servers, not fast prototyping

#### 4. Tool Integration Requires Planning
**Mistake:** Built custom LangChain tools, then tried SDK  
**Lesson:** Should have started with SDK tool architecture

#### 5. Real-time UI Needs Clean Data Flow
**Mistake:** Multiple sources of truth for progress state  
**Lesson:** Single stream of UI events from one source

### 💡 Product Learnings

#### 1. Start with End State
**What we did:** Built Dexter-style, then tried to add Claude Code  
**What we should have done:** Started with Claude Code architecture

#### 2. Incremental Migration is Hard
**Reality:** Can't cleanly merge two complete architectures  
**Better:** Clean slate with learned requirements

#### 3. Performance is a Feature
**Learning:** Users won't use slow tools, no matter how powerful  
**Implication:** MCP servers must be < 1 second startup

#### 4. Documentation is Foundation
**What worked:** Comprehensive docs saved us countless hours  
**What to improve:** Should have done architecture review earlier

### 🏗️ Engineering Learnings

#### 1. TypeScript Type Safety Saved Us
- Caught many SDK integration issues at compile time
- Made refactoring safer
- Documentation via types

#### 2. Test Coverage Was Crucial
- 61/61 tests stayed green through chaos
- Gave confidence to refactor
- Found issues before users did

#### 3. Ink TUI is Powerful
- React mental model for terminal
- Hot reload during development
- Component reusability

#### 4. Bun is Fast
- On-the-fly TypeScript compilation
- Fast package installation
- Great developer experience

---

## Why We're Sunsetting

### 🔴 Critical Issues

#### 1. Architectural Mismatch
**Problem:** Two orchestrators (Dexter + SDK) with incompatible designs  
**Impact:** Can't get full features of either system  
**Fix Required:** Complete rewrite

#### 2. Tool System Fragmentation  
**Problem:** Design tools (LangChain) can't work with SDK mode  
**Impact:** Core product differentiator is broken  
**Fix Required:** Rebuild all tools for SDK/MCP architecture

#### 3. Performance Unacceptable
**Problem:** MCP startup takes 30+ seconds  
**Impact:** Users will abandon before agent starts  
**Fix Required:** Optimize MCP or find alternative

#### 4. Maintenance Burden
**Problem:** Two codepaths to maintain (`useSdkMode ? sdk : dexter`)  
**Impact:** Every feature needs dual implementation  
**Fix Required:** Single unified architecture

#### 5. Limited SDK Extensibility
**Problem:** Can't add custom tools to SDK without MCP  
**Impact:** Stuck with only Claude Code built-in tools  
**Fix Required:** Build proper MCP server infrastructure

### ⚠️ Technical Debt

1. **Adapter Layer Complexity**
   - SdkMessageProcessor translating messages
   - Phase simulation in SDK agent
   - Dual callback systems

2. **State Synchronization**
   - React state + orchestrator state + SDK state
   - Race conditions in UI updates
   - Duplicate progress indicators

3. **Incomplete Features**
   - Skills directory doesn't exist
   - Plugins not implemented
   - Subagents not configured
   - Chrome integration disabled

4. **Performance Workarounds**
   - Artificial phase delays for visibility
   - Disabled features to hit speed targets
   - Timeout hacks (watchdog timers)

### 💔 Developer Experience Issues

1. **Cognitive Overload**
   - Must understand Dexter, LangChain, SDK, MCP, Ink
   - Too many moving parts
   - Hard to onboard new contributors

2. **Debugging Nightmare**
   - Which orchestrator is active?
   - Where is the tool call failing?
   - Why are messages duplicated?

3. **Feature Uncertainty**
   - What works in SDK mode?
   - What works in Dexter mode?
   - When to use which mode?

---

## The Right Approach

### 📐 What We Should Have Done

#### Phase 1: Research & Architecture (Week 1)
```
✅ Study Claude Agent SDK architecture deeply
✅ Understand MCP protocol thoroughly  
✅ Prototype tool integration patterns
✅ Benchmark MCP server performance
✅ Design clean architecture diagram
❌ Start coding immediately (what we did)
```

#### Phase 2: SDK-First Foundation (Week 2-3)
```
✅ Start with bare Claude Agent SDK
✅ Build minimal TUI wrapper
✅ Implement file operations via SDK
✅ Add session management
✅ Test all SDK features work
```

#### Phase 3: Fast MCP Server (Week 4)
```
✅ Build optimized MCP server for design tools
✅ < 1 second startup time requirement
✅ Lazy loading of heavy dependencies
✅ Cache everything possible
✅ Benchmark continuously
```

#### Phase 4: Layer Eames Features (Week 5-6)
```
✅ Add design tools via MCP
✅ Create PRD generation workflows
✅ Add market research capabilities
✅ Implement competitor analysis
✅ Build persona generation
```

#### Phase 5: Enhanced Orchestration (Week 7-8)
```
✅ Add 5-phase visualization on TOP of SDK
✅ Don't replace SDK orchestration
✅ Add phase callbacks via SDK hooks
✅ Display progress clearly
✅ Keep SDK doing the work
```

### 🎯 Key Principles We Missed

#### 1. **Don't Reinvent What Exists**
- SDK handles orchestration → Use it
- SDK does streaming → Don't wrap it
- SDK manages state → Trust it

#### 2. **Extend, Don't Replace**
- Add tools via MCP (the SDK way)
- Add UI via hooks (the SDK way)
- Add features via plugins (the SDK way)

#### 3. **Performance First**
- MCP servers must be instant
- No artificial delays
- Cache aggressively
- Lazy load everything

#### 4. **Single Source of Truth**
- One orchestrator (SDK)
- One state system (SDK messages)
- One tool system (MCP)

---

## Eames 2.0 Vision

### 🚀 Fresh Start Goals

#### Architecture
```
┌─────────────────────────────────────────────────────────┐
│              EAMES 2.0 ARCHITECTURE                     │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────────────────────────────────────────────┐  │
│  │         CLAUDE AGENT SDK (Core)                  │  │
│  │  • File Operations                               │  │
│  │  • Session Management                            │  │
│  │  │  • Streaming                                  │  │
│  │  • Built-in Tools                                │  │
│  │  • Orchestration                                 │  │
│  └─────────────┬────────────────────────────────────┘  │
│                │                                        │
│                ▼                                        │
│  ┌──────────────────────────────────────────────────┐  │
│  │         EAMES MCP SERVER (Fast!)                 │  │
│  │  • Market Research         < 500ms startup       │  │
│  │  • Competitor Analysis     Lazy loading          │  │
│  │  • PRD Generation          Cached results        │  │
│  │  • Persona Creation        Optimized queries     │  │
│  │  • Design Patterns         Smart caching         │  │
│  └──────────────────────────────────────────────────┘  │
│                │                                        │
│                ▼                                        │
│  ┌──────────────────────────────────────────────────┐  │
│  │         EAMES TUI (Ink/React)                    │  │
│  │  • Clean SDK message display                     │  │
│  │  • Phase visualization via hooks                 │  │
│  │  • Real-time progress streaming                  │  │
│  │  • No wrappers, just display                     │  │
│  └──────────────────────────────────────────────────┘  │
│                                                         │
└─────────────────────────────────────────────────────────┘

✅ Single orchestrator (SDK)
✅ Single tool system (MCP)  
✅ Single state flow (SDK messages)
✅ Clean separation of concerns
```

#### Core Principles

1. **SDK-First Everything**
   - Let SDK do what it does best
   - Don't wrap, don't replace
   - Extend via official APIs only

2. **Performance Requirements**
   - MCP server startup: < 500ms
   - First response: < 2 seconds
   - Tool calls: < 1 second each
   - No artificial delays

3. **Clean Abstractions**
   - TUI: Display only, no business logic
   - MCP: Tools only, no orchestration
   - SDK: Everything else

4. **Comprehensive Testing**
   - 100% MCP tool coverage
   - Integration tests with SDK
   - Performance benchmarks
   - E2E user workflows

### 🎨 Feature Roadmap

#### Sprint 1: Foundation (Week 1)
- [ ] Fresh repo: `eames-design-agent-v2`
- [ ] Minimal Claude Agent SDK wrapper
- [ ] Basic TUI with SDK message display
- [ ] Session management working
- [ ] File operations tested

#### Sprint 2: Fast MCP Server (Week 2)
- [ ] Eames MCP server scaffold
- [ ] Market research tool (< 500ms)
- [ ] Competitor analysis tool
- [ ] Performance benchmarks
- [ ] Integration tests

#### Sprint 3: Design Tools (Week 3)
- [ ] PRD generation tool
- [ ] User persona tool
- [ ] Design pattern research
- [ ] Wireframe description tool
- [ ] All tools < 1s response time

#### Sprint 4: Enhanced UI (Week 4)
- [ ] Phase visualization via SDK hooks
- [ ] Progress streaming
- [ ] Tool execution display
- [ ] Error handling
- [ ] Command shortcuts

#### Sprint 5: Polish (Week 5)
- [ ] CLAUDE.md integration
- [ ] Skills templates
- [ ] Plugin system
- [ ] Documentation
- [ ] Examples

### 🎯 Success Criteria

#### Must Have
- ✅ 100% Claude Code feature parity
- ✅ < 2 second first response
- ✅ All Eames design tools working
- ✅ Clean, maintainable codebase
- ✅ 90%+ test coverage

#### Should Have
- Subagent delegation (UX researcher, visual designer, etc.)
- Skills library (design templates)
- Plugin ecosystem
- GitHub integration
- Linear integration

#### Nice to Have
- Chrome browser integration
- Figma API integration
- Design system generation
- A2UI protocol support
- Multi-agent collaboration

---

## Acknowledgments

### 🙏 Thank You

#### Virat Singh & Dexter
- **Foundation:** Dexter provided the perfect starting architecture
- **Learnings:** The 5-phase orchestration pattern is brilliant
- **Code Quality:** Clean, tested, documented codebase
- **Inspiration:** Showed what's possible with autonomous agents

#### Anthropic & Claude Team
- **Claude Agent SDK:** Powerful tool for building agents
- **Documentation:** Comprehensive SDK docs
- **API Quality:** Excellent model capabilities
- **Support:** Discord community

#### Open Source Community
- **Ink:** Amazing React-based TUI framework
- **LangChain:** Pioneering agent orchestration
- **MCP Protocol:** Future of tool integration
- **Bun:** Fast, modern JavaScript runtime

### 📚 What We're Keeping

From Eames 1.0:
- ✅ Vision & product requirements
- ✅ Design research findings
- ✅ Test suite patterns
- ✅ TUI component architecture
- ✅ Documentation structure
- ✅ Tool specifications
- ✅ User stories & PRDs
- ✅ Branding & design language

---

## Migration Path

### For Users

**Current Eames 1.0 Users:**
1. Eames 1.0 will remain available at `main` branch
2. No support or updates after Jan 31, 2026
3. Migrate to Eames 2.0 when released (ETA: Feb 2026)

**Installation:**
```bash
# Eames 1.0 (deprecated)
git clone https://github.com/Kari-Basavaraj/eames-design-agent.git
git checkout main

# Eames 2.0 (recommended - coming soon)
git clone https://github.com/Kari-Basavaraj/eames-design-agent.git
git checkout v2
```

### For Contributors

**Eames 1.0:**
- No new features accepted
- Critical bugs only
- Documentation improvements welcome

**Eames 2.0:**
- All contributions welcome
- New architecture from scratch
- SDK-first approach
- MCP tool development opportunities

### For Forks

If you forked Eames 1.0:
- Branch is yours to maintain
- Consider migrating to 2.0 architecture
- We're happy to help with migrations
- Credit appreciated but not required

---

## Timeline

| Date | Event |
|------|-------|
| Jan 12, 2026 | Eames 1.0 development started |
| Jan 17, 2026 | Architecture issues identified |
| Jan 17, 2026 | Decision to sunset 1.0 |
| Jan 17, 2026 | This document published |
| Jan 18, 2026 | Eames 2.0 development starts |
| Jan 31, 2026 | Eames 1.0 support ends |
| Feb 15, 2026 | Eames 2.0 beta release (target) |
| Mar 1, 2026 | Eames 2.0 stable release (target) |

---

## Final Thoughts

### What We Built
Eames 1.0 was an ambitious attempt to merge the best of multiple AI agent architectures. We created beautiful UIs, comprehensive tooling, and pushed the boundaries of what's possible.

### What We Learned
Sometimes the right answer is "start over with what you learned." We're not throwing away the work - we're distilling it into wisdom.

### What's Next
Eames 2.0 will be faster, cleaner, and more powerful. Built on Claude Agent SDK from day one, with blazing-fast MCP tools and crystal-clear architecture.

### The Vision Remains
**Autonomous Product Design from Discovery to Delivery.**

That vision is stronger than ever. We just found a better path to get there.

---

## Contact & Links

- **GitHub:** [eames-design-agent](https://github.com/Kari-Basavaraj/eames-design-agent)
- **Author:** Basavaraj KM
- **Based On:** [Dexter by Virat Singh](https://github.com/virattt/dexter)
- **License:** MIT

---

**Thank you for believing in the vision. See you in Eames 2.0.** 🚀

---

*"Design is a plan for arranging elements in such a way as best to accomplish a particular purpose."*  
— Charles & Ray Eames

*"The fastest way forward is sometimes to go back to the start with what you learned."*  
— Eames Team, 2026
