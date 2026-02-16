# EAMES V2.0 ARCHITECTURE
## Intelligent Design Agent with Adaptive Workflows

**Version:** 2.0.0  
**Date:** 2026-01-18  
**Status:** Strategic Architecture

---

## 🧠 CORE PHILOSOPHY

**Old Thinking (v1.0):** Every query goes through 5 phases sequentially  
**New Thinking (v2.0):** Understand intent → Gather context → Route to appropriate phases

> **"Eames should work like a senior design lead: ask clarifying questions, propose a plan, get alignment, then execute intelligently."**

---

## 🎯 THE CENTRAL INSIGHT

Real-world design work is **NOT linear**. Sometimes you need:
- Quick wireframe iteration (Design phase only)
- PRD refinement (Define phase only)
- End-to-end feature (all 5 phases)
- Research synthesis (Discovery phase only)
- Code implementation from existing spec (Develop phase only)

**Eames must be intelligent enough to:**
1. **Understand user intent** (what are they really asking for?)
2. **Ask clarifying questions** (gather missing context)
3. **Propose a plan** (which phases/loops are needed?)
4. **Get user approval** (collaborative, not autonomous)
5. **Execute adaptively** (run only what's needed)

---

## 📊 ARCHITECTURE OVERVIEW

```
┌─────────────────────────────────────────────────────────────────┐
│                   EAMES V2.0 ARCHITECTURE                       │
│              Intelligent · Adaptive · Collaborative             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  USER INPUT: "Design split-bill feature for college students"  │
│      │                                                          │
│      ▼                                                          │
│  ┌──────────────────────────────────────────────────┐          │
│  │   STAGE 0: INTENT UNDERSTANDING & ROUTING        │          │
│  │   (The Intelligence Layer - NEW!)                │          │
│  └──────────────────────────────────────────────────┘          │
│      │                                                          │
│      ├─► Analyze Query (LLM)                                   │
│      │   • What is user trying to accomplish?                  │
│      │   • How much context do they have?                      │
│      │   • What deliverable do they expect?                    │
│      │   • Which phases are relevant?                          │
│      │                                                          │
│      ├─► Context Assessment                                    │
│      │   • Complete (has PRD, designs, etc.)                   │
│      │   • Partial (has idea, needs refinement)                │
│      │   • Vague (exploratory, needs discovery)                │
│      │                                                          │
│      └─► Route to appropriate mode ─┬──────────────────────────│
│                                     │                           │
│      ┌──────────────────────────────┼──────────────────────┐   │
│      │                              │                      │   │
│      ▼                              ▼                      ▼   │
│  ┌────────────┐              ┌──────────────┐      ┌──────────┐│
│  │ ASK MODE   │              │  PLAN MODE   │      │ EXECUTE  ││
│  │ (Gather    │              │  (Propose    │      │ MODE     ││
│  │  Context)  │──────────────▶│   Approach)  │──────▶│ (Run     ││
│  └────────────┘              └──────────────┘      │ Phases)  ││
│                                                     └──────────┘│
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔍 STAGE 0: INTENT UNDERSTANDING & ROUTING

### **The Intelligence Layer**

Before executing anything, Eames analyzes the query to understand:

```typescript
interface IntentAnalysis {
  // What is the user trying to do?
  intent: 'build_feature' | 'refine_design' | 'generate_prd' | 
          'research' | 'implement_code' | 'deploy' | 'explore_idea';
  
  // How much context do they have?
  contextLevel: 'complete' | 'partial' | 'vague' | 'exploratory';
  
  // What do they expect as output?
  expectedDeliverable: 'research_doc' | 'prd' | 'wireframes' | 
                       'a2ui_spec' | 'code' | 'deployed_app' | 'all';
  
  // Which phases are relevant?
  relevantPhases: Array<'discover' | 'define' | 'design' | 'develop' | 'deliver'>;
  
  // What's missing?
  missingContext: string[];
  
  // Recommended mode
  recommendedMode: 'ask' | 'plan' | 'execute';
  
  // Confidence
  confidence: number; // 0-1
}
```

### **Intent Classification Examples**

| User Query | Intent | Context Level | Recommended Mode | Relevant Phases |
|------------|--------|---------------|------------------|-----------------|
| "Design split-bill feature for students" | `explore_idea` | `vague` | **ASK** → PLAN | All 5 |
| "Build React component from this Figma link" | `implement_code` | `complete` | **EXECUTE** | Develop only |
| "Research competitors for expense tracking" | `research` | `partial` | **ASK** → EXECUTE | Discovery only |
| "Generate PRD for [attached doc]" | `generate_prd` | `partial` | **PLAN** → EXECUTE | Define only |
| "Improve this UI component [code]" | `refine_design` | `complete` | **ASK** → EXECUTE | Design → Develop |
| "I have an idea for an app" | `exploratory` | `vague` | **ASK** → PLAN | Discovery → Define |

---

## 💬 MODE 1: ASK QUESTION MODE

### **Purpose**
Gather missing context through intelligent, clarifying questions before proposing a plan.

### **When to Use**
- Context level is `vague` or `partial`
- User query lacks critical information
- Confidence < 0.7 in intent analysis

### **How It Works**

```typescript
async function askQuestionMode(query: string, intentAnalysis: IntentAnalysis) {
  // Generate 3-5 essential clarifying questions
  const questions = await generateClarifyingQuestions({
    query,
    intent: intentAnalysis.intent,
    missingContext: intentAnalysis.missingContext,
    expectedDeliverable: intentAnalysis.expectedDeliverable
  });
  
  // Present questions to user
  console.log('\n📋 I need some context to build the right thing:\n');
  questions.forEach((q, i) => {
    console.log(`${i + 1}. ${q.question}`);
    console.log(`   ${dim('Why: ' + q.reasoning)}\n`);
  });
  
  // Collect answers
  const answers = await promptUser(questions);
  
  // Synthesize into structured context
  const enrichedContext = await synthesizeContext({
    originalQuery: query,
    questions,
    answers,
    intentAnalysis
  });
  
  // Move to Plan Mode
  return planMode(enrichedContext);
}
```

### **Question Types**

#### **1. Scope Questions**
```
❓ What's the primary goal of this feature?
   Why: Helps me understand success criteria and prioritization

❓ Who are the target users?
   Why: Informs design decisions and UX patterns

❓ What platforms? (Web, Mobile, Both)
   Why: Affects technical approach and design system choices
```

#### **2. Context Questions**
```
❓ Do you have existing research, designs, or specs?
   Why: Avoids duplicating work you've already done

❓ Are there technical constraints? (Stack, APIs, performance)
   Why: Ensures feasible implementation

❓ What's the timeline expectation? (Days, weeks, months)
   Why: Determines depth of research and iteration
```

#### **3. Deliverable Questions**
```
❓ What output do you need? (Research, PRD, Designs, Code, Deployed app)
   Why: Determines which phases to run

❓ Do you want to review at each phase or run end-to-end?
   Why: Sets approval gates vs autonomous execution
```

### **Smart Question Selection**

Eames uses context to ask **only relevant questions**:

```typescript
function selectQuestions(intent: string, contextLevel: string): Question[] {
  if (intent === 'implement_code' && contextLevel === 'complete') {
    // User has spec, just needs code - ask minimal questions
    return [
      { question: 'What testing level do you need? (unit, integration, e2e, all)', category: 'technical' },
      { question: 'Any specific libraries or patterns to use?', category: 'technical' }
    ];
  }
  
  if (intent === 'explore_idea' && contextLevel === 'vague') {
    // User has vague idea - ask comprehensive questions
    return [
      { question: 'What problem are you trying to solve?', category: 'scope' },
      { question: 'Who experiences this problem?', category: 'scope' },
      { question: 'What similar solutions exist?', category: 'context' },
      { question: 'What would success look like?', category: 'scope' },
      { question: 'What level of detail do you need? (concept, detailed spec, production code)', category: 'deliverable' }
    ];
  }
  
  // ... more patterns
}
```

### **Example: Ask Mode in Action**

```
User: "Design split-bill feature"

Eames (Intent Analysis):
  Intent: explore_idea
  Context Level: vague
  Confidence: 0.4
  → Recommended Mode: ASK

Eames (Ask Mode):
📋 I need some context to build the right thing:

1. What's the primary use case for splitting bills?
   Why: Different contexts (restaurants, rent, trips) need different UX

2. Who are the target users?
   Why: College students vs business travelers have different needs

3. Do you have research on existing solutions (Venmo, Splitwise)?
   Why: Avoids reinventing the wheel, builds on proven patterns

4. What platform(s)? (Web, iOS, Android, All)
   Why: Affects design approach and technical feasibility

5. What output do you need? (Research report, PRD, Wireframes, Full app)
   Why: Determines which phases to execute

User answers...

Eames:
✅ Got it! Here's what I understand:
   • Restaurant bill splitting for college students
   • Mobile-first (iOS + Android)
   • Need: Research → PRD → Wireframes → React Native code

Moving to Plan Mode to propose an approach...
```

---

## 📋 MODE 2: PLAN MODE

### **Purpose**
Propose a concrete execution plan with phases, tasks, and approval gates.

### **When to Use**
- After Ask Mode completes (context gathered)
- When user provides partial context upfront
- Confidence > 0.7 in intent analysis

### **How It Works**

```typescript
async function planMode(enrichedContext: EnrichedContext) {
  // Generate execution plan
  const plan = await generateExecutionPlan(enrichedContext);
  
  // Present plan to user
  console.log('\n📐 Proposed Execution Plan:\n');
  console.log(plan.summary);
  console.log('\n🔄 Phases to Execute:\n');
  
  plan.phases.forEach((phase, i) => {
    console.log(`${i + 1}. ${phase.emoji} ${phase.name.toUpperCase()}`);
    console.log(`   Goal: ${phase.goal}`);
    console.log(`   Deliverable: ${phase.deliverable}`);
    console.log(`   Estimated loops: ${phase.estimatedIterations}`);
    console.log(`   Time: ${phase.estimatedTime}\n`);
  });
  
  console.log('\n🛡️ Approval Gates:');
  plan.approvalGates.forEach(gate => {
    console.log(`   • ${gate.phase}: ${gate.description}`);
  });
  
  console.log(`\n💰 Estimated Cost: ${plan.estimatedCost}`);
  console.log(`⏱️ Estimated Time: ${plan.estimatedTotalTime}\n`);
  
  // Get approval
  const approval = await promptUser({
    message: 'Approve this plan?',
    choices: ['Yes, proceed', 'Modify plan', 'Cancel']
  });
  
  if (approval === 'Yes, proceed') {
    return executeMode(plan);
  } else if (approval === 'Modify plan') {
    return modifyPlan(plan);
  }
}
```

### **Plan Structure**

```typescript
interface ExecutionPlan {
  // High-level summary
  summary: string;
  
  // Phases to execute (adaptive!)
  phases: Array<{
    name: 'discover' | 'define' | 'design' | 'develop' | 'deliver';
    emoji: string;
    goal: string;
    deliverable: string;
    tasks: Array<{
      description: string;
      completionCriteria: string;
    }>;
    tools: string[];
    estimatedIterations: number;
    estimatedTime: string;
    dependencies: string[]; // Which phases must complete first
  }>;
  
  // Where to pause for human review
  approvalGates: Array<{
    phase: string;
    description: string;
    required: boolean; // true = must approve, false = optional
  }>;
  
  // Cost/time estimates
  estimatedCost: string;
  estimatedTotalTime: string;
  
  // Alternative approaches
  alternatives?: Array<{
    approach: string;
    tradeoffs: string;
  }>;
}
```

### **Example: Plan Mode in Action**

```
Eames (Plan Mode):
📐 Proposed Execution Plan:

Based on your answers, I'll design a mobile-first bill-splitting feature for 
college students, targeting restaurants and group outings. Here's my approach:

🔄 Phases to Execute:

1. 🔍 DISCOVERY
   Goal: Research existing solutions and user pain points
   Deliverable: Competitive analysis + User insights document
   Tasks:
     • Analyze Venmo, Splitwise, Tab split features
     • Extract UX patterns and user feedback
     • Identify gaps and opportunities
   Completion: <promise>RESEARCH_COMPLETE</promise>
   Estimated loops: 3-5 iterations
   Time: ~30 minutes

2. 📋 DEFINE
   Goal: Generate product requirements
   Deliverable: PRD with user stories + acceptance criteria
   Tasks:
     • Define Jobs-to-be-Done for bill splitting
     • Create user stories (As a student, I want...)
     • Specify success metrics
   Completion: <promise>PRD_COMPLETE</promise>
   Estimated loops: 2-4 iterations
   Time: ~20 minutes

3. 🎨 DESIGN
   Goal: Create mobile wireframes and component specs
   Deliverable: A2UI specification + Accessibility audit
   Tasks:
     • Design bill entry flow
     • Design split calculation UI
     • Design payment confirmation
     • Generate A2UI JSON spec
     • Validate WCAG AA compliance
   Completion: <promise>DESIGN_COMPLETE</promise>
   Estimated loops: 4-6 iterations
   Time: ~45 minutes

4. ⚙️ DEVELOP
   Goal: Generate React Native components with tests
   Deliverable: Production-ready code (tests passing, typed, linted)
   Tasks:
     • Generate React Native components
     • Generate unit tests (>80% coverage)
     • Type-check with TypeScript
     • Lint with ESLint
     • Create Storybook stories
   Completion: <promise>CODE_COMPLETE</promise>
   Estimated loops: 10-15 iterations (Ralph loop)
   Time: ~2 hours

5. 🚀 DELIVER
   Goal: Deploy to staging and production
   Deliverable: Live app + GitHub repo
   Tasks:
     • Create GitHub repository
     • Set up CI/CD (GitHub Actions)
     • Deploy to Expo staging
     • Deploy to Expo production
   Completion: <promise>DEPLOYED</promise>
   Estimated loops: 3-5 iterations
   Time: ~30 minutes

🛡️ Approval Gates:
   • After DISCOVERY: Review research insights (required)
   • After DEFINE: Approve PRD (required)
   • After DESIGN: Review wireframes and A2UI spec (required)
   • After DEVELOP: Review code (optional - you can skip)
   • After DELIVER: Final deployment approval (required)

💰 Estimated Cost: $12-18 (API usage)
⏱️ Estimated Time: 4-5 hours total (mostly autonomous)

🔄 Alternative Approaches:
   1. Skip Discovery (use my existing design knowledge)
      Tradeoff: Faster (save 30min) but less informed by real user data
   
   2. Design only (no code implementation)
      Tradeoff: Much cheaper/faster, but you'll need to code manually
   
   3. Code from existing spec (skip Discovery/Define/Design)
      Tradeoff: Fastest if you already have designs

Approve this plan? (Yes / Modify / Cancel)
```

### **Plan Modification**

If user chooses "Modify plan":

```typescript
async function modifyPlan(plan: ExecutionPlan) {
  console.log('\n✏️ What would you like to change?\n');
  console.log('1. Skip phases (e.g., "Skip Discovery")');
  console.log('2. Add approval gates');
  console.log('3. Remove approval gates (run more autonomously)');
  console.log('4. Adjust scope (e.g., "Just wireframes, no code")');
  console.log('5. Start from different phase');
  
  const modification = await promptUser({ message: 'Choose modification:' });
  
  // Apply modifications
  const modifiedPlan = await applyModifications(plan, modification);
  
  // Show updated plan
  return planMode({ plan: modifiedPlan });
}
```

---

## ⚡ MODE 3: EXECUTE MODE

### **Purpose**
Run the approved plan with adaptive phase routing and Ralph loops.

### **How It Works**

```typescript
async function executeMode(plan: ExecutionPlan) {
  console.log('\n🚀 Starting execution...\n');
  
  const results: Record<string, any> = {};
  
  for (const phase of plan.phases) {
    console.log(`\n$${phase.emoji} ${phase.name.toUpperCase()} PHASE`);
    console.log(`Goal: ${phase.goal}\n`);
    
    // Execute phase with Ralph loop
    const result = await executePhaseWithRalphLoop(phase, results);
    
    // Store result for next phase
    results[phase.name] = result;
    
    // Check approval gate
    const gate = plan.approvalGates.find(g => g.phase === phase.name);
    if (gate) {
      console.log(`\n🛡️ Approval Gate: ${gate.description}`);
      
      if (gate.required) {
        const approved = await reviewAndApprove(result);
        if (!approved) {
          console.log('❌ Execution stopped by user');
          return;
        }
      }
    }
    
    console.log(`✅ ${phase.name} complete: ${result.completion}`);
  }
  
  console.log('\n🎉 All phases complete!');
  return results;
}
```

### **Adaptive Phase Routing**

Phases can run in **any order** based on dependencies:

```typescript
function buildPhaseGraph(phases: Phase[]): DAG {
  const graph = new DirectedAcyclicGraph();
  
  phases.forEach(phase => {
    graph.addNode(phase.name);
    
    // Add dependency edges
    phase.dependencies.forEach(dep => {
      graph.addEdge(dep, phase.name);
    });
  });
  
  return graph;
}

// Topologically sort to determine execution order
const executionOrder = topologicalSort(buildPhaseGraph(plan.phases));

// Example outputs:
// Full pipeline: [discover, define, design, develop, deliver]
// Code only: [develop, deliver]
// Research + PRD: [discover, define]
// Redesign existing: [design, develop]
```

### **Ralph Loop in Each Phase**

Every phase uses the Ralph loop pattern:

```typescript
async function executePhaseWithRalphLoop(
  phase: Phase,
  previousResults: Record<string, any>
): Promise<PhaseResult> {
  const MAX_ITERATIONS = phase.estimatedIterations * 2; // Safety margin
  let iteration = 0;
  
  const completionCriteria = buildCompletionCriteria(phase.tasks);
  
  while (iteration < MAX_ITERATIONS) {
    iteration++;
    console.log(`\n  ↻ Iteration ${iteration}/${MAX_ITERATIONS}`);
    
    // Execute phase with Eames Brain prompts
    const systemPrompt = buildContextualPrompt({
      designPhase: phase.name,
      previousResults,
      completionCriteria
    });
    
    const result = await llm.invoke({
      systemPrompt,
      userPrompt: phase.goal,
      tools: phase.tools
    });
    
    // Check completion
    const completion = await checkCompletion(result, completionCriteria);
    
    if (completion.allCriteriaMet) {
      console.log(`  ✓ All criteria met`);
      return {
        phase: phase.name,
        result,
        iterations: iteration,
        completion: completion.message
      };
    }
    
    // Update criteria for next iteration
    completionCriteria.forEach((criterion, i) => {
      if (completion.metCriteria.includes(i)) {
        criterion.met = true;
      }
    });
    
    // Log progress
    console.log(`  Progress: ${completion.progress}`);
    await logToMemory(phase.name, iteration, completion.progress);
  }
  
  throw new Error(`${phase.name} phase did not complete within iteration limit`);
}
```

---

## 🧠 EAMES BRAIN: THE INTELLIGENCE LAYER

### **Contextual System Prompt Composition**

The Brain adapts prompts based on:
1. **Design phase** (which frameworks to load)
2. **User context** (their skill level, industry)
3. **Query type** (exploratory vs specific)
4. **Deliverable** (research vs code)

```typescript
// src/agent/eames-brain.ts
export function buildContextualPrompt(context: PromptContext): string {
  // Always include core behavioral principles
  let prompt = CORE_BEHAVIORAL_PRINCIPLES; // ~2k tokens
  
  // Add phase-specific intelligence
  switch (context.designPhase) {
    case 'discover':
      prompt += UX_RESEARCH_METHODS; // ~3k tokens
      prompt += COMPETITIVE_ANALYSIS_FRAMEWORK; // ~2k tokens
      if (context.queryType === 'user_research') {
        prompt += JTBD_INTERVIEW_GUIDE; // ~2k tokens
      }
      break;
      
    case 'define':
      prompt += JTBD_FRAMEWORK; // ~2k tokens
      prompt += PRD_TEMPLATE; // ~3k tokens
      prompt += USER_STORY_PATTERNS; // ~2k tokens
      break;
      
    case 'design':
      prompt += DESIGN_SYSTEM_PRINCIPLES; // ~4k tokens
      prompt += A2UI_GENERATION_GUIDE; // ~3k tokens
      prompt += ACCESSIBILITY_CHECKLIST; // ~2k tokens
      if (context.platform === 'mobile') {
        prompt += MOBILE_UX_PATTERNS; // ~2k tokens
      }
      break;
      
    case 'develop':
      prompt += RALPH_WIGGUM_TDD_PATTERN; // ~2k tokens
      prompt += CODE_QUALITY_STANDARDS; // ~2k tokens
      break;
      
    case 'deliver':
      prompt += DEPLOYMENT_BEST_PRACTICES; // ~2k tokens
      prompt += CI_CD_PATTERNS; // ~2k tokens
      break;
  }
  
  // Add tool-specific guidance (lazy loaded)
  context.tools.forEach(tool => {
    prompt += TOOL_GUIDES[tool]; // ~1-2k each
  });
  
  // Add previous results for continuity
  if (context.previousResults) {
    prompt += `\n\n## CONTEXT FROM PREVIOUS PHASES:\n\n`;
    Object.entries(context.previousResults).forEach(([phase, result]) => {
      prompt += `### ${phase}:\n${summarize(result)}\n\n`;
    });
  }
  
  return prompt;
}
```

### **Token Budget Management**

| Layer | Tokens | When Loaded |
|-------|--------|-------------|
| Core principles | 2k | Always |
| Phase-specific frameworks | 3-10k | Per phase |
| Tool-specific guidance | 1-2k per tool | When tool is used |
| Previous phase context | 2-5k | When phases are chained |
| **Max per iteration** | **~20k** | vs 134k naive approach |

---

## 🎯 EXAMPLE FLOWS

### **Flow 1: Vague Idea → Full Implementation**

```
User: "I have an idea for an app"

Eames (Intent Analysis):
  Intent: exploratory
  Context: vague
  Confidence: 0.3
  → Route to: ASK MODE

Eames: "📋 Let's explore your idea. A few questions:
  1. What problem are you trying to solve?
  2. Who would use this?
  3. What inspired this idea?"

User: (answers...)

Eames (Plan Mode):
  "📐 Great! I'll help you build a [X] for [Y]. Here's the plan:
   • Discovery (research competitors, validate problem)
   • Define (write PRD, user stories)
   • Design (wireframes, A2UI specs)
   • Develop (React code, tests)
   • Deliver (deploy to Netlify)
   
   Approval gates after each phase. ~5 hours total.
   Approve?"

User: "Yes"

Eames (Execute Mode):
  [Runs all 5 phases with Ralph loops]
  [Pauses at each gate for approval]
  
Result: ✅ Deployed app + GitHub repo + Live URL
```

---

### **Flow 2: Code from Existing Spec**

```
User: "Build React component from this Figma link: [URL]"

Eames (Intent Analysis):
  Intent: implement_code
  Context: complete
  Confidence: 0.9
  → Route to: PLAN MODE (minimal questions)

Eames (Plan Mode):
  "📐 I'll generate React code from your Figma design.
   
   Phases:
   • Design (extract A2UI spec from Figma)
   • Develop (generate code + tests)
   
   Skip Discovery/Define since you have specs.
   ~1 hour. Approve?"

User: "Yes"

Eames (Execute Mode):
  [Runs Design → Develop only]
  
Result: ✅ React component + tests + Storybook
```

---

### **Flow 3: Research Only**

```
User: "Research competitors for expense tracking apps"

Eames (Intent Analysis):
  Intent: research
  Context: partial
  Confidence: 0.8
  → Route to: ASK MODE → PLAN MODE

Eames (Ask Mode):
  "📋 Quick questions:
   1. Specific features to analyze? (All / Specific)
   2. Target audience? (General / Specific demographic)
   3. Output format? (Report / PRD section / Raw data)"

User: (answers)

Eames (Plan Mode):
  "📐 I'll research 5-7 expense tracking apps.
   
   Phases:
   • Discovery only
   
   Deliverable: Competitive analysis document
   ~30 minutes. Approve?"

User: "Yes"

Eames (Execute Mode):
  [Runs Discovery phase only with Ralph loop]
  
Result: ✅ Competitive analysis markdown doc
```

---

### **Flow 4: Iterative Design Refinement**

```
User: "Improve this checkout flow [attached wireframes]"

Eames (Intent Analysis):
  Intent: refine_design
  Context: partial
  Confidence: 0.7
  → Route to: ASK MODE

Eames (Ask Mode):
  "📋 What's the main issue with current checkout?
   1. Too many steps?
   2. Confusing UI?
   3. Accessibility problems?
   4. Mobile experience?
   5. All of the above?"

User: "Too many steps + mobile is bad"

Eames (Plan Mode):
  "📐 I'll optimize your checkout flow.
   
   Phases:
   • Discovery (analyze current flow, identify friction)
   • Design (streamlined flow, mobile-first)
   • Develop (if you want code, optional)
   
   ~1 hour. Want code too or just designs?"

User: "Just designs for now"

Eames (Execute Mode):
  [Runs Discovery → Design with Ralph loops]
  [Pauses after each phase for feedback]
  
Result: ✅ Optimized wireframes + A2UI spec
```

---

## 🏗️ IMPLEMENTATION ROADMAP

### **Week 1-2: Intent Understanding + Routing**

**Goal:** Stage 0 working with basic routing

**Files to create:**
```
src/agent/
├── intent-analyzer.ts     # Query analysis
├── context-assessor.ts    # Determine context level
├── mode-router.ts         # Route to ask/plan/execute
└── types/
    └── intent.ts          # TypeScript interfaces
```

**Success criteria:**
- Query → Intent analysis → Mode recommendation
- Test with 20+ example queries
- Confidence scores calibrated

---

### **Week 3-4: Ask Question Mode**

**Goal:** Smart question generation based on intent

**Files to create:**
```
src/modes/
├── ask-mode.ts           # Question generation
├── question-types.ts     # Question templates
└── context-synthesis.ts  # Convert answers → context
```

**Success criteria:**
- Generates 3-5 relevant questions max
- Adapts questions based on intent
- Synthesizes structured context

---

### **Week 5-6: Plan Mode**

**Goal:** Generate execution plans with cost/time estimates

**Files to create:**
```
src/modes/
├── plan-mode.ts          # Plan generation
├── plan-types.ts         # Plan structure
├── phase-selector.ts     # Adaptive phase routing
└── cost-estimator.ts     # Token/cost estimates
```

**Success criteria:**
- Plans show only relevant phases
- Cost/time estimates accurate ±20%
- Approval gate placement makes sense

---

### **Week 7-8: Execute Mode + Adaptive Routing**

**Goal:** Run plans with Ralph loops in each phase

**Files to create:**
```
src/modes/
├── execute-mode.ts       # Plan execution
├── phase-executor.ts     # Phase with Ralph loop
├── approval-gates.ts     # Review & approval
└── dependency-graph.ts   # Phase DAG
```

**Success criteria:**
- Phases run in correct order
- Ralph loops work in each phase
- Approval gates pause execution

---

### **Week 9-10: Eames Brain Enhancement**

**Goal:** Contextual prompt composition working

**Files to create:**
```
src/agent/
├── eames-brain.ts            # Main prompt composer
├── design-frameworks.ts      # Double Diamond, JTBD
├── product-strategy.ts       # RICE, Value Prop
└── prompts/
    ├── core-principles.ts    # Always loaded
    ├── phase-prompts.ts      # Phase-specific
    └── tool-guides.ts        # Tool-specific
```

**Success criteria:**
- Token usage < 20k per iteration
- Prompts reference frameworks
- Output quality measurably better

---

### **Week 11-12: Integration + Testing**

**Goal:** End-to-end flows working

**Tests:**
- Vague idea → full implementation
- Code from spec
- Research only
- Design refinement
- PRD generation

**Success criteria:**
- All flows complete successfully
- User can modify plans
- Approval gates work correctly

---

### **Week 13-16: A2UI Integration (Optional)**

**Goal:** Design phase outputs real A2UI specs

**Files to create:**
```
src/tools/
├── a2ui-generator.ts     # Generate A2UI JSON
├── a2ui-validator.ts     # Validate spec
└── component-mapper.ts   # Map to shadcn
```

**Success criteria:**
- Valid A2UI JSON generated
- Ready for web rendering

---

## 📊 CONFIGURATION

### **Intent Confidence Thresholds**

```typescript
// src/config/thresholds.ts
export const INTENT_THRESHOLDS = {
  // High confidence - skip ask mode
  EXECUTE_DIRECTLY: 0.9,
  
  // Medium confidence - plan mode
  PLAN_MODE: 0.7,
  
  // Low confidence - ask mode first
  ASK_MODE: 0.7,
  
  // Very low - extensive clarification
  EXTENSIVE_ASK: 0.4
};
```

### **Phase Configuration**

```typescript
// src/config/phases.ts
export const PHASE_CONFIG = {
  discover: {
    maxIterations: 10,
    estimatedTime: '30min',
    completionCriteria: [
      'Competitor analysis complete',
      'User research synthesized',
      'Pain points identified',
      'Opportunity areas documented'
    ]
  },
  define: {
    maxIterations: 8,
    estimatedTime: '20min',
    completionCriteria: [
      'PRD generated',
      'User stories defined',
      'Acceptance criteria testable',
      'Success metrics specified'
    ]
  },
  design: {
    maxIterations: 12,
    estimatedTime: '45min',
    completionCriteria: [
      'Wireframes generated',
      'A2UI spec valid',
      'Component catalog mapped',
      'Accessibility WCAG AA',
      'Design tokens defined'
    ]
  },
  develop: {
    maxIterations: 30,
    estimatedTime: '2hr',
    completionCriteria: [
      'Code generated',
      'Tests passing (>80% coverage)',
      'Type-safe (tsc --noEmit)',
      'Linter clean (eslint)',
      'Storybook stories created'
    ]
  },
  deliver: {
    maxIterations: 10,
    estimatedTime: '30min',
    completionCriteria: [
      'GitHub repo created',
      'PR submitted',
      'CI/CD passing',
      'Deployed to staging',
      'Deployed to production'
    ]
  }
};
```

---

## 🎯 SUCCESS METRICS

### **User Experience**
- Users can start with vague ideas (not just specs)
- Plans feel intelligent (not rigid pipelines)
- Questions are relevant (not generic)
- Approval gates are sensible (not annoying)

### **Technical**
- Token usage < 20k per phase
- Cost estimates accurate ±20%
- Time estimates accurate ±30%
- 90%+ of queries route correctly

### **Output Quality**
- Designs reference frameworks (not generic)
- Code passes tests first time (not iteration waste)
- Research is actionable (not data dump)
- PRDs are complete (not missing sections)

---

## 🚀 IMMEDIATE NEXT STEPS

### **This Week**

1. **Implement Intent Analyzer** (`src/agent/intent-analyzer.ts`)
   - Query classification
   - Context level assessment
   - Confidence scoring

2. **Create Ask Mode Prototype** (`src/modes/ask-mode.ts`)
   - Question generation for 5 intent types
   - Answer collection
   - Context synthesis

3. **Test with Real Queries**
   - Run 20+ example queries
   - Validate routing decisions
   - Tune confidence thresholds

### **Success Checkpoint**

After Week 2, you should be able to:

```bash
bun start "Design split-bill feature"

# Eames analyzes query
# Routes to Ask Mode
# Asks 3-5 relevant questions
# Proposes plan
# (Execute mode comes later)
```

---

## 💡 KEY TAKEAWAYS

1. **Not all tasks need all phases** - Adaptive routing is critical
2. **Ask before executing** - Context gathering prevents waste
3. **Plans are proposals** - Users approve/modify before execution
4. **Ralph loops in every phase** - Iteration is universal, not code-specific
5. **Intelligence comes from the Brain** - Contextual prompts, not hardcoded logic

---

## 📚 RELATED DOCUMENTS

- `EAMES_SYSTEM_PROMPT_ARCHITECTURE.md` - Prompt design patterns
- `ralph-wiggum-agentic-coding-playbook.md` - Ralph loop mechanics
- `The Agentic UI Stack.md` - A2UI/AG-UI protocols
- `EAMES_VISION_ROADMAP.md` - Long-term product vision

---

**Last Updated:** 2026-01-18  
**Version:** 2.0.0  
**Status:** Strategic Architecture - Ready for Implementation
