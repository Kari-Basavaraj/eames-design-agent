# EAMES V2.0 ARCHITECTURE - SDK VERSION
## Claude Agent SDK with Skills & Sub-Agents

**Version:** 2.0.0-sdk  
**Branch:** `sdk`  
**Date:** 2026-01-18  
**Status:** Strategic Architecture

---

## 🎯 SDK VERSION FOCUS

**Core Strengths:**
- ✅ **Claude Agent SDK native** (official Anthropic framework)
- ✅ **Agent Skills system** (hierarchical skill loading)
- ✅ **Sub-agents** (specialized agents that fork context)
- ✅ **Claude Code CLI features** (slash commands, permissions, sessions)
- ✅ **File system operations** (safe, sandboxed)
- ✅ **Production-ready** (proven, stable, well-documented)

**Use Case:**
Simple, powerful CLI that leverages Claude's native agentic capabilities for design workflows.

---

## 🏗️ ARCHITECTURE OVERVIEW

```
┌─────────────────────────────────────────────────────────────────┐
│               EAMES V2.0 - SDK ARCHITECTURE                     │
│            Native · Skills-Based · Sub-Agents                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  USER INPUT: "Design split-bill feature"                       │
│      │                                                          │
│      ▼                                                          │
│  ┌──────────────────────────────────────────────────┐          │
│  │   MAIN AGENT (Eames Core)                       │          │
│  │   Model: Claude 3.5 Sonnet                       │          │
│  │   Role: Orchestrator + Eames Identity            │          │
│  └──────────────────────────────────────────────────┘          │
│      │                                                          │
│      ├─► AGENT SKILLS SYSTEM (Hierarchical)                    │
│      │   Level 1: Skill metadata (always loaded)               │
│      │   Level 2: Full skill docs (loaded when needed)         │
│      │   Level 3+: Nested resources (on demand)                │
│      │                                                          │
│      ├─► STAGE 0: Intent Understanding                         │
│      │   - Analyze query (intent, context, deliverable)        │
│      │   - Select relevant skills                              │
│      │   - Route to mode (ask/plan/execute)                    │
│      │                                                          │
│      └─► THREE INTELLIGENT MODES                               │
│          ASK → PLAN → EXECUTE                                   │
│                                                                 │
│      ▼                                                          │
│  ┌──────────────────────────────────────────────────┐          │
│  │         SUB-AGENT ARCHITECTURE                   │          │
│  │      (Forked Contexts for Specialization)        │          │
│  └──────────────────────────────────────────────────┘          │
│      │                                                          │
│      ├─► DISCOVERY SUB-AGENT                                   │
│      │   Skill: research.md, competitor-analysis.md            │
│      │   Role: User research, market analysis                  │
│      │   Context: Forked with research focus                   │
│      │                                                          │
│      ├─► STRATEGY SUB-AGENT                                    │
│      │   Skill: prd-generation.md, jtbd.md                     │
│      │   Role: PRD creation, strategic planning                │
│      │   Context: Forked with strategy focus                   │
│      │                                                          │
│      ├─► DESIGN SUB-AGENT                                      │
│      │   Skill: ui-design.md, a2ui-generation.md               │
│      │   Role: Wireframes, A2UI specs                          │
│      │   Context: Forked with design focus                     │
│      │                                                          │
│      ├─► CODE SUB-AGENT                                        │
│      │   Skill: code-generation.md, testing.md                 │
│      │   Role: React/TypeScript code generation                │
│      │   Context: Forked with code focus (Ralph loop)          │
│      │                                                          │
│      └─► QA SUB-AGENT                                          │
│          Skill: quality-review.md, accessibility.md            │
│          Role: Review and validation                            │
│          Context: Forked with QA focus                         │
│                                                                 │
│      ▼                                                          │
│  ┌──────────────────────────────────────────────────┐          │
│  │      5-PHASE DESIGN LIFECYCLE (Adaptive)         │          │
│  │                                                  │          │
│  │  Each phase spawns appropriate sub-agent         │          │
│  │  with Ralph loop pattern                         │          │
│  │                                                  │          │
│  │  Discovery → Define → Design → Develop → Deliver │          │
│  └──────────────────────────────────────────────────┘          │
│                                                                 │
│  ┌──────────────────────────────────────────────────┐          │
│  │         CLAUDE SDK FEATURES                      │          │
│  │                                                  │          │
│  │  • File operations (safe, sandboxed)             │          │
│  │  • Bash command execution                        │          │
│  │  • MCP integrations (Memory, Linear, GitHub)     │          │
│  │  • Session management                            │          │
│  │  • Permission system                             │          │
│  │  • Slash commands                                │          │
│  └──────────────────────────────────────────────────┘          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🎓 AGENT SKILLS SYSTEM

### **Claude Code Skills Architecture**

Skills are hierarchical, lazy-loaded resources that teach the agent domain expertise:

```
.eames/
├── skills/
│   ├── SKILLS_INDEX.md           # Level 1: All skills metadata
│   ├── research/
│   │   ├── SKILL.md              # Level 2: Main skill doc
│   │   ├── competitor-analysis.md
│   │   ├── user-interviews.md
│   │   └── market-trends.md
│   ├── strategy/
│   │   ├── SKILL.md
│   │   ├── prd-generation.md
│   │   ├── jtbd-framework.md
│   │   └── user-stories.md
│   ├── design/
│   │   ├── SKILL.md
│   │   ├── wireframing.md
│   │   ├── a2ui-generation.md
│   │   ├── design-systems.md
│   │   └── accessibility.md
│   ├── development/
│   │   ├── SKILL.md
│   │   ├── react-generation.md
│   │   ├── testing.md
│   │   ├── ralph-loop.md
│   │   └── code-quality.md
│   └── delivery/
│       ├── SKILL.md
│       ├── github-workflow.md
│       ├── ci-cd.md
│       └── deployment.md
```

### **Skill Loading Strategy**

```markdown
<!-- .eames/skills/SKILLS_INDEX.md -->
# Eames Design Agent Skills

## Available Skills

### research (Discovery Phase)
**Description:** User research, competitive analysis, market trends
**When to use:** Discovery phase, understanding problem space
**Key capabilities:** Competitor analysis, user interviews, data synthesis

### strategy (Define Phase)
**Description:** PRD generation, strategic planning, JTBD framework
**When to use:** Define phase, requirements gathering
**Key capabilities:** PRD creation, user stories, success metrics

### design (Design Phase)
**Description:** UI/UX design, wireframing, A2UI specification
**When to use:** Design phase, creating interfaces
**Key capabilities:** Wireframes, component specs, accessibility

### development (Develop Phase)
**Description:** Code generation, testing, quality assurance
**When to use:** Develop phase, implementation
**Key capabilities:** React/TypeScript, tests, Ralph loop

### delivery (Deliver Phase)
**Description:** Deployment, CI/CD, GitHub workflows
**When to use:** Deliver phase, shipping to production
**Key capabilities:** GitHub integration, deployment automation
```

### **Skill Example: Research**

```markdown
<!-- .eames/skills/research/SKILL.md -->
# Research Skill

You are now in **Research mode**. Your expertise is user research,
competitive analysis, and market trend synthesis.

## Capabilities

### 1. Competitive Analysis
When analyzing competitors, you:
- Identify 5-7 direct competitors
- Extract UX patterns from each
- Document pain points from user reviews
- Synthesize opportunities for differentiation

See: competitor-analysis.md for detailed methodology

### 2. User Interviews (JTBD Framework)
When conducting user research, you:
- Frame questions around Jobs-to-be-Done
- Ask about triggers, not features
- Identify emotional and social jobs
- Extract outcome statements

See: user-interviews.md for question templates

### 3. Market Trend Synthesis
When researching market trends, you:
- Use Perplexity/Tavily for live web search
- Cite sources with URLs
- Identify emerging patterns
- Connect trends to user needs

## Output Format

Your research deliverable is a markdown document with:
- **Executive Summary** (3-5 key insights)
- **Competitive Landscape** (comparison matrix)
- **User Insights** (synthesized findings)
- **Opportunity Areas** (actionable recommendations)
- **Citations** (all sources with URLs)

## Tools Available

- Web search (MCP)
- Screenshot analysis (if competitor sites provided)
- Data synthesis (LLM reasoning)

## Success Criteria

<promise>RESEARCH_COMPLETE</promise> when:
- [ ] 5+ competitors analyzed
- [ ] UX patterns documented
- [ ] User pain points identified
- [ ] Opportunities synthesized
- [ ] All sources cited
```

---

## 🤖 SUB-AGENT ARCHITECTURE

### **What are Sub-Agents?**

Sub-agents are specialized instances of Claude that:
- Fork from main agent context
- Load specific skills
- Focus on one domain
- Return results to main agent

### **Sub-Agent Pattern**

```typescript
// src/agent/sub-agents/research-agent.ts
import { ClaudeAgent } from '@anthropic-ai/sdk';

export class ResearchSubAgent {
  private agent: ClaudeAgent;
  
  constructor(parentContext: AgentContext) {
    this.agent = new ClaudeAgent({
      model: 'claude-3-5-sonnet-20241022',
      
      // Fork context from parent
      systemPrompt: this.buildResearchPrompt(parentContext),
      
      // Load research skills
      skills: ['research', 'competitor-analysis', 'user-interviews'],
      
      // Inherit parent's tools but add research-specific ones
      tools: [
        ...parentContext.tools,
        'web_search',
        'synthesize_research'
      ],
      
      // Isolated session
      sessionId: `${parentContext.sessionId}:research`
    });
  }
  
  async executeDiscoveryPhase(query: string): Promise<ResearchSynthesis> {
    // Ralph loop within sub-agent
    const MAX_ITERATIONS = 10;
    let iteration = 0;
    
    const criteria = {
      competitorAnalysisComplete: false,
      userResearchSynthesized: false,
      painPointsIdentified: false,
      opportunitiesDocumented: false
    };
    
    while (iteration < MAX_ITERATIONS) {
      iteration++;
      
      const result = await this.agent.execute({
        message: `Continue research for: ${query}`,
        context: { iteration, criteria }
      });
      
      // Check completion
      if (result.includes('<promise>RESEARCH_COMPLETE</promise>')) {
        return this.parseResearchOutput(result);
      }
      
      // Update criteria based on progress
      this.updateCriteria(criteria, result);
    }
    
    throw new Error('Research phase did not complete');
  }
  
  private buildResearchPrompt(parentContext: AgentContext): string {
    return `
      ${EAMES_IDENTITY}
      
      ## CURRENT ROLE: RESEARCH SUB-AGENT
      
      You are specialized in user research and competitive analysis.
      Your parent agent (Eames Main) needs research insights.
      
      ## YOUR FOCUS
      
      - Discovery phase execution
      - Competitor analysis
      - User interview synthesis
      - Market trend research
      
      ## CONTEXT FROM PARENT
      
      User query: ${parentContext.query}
      Intent: ${parentContext.intent}
      Expected deliverable: ${parentContext.expectedDeliverable}
      
      ## YOUR MISSION
      
      Execute research using Ralph loop until completion criteria met.
      Output <promise>RESEARCH_COMPLETE</promise> when done.
    `;
  }
}
```

### **Sub-Agent Coordination**

```typescript
// src/agent/main-agent.ts
export class EamesMainAgent {
  private subAgents: {
    research: ResearchSubAgent;
    strategy: StrategySubAgent;
    design: DesignSubAgent;
    code: CodeSubAgent;
    qa: QASubAgent;
  };
  
  async executePhase(phase: Phase, context: AgentContext) {
    // Select appropriate sub-agent
    const subAgent = this.selectSubAgent(phase.name);
    
    // Spawn sub-agent with forked context
    const result = await subAgent.execute({
      phase,
      parentContext: context,
      previousResults: this.results
    });
    
    // Store result
    this.results[phase.name] = result;
    
    // Check quality with QA sub-agent
    if (phase.requiresReview) {
      const review = await this.subAgents.qa.review(result);
      
      if (!review.approved) {
        // Retry with feedback
        return this.executePhase(phase, {
          ...context,
          feedback: review.feedback
        });
      }
    }
    
    return result;
  }
  
  private selectSubAgent(phaseName: string) {
    switch (phaseName) {
      case 'discover': return this.subAgents.research;
      case 'define': return this.subAgents.strategy;
      case 'design': return this.subAgents.design;
      case 'develop': return this.subAgents.code;
      case 'deliver': return this.subAgents.code; // Code agent handles deploy
      default: throw new Error(`Unknown phase: ${phaseName}`);
    }
  }
}
```

---

## 🔧 CLAUDE CODE CLI FEATURES

### **1. Slash Commands**

Eames SDK version includes Claude Code-style commands:

```bash
# Session management
/new              # Start new session
/continue         # Resume last session
/sessions         # List all sessions

# Phase control
/discover "query" # Run Discovery phase only
/define           # Run Define phase only
/design           # Run Design phase only
/develop          # Run Develop phase only
/deliver          # Run Deliver phase only

# Mode control
/ask              # Force Ask Mode
/plan             # Force Plan Mode
/execute          # Force Execute Mode (skip ask/plan)

# Sub-agent control
/spawn research   # Spawn research sub-agent
/spawn strategy   # Spawn strategy sub-agent
/spawn design     # Spawn design sub-agent

# Utility
/status           # Show current progress
/cost             # Show API usage and cost
/help             # Show available commands
/clear            # Clear screen but keep session
```

### **2. Permission System**

```typescript
// src/agent/permissions.ts
interface PermissionConfig {
  fileSystem: {
    read: string[];      // Allowed read paths
    write: string[];     // Allowed write paths
    execute: string[];   // Allowed executables
  };
  network: {
    allowedDomains: string[];
    allowHttp: boolean;
    allowHttps: boolean;
  };
  tools: {
    allowed: string[];
    requireConfirmation: string[];
  };
}

export const DEFAULT_PERMISSIONS: PermissionConfig = {
  fileSystem: {
    read: ['.', './src', './docs', './.eames'],
    write: ['./src', './docs', './.eames/sessions'],
    execute: ['git', 'npm', 'bun', 'node']
  },
  network: {
    allowedDomains: ['api.anthropic.com', 'api.linear.app'],
    allowHttp: false,
    allowHttps: true
  },
  tools: {
    allowed: ['file_read', 'file_write', 'bash_execute', 'mcp_*'],
    requireConfirmation: ['file_delete', 'bash_execute']
  }
};

// Request permission before dangerous operations
export async function requestPermission(
  operation: string,
  details: string
): Promise<boolean> {
  console.log(`\n⚠️  Permission required: ${operation}`);
  console.log(`   ${details}`);
  
  const response = await promptUser({
    message: 'Allow this operation?',
    choices: ['Yes', 'No', 'Always for this session']
  });
  
  if (response === 'Always for this session') {
    // Add to session permissions
    addSessionPermission(operation);
  }
  
  return response !== 'No';
}
```

### **3. Session Management**

```typescript
// src/agent/sessions.ts
interface Session {
  id: string;
  created: Date;
  lastActive: Date;
  context: {
    query: string;
    intent: IntentAnalysis;
    plan?: ExecutionPlan;
    results: Record<string, any>;
    currentPhase?: string;
  };
  history: Message[];
  cost: {
    inputTokens: number;
    outputTokens: number;
    totalCost: number;
  };
}

export class SessionManager {
  private sessionsDir = './.eames/sessions';
  
  async saveSession(session: Session): Promise<void> {
    const path = `${this.sessionsDir}/${session.id}.json`;
    await writeFile(path, JSON.stringify(session, null, 2));
  }
  
  async loadSession(sessionId: string): Promise<Session> {
    const path = `${this.sessionsDir}/${sessionId}.json`;
    const content = await readFile(path, 'utf-8');
    return JSON.parse(content);
  }
  
  async listSessions(): Promise<Session[]> {
    const files = await readdir(this.sessionsDir);
    const sessions = await Promise.all(
      files.map(f => this.loadSession(f.replace('.json', '')))
    );
    
    return sessions.sort((a, b) => 
      b.lastActive.getTime() - a.lastActive.getTime()
    );
  }
  
  async continueLastSession(): Promise<Session> {
    const sessions = await this.listSessions();
    
    if (sessions.length === 0) {
      throw new Error('No previous sessions found');
    }
    
    const lastSession = sessions[0];
    console.log(`\n🔄 Resuming session from ${lastSession.lastActive.toLocaleString()}`);
    console.log(`   Last phase: ${lastSession.context.currentPhase || 'Intent Analysis'}`);
    
    return lastSession;
  }
}
```

### **4. File Operations (Safe)**

```typescript
// src/tools/file-operations.ts
import { ClaudeAgent } from '@anthropic-ai/sdk';

export class SafeFileOperations {
  constructor(private permissions: PermissionConfig) {}
  
  async readFile(path: string): Promise<string> {
    // Check read permission
    if (!this.canRead(path)) {
      throw new Error(`Permission denied: Cannot read ${path}`);
    }
    
    return await readFile(path, 'utf-8');
  }
  
  async writeFile(path: string, content: string): Promise<void> {
    // Check write permission
    if (!this.canWrite(path)) {
      throw new Error(`Permission denied: Cannot write ${path}`);
    }
    
    // Request confirmation for important files
    if (this.isImportantFile(path)) {
      const confirmed = await requestPermission(
        'file_write',
        `Write to ${path} (${content.length} bytes)`
      );
      
      if (!confirmed) {
        throw new Error('Operation cancelled by user');
      }
    }
    
    await writeFile(path, content);
  }
  
  async executeBash(command: string): Promise<string> {
    // Parse command
    const [exe, ...args] = command.split(' ');
    
    // Check executable permission
    if (!this.canExecute(exe)) {
      throw new Error(`Permission denied: Cannot execute ${exe}`);
    }
    
    // Request confirmation
    const confirmed = await requestPermission(
      'bash_execute',
      `Execute: ${command}`
    );
    
    if (!confirmed) {
      throw new Error('Operation cancelled by user');
    }
    
    // Execute safely
    const result = await exec(command);
    return result.stdout;
  }
  
  private canRead(path: string): boolean {
    return this.permissions.fileSystem.read.some(allowed => 
      path.startsWith(allowed)
    );
  }
  
  private canWrite(path: string): boolean {
    return this.permissions.fileSystem.write.some(allowed => 
      path.startsWith(allowed)
    );
  }
  
  private canExecute(exe: string): boolean {
    return this.permissions.fileSystem.execute.includes(exe);
  }
  
  private isImportantFile(path: string): boolean {
    const important = [
      'package.json',
      'tsconfig.json',
      '.env',
      'README.md',
      '.gitignore'
    ];
    
    return important.some(file => path.endsWith(file));
  }
}
```

---

## 📋 THREE MODES WITH SUB-AGENTS

### **ASK MODE**

```typescript
async function askMode(query: string, intentAnalysis: IntentAnalysis) {
  // Main agent generates questions
  const questions = await mainAgent.generateQuestions({
    query,
    intent: intentAnalysis,
    maxQuestions: 5
  });
  
  // Present to user
  console.log('\n📋 I need context to build the right thing:\n');
  questions.forEach((q, i) => {
    console.log(`${i + 1}. ${q.question}`);
    console.log(`   ${dim('Why: ' + q.reasoning)}\n`);
  });
  
  // Collect answers
  const answers = await promptUser(questions);
  
  // Synthesize context
  const enrichedContext = await mainAgent.synthesizeContext({
    query,
    questions,
    answers,
    intentAnalysis
  });
  
  return planMode(enrichedContext);
}
```

### **PLAN MODE**

```typescript
async function planMode(enrichedContext: EnrichedContext) {
  // Spawn strategy sub-agent to create plan
  const strategyAgent = new StrategySubAgent(enrichedContext);
  
  const plan = await strategyAgent.generateExecutionPlan({
    context: enrichedContext,
    includeAlternatives: true
  });
  
  // Present plan
  console.log('\n📐 Proposed Execution Plan:\n');
  console.log(plan.summary);
  
  console.log('\n🔄 Phases to Execute:\n');
  plan.phases.forEach((phase, i) => {
    console.log(`${i + 1}. ${phase.emoji} ${phase.name.toUpperCase()}`);
    console.log(`   Goal: ${phase.goal}`);
    console.log(`   Deliverable: ${phase.deliverable}`);
    console.log(`   Sub-agent: ${phase.subAgent}`);
    console.log(`   Estimated loops: ${phase.estimatedIterations}`);
    console.log(`   Time: ${phase.estimatedTime}\n`);
  });
  
  // Get approval
  const approval = await promptUser({
    message: 'Approve this plan?',
    choices: ['Yes', 'Modify', 'Cancel']
  });
  
  if (approval === 'Yes') {
    return executeMode(plan);
  }
}
```

### **EXECUTE MODE**

```typescript
async function executeMode(plan: ExecutionPlan) {
  console.log('\n🚀 Starting execution...\n');
  
  const results: Record<string, any> = {};
  
  for (const phase of plan.phases) {
    console.log(`\n${phase.emoji} ${phase.name.toUpperCase()} PHASE`);
    console.log(`Goal: ${phase.goal}\n`);
    
    // Spawn appropriate sub-agent
    const subAgent = spawnSubAgent(phase.subAgent, {
      phase,
      previousResults: results,
      sessionId: mainAgent.sessionId
    });
    
    // Execute phase with Ralph loop
    const result = await subAgent.executeWithRalphLoop(phase);
    
    // Store result
    results[phase.name] = result;
    
    // Check approval gate
    const gate = plan.approvalGates.find(g => g.phase === phase.name);
    if (gate && gate.required) {
      console.log(`\n🛡️ Approval Gate: ${gate.description}`);
      
      const approved = await reviewAndApprove(result);
      if (!approved) {
        console.log('❌ Execution stopped by user');
        return;
      }
    }
    
    console.log(`✅ ${phase.name} complete`);
  }
  
  console.log('\n🎉 All phases complete!');
  return results;
}

function spawnSubAgent(
  type: string,
  context: SubAgentContext
): BaseSubAgent {
  switch (type) {
    case 'research': return new ResearchSubAgent(context);
    case 'strategy': return new StrategySubAgent(context);
    case 'design': return new DesignSubAgent(context);
    case 'code': return new CodeSubAgent(context);
    case 'qa': return new QASubAgent(context);
    default: throw new Error(`Unknown sub-agent type: ${type}`);
  }
}
```

---

## 🔧 IMPLEMENTATION ROADMAP

### **Phase 1: Skills Foundation (Weeks 1-2)**

**Goal:** Agent skills system working with hierarchical loading

**Tasks:**
1. Create `.eames/skills/` directory structure
2. Write SKILLS_INDEX.md with all skill metadata
3. Implement skill loading logic
4. Test lazy loading (metadata → full docs → nested resources)

**Files to create:**
```
.eames/
├── skills/
│   ├── SKILLS_INDEX.md
│   ├── research/SKILL.md
│   ├── strategy/SKILL.md
│   ├── design/SKILL.md
│   ├── development/SKILL.md
│   └── delivery/SKILL.md
src/agent/
└── skills-loader.ts
```

**Success criteria:**
- Skills load hierarchically
- Metadata always available (low token cost)
- Full docs load on demand
- Test with `/skill research` command

---

### **Phase 2: Sub-Agent Foundation (Weeks 3-4)**

**Goal:** Sub-agents can fork, specialize, and return results

**Tasks:**
1. Create base sub-agent class
2. Implement context forking
3. Build 5 specialized sub-agents
4. Test sub-agent spawning

**Files to create:**
```
src/agent/sub-agents/
├── base-sub-agent.ts
├── research-sub-agent.ts
├── strategy-sub-agent.ts
├── design-sub-agent.ts
├── code-sub-agent.ts
└── qa-sub-agent.ts
```

**Success criteria:**
- Can spawn sub-agent with forked context
- Sub-agent loads appropriate skills
- Sub-agent returns structured results
- Main agent receives and integrates results

---

### **Phase 3: Intent + Ask Mode (Weeks 5-6)**

**Goal:** Stage 0 routing + Clarification Loop

**Tasks:**
1. Intent analyzer
2. Question generation
3. Context synthesis
4. Route to Plan Mode

**Success criteria:**
- Vague queries trigger Ask Mode
- Questions reference Skills knowledge
- Context synthesis structures answers

---

### **Phase 4: Plan Mode (Weeks 7-8)**

**Goal:** Generate execution plans with sub-agent assignments

**Tasks:**
1. Plan generation with strategy sub-agent
2. Sub-agent selection per phase
3. Cost/time estimation
4. Plan modification

**Success criteria:**
- Plans show which sub-agent handles each phase
- Adaptive phase selection
- Accurate estimates

---

### **Phase 5: Execute Mode + Ralph Loops (Weeks 9-12)**

**Goal:** Each phase spawns sub-agent with Ralph loop

**Tasks:**
1. Sub-agent spawning in Execute Mode
2. Ralph loop within each sub-agent
3. QA sub-agent review at gates
4. Session persistence

**Success criteria:**
- Discovery spawns research sub-agent
- Define spawns strategy sub-agent
- Design spawns design sub-agent
- Develop spawns code sub-agent
- QA sub-agent reviews periodically

---

### **Phase 6: Claude Code Features (Weeks 13-14)**

**Goal:** Slash commands, permissions, sessions

**Tasks:**
1. Implement slash command parser
2. Build permission system
3. Session management
4. Safe file operations

**Success criteria:**
- `/discover`, `/design`, etc. work
- Permission system prevents unsafe ops
- Sessions persist and resume
- File operations are safe

---

### **Phase 7: Eames Brain (Weeks 15-16)**

**Goal:** Contextual prompt composition integrated with Skills

**Tasks:**
1. Eames Brain prompt builder
2. Skill-aware prompt composition
3. Design frameworks in Skills
4. Token budget management

**Success criteria:**
- Prompts reference Skills
- Token usage < 15k per phase (SDK is more efficient)
- Output quality measurably better

---

## 📊 TECH STACK DETAILS

### **Runtime & UI**
```json
{
  "runtime": "Bun",
  "ui": "React Ink",
  "language": "TypeScript (ESM)"
}
```

### **Claude SDK**
```json
{
  "core": "@anthropic-ai/sdk",
  "version": "0.30.0+",
  "features": [
    "Agent class",
    "Sub-agents",
    "Tool use",
    "File operations",
    "Session management"
  ]
}
```

### **MCP Integrations**
```json
{
  "memory": "Memory MCP (entities, relations)",
  "linear": "Linear MCP (project management)",
  "github": "GitHub MCP (repos, PRs, issues)",
  "notion": "Notion MCP (documentation)"
}
```

### **No External LLM Dependencies**
- Pure Claude (no multi-provider complexity)
- Simpler, more reliable
- Official Anthropic support

---

## 🎯 SUCCESS METRICS

### **Sub-Agent Quality**
- Sub-agents improve specialization >70% vs monolithic
- Context forking reduces token usage >30%
- Skills loading is lazy and efficient

### **Performance**
- Token usage per phase < 15k (SDK efficiency)
- Cost per full workflow < $3
- Time to completion matches estimates ±25%

### **User Experience**
- Slash commands feel native
- Permission system is transparent
- Sessions resume seamlessly

---

## 🚀 GETTING STARTED

### **Current State (sdk branch)**

You need to create the SDK branch:

```bash
cd /Users/basavarajkm/code/eames-design-agent
git checkout -b sdk
```

### **Next Steps**

1. **Set up Skills directory**
   ```bash
   mkdir -p .eames/skills/{research,strategy,design,development,delivery}
   ```

2. **Install Claude SDK**
   ```bash
   bun add @anthropic-ai/sdk
   ```

3. **Create base sub-agent**
   ```bash
   mkdir -p src/agent/sub-agents
   touch src/agent/sub-agents/base-sub-agent.ts
   ```

---

## 📚 RELATED DOCUMENTS

- `EAMES_V2_ARCHITECTURE_LANGCHAIN.md` - LangChain version (multi-provider council)
- `EAMES_V2_ARCHITECTURE_WEBAPP.md` - Web app version (A2UI, AG-UI)
- `EAMES_SYSTEM_PROMPT_ARCHITECTURE.md` - Prompt design patterns
- `EAMES_VISION_ROADMAP.md` - Product vision

---

**Last Updated:** 2026-01-18  
**Branch:** sdk  
**Version:** 2.0.0-sdk  
**Status:** Strategic Architecture - Claude SDK Implementation
