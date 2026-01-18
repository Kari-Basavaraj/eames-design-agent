# CLAUDE CODE UI - COMPLETE TECHNICAL IMPLEMENTATION GUIDE
## From Broken to Better Than Claude Code

**Date:** 2026-01-18  
**Problem:** Your UI shows "Executing: Thinking..." with gear icon but no actual progress  
**Goal:** Match or exceed Claude Code's polished, responsive, informative UI

---

## 🔴 CRITICAL ISSUES IN YOUR SCREENSHOT

### What I See in Your Screenshot:

```
❯ design a simple todo app

I'd like to understand your needs better before designing:

**1. Platform** - What should this todo app target?
  **CLI (Ink/React)** - Terminal-based, fits the Eames project stack
  - **Web (React)** - Browser-based application
  - **Design Only** - Just architecture/design, no code yet

... (more questions)

> go with your judgement

⚙️ ⏳ Executing: Thinking...
>
```

### Problems:

1. ❌ **Static "Thinking" Message** - No real progress shown
2. ❌ **No Tool Visibility** - Can't see what tools are being used
3. ❌ **Missing Indicators** - No phase information
4. ❌ **Poor Animation** - Just gear + hourglass, nothing dynamic
5. ❌ **No Streaming** - Not showing intermediate results
6. ❌ **Cluttered Layout** - Questions + thinking mixed together

---

## ✅ HOW CLAUDE CODE DOES IT (From Official Sources)

Based on analysis of:
- [GitHub - anthropics/claude-code](https://github.com/anthropics/claude-code)
- [Claude Code Internals: Terminal UI](https://kotrotsos.medium.com/claude-code-internals-part-11-terminal-ui-542fe17db016)
- [Dexter Agent UI Implementation](https://deepwiki.com/virattt/dexter/6-user-interface)

### Claude Code UI Architecture:

```
┌────────────────────────────────────────────────────────────────┐
│ CLAUDE CODE UI ARCHITECTURE                                    │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ PROGRESSIVE DISCLOSURE LAYER                             │  │
│  │  • Only show what's actively happening                   │  │
│  │  • History is collapsed                                  │  │
│  │  • Details on demand (expandable)                        │  │
│  └──────────────────────────────────────────────────────────┘  │
│                             │                                  │
│                             ▼                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ STREAMING LAYER (Real-time updates)                      │  │
│  │  • Tool calls stream as they happen                      │  │
│  │  • Progress updates continuously                         │  │
│  │  • Text streams word-by-word                             │  │
│  └──────────────────────────────────────────────────────────┘  │
│                             │                                  │
│                             ▼                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ VISUAL FEEDBACK LAYER                                    │  │
│  │  • Spinners for active tasks                             │  │
│  │  • Color-coded tool types                                │  │
│  │  • Status indicators (✓ ✗ ⠋)                             │  │
│  │  • Smooth animations                                     │  │
│  └──────────────────────────────────────────────────────────┘  │
│                             │                                  │
│                             ▼                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ LAYOUT SYSTEM (Yoga - Meta's Flexbox)                   │  │
│  │  • Responsive to terminal size                           │  │
│  │  • No layout shifts during updates                       │  │
│  │  • Stable scroll position                                │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

---

## 🎯 CLAUDE CODE UI PATTERNS (Reverse Engineered)

### Pattern 1: Real-Time Tool Streaming

**How They Do It:**

```
❯ analyze the codebase

⠋ Reading src/index.tsx
⠋ Reading package.json  
✓ Reading src/index.tsx (234 lines)
✓ Reading package.json (15 packages)
⠋ Analyzing dependencies...
✓ Analyzing dependencies (found 23 dependencies)
⠋ Generating summary...

Based on the analysis, this is a React + TypeScript project...
```

**Key Features:**
- ✅ Each tool call shows immediately
- ✅ Spinner while running
- ✅ Checkmark when complete
- ✅ Brief result summary
- ✅ Smooth transitions

**Implementation:**

```typescript
// Real-time tool streaming component
interface StreamingToolCall {
  tool: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  result?: string;
  startTime: number;
}

function StreamingToolView({ toolCalls }: { toolCalls: StreamingToolCall[] }) {
  return (
    <Box flexDirection="column">
      {toolCalls.map((call, i) => (
        <Box key={i}>
          {call.status === 'running' && (
            <>
              <Spinner /> <Text dimColor>{call.tool}</Text>
            </>
          )}
          {call.status === 'completed' && (
            <>
              <Text color="green">✓</Text> 
              <Text>{call.tool}</Text>
              {call.result && (
                <Text dimColor> ({call.result})</Text>
              )}
            </>
          )}
        </Box>
      ))}
    </Box>
  );
}
```

### Pattern 2: Hierarchical Progress

**How They Do It:**

```
❯ create a new feature

Planning approach...
  ⠋ Analyzing requirements
  ⠋ Checking existing code
  ✓ Analyzing requirements
  ✓ Checking existing code

Implementing solution...
  ⠋ Creating component
    ⠋ Reading src/components/
    ✓ Reading src/components/ (12 files)
    ⠋ Writing src/components/Feature.tsx
    ✓ Writing src/components/Feature.tsx
  ✓ Creating component
  ⠋ Adding tests
```

**Key Features:**
- ✅ Nested hierarchy (main task → subtasks → tool calls)
- ✅ Each level has own spinner
- ✅ Progressive completion
- ✅ Clear indentation

**Implementation:**

```typescript
interface ProgressNode {
  label: string;
  status: 'pending' | 'running' | 'completed';
  children?: ProgressNode[];
  indent: number;
}

function HierarchicalProgress({ node }: { node: ProgressNode }) {
  const prefix = '  '.repeat(node.indent);
  
  return (
    <Box flexDirection="column">
      <Box>
        <Text>{prefix}</Text>
        {node.status === 'running' && <Spinner />}
        {node.status === 'completed' && <Text color="green">✓</Text>}
        {node.status === 'pending' && <Text dimColor>○</Text>}
        <Text> {node.label}</Text>
      </Box>
      
      {node.children?.map((child, i) => (
        <HierarchicalProgress key={i} node={child} />
      ))}
    </Box>
  );
}
```

### Pattern 3: Smooth Text Streaming

**How They Do It:**

Text appears word-by-word or character-by-character, not all at once.

**Implementation:**

```typescript
function StreamingText({ stream }: { stream: AsyncIterable<string> }) {
  const [text, setText] = useState('');
  
  useEffect(() => {
    let mounted = true;
    let buffer = '';
    
    (async () => {
      for await (const chunk of stream) {
        if (!mounted) break;
        buffer += chunk;
        
        // Update every 50ms for smooth rendering
        setText(buffer);
        await new Promise(r => setTimeout(r, 50));
      }
    })();
    
    return () => { mounted = false; };
  }, [stream]);
  
  return <Text>{text}</Text>;
}
```

### Pattern 4: Collapsible Sections

**How They Do It:**

```
❯ previous query result

✓ Completed in 12.3s  [expand ▼]

> new query
```

Click expand:

```
❯ previous query result

✓ Completed in 12.3s  [collapse ▲]

Tool Usage:
  ✓ Read 5 files
  ✓ Analyzed code structure
  ✓ Generated component

Result:
Created src/components/Feature.tsx with tests
```

**Implementation:**

```typescript
function CollapsibleResult({ result }: { result: Result }) {
  const [expanded, setExpanded] = useState(false);
  
  useInput((input) => {
    if (input === 'e' || input === 'E') {
      setExpanded(!expanded);
    }
  });
  
  return (
    <Box flexDirection="column">
      <Box>
        <Text color="green">✓</Text>
        <Text> Completed in {result.duration}s</Text>
        <Text dimColor> [press 'e' to {expanded ? 'collapse' : 'expand'}]</Text>
      </Box>
      
      {expanded && (
        <Box marginLeft={2} flexDirection="column">
          <Text bold>Tool Usage:</Text>
          {result.tools.map((tool, i) => (
            <Text key={i}>  ✓ {tool}</Text>
          ))}
          
          <Text bold marginTop={1}>Result:</Text>
          <Text>{result.output}</Text>
        </Box>
      )}
    </Box>
  );
}
```

### Pattern 5: Status Line

**How They Do It:**

```
[DEFAULT] claude-sonnet-4-5 · 2.1k tokens · $0.03
```

Always visible at top, shows:
- Permission mode
- Current model
- Token usage
- Cost

**Implementation:**

```typescript
function StatusLine({ 
  mode, 
  model, 
  tokens, 
  cost 
}: StatusLineProps) {
  const modeColors = {
    DEFAULT: 'yellow',
    AUTO: 'green',
    PLAN: 'blue',
    BYPASS: 'gray',
  };
  
  return (
    <Box>
      <Text color={modeColors[mode]}>[{mode}]</Text>
      <Text dimColor> {model}</Text>
      <Text dimColor> · {formatNumber(tokens)} tokens</Text>
      <Text dimColor> · ${cost.toFixed(2)}</Text>
    </Box>
  );
}
```

---

## 🔧 YOUR IMPLEMENTATION PROBLEMS (Detailed)

### Problem 1: SDK Message Processing

**Your Current Code** (`src/agent/sdk-message-processor.ts`):

```typescript
// This just sets a generic "thinking" message
onProgressMessage?.("Thinking...");
```

**Problem:** No detail about what's actually happening!

**Fix Needed:**

```typescript
// Parse the actual SDK message content
processMessage(message: SdkMessage) {
  switch (message.type) {
    case 'tool_call_start':
      onProgressMessage?.(`Using ${message.tool}...`);
      onToolStart?.(message);
      break;
      
    case 'tool_call_result':
      onToolComplete?.(message);
      break;
      
    case 'thinking':
      onProgressMessage?.("Analyzing request...");
      break;
      
    case 'text_chunk':
      onTextStream?.(message.text);
      break;
  }
}
```

### Problem 2: No Tool Call Visibility

**Your Current Code:**

Tool calls happen but UI doesn't show them!

**Fix:**

```typescript
// src/components/LiveToolCalls.tsx
export function LiveToolCalls({ calls }: { calls: ToolCall[] }) {
  return (
    <Box flexDirection="column" marginLeft={2}>
      {calls.map((call, i) => (
        <Box key={i}>
          {call.status === 'running' && (
            <>
              <Spinner type="dots" />
              <Text dimColor> {call.tool}</Text>
              <Text dimColor> {call.description}</Text>
            </>
          )}
          
          {call.status === 'completed' && (
            <>
              <Text color="green">✓</Text>
              <Text> {call.tool}</Text>
              {call.result && (
                <Text dimColor> - {truncate(call.result, 50)}</Text>
              )}
            </>
          )}
          
          {call.status === 'failed' && (
            <>
              <Text color="red">✗</Text>
              <Text> {call.tool}</Text>
              <Text color="red"> - {call.error}</Text>
            </>
          )}
        </Box>
      ))}
    </Box>
  );
}
```

### Problem 3: Static Progress Indicators

**Your Current:**

```tsx
⚙️ ⏳ Executing: Thinking...
```

Just sits there doing nothing!

**Fix - Animated Progress:**

```typescript
// src/components/PhaseProgress.tsx
export function PhaseProgress({ phase, message }: PhaseProgressProps) {
  const [dots, setDots] = useState('');
  
  useEffect(() => {
    const interval = setInterval(() => {
      setDots(d => d.length >= 3 ? '' : d + '.');
    }, 500);
    
    return () => clearInterval(interval);
  }, []);
  
  const phaseIcons = {
    understand: '🔍',
    plan: '📋',
    execute: '⚙️',
    reflect: '🤔',
    answer: '✍️',
  };
  
  return (
    <Box marginLeft={2}>
      <Text>{phaseIcons[phase]}</Text>
      <Spinner type="dots" />
      <Text dimColor> {message}{dots}</Text>
    </Box>
  );
}
```

### Problem 4: Poor Layout Structure

**Your Current cli.tsx render:**

Everything rendered in one big Box with no structure.

**Fix - Proper Layout:**

```typescript
// src/cli.tsx - PROPER STRUCTURE
return (
  <Box flexDirection="column" height="100%">
    {/* STATUS LINE - Always visible at top */}
    <Box borderStyle="single" borderColor="gray" paddingX={1}>
      <StatusLine 
        mode={permissionMode}
        model={model}
        tokens={totalTokens}
        cost={totalCost}
      />
    </Box>
    
    {/* SCROLLABLE CONTENT */}
    <Box flexDirection="column" flexGrow={1} overflow="auto">
      {/* Collapsed history */}
      <Static items={history.slice(-2)}>
        {(turn) => <CollapsedTurn key={turn.id} turn={turn} />}
      </Static>
      
      {/* Current interaction */}
      {currentTurn && (
        <Box flexDirection="column" marginTop={1}>
          {/* User query */}
          <Box>
            <Text bold color="cyan">❯ </Text>
            <Text>{currentTurn.query}</Text>
          </Box>
          
          {/* Live progress */}
          <LiveProgress 
            phase={currentTurn.phase}
            tools={currentTurn.toolCalls}
            message={currentTurn.progressMessage}
          />
          
          {/* Streaming answer */}
          {answerStream && (
            <Box marginTop={1} marginLeft={2}>
              <StreamingText stream={answerStream} />
            </Box>
          )}
        </Box>
      )}
    </Box>
    
    {/* INPUT - Always visible at bottom */}
    <Box borderStyle="single" borderTop paddingX={1}>
      <EnhancedInput onSubmit={handleSubmit} />
    </Box>
  </Box>
);
```

---

## 🚀 COMPLETE IMPLEMENTATION FIXES

### Fix 1: Enhanced SDK Message Processor

Create `src/agent/enhanced-sdk-processor.ts`:

```typescript
import type { SdkAgent, SdkMessage } from '@anthropic-ai/claude-agent-sdk';

export interface ToolCallEvent {
  id: string;
  tool: string;
  status: 'starting' | 'running' | 'completed' | 'failed';
  args?: Record<string, unknown>;
  result?: string;
  error?: string;
  timestamp: number;
}

export interface SdkEventCallbacks {
  onPhaseChange?: (phase: string) => void;
  onToolStart?: (event: ToolCallEvent) => void;
  onToolProgress?: (event: ToolCallEvent) => void;
  onToolComplete?: (event: ToolCallEvent) => void;
  onTextChunk?: (text: string) => void;
  onProgressMessage?: (message: string) => void;
}

export class EnhancedSdkProcessor {
  private activeTools = new Map<string, ToolCallEvent>();
  
  constructor(private callbacks: SdkEventCallbacks) {}
  
  processMessage(message: SdkMessage) {
    switch (message.type) {
      case 'tool_call_start':
        this.handleToolStart(message);
        break;
        
      case 'tool_call_delta':
        this.handleToolProgress(message);
        break;
        
      case 'tool_call_result':
        this.handleToolComplete(message);
        break;
        
      case 'thinking_start':
        this.callbacks.onProgressMessage?.("Analyzing...");
        break;
        
      case 'thinking_end':
        this.callbacks.onProgressMessage?.("");
        break;
        
      case 'text_delta':
        this.callbacks.onTextChunk?.(message.text);
        break;
        
      case 'phase_change':
        this.callbacks.onPhaseChange?.(message.phase);
        break;
    }
  }
  
  private handleToolStart(message: any) {
    const event: ToolCallEvent = {
      id: message.tool_call_id,
      tool: message.tool_name,
      status: 'starting',
      args: message.tool_input,
      timestamp: Date.now(),
    };
    
    this.activeTools.set(event.id, event);
    this.callbacks.onToolStart?.(event);
  }
  
  private handleToolProgress(message: any) {
    const event = this.activeTools.get(message.tool_call_id);
    if (event) {
      event.status = 'running';
      this.callbacks.onToolProgress?.(event);
    }
  }
  
  private handleToolComplete(message: any) {
    const event = this.activeTools.get(message.tool_call_id);
    if (event) {
      event.status = message.error ? 'failed' : 'completed';
      event.result = message.result;
      event.error = message.error;
      
      this.callbacks.onToolComplete?.(event);
      this.activeTools.delete(message.tool_call_id);
    }
  }
  
  getActiveCalls(): ToolCallEvent[] {
    return Array.from(this.activeTools.values());
  }
}
```

### Fix 2: Live Progress Component

Create `src/components/LiveProgress.tsx`:

```typescript
import React from 'react';
import { Box, Text } from 'ink';
import Spinner from 'ink-spinner';
import type { ToolCallEvent } from '../agent/enhanced-sdk-processor.js';

interface LiveProgressProps {
  phase: string;
  tools: ToolCallEvent[];
  message?: string;
}

export function LiveProgress({ phase, tools, message }: LiveProgressProps) {
  const phaseLabels = {
    understand: 'Understanding',
    plan: 'Planning',
    execute: 'Executing',
    reflect: 'Reflecting',
    answer: 'Answering',
  };
  
  const phaseLabel = phaseLabels[phase] || phase;
  
  return (
    <Box flexDirection="column" marginLeft={2} marginTop={1}>
      {/* Phase indicator */}
      {message && (
        <Box marginBottom={1}>
          <Spinner type="dots" />
          <Text dimColor> {phaseLabel}: {message}</Text>
        </Box>
      )}
      
      {/* Active tool calls */}
      {tools.length > 0 && (
        <Box flexDirection="column">
          {tools.map((tool) => (
            <ToolCallRow key={tool.id} tool={tool} />
          ))}
        </Box>
      )}
    </Box>
  );
}

function ToolCallRow({ tool }: { tool: ToolCallEvent }) {
  const description = formatToolDescription(tool);
  
  return (
    <Box>
      {tool.status === 'starting' || tool.status === 'running' ? (
        <>
          <Spinner type="dots" />
          <Text dimColor> {description}</Text>
        </>
      ) : tool.status === 'completed' ? (
        <>
          <Text color="green">✓</Text>
          <Text> {description}</Text>
          {tool.result && (
            <Text dimColor> - {truncate(tool.result, 40)}</Text>
          )}
        </>
      ) : (
        <>
          <Text color="red">✗</Text>
          <Text> {description}</Text>
          <Text color="red"> - {tool.error}</Text>
        </>
      )}
    </Box>
  );
}

function formatToolDescription(tool: ToolCallEvent): string {
  const { tool: name, args } = tool;
  
  switch (name) {
    case 'Read':
      return `Reading ${args?.path || 'file'}`;
    case 'Write':
      return `Writing ${args?.path || 'file'}`;
    case 'Edit':
      return `Editing ${args?.path || 'file'}`;
    case 'Bash':
      return `Running: ${args?.command || 'command'}`;
    case 'WebSearch':
      return `Searching: ${args?.query || 'web'}`;
    default:
      return name;
  }
}

function truncate(str: string, len: number): string {
  return str.length > len ? str.slice(0, len) + '...' : str;
}
```

### Fix 3: Update useSdkAgentExecution Hook

Modify `src/hooks/useSdkAgentExecution.ts`:

```typescript
import { EnhancedSdkProcessor, ToolCallEvent } from '../agent/enhanced-sdk-processor.js';

export function useSdkAgentExecution({ model }: Options) {
  const [toolCalls, setToolCalls] = useState<ToolCallEvent[]>([]);
  const [phase, setPhase] = useState<string>('idle');
  const [progressMessage, setProgressMessage] = useState<string>('');
  
  const processor = useRef<EnhancedSdkProcessor>(
    new EnhancedSdkProcessor({
      onPhaseChange: (newPhase) => {
        setPhase(newPhase);
      },
      
      onToolStart: (event) => {
        setToolCalls(calls => [...calls, event]);
      },
      
      onToolProgress: (event) => {
        setToolCalls(calls => 
          calls.map(c => c.id === event.id ? event : c)
        );
      },
      
      onToolComplete: (event) => {
        setToolCalls(calls => 
          calls.map(c => c.id === event.id ? event : c)
        );
        
        // Remove completed calls after 2 seconds
        setTimeout(() => {
          setToolCalls(calls => calls.filter(c => c.id !== event.id));
        }, 2000);
      },
      
      onTextChunk: (text) => {
        // Handle streaming text
      },
      
      onProgressMessage: (message) => {
        setProgressMessage(message);
      },
    })
  );
  
  // Process SDK messages
  const handleSdkMessage = useCallback((message: SdkMessage) => {
    processor.current.processMessage(message);
  }, []);
  
  return {
    phase,
    toolCalls,
    progressMessage,
    // ... other returns
  };
}
```

### Fix 4: Proper CLI Render Structure

Update `src/cli.tsx`:

```typescript
return (
  <Box flexDirection="column">
    {/* Status line at top */}
    <StatusLine 
      permissionMode={permissionMode}
      thinkingMode={thinkingMode}
      model={model}
    />
    
    {/* Content area */}
    <Box flexDirection="column" marginTop={1}>
      {/* Recent history (collapsed) */}
      <Static items={history.slice(-2)}>
        {(turn) => (
          <Box key={turn.id} marginBottom={1}>
            <Box>
              <Text bold color="cyan">❯ </Text>
              <Text>{turn.query}</Text>
            </Box>
            <Box marginLeft={2}>
              <Text dimColor>✓ Completed in {turn.duration}s</Text>
              <Text dimColor> [press 'e' to expand]</Text>
            </Box>
          </Box>
        )}
      </Static>
      
      {/* Current query and live progress */}
      {currentTurn && (
        <Box flexDirection="column" marginTop={1}>
          {/* Query */}
          <Box>
            <Text bold color="cyan">❯ </Text>
            <Text>{currentTurn.query}</Text>
          </Box>
          
          {/* Live progress with tool calls */}
          <LiveProgress 
            phase={currentTurn.phase}
            tools={toolCalls}
            message={progressMessage}
          />
          
          {/* Streaming answer */}
          {answerStream && (
            <Box marginTop={1} marginLeft={2}>
              <StreamingText stream={answerStream} />
            </Box>
          )}
        </Box>
      )}
    </Box>
    
    {/* Input at bottom */}
    <Box marginTop={1}>
      <EnhancedInput onSubmit={handleSubmit} />
    </Box>
  </Box>
);
```

---

## ⚡ ANIMATION & PERFORMANCE

### Smooth Spinners

Use different spinners for different states:

```typescript
const SPINNER_TYPES = {
  thinking: 'dots',        // ⠋ ⠙ ⠹ ⠸ ⠼ ⠴
  loading: 'line',         // - \ | /
  processing: 'arc',       // ◜ ◠ ◝ ◞
  fast: 'dots2',          // ⣾ ⣽ ⣻
};

function AdaptiveSpinner({ type }: { type: keyof typeof SPINNER_TYPES }) {
  return <Spinner type={SPINNER_TYPES[type]} />;
}
```

### Debounced Updates

Prevent UI flickering:

```typescript
function useDebounced<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);
  
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  
  return debouncedValue;
}

// Usage
const debouncedTools = useDebounced(toolCalls, 100);
```

---

## 📊 COMPARISON: YOUR UI vs FIXED UI

### Before (Current):

```
❯ design a simple todo app

(lots of questions)

> go with your judgement

⚙️ ⏳ Executing: Thinking...
>
```

**Problems:**
- ❌ No tool visibility
- ❌ Static message
- ❌ No progress
- ❌ Can't see what's happening

### After (Fixed):

```
❯ design a simple todo app

Understanding request...
  ⠋ Analyzing requirements
  ✓ Analyzing requirements

Planning approach...
  ⠋ Breaking down tasks
  ✓ Breaking down tasks (3 tasks created)

Executing tasks...
  ⠋ Reading src/components/
  ✓ Reading src/components/ (12 files found)
  ⠋ Generating component structure
  ✓ Generating component structure
  ⠋ Creating TodoApp.tsx

Creating a simple todo app with the following structure:
- TodoList component for displaying items...
```

**Benefits:**
- ✅ See every tool call
- ✅ Real-time progress
- ✅ Clear phases
- ✅ Smooth animations
- ✅ Informative messages

---

## 🎯 IMPLEMENTATION CHECKLIST

### Phase 1: Core Fixes (2-3 hours)

- [ ] Create `EnhancedSdkProcessor` class
- [ ] Create `LiveProgress` component
- [ ] Update `useSdkAgentExecution` hook
- [ ] Add proper SDK message handling
- [ ] Test with simple query

### Phase 2: Visual Polish (1-2 hours)

- [ ] Add proper spinners
- [ ] Color-code tool types
- [ ] Add smooth transitions
- [ ] Implement debouncing
- [ ] Fix layout structure

### Phase 3: Advanced Features (1-2 hours)

- [ ] Add collapsible history
- [ ] Implement expand/collapse
- [ ] Add status line
- [ ] Show token usage
- [ ] Add keyboard shortcuts

### Phase 4: Testing (1 hour)

- [ ] Test with multiple tools
- [ ] Test with long outputs
- [ ] Test with errors
- [ ] Test with slow responses
- [ ] Test terminal resizing

---

## 🚀 QUICK START

### Step 1: Install Dependencies

Already have ink and ink-spinner, good!

### Step 2: Create Enhanced Processor

```bash
# Create the file
touch src/agent/enhanced-sdk-processor.ts

# Copy the EnhancedSdkProcessor code from above
```

### Step 3: Create LiveProgress Component

```bash
touch src/components/LiveProgress.tsx

# Copy the LiveProgress code from above
```

### Step 4: Update Hook

Modify `src/hooks/useSdkAgentExecution.ts` to use the processor.

### Step 5: Update CLI

Modify `src/cli.tsx` render to use `LiveProgress`.

### Step 6: Test!

```bash
bun run dev

# Try: "design a simple todo app"
```

You should now see real-time tool calls and progress!

---

## 📚 SOURCES & REFERENCES

**Official Claude Code:**
- [GitHub - anthropics/claude-code](https://github.com/anthropics/claude-code)
- [Claude Code Internals: Terminal UI](https://kotrotsos.medium.com/claude-code-internals-part-11-terminal-ui-542fe17db016)
- [How Claude Code is Built](https://newsletter.pragmaticengineer.com/p/how-claude-code-is-built)

**Dexter UI Implementation:**
- [Dexter GitHub Repository](https://github.com/virattt/dexter)
- [Dexter User Interface Guide](https://deepwiki.com/virattt/dexter/6-user-interface)

**Ink Framework:**
- [Ink - React for CLIs](https://github.com/vadimdemedes/ink)
- [Yoga Layout Engine](https://yogalayout.com/)

---

## ✅ SUCCESS CRITERIA

After implementation, your UI should:

- ✅ Show every tool call in real-time
- ✅ Have smooth, non-flickering animations
- ✅ Display clear progress through phases
- ✅ Stream text smoothly
- ✅ Show meaningful status messages
- ✅ Be responsive to terminal size
- ✅ Handle errors gracefully
- ✅ Feel as polished as Claude Code

---

**This is the complete technical guide you need. Follow it step-by-step and your UI will be better than Claude Code!** 🚀
