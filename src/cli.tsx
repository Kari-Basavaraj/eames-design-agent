#!/usr/bin/env bun
// Updated: 2026-02-16 00:00:00
/**
 * CLI - Multi-phase Agent Interface
 * 
 * Uses the agent with Understand, Plan, and Task Loop phases.
 */
import React from 'react';
import { useState, useCallback, useEffect, useRef } from 'react';
import { Box, Text, Static, useApp, useInput } from 'ink';
import { config } from 'dotenv';

import { Intro } from './components/Intro.js';
import { Input } from './components/Input.js';
import { AnswerBox } from './components/AnswerBox.js';
import { ProviderSelector, ModelSelector, getModelsForProvider, getDefaultModelForProvider } from './components/ModelSelector.js';
import { ApiKeyConfirm, ApiKeyInput } from './components/ApiKeyPrompt.js';
import { QueueDisplay } from './components/QueueDisplay.js';
import { AgentProgressView } from './components/AgentProgressView.js';
import { TaskListView } from './components/TaskListView.js';
import { PluginManager } from './components/PluginManager.js';
import { MCPManager } from './components/MCPManager.js';
import { SessionPicker } from './components/SessionPicker.js';
import { ClarificationPrompt } from './components/ClarificationPrompt.js';
import { ProceedPrompt } from './components/ProceedPrompt.js';
import { AskUserQuestionPrompt } from './components/AskUserQuestionPrompt.js';
import { SdkToolPermissionPrompt } from './components/SdkToolPermissionPrompt.js';
import { ToolCallsView } from './components/ToolCallsView.js';
import { ThinkingView } from './components/ThinkingView.js';
import { CostView } from './components/CostView.js';
import { SetupWizard, hasAnthropicKey } from './components/SetupWizard.js';
import { SkillsManager } from './components/SkillsManager.js';
import { HooksManager } from './components/HooksManager.js';
import { AgentsManager } from './components/AgentsManager.js';
import type { Task } from './types/state.js';
import type { AgentProgressState } from './components/AgentProgressView.js';
import type { SdkCurrentTurn } from './sdk/useSdkExecution.js';

// Cost & context tracking utilities
import { getDetailedUsage, getSessionUsage, formatTokens, formatCost } from './utils/cost-tracking.js';
import { getContextUsage, getContextLimit } from './utils/context-manager.js';

// Feature discovery loaders (Claude Code parity)
import { getSkillsSummary } from './sdk/skills-loader.js';
import { discoverAllUserCommands, loadCommandPrompt, getUserCommandsSummary } from './sdk/commands-loader.js';
import { getHooksSummary } from './sdk/hooks-loader.js';
import { getAgentsSummary } from './sdk/agents-loader.js';
import { getMemorySummary } from './sdk/memory-loader.js';
import { installPlugin, uninstallPlugin, getPluginsSummary } from './sdk/plugin-manager.js';
import { searchTools, getToolRegistrySummary, registerBuiltinTools } from './sdk/tool-search.js';

// Node.js built-ins for file operations
import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

import { useQueryQueue } from './hooks/useQueryQueue.js';
import { useAgentExecution } from './langchain/useAgentExecution.js';
import { useSdkAgentExecution } from './sdk/useSdkExecution.js';

import { getSetting, setSetting } from './utils/config.js';
import { 
  getApiKeyNameForProvider, 
  getProviderDisplayName, 
  checkApiKeyExistsForProvider,
  saveApiKeyForProvider 
} from './utils/env.js';
import { getOllamaModels } from './utils/ollama.js';
import { MessageHistory } from './langchain/message-history.js';

import { DEFAULT_PROVIDER } from './model/llm.js';
import { colors, spacing } from './theme.js';

import type { AppState } from './cli/types.js';
import type { PermissionMode, PermissionRequest } from './types/permissions.js';
import { PERMISSION_MODE_LABELS } from './types/permissions.js';

// Load environment variables
config({ quiet: true });

// ============================================================================
// Completed Turn Type and View
// ============================================================================

interface CompletedTurn {
  id: string;
  query: string;
  tasks: Task[];
  answer: string;
}

const CompletedTurnView = React.memo(function CompletedTurnView({ turn }: { turn: CompletedTurn }) {
  return (
    <Box flexDirection="column" marginBottom={1}>
      {/* Query */}
      <Box marginBottom={1}>
        <Text color={colors.primary} bold>{'❯ '}</Text>
        <Text color={colors.white} backgroundColor={colors.queryBg}>{` ${turn.query} `}</Text>
      </Box>

      {/* Answer - Claude Code style: minimal, just the answer */}
      <Box marginTop={1} marginLeft={2}>
        <AnswerBox text={turn.answer} />
      </Box>
    </Box>
  );
});

// ============================================================================
// Main CLI Component
// ============================================================================

interface CLIProps {
  initialQuery?: string;
}

// ============================================================================
// Slash Command Definitions (Claude Code Compatible)
// ============================================================================

const SLASH_COMMANDS: Record<string, { description: string; handler: string }> = {
  '/help': { description: 'Show available commands', handler: 'help' },
  '/clear': { description: 'Clear conversation history', handler: 'clear' },
  '/compact': { description: 'Compact conversation, keep context', handler: 'compact' },
  '/model': { description: 'Change AI model', handler: 'model' },
  '/mode': { description: 'Switch agent mode (sdk | langchain)', handler: 'mode' },
  '/cost': { description: 'Show token usage and cost', handler: 'cost' },
  '/context': { description: 'Show context window usage', handler: 'context' },
  '/status': { description: 'Show session status', handler: 'status' },
  '/resume': { description: 'Resume a previous SDK session', handler: 'resume' },
  '/permission': { description: 'Set SDK permission mode', handler: 'permission' },
  '/init': { description: 'Create CLAUDE.md project file', handler: 'init' },
  '/doctor': { description: 'Check installation health', handler: 'doctor' },
  '/stats': { description: 'Detailed session statistics', handler: 'stats' },
  '/skills': { description: 'Browse installed skills', handler: 'skills' },
  '/hooks': { description: 'Browse configured hooks', handler: 'hooks' },
  '/agents': { description: 'Browse configured subagents', handler: 'agents' },
  '/memory': { description: 'Show loaded CLAUDE.md files', handler: 'memory' },
  '/mcp': { description: 'Manage MCP servers', handler: 'mcp' },
  '/plugin': { description: 'Manage plugins (install/remove/list)', handler: 'plugin' },
  '/tools': { description: 'Search available tools', handler: 'tools' },
  '/version': { description: 'Show version', handler: 'version' },
  '/exit': { description: 'Exit Eames', handler: 'exit' },
};

// ============================================================================
// Main CLI Component
// ============================================================================

export function CLI({ initialQuery }: CLIProps) {
  const { exit } = useApp();

  // Start in 'setup' if no Anthropic key is configured
  const [state, setState] = useState<AppState>(() => hasAnthropicKey() ? 'idle' : 'setup');
  // Agent mode: SDK is default (Claude Code parity), LangChain is secondary
  const [agentMode, setAgentMode] = useState<'sdk' | 'langchain'>(() => {
    const envLc = process.env.EAMES_USE_LANGCHAIN === '1' || process.env.EAMES_USE_LANGCHAIN === 'true';
    const saved = getSetting('useSdkMode', true) as boolean;
    return envLc ? 'langchain' : saved ? 'sdk' : 'langchain';
  });
  const [provider, setProvider] = useState(() => getSetting('provider', DEFAULT_PROVIDER));
  const [model, setModel] = useState(() => {
    const savedModel = getSetting('modelId', null) as string | null;
    const savedProvider = getSetting('provider', DEFAULT_PROVIDER) as string;
    if (savedModel) {
      return savedModel;
    }
    // Default to first model for the provider
    return getDefaultModelForProvider(savedProvider) || 'claude-sonnet-4-5-20250929';
  });
  const [pendingProvider, setPendingProvider] = useState<string | null>(null);
  const [pendingModels, setPendingModels] = useState<string[]>([]);
  const [history, setHistory] = useState<CompletedTurn[]>([]);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);  // User input history for Up/Down
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [interruptedQuery, setInterruptedQuery] = useState<string | null>(null);
  const [pendingResumeSessionId, setPendingResumeSessionId] = useState<string | null>(null);

  // Permission and thinking modes
  const [permissionMode, setPermissionMode] = useState<PermissionMode>('default');
  const [thinkingMode, setThinkingMode] = useState(false);
  const [permissionRequest, setPermissionRequest] = useState<{
    type: 'file_edit' | 'bash_command' | 'file_delete';
    tool: string;
    description: string;
    preview?: string;
    resolve: (approved: boolean) => void;
  } | null>(null);

  // Store the current turn's tasks when answer starts streaming
  const currentTasksRef = useRef<Task[]>([]);

  const messageHistoryRef = useRef<MessageHistory>(new MessageHistory(model));

  const { queue: queryQueue, enqueue, shift: shiftQueue, clear: clearQueue } = useQueryQueue();

  /**
   * Cycle through permission modes
   */
  const cyclePermissionMode = useCallback(() => {
    const modes: PermissionMode[] = ['default', 'acceptEdits', 'plan', 'bypassPermissions'];
    const currentIndex = modes.indexOf(permissionMode);
    const nextIndex = (currentIndex + 1) % modes.length;
    setPermissionMode(modes[nextIndex]);
    setStatusMessage(`Permission mode: ${PERMISSION_MODE_LABELS[modes[nextIndex]]}`);
  }, [permissionMode]);

  /**
   * Toggle thinking mode
   */
  const toggleThinkingMode = useCallback(() => {
    setThinkingMode(prev => !prev);
    setStatusMessage(`Extended thinking: ${!thinkingMode ? 'ON' : 'OFF'}`);
  }, [thinkingMode]);

  /**
   * Handle permission request from SDK agent
   */
  const handlePermissionRequest = useCallback((request: PermissionRequest): Promise<boolean> => {
    return new Promise((resolve) => {
      setPermissionRequest({ ...request, resolve });
    });
  }, []);

  // LangChain agent (5-phase orchestrator)
  const langChainResult = useAgentExecution({
    model,
    messageHistory: messageHistoryRef.current,
  });

  // SDK model mapping for OpenRouter (openai/gpt-4o exists; gpt-5.2 does not)
  const openRouterModelMap: Record<string, string> = {
    'gpt-5.2': 'openai/gpt-4o',
    'gpt-4.1': 'openai/gpt-4o-mini',
    'gpt-4o': 'openai/gpt-4o',
    'gpt-4o-mini': 'openai/gpt-4o-mini',
    'gpt-4-turbo': 'openai/gpt-4-turbo',
  };
  const sdkModel =
    model.startsWith('claude-') ? model
    : openRouterModelMap[model] ?? (model.startsWith('gpt-') ? `openai/${model}` : model.startsWith('gemini-') ? `google/${model}` : model);
  const sdkResult = useSdkAgentExecution({ model: sdkModel });

  // Use active mode's result
  const activeResult = agentMode === 'sdk' ? sdkResult : langChainResult;
  const setSessionId = 'setSessionId' in activeResult ? activeResult.setSessionId : undefined;
  const {
    currentTurn,
    answerStream,
    isProcessing,
    processQuery,
    handleAnswerComplete: baseHandleAnswerComplete,
    cancelExecution,
    clarificationRequest,
    submitClarificationAnswer,
    proceedCheckpoint,
    submitProceedAnswer,
    askUserQuestionRequest,
    submitAskUserAnswer,
    toolPermissionRequest,
    submitToolPermissionAnswer,
  } = activeResult;

  // Capture tasks when answer stream starts
  useEffect(() => {
    if (answerStream && currentTurn) {
      currentTasksRef.current = [...currentTurn.state.tasks];
    }
  }, [answerStream, currentTurn]);

  // Track if initial query was processed
  const initialQueryProcessed = useRef(false);

  /**
   * Handles the completed answer and moves current turn to history
   */
  const handleAnswerComplete = useCallback((answer: string) => {
    if (currentTurn) {
      setHistory(h => [...h, {
        id: currentTurn.id,
        query: currentTurn.query,
        tasks: currentTasksRef.current,
        answer,
      }]);
    }
    baseHandleAnswerComplete(answer);
    currentTasksRef.current = [];
  }, [currentTurn, baseHandleAnswerComplete]);

  /**
   * Wraps processQuery to handle state transitions and errors
   */
  const executeQuery = useCallback(
    async (query: string, options?: { resume?: string; continue?: boolean }) => {
      setState('running');
      try {
        await processQuery(query, options);
      } catch (e) {
        setStatusMessage(`Error: ${e}`);
      } finally {
        setState('idle');
      }
    },
    [processQuery]
  );

  /**
   * Handle slash commands (Claude Code style)
   * Returns true if command was handled, false to pass through to agent
   */
  const handleSlashCommand = useCallback((input: string): boolean => {
    const parts = input.trim().split(' ');
    const command = parts[0].toLowerCase();
    const args = parts.slice(1).join(' ');

    switch (command) {
      case '/help':
      case '/h':
      case '/?': {
        const helpText = Object.entries(SLASH_COMMANDS)
          .map(([cmd, { description }]) => `  ${cmd.padEnd(14)} ${description}`)
          .join('\n');
        const userCmds = getUserCommandsSummary();
        const userSection = userCmds ? `\n\nCustom commands:\n${userCmds}` : '';
        setStatusMessage(`Available commands:\n${helpText}${userSection}\n\nPrefixes: ! bash  # memory`);
        return true;
      }

      case '/clear':
        setHistory([]);
        setStatusMessage('Conversation cleared');
        return true;

      case '/model':
        setState('provider_select');
        return true;

      // /sdk command removed - this is the LangChain version

      case '/exit':
      case '/quit':
      case '/q':
        console.log('Goodbye!');
        exit();
        return true;

      case '/status': {
        const modeLabel = agentMode === 'sdk' ? 'SDK (Claude Agent)' : 'LangChain (5-phase)';
        setStatusMessage(`Model: ${model}\nProvider: ${provider}\nAgent: ${modeLabel}`);
        return true;
      }

      case '/version': {
        const modeSuffix = agentMode === 'sdk' ? ' + SDK' : ' (5-phase)';
        setStatusMessage(`Eames v1.0.0${modeSuffix}`);
        return true;
      }

      case '/mode': {
        const next = args.toLowerCase().trim();
        if (next === 'sdk') {
          setAgentMode('sdk');
          setSetting('useSdkMode', true);
          setStatusMessage('Mode: SDK (Claude Agent)');
          return true;
        }
        if (next === 'langchain' || next === 'lc') {
          setAgentMode('langchain');
          setSetting('useSdkMode', false);
          setStatusMessage('Mode: LangChain (5-phase)');
          return true;
        }
        setStatusMessage('Usage: /mode sdk | /mode langchain');
        return true;
      }

      case '/permission': {
        if (agentMode !== 'sdk') {
          setStatusMessage('/permission is only available in SDK mode. Use /mode sdk first.');
          return true;
        }
        const raw = args.toLowerCase().trim();
        const map: Record<string, string> = {
          default: 'default',
          acceptedits: 'acceptEdits',
          plan: 'plan',
          bypass: 'bypassPermissions',
          bypasspermissions: 'bypassPermissions',
          dontask: 'dontAsk',
        };
        const normalized = map[raw];
        if (normalized) {
          setSetting('sdkPermissionMode', normalized);
          setStatusMessage(`Permission mode: ${normalized}`);
          return true;
        }
        setStatusMessage('Usage: /permission default | acceptEdits | plan | bypass');
        return true;
      }

      // Cost tracking - shows token usage and costs
      case '/cost': {
        const usage = getDetailedUsage();
        setStatusMessage(usage);
        return true;
      }

      // Context visualization - shows context window usage
      case '/context': {
        const sessionUsage = getSessionUsage();
        const totalTokens = sessionUsage.totalInputTokens + sessionUsage.totalOutputTokens;
        const maxTokens = getContextLimit(model);
        const usagePercent = Math.round((totalTokens / maxTokens) * 100);
        
        // Create visual bar
        const barWidth = 30;
        const filled = Math.round((usagePercent / 100) * barWidth);
        const empty = barWidth - filled;
        const bar = '█'.repeat(filled) + '░'.repeat(empty);
        
        const color = usagePercent >= 80 ? '🔴' : usagePercent >= 60 ? '🟡' : '🟢';
        
        const contextInfo = `Context Usage:
${color} [${bar}] ${usagePercent}%

Tokens: ${formatTokens(totalTokens)} / ${formatTokens(maxTokens)}
  Input:  ${formatTokens(sessionUsage.totalInputTokens)}
  Output: ${formatTokens(sessionUsage.totalOutputTokens)}
  
API Calls: ${sessionUsage.apiCalls}
Est. Cost: ${formatCost(sessionUsage.estimatedCost)}`;
        
        setStatusMessage(contextInfo);
        return true;
      }

      // Compact conversation - clears display but keeps summary in context
      case '/compact': {
        if (history.length === 0) {
          setStatusMessage('Nothing to compact - conversation is empty.');
          return true;
        }
        
        // Clear visible history but keep conversation context in SDK
        const messageCount = history.length;
        setHistory([]);
        setStatusMessage(`Compacted ${messageCount} messages. Context preserved in memory.`);
        return true;
      }

      case '/memory':
        setStatusMessage(getMemorySummary());
        return true;

      case '/mcp':
        setState('mcp_manager');
        return true;

      case '/plugin': {
        const subCmd = args.trim().split(/\s+/);
        if (subCmd[0] === 'install' && subCmd[1]) {
          const result = installPlugin(subCmd[1]);
          setStatusMessage(result.message);
          return true;
        }
        if ((subCmd[0] === 'remove' || subCmd[0] === 'uninstall') && subCmd[1]) {
          const result = uninstallPlugin(subCmd[1]);
          setStatusMessage(result.message);
          return true;
        }
        if (subCmd[0] === 'list' || !subCmd[0]) {
          setState('plugin_manager');
          return true;
        }
        setStatusMessage('Usage: /plugin install <npm-package> | /plugin remove <name> | /plugin list');
        return true;
      }

      case '/tools': {
        registerBuiltinTools();
        if (args.trim()) {
          const result = searchTools(args.trim());
          const lines = result.tools.map(t => `  ${t.name.padEnd(18)} ${t.description.slice(0, 50)} (${t.server})`);
          setStatusMessage(`Tool search: "${args.trim()}" — ${result.tools.length}/${result.totalCount} matches\n\n${lines.join('\n')}`);
        } else {
          setStatusMessage(getToolRegistrySummary());
        }
        return true;
      }

      case '/skills':
        setState('skills_manager');
        return true;

      case '/hooks':
        setStatusMessage(getHooksSummary());
        return true;

      case '/agents':
        setState('agents_manager');
        return true;

      case '/permissions': {
        const permMode = getSetting('sdkPermissionMode', 'default');
        const permModes: Record<string, string> = {
          default: 'Ask before dangerous tools (Bash, Edit, Write)',
          acceptEdits: 'Auto-approve file edits, ask for Bash',
          bypassPermissions: 'Skip all permission checks',
          plan: 'Read-only mode — no tool execution',
          dontAsk: 'Deny tools that need permission silently',
        };
        const lines = Object.entries(permModes).map(([mode, desc]) => {
          const marker = mode === permMode ? ' *' : '  ';
          return `${marker} ${mode.padEnd(22)} ${desc}`;
        });
        setStatusMessage(`Permission Mode: ${permMode}\n\n${lines.join('\n')}\n\nChange with: /permission <mode>`);
        return true;
      }

      case '/init': {
        // Create CLAUDE.md project file
        const claudeMdPath = path.join(process.cwd(), 'CLAUDE.md');
        
        if (fs.existsSync(claudeMdPath)) {
          setStatusMessage('CLAUDE.md already exists. Use /memory to edit it.');
          return true;
        }
        
        const template = `# Project Context

## Overview
<!-- Describe your project here -->

## Goals
<!-- What are you trying to accomplish? -->

## Key Files
<!-- Important files and their purposes -->

## Guidelines
<!-- Coding standards, preferences, etc. -->

## Notes
<!-- Any additional context for the AI assistant -->
`;
        
        fs.writeFileSync(claudeMdPath, template);
        setStatusMessage('✅ Created CLAUDE.md - Use /memory to edit project context.');
        return true;
      }

      case '/review': {
        // Send a code review request to the agent
        const reviewTarget = args.trim() || 'the current git diff';
        const reviewPrompt = `Please do a thorough code review of ${reviewTarget}. Check for:
1. Bugs and logic errors
2. Security vulnerabilities
3. Performance issues
4. Code style and readability
5. Missing error handling
6. Type safety issues

Provide specific line-by-line feedback with severity (critical/warning/info).`;
        if (state === 'running') {
          enqueue(reviewPrompt);
        } else {
          executeQuery(reviewPrompt);
        }
        return true;
      }

      case '/todos': {
        // Scan for TODOs in the current project
        try {
          const todoOutput = execSync(
            'rg --no-heading --line-number "TODO|FIXME|HACK|XXX|WARN" --type ts --type tsx --type js --type jsx -g "!node_modules" -g "!dist" 2>/dev/null | head -30',
            { cwd: process.cwd(), timeout: 5000, encoding: 'utf-8' }
          ).trim();
          if (todoOutput) {
            setStatusMessage(`TODOs in project:\n\n${todoOutput}`);
          } else {
            setStatusMessage('No TODO/FIXME comments found in project.');
          }
        } catch {
          // Fallback if rg not available
          try {
            const grepOutput = execSync(
              'grep -rn "TODO\\|FIXME\\|HACK" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" --exclude-dir=node_modules --exclude-dir=dist . 2>/dev/null | head -30',
              { cwd: process.cwd(), timeout: 5000, encoding: 'utf-8' }
            ).trim();
            setStatusMessage(grepOutput ? `TODOs in project:\n\n${grepOutput}` : 'No TODO/FIXME comments found.');
          } catch {
            setStatusMessage('No TODO/FIXME comments found in project.');
          }
        }
        return true;
      }

      case '/resume':
        setState('session_picker');
        return true;

      case '/stats': {
        const usage = getSessionUsage();
        const uptime = Math.round((Date.now() - usage.startTime) / 1000);
        const uptimeStr = uptime > 3600 
          ? `${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}m`
          : `${Math.floor(uptime / 60)}m ${uptime % 60}s`;
        const modeStr = agentMode === 'sdk' ? 'SDK (Claude Agent)' : 'LangChain (5-phase)';
        const sessionStr = agentMode === 'sdk' && sdkResult.lastSessionId 
          ? `\nSession: ${sdkResult.lastSessionId.slice(0, 12)}...` : '';
        
        const stats = `Session Statistics:

Messages: ${history.length}
API Calls: ${usage.apiCalls}
Input: ${formatTokens(usage.totalInputTokens)} tokens
Output: ${formatTokens(usage.totalOutputTokens)} tokens
Cost: ${formatCost(usage.estimatedCost)}
Uptime: ${uptimeStr}
Model: ${model}
Mode: ${modeStr}${sessionStr}`;
        
        setStatusMessage(stats);
        return true;
      }

      case '/doctor': {
        // Check installation health
        const checks: string[] = [];
        
        // Check Node/Bun runtime
        const runtime = typeof Bun !== 'undefined' ? 'Bun' : 'Node';
        checks.push(`✅ Runtime: ${runtime}`);
        
        // Check API key
        const hasKey = checkApiKeyExistsForProvider(provider);
        checks.push(hasKey ? `✅ API Key: ${getProviderDisplayName(provider)} configured` : `❌ API Key: ${getProviderDisplayName(provider)} not found`);
        
        // Check model
        checks.push(`✅ Model: ${model}`);
        
        // Check mode
        const modeLabel = agentMode === 'sdk' ? 'SDK (Claude Agent)' : 'LangChain (5-phase)';
        checks.push(`✅ Mode: ${modeLabel}`);
        
        // Check working directory
        checks.push(`✅ Working Directory: ${process.cwd()}`);
        
        // Check for CLAUDE.md
        const claudeMdExists = fs.existsSync('CLAUDE.md');
        checks.push(claudeMdExists ? '✅ CLAUDE.md: Found' : 'ℹ️ CLAUDE.md: Not found (optional)');

        // Check skills, hooks, agents, memory
        const skillsSummary = getSkillsSummary();
        const hooksSummary = getHooksSummary();
        const agentsSummary = getAgentsSummary();
        const memorySummary = getMemorySummary();
        const skillLine = skillsSummary.startsWith('No') ? 'ℹ️ Skills: none' : `ℹ️ Skills: ${skillsSummary.split('\n')[0]}`;
        const hookLine = hooksSummary.startsWith('No') ? 'ℹ️ Hooks: none' : `ℹ️ Hooks: ${hooksSummary.split('\n')[0]}`;
        const agentLine = agentsSummary.startsWith('No') ? 'ℹ️ Agents: none' : `ℹ️ Agents: ${agentsSummary.split('\n')[0]}`;
        const memoryLine = memorySummary.startsWith('No') ? 'ℹ️ Memory: none' : `ℹ️ Memory: ${memorySummary.split('\n')[0]}`;
        
        checks.push(skillLine);
        checks.push(hookLine);
        checks.push(agentLine);
        checks.push(memoryLine);
        
        const doctorOutput = `Installation Health Check:

${checks.join('\n')}

All systems operational!`;
        
        setStatusMessage(doctorOutput);
        return true;
      }

      case '/theme': {
        const currentTheme = getSetting('theme', 'blue');
        const themes: Record<string, string> = {
          blue: 'Eames Blue (default)',
          dark: 'Dark Minimal',
          light: 'Light Mode',
          green: 'Matrix Green',
        };
        if (args.trim() && themes[args.trim()]) {
          setSetting('theme', args.trim());
          setStatusMessage(`Theme set to: ${themes[args.trim()]}. Restart Eames to apply.`);
        } else if (args.trim()) {
          setStatusMessage(`Unknown theme. Available: ${Object.keys(themes).join(', ')}`);
        } else {
          const lines = Object.entries(themes).map(([key, name]) => {
            const marker = key === currentTheme ? ' *' : '  ';
            return `${marker} ${key.padEnd(10)} ${name}`;
          });
          setStatusMessage(`Current theme: ${currentTheme}\n\n${lines.join('\n')}\n\nUsage: /theme <name>`);
        }
        return true;
      }

      case '/vim': {
        const vimEnabled = getSetting('vimMode', false);
        const newState = !vimEnabled;
        setSetting('vimMode', newState);
        setStatusMessage(`Vim mode: ${newState ? 'enabled' : 'disabled'}. Restart Eames to apply.`);
        return true;
      }

      case '/rename': {
        const newName = args.trim();
        if (!newName) {
          setStatusMessage('Usage: /rename <session-name>');
          return true;
        }
        const sessionId = sdkResult.lastSessionId;
        if (!sessionId) {
          setStatusMessage('No active SDK session to rename.');
          return true;
        }
        setSetting(`session_name_${sessionId}`, newName);
        setStatusMessage(`Session renamed to: ${newName}`);
        return true;
      }

      default: {
        // Check user-created commands (.claude/commands/*.md)
        if (command.startsWith('/')) {
          const cmdName = command.slice(1); // strip /
          const userCommands = discoverAllUserCommands();
          const userCmd = userCommands.find(c => c.name === cmdName);
          if (userCmd) {
            const prompt = loadCommandPrompt(userCmd.path, args);
            if (prompt) {
              // Execute the user command as an agent query
              if (state === 'running') {
                enqueue(prompt);
              } else {
                executeQuery(prompt);
              }
              return true;
            }
          }
          setStatusMessage(`Unknown command: ${command}. Type /help for available commands.`);
          return true;
        }
        return false;
      }
    }
  }, [model, provider, exit, setStatusMessage, setSetting, setHistory, setState, state, enqueue, executeQuery]);

  /**
   * Process next queued query when state becomes idle
   */
  useEffect(() => {
    if (state === 'idle' && queryQueue.length > 0) {
      const nextQuery = queryQueue[0];
      shiftQueue();
      executeQuery(nextQuery);
    }
  }, [state, queryQueue, shiftQueue, executeQuery]);

  // Auto-submit initial query from command line
  useEffect(() => {
    if (initialQuery && !initialQueryProcessed.current && state === 'idle') {
      initialQueryProcessed.current = true;
      executeQuery(initialQuery);
    }
  }, [initialQuery, state, executeQuery]);

  const handleSubmit = useCallback(
    (query: string) => {
      // Route to clarification flow when agent is gathering details (vague prompts)
      if (clarificationRequest && submitClarificationAnswer) {
        submitClarificationAnswer(query);
        return;
      }

      // Route to SDK AskUserQuestion when Claude Agent asks multiple-choice questions
      if (askUserQuestionRequest && submitAskUserAnswer) {
        submitAskUserAnswer(query);
        return;
      }

      // Route to SDK tool permission (Bash, Edit, Write) when permissionMode is default
      if (toolPermissionRequest && submitToolPermissionAnswer) {
        const lower = query.trim().toLowerCase();
        submitToolPermissionAnswer(lower === 'y' || lower === 'yes');
        return;
      }

      // Route to proceed checkpoint when agent asks "Should I proceed?"
      if (proceedCheckpoint && submitProceedAnswer) {
        const lower = query.trim().toLowerCase();
        if (lower === 'n' || lower === 'no' || lower === 'stop') {
          submitProceedAnswer('stop');
        } else {
          submitProceedAnswer('proceed');
        }
        return;
      }

      // Clear interrupted state when user submits a new query
      setInterruptedQuery(null);

      // Add to command history (avoid duplicates of last command)
      if (query.trim() && (commandHistory.length === 0 || commandHistory[commandHistory.length - 1] !== query)) {
        setCommandHistory(prev => [...prev.slice(-100), query]);  // Keep last 100 commands
      }

      // Handle slash commands (Claude Code style)
      if (query.startsWith('/')) {
        const handled = handleSlashCommand(query);
        if (handled) return;
      }

      // SDK: Resume session - pass when user selected session from /resume picker
      const resumeOpts =
        agentMode === 'sdk' && pendingResumeSessionId
          ? { resume: pendingResumeSessionId }
          : undefined;
      if (resumeOpts) setPendingResumeSessionId(null);

      // Handle bash mode (!) - Claude Code style
      // Run command directly and add output to context
      if (query.startsWith('!')) {
        const bashCommand = query.slice(1).trim();
        if (bashCommand) {
          // Transform to an agent query that runs the command
          const agentQuery = `Run this bash command and show me the output: \`${bashCommand}\``;
          if (state === 'running') {
            enqueue(agentQuery);
          } else {
            executeQuery(agentQuery, resumeOpts);
          }
        }
        return;
      }

      // Handle memory mode (#) - Claude Code style
      // Update CLAUDE.md with the instruction
      if (query.startsWith('#')) {
        const memoryInstruction = query.slice(1).trim();
        if (memoryInstruction) {
          // Transform to an agent query that updates CLAUDE.md
          const agentQuery = `Add this instruction to the project's CLAUDE.md file: "${memoryInstruction}"`;
          if (state === 'running') {
            enqueue(agentQuery);
          } else {
            executeQuery(agentQuery, resumeOpts);
          }
        }
        return;
      }

      // Handle exit commands (with or without slash)
      const lowerQuery = query.toLowerCase();
      if (lowerQuery === 'exit' || lowerQuery === 'quit') {
        console.log('Goodbye!');
        exit();
        return;
      }

      // Queue the query if already running
      if (state === 'running') {
        enqueue(query);
        return;
      }

      // Process immediately if idle
      executeQuery(query, resumeOpts);
    },
    [state, exit, enqueue, executeQuery, handleSlashCommand, clarificationRequest, submitClarificationAnswer, askUserQuestionRequest, submitAskUserAnswer, toolPermissionRequest, submitToolPermissionAnswer, proceedCheckpoint, submitProceedAnswer, agentMode, pendingResumeSessionId]
  );

  /**
   * Called when user selects a provider from the selector
   */
  const handleProviderSelect = useCallback(async (providerId: string | null) => {
    if (providerId) {
      setPendingProvider(providerId);
      
      // Fetch models for the provider
      if (providerId === 'ollama') {
        // For Ollama, fetch locally downloaded models
        const ollamaModels = await getOllamaModels();
        setPendingModels(ollamaModels);
      } else {
        // For cloud providers, use predefined models
        setPendingModels(getModelsForProvider(providerId));
      }
      
      setState('model_select');
    } else {
      setState('idle');
    }
  }, []);

  /**
   * Called when user selects a model from the selector
   */
  const handleModelSelect = useCallback((modelId: string | null) => {
    if (!modelId || !pendingProvider) {
      // User cancelled - go back to provider select
      setPendingProvider(null);
      setPendingModels([]);
      setState('provider_select');
      return;
    }

    // For Ollama, skip API key flow entirely
    if (pendingProvider === 'ollama') {
      const fullModelId = `ollama:${modelId}`;
      setProvider(pendingProvider);
      setModel(fullModelId);
      setSetting('provider', pendingProvider);
      setSetting('modelId', fullModelId);
      messageHistoryRef.current.setModel(fullModelId);
      setPendingProvider(null);
      setPendingModels([]);
      setState('idle');
      return;
    }

    // For cloud providers, check API key
    if (checkApiKeyExistsForProvider(pendingProvider)) {
      // API key exists, complete the switch
      setProvider(pendingProvider);
      setModel(modelId);
      setSetting('provider', pendingProvider);
      setSetting('modelId', modelId);
      messageHistoryRef.current.setModel(modelId);
      setPendingProvider(null);
      setPendingModels([]);
      setState('idle');
    } else {
      // Need to get API key
      // Store the selected model temporarily
      setPendingModels([modelId]); // Reuse to store selected model
      setState('api_key_confirm');
    }
  }, [pendingProvider]);

  /**
   * Called when user confirms/declines setting API key
   */
  const handleApiKeyConfirm = useCallback((wantsToSet: boolean) => {
    if (wantsToSet) {
      setState('api_key_input');
    } else {
      // Check if existing key is available
      if (pendingProvider && checkApiKeyExistsForProvider(pendingProvider)) {
        // Use existing key, complete the provider switch
        const selectedModel = pendingModels[0]; // Model was stored here
        setProvider(pendingProvider);
        setModel(selectedModel);
        setSetting('provider', pendingProvider);
        setSetting('modelId', selectedModel);
        messageHistoryRef.current.setModel(selectedModel);
      } else {
        setStatusMessage(`Cannot use ${pendingProvider ? getProviderDisplayName(pendingProvider) : 'provider'} without an API key.`);
      }
      setPendingProvider(null);
      setPendingModels([]);
      setState('idle');
    }
  }, [pendingProvider, pendingModels]);

  /**
   * Called when user submits API key
   */
  const handleApiKeySubmit = useCallback((apiKey: string | null) => {
    const selectedModel = pendingModels[0]; // Model was stored here
    
    if (apiKey && pendingProvider) {
      const saved = saveApiKeyForProvider(pendingProvider, apiKey);
      if (saved) {
        setProvider(pendingProvider);
        setModel(selectedModel);
        setSetting('provider', pendingProvider);
        setSetting('modelId', selectedModel);
        messageHistoryRef.current.setModel(selectedModel);
      } else {
        setStatusMessage('Failed to save API key.');
      }
    } else if (!apiKey && pendingProvider && checkApiKeyExistsForProvider(pendingProvider)) {
      // Cancelled but existing key available
      setProvider(pendingProvider);
      setModel(selectedModel);
      setSetting('provider', pendingProvider);
      setSetting('modelId', selectedModel);
      messageHistoryRef.current.setModel(selectedModel);
    } else {
      setStatusMessage('API key not set. Provider unchanged.');
    }
    setPendingProvider(null);
    setPendingModels([]);
    setState('idle');
  }, [pendingProvider, pendingModels]);

  useInput((input, key) => {
    // Handle permission prompt input
    if (permissionRequest) {
      if (input === 'y' || input === 'Y') {
        permissionRequest.resolve(true);
        setPermissionRequest(null);
        return;
      }
      if (input === 'n' || input === 'N') {
        permissionRequest.resolve(false);
        setPermissionRequest(null);
        return;
      }
      return; // Block other input while permission prompt is showing
    }

    // Handle proceed checkpoint - Y/n for continue or stop
    if (proceedCheckpoint && submitProceedAnswer) {
      if (input === 'y' || input === 'Y') {
        submitProceedAnswer('proceed');
        return;
      }
      if (input === 'n' || input === 'N') {
        submitProceedAnswer('stop');
        return;
      }
      return; // Block other input while proceed prompt is showing
    }

    // Shift+Tab - cycle permission modes
    if (input === '\x1b[Z') {
      cyclePermissionMode();
      return;
    }

    // Alt+T - toggle thinking mode
    if (input === '\x1bt' || input === '†') {
      toggleThinkingMode();
      return;
    }

    // Alt+P - open model picker
    if (input === '\x1bp' || input === 'π') {
      setState('model_select');
      setPendingProvider(provider);
      setPendingModels(getModelsForProvider(provider));
      return;
    }

    // Escape key - cancel running operations
    if (key.escape) {
      if (state === 'running') {
        // Capture the query before cancelling
        const queryToInterrupt = currentTurn?.query || null;
        setState('idle');
        cancelExecution();
        clearQueue();
        setInterruptedQuery(queryToInterrupt);
      } else if (state === 'provider_select' || state === 'model_select' || state === 'api_key_confirm' || state === 'api_key_input') {
        setPendingProvider(null);
        setPendingModels([]);
        setState('idle');
        setStatusMessage('Cancelled.');
      } else if (state === 'plugin_manager' || state === 'mcp_manager' || state === 'skills_manager' || state === 'hooks_manager' || state === 'agents_manager') {
        setState('idle');
      }
      return;
    }

    // Ctrl+C - cancel or exit
    if (key.ctrl && input === 'c') {
      if (state === 'running') {
        // Capture the query before cancelling
        const queryToInterrupt = currentTurn?.query || null;
        setState('idle');
        cancelExecution();
        clearQueue();
        setInterruptedQuery(queryToInterrupt);
      } else if (state === 'provider_select' || state === 'model_select' || state === 'api_key_confirm' || state === 'api_key_input') {
        setPendingProvider(null);
        setPendingModels([]);
        setState('idle');
        setStatusMessage('Cancelled.');
      } else if (state === 'plugin_manager' || state === 'mcp_manager' || state === 'skills_manager' || state === 'hooks_manager' || state === 'agents_manager') {
        setState('idle');
      } else {
        console.log('\nGoodbye!');
        exit();
      }
    }
  });

  // Setup wizard - first-run API key configuration
  if (state === 'setup') {
    return (
      <Box flexDirection="column">
        <SetupWizard onComplete={() => setState('idle')} />
      </Box>
    );
  }

  if (state === 'provider_select') {
    return (
      <Box flexDirection="column">
        <ProviderSelector provider={provider} onSelect={handleProviderSelect} />
      </Box>
    );
  }

  if (state === 'model_select' && pendingProvider) {
    return (
      <Box flexDirection="column">
        <ModelSelector
          providerId={pendingProvider}
          models={pendingModels}
          currentModel={provider === pendingProvider ? model : undefined}
          onSelect={handleModelSelect}
        />
      </Box>
    );
  }

  if (state === 'api_key_confirm' && pendingProvider) {
    return (
      <Box flexDirection="column">
        <ApiKeyConfirm 
          providerName={getProviderDisplayName(pendingProvider)} 
          onConfirm={handleApiKeyConfirm} 
        />
      </Box>
    );
  }

  if (state === 'api_key_input' && pendingProvider) {
    const apiKeyName = getApiKeyNameForProvider(pendingProvider) || '';
    return (
      <Box flexDirection="column">
        <ApiKeyInput 
          providerName={getProviderDisplayName(pendingProvider)}
          apiKeyName={apiKeyName}
          onSubmit={handleApiKeySubmit} 
        />
      </Box>
    );
  }

  // Plugin Manager
  if (state === 'plugin_manager') {
    return (
      <Box flexDirection="column">
        <PluginManager
          onClose={() => setState('idle')}
          onStatusMessage={setStatusMessage}
        />
      </Box>
    );
  }

  // MCP Manager
  if (state === 'mcp_manager') {
    return (
      <Box flexDirection="column">
        <MCPManager
          onClose={() => setState('idle')}
          onStatusMessage={setStatusMessage}
        />
      </Box>
    );
  }

  // Skills Manager
  if (state === 'skills_manager') {
    return (
      <Box flexDirection="column">
        <SkillsManager
          onClose={() => setState('idle')}
          onStatusMessage={setStatusMessage}
        />
      </Box>
    );
  }

  // Hooks Manager
  if (state === 'hooks_manager') {
    return (
      <Box flexDirection="column">
        <HooksManager
          onClose={() => setState('idle')}
          onStatusMessage={setStatusMessage}
        />
      </Box>
    );
  }

  // Agents Manager
  if (state === 'agents_manager') {
    return (
      <Box flexDirection="column">
        <AgentsManager
          onClose={() => setState('idle')}
          onStatusMessage={setStatusMessage}
        />
      </Box>
    );
  }

  // Session Picker
  if (state === 'session_picker') {
    return (
      <Box flexDirection="column">
        <SessionPicker
          onSelect={(sessionId) => {
            if (agentMode === 'sdk') {
              setPendingResumeSessionId(sessionId);
              setStatusMessage('Session loaded. Type your message to continue.');
            } else {
              setStatusMessage('Session resume: use /mode sdk first for SDK sessions.');
            }
            setState('idle');
          }}
          onCancel={() => {
            setState('idle');
          }}
        />
      </Box>
    );
  }

  // Combine intro and history - LIMIT to last 3 turns for clean UI
  const staticItems: Array<{ type: 'intro'; key: string } | { type: 'turn'; turn: CompletedTurn; key: string }> = [
    { type: 'intro', key: 'intro' },
    ...history.slice(-3).map(h => ({ type: 'turn' as const, turn: h, key: h.id })),
  ];

  return (
    <Box flexDirection="column">
      {/* LangChain version - no status bar */}

      {/* Intro + completed history - COLLAPSED (last 3 only) */}
      <Static items={staticItems}>
        {(item) =>
          item.type === 'intro' ? (
            <Intro key={item.key} provider={provider} model={model} useSdkMode={agentMode === 'sdk'} />
          ) : (
            <CompletedTurnView key={item.key} turn={item.turn} />
          )
        }
      </Static>

      {/* Show interrupted query if cancelled */}
      {interruptedQuery && !currentTurn && (
        <Box flexDirection="column">
          {/* Original query */}
          <Box>
            <Text color={colors.primary} bold>{'❯ '}</Text>
            <Text color={colors.white} backgroundColor={colors.queryBg}>{` ${interruptedQuery} `}</Text>
          </Box>
          {/* Interrupted message */}
          <Box marginTop={1}>
            <Text color="red">⚠️  Interrupted</Text>
          </Box>
        </Box>
      )}

      {/* Current turn - Claude Code style */}
      {currentTurn && (
        <Box flexDirection="column">
          {/* User query */}
          <Box marginTop={1}>
            <Text color={colors.primary} bold>❯ </Text>
            <Text color={colors.white}>{currentTurn.query}</Text>
          </Box>
          
          {/* SDK mode: Thinking indicator */}
          {agentMode === 'sdk' && (currentTurn as SdkCurrentTurn).isThinking && (
            <Box marginLeft={2} marginTop={1}>
              <ThinkingView 
                isThinking={(currentTurn as SdkCurrentTurn).isThinking}
                thinkingText={(currentTurn as SdkCurrentTurn).thinkingText}
              />
            </Box>
          )}

          {/* SDK mode: Inline tool calls (Claude Code style) */}
          {agentMode === 'sdk' && (currentTurn as SdkCurrentTurn).toolCalls?.length > 0 && (
            <Box marginLeft={2} marginTop={1}>
              <ToolCallsView toolCalls={(currentTurn as SdkCurrentTurn).toolCalls} />
            </Box>
          )}

          {/* LangChain mode: Phase progress */}
          {agentMode === 'langchain' && currentTurn.state.progressMessage && (
            <Box marginLeft={2} marginTop={1}>
              <AgentProgressView state={currentTurn.state} />
            </Box>
          )}
          
          {/* LangChain mode: Task list */}
          {agentMode === 'langchain' && currentTurn.state.tasks.length > 0 && (
            <Box marginLeft={2} marginTop={1}>
              <TaskListView tasks={currentTurn.state.tasks} />
            </Box>
          )}

          {/* Streaming answer */}
          {answerStream && (
            <Box marginLeft={2} marginTop={1}>
              <AnswerBox
                stream={answerStream}
                onComplete={handleAnswerComplete}
              />
            </Box>
          )}

          {/* SDK mode: Cost/token counter after turn */}
          {agentMode === 'sdk' && (currentTurn as SdkCurrentTurn).cost?.totalTokens > 0 && (
            <Box marginLeft={2} marginTop={0}>
              <CostView 
                cost={(currentTurn as SdkCurrentTurn).cost}
                sessionId={(currentTurn as SdkCurrentTurn).sessionId}
              />
            </Box>
          )}
        </Box>
      )}

      {/* Clarification prompt - when agent needs more details (vague prompts) */}
      {clarificationRequest && (
        <ClarificationPrompt request={clarificationRequest} />
      )}

      {/* Proceed checkpoint - when agent asks to continue (e.g. after PRD) */}
      {proceedCheckpoint && (
        <ProceedPrompt request={proceedCheckpoint} />
      )}

      {/* SDK AskUserQuestion - when Claude Agent asks multiple-choice questions */}
      {askUserQuestionRequest && (
        <AskUserQuestionPrompt request={askUserQuestionRequest} />
      )}

      {/* SDK tool permission - Bash, Edit, Write (permissionMode: default) */}
      {toolPermissionRequest && (
        <SdkToolPermissionPrompt request={toolPermissionRequest} />
      )}

      {/* Queued queries */}
      <QueueDisplay queries={queryQueue} />

      {/* Status message - icon separate so wrapped text aligns with message, not under icon */}
      {statusMessage && (
        <Box marginTop={1} flexDirection="row">
          <Text color="gray">ℹ️  </Text>
          <Text color="gray">{statusMessage}</Text>
        </Box>
      )}

      {/* Permission prompt - Claude Code style */}
      {permissionRequest && (
        <Box flexDirection="column" marginTop={2} marginBottom={1}>
          {/* Header with warning */}
          <Box marginBottom={1}>
            <Text color="yellow" bold>⚠️  Permission Required</Text>
          </Box>

          {/* Tool and action description */}
          <Box marginLeft={2} flexDirection="column">
            <Box>
              <Text color="white" bold>{permissionRequest.tool}</Text>
              <Text color="gray" dimColor> wants to execute:</Text>
            </Box>

            {/* Preview/Command - highlighted */}
            {permissionRequest.preview && permissionRequest.preview.trim() && (
              <Box marginTop={1} flexDirection="column">
                <Box 
                  paddingX={2} 
                  paddingY={1} 
                  borderStyle="single" 
                  borderColor="gray"
                  flexDirection="column"
                >
                  {permissionRequest.preview.split('\n').slice(0, 10).map((line, i) => (
                    <Text key={i} color="cyan">
                      {line}
                    </Text>
                  ))}
                  {permissionRequest.preview.split('\n').length > 10 && (
                    <Text color="gray" dimColor>
                      ... ({permissionRequest.preview.split('\n').length - 10} more lines)
                    </Text>
                  )}
                </Box>
              </Box>
            )}
          </Box>

          {/* Action buttons - prominent */}
          <Box marginTop={1} marginLeft={2}>
            <Text color="green" bold>Y</Text>
            <Text color="white"> Approve  </Text>
            <Text color="red" bold>N</Text>
            <Text color="white"> Deny</Text>
          </Box>
        </Box>
      )}

      {/* Input bar - always visible and interactive */}
      <Box marginTop={2}>
        <Input onSubmit={handleSubmit} commandHistory={commandHistory} />
      </Box>
    </Box>
  );
}
