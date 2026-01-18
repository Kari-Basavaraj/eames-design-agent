# EAMES V2.0 ARCHITECTURE - WEBAPP VERSION
## A2UI/AG-UI Protocols with Real-Time Collaboration

**Version:** 2.0.0-webapp  
**Branch:** `webapp` (future)  
**Date:** 2026-01-18  
**Status:** Strategic Architecture

---

## 🎯 WEBAPP VERSION FOCUS

**Core Strengths:**
- ✅ **A2UI protocol** (declarative UI generation from agents)
- ✅ **AG-UI runtime** (agent-frontend real-time communication)
- ✅ **A2A coordination** (multi-agent mesh for complex workflows)
- ✅ **Real-time collaboration** (see AI designing in real-time)
- ✅ **Browser-based** (no CLI installation, instant access)
- ✅ **Visual feedback** (watch each phase execute)

**Use Case:**
Web-based design tool where users collaborate with AI agents to design products from idea to deployed code.

---

## 🏗️ ARCHITECTURE OVERVIEW

```
┌─────────────────────────────────────────────────────────────────┐
│            EAMES V2.0 - WEBAPP ARCHITECTURE                     │
│         Real-Time · Visual · Collaborative                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  FRONTEND (Next.js + React + CopilotKit)                        │
│  ┌──────────────────────────────────────────────────┐          │
│  │                                                  │          │
│  │  USER INTERFACE                                  │          │
│  │  ┌────────────────────────────────────────────┐  │          │
│  │  │  Chat Interface (conversational spine)     │  │          │
│  │  │  - Ask questions                           │  │          │
│  │  │  - Review proposals                        │  │          │
│  │  │  - Approve plans                           │  │          │
│  │  └────────────────────────────────────────────┘  │          │
│  │                                                  │          │
│  │  ┌────────────────────────────────────────────┐  │          │
│  │  │  Design Canvas (A2UI rendering)            │  │          │
│  │  │  - Live UI preview                         │  │          │
│  │  │  - Interactive components                  │  │          │
│  │  │  - Real-time updates                       │  │          │
│  │  └────────────────────────────────────────────┘  │          │
│  │                                                  │          │
│  │  ┌────────────────────────────────────────────┐  │          │
│  │  │  Progress Dashboard (AG-UI events)         │  │          │
│  │  │  - Current phase                           │  │          │
│  │  │  - Task completion                         │  │          │
│  │  │  - Agent activity                          │  │          │
│  │  │  - Cost tracking                           │  │          │
│  │  └────────────────────────────────────────────┘  │          │
│  │                                                  │          │
│  │  AG-UI CLIENT (CopilotKit)                       │          │
│  │  - Subscribe to agent events                     │          │
│  │  - Render A2UI specs                             │          │
│  │  - Bi-directional state sync                     │          │
│  │  - Component catalog mapping                     │          │
│  └──────────────────────────────────────────────────┘          │
│      │                                                          │
│      │ WebSocket / SSE                                          │
│      ▼                                                          │
│  ┌──────────────────────────────────────────────────┐          │
│  │  BACKEND (Node.js / Bun)                         │          │
│  └──────────────────────────────────────────────────┘          │
│      │                                                          │
│      ├─► AG-UI Server (Event Streaming)                        │
│      │   Events: RUN_STARTED, TEXT_MESSAGE_CONTENT,            │
│      │           TOOL_CALL_ARGS, STATE_DELTA, etc.             │
│      │                                                          │
│      ├─► A2A Orchestrator (Agent Coordination)                 │
│      │   - Discovery Agent (research)                          │
│      │   - Strategy Agent (PRD generation)                     │
│      │   - Design Agent (A2UI generation)                      │
│      │   - Code Agent (React code)                             │
│      │   - QA Agent (review)                                   │
│      │                                                          │
│      └─► A2UI Generator (UI Specification)                     │
│          - Parse design intent                                 │
│          - Generate A2UI JSON                                  │
│          - Validate against schema                             │
│          - Map to component catalog                            │
│                                                                 │
│  ┌──────────────────────────────────────────────────┐          │
│  │         THREE INTELLIGENT MODES                  │          │
│  │  (Orchestrated via A2A, UI via AG-UI/A2UI)       │          │
│  │                                                  │          │
│  │  ASK MODE → PLAN MODE → EXECUTE MODE             │          │
│  └──────────────────────────────────────────────────┘          │
│                                                                 │
│  ┌──────────────────────────────────────────────────┐          │
│  │      5-PHASE DESIGN LIFECYCLE (Visual)           │          │
│  │                                                  │          │
│  │  Each phase streams progress via AG-UI           │          │
│  │  Design phase outputs A2UI specs for preview     │          │
│  │                                                  │          │
│  │  Discovery → Define → Design → Develop → Deliver │          │
│  └──────────────────────────────────────────────────┘          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🎨 A2UI PROTOCOL INTEGRATION

### **What is A2UI?**

A2UI (Agent-to-User Interface) is Google's open protocol for agents to describe UI as declarative JSON that clients render natively.

**Key Innovation:** Agents send **data**, not code. The client decides how to render it.

### **A2UI Message Flow**

```typescript
// Agent generates A2UI specification
const a2uiSpec = {
  version: '0.8',
  surfaces: [
    {
      id: 'split-bill-calculator',
      type: 'component',
      title: 'Split Bill Calculator',
      components: [
        {
          id: 'total-input',
          type: 'numberInput',
          label: 'Total Bill Amount',
          value: null,
          props: {
            prefix: '$',
            placeholder: '0.00',
            min: 0,
            step: 0.01
          }
        },
        {
          id: 'people-input',
          type: 'numberInput',
          label: 'Number of People',
          value: null,
          props: {
            min: 1,
            max: 100,
            step: 1
          }
        },
        {
          id: 'per-person-display',
          type: 'display',
          label: 'Per Person',
          value: '{{ total / people }}',
          props: {
            format: 'currency',
            size: 'large',
            color: 'primary'
          }
        },
        {
          id: 'calculate-button',
          type: 'button',
          label: 'Calculate',
          props: {
            variant: 'primary',
            fullWidth: true
          },
          actions: {
            onClick: 'calculate'
          }
        }
      ],
      layout: {
        type: 'vertical',
        spacing: 'md',
        padding: 'lg'
      },
      accessibility: {
        ariaLabel: 'Split bill calculator',
        role: 'form',
        keyboardNavigation: true
      }
    }
  ],
  dataModel: {
    total: { type: 'number', default: 0 },
    people: { type: 'number', default: 1 },
    perPerson: { 
      type: 'computed',
      formula: 'total / people'
    }
  }
};
```

### **Client-Side A2UI Renderer**

```typescript
// src/webapp/components/A2UIRenderer.tsx
import { useState, useEffect } from 'react';
import { ComponentCatalog } from './catalog';

interface A2UIRendererProps {
  spec: A2UISpec;
  catalog: ComponentCatalog;
  onAction?: (action: string, data: any) => void;
}

export function A2UIRenderer({ spec, catalog, onAction }: A2UIRendererProps) {
  const [dataModel, setDataModel] = useState(spec.dataModel);
  
  // Re-compute derived values
  useEffect(() => {
    const computed = computeDerivedValues(spec.dataModel, dataModel);
    setDataModel(computed);
  }, [dataModel, spec.dataModel]);
  
  return (
    <div className="a2ui-surface">
      {spec.surfaces.map(surface => (
        <Surface
          key={surface.id}
          surface={surface}
          catalog={catalog}
          dataModel={dataModel}
          onUpdate={setDataModel}
          onAction={onAction}
        />
      ))}
    </div>
  );
}

function Surface({ surface, catalog, dataModel, onUpdate, onAction }) {
  return (
    <div 
      className={`surface surface-${surface.layout.type}`}
      role={surface.accessibility.role}
      aria-label={surface.accessibility.ariaLabel}
    >
      <h2>{surface.title}</h2>
      
      <div className="components">
        {surface.components.map(component => {
          const Component = catalog.get(component.type);
          
          if (!Component) {
            console.warn(`Unknown component type: ${component.type}`);
            return <FallbackComponent key={component.id} {...component} />;
          }
          
          return (
            <Component
              key={component.id}
              {...component.props}
              label={component.label}
              value={dataModel[component.id]}
              onChange={(value) => onUpdate({
                ...dataModel,
                [component.id]: value
              })}
              onAction={(action, data) => onAction?.(action, data)}
            />
          );
        })}
      </div>
    </div>
  );
}
```

### **Component Catalog (shadcn/ui)**

```typescript
// src/webapp/catalog/component-catalog.ts
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';

export const COMPONENT_CATALOG: ComponentCatalog = {
  // Input components
  numberInput: ({ label, value, onChange, ...props }) => (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Input
        type="number"
        value={value || ''}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        {...props}
      />
    </div>
  ),
  
  textInput: ({ label, value, onChange, ...props }) => (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Input
        type="text"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        {...props}
      />
    </div>
  ),
  
  // Display components
  display: ({ label, value, props }) => (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div 
        className={`text-${props.size} text-${props.color} font-bold`}
      >
        {props.format === 'currency' 
          ? new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD'
            }).format(value)
          : value
        }
      </div>
    </div>
  ),
  
  // Action components
  button: ({ label, onAction, props }) => (
    <Button
      variant={props.variant}
      className={props.fullWidth ? 'w-full' : ''}
      onClick={() => onAction('onClick', {})}
    >
      {label}
    </Button>
  ),
  
  // Container components
  card: ({ children, props }) => (
    <Card className={`p-${props.padding}`}>
      {children}
    </Card>
  )
};
```

---

## 🔄 AG-UI PROTOCOL INTEGRATION

### **What is AG-UI?**

AG-UI (Agent-User Interaction Protocol) is an event-driven protocol for real-time agent-to-frontend communication.

**Key Events:**
- `RUN_STARTED` - Agent begins execution
- `TEXT_MESSAGE_CONTENT` - Agent sends text message
- `TOOL_CALL_ARGS` - Agent calls a tool
- `TOOL_CALL_RESULT` - Tool returns result
- `STATE_DELTA` - Application state update
- `INTERRUPT` - Agent requests user input
- `RUN_COMPLETED` - Agent finishes

### **AG-UI Client (CopilotKit)**

```typescript
// src/webapp/hooks/useEamesAgent.ts
import { useCoAgent } from '@copilotkit/react-core';
import { useState } from 'react';

export function useEamesAgent(query: string) {
  const [phase, setPhase] = useState<string>('idle');
  const [progress, setProgress] = useState<string>('');
  const [a2uiSpec, setA2uiSpec] = useState<A2UISpec | null>(null);
  
  const { state, execute } = useCoAgent({
    name: 'eames-design-agent',
    
    // Subscribe to agent events
    onEvent: (event) => {
      switch (event.type) {
        case 'RUN_STARTED':
          setPhase('running');
          break;
          
        case 'TEXT_MESSAGE_CONTENT':
          setProgress(event.data.text);
          break;
          
        case 'TOOL_CALL_ARGS':
          if (event.data.toolName === 'generate_a2ui_spec') {
            // Agent is generating UI
            setPhase('design');
          }
          break;
          
        case 'TOOL_CALL_RESULT':
          if (event.data.toolName === 'generate_a2ui_spec') {
            // Render A2UI spec
            setA2uiSpec(JSON.parse(event.data.result));
          }
          break;
          
        case 'STATE_DELTA':
          // Update application state
          applyStateDelta(event.data.delta);
          break;
          
        case 'INTERRUPT':
          // Agent needs user input
          handleInterrupt(event.data);
          break;
          
        case 'RUN_COMPLETED':
          setPhase('completed');
          break;
      }
    }
  });
  
  return {
    phase,
    progress,
    a2uiSpec,
    execute,
    state
  };
}
```

### **Real-Time Progress Dashboard**

```typescript
// src/webapp/components/ProgressDashboard.tsx
export function ProgressDashboard({ phase, progress, state }) {
  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Agent Progress</h3>
        <Badge variant={phase === 'running' ? 'default' : 'secondary'}>
          {phase}
        </Badge>
      </div>
      
      <div className="space-y-2">
        <Label>Current Phase</Label>
        <div className="flex items-center space-x-2">
          {phase === 'running' && <Spinner />}
          <span>{state.currentPhase || 'Analyzing query...'}</span>
        </div>
      </div>
      
      <div className="space-y-2">
        <Label>Latest Update</Label>
        <p className="text-sm text-muted-foreground">{progress}</p>
      </div>
      
      <div className="space-y-2">
        <Label>Tasks Completed</Label>
        <Progress value={(state.tasksCompleted / state.totalTasks) * 100} />
        <span className="text-xs text-muted-foreground">
          {state.tasksCompleted} / {state.totalTasks}
        </span>
      </div>
      
      <div className="space-y-2">
        <Label>Estimated Cost</Label>
        <span className="text-sm font-mono">
          ${state.estimatedCost.toFixed(2)}
        </span>
      </div>
    </Card>
  );
}
```

---

## 🌐 A2A MULTI-AGENT COORDINATION

### **What is A2A?**

A2A (Agent-to-Agent Protocol) enables independent agents to discover, communicate, and coordinate.

**Key Concepts:**
- **Agent Cards** - Metadata describing agent capabilities
- **Task Lifecycle** - submitted → working → completed/failed
- **Transport Bindings** - JSON-RPC, gRPC, REST

### **Agent Cards**

```json
{
  "agent": {
    "id": "eames-discovery-agent",
    "name": "Eames Discovery Agent",
    "version": "2.0.0",
    "provider": "Eames Design",
    "description": "User research, competitive analysis, market trends",
    "capabilities": [
      {
        "skill": "competitive_analysis",
        "inputs": {
          "type": "object",
          "properties": {
            "query": { "type": "string" },
            "numCompetitors": { "type": "number", "default": 5 }
          },
          "required": ["query"]
        },
        "outputs": {
          "type": "object",
          "properties": {
            "competitors": { "type": "array" },
            "insights": { "type": "array" },
            "opportunities": { "type": "array" }
          }
        }
      }
    ],
    "authentication": {
      "type": "apiKey",
      "location": "header"
    },
    "extensions": {
      "a2ui": {
        "supported": true,
        "catalogs": ["shadcn-ui", "material-ui"]
      }
    }
  }
}
```

### **Multi-Agent Orchestration**

```typescript
// src/webapp/agents/orchestrator.ts
import { A2AClient } from '@a2a/client';

export class EamesOrchestrator {
  private agents: Map<string, A2AAgent>;
  
  constructor() {
    this.agents = new Map([
      ['discovery', new A2AAgent('eames-discovery-agent')],
      ['strategy', new A2AAgent('eames-strategy-agent')],
      ['design', new A2AAgent('eames-design-agent')],
      ['code', new A2AAgent('eames-code-agent')],
      ['qa', new A2AAgent('eames-qa-agent')]
    ]);
  }
  
  async executeWorkflow(plan: ExecutionPlan) {
    const results: Record<string, any> = {};
    
    for (const phase of plan.phases) {
      // Select agent for this phase
      const agent = this.agents.get(phase.agentId);
      
      if (!agent) {
        throw new Error(`Agent not found: ${phase.agentId}`);
      }
      
      // Submit task via A2A
      const task = await agent.submitTask({
        skill: phase.skill,
        inputs: {
          query: plan.query,
          previousResults: results
        },
        metadata: {
          sessionId: plan.sessionId,
          phase: phase.name
        }
      });
      
      // Wait for completion (with streaming updates)
      const result = await this.waitForCompletion(task, (update) => {
        // Stream updates to frontend via AG-UI
        this.emitEvent({
          type: 'STATE_DELTA',
          data: {
            currentPhase: phase.name,
            progress: update.progress
          }
        });
      });
      
      // Store result
      results[phase.name] = result;
      
      // If design phase, extract A2UI spec
      if (phase.name === 'design' && result.a2uiSpec) {
        this.emitEvent({
          type: 'A2UI_SPEC_GENERATED',
          data: result.a2uiSpec
        });
      }
    }
    
    return results;
  }
  
  private async waitForCompletion(
    task: A2ATask,
    onUpdate: (update: TaskUpdate) => void
  ) {
    return new Promise((resolve, reject) => {
      const interval = setInterval(async () => {
        const status = await task.getStatus();
        
        if (status.state === 'completed') {
          clearInterval(interval);
          resolve(status.result);
        } else if (status.state === 'failed') {
          clearInterval(interval);
          reject(new Error(status.error));
        } else {
          onUpdate(status);
        }
      }, 1000);
    });
  }
}
```

---

## 💬 THREE MODES IN WEB UI

### **ASK MODE (Modal Dialog)**

```typescript
// src/webapp/components/AskModeDialog.tsx
export function AskModeDialog({ questions, onSubmit }) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  
  return (
    <Dialog open={true}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Help me understand your needs</DialogTitle>
          <DialogDescription>
            I need some context to build the right thing
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {questions.map((q, i) => (
            <div key={i} className="space-y-2">
              <Label className="text-base font-medium">
                {i + 1}. {q.question}
              </Label>
              <p className="text-sm text-muted-foreground">
                Why: {q.reasoning}
              </p>
              <Textarea
                placeholder="Your answer..."
                value={answers[q.id] || ''}
                onChange={(e) => setAnswers({
                  ...answers,
                  [q.id]: e.target.value
                })}
                rows={3}
              />
            </div>
          ))}
        </div>
        
        <DialogFooter>
          <Button 
            onClick={() => onSubmit(answers)}
            disabled={Object.keys(answers).length < questions.length}
          >
            Continue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

---

### **PLAN MODE (Interactive Plan View)**

```typescript
// src/webapp/components/PlanView.tsx
export function PlanView({ plan, onApprove, onModify }) {
  const [selectedPhases, setSelectedPhases] = useState(
    plan.phases.map(p => p.name)
  );
  
  return (
    <Card className="p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Proposed Execution Plan</h2>
        <p className="text-muted-foreground mt-2">{plan.summary}</p>
      </div>
      
      <Separator />
      
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Phases to Execute</h3>
        
        {plan.phases.map((phase, i) => (
          <Card key={phase.name} className="p-4">
            <div className="flex items-start space-x-4">
              <Checkbox
                checked={selectedPhases.includes(phase.name)}
                onCheckedChange={(checked) => {
                  setSelectedPhases(
                    checked
                      ? [...selectedPhases, phase.name]
                      : selectedPhases.filter(p => p !== phase.name)
                  );
                }}
              />
              
              <div className="flex-1 space-y-2">
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">{phase.emoji}</span>
                  <span className="font-semibold">{phase.name.toUpperCase()}</span>
                  <Badge variant="outline">{phase.estimatedTime}</Badge>
                </div>
                
                <p className="text-sm text-muted-foreground">
                  {phase.goal}
                </p>
                
                <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                  <span>Deliverable: {phase.deliverable}</span>
                  <span>•</span>
                  <span>Loops: {phase.estimatedIterations}</span>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
      
      <Separator />
      
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Approval Gates</h3>
        {plan.approvalGates.map(gate => (
          <div key={gate.phase} className="flex items-start space-x-2 text-sm">
            <Badge variant={gate.required ? 'default' : 'secondary'}>
              {gate.required ? 'Required' : 'Optional'}
            </Badge>
            <span>After {gate.phase}: {gate.description}</span>
          </div>
        ))}
      </div>
      
      <Separator />
      
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium">Estimated Cost</p>
          <p className="text-2xl font-bold">{plan.estimatedCost}</p>
        </div>
        
        <div className="space-y-1">
          <p className="text-sm font-medium">Estimated Time</p>
          <p className="text-2xl font-bold">{plan.estimatedTotalTime}</p>
        </div>
      </div>
      
      <div className="flex space-x-2">
        <Button 
          onClick={() => onApprove(selectedPhases)}
          className="flex-1"
        >
          Approve Plan
        </Button>
        <Button 
          onClick={onModify}
          variant="outline"
        >
          Modify
        </Button>
      </div>
    </Card>
  );
}
```

---

### **EXECUTE MODE (Live Progress View)**

```typescript
// src/webapp/components/ExecuteView.tsx
export function ExecuteView({ plan }) {
  const { phase, progress, a2uiSpec, state } = useEamesAgent(plan.query);
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left: Progress Dashboard */}
      <div className="space-y-6">
        <ProgressDashboard 
          phase={phase}
          progress={progress}
          state={state}
        />
        
        <PhaseTimeline 
          phases={plan.phases}
          currentPhase={state.currentPhase}
        />
        
        <AgentActivity 
          activities={state.activities}
        />
      </div>
      
      {/* Right: Live Preview */}
      <div className="space-y-6">
        {a2uiSpec && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Live Preview</h3>
            <A2UIRenderer 
              spec={a2uiSpec}
              catalog={COMPONENT_CATALOG}
              onAction={(action, data) => {
                console.log('User action:', action, data);
              }}
            />
          </Card>
        )}
        
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Generated Code</h3>
          <CodeBlock 
            code={state.generatedCode || '// Generating...'}
            language="typescript"
          />
        </Card>
      </div>
    </div>
  );
}
```

---

## 🔧 IMPLEMENTATION ROADMAP

### **Phase 1: Frontend Foundation (Weeks 1-2)**

**Goal:** Next.js app with basic UI

**Tasks:**
1. Set up Next.js 15 with App Router
2. Install shadcn/ui components
3. Create basic layout (chat + canvas + dashboard)
4. Set up Tailwind CSS

**Tech stack:**
```json
{
  "framework": "Next.js 15",
  "ui": "shadcn/ui + Radix UI",
  "styling": "Tailwind CSS",
  "state": "Zustand",
  "forms": "React Hook Form"
}
```

---

### **Phase 2: AG-UI Integration (Weeks 3-4)**

**Goal:** Real-time agent communication

**Tasks:**
1. Install CopilotKit
2. Set up AG-UI server
3. Implement event streaming (WebSocket/SSE)
4. Build progress dashboard

**Success criteria:**
- Agent events stream to frontend
- Progress updates in real-time
- Cost tracking works
- Can interrupt agent execution

---

### **Phase 3: A2UI Renderer (Weeks 5-6)**

**Goal:** Render A2UI specs with shadcn components

**Tasks:**
1. Build component catalog mapper
2. Implement A2UIRenderer component
3. Add data model reactive updates
4. Test with sample A2UI specs

**Success criteria:**
- Can render A2UI JSON
- Components map to shadcn/ui
- Reactive data updates work
- Fallback for unknown components

---

### **Phase 4: A2A Backend (Weeks 7-10)**

**Goal:** Multi-agent orchestration via A2A

**Tasks:**
1. Set up A2A server
2. Create agent cards for 5 agents
3. Implement task lifecycle
4. Build orchestrator

**Success criteria:**
- Agents communicate via A2A
- Tasks submit and complete
- Progress streams to frontend
- Error handling works

---

### **Phase 5: Three Modes UI (Weeks 11-12)**

**Goal:** Ask, Plan, Execute modes in web UI

**Tasks:**
1. Build AskModeDialog
2. Build PlanView
3. Build ExecuteView
4. Integrate with orchestrator

**Success criteria:**
- Smooth mode transitions
- User can answer questions
- User can approve/modify plans
- Live execution preview works

---

### **Phase 6: Collaboration Features (Weeks 13-16)**

**Goal:** Multi-user collaboration, sharing, comments

**Tasks:**
1. Add authentication (Clerk/Auth.js)
2. Implement real-time sync (Liveblocks/PartyKit)
3. Add commenting on designs
4. Build sharing/embedding

**Success criteria:**
- Multiple users can collaborate
- Changes sync in real-time
- Can comment on AI-generated designs
- Can share projects via link

---

## 📊 TECH STACK DETAILS

### **Frontend**
```json
{
  "framework": "Next.js 15 (App Router)",
  "ui": "shadcn/ui + Radix UI",
  "styling": "Tailwind CSS",
  "state": "Zustand",
  "forms": "React Hook Form",
  "validation": "Zod",
  "agui": "CopilotKit",
  "realtime": "Liveblocks / PartyKit",
  "auth": "Clerk / Auth.js"
}
```

### **Backend**
```json
{
  "runtime": "Bun / Node.js",
  "framework": "Hono / Express",
  "agui": "AG-UI Server (CopilotKit)",
  "a2a": "A2A Server",
  "llm": "Claude 3.5 Sonnet (via Anthropic SDK)",
  "database": "PostgreSQL (Neon / Supabase)",
  "cache": "Redis (Upstash)",
  "storage": "S3 / R2"
}
```

### **Deployment**
```json
{
  "frontend": "Vercel",
  "backend": "Fly.io / Railway",
  "database": "Neon / Supabase",
  "cache": "Upstash Redis",
  "storage": "Cloudflare R2",
  "monitoring": "Sentry + LogRocket"
}
```

---

## 🎯 SUCCESS METRICS

### **User Experience**
- Agents feel collaborative, not automated
- Real-time updates don't lag
- A2UI rendering is smooth
- Preview matches final output >95%

### **Performance**
- First contentful paint < 1s
- Time to interactive < 2s
- Agent event latency < 100ms
- A2UI render time < 50ms

### **Collaboration**
- Multi-user sync < 200ms
- No conflicts with CRDT
- Comments appear instantly
- Sharing works reliably

---

## 🚀 GETTING STARTED

### **Prerequisites**

```bash
bun install
# or
npm install

# Environment variables
cp .env.example .env.local
```

### **Development**

```bash
# Frontend
cd webapp
bun dev

# Backend
cd backend
bun dev

# Both (Turborepo)
cd ..
bun dev
```

---

## 📚 RELATED DOCUMENTS

- `EAMES_V2_ARCHITECTURE_LANGCHAIN.md` - CLI version (multi-provider council)
- `EAMES_V2_ARCHITECTURE_SDK.md` - CLI version (Claude SDK, skills, sub-agents)
- `The Agentic UI Stack.md` - A2UI/AG-UI research
- `EAMES_VISION_ROADMAP.md` - Product vision

---

**Last Updated:** 2026-01-18  
**Branch:** webapp (future)  
**Version:** 2.0.0-webapp  
**Status:** Strategic Architecture - Web App Implementation
