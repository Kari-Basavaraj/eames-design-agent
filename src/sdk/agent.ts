// Updated: 2026-02-16 14:00:00
// Eames Design Agent - Claude Agent SDK Wrapper
// 100% Claude Code CLI parity — handles ALL SDK message types

import { query, type Query, type SDKMessage } from '@anthropic-ai/claude-agent-sdk';
import { DEFAULT_SYSTEM_PROMPT } from '../shared/prompts.js';
import { loadAllMcpServers } from './mcp-loader.js';
import type { SdkPermissionMode, SdkQueryOptions } from './options.js';

// ============================================================================
// Types
// ============================================================================

const TOOLS_NEEDING_PERMISSION = new Set(['Bash', 'Edit', 'Write', 'FileEdit', 'FileWrite']);

/** Base callbacks shared between SDK and LangChain modes */
interface BaseCallbacks {
  onProgressMessage?: (message: string) => void;
  onSdkMessage?: (message: unknown) => void;
}

export interface SdkAgentCallbacks extends BaseCallbacks {
  /** Called with assistant text tokens (answer content only) */
  onText?: (text: string) => void;
  /** Called when a tool call starts */
  onToolStart?: (toolName: string, description: string) => void;
  /** Called when a tool call completes */
  onToolEnd?: (toolName: string, result?: string) => void;
  /** Called with tool progress updates */
  onToolProgress?: (toolName: string, elapsed: number) => void;
  /** Called when SDK sends a system message */
  onSystemMessage?: (text: string) => void;
  /** Called with the full result at the end */
  onResult?: (result: string, sessionId?: string) => void;
  /** Called when extended thinking content arrives */
  onThinking?: (text: string) => void;
  /** Called with token/cost usage from the result */
  onUsage?: (usage: { inputTokens: number; outputTokens: number; cacheReadTokens?: number; cacheCreationTokens?: number }) => void;
  /** Called when auth status changes */
  onAuthStatus?: (status: string) => void;
  /** Called for subagent/task notifications */
  onSubagent?: (agentId: string, status: string, message?: string) => void;
}

export interface SdkAgentOptions extends Partial<SdkQueryOptions> {
  model: string;
  callbacks?: SdkAgentCallbacks;
  signal?: AbortSignal;
  systemPrompt?: string;
  cwd?: string;
  onAskUserQuestion?: (request: AskUserQuestionRequest) => Promise<AskUserQuestionAnswers>;
  onToolPermissionRequest?: (request: SdkToolPermissionRequest) => Promise<boolean>;
}

export interface SdkToolPermissionRequest {
  toolName: string;
  input: Record<string, unknown>;
  description?: string;
  preview?: string;
}

export interface AskUserQuestionOption {
  label: string;
  description: string;
}

export interface AskUserQuestionItem {
  question: string;
  header: string;
  options: AskUserQuestionOption[];
  multiSelect?: boolean;
}

export interface AskUserQuestionRequest {
  questions: AskUserQuestionItem[];
}

export interface AskUserQuestionAnswers {
  answers: Array<{ selectedLabels: string[]; customText?: string }>;
}

// ============================================================================
// SdkAgent
// ============================================================================

export class SdkAgent {
  private readonly options: SdkAgentOptions;
  private readonly callbacks: SdkAgentCallbacks;
  private queryRef: Query | null = null;

  constructor(options: SdkAgentOptions) {
    this.options = options;
    this.callbacks = options.callbacks ?? {};
  }

  async run(userQuery: string): Promise<string> {
    const opts = this.options;
    const abortController = new AbortController();
    const effectiveSignal = opts.signal ?? abortController.signal;

    if (opts.signal) {
      opts.signal.addEventListener('abort', () => abortController.abort());
    }

    let fullAnswer = '';
    const permissionMode = (opts.permissionMode ?? 'default') as SdkPermissionMode;

    const canUseTool =
      opts.onAskUserQuestion || opts.onToolPermissionRequest
        ? async (
          toolName: string,
          input: Record<string, unknown>,
          _toolOpts: {
            signal: AbortSignal;
            toolUseID: string;
            suggestions?: unknown[];
            blockedPath?: string;
            decisionReason?: string;
            agentID?: string;
          }
        ) => {
          if (toolName === 'AskUserQuestion' && opts.onAskUserQuestion) {
            const questions = normalizeAskUserQuestionInput(input);
            if (questions.length === 0) {
              return { behavior: 'deny' as const, message: 'No questions in AskUserQuestion input' };
            }
            const answers = await opts.onAskUserQuestion!({ questions });
            return { behavior: 'allow' as const, updatedInput: { answers: answers.answers } };
          }

          if (permissionMode === 'bypassPermissions') return { behavior: 'allow' as const };
          if (permissionMode === 'acceptEdits' && ['Edit', 'Write', 'FileEdit', 'FileWrite'].includes(toolName)) {
            return { behavior: 'allow' as const };
          }
          if (permissionMode === 'plan' && TOOLS_NEEDING_PERMISSION.has(toolName)) {
            return { behavior: 'deny' as const, message: 'Plan mode: no tool execution' };
          }
          if (permissionMode === 'dontAsk' && TOOLS_NEEDING_PERMISSION.has(toolName)) {
            return { behavior: 'deny' as const, message: 'Tool not pre-approved' };
          }

          if (
            permissionMode === 'default' &&
            TOOLS_NEEDING_PERMISSION.has(toolName) &&
            opts.onToolPermissionRequest
          ) {
            const description = getToolDescription(toolName, input);
            const preview = getToolPreview(toolName, input);
            const allowed = await opts.onToolPermissionRequest({
              toolName,
              input,
              description,
              preview,
            });
            return allowed
              ? { behavior: 'allow' as const }
              : { behavior: 'deny' as const, message: 'User denied' };
          }

          return { behavior: 'allow' as const };
        }
        : undefined;

    const mcpServers = opts.mcpServers ?? loadAllMcpServers();
    const hasMcp = Object.keys(mcpServers).length > 0;

    const queryOptions: Record<string, unknown> = {
      model: opts.model,
      cwd: opts.cwd ?? process.cwd(),
      abortController,
      systemPrompt: opts.systemPrompt ?? DEFAULT_SYSTEM_PROMPT,
      tools: opts.tools ?? { type: 'preset', preset: 'claude_code' },
      canUseTool,
      includePartialMessages: true,
      permissionMode: opts.permissionMode ?? 'default',
      persistSession: opts.persistSession ?? true,
      env: {
        ...process.env,
        ...opts.env,
        CLAUDE_AGENT_SDK_CLIENT_APP: opts.env?.CLAUDE_AGENT_SDK_CLIENT_APP ?? 'eames/1.0.0',
      },
    };

    if (hasMcp) queryOptions.mcpServers = mcpServers;
    if (opts.resume) queryOptions.resume = opts.resume;
    if (opts.continue) queryOptions.continue = opts.continue;
    if (opts.sessionId) queryOptions.sessionId = opts.sessionId;
    if (opts.additionalDirectories?.length) queryOptions.additionalDirectories = opts.additionalDirectories;
    if (opts.thinking) queryOptions.thinking = opts.thinking;
    if (opts.effort) queryOptions.effort = opts.effort;
    if (opts.maxTurns) queryOptions.maxTurns = opts.maxTurns;
    if (opts.maxBudgetUsd) queryOptions.maxBudgetUsd = opts.maxBudgetUsd;
    if (opts.permissionMode === 'bypassPermissions') {
      queryOptions.allowDangerouslySkipPermissions = opts.allowDangerouslySkipPermissions ?? true;
    }
    if (opts.plugins?.length) queryOptions.plugins = opts.plugins;
    if (opts.hooks) queryOptions.hooks = opts.hooks;

    try {
      const q = query({
        prompt: userQuery,
        options: queryOptions as import('@anthropic-ai/claude-agent-sdk').Options,
      });

      this.queryRef = q;

      for await (const msg of q) {
        if (effectiveSignal.aborted) {
          q.close();
          break;
        }

        this.callbacks.onSdkMessage?.(msg);
        this.processMessage(msg);
      }
    } finally {
      this.queryRef = null;
    }

    return fullAnswer;
  }

  /**
   * Process ALL SDK message types and route to callbacks.
   * Some message types (hooks, task_notification, files_persisted, user_replay)
   * may not be in the SDKMessage union yet but arrive at runtime.
   */
  private processMessage(msg: SDKMessage): void {
    const cb = this.callbacks;
    const m = msg as Record<string, unknown>;
    const msgType = msg.type as string;

    switch (msgType) {
      // ── Text & tool use from assistant ──
      case 'assistant': {
        const content = (m.message as Record<string, unknown>)?.content as Array<Record<string, unknown>> | undefined;
        if (!content) break;
        for (const block of content) {
          if (block.type === 'text' && block.text) {
            cb.onText?.(block.text as string);
          }
          if (block.type === 'thinking' && block.thinking) {
            cb.onThinking?.(block.thinking as string);
          }
          if (block.type === 'tool_use' && block.name) {
            const desc = getToolDescription(block.name as string, (block.input ?? {}) as Record<string, unknown>);
            cb.onToolStart?.(block.name as string, desc);
          }
        }
        break;
      }

      // ── Streaming deltas ──
      case 'stream_event': {
        const ev = m.event as Record<string, unknown> | undefined;
        if (!ev) break;
        const delta = ev.delta as Record<string, unknown> | undefined;
        const block = ev.content_block as Record<string, unknown> | undefined;

        if (ev.type === 'content_block_delta') {
          if (delta?.type === 'text_delta' && delta.text) {
            cb.onText?.(delta.text as string);
          }
          if (delta?.type === 'thinking_delta' && delta.thinking) {
            cb.onThinking?.(delta.thinking as string);
          }
        }
        if (ev.type === 'content_block_start' && block?.type === 'tool_use' && block?.name) {
          cb.onToolStart?.(block.name as string, block.name as string);
        }
        // Usage from message_delta
        if (ev.type === 'message_delta') {
          const usage = (ev as Record<string, unknown>).usage as Record<string, number> | undefined;
          if (usage) {
            cb.onUsage?.({
              inputTokens: usage.input_tokens ?? 0,
              outputTokens: usage.output_tokens ?? 0,
            });
          }
        }
        break;
      }

      // ── Tool progress (spinner) ──
      case 'tool_progress': {
        if (m.tool_name) {
          cb.onToolProgress?.(m.tool_name as string, (m.elapsed_time_seconds as number) ?? 0);
        }
        break;
      }

      // ── Tool completed ──
      case 'tool_use_summary': {
        if (m.tool_name) {
          cb.onToolEnd?.(m.tool_name as string, m.result_summary as string | undefined);
        }
        break;
      }

      // ── System messages ──
      case 'system': {
        if (m.text) {
          cb.onSystemMessage?.(m.text as string);
        }
        break;
      }

      // ── Final result (success/error) ──
      case 'result': {
        if (m.subtype === 'success') {
          if (m.result) cb.onResult?.(m.result as string, m.session_id as string | undefined);
          // Extract usage from result
          const usage = m.usage as Record<string, number> | undefined;
          if (usage) {
            cb.onUsage?.({
              inputTokens: usage.input_tokens ?? 0,
              outputTokens: usage.output_tokens ?? 0,
              cacheReadTokens: usage.cache_read_input_tokens ?? 0,
              cacheCreationTokens: usage.cache_creation_input_tokens ?? 0,
            });
          }
        } else {
          const errors = m.errors as string[] | undefined;
          if (errors?.length) {
            cb.onText?.(`\nError: ${errors.join(', ')}`);
          }
        }
        break;
      }

      // ── Auth status (API key validation) ──
      case 'auth_status': {
        const status = (m.status as string) ?? (m.authenticated ? 'authenticated' : 'unauthenticated');
        cb.onAuthStatus?.(status);
        break;
      }

      // ── Hook lifecycle (pre/post tool hooks) ──
      case 'hook_started': {
        const hookName = (m.hook_name as string) ?? 'hook';
        cb.onSystemMessage?.(`Hook started: ${hookName}`);
        break;
      }
      case 'hook_progress': {
        // Silent — hooks run in background
        break;
      }
      case 'hook_response': {
        const hookResult = m.result as string | undefined;
        if (hookResult) cb.onSystemMessage?.(`Hook: ${hookResult}`);
        break;
      }

      // ── Task/subagent notifications ──
      case 'task_notification': {
        const agentId = (m.agent_id as string) ?? 'subagent';
        const status = (m.status as string) ?? '';
        const message = m.message as string | undefined;
        cb.onSubagent?.(agentId, status, message);
        break;
      }

      // ── Files persisted to disk ──
      case 'files_persisted': {
        // Silent — files are written, nothing to display
        break;
      }

      // ── User replay (re-sending previous messages) ──
      case 'user_replay': {
        // Silent — SDK replaying conversation context
        break;
      }

      default:
        // Unknown message types are silently ignored
        break;
    }
  }

  async cancel(): Promise<void> {
    if (this.queryRef) {
      this.queryRef.close();
      this.queryRef = null;
    }
  }
}

// ============================================================================
// Helpers
// ============================================================================

function getToolDescription(toolName: string, input: Record<string, unknown>): string {
  if (toolName === 'Bash') return `${input?.command ?? 'Run command'}`;
  if (toolName === 'Read' || toolName === 'FileRead') return `Read ${input?.path ?? input?.file_path ?? 'file'}`;
  if (toolName === 'Edit' || toolName === 'FileEdit') return `Edit ${input?.path ?? input?.file_path ?? 'file'}`;
  if (toolName === 'Write' || toolName === 'FileWrite') return `Write ${input?.path ?? input?.file_path ?? 'file'}`;
  if (toolName === 'MultiEdit' || toolName === 'MultiFileEdit') return `Edit ${(input?.files as unknown[])?.length ?? ''} files`;
  if (toolName === 'Glob') return `Glob ${input?.pattern ?? ''}`;
  if (toolName === 'Grep') return `Grep ${input?.pattern ?? ''}`;
  if (toolName === 'WebFetch') return `Fetch ${input?.url ?? ''}`;
  if (toolName === 'WebSearch') return `Search: ${input?.query ?? ''}`;
  if (toolName === 'TodoWrite') return 'Update todos';
  if (toolName === 'TodoRead') return 'Read todos';
  if (toolName === 'NotebookEdit') return `Edit notebook ${input?.path ?? ''}`;
  if (toolName === 'LS') return `List ${input?.path ?? '.'}`;
  return `${toolName}`;
}

function getToolPreview(toolName: string, input: Record<string, unknown>): string {
  if (toolName === 'Bash') return String(input?.command ?? '');
  if (toolName === 'Edit' || toolName === 'FileEdit') {
    const edits = input?.edits ?? input?.changes;
    return typeof edits === 'string' ? edits : JSON.stringify(edits ?? {}, null, 2);
  }
  if (toolName === 'Write' || toolName === 'FileWrite') return String(input?.contents ?? '').slice(0, 200);
  return '';
}

function normalizeAskUserQuestionInput(input: Record<string, unknown>): AskUserQuestionItem[] {
  const raw = input?.questions;
  if (!Array.isArray(raw) || raw.length === 0) return [];
  return raw
    .filter((q): q is Record<string, unknown> => q && typeof q === 'object')
    .map((q) => ({
      question: String(q.question ?? ''),
      header: String(q.header ?? ''),
      options: Array.isArray(q.options)
        ? (q.options as Array<{ label?: string; description?: string }>).map((o) => ({
          label: String(o?.label ?? ''),
          description: String(o?.description ?? ''),
        }))
        : [],
      multiSelect: Boolean(q.multiSelect),
    }))
    .filter((q) => q.question);
}

// ============================================================================
// Factory
// ============================================================================

export function createSdkAgent(options: SdkAgentOptions): SdkAgent {
  return new SdkAgent(options);
}
