// Updated: 2026-02-16 15:00:00
// Eames Design Agent - Hooks Manager UI
// Claude Code parity: browse configured hooks

import React, { useState, useEffect } from 'react';
import { Box, Text, useInput } from 'ink';
import { colors } from '../theme.js';
import { discoverAllHooks, type HookInfo, type HookEvent } from '../sdk/hooks-loader.js';

interface HooksManagerProps {
  onClose: () => void;
  onStatusMessage?: (msg: string) => void;
}

const EVENT_DESCRIPTIONS: Record<HookEvent, string> = {
  PreToolUse: 'Before a tool runs',
  PostToolUse: 'After a tool completes',
  UserPromptSubmit: 'When user submits a prompt',
  Notification: 'On notifications',
  Stop: 'When agent stops',
  SubagentStop: 'When a subagent stops',
  SessionStart: 'When session starts',
};

export function HooksManager({ onClose }: HooksManagerProps) {
  const [hooks, setHooks] = useState<HookInfo[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    setHooks(discoverAllHooks());
  }, []);

  useInput((_input, key) => {
    if (key.escape) {
      onClose();
      return;
    }
    if (key.upArrow) {
      setSelectedIndex(prev => Math.max(0, prev - 1));
    }
    if (key.downArrow) {
      setSelectedIndex(prev => Math.min(hooks.length - 1, prev + 1));
    }
  });

  // Group by event
  const byEvent = new Map<string, HookInfo[]>();
  for (const hook of hooks) {
    const list = byEvent.get(hook.event) || [];
    list.push(hook);
    byEvent.set(hook.event, list);
  }

  let flatIndex = 0;
  const rows: Array<{ type: 'header'; event: string } | { type: 'hook'; hook: HookInfo; index: number }> = [];
  for (const [event, eventHooks] of byEvent) {
    rows.push({ type: 'header', event });
    for (const hook of eventHooks) {
      rows.push({ type: 'hook', hook, index: flatIndex });
      flatIndex++;
    }
  }

  return (
    <Box flexDirection="column" paddingX={1}>
      <Text color={colors.primary} bold>Hooks ({hooks.length})</Text>
      <Text> </Text>

      {hooks.length === 0 ? (
        <Box flexDirection="column">
          <Text color={colors.muted}>No hooks configured.</Text>
          <Text color={colors.muted}>Add hooks to .claude/settings.json</Text>
          <Text> </Text>
          <Text color={colors.muted} dimColor>Example:</Text>
          <Text color={colors.mutedDark}>{'{'}</Text>
          <Text color={colors.mutedDark}>{'  "hooks": {'}</Text>
          <Text color={colors.mutedDark}>{'    "PostToolUse": [{'}</Text>
          <Text color={colors.mutedDark}>{'      "matcher": "Edit|Write",'}</Text>
          <Text color={colors.mutedDark}>{'      "hooks": [{ "type": "command", "command": "npm run lint" }]'}</Text>
          <Text color={colors.mutedDark}>{'    }]'}</Text>
          <Text color={colors.mutedDark}>{'  }'}</Text>
          <Text color={colors.mutedDark}>{'}'}</Text>
        </Box>
      ) : (
        rows.map((row, i) => {
          if (row.type === 'header') {
            const desc = EVENT_DESCRIPTIONS[row.event as HookEvent] || '';
            return (
              <Box key={`h-${row.event}`} marginTop={i > 0 ? 1 : 0}>
                <Text color={colors.secondary} bold>{row.event}</Text>
                <Text color={colors.muted}> - {desc}</Text>
              </Box>
            );
          }

          const isSelected = row.index === selectedIndex;
          const h = row.hook;
          const matchStr = h.matcher !== '*' ? `[${h.matcher}] ` : '';
          const val = h.value.length > 50 ? h.value.slice(0, 47) + '...' : h.value;
          const src = h.source === 'project' ? '' : ' (user)';

          return (
            <Box key={`hook-${row.index}`}>
              <Text color={isSelected ? colors.primary : colors.muted}>
                {isSelected ? '> ' : '  '}
              </Text>
              <Text color={colors.muted}>{matchStr}</Text>
              <Text color={isSelected ? colors.white : colors.toolName}>
                {h.type}: {val}
              </Text>
              <Text color={colors.mutedDark}>{src}</Text>
            </Box>
          );
        })
      )}

      <Text> </Text>
      <Text color={colors.muted} dimColor>up/down nav - Esc close</Text>
    </Box>
  );
}
