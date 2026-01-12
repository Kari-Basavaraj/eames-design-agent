// Updated: 2026-01-12 02:10:00
// Eames Design Agent - Hooks System
// Claude Code-like hooks for pre/post command execution

import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';
import { spawn } from 'child_process';

const EAMES_DIR = join(homedir(), '.eames');
const HOOKS_FILE = join(EAMES_DIR, 'hooks.json');

/**
 * Hook types
 */
export type HookType =
  | 'pre_tool'        // Before any tool execution
  | 'post_tool'       // After any tool execution
  | 'pre_query'       // Before processing a query
  | 'post_query'      // After processing a query
  | 'pre_file_write'  // Before writing a file
  | 'post_file_write' // After writing a file
  | 'pre_command'     // Before running a command
  | 'post_command'    // After running a command
  | 'on_error'        // On any error
  | 'on_start'        // On session start
  | 'on_exit';        // On session exit

/**
 * Hook definition
 */
export interface Hook {
  type: HookType;
  command: string;           // Shell command to run
  enabled: boolean;
  timeout?: number;          // Timeout in ms (default 5000)
  continueOnError?: boolean; // Continue if hook fails
  pattern?: string;          // Optional regex pattern to match (for tool names, file paths, etc.)
}

/**
 * Hooks configuration
 */
export interface HooksConfig {
  hooks: Hook[];
  globalEnabled: boolean;
}

/**
 * Default hooks configuration
 */
const DEFAULT_CONFIG: HooksConfig = {
  hooks: [],
  globalEnabled: true,
};

/**
 * Load hooks configuration
 */
export function loadHooksConfig(): HooksConfig {
  try {
    if (existsSync(HOOKS_FILE)) {
      const data = readFileSync(HOOKS_FILE, 'utf-8');
      return { ...DEFAULT_CONFIG, ...JSON.parse(data) };
    }
  } catch {
    // Fall through to defaults
  }
  return DEFAULT_CONFIG;
}

/**
 * Context passed to hooks
 */
export interface HookContext {
  type: HookType;
  toolName?: string;
  toolInput?: Record<string, unknown>;
  toolOutput?: string;
  query?: string;
  response?: string;
  filePath?: string;
  command?: string;
  error?: string;
  timestamp: number;
}

/**
 * Hook execution result
 */
export interface HookResult {
  success: boolean;
  output?: string;
  error?: string;
  blocked?: boolean; // If hook returned non-zero, should block the operation
}

/**
 * Execute a shell command with timeout
 */
async function executeCommand(
  command: string,
  env: Record<string, string>,
  timeout: number
): Promise<{ success: boolean; output: string; error?: string }> {
  return new Promise((resolve) => {
    const proc = spawn('sh', ['-c', command], {
      env: { ...process.env, ...env },
      timeout,
    });

    let stdout = '';
    let stderr = '';

    proc.stdout?.on('data', (data) => {
      stdout += data.toString();
    });

    proc.stderr?.on('data', (data) => {
      stderr += data.toString();
    });

    proc.on('close', (code) => {
      resolve({
        success: code === 0,
        output: stdout,
        error: stderr || undefined,
      });
    });

    proc.on('error', (err) => {
      resolve({
        success: false,
        output: '',
        error: err.message,
      });
    });

    // Handle timeout
    setTimeout(() => {
      proc.kill();
      resolve({
        success: false,
        output: stdout,
        error: 'Hook timed out',
      });
    }, timeout);
  });
}

/**
 * Run hooks of a specific type
 */
export async function runHooks(
  type: HookType,
  context: Partial<HookContext>
): Promise<HookResult[]> {
  const config = loadHooksConfig();

  if (!config.globalEnabled) {
    return [];
  }

  const matchingHooks = config.hooks.filter((hook) => {
    if (!hook.enabled) return false;
    if (hook.type !== type) return false;

    // Check pattern if specified
    if (hook.pattern) {
      const regex = new RegExp(hook.pattern);
      const toMatch = context.toolName || context.filePath || context.command || '';
      if (!regex.test(toMatch)) return false;
    }

    return true;
  });

  const results: HookResult[] = [];

  for (const hook of matchingHooks) {
    // Build environment variables for the hook
    const env: Record<string, string> = {
      EAMES_HOOK_TYPE: type,
      EAMES_TIMESTAMP: String(context.timestamp || Date.now()),
    };

    if (context.toolName) env.EAMES_TOOL_NAME = context.toolName;
    if (context.query) env.EAMES_QUERY = context.query;
    if (context.filePath) env.EAMES_FILE_PATH = context.filePath;
    if (context.command) env.EAMES_COMMAND = context.command;
    if (context.error) env.EAMES_ERROR = context.error;
    if (context.toolInput) env.EAMES_TOOL_INPUT = JSON.stringify(context.toolInput);
    if (context.toolOutput) env.EAMES_TOOL_OUTPUT = context.toolOutput.slice(0, 1000); // Truncate

    const timeout = hook.timeout || 5000;
    const result = await executeCommand(hook.command, env, timeout);

    const hookResult: HookResult = {
      success: result.success,
      output: result.output,
      error: result.error,
      blocked: !result.success && !hook.continueOnError,
    };

    results.push(hookResult);

    // If blocked, stop processing more hooks
    if (hookResult.blocked) {
      break;
    }
  }

  return results;
}

/**
 * Check if an operation should be blocked by hooks
 */
export async function shouldBlockOperation(
  type: HookType,
  context: Partial<HookContext>
): Promise<{ blocked: boolean; reason?: string }> {
  const results = await runHooks(type, context);

  for (const result of results) {
    if (result.blocked) {
      return {
        blocked: true,
        reason: result.error || result.output || 'Blocked by hook',
      };
    }
  }

  return { blocked: false };
}

/**
 * Create a sample hooks configuration
 */
export function createSampleHooksConfig(): HooksConfig {
  return {
    globalEnabled: true,
    hooks: [
      {
        type: 'pre_file_write',
        command: 'echo "Writing to: $EAMES_FILE_PATH"',
        enabled: false,
        timeout: 5000,
        continueOnError: true,
      },
      {
        type: 'post_query',
        command: 'echo "Query completed at $(date)"',
        enabled: false,
        timeout: 5000,
        continueOnError: true,
      },
      {
        type: 'pre_command',
        command: 'echo "Running: $EAMES_COMMAND"',
        enabled: false,
        timeout: 5000,
        pattern: '^(npm|bun|yarn)',
        continueOnError: true,
      },
    ],
  };
}

/**
 * Get hooks documentation
 */
export function getHooksDocumentation(): string {
  return `
# Eames Hooks System

Hooks allow you to run custom shell commands before/after Eames operations.

## Configuration

Create ~/.eames/hooks.json:

{
  "globalEnabled": true,
  "hooks": [
    {
      "type": "pre_file_write",
      "command": "echo $EAMES_FILE_PATH >> ~/.eames/write.log",
      "enabled": true,
      "timeout": 5000,
      "continueOnError": true,
      "pattern": "\\\\.ts$"
    }
  ]
}

## Hook Types

- pre_tool / post_tool - Before/after any tool
- pre_query / post_query - Before/after processing queries
- pre_file_write / post_file_write - Before/after file writes
- pre_command / post_command - Before/after shell commands
- on_error - When an error occurs
- on_start / on_exit - Session start/end

## Environment Variables

Hooks receive these environment variables:
- EAMES_HOOK_TYPE - The hook type
- EAMES_TOOL_NAME - Tool name (for tool hooks)
- EAMES_TOOL_INPUT - Tool input as JSON
- EAMES_FILE_PATH - File path (for file hooks)
- EAMES_COMMAND - Command (for command hooks)
- EAMES_QUERY - User query
- EAMES_ERROR - Error message (for error hooks)
- EAMES_TIMESTAMP - Unix timestamp

## Blocking Operations

If a hook returns non-zero and continueOnError is false,
the operation will be blocked.
`.trim();
}
