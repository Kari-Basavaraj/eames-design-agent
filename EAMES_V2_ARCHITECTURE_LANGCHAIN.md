# EAMES V2.0 ARCHITECTURE - LANGCHAIN VERSION
## Multi-Provider Orchestration with Design Intelligence

**Version:** 2.0.0-langchain  
**Branch:** `langchain`  
**Date:** 2026-01-18  
**Status:** Strategic Architecture

---

## 🎯 LANGCHAIN VERSION FOCUS

**Core Strengths:**
- ✅ **Multi-provider LLM support** (Claude, OpenAI, Gemini, Perplexity)
- ✅ **LLM Council pattern** (specialized agents with different models)
- ✅ **Flexible orchestration** (LangGraph workflows)
- ✅ **Vector memory** (Pinecone, Weaviate, Chroma integration)
- ✅ **Rich tool ecosystem** (LangChain tools, MCP servers)
- ✅ **Streaming support** (real-time progress)

**Use Case:**
Production-grade CLI that needs flexibility, multi-model council, and rich integrations.

---

## 🏗️ ARCHITECTURE OVERVIEW

```
┌─────────────────────────────────────────────────────────────────┐
│            EAMES V2.0 - LANGCHAIN ARCHITECTURE                  │
│         Intelligent · Adaptive · Multi-Provider                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  USER INPUT: "Design split-bill feature"                       │
│      │                                                          │
│      ▼                                                          │
│  ┌──────────────────────────────────────────────────┐          │
│  │   STAGE 0: INTENT UNDERSTANDING (LLM Router)     │          │
│  │   Model: Claude 3.5 Sonnet (fast, cheap)        │          │
│  └──────────────────────────────────────────────────┘          │
│      │                                                          │
│      ├─► Analyze query (intent, context, deliverable)          │
│      ├─► Route to mode (ask/plan/execute)                      │
│      └─► Select relevant Council members                       │
│                                                                 │
│      ▼                                                          │
│  ┌──────────────────────────────────────────────────┐          │
│  │         LLM COUNCIL (Multi-Model Strategy)       │          │
│  └──────────────────────────────────────────────────┘          │
│      │                                                          │
│      ├─► CHAIR (Orchestrator)                                  │
│      │   Model: Claude 3.5 Sonnet                              │
│      │   Role: Manages conversation, routes to specialists    │
│      │                                                          │
│      ├─► STRATEGIST (Deep Reasoning)                           │
│      │   Model: OpenAI o1 / o3                                 │
│      │   Role: PRD review, business viability, logic          │
│      │                                                          │
│      ├─► VISIONARY (Creative Direction)                        │
│      │   Model: Claude 3 Opus                                  │
│      │   Role: Brand, empathy, copy voice, vibe check         │
│      │                                                          │
│      ├─► ARCHITECT (Technical Excellence)                      │
│      │   Model: Claude 3.5 Sonnet                              │
│      │   Role: React/A2UI code generation                      │
│      │                                                          │
│      ├─► ANALYST (Research)                                    │
│      │   Model: Perplexity / Tavily + Claude                   │
│      │   Role: Competitor analysis, market trends              │
│      │                                                          │
│      └─► CRITIC (Quality Assurance)                            │
│          Model: Gemini 1.5 Pro (2M context)                    │
│          Role: End-user simulation, history review             │
│                                                                 │
│      ▼                                                          │
│  ┌──────────────────────────────────────────────────┐          │
│  │              EAMES BRAIN (Prompt Layer)          │          │
│  │  - Design frameworks (Double Diamond, JTBD)      │          │
│  │  - Product strategy (RICE, Value Prop Canvas)    │          │
│  │  - Contextual prompt composition                 │          │
│  └──────────────────────────────────────────────────┘          │
│                                                                 │
│      ▼                                                          │
│  ┌──────────────────────────────────────────────────┐          │
│  │          THREE INTELLIGENT MODES                 │          │
│  │                                                  │          │
│  │  ASK MODE → PLAN MODE → EXECUTE MODE             │          │
│  │                                                  │          │
│  │  (Each mode uses Council members as needed)      │          │
│  └──────────────────────────────────────────────────┘          │
│                                                                 │
│      ▼                                                          │
│  ┌──────────────────────────────────────────────────┐          │
│  │      5-PHASE DESIGN LIFECYCLE (Adaptive)         │          │
│  │                                                  │          │
│  │  Discovery → Define → Design → Develop → Deliver │          │
│  │                                                  │          │
│  │  (Each phase uses Ralph Loop + Council)          │          │
│  └──────────────────────────────────────────────────┘          │
│                                                                 │
│  ┌──────────────────────────────────────────────────┐          │
│  │         MEMORY & INTEGRATIONS                    │          │
│  │                                                  │          │
│  │  • MCP Memory (entities, relations, graph)       │          │
│  │  • Linear (project management)                   │          │
│  │  • Notion (documentation)                        │          │
│  │  • Vector stores (Pinecone, Weaviate, Chroma)    │          │
│  │  • LangSmith (observability)                     │          │
│  └──────────────────────────────────────────────────┘          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🧠 LLM COUNCIL ARCHITECTURE

### **The Design Firm Model**

Each Council member is a specialist with the optimal model for their role:

```typescript
// src/agent/council/council.ts
interface CouncilMember {
  role: 'chair' | 'strategist' | 'visionary' | 'architect' | 'analyst' | 'critic';
  persona: string;
  model: string;
  provider: 'anthropic' | 'openai' | 'google' | 'perplexity';
  temperature: number;
  maxTokens: number;
  responsibilities: string[];
}

export const COUNCIL: Record<string, CouncilMember> = {
  chair: {
    role: 'chair',
    persona: 'Product VP',
    model: 'claude-3-5-sonnet-20241022',
    provider: 'anthropic',
    temperature: 0.7,
    maxTokens: 4096,
    responsibilities: [
      'Orchestrate conversation flow',
      'Route to specialist agents',
      'Maintain Eames identity',
      'Synthesize multi-agent outputs'
    ]
  },
  
  strategist: {
    role: 'strategist',
    persona: 'Product Director',
    model: 'o1-preview', // or 'o3' when available
    provider: 'openai',
    temperature: 1.0, // o1 controls its own temperature
    maxTokens: 32000,
    responsibilities: [
      'Deep reasoning on PRDs',
      'Business viability analysis',
      'Identify logical fallacies',
      'Strategic alignment checks'
    ]
  },
  
  visionary: {
    role: 'visionary',
    persona: 'Creative Director',
    model: 'claude-3-opus-20240229',
    provider: 'anthropic',
    temperature: 0.9,
    maxTokens: 4096,
    responsibilities: [
      'Brand alignment',
      'Copy voice and tone',
      'Empathy and user psychology',
      'Design "vibe check"'
    ]
  },
  
  architect: {
    role: 'architect',
    persona: 'Staff Engineer',
    model: 'claude-3-5-sonnet-20241022',
    provider: 'anthropic',
    temperature: 0.3,
    maxTokens: 8192,
    responsibilities: [
      'React/TypeScript code generation',
      'A2UI spec creation',
      'Technical architecture',
      'Code quality and best practices'
    ]
  },
  
  analyst: {
    role: 'analyst',
    persona: 'Researcher',
    model: 'sonar-pro', // Perplexity
    provider: 'perplexity',
    temperature: 0.5,
    maxTokens: 4096,
    responsibilities: [
      'Live web research',
      'Competitor analysis',
      'Market trend synthesis',
      'Data gathering and citations'
    ]
  },
  
  critic: {
    role: 'critic',
    persona: 'QA / End User',
    model: 'gemini-1.5-pro-002',
    provider: 'google',
    temperature: 0.7,
    maxTokens: 8192,
    responsibilities: [
      'End-user simulation',
      'PRD review with full context',
      'Quality assurance',
      'Historical consistency checks'
    ]
  }
};
```

### **Council Coordination Patterns**

#### **Pattern 1: Sequential Consultation**
```typescript
// Used in Plan Mode - each specialist reviews in order
async function sequentialConsultation(query: string) {
  // 1. Analyst gathers research
  const research = await council.analyst.invoke({ query });
  
  // 2. Strategist reviews for viability
  const strategy = await council.strategist.invoke({ 
    query, 
    context: research 
  });
  
  // 3. Visionary checks brand alignment
  const vision = await council.visionary.invoke({ 
    query, 
    context: { research, strategy } 
  });
  
  // 4. Chair synthesizes
  return council.chair.synthesize([research, strategy, vision]);
}
```

#### **Pattern 2: Parallel Consensus**
```typescript
// Used in Execute Mode - multiple agents work simultaneously
async function parallelConsensus(task: Task) {
  // Execute in parallel
  const [arcResult, critResult] = await Promise.all([
    council.architect.execute(task),
    council.critic.review(task)
  ]);
  
  // Resolve conflicts
  if (arcResult.conflicts(critResult)) {
    return council.chair.mediate(arcResult, critResult);
  }
  
  return arcResult;
}
```

#### **Pattern 3: Peer Review**
```typescript
// Used in quality gates - one agent reviews another's work
async function peerReview(output: AgentOutput) {
  // Architect creates design
  const design = await council.architect.design(output);
  
  // Visionary reviews aesthetic
  const aesthetic = await council.visionary.review(design);
  
  // Critic reviews usability
  const usability = await council.critic.review(design);
  
  // Iterate if needed
  if (!aesthetic.approved || !usability.approved) {
    return peerReview(refinedOutput);
  }
  
  return design;
}
```

---

## 🔄 LANGCHAIN-SPECIFIC FEATURES

### **1. LangGraph Workflows**

```typescript
// src/agent/workflows/design-workflow.ts
import { StateGraph, END } from '@langchain/langgraph';

interface WorkflowState {
  query: string;
  intent: IntentAnalysis;
  context: EnrichedContext;
  plan: ExecutionPlan;
  results: Record<string, any>;
  currentPhase: string;
}

const workflow = new StateGraph<WorkflowState>({
  channels: {
    query: null,
    intent: null,
    context: null,
    plan: null,
    results: null,
    currentPhase: null
  }
});

// Define nodes
workflow.addNode('analyze_intent', analyzeIntentNode);
workflow.addNode('ask_questions', askQuestionsNode);
workflow.addNode('generate_plan', generatePlanNode);
workflow.addNode('execute_discovery', executeDiscoveryNode);
workflow.addNode('execute_define', executeDefineNode);
workflow.addNode('execute_design', executeDesignNode);
workflow.addNode('execute_develop', executeDevelopNode);
workflow.addNode('execute_deliver', executeDeliverNode);

// Define edges (routing logic)
workflow.addEdge('analyze_intent', 'ask_questions');
workflow.addConditionalEdges(
  'ask_questions',
  (state) => state.context.complete ? 'generate_plan' : 'ask_questions'
);
workflow.addConditionalEdges(
  'generate_plan',
  routeToPhase, // Smart routing based on plan
  {
    discover: 'execute_discovery',
    define: 'execute_define',
    design: 'execute_design',
    develop: 'execute_develop',
    deliver: 'execute_deliver'
  }
);

workflow.setEntryPoint('analyze_intent');

export const designWorkflow = workflow.compile();
```

### **2. Multi-Provider Support**

```typescript
// src/model/providers.ts
import { ChatAnthropic } from '@langchain/anthropic';
import { ChatOpenAI } from '@langchain/openai';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { PerplexityChat } from '@langchain/community/chat_models/perplexity';

export function getModelForRole(role: CouncilRole): BaseChatModel {
  const member = COUNCIL[role];
  
  switch (member.provider) {
    case 'anthropic':
      return new ChatAnthropic({
        model: member.model,
        temperature: member.temperature,
        maxTokens: member.maxTokens,
        streaming: true
      });
      
    case 'openai':
      return new ChatOpenAI({
        model: member.model,
        temperature: member.temperature,
        maxTokens: member.maxTokens,
        streaming: true
      });
      
    case 'google':
      return new ChatGoogleGenerativeAI({
        model: member.model,
        temperature: member.temperature,
        maxTokens: member.maxTokens
      });
      
    case 'perplexity':
      return new PerplexityChat({
        model: member.model,
        temperature: member.temperature,
        maxTokens: member.maxTokens
      });
      
    default:
      throw new Error(`Unknown provider: ${member.provider}`);
  }
}
```

### **3. Vector Memory Integration**

```typescript
// src/memory/vector-store.ts
import { PineconeStore } from '@langchain/pinecone';
import { OpenAIEmbeddings } from '@langchain/openai';

export async function initializeVectorMemory() {
  const embeddings = new OpenAIEmbeddings({
    model: 'text-embedding-3-small'
  });
  
  const vectorStore = await PineconeStore.fromExistingIndex(embeddings, {
    pineconeIndex: pineconeClient.Index('eames-memory'),
    namespace: 'design-knowledge'
  });
  
  return vectorStore;
}

// Retrieve relevant design patterns
export async function retrieveDesignPatterns(query: string) {
  const results = await vectorStore.similaritySearch(query, 5);
  
  return results.map(doc => ({
    pattern: doc.pageContent,
    metadata: doc.metadata,
    relevance: doc.score
  }));
}
```

### **4. LangSmith Observability**

```typescript
// src/utils/observability.ts
import { Client } from 'langsmith';

const langsmith = new Client({
  apiKey: process.env.LANGSMITH_API_KEY
});

export async function traceCouncilSession(sessionId: string) {
  return langsmith.createRun({
    name: 'council-session',
    runType: 'chain',
    inputs: { sessionId },
    tags: ['council', 'multi-agent']
  });
}

// Track each Council member's contribution
export async function trackCouncilMember(
  role: string,
  input: any,
  output: any,
  parentRun: string
) {
  return langsmith.createRun({
    name: `council-${role}`,
    runType: 'llm',
    inputs: input,
    outputs: output,
    parentRunId: parentRun,
    tags: [role, 'council-member']
  });
}
```

---

## 📋 THREE MODES WITH COUNCIL

### **ASK MODE (Clarification Loop)**

**Council Members Used:**
- **Chair**: Orchestrates questions
- **Strategist**: Identifies strategic gaps
- **Analyst**: Provides market context

```typescript
async function askMode(query: string, intentAnalysis: IntentAnalysis) {
  // Chair identifies what's missing
  const missingContext = await council.chair.analyzeMissingContext({
    query,
    intent: intentAnalysis
  });
  
  // Strategist suggests strategic questions
  const strategicQuestions = await council.strategist.generateQuestions({
    query,
    missingContext,
    businessContext: true
  });
  
  // Analyst provides market context for questions
  const marketContext = await council.analyst.gatherContext(query);
  
  // Chair synthesizes 3-5 questions
  const questions = await council.chair.synthesizeQuestions({
    missingContext,
    strategicQuestions,
    marketContext,
    maxQuestions: 5
  });
  
  // Present to user
  console.log('\n📋 I need context to build the right thing:\n');
  questions.forEach((q, i) => {
    console.log(`${i + 1}. ${q.question}`);
    console.log(`   ${dim('Why: ' + q.reasoning)}\n`);
  });
  
  // Collect answers and synthesize
  const answers = await promptUser(questions);
  const enrichedContext = await council.chair.synthesizeContext({
    query,
    questions,
    answers,
    intentAnalysis
  });
  
  return planMode(enrichedContext);
}
```

---

### **PLAN MODE (Council Review)**

**Council Members Used:**
- **Analyst**: Research and data
- **Strategist**: Business viability
- **Visionary**: Brand alignment
- **Architect**: Technical feasibility
- **Chair**: Synthesis and presentation

```typescript
async function planMode(enrichedContext: EnrichedContext) {
  // Parallel council session
  const [research, strategy, vision, technical] = await Promise.all([
    council.analyst.research(enrichedContext.query),
    council.strategist.analyze(enrichedContext),
    council.visionary.review(enrichedContext),
    council.architect.assess(enrichedContext)
  ]);
  
  // Chair synthesizes into execution plan
  const plan = await council.chair.generateExecutionPlan({
    context: enrichedContext,
    research,
    strategy,
    vision,
    technical
  });
  
  // Present plan with Council insights
  console.log('\n📐 Proposed Execution Plan:\n');
  console.log(plan.summary);
  
  console.log('\n💡 Council Insights:\n');
  console.log(`  Strategist: ${strategy.recommendation}`);
  console.log(`  Visionary: ${vision.brandAlignment}`);
  console.log(`  Architect: ${technical.feasibility}`);
  
  // ... rest of plan presentation
  
  const approval = await promptUser({
    message: 'Approve this plan?',
    choices: ['Yes', 'Modify', 'Cancel']
  });
  
  if (approval === 'Yes') {
    return executeMode(plan);
  }
}
```

---

### **EXECUTE MODE (Ralph Loop + Council)**

**Council Members Used:**
- **All members** based on phase
- **Critic** reviews at approval gates

```typescript
async function executePhaseWithCouncil(
  phase: Phase,
  previousResults: Record<string, any>
): Promise<PhaseResult> {
  const MAX_ITERATIONS = phase.estimatedIterations * 2;
  let iteration = 0;
  
  // Select Council member for this phase
  const primaryAgent = selectAgentForPhase(phase.name);
  const reviewerAgent = council.critic;
  
  while (iteration < MAX_ITERATIONS) {
    iteration++;
    console.log(`\n  ↻ Iteration ${iteration} (${primaryAgent.role})`);
    
    // Primary agent executes
    const result = await primaryAgent.execute({
      phase,
      previousResults,
      eamesBrainPrompt: buildContextualPrompt(phase)
    });
    
    // Critic reviews (every iteration or just final?)
    if (iteration % 3 === 0 || checkCompletionCriteria(result)) {
      const review = await reviewerAgent.review(result);
      
      if (!review.approved) {
        console.log(`  ⚠️  Critic feedback: ${review.feedback}`);
        continue; // Retry with feedback
      }
    }
    
    // Check completion
    if (checkCompletionCriteria(result)) {
      console.log(`  ✓ Phase complete`);
      return result;
    }
  }
  
  throw new Error(`Phase ${phase.name} did not complete`);
}

function selectAgentForPhase(phaseName: string): CouncilMember {
  switch (phaseName) {
    case 'discover': return council.analyst;
    case 'define': return council.strategist;
    case 'design': return council.visionary;
    case 'develop': return council.architect;
    case 'deliver': return council.architect;
    default: return council.chair;
  }
}
```

---

## 🎨 EAMES IDENTITY SYSTEM

### **System Prompt Foundation**

```typescript
// src/agent/identity/eames-identity.ts
export const EAMES_IDENTITY = `
You are Eames, an autonomous product design agent.

## PHILOSOPHY

"The details are not the details. They make the design." — Charles Eames

You embody the principles of Charles and Ray Eames:
- User-centered above all
- Form follows function, but both matter
- Rigor in research, joy in execution
- Question assumptions, validate with evidence
- Design is solving problems, not decorating

## VOICE & TONE

- **Professional** but not robotic
- **Opinionated** but not arrogant
- **Data-driven** but empathetic
- **Direct** but polite
- **Strategic** but practical

## CORE BEHAVIORS

1. **Challenge Vague Requests**
   - Never build blindly
   - Ask "Why?" before "How?"
   - Surface hidden assumptions

2. **Think Strategically**
   - Understand business context
   - Balance user needs + viability + feasibility
   - Recommend best approach, not fastest

3. **Design with Rigor**
   - Reference proven frameworks (JTBD, Double Diamond)
   - Cite research and data
   - Apply design patterns appropriately

4. **Communicate Visually**
   - Show > tell
   - Wireframes > paragraphs
   - Prototypes > descriptions

5. **Collaborate Transparently**
   - Explain reasoning
   - Share trade-offs
   - Ask for feedback at key gates

## WHEN TO USE WHICH PERSONA

As the **Chair**, you are the Product VP:
- Orchestrate, don't dictate
- Know when to defer to specialists
- Synthesize multiple perspectives

When representing the **Council**:
- You speak for the collective
- "Our research shows..." not "I think..."
- Present options, not just one answer
`;
```

### **Identity in Each Council Role**

```typescript
export const ROLE_IDENTITIES = {
  strategist: `
    ${EAMES_IDENTITY}
    
    ## YOUR ROLE: PRODUCT DIRECTOR (STRATEGIST)
    
    You are the strategic thinker. Your job:
    - Question assumptions
    - Identify risks and opportunities
    - Ensure business viability
    - Challenge magical thinking
    
    Your outputs must be:
    - Logical and well-reasoned
    - Data-driven where possible
    - Honest about unknowns
    - Actionable, not theoretical
  `,
  
  visionary: `
    ${EAMES_IDENTITY}
    
    ## YOUR ROLE: CREATIVE DIRECTOR (VISIONARY)
    
    You are the brand guardian and empathy expert. Your job:
    - Ensure brand consistency
    - Check copy voice and tone
    - Advocate for user delight
    - Identify "vibe" mismatches
    
    Your outputs must be:
    - Emotionally intelligent
    - Brand-aligned
    - User-empathetic
    - Aesthetically aware
  `,
  
  // ... other roles
};
```

---

## 🔧 IMPLEMENTATION ROADMAP

### **Phase 1: Council Foundation (Weeks 1-4)**

**Goal:** Multi-model council working with basic orchestration

**Tasks:**
1. Implement Council member configurations
2. Create model provider abstraction
3. Build basic routing (Chair → Specialists)
4. Test sequential and parallel patterns

**Files to create:**
```
src/agent/council/
├── council.ts           # Council configuration
├── members/
│   ├── chair.ts
│   ├── strategist.ts
│   ├── visionary.ts
│   ├── architect.ts
│   ├── analyst.ts
│   └── critic.ts
└── patterns/
    ├── sequential.ts
    ├── parallel.ts
    └── peer-review.ts
```

**Success criteria:**
- Can invoke any Council member
- Sequential consultation works
- Parallel execution works
- LangSmith traces all interactions

---

### **Phase 2: Intent + Ask Mode (Weeks 5-6)**

**Goal:** Stage 0 routing + Clarification Loop

**Tasks:**
1. Intent analyzer (Chair)
2. Strategic question generation (Chair + Strategist)
3. Context synthesis
4. Route to Plan Mode

**Success criteria:**
- Vague queries trigger Ask Mode
- Questions are strategic, not generic
- Context synthesis structures answers
- Smooth handoff to Plan Mode

---

### **Phase 3: Plan Mode (Weeks 7-8)**

**Goal:** Council-reviewed execution plans

**Tasks:**
1. Parallel council consultation
2. Plan synthesis (Chair)
3. Cost/time estimation
4. Plan modification

**Success criteria:**
- Plans include Council insights
- Adaptive phase selection
- Accurate cost/time estimates
- Users can modify plans

---

### **Phase 4: Execute Mode + Ralph Loops (Weeks 9-12)**

**Goal:** Each phase uses Ralph loop + appropriate Council member

**Tasks:**
1. Phase-to-agent mapping
2. Ralph loop with Council agents
3. Critic review at intervals
4. Approval gate integration

**Success criteria:**
- Discovery phase uses Analyst
- Define uses Strategist
- Design uses Visionary
- Develop uses Architect
- Critic reviews periodically

---

### **Phase 5: Eames Brain (Weeks 13-14)**

**Goal:** Contextual prompt composition with design frameworks

**Tasks:**
1. Design frameworks (Double Diamond, JTBD)
2. Product strategy frameworks
3. Contextual prompt builder
4. Token budget management

**Success criteria:**
- Prompts reference frameworks
- Token usage < 20k per phase
- Output quality measurably better

---

### **Phase 6: Memory & Integrations (Weeks 15-16)**

**Goal:** Vector memory + Linear + Notion

**Tasks:**
1. Pinecone/Weaviate integration
2. Design pattern retrieval
3. Linear MCP (PRD → issues)
4. Notion MCP (docs publishing)

**Success criteria:**
- Learns from past designs
- Retrieves relevant patterns
- Creates Linear issues
- Publishes to Notion

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

### **LLM Providers**
```json
{
  "anthropic": ["claude-3-5-sonnet", "claude-3-opus"],
  "openai": ["o1-preview", "o3", "gpt-4"],
  "google": ["gemini-1.5-pro"],
  "perplexity": ["sonar-pro"]
}
```

### **LangChain Stack**
```json
{
  "core": "@langchain/core",
  "anthropic": "@langchain/anthropic",
  "openai": "@langchain/openai",
  "google-genai": "@langchain/google-genai",
  "community": "@langchain/community",
  "langgraph": "@langchain/langgraph",
  "langsmith": "langsmith"
}
```

### **Memory**
```json
{
  "mcp": "Memory MCP (entities, relations)",
  "vector": "Pinecone / Weaviate / Chroma",
  "embeddings": "OpenAI text-embedding-3-small"
}
```

### **Integrations**
```json
{
  "projectManagement": "Linear MCP",
  "documentation": "Notion MCP",
  "observability": "LangSmith",
  "github": "MCP GitHub"
}
```

---

## 🎯 SUCCESS METRICS

### **Council Quality**
- Council insights improve output quality (measured by user feedback)
- Strategist catches business logic flaws >80% of time
- Critic identifies usability issues >75% of time

### **Performance**
- Token usage per phase < 25k (multi-model overhead)
- Cost per full workflow < $5
- Time to completion matches estimates ±30%

### **User Experience**
- Users feel guided, not dictated to
- Plans reflect strategic thinking
- Questions are insightful, not generic

---

## 🚀 GETTING STARTED

### **Current State (langchain-v1.1.1)**

You already have:
- ✅ Basic 5-phase orchestrator
- ✅ LangChain integration
- ✅ MCP Memory
- ✅ Ink UI with clean TUI

### **Next Steps**

1. **Implement Council structure**
   ```bash
   mkdir -p src/agent/council/{members,patterns}
   touch src/agent/council/council.ts
   ```

2. **Add multi-provider support**
   ```bash
   bun add @langchain/openai @langchain/google-genai @langchain/community
   ```

3. **Test Council pattern**
   ```bash
   bun start "Research expense tracking apps"
   # Should use Analyst agent
   
   bun start "Generate PRD for split-bill feature"
   # Should use Strategist agent
   ```

---

## 📚 RELATED DOCUMENTS

- `EAMES_V2_ARCHITECTURE_SDK.md` - Claude SDK version (sub-agents, skills)
- `EAMES_V2_ARCHITECTURE_WEBAPP.md` - Web app version (A2UI, AG-UI)
- `EAMES_SYSTEM_PROMPT_ARCHITECTURE.md` - Prompt design patterns
- `EAMES_VISION_ROADMAP.md` - Product vision

---

**Last Updated:** 2026-01-18  
**Branch:** langchain  
**Version:** 2.0.0-langchain  
**Status:** Strategic Architecture - LangChain Implementation
