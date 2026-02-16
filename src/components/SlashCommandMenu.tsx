// Updated: 2026-01-13 01:45:00
// Slash Command Autocomplete Menu - Complete Claude Code style dropdown

import React from 'react';
import { Box, Text } from 'ink';
import { colors } from '../theme.js';

export interface SlashCommand {
  command: string;
  description: string;
  category?: string;
  immediate?: boolean; // Submit immediately without waiting for args
}

interface SlashCommandMenuProps {
  commands: SlashCommand[];
  filter: string;
  selectedIndex: number;
  visible: boolean;
}

export function SlashCommandMenu({ 
  commands, 
  filter, 
  selectedIndex, 
  visible 
}: SlashCommandMenuProps) {
  if (!visible || commands.length === 0) return null;

  // Limit to 10 visible items
  const maxVisible = 10;
  const displayCommands = commands.slice(0, maxVisible);
  
  // Clamp selectedIndex to valid range
  const safeIndex = Math.max(0, Math.min(selectedIndex, displayCommands.length - 1));

  return (
    <Box 
      flexDirection="column" 
      borderStyle="round" 
      borderColor={colors.primary}
      paddingX={1}
      marginBottom={1}
    >
      <Box marginBottom={0}>
        <Text color={colors.muted} dimColor>
          Slash Commands {commands.length > maxVisible && `(${commands.length} total)`}
        </Text>
      </Box>
      
      {displayCommands.map((cmd, index) => {
        const isSelected = index === safeIndex;
        
        return (
          <Box key={cmd.command} paddingY={0}>
            <Text 
              color={isSelected ? colors.white : colors.muted}
              backgroundColor={isSelected ? colors.primary : undefined}
              bold={isSelected}
            >
              {isSelected ? ' › ' : '   '}
            </Text>
            <Text 
              color={isSelected ? colors.white : colors.primary}
              backgroundColor={isSelected ? colors.primary : undefined}
              bold
            >
              {cmd.command.padEnd(20)}
            </Text>
            <Text 
              color={isSelected ? colors.white : colors.muted}
              backgroundColor={isSelected ? colors.primary : undefined}
              dimColor={!isSelected}
            >
              {cmd.description}
            </Text>
            {cmd.category && (
              <Text 
                color={colors.muted} 
                dimColor
              >
                {' '}({cmd.category})
              </Text>
            )}
          </Box>
        );
      })}
      
      <Box marginTop={0}>
        <Text color={colors.muted} dimColor>
          ↑↓ navigate • Tab/Enter select • Esc close
        </Text>
      </Box>
    </Box>
  );
}

// Complete Claude Code slash commands list
export const SLASH_COMMANDS: SlashCommand[] = [
  // Session Management
  { command: '/clear', description: 'Clear conversation history', category: 'session', immediate: true },
  { command: '/compact', description: 'Compact conversation with optional focus', category: 'session' },
  { command: '/resume', description: 'Resume a previous session', category: 'session' },
  { command: '/rename', description: 'Rename current session', category: 'session' },
  { command: '/exit', description: 'Exit the application', category: 'session', immediate: true },
  { command: '/quit', description: 'Exit the application', category: 'session', immediate: true },
  
  // Model & Configuration
  { command: '/model', description: 'Select or change the AI model', category: 'config', immediate: true },
  { command: '/config', description: 'Open settings interface', category: 'config', immediate: true },
  { command: '/permissions', description: 'View or update permissions', category: 'config', immediate: true },
  { command: '/theme', description: 'Change color theme', category: 'config', immediate: true },
  { command: '/vim', description: 'Enable vim mode', category: 'config', immediate: true },
  { command: '/output-style', description: 'Set output verbosity style', category: 'config' },
  
  // Tools & Integrations
  { command: '/mcp', description: 'Manage MCP server connections', category: 'tools', immediate: true },
  { command: '/memory', description: 'Show loaded CLAUDE.md files', category: 'tools', immediate: true },
  { command: '/plugin', description: 'Manage plugins', category: 'tools', immediate: true },
  { command: '/skills', description: 'Browse installed skills', category: 'tools', immediate: true },
  { command: '/agents', description: 'Browse subagents', category: 'tools', immediate: true },
  { command: '/hooks', description: 'Browse configured hooks', category: 'tools', immediate: true },
  { command: '/tools', description: 'Search available tools', category: 'tools' },
  { command: '/ide', description: 'Manage IDE integrations', category: 'tools', immediate: true },
  
  // Information & Stats
  { command: '/help', description: 'Show usage help', category: 'info', immediate: true },
  { command: '/status', description: 'Show version, model, and account info', category: 'info', immediate: true },
  { command: '/cost', description: 'Show token usage statistics', category: 'info', immediate: true },
  { command: '/context', description: 'Visualize current context usage', category: 'info', immediate: true },
  { command: '/stats', description: 'Show usage graphs and session history', category: 'info', immediate: true },
  { command: '/usage', description: 'Show plan usage and rate limits', category: 'info', immediate: true },
  { command: '/doctor', description: 'Check installation health', category: 'info', immediate: true },
  
  // Project & Code
  { command: '/init', description: 'Initialize project with CLAUDE.md', category: 'project', immediate: true },
  { command: '/review', description: 'Request code review', category: 'project' },
  { command: '/security-review', description: 'Security review of pending changes', category: 'project' },
  { command: '/todos', description: 'List current TODO items', category: 'project', immediate: true },
  { command: '/add-dir', description: 'Add additional working directories', category: 'project' },
  
  // Advanced
  { command: '/plan', description: 'Enter plan mode', category: 'mode', immediate: true },
  { command: '/sandbox', description: 'Enable sandboxed bash execution', category: 'mode', immediate: true },
  { command: '/rewind', description: 'Rewind conversation and/or code', category: 'mode', immediate: true },
  { command: '/export', description: 'Export conversation to file', category: 'mode' },
  { command: '/bashes', description: 'List background tasks', category: 'mode', immediate: true },
  
  // Eames-specific
  { command: '/sdk', description: 'Toggle SDK mode (Claude Code style)', category: 'eames', immediate: true },
];

// Get filtered commands
export function getFilteredCommands(filter: string): SlashCommand[] {
  const normalizedFilter = filter.toLowerCase().replace(/^\//, '');
  
  if (!normalizedFilter) {
    return SLASH_COMMANDS;
  }
  
  return SLASH_COMMANDS.filter(cmd => {
    const cmdName = cmd.command.toLowerCase().replace(/^\//, '');
    return cmdName.startsWith(normalizedFilter) || 
           cmd.description.toLowerCase().includes(normalizedFilter) ||
           (cmd.category && cmd.category.toLowerCase().includes(normalizedFilter));
  });
}
