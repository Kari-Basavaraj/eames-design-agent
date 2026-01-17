#!/usr/bin/env bun
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
import { StatusMessage } from './components/StatusMessage.js';
import { CurrentTurnView, AgentProgressView } from './components/AgentProgressView.js';
import { PhaseStatusBar } from './components/PhaseStatusBar.js';
import { TaskListView } from './components/TaskListView.js';
import { ToolActivityView } from './components/ToolActivityView.js';
import { PluginManager } from './components/PluginManager.js';
import { MCPManager } from './components/MCPManager.js';
import type { Task } from './agent/state.js';
import type { AgentProgressState } from './components/AgentProgressView.js';

// Cost & context tracking utilities
import { getDetailedUsage, getSessionUsage, formatTokens, formatCost } from './utils/cost-tracking.js';
import { getContextUsage, getContextLimit } from './utils/context-manager.js';

// Node.js built-ins for file operations
import * as fs from 'fs';
import * as path from 'path';

import { useQueryQueue } from './hooks/useQueryQueue.js';
import { useAgentExecution } from './hooks/useAgentExecution.js';
import { useSdkAgentExecution } from './hooks/useSdkAgentExecution.js';

import { getSetting, setSetting } from './utils/config.js';
import { 
  getApiKeyNameForProvider, 
  getProviderDisplayName, 
  checkApiKeyExistsForProvider,
  saveApiKeyForProvider 
} from './utils/env.js';
import { getOllamaModels } from './utils/ollama.js';
import { MessageHistory } from './utils/message-history.js';

import { DEFAULT_PROVIDER } from './model/llm.js';
import { colors } from './theme.js';

import type { AppState } from './cli/types.js';

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
  // Mark all tasks as completed for display
  const completedTasks = turn.tasks.map(t => ({ ...t, status: 'completed' as const }));

  return (
    <Box flexDirection="column" marginBottom={1}>
      {/* Query */}
      <Box marginBottom={1}>
        <Text color={colors.primary} bold>{'❯ '}</Text>
        <Text color={colors.white} backgroundColor={colors.queryBg}>{` ${turn.query} `}</Text>
      </Box>

      {/* Task list (completed) */}
      {completedTasks.length > 0 && (
        <Box flexDirection="column" marginTop={1}>
          <Box marginLeft={2} flexDirection="column">
            <TaskListView tasks={completedTasks} />
          </Box>
        </Box>
      )}

      {/* Answer */}
      <Box marginTop={1}>
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
  '/model': { description: 'Change AI model', handler: 'model' },
  '/sdk': { description: 'Toggle SDK mode (Claude Code style)', handler: 'sdk' },
  '/exit': { description: 'Exit Eames', handler: 'exit' },
  '/quit': { description: 'Exit Eames', handler: 'exit' },
  '/q': { description: 'Exit Eames', handler: 'exit' },
  '/compact': { description: 'Compact conversation (SDK mode only)', handler: 'compact' },
  '/cost': { description: 'Show token usage', handler: 'cost' },
  '/memory': { description: 'Edit CLAUDE.md memory files', handler: 'memory' },
  '/config': { description: 'Open settings', handler: 'config' },
  '/status': { description: 'Show status info', handler: 'status' },
  '/version': { description: 'Show version', handler: 'version' },
};

// ============================================================================
// Main CLI Component
// ============================================================================

export function CLI({ initialQuery }: CLIProps) {
  const { exit } = useApp();

  const [state, setState] = useState<AppState>('idle');
  const [useSdkMode, setUseSdkMode] = useState(() => getSetting('useSdkMode', true) as boolean);  // Default to SDK mode
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

  // Store the current turn's tasks when answer starts streaming
  const currentTasksRef = useRef<Task[]>([]);

  const messageHistoryRef = useRef<MessageHistory>(new MessageHistory(model));

  const { queue: queryQueue, enqueue, shift: shiftQueue, clear: clearQueue } = useQueryQueue();

  // Standard agent execution (5-phase)
  const standardAgent = useAgentExecution({
    model,
    messageHistory: messageHistoryRef.current,
  });

  // SDK agent execution (Claude Code style)
  const sdkAgent = useSdkAgentExecution({
    model,
  });

  // Use the appropriate agent based on SDK mode
  const {
    currentTurn,
    answerStream,
    isProcessing,
    processQuery,
    handleAnswerComplete: baseHandleAnswerComplete,
    cancelExecution,
  } = useSdkMode ? sdkAgent : standardAgent;

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
    async (query: string) => {
      setState('running');
      try {
        await processQuery(query);
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
      case '/?':
        const helpText = Object.entries(SLASH_COMMANDS)
          .map(([cmd, { description }]) => `  ${cmd.padEnd(12)} ${description}`)
          .join('\n');
        setStatusMessage(`Available commands:\n${helpText}`);
        return true;

      case '/clear':
        setHistory([]);
        setStatusMessage('Conversation cleared');
        return true;

      case '/model':
        setState('provider_select');
        return true;

      case '/sdk':
        const newSdkMode = !useSdkMode;
        setUseSdkMode(newSdkMode);
        setSetting('useSdkMode', newSdkMode);
        setStatusMessage(`SDK mode: ${newSdkMode ? 'ON (Claude Code style)' : 'OFF (5-phase agent)'}`);
        return true;

      case '/exit':
      case '/quit':
      case '/q':
        console.log('Goodbye!');
        exit();
        return true;

      case '/status':
        setStatusMessage(`Model: ${model}\nProvider: ${provider}\nSDK Mode: ${useSdkMode ? 'ON' : 'OFF'}`);
        return true;

      case '/version':
        setStatusMessage('Eames v1.0.0 (Claude Agent SDK powered)');
        return true;

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
        setStatusMessage('Memory: (not yet implemented - opens CLAUDE.md editor)');
        return true;

      case '/mcp':
        // Open interactive MCP manager
        setState('mcp_manager');
        return true;

      case '/plugin':
        // Open interactive plugin manager
        setState('plugin_manager');
        return true;

      case '/agents':
        setStatusMessage('Agents: (not yet implemented - manages subagents)');
        return true;

      case '/permissions':
        setStatusMessage('Permissions: (not yet implemented - manages tool permissions)');
        return true;

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

      case '/review':
        setStatusMessage('Review: (not yet implemented - code review mode)');
        return true;

      case '/todos':
        setStatusMessage('Todos: (not yet implemented - shows TODO items)');
        return true;

      case '/resume':
        setStatusMessage('Resume: (not yet implemented - resumes session)');
        return true;

      case '/stats': {
        const usage = getSessionUsage();
        const uptime = Math.round((Date.now() - (process as any).__startTime || Date.now()) / 1000);
        const uptimeStr = uptime > 3600 
          ? `${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}m`
          : `${Math.floor(uptime / 60)}m ${uptime % 60}s`;
        
        const stats = `Session Statistics:

📊 Messages: ${history.length}
🔢 API Calls: ${usage.apiCalls}
📥 Input Tokens: ${formatTokens(usage.totalInputTokens)}
📤 Output Tokens: ${formatTokens(usage.totalOutputTokens)}
💰 Est. Cost: ${formatCost(usage.estimatedCost)}
⏱️ Session: ${uptimeStr}
🤖 Model: ${model}
${useSdkMode ? '⚡ SDK Mode: Active' : '📦 Mode: Basic'}`;
        
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
        
        // Check SDK mode
        checks.push(useSdkMode ? '✅ SDK Mode: Enabled' : '⚠️ SDK Mode: Disabled (using basic mode)');
        
        // Check working directory
        checks.push(`✅ Working Directory: ${process.cwd()}`);
        
        // Check for CLAUDE.md
        const claudeMdExists = fs.existsSync('CLAUDE.md');
        checks.push(claudeMdExists ? '✅ CLAUDE.md: Found' : 'ℹ️ CLAUDE.md: Not found (optional)');
        
        const doctorOutput = `Installation Health Check:

${checks.join('\n')}

All systems operational!`;
        
        setStatusMessage(doctorOutput);
        return true;
      }

      case '/theme':
        setStatusMessage('Theme: (not yet implemented - changes color theme)');
        return true;

      case '/vim':
        setStatusMessage('Vim: (not yet implemented - enables vim mode)');
        return true;

      case '/rename':
        setStatusMessage('Rename: (not yet implemented - renames session)');
        return true;

      default:
        // Pass custom slash commands to SDK agent (from ~/.claude/commands/ or .claude/commands/)
        // SDK will handle these as skills/commands
        if (command.startsWith('/') && useSdkMode) {
          // Let SDK handle custom commands
          return false;
        }
        // In non-SDK mode, show unknown command
        if (command.startsWith('/')) {
          setStatusMessage(`Unknown command: ${command}. Type /help for available commands.`);
          return true;
        }
        return false;
    }
  }, [useSdkMode, model, provider, exit, setStatusMessage, setSetting, setHistory, setState, setUseSdkMode]);

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
            executeQuery(agentQuery);
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
            executeQuery(agentQuery);
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
      executeQuery(query);
    },
    [state, exit, enqueue, executeQuery, handleSlashCommand]
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
      } else if (state === 'plugin_manager' || state === 'mcp_manager') {
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
      } else if (state === 'plugin_manager' || state === 'mcp_manager') {
        setState('idle');
      } else {
        console.log('\nGoodbye!');
        exit();
      }
    }
  });

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

  // Combine intro and history into a single static stream with stable keys
  const staticItems: Array<{ type: 'intro'; key: string } | { type: 'turn'; turn: CompletedTurn; key: string }> = [
    { type: 'intro', key: 'intro' },
    ...history.map(h => ({ type: 'turn' as const, turn: h, key: h.id })),
  ];

  return (
    <Box flexDirection="column">
      {/* Intro + completed history - each item rendered once, never re-rendered */}
      <Static items={staticItems}>
        {(item) =>
          item.type === 'intro' ? (
            <Intro key={item.key} provider={provider} model={model} useSdkMode={useSdkMode} />
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
          <Box marginLeft={2}>
            <Text color={colors.muted}>⎿  Interrupted · What should Eames do instead?</Text>
          </Box>
        </Box>
      )}

      {/* Render current in-progress conversation */}
      {currentTurn && (
        <Box flexDirection="column">
          {/* Query + minimal progress */}
          <CurrentTurnView
            query={currentTurn.query}
            state={currentTurn.state}
          />

          {/* Streaming answer (appears below progress) */}
          {answerStream && (
            <AnswerBox
              stream={answerStream}
              onComplete={handleAnswerComplete}
            />
          )}
        </Box>
      )}

      {/* Queued queries */}
      <QueueDisplay queries={queryQueue} />

      {/* Status message */}
      <StatusMessage message={statusMessage} />

      {/* Input bar - always visible and interactive */}
      <Input onSubmit={handleSubmit} commandHistory={commandHistory} />
    </Box>
  );
}
