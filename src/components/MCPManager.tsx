// Updated: 2026-01-13 08:35:00
// MCP Manager - Interactive MCP server management UI
// Simplified version to avoid yoga-layout issues

import React, { useState, useEffect } from 'react';
import { Box, Text, useInput } from 'ink';
import { colors } from '../theme.js';
import * as fs from 'fs';
import * as path from 'path';

interface MCPServer {
  id: string;
  name: string;
  source: 'user' | 'project' | 'plugin';
  sourceName: string;
  command?: string;
  args?: string[];
  url?: string;
  type: 'stdio' | 'sse';
}

interface MCPManagerProps {
  onClose: () => void;
  onStatusMessage: (msg: string) => void;
}

function loadMCPServers(): MCPServer[] {
  const servers: MCPServer[] = [];

  try {
    // Check user settings
    const homeSettings = path.join(process.env.HOME || '', '.claude/settings.json');
    if (fs.existsSync(homeSettings)) {
      const data = JSON.parse(fs.readFileSync(homeSettings, 'utf-8'));
      if (data.mcpServers) {
        for (const [name, config] of Object.entries(data.mcpServers)) {
          const cfg = config as any;
          servers.push({
            id: `user:${name}`,
            name,
            source: 'user',
            sourceName: '~/.claude/settings.json',
            command: cfg.command,
            args: cfg.args,
            url: cfg.url,
            type: cfg.url ? 'sse' : 'stdio',
          });
        }
      }
    }

    // Check project settings
    const projectSettings = path.join(process.cwd(), '.claude/settings.json');
    if (fs.existsSync(projectSettings)) {
      const data = JSON.parse(fs.readFileSync(projectSettings, 'utf-8'));
      if (data.mcpServers) {
        for (const [name, config] of Object.entries(data.mcpServers)) {
          const cfg = config as any;
          servers.push({
            id: `project:${name}`,
            name,
            source: 'project',
            sourceName: '.claude/settings.json',
            command: cfg.command,
            args: cfg.args,
            url: cfg.url,
            type: cfg.url ? 'sse' : 'stdio',
          });
        }
      }
    }

    // Check plugin .mcp.json files
    const pluginCache = path.join(process.env.HOME || '', '.claude/plugins/cache');
    if (fs.existsSync(pluginCache)) {
      const scanDir = (dir: string) => {
        try {
          const items = fs.readdirSync(dir, { withFileTypes: true });
          for (const item of items) {
            const fullPath = path.join(dir, item.name);
            if (item.isDirectory()) {
              scanDir(fullPath);
            } else if (item.name === '.mcp.json') {
              const mcpData = JSON.parse(fs.readFileSync(fullPath, 'utf-8'));
              if (mcpData.mcpServers) {
                const pluginName = dir.split('/').slice(-2).join('/');
                for (const [name, config] of Object.entries(mcpData.mcpServers)) {
                  const cfg = config as any;
                  servers.push({
                    id: `plugin:${pluginName}:${name}`,
                    name,
                    source: 'plugin',
                    sourceName: pluginName,
                    command: cfg.command,
                    args: cfg.args,
                    url: cfg.url,
                    type: cfg.url ? 'sse' : 'stdio',
                  });
                }
              }
            }
          }
        } catch {}
      };
      scanDir(pluginCache);
    }
  } catch {}

  return servers.sort((a, b) => a.name.localeCompare(b.name));
}

export function MCPManager({ onClose, onStatusMessage }: MCPManagerProps) {
  const [servers, setServers] = useState<MCPServer[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [showDetail, setShowDetail] = useState(false);

  useEffect(() => {
    setServers(loadMCPServers());
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
      setSelectedIndex(prev => Math.min(servers.length - 1, prev + 1));
    }
    if (key.return && servers[selectedIndex]) {
      setShowDetail(true);
    }
  });

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'user': return '👤';
      case 'project': return '📁';
      case 'plugin': return '🔌';
      default: return '•';
    }
  };

  // Detail view
  if (showDetail && servers[selectedIndex]) {
    const server = servers[selectedIndex];
    return (
      <Box flexDirection="column" paddingX={1}>
        <Text color={colors.primary} bold>🔗 {server.name}</Text>
        <Text> </Text>
        <Text color={colors.muted}>Source: {getSourceIcon(server.source)} {server.source}</Text>
        <Text color={colors.muted}>Config: {server.sourceName}</Text>
        <Text color={colors.muted}>Type: {server.type}</Text>
        {server.command && <Text color={colors.muted}>Command: {server.command}</Text>}
        {server.url && <Text color={colors.muted}>URL: {server.url}</Text>}
        {server.args && server.args.length > 0 && (
          <Text color={colors.muted}>Args: {server.args.join(' ')}</Text>
        )}
        <Text> </Text>
        <Text color={colors.muted} dimColor>Esc to go back</Text>
      </Box>
    );
  }

  // List view
  const maxVisible = 12;
  const startIndex = Math.max(0, selectedIndex - Math.floor(maxVisible / 2));
  const visibleServers = servers.slice(startIndex, startIndex + maxVisible);

  return (
    <Box flexDirection="column" paddingX={1}>
      <Text color={colors.primary} bold>🔗 MCP Servers ({servers.length})</Text>
      <Text> </Text>

      {servers.length === 0 ? (
        <Box flexDirection="column">
          <Text color={colors.warning}>No MCP servers configured.</Text>
          <Text color={colors.muted}>Add to ~/.claude/settings.json</Text>
        </Box>
      ) : (
        visibleServers.map((server, idx) => {
          const actualIndex = startIndex + idx;
          const isSelected = actualIndex === selectedIndex;
          return (
            <Text key={server.id}>
              <Text color={isSelected ? colors.primary : colors.muted}>
                {isSelected ? '› ' : '  '}
              </Text>
              <Text>{getSourceIcon(server.source)} </Text>
              <Text color={isSelected ? colors.white : colors.primary} bold={isSelected}>
                {server.name}
              </Text>
              <Text color={colors.muted}> ({server.type})</Text>
            </Text>
          );
        })
      )}

      {servers.length > maxVisible && (
        <Text color={colors.muted} dimColor>
          {startIndex + 1}-{Math.min(startIndex + maxVisible, servers.length)} of {servers.length}
        </Text>
      )}

      <Text> </Text>
      <Text color={colors.muted} dimColor>↑↓ nav • Enter details • Esc close</Text>
    </Box>
  );
}
