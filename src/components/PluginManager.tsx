// Updated: 2026-01-13 08:35:00
// Plugin Manager - Interactive plugin management UI
// Simplified version to avoid yoga-layout issues

import React, { useState, useEffect } from 'react';
import { Box, Text, useInput } from 'ink';
import { colors } from '../theme.js';
import * as fs from 'fs';
import * as path from 'path';

interface PluginInfo {
  id: string;
  name: string;
  marketplace: string;
  version: string;
  scope: string;
  installPath: string;
  installedAt: string;
  skillCount: number;
  commandCount: number;
}

interface PluginManagerProps {
  onClose: () => void;
  onStatusMessage?: (msg: string) => void;
}

function loadPlugins(): PluginInfo[] {
  try {
    const pluginFile = path.join(process.env.HOME || '', '.claude/plugins/installed_plugins.json');
    if (!fs.existsSync(pluginFile)) return [];

    const data = JSON.parse(fs.readFileSync(pluginFile, 'utf-8'));
    const pluginList: PluginInfo[] = [];

    for (const [key, value] of Object.entries(data.plugins || {})) {
      const [name, marketplace] = key.split('@');
      const info = (value as any[])[0];
      if (info) {
        // Count skills and commands
        let skillCount = 0;
        let commandCount = 0;
        
        try {
          const skillsDir = path.join(info.installPath, 'skills');
          if (fs.existsSync(skillsDir)) {
            const entries = fs.readdirSync(skillsDir, { withFileTypes: true });
            skillCount = entries.filter(e => e.isDirectory()).length;
          }
          
          const commandsDir = path.join(info.installPath, 'commands');
          if (fs.existsSync(commandsDir)) {
            const entries = fs.readdirSync(commandsDir, { withFileTypes: true });
            commandCount = entries.filter(e => e.isFile() && e.name.endsWith('.md')).length;
          }
        } catch {}

        pluginList.push({
          id: key,
          name,
          marketplace: marketplace || 'unknown',
          version: info.version || 'unknown',
          scope: info.scope || 'user',
          installPath: info.installPath || '',
          installedAt: info.installedAt || '',
          skillCount,
          commandCount,
        });
      }
    }

    return pluginList.sort((a, b) => a.name.localeCompare(b.name));
  } catch {
    return [];
  }
}

export function PluginManager({ onClose, onStatusMessage }: PluginManagerProps) {
  const [plugins, setPlugins] = useState<PluginInfo[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [showDetail, setShowDetail] = useState(false);

  useEffect(() => {
    setPlugins(loadPlugins());
  }, []);

  useInput((input, key) => {
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
      setSelectedIndex(prev => Math.min(plugins.length - 1, prev + 1));
    }
    if (key.return && plugins[selectedIndex]) {
      setShowDetail(true);
    }
  });

  // Detail view
  if (showDetail && plugins[selectedIndex]) {
    const plugin = plugins[selectedIndex];
    const shortPath = plugin.installPath.replace(process.env.HOME || '', '~');
    
    return (
      <Box flexDirection="column" paddingX={1}>
        <Text color={colors.primary} bold>🔌 {plugin.name}</Text>
        <Text> </Text>
        <Text color={colors.muted}>Marketplace: {plugin.marketplace}</Text>
        <Text color={colors.muted}>Version: {plugin.version}</Text>
        <Text color={colors.muted}>Scope: {plugin.scope}</Text>
        <Text color={colors.muted}>Skills: {plugin.skillCount}</Text>
        <Text color={colors.muted}>Commands: {plugin.commandCount}</Text>
        <Text color={colors.muted}>Path: {shortPath}</Text>
        <Text> </Text>
        <Text color={colors.muted} dimColor>Esc to go back</Text>
      </Box>
    );
  }

  // List view
  const maxVisible = 12;
  const startIndex = Math.max(0, selectedIndex - Math.floor(maxVisible / 2));
  const visiblePlugins = plugins.slice(startIndex, startIndex + maxVisible);

  return (
    <Box flexDirection="column" paddingX={1}>
      <Text color={colors.primary} bold>🔌 Plugins ({plugins.length})</Text>
      <Text> </Text>

      {plugins.length === 0 ? (
        <Box flexDirection="column">
          <Text color={colors.muted}>No plugins installed.</Text>
          <Text color={colors.muted}>Use Claude Code: /plugin install</Text>
        </Box>
      ) : (
        visiblePlugins.map((plugin, idx) => {
          const actualIndex = startIndex + idx;
          const isSelected = actualIndex === selectedIndex;
          return (
            <Text key={plugin.id}>
              <Text color={isSelected ? colors.primary : colors.muted}>
                {isSelected ? '› ' : '  '}
              </Text>
              <Text color={isSelected ? colors.white : colors.primary} bold={isSelected}>
                {plugin.name}
              </Text>
              <Text color={colors.muted}> ({plugin.marketplace} v{plugin.version})</Text>
            </Text>
          );
        })
      )}

      {plugins.length > maxVisible && (
        <Text color={colors.muted} dimColor>
          {startIndex + 1}-{Math.min(startIndex + maxVisible, plugins.length)} of {plugins.length}
        </Text>
      )}

      <Text> </Text>
      <Text color={colors.muted} dimColor>↑↓ nav • Enter details • Esc close</Text>
    </Box>
  );
}
