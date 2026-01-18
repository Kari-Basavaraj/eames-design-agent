// SDK Message type - using any for now since SDK types vary
export type SdkMessage = any;

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
    if (!message || !message.type) return;
    
    switch (message.type) {
      case 'content_block_start':
        if (message.content_block?.type === 'tool_use') {
          this.handleToolStart(message.content_block);
        }
        break;
        
      case 'content_block_delta':
        if (message.delta?.type === 'tool_use_delta') {
          this.handleToolProgress(message);
        } else if (message.delta?.type === 'text_delta') {
          this.callbacks.onTextChunk?.(message.delta.text);
        }
        break;
        
      case 'content_block_stop':
        if (message.content_block?.type === 'tool_use') {
          this.handleToolComplete(message.content_block);
        }
        break;
        
      case 'message_start':
        this.callbacks.onProgressMessage?.('Starting...');
        break;
        
      case 'message_delta':
        if (message.delta?.stop_reason === 'end_turn') {
          this.callbacks.onProgressMessage?.('');
        }
        break;
    }
  }
  
  private handleToolStart(block: any) {
    const event: ToolCallEvent = {
      id: block.id,
      tool: block.name || 'unknown',
      status: 'starting',
      args: block.input,
      timestamp: Date.now(),
    };
    
    this.activeTools.set(event.id, event);
    this.callbacks.onToolStart?.(event);
    
    // Auto-update to running after a brief moment
    setTimeout(() => {
      const tool = this.activeTools.get(event.id);
      if (tool && tool.status === 'starting') {
        tool.status = 'running';
        this.callbacks.onToolProgress?.(tool);
      }
    }, 50);
  }
  
  private handleToolProgress(message: any) {
    // Update progress if we have partial results
    const toolId = message.index?.toString();
    if (toolId) {
      const event = this.activeTools.get(toolId);
      if (event) {
        event.status = 'running';
        this.callbacks.onToolProgress?.(event);
      }
    }
  }
  
  private handleToolComplete(block: any) {
    const event = this.activeTools.get(block.id);
    if (event) {
      event.status = 'completed';
      
      // Extract result if available
      if (typeof block.input === 'object') {
        // Format result based on tool type
        event.result = this.formatToolResult(event.tool, block.input);
      }
      
      this.callbacks.onToolComplete?.(event);
      
      // Keep completed tools visible briefly before removing
      setTimeout(() => {
        this.activeTools.delete(block.id);
      }, 2000);
    }
  }
  
  private formatToolResult(tool: string, input: any): string {
    switch (tool) {
      case 'read_file':
        return input.filePath ? `${input.filePath}` : 'file';
      case 'replace_string_in_file':
      case 'create_file':
        return input.filePath ? `${input.filePath}` : 'file';
      case 'run_in_terminal':
        return input.command ? `${input.command.slice(0, 40)}...` : 'command';
      case 'grep_search':
        return input.query ? `"${input.query}"` : 'search';
      case 'semantic_search':
        return input.query ? `"${input.query}"` : 'search';
      default:
        return '';
    }
  }
  
  getActiveCalls(): ToolCallEvent[] {
    return Array.from(this.activeTools.values());
  }
  
  clearActiveCalls() {
    this.activeTools.clear();
  }
}
