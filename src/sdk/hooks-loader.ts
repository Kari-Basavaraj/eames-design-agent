// Updated: 2026-02-16 15:00:00
// Eames Design Agent - Hooks Discovery & Loader
// Claude Code parity: loads hooks from settings.json (user + project)

import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

// ============================================================================
// Types
// ============================================================================

/** Claude Code hook event types */
export type HookEvent =
  | 'PreToolUse'
  | 'PostToolUse'
  | 'UserPromptSubmit'
  | 'Notification'
  | 'Stop'
  | 'SubagentStop'
  | 'SessionStart';

export interface HookMatcher {
  /** Tool name matcher (regex or exact, e.g. "Edit|Write") */
  matcher?: string;
  hooks: HookDefinition[];
}

export interface HookDefinition {
  type: 'command' | 'prompt';
  /** Shell command to run (for type: command) */
  command?: string;
  /** LLM prompt (for type: prompt) */
  prompt?: string;
}

export interface HookInfo {
  /** Event that triggers this hook */
  event: HookEvent;
  /** Matcher pattern (if any) */
  matcher: string;
  /** Hook type: command (shell) or prompt (LLM) */
  type: 'command' | 'prompt';
  /** Command or prompt value */
  value: string;
  /** Source: user or project */
  source: 'user' | 'project';
}

// ============================================================================
// Discovery
// ============================================================================

function loadHooksFromSettings(filePath: string, source: 'user' | 'project'): HookInfo[] {
  const hooks: HookInfo[] = [];
  if (!existsSync(filePath)) return hooks;

  try {
    const data = JSON.parse(readFileSync(filePath, 'utf-8'));
    const hooksConfig = data.hooks as Record<string, HookMatcher[]> | undefined;
    if (!hooksConfig) return hooks;

    for (const [event, matchers] of Object.entries(hooksConfig)) {
      if (!Array.isArray(matchers)) continue;
      for (const matcher of matchers) {
        const matcherStr = matcher.matcher || '*';
        if (!Array.isArray(matcher.hooks)) continue;
        for (const hook of matcher.hooks) {
          hooks.push({
            event: event as HookEvent,
            matcher: matcherStr,
            type: hook.type || 'command',
            value: hook.command || hook.prompt || '',
            source,
          });
        }
      }
    }
  } catch {
    // Invalid settings file
  }

  return hooks;
}

/**
 * Discover all configured hooks from:
 * 1. User: ~/.claude/settings.json
 * 2. Project: .claude/settings.json
 */
export function discoverAllHooks(): HookInfo[] {
  const hooks: HookInfo[] = [];

  // 1. User-level hooks
  const userSettings = join(homedir(), '.claude', 'settings.json');
  hooks.push(...loadHooksFromSettings(userSettings, 'user'));

  // 2. Project-level hooks
  const projectSettings = join(process.cwd(), '.claude', 'settings.json');
  hooks.push(...loadHooksFromSettings(projectSettings, 'project'));

  return hooks;
}

/**
 * Get a summary of hooks for /hooks display.
 */
export function getHooksSummary(): string {
  const hooks = discoverAllHooks();
  if (hooks.length === 0) return 'No hooks configured.\nAdd hooks to .claude/settings.json';

  const byEvent = new Map<string, HookInfo[]>();
  for (const hook of hooks) {
    const list = byEvent.get(hook.event) || [];
    list.push(hook);
    byEvent.set(hook.event, list);
  }

  const parts: string[] = [`${hooks.length} hook(s) configured:`];
  for (const [event, eventHooks] of byEvent) {
    parts.push(`\n  ${event}:`);
    for (const hook of eventHooks) {
      const matchStr = hook.matcher !== '*' ? ` [${hook.matcher}]` : '';
      const src = hook.source === 'project' ? '' : ' (user)';
      const val = hook.value.length > 60 ? hook.value.slice(0, 57) + '...' : hook.value;
      parts.push(`    ${hook.type}${matchStr}: ${val}${src}`);
    }
  }

  return parts.join('\n');
}
