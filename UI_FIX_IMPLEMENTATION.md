# UI FIX - COPY-PASTE IMPLEMENTATION
## Get Your UI Working in 1 Hour

**Problem:** Static "Executing: Thinking..." with no real progress  
**Solution:** Real-time tool streaming with live updates

---

## FILE 1: Enhanced SDK Processor

Create `src/agent/enhanced-sdk-processor.ts`:

```typescript
// src/agent/enhanced-sdk-processor.ts
import type { SdkMessage } from '@anthropic-ai/claude-agent-sdk';

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
  
  processMessage(message: any) {
    const type = message.type || message.event;
    
    switch (type) {
      case 'tool_use_start':
      case 'tool_call_start':
        this.handleToolStart(message);
        break;
        
      case 'tool_use_result':
      case 'tool_call_result':
        this.handleToolComplete(message);
        break;
        
      case 'thinking':
        this.callbacks.onProgressMessage?.("Analyzing request...");
        break;
        
      case 'text':
      case 'text_delta':
        if (message.text) {
          this.callbacks.onTextChunk?.(message.text);
        }
        break;
        
      case 'phase_change':
        this.callbacks.onPhaseChange?.(message.phase);
        break;
    }
  }
  
  private handleToolStart(message: any) {
    const toolId = message.tool_use_id || message.tool_call_id || `tool-${Date.now()}`;
    const toolName = message.name || message.tool_name || 'Unknown';
    const toolInput = message.input || message.tool_input || {};
    
    const event: ToolCallEvent = {
      id: toolId,
      tool: toolName,
      status: 'starting',
      args: toolInput,
      timestamp: Date.now(),
    };
    
    this.activeTools.set(event.id, event);
    this.callbacks.onToolStart?.(event);
    
    // Immediately mark as running
    setTimeout(() => {
      const runningEvent = this.activeTools.get(event.id);
      if (runningEvent && runningEvent.status === 'starting') {
        runningEvent.status = 'running';
        this.callbacks.onToolProgress?.(runningEvent);
      }
    }, 100);
  }
  
  private handleToolComplete(message: any) {
    const toolId = message.tool_use_id || message.tool_call_id;
    const event = this.activeTools.get(toolId);
    
    if (event) {
      event.status = message.error ? 'failed' : 'completed';
      event.result = message.content || message.result || '';
      event.error = message.error;
      
      this.callbacks.onToolComplete?.(event);
      
      // Keep completed tools visible for 1 second
      setTimeout(() => {
        this.activeTools.delete(toolId);
      }, 1000);
    }
  }
  
  getActiveCalls(): ToolCallEvent[] {
    return Array.from(this.activeTools.values());
  }
  
  clearCompleted() {
    for (const [id, event] of this.activeTools.entries()) {
      if (event.status === 'completed' || event.status === 'failed') {
        this.activeTools.delete(id);
      }
    }
  }
}
```

---

## FILE 2: Live Progress Component

Create `src/components/LiveProgress.tsx`:

```typescript
// src/components/LiveProgress.tsx
import React from 'react';
import { Box, Text } from 'ink';
import Spinner from 'ink-spinner';
import { colors } from '../theme.js';
import type { ToolCallEvent } from '../agent/enhanced-sdk-processor.js';

interface LiveProgressProps {
  phase?: string;
  tools: ToolCallEvent[];
  message?: string;
}

export function LiveProgress({ phase, tools, message }: LiveProgressProps) {
  const activeTools = tools.filter(t => t.status === 'starting' || t.status === 'running');
  const completedTools = tools.filter(t => t.status === 'completed');
  const failedTools = tools.filter(t => t.status === 'failed');
  
  const hasActivity = activeTools.length > 0 || message;
  
  if (!hasActivity && completedTools.length === 0 && failedTools.length === 0) {
    return null;
  }
  
  return (
    <Box flexDirection="column" marginLeft={2} marginTop={1}>
      {/* Phase/progress message */}
      {message && (
        <Box marginBottom={activeTools.length > 0 ? 1 : 0}>
          <Text color={colors.primary}>
            <Spinner type="dots" />
          </Text>
          <Text color={colors.textMuted}> {message}</Text>
        </Box>
      )}
      
      {/* Active tool calls */}
      {activeTools.map((tool) => (
        <ToolCallRow key={tool.id} tool={tool} />
      ))}
      
      {/* Recently completed tools */}
      {completedTools.slice(-2).map((tool) => (
        <ToolCallRow key={tool.id} tool={tool} />
      ))}
      
      {/* Failed tools */}
      {failedTools.map((tool) => (
        <ToolCallRow key={tool.id} tool={tool} />
      ))}
    </Box>
  );
}

function ToolCallRow({ tool }: { tool: ToolCallEvent }) {
  const description = formatToolDescription(tool);
  
  return (
    <Box marginBottom={0}>
      {tool.status === 'starting' || tool.status === 'running' ? (
        <>
          <Text color={colors.primary}>
            <Spinner type="dots" />
          </Text>
          <Text color={colors.textMuted}> {description}</Text>
        </>
      ) : tool.status === 'completed' ? (
        <>
          <Text color={colors.success}>✓</Text>
          <Text> {description}</Text>
          {tool.result && (
            <Text color={colors.textMuted}> - {truncate(tool.result, 40)}</Text>
          )}
        </>
      ) : (
        <>
          <Text color={colors.error}>✗</Text>
          <Text> {description}</Text>
          {tool.error && (
            <Text color={colors.error}> - {tool.error}</Text>
          )}
        </>
      )}
    </Box>
  );
}

function formatToolDescription(tool: ToolCallEvent): string {
  const { tool: name, args } = tool;
  
  // Common tool formatting
  switch (name) {
    case 'Read':
    case 'read_file':
      return `Reading ${args?.path || args?.file_path || 'file'}`;
      
    case 'Write':
    case 'write_file':
      return `Writing ${args?.path || args?.file_path || 'file'}`;
      
    case 'Edit':
    case 'edit_file':
      return `Editing ${args?.path || args?.file_path || 'file'}`;
      
    case 'Bash':
    case 'bash':
      const cmd = args?.command || args?.cmd || '';
      return `Running: ${truncate(cmd as string, 30)}`;
      
    case 'WebSearch':
    case 'web_search':
      return `Searching: ${args?.query || 'web'}`;
      
    case 'Glob':
    case 'glob':
      return `Finding files: ${args?.pattern || '*'}`;
      
    case 'Grep':
    case 'grep':
      return `Searching code: ${args?.pattern || args?.query || ''}`;
      
    default:
      // Generic: format tool name nicely
      const displayName = name
        .replace(/_/g, ' ')
        .replace(/([A-Z])/g, ' $1')
        .trim()
        .toLowerCase();
      return displayName.charAt(0).toUpperCase() + displayName.slice(1);
  }
}

function truncate(str: string, len: number): string {
  if (!str) return '';
  return str.length > len ? str.slice(0, len) + '...' : str;
}
```

---

## FILE 3: Update SDK Agent Hook

Modify `src/hooks/useSdkAgentExecution.ts`:

Add these imports at the top:

```typescript
import { EnhancedSdkProcessor, type ToolCallEvent } from '../agent/enhanced-sdk-processor.js';
```

Add these state variables (around line 100):

```typescript
const [toolCalls, setToolCalls] = useState<ToolCallEvent[]>([]);
const [currentPhase, setCurrentPhase] = useState<string>('idle');
const [currentProgressMessage, setCurrentProgressMessage] = useState<string>('');
```

Add processor initialization (around line 110):

```typescript
const processorRef = useRef<EnhancedSdkProcessor | null>(null);

if (!processorRef.current) {
  processorRef.current = new EnhancedSdkProcessor({
    onPhaseChange: (phase) => {
      setCurrentPhase(phase);
    },
    
    onToolStart: (event) => {
      setToolCalls(calls => [...calls, event]);
    },
    
    onToolProgress: (event) => {
      setToolCalls(calls => 
        calls.map(c => c.id === event.id ? { ...event } : c)
      );
    },
    
    onToolComplete: (event) => {
      setToolCalls(calls => 
        calls.map(c => c.id === event.id ? { ...event } : c)
      );
    },
    
    onProgressMessage: (message) => {
      setCurrentProgressMessage(message);
    },
  });
}
```

In the SdkAgent initialization, add message processing:

```typescript
const agent = new SdkAgent({
  model,
  callbacks: {
    ...callbacks,
    
    // ADD THIS: Process all SDK messages
    onMessage: (message: any) => {
      processorRef.current?.processMessage(message);
      callbacks.onMessage?.(message);
    },
  },
  // ... rest of config
});
```

Add to return statement (around line 400):

```typescript
return {
  currentTurn,
  answerStream,
  isProcessing,
  processQuery,
  handleAnswerComplete,
  cancelExecution,
  
  // ADD THESE:
  toolCalls,
  currentPhase,
  progressMessage: currentProgressMessage,
};
```

---

## FILE 4: Update CLI

Modify `src/cli.tsx`:

Import the new component (around line 20):

```typescript
import { LiveProgress } from './components/LiveProgress.js';
```

Update the SDK agent call (around line 210):

```typescript
const { 
  currentTurn, 
  answerStream, 
  isProcessing, 
  processQuery, 
  handleAnswerComplete, 
  cancelExecution,
  toolCalls,        // ADD
  progressMessage   // ADD
} = useSdkMode ? sdkAgent : standardAgent;
```

Update the render (around line 650):

```typescript
{/* Current turn with live progress */}
{currentTurn && (
  <Box flexDirection="column" marginTop={1}>
    {/* User query */}
    <Box>
      <Text bold color={colors.primary}>❯ </Text>
      <Text color={colors.white}>{currentTurn.query}</Text>
    </Box>
    
    {/* REPLACE AgentProgressView with LiveProgress */}
    <LiveProgress 
      phase={currentTurn.state.currentPhase}
      tools={toolCalls || []}
      message={progressMessage || currentTurn.state.progressMessage}
    />
    
    {/* Streaming answer */}
    {answerStream && (
      <Box marginTop={1} marginLeft={2}>
        <AnswerBox stream={answerStream} onComplete={handleAnswerComplete} />
      </Box>
    )}
  </Box>
)}
```

---

## TESTING

1. **Start Eames:**
```bash
bun run dev
```

2. **Try this query:**
```
design a simple todo app
```

3. **Then say:**
```
go with your judgement
```

4. **You should now see:**
```
❯ go with your judgement

⠋ Analyzing request...
⠋ Reading src/components/
✓ Reading src/components/ (12 files)
⠋ Analyzing project structure
✓ Analyzing project structure
⠋ Generating component design

Creating a todo app component...
```

---

## TROUBLESHOOTING

### Issue: Still shows "Thinking..." only

**Fix:** SDK messages aren't being processed. Check:

```typescript
// In useSdkAgentExecution.ts, verify:
onMessage: (message: any) => {
  console.log('SDK Message:', message); // Add this
  processorRef.current?.processMessage(message);
},
```

### Issue: Tool calls don't show

**Fix:** Message format might be different. Add logging:

```typescript
// In enhanced-sdk-processor.ts
processMessage(message: any) {
  console.log('Processing:', message.type, message); // Add this
  // ... rest of code
}
```

### Issue: Crashes on tool call

**Fix:** Handle undefined safely:

```typescript
const toolName = message?.name || message?.tool_name || 'Unknown';
const toolInput = message?.input || message?.tool_input || {};
```

---

## EXPECTED RESULT

**Before:**
```
⚙️ ⏳ Executing: Thinking...
```

**After:**
```
⠋ Analyzing request...
⠋ Reading package.json
✓ Reading package.json (React + Ink)
⠋ Checking existing components
✓ Checking existing components (found 15)
⠋ Planning component structure
✓ Planning component structure

Based on your stack, I'll create a terminal-based todo app...
```

**Much better!** 🎉

---

**Time to implement: 30-60 minutes**
**Difficulty: Medium**
**Impact: HUGE improvement in UX**
