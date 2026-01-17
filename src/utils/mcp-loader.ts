// Updated: 2026-01-13 08:45:00
// MCP Loader - Collects MCP server configs from plugins and settings

import * as fs from 'fs';
import * as path from 'path';
import type { McpServerConfig } from '@anthropic-ai/claude-agent-sdk';

export interface McpServersMap {
  [name: string]: McpServerConfig;
}

/**
 * Loads all MCP server configurations from:
 * 1. User settings (~/.claude/settings.json)
 * 2. Project settings (.claude/settings.json)
 * 3. Plugin .mcp.json files
 */
export function loadAllMcpServers(): McpServersMap {
  const servers: McpServersMap = {};

  // 1. Load from user settings
  try {
    const homeSettings = path.join(process.env.HOME || '', '.claude/settings.json');
    if (fs.existsSync(homeSettings)) {
      const data = JSON.parse(fs.readFileSync(homeSettings, 'utf-8'));
      if (data.mcpServers) {
        Object.assign(servers, data.mcpServers);
      }
    }
  } catch {}

  // 2. Load from project settings
  try {
    const projectSettings = path.join(process.cwd(), '.claude/settings.json');
    if (fs.existsSync(projectSettings)) {
      const data = JSON.parse(fs.readFileSync(projectSettings, 'utf-8'));
      if (data.mcpServers) {
        Object.assign(servers, data.mcpServers);
      }
    }
  } catch {}

  // 3. Load from plugin .mcp.json files
  try {
    const pluginCache = path.join(process.env.HOME || '', '.claude/plugins/cache');
    if (fs.existsSync(pluginCache)) {
      scanPluginMcpFiles(pluginCache, servers);
    }
  } catch {}

  return servers;
}

/**
 * Recursively scans plugin directories for .mcp.json files
 */
function scanPluginMcpFiles(dir: string, servers: McpServersMap): void {
  try {
    const items = fs.readdirSync(dir, { withFileTypes: true });
    for (const item of items) {
      const fullPath = path.join(dir, item.name);
      if (item.isDirectory()) {
        scanPluginMcpFiles(fullPath, servers);
      } else if (item.name === '.mcp.json') {
        try {
          const mcpData = JSON.parse(fs.readFileSync(fullPath, 'utf-8'));
          if (mcpData.mcpServers) {
            // Merge plugin MCP servers
            for (const [name, config] of Object.entries(mcpData.mcpServers)) {
              // Plugin MCPs might use ${CLAUDE_PLUGIN_ROOT} variable
              const resolvedConfig = resolvePluginVariables(config as any, dir);
              servers[name] = resolvedConfig;
            }
          }
        } catch {}
      }
    }
  } catch {}
}

/**
 * Resolves ${CLAUDE_PLUGIN_ROOT} and other variables in plugin MCP configs
 */
function resolvePluginVariables(config: any, pluginDir: string): McpServerConfig {
  const resolved = { ...config };
  
  // Resolve command path
  if (resolved.command && typeof resolved.command === 'string') {
    resolved.command = resolved.command.replace(/\$\{CLAUDE_PLUGIN_ROOT\}/g, pluginDir);
  }
  
  // Resolve args
  if (resolved.args && Array.isArray(resolved.args)) {
    resolved.args = resolved.args.map((arg: string) => 
      typeof arg === 'string' ? arg.replace(/\$\{CLAUDE_PLUGIN_ROOT\}/g, pluginDir) : arg
    );
  }
  
  // Resolve env variables
  if (resolved.env && typeof resolved.env === 'object') {
    for (const [key, value] of Object.entries(resolved.env)) {
      if (typeof value === 'string') {
        resolved.env[key] = value.replace(/\$\{CLAUDE_PLUGIN_ROOT\}/g, pluginDir);
      }
    }
  }
  
  return resolved;
}

/**
 * Gets a list of MCP config file paths from installed plugins
 */
export function getPluginMcpConfigPaths(): string[] {
  const paths: string[] = [];
  
  try {
    const pluginCache = path.join(process.env.HOME || '', '.claude/plugins/cache');
    if (fs.existsSync(pluginCache)) {
      findMcpJsonFiles(pluginCache, paths);
    }
  } catch {}
  
  return paths;
}

function findMcpJsonFiles(dir: string, paths: string[]): void {
  try {
    const items = fs.readdirSync(dir, { withFileTypes: true });
    for (const item of items) {
      const fullPath = path.join(dir, item.name);
      if (item.isDirectory()) {
        findMcpJsonFiles(fullPath, paths);
      } else if (item.name === '.mcp.json') {
        paths.push(fullPath);
      }
    }
  } catch {}
}
