// Updated: 2026-02-16
// SDK Options - Full Claude Code CLI parity
// All options supported by @anthropic-ai/claude-agent-sdk query()

import type { McpServerConfig } from '@anthropic-ai/claude-agent-sdk';

/** Permission mode - mirrors Claude Code CLI */
export type SdkPermissionMode =
  | 'default'
  | 'acceptEdits'
  | 'bypassPermissions'
  | 'plan'
  | 'delegate'
  | 'dontAsk';

/** Full SDK options passed to query() - Claude Code parity */
export interface SdkQueryOptions {
  model?: string;
  cwd?: string;
  systemPrompt?: string;
  abortController?: AbortController;

  // Tools
  tools?: string[] | { type: 'preset'; preset: 'claude_code' };
  allowedTools?: string[];
  disallowedTools?: string[];

  // Permissions
  permissionMode?: SdkPermissionMode;
  allowDangerouslySkipPermissions?: boolean;

  // Sessions
  resume?: string;
  continue?: boolean;
  sessionId?: string;
  resumeSessionAt?: string;
  forkSession?: boolean;
  persistSession?: boolean;

  // MCP & Plugins
  mcpServers?: Record<string, McpServerConfig>;
  plugins?: Array<{ type: 'local'; path: string }>;

  // Environment & Paths
  env?: Record<string, string | undefined>;
  additionalDirectories?: string[];
  pathToClaudeCodeExecutable?: string;
  executable?: 'bun' | 'deno' | 'node';
  executableArgs?: string[];
  extraArgs?: Record<string, string | null>;

  // Thinking & Limits
  thinking?: { type: 'adaptive' } | { type: 'enabled'; budgetTokens: number } | { type: 'disabled' };
  effort?: 'low' | 'medium' | 'high' | 'max';
  maxThinkingTokens?: number;
  maxTurns?: number;
  maxBudgetUsd?: number;

  // Callbacks
  canUseTool?: import('@anthropic-ai/claude-agent-sdk').CanUseTool;
  hooks?: Partial<
    Record<
      import('@anthropic-ai/claude-agent-sdk').HookEvent,
      import('@anthropic-ai/claude-agent-sdk').HookCallbackMatcher[]
    >
  >;

  // Other
  includePartialMessages?: boolean;
  enableFileCheckpointing?: boolean;
  fallbackModel?: string;
  outputFormat?: import('@anthropic-ai/claude-agent-sdk').OutputFormat;
  permissionPromptToolName?: string;
  agent?: string;
  agents?: Record<string, import('@anthropic-ai/claude-agent-sdk').AgentDefinition>;
  sandbox?: import('@anthropic-ai/claude-agent-sdk').SandboxSettings;
  betas?: import('@anthropic-ai/claude-agent-sdk').SdkBeta[];
}
