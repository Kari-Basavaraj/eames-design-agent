// Updated: 2026-01-13 00:30:00
// Eames Design Agent - Full Claude Code SDK Integration
// Provides ALL Claude Code capabilities: slash commands, plugins, skills, settings

import { query } from '@anthropic-ai/claude-agent-sdk';
import type {
  Options,
  Query,
  McpServerConfig,
  AgentDefinition,
  SdkPluginConfig,
} from '@anthropic-ai/claude-agent-sdk';
import type { AgentCallbacks } from './orchestrator.js';
import { buildSystemPrompt } from './prompts.js';
import {
  SdkMessageProcessor,
  createMessageProcessor,
  type SDKMessage,
  type SDKAssistantMessage,
  type SDKToolResultMessage,
  type SDKResultMessage,
  type SDKSystemMessage,
  type SDKToolProgressMessage,
} from './sdk-message-processor.js';

// ============================================================================
// Types - Full Claude Code Feature Set
// ============================================================================

/**
 * Permission modes matching Claude Code's permission system
 */
export type PermissionMode = 
  | 'default'           // Interactive prompts
  | 'acceptEdits'       // Auto-approve file edits
  | 'bypassPermissions' // Full autonomy (dangerous)
  | 'plan';             // Planning mode only

/**
 * Setting sources for Claude Code configuration loading
 */
export type SettingSource = 'user' | 'project' | 'local';

/**
 * Full Claude Code SDK agent options
 */
export interface SdkAgentOptions {
  model: string;
  callbacks?: AgentCallbacks;
  signal?: AbortSignal;
  mcpTimeout?: number; // Timeout for MCP server initialization in ms
  
  // System prompt configuration
  systemPrompt?: string;
  appendSystemPrompt?: string;
  
  // Session management
  sessionId?: string;
  resume?: string;
  forkSession?: boolean;
  
  // Claude Code settings & config
  settingSources?: SettingSource[];
  useAllSettings?: boolean;  // Shorthand for ['user', 'project', 'local']
  
  // MCP servers
  mcpServers?: Record<string, McpServerConfig>;
  mcpConfig?: string;  // Path to MCP config file
  
  // Plugins
  plugins?: SdkPluginConfig[];
  pluginDirs?: string[];
  
  // Subagents
  agents?: Record<string, AgentDefinition>;
  
  // Tools & permissions
  allowedTools?: string[];
  disallowedTools?: string[];
  permissionMode?: PermissionMode;
  
  // SDK Hooks
  hooks?: any;  // SDK hooks for PreToolUse, PostToolUse, etc.
  
  // Features
  enableFileCheckpointing?: boolean;
  enableChrome?: boolean;
  
  // Limits
  maxTurns?: number;
  timeoutMs?: number;
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Maps internal tool names to user-friendly display names.
 * Hides MCP implementation details from the user.
 */
function getFriendlyToolName(toolName: string): string {
  // Strip any MCP prefix for cleaner display
  if (toolName.startsWith('mcp__')) {
    const parts = toolName.split('__');
    return parts[parts.length - 1]; // Return just the tool name
  }
  return toolName;
}

/**
 * Extracts meaningful detail from tool input for display.
 * Shows file paths, search queries, commands - not just generic descriptions.
 */
function extractToolDetail(toolName: string, toolInput: any): string {
  if (!toolInput) return '';

  try {
    switch (toolName) {
      case 'Read':
        // Show file path
        const filePath = toolInput.file_path || toolInput.path || '';
        return filePath ? ` ${shortenPath(filePath)}` : '';

      case 'Write':
      case 'Edit':
        // Show file being modified
        const editPath = toolInput.file_path || toolInput.path || '';
        return editPath ? ` ${shortenPath(editPath)}` : '';

      case 'Grep':
        // Show search pattern and path
        const pattern = toolInput.pattern || '';
        const grepPath = toolInput.path || '';
        if (pattern && grepPath) return ` "${pattern}" in ${shortenPath(grepPath)}`;
        if (pattern) return ` "${pattern}"`;
        return '';

      case 'Glob':
        // Show glob pattern
        const globPattern = toolInput.pattern || '';
        return globPattern ? ` ${globPattern}` : '';

      case 'WebSearch':
        // Show search query
        const query = toolInput.query || '';
        return query ? ` "${truncate(query, 40)}"` : '';

      case 'WebFetch':
        // Show URL
        const url = toolInput.url || '';
        return url ? ` ${truncate(url, 50)}` : '';

      case 'Bash':
        // Show command
        const command = toolInput.command || '';
        return command ? ` ${truncate(command, 50)}` : '';

      default:
        return '';
    }
  } catch {
    return '';
  }
}

/**
 * Shortens a file path for display.
 */
function shortenPath(path: string): string {
  // Remove common prefixes
  const shortened = path
    .replace(/^\/Users\/[^/]+\//, '~/')
    .replace(/^\/home\/[^/]+\//, '~/');

  // If still too long, show just filename with parent
  if (shortened.length > 50) {
    const parts = shortened.split('/');
    if (parts.length > 2) {
      return `.../${parts.slice(-2).join('/')}`;
    }
  }

  return shortened;
}

/**
 * Truncates text for display.
 */
function truncate(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text;
  return text.slice(0, maxLen - 3) + '...';
}

// ============================================================================
// SDK Agent Implementation - Full Claude Code Capabilities
// ============================================================================

/**
 * SdkAgent wraps the Claude Agent SDK to provide FULL Claude Code capabilities:
 * - All built-in tools (Read, Edit, Bash, Glob, Grep, WebSearch, WebFetch, etc.)
 * - Slash commands (custom and built-in)
 * - Skills (.claude/skills/)
 * - Plugins
 * - CLAUDE.md memory
 * - MCP servers
 * - Subagents
 * - Sessions & checkpointing
 * - Full settings hierarchy (user, project, local)
 */
export class SdkAgent {
  private readonly model: string;
  private readonly callbacks: AgentCallbacks;
  private readonly signal?: AbortSignal;
  private readonly systemPrompt?: string;
  private readonly appendSystemPrompt?: string;
  private readonly messageProcessor: SdkMessageProcessor;
  private currentQuery: Query | null = null;
  private lastSessionId: string | null = null;

  private cwd: string;
  
  // Full Claude Code feature options
  private readonly sessionId?: string;
  private readonly resume?: string;
  private readonly forkSession: boolean;
  private readonly settingSources: SettingSource[];
  private readonly mcpServers?: Record<string, McpServerConfig>;
  private readonly mcpConfig?: string;
  private readonly plugins?: SdkPluginConfig[];
  private readonly pluginDirs?: string[];
  private readonly agents?: Record<string, AgentDefinition>;
  private readonly allowedTools?: string[];
  private readonly disallowedTools?: string[];
  private readonly permissionMode: PermissionMode;
  private readonly hooks?: any;
  private readonly enableFileCheckpointing: boolean;
  private readonly enableChrome: boolean;
  private readonly maxTurns?: number;
  private readonly timeoutMs?: number;

  constructor(options: SdkAgentOptions) {
    this.model = options.model;
    this.callbacks = options.callbacks ?? {};
    this.signal = options.signal;
    // CRITICAL: Capture cwd at construction time (not module load time)
    this.cwd = process.cwd();
    this.messageProcessor = createMessageProcessor(this.callbacks);
    
    // System prompt - can override or append
    this.systemPrompt = options.systemPrompt;
    this.appendSystemPrompt = options.appendSystemPrompt;
    
    // Session management
    this.sessionId = options.sessionId;
    this.resume = options.resume;
    this.forkSession = options.forkSession ?? false;
    
    // Settings sources - determines what Claude Code config to load
    // useAllSettings=true is shorthand for loading everything
    if (options.useAllSettings) {
      this.settingSources = ['user', 'project', 'local'];
    } else {
      this.settingSources = options.settingSources ?? ['project'];
    }
    
    // MCP servers
    this.mcpServers = options.mcpServers;
    this.mcpConfig = options.mcpConfig;
    
    // Plugins
    this.plugins = options.plugins;
    this.pluginDirs = options.pluginDirs;
    
    // Subagents
    this.agents = options.agents;
    
    // Tools & permissions
    this.allowedTools = options.allowedTools;
    this.disallowedTools = options.disallowedTools;
    this.hooks = options.hooks;
    this.permissionMode = options.permissionMode ?? 'bypassPermissions';
    
    // Features
    this.enableFileCheckpointing = options.enableFileCheckpointing ?? true;
    this.enableChrome = options.enableChrome ?? false;
    
    // Limits
    this.maxTurns = options.maxTurns;
    this.timeoutMs = options.timeoutMs;
  }
  
  /**
   * Gets the last session ID (for multi-turn support).
   */
  getLastSessionId(): string | null {
    return this.lastSessionId;
  }

  /**
   * Gets the message processor (for testing/inspection).
   */
  getMessageProcessor(): SdkMessageProcessor {
    return this.messageProcessor;
  }

  /**
   * Cancels the current execution if running.
   */
  async cancel(): Promise<void> {
    if (this.currentQuery) {
      try {
        await this.currentQuery.interrupt();
      } catch {
        // Ignore interruption errors
      }
      this.currentQuery = null;
    }
  }

  /**
   * Main entry point - runs a query using the Claude Agent SDK.
   * Has access to ALL Claude Code capabilities.
   */
  async run(prompt: string): Promise<string> {
    // Create abort controller linked to external signal
    const abortController = new AbortController();
    if (this.signal) {
      this.signal.addEventListener('abort', () => abortController.abort());
    }

    // Build full Claude Code SDK options
    const options: Options = {
      // Core
      model: this.model,
      abortController,
      cwd: this.cwd,
      
      // Enable ALL Claude Code built-in tools (Read, Write, Edit, Bash, etc.)
      tools: { type: 'preset', preset: 'claude_code' },
      
      // Enable session persistence for multi-turn conversations
      persistSession: true,
      
      // Enable extended context window if available
      betas: ['context-1m-2025-08-07'],
      
      // Pass environment variables (including ANTHROPIC_API_KEY)
      env: process.env,
      
      // System prompt configuration
      ...(this.systemPrompt && { systemPrompt: this.systemPrompt }),
      ...(this.appendSystemPrompt && { appendSystemPrompt: this.appendSystemPrompt }),
      
      // Permission mode
      permissionMode: this.permissionMode,
      allowDangerouslySkipPermissions: this.permissionMode === 'bypassPermissions',
      
      // Settings sources - loads CLAUDE.md, skills, commands, plugins
      settingSources: this.settingSources,
      
      // File checkpointing for undo/redo
      enableFileCheckpointing: this.enableFileCheckpointing,
      
      // Chrome browser integration
      ...(this.enableChrome && { chrome: true }),
      
      // Session management
      ...(this.resume && { resume: this.resume }),
      ...(this.forkSession && { forkSession: this.forkSession }),
      
      // MCP servers
      ...(this.mcpServers && { mcpServers: this.mcpServers }),
      ...(this.mcpConfig && { mcpConfig: [this.mcpConfig] }),
      
      // Plugins
      ...(this.plugins && { plugins: this.plugins }),
      ...(this.pluginDirs && { pluginDir: this.pluginDirs }),
      
      // Subagents
      ...(this.agents && { agents: this.agents }),
      
      // Tool configuration
      ...(this.allowedTools && { allowedTools: this.allowedTools }),
      ...(this.disallowedTools && { disallowedTools: this.disallowedTools }),
      
      // Limits
      ...(this.maxTurns && { maxTurns: this.maxTurns }),
      ...(this.timeoutMs && { timeoutMs: this.timeoutMs }),
      
      // Hooks for UI updates (can be overridden by options.hooks)
      hooks: this.hooks || {
        PreToolUse: [{
          hooks: [async (input) => {
            if (input.hook_event_name === 'PreToolUse') {
              const friendlyName = getFriendlyToolName(input.tool_name);
              const detail = extractToolDetail(input.tool_name, input.tool_input);
              this.callbacks.onProgressMessage?.(`Using ${friendlyName}:${detail}...`);
            }
            return { continue: true };
          }],
        }],
        PostToolUse: [{
          hooks: [async (input) => {
            if (input.hook_event_name === 'PostToolUse') {
              const friendlyName = getFriendlyToolName(input.tool_name);
              const detail = extractToolDetail(input.tool_name, input.tool_input);
              this.callbacks.onProgressMessage?.(`${friendlyName}:${detail} completed`);
            }
            return { continue: true };
          }],
        }],
        PostToolUseFailure: [{
          hooks: [async (input) => {
            if (input.hook_event_name === 'PostToolUseFailure') {
              const friendlyName = getFriendlyToolName(input.tool_name);
              this.callbacks.onProgressMessage?.(`${friendlyName} failed: ${input.error}`);
            }
            return { continue: true };
          }],
        }],
      },
    };

    // Start the query
    this.currentQuery = query({ prompt, options });

    let result = '';
    let finalAnswer = '';
    let turnCount = 0;
    const maxTurnsHard = this.maxTurns ?? 50; // Hard limit to prevent infinite loops
    
    // Track phase progression
    let toolsUsed = 0;

    try {
      // Phase 1: Understand (visible for 1.5 seconds)
      this.callbacks.onPhaseStart?.('understand');
      await new Promise(resolve => setTimeout(resolve, 1500));
      this.callbacks.onPhaseComplete?.('understand');
      
      // Phase 2: Plan (visible for 1.5 seconds)
      this.callbacks.onPhaseStart?.('plan');
      await new Promise(resolve => setTimeout(resolve, 1500));
      this.callbacks.onPhaseComplete?.('plan');
      
      // Phase 3: Execute - where actual work happens
      this.callbacks.onPhaseStart?.('execute');

      // Notify execution start via message processor
      this.messageProcessor.startExecution();

      // Process messages from the SDK
      for await (const message of this.currentQuery) {
        turnCount++;
        
        // Hard limit check - force stop after maxTurns
        if (turnCount > maxTurnsHard * 10) { // Each turn can have multiple messages
          console.warn(`Hard limit reached (${turnCount} messages). Stopping.`);
          break;
        }
        
        // Check for abort
        if (this.signal?.aborted) {
          throw new Error('Operation was cancelled');
        }
        
        // Pass message to external processor for real-time tracking
        this.callbacks.onSdkMessage?.(message);

        // Route message through processor
        const processed = this.messageProcessor.processMessage(message as SDKMessage);

        // Capture text content and results
        if (message.type === 'assistant') {
          finalAnswer = processed;
        } else if (message.type === 'result') {
          result = processed;
          // Capture session ID for multi-turn support
          const resultMsg = message as any;
          if (resultMsg.session_id) {
            this.lastSessionId = resultMsg.session_id;
          }
          // Result means we're done - break out
          break;
        } else if ((message as any).type === 'tool_result') {
          // Tool results are processed by the processor for status tracking
          this.messageProcessor.processToolResultMessage(message as any as SDKToolResultMessage);
        }
      }

      // Phase 4: Reflect (visible for 1 second)
      this.callbacks.onPhaseComplete?.('execute');
      this.callbacks.onPhaseStart?.('reflect');
      await new Promise(resolve => setTimeout(resolve, 1000));
      this.callbacks.onPhaseComplete?.('reflect');
      
      // Phase 5: Answer
      this.callbacks.onPhaseStart?.('answer');
      
      // Transition to answer phase via processor
      this.messageProcessor.startAnswer();
      this.callbacks.onAnswerStart?.();

      // Stream the final answer
      const answerToStream = result || finalAnswer;
      if (answerToStream) {
        const stream = this.messageProcessor.createAnswerStream(answerToStream);
        this.callbacks.onAnswerStream?.(stream);
      }

      // Complete answer phase
      this.messageProcessor.completeAnswer();
      this.callbacks.onPhaseComplete?.('answer');

      return answerToStream;

    } catch (error) {
      const errorMsg = (error as Error).message;
      
      // Don't show error for user cancellation
      if (errorMsg === 'Operation was cancelled') {
        throw error;
      }
      
      // MCP errors are disabled - silently ignore since we're not using MCP
      if (errorMsg.includes('mcp-config-invalid') || 
          errorMsg.includes('Missing environment variables') ||
          errorMsg.includes('Executable not found in $PATH')) {
        // Silently continue without MCP servers
        return '';
      }
      
      console.error('SDK Agent error:', error);
      throw error;
    } finally {
      this.currentQuery = null;
    }
  }

  /**
   * Gets all tracked tool calls from the message processor.
   */
  getToolCalls() {
    return this.messageProcessor.getToolCalls();
  }
}

// ============================================================================
// Factory Function
// ============================================================================

/**
 * Creates a new SDK agent instance.
 */
export function createSdkAgent(options: SdkAgentOptions): SdkAgent {
  return new SdkAgent(options);
}
