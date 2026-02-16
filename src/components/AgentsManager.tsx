// Updated: 2026-02-16 15:00:00
// Eames Design Agent - Agents Manager UI
// Claude Code parity: browse configured subagents

import React, { useState, useEffect } from 'react';
import { Box, Text, useInput } from 'ink';
import { colors } from '../theme.js';
import { discoverAllAgents, type SubagentInfo } from '../sdk/agents-loader.js';

interface AgentsManagerProps {
  onClose: () => void;
  onStatusMessage?: (msg: string) => void;
}

export function AgentsManager({ onClose }: AgentsManagerProps) {
  const [agents, setAgents] = useState<SubagentInfo[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [showDetail, setShowDetail] = useState(false);

  useEffect(() => {
    setAgents(discoverAllAgents());
  }, []);

  useInput((_input, key) => {
    if (key.escape) {
      if (showDetail) {
        setShowDetail(false);
      } else {
        onClose();
      }
      return;
    }

    if (showDetail) return;

    if (key.upArrow) {
      setSelectedIndex(prev => Math.max(0, prev - 1));
    }
    if (key.downArrow) {
      setSelectedIndex(prev => Math.min(agents.length - 1, prev + 1));
    }
    if (key.return && agents[selectedIndex]) {
      setShowDetail(true);
    }
  });

  // Detail view
  if (showDetail && agents[selectedIndex]) {
    const agent = agents[selectedIndex];
    const shortPath = agent.sourcePath.replace(process.env.HOME || '', '~');

    return (
      <Box flexDirection="column" paddingX={1}>
        <Text color={colors.primary} bold>{agent.name}</Text>
        <Text> </Text>
        {agent.description && <Text color={colors.white}>{agent.description}</Text>}
        <Text> </Text>
        <Text color={colors.muted}>Source: {agent.source}</Text>
        <Text color={colors.muted}>Path: {shortPath}</Text>
        <Text color={colors.muted}>Model: {agent.model}</Text>
        {agent.tools.length > 0 && (
          <Text color={colors.muted}>Tools: {agent.tools.join(', ')}</Text>
        )}
        {agent.skills.length > 0 && (
          <Text color={colors.muted}>Skills: {agent.skills.join(', ')}</Text>
        )}
        <Text> </Text>
        <Text color={colors.muted} dimColor>Esc to go back</Text>
      </Box>
    );
  }

  // List view
  return (
    <Box flexDirection="column" paddingX={1}>
      <Text color={colors.primary} bold>Subagents ({agents.length})</Text>
      <Text> </Text>

      {agents.length === 0 ? (
        <Box flexDirection="column">
          <Text color={colors.muted}>No subagents configured.</Text>
          <Text color={colors.muted}>Add agents to .claude/agents/ or settings.json</Text>
          <Text> </Text>
          <Text color={colors.muted} dimColor>File-based: .claude/agents/researcher.md</Text>
          <Text color={colors.muted} dimColor>Settings: {'"agents": { "researcher": { "model": "haiku" } }'}</Text>
        </Box>
      ) : (
        agents.map((agent, idx) => {
          const isSelected = idx === selectedIndex;
          const modelStr = agent.model !== 'inherit' ? ` (${agent.model})` : '';
          const toolCount = agent.tools.length > 0 ? ` [${agent.tools.length} tools]` : '';
          const src = agent.source !== 'project' ? ` [${agent.source}]` : '';

          return (
            <Box key={agent.name}>
              <Text color={isSelected ? colors.primary : colors.muted}>
                {isSelected ? '> ' : '  '}
              </Text>
              <Text color={isSelected ? colors.white : colors.primary} bold={isSelected}>
                {agent.name}
              </Text>
              <Text color={colors.secondary}>{modelStr}</Text>
              <Text color={colors.muted}>{toolCount}{src}</Text>
              {agent.description && (
                <Text color={colors.muted}> - {agent.description.slice(0, 40)}</Text>
              )}
            </Box>
          );
        })
      )}

      <Text> </Text>
      <Text color={colors.muted} dimColor>up/down nav - Enter details - Esc close</Text>
    </Box>
  );
}
