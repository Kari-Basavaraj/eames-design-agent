// Updated: 2026-01-17 18:30:00
// Claude Code style tool activity display
import React, { useState } from 'react';
import { Box, Text } from 'ink';
import InkSpinner from 'ink-spinner';
import { colors } from '../theme.js';

// ============================================================================
// Types
// ============================================================================

export interface ToolActivity {
  id: string;
  tool: string;
  description: string;
  status: 'running' | 'completed' | 'failed';
  output?: string;
  timestamp: number;
}

// ============================================================================
// Tool Type Colors (Claude Code style)
// ============================================================================

function getToolColor(tool: string): string {
  const toolLower = tool.toLowerCase();

  if (toolLower.includes('read')) return '#22c55e';      // Green
  if (toolLower.includes('edit') || toolLower.includes('update') || toolLower.includes('write')) return '#eab308'; // Yellow
  if (toolLower.includes('bash')) return '#06b6d4';      // Cyan
  if (toolLower.includes('search') || toolLower.includes('grep') || toolLower.includes('glob')) return '#a855f7'; // Purple
  if (toolLower.includes('web')) return '#3b82f6';       // Blue

  return colors.primary; // Default
}

function getToolIcon(tool: string): string {
  const toolLower = tool.toLowerCase();

  if (toolLower.includes('read')) return '●';
  if (toolLower.includes('edit') || toolLower.includes('update')) return '●';
  if (toolLower.includes('write')) return '●';
  if (toolLower.includes('bash')) return '●';
  if (toolLower.includes('search') || toolLower.includes('grep')) return '●';
  if (toolLower.includes('web')) return '●';

  return '●';
}

// ============================================================================
// Tool Activity Row
// ============================================================================

interface ToolActivityRowProps {
  activity: ToolActivity;
}

function ToolActivityRow({ activity }: ToolActivityRowProps) {
  const color = getToolColor(activity.tool);
  const icon = getToolIcon(activity.tool);
  const [expanded, setExpanded] = useState(false);

  return (
    <Box flexDirection="column" marginBottom={0}>
      {/* Main row with tool info - Claude Code style */}
      <Box>
        {/* Status indicator first */}
        {activity.status === 'running' && (
          <Text color={colors.muted} dimColor>
            <InkSpinner type="dots" />
          </Text>
        )}
        {activity.status === 'completed' && (
          <Text color={colors.success}>✓</Text>
        )}
        {activity.status === 'failed' && (
          <Text color={colors.error}>✗</Text>
        )}
        <Text> </Text>

        {/* Tool description - simplified */}
        <Text color={colors.muted}>{activity.description}</Text>
      </Box>

      {/* Output preview - collapsible */}
      {activity.output && activity.status === 'completed' && (
        <Box marginLeft={2} flexDirection="column">
          <Text color={colors.muted} dimColor>
            {expanded ? activity.output : truncateOutput(activity.output, 80)}
          </Text>
          {activity.output.length > 80 && (
            <Text color={colors.mutedDark} dimColor>
              {expanded ? '  [collapse]' : '  [expand]'}
            </Text>
          )}
        </Box>
      )}
    </Box>
  );
}

function truncateOutput(output: string, maxLen: number): string {
  // Remove extra whitespace and get first meaningful line
  const cleaned = output.trim();
  const firstLine = cleaned.split('\n')[0];
  if (firstLine.length <= maxLen) return firstLine;
  return firstLine.slice(0, maxLen) + '...';
}

// ============================================================================
// Tool Activity View (Main Component)
// ============================================================================

interface ToolActivityViewProps {
  activities: ToolActivity[];
  maxVisible?: number;
}

export function ToolActivityView({ activities, maxVisible = 8 }: ToolActivityViewProps) {
  if (activities.length === 0) {
    return null;
  }

  // Show most recent activities
  const visibleActivities = activities.slice(-maxVisible);
  const hiddenCount = activities.length - visibleActivities.length;

  return (
    <Box flexDirection="column" marginTop={1}>
      {/* Show count of hidden activities */}
      {hiddenCount > 0 && (
        <Text color={colors.muted} dimColor>
          ... +{hiddenCount} more (ctrl+o to expand)
        </Text>
      )}

      {/* Activity list */}
      {visibleActivities.map((activity) => (
        <ToolActivityRow key={activity.id} activity={activity} />
      ))}
    </Box>
  );
}

// ============================================================================
// Hook for tracking tool activities
// ============================================================================

export function createToolActivity(
  tool: string,
  description: string
): ToolActivity {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    tool,
    description,
    status: 'running',
    timestamp: Date.now(),
  };
}
