// Updated: 2026-02-16 00:00:00
// Eames Design Agent - Tool Calls View
// Claude Code-style inline tool call display

import React from 'react';
import { Box, Text } from 'ink';
import { colors } from '../theme.js';
import type { ToolCallInfo } from '../sdk/useSdkExecution.js';

interface ToolCallsViewProps {
  toolCalls: ToolCallInfo[];
}

const SPINNER_FRAMES = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];

function ToolCallItem({ tool }: { tool: ToolCallInfo }) {
  const [frame, setFrame] = React.useState(0);

  React.useEffect(() => {
    if (tool.status !== 'running') return;
    const interval = setInterval(() => {
      setFrame(f => (f + 1) % SPINNER_FRAMES.length);
    }, 80);
    return () => clearInterval(interval);
  }, [tool.status]);

  const icon = tool.status === 'running'
    ? SPINNER_FRAMES[frame]
    : '⏺';

  const statusColor = tool.status === 'running' ? colors.primary : colors.muted;
  const elapsed = tool.elapsed ? ` ${tool.elapsed.toFixed(1)}s` : '';

  return (
    <Box>
      <Text color={statusColor}>{icon} </Text>
      <Text color={colors.toolName} bold>{tool.toolName}</Text>
      <Text color={colors.muted}> {tool.description}</Text>
      {tool.status === 'running' && elapsed && (
        <Text color={colors.toolProgress}>{elapsed}</Text>
      )}
    </Box>
  );
}

export function ToolCallsView({ toolCalls }: ToolCallsViewProps) {
  if (toolCalls.length === 0) return null;

  // Only show last 5 tool calls to keep it clean
  const visible = toolCalls.slice(-5);

  return (
    <Box flexDirection="column">
      {visible.map((tool, i) => (
        <ToolCallItem key={`${tool.toolName}-${i}`} tool={tool} />
      ))}
    </Box>
  );
}
