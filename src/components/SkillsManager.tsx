// Updated: 2026-02-16 15:00:00
// Eames Design Agent - Skills Manager UI
// Claude Code parity: browse and inspect installed skills

import React, { useState, useEffect } from 'react';
import { Box, Text, useInput } from 'ink';
import { colors } from '../theme.js';
import { discoverAllSkills, loadSkillContent, type SkillInfo } from '../sdk/skills-loader.js';

interface SkillsManagerProps {
  onClose: () => void;
  onStatusMessage?: (msg: string) => void;
}

export function SkillsManager({ onClose }: SkillsManagerProps) {
  const [skills, setSkills] = useState<SkillInfo[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [showDetail, setShowDetail] = useState(false);

  useEffect(() => {
    setSkills(discoverAllSkills());
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
      setSelectedIndex(prev => Math.min(skills.length - 1, prev + 1));
    }
    if (key.return && skills[selectedIndex]) {
      setShowDetail(true);
    }
  });

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'user': return 'U';
      case 'project': return 'P';
      case 'plugin': return '+';
      default: return ' ';
    }
  };

  // Detail view
  if (showDetail && skills[selectedIndex]) {
    const skill = skills[selectedIndex];
    const shortPath = skill.path.replace(process.env.HOME || '', '~');
    const content = loadSkillContent(skill.path);
    const preview = content ? content.slice(0, 300) : '(empty)';

    return (
      <Box flexDirection="column" paddingX={1}>
        <Text color={colors.primary} bold>{skill.name}</Text>
        <Text> </Text>
        {skill.description && <Text color={colors.white}>{skill.description}</Text>}
        <Text> </Text>
        <Text color={colors.muted}>Source: {skill.source} ({skill.sourceName})</Text>
        <Text color={colors.muted}>Path: {shortPath}</Text>
        <Text color={colors.muted}>Model invocable: {skill.modelInvocable ? 'yes' : 'no (manual only)'}</Text>
        <Text color={colors.muted}>Type: {skill.isAction ? 'action' : 'reference'}</Text>
        {skill.frontmatter['allowed-tools'] && (
          <Text color={colors.muted}>Tools: {skill.frontmatter['allowed-tools']}</Text>
        )}
        {skill.frontmatter.context && (
          <Text color={colors.muted}>Context: {skill.frontmatter.context}</Text>
        )}
        <Text> </Text>
        <Text color={colors.muted} dimColor>Preview:</Text>
        <Text color={colors.white}>{preview}{content && content.length > 300 ? '...' : ''}</Text>
        <Text> </Text>
        <Text color={colors.muted} dimColor>Esc to go back</Text>
      </Box>
    );
  }

  // List view
  const maxVisible = 14;
  const startIndex = Math.max(0, selectedIndex - Math.floor(maxVisible / 2));
  const visibleSkills = skills.slice(startIndex, startIndex + maxVisible);

  return (
    <Box flexDirection="column" paddingX={1}>
      <Text color={colors.primary} bold>Skills ({skills.length})</Text>
      <Text> </Text>

      {skills.length === 0 ? (
        <Box flexDirection="column">
          <Text color={colors.muted}>No skills found.</Text>
          <Text color={colors.muted}>Add skills to ~/.claude/skills/ or .claude/skills/</Text>
          <Text color={colors.muted}>Or install plugins with skills.</Text>
        </Box>
      ) : (
        visibleSkills.map((skill, idx) => {
          const actualIndex = startIndex + idx;
          const isSelected = actualIndex === selectedIndex;
          return (
            <Box key={skill.id}>
              <Text color={isSelected ? colors.primary : colors.muted}>
                {isSelected ? '> ' : '  '}
              </Text>
              <Text color={colors.mutedDark}>[{getSourceIcon(skill.source)}] </Text>
              <Text color={isSelected ? colors.white : colors.primary} bold={isSelected}>
                {skill.name}
              </Text>
              {skill.description && (
                <Text color={colors.muted}> - {skill.description.slice(0, 50)}</Text>
              )}
            </Box>
          );
        })
      )}

      {skills.length > maxVisible && (
        <Text color={colors.muted} dimColor>
          {startIndex + 1}-{Math.min(startIndex + maxVisible, skills.length)} of {skills.length}
        </Text>
      )}

      <Text> </Text>
      <Text color={colors.muted} dimColor>up/down nav - Enter details - Esc close</Text>
    </Box>
  );
}
