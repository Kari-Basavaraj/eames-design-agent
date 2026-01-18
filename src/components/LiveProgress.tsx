import React from 'react';
import { Box, Text } from 'ink';
import Spinner from 'ink-spinner';
import { colors, spacing } from '../theme.js';
import type { ToolCallEvent } from '../agent/enhanced-sdk-processor.js';

interface LiveProgressProps {
  phase?: string;
  tools: ToolCallEvent[];
  message?: string;
}

export function LiveProgress({ phase, tools, message }: LiveProgressProps) {
  const phaseLabels: Record<string, string> = {
    understand: 'Understanding',
    plan: 'Planning',
    execute: 'Executing',
    reflect: 'Reflecting',
    answer: 'Answering',
  };
  
  const phaseLabel = phase ? phaseLabels[phase] || phase : '';
  
  // Debug: Log to see if component is rendering
  console.log('[LiveProgress] Rendering with:', { phase, toolCount: tools.length, message });
  
  // Don't show anything if no message and no tools
  if (!message && tools.length === 0) {
    console.log('[LiveProgress] Returning null - no content to show');
    return null;
  }
  
  return (
    <Box flexDirection="column" marginLeft={2} marginTop={spacing.tight}>
      {/* Phase indicator with message */}
      {message && (
        <Box marginBottom={tools.length > 0 ? 1 : 0}>
          <Text color={colors.primary}>
            <Spinner type="dots" />
          </Text>
          <Text color={colors.muted} dimColor>
            {' '}
            {phaseLabel ? `${phaseLabel}: ` : ''}
            {message}
          </Text>
        </Box>
      )}
      
      {/* Active tool calls */}
      {tools.length > 0 && (
        <Box flexDirection="column">
          {tools.map((tool) => (
            <ToolCallRow key={tool.id} tool={tool} />
          ))}
        </Box>
      )}
    </Box>
  );
}

function ToolCallRow({ tool }: { tool: ToolCallEvent }) {
  const description = formatToolDescription(tool);
  
  return (
    <Box>
      {tool.status === 'starting' || tool.status === 'running' ? (
        <>
          <Text color={colors.primary}>
            <Spinner type="dots" />
          </Text>
          <Text color={colors.muted} dimColor>
            {' '}
            {description}
          </Text>
        </>
      ) : tool.status === 'completed' ? (
        <>
          <Text color="green">✓</Text>
          <Text dimColor> {description}</Text>
          {tool.result && (
            <Text color={colors.muted} dimColor>
              {' '}
              - {truncate(tool.result, 40)}
            </Text>
          )}
        </>
      ) : (
        <>
          <Text color="red">✗</Text>
          <Text dimColor> {description}</Text>
          {tool.error && (
            <Text color="red"> - {tool.error}</Text>
          )}
        </>
      )}
    </Box>
  );
}

function formatToolDescription(tool: ToolCallEvent): string {
  const { tool: name, args } = tool;
  
  switch (name) {
    case 'read_file':
      return `Reading ${args?.filePath || 'file'}`;
    case 'create_file':
      return `Creating ${args?.filePath || 'file'}`;
    case 'replace_string_in_file':
      return `Editing ${args?.filePath || 'file'}`;
    case 'run_in_terminal':
      return `Running: ${args?.command ? truncate(args.command as string, 50) : 'command'}`;
    case 'grep_search':
      return `Searching: ${args?.query || 'code'}`;
    case 'semantic_search':
      return `Searching: ${args?.query || 'workspace'}`;
    case 'file_search':
      return `Finding files: ${args?.query || '*'}`;
    case 'list_dir':
      return `Listing ${args?.path || 'directory'}`;
    case 'get_errors':
      return 'Checking for errors';
    case 'manage_todo_list':
      return 'Updating tasks';
    default:
      return name;
  }
}

function truncate(str: string, len: number): string {
  if (typeof str !== 'string') return '';
  return str.length > len ? str.slice(0, len) + '...' : str;
}
