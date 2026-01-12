// Updated: 2026-01-12 02:30:00
// Eames Design Agent - Plugin System
// Claude Code MCP-like plugin architecture

import { existsSync, readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';
import type { DynamicStructuredTool } from '@langchain/core/tools';

const EAMES_DIR = join(homedir(), '.eames');
const PLUGINS_DIR = join(EAMES_DIR, 'plugins');
const PLUGINS_CONFIG = join(EAMES_DIR, 'plugins.json');

/**
 * Plugin metadata
 */
export interface PluginMeta {
  name: string;
  version: string;
  description: string;
  author?: string;
  homepage?: string;
  enabled: boolean;
}

/**
 * Plugin tool definition
 */
export interface PluginTool {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
  handler: (input: Record<string, unknown>) => Promise<string>;
}

/**
 * Plugin resource
 */
export interface PluginResource {
  uri: string;
  name: string;
  description?: string;
  mimeType?: string;
}

/**
 * Plugin prompt template
 */
export interface PluginPrompt {
  name: string;
  description: string;
  template: string;
  arguments?: Array<{
    name: string;
    description: string;
    required?: boolean;
  }>;
}

/**
 * Full plugin definition
 */
export interface Plugin {
  meta: PluginMeta;
  tools: PluginTool[];
  resources: PluginResource[];
  prompts: PluginPrompt[];
  initialize?: () => Promise<void>;
  shutdown?: () => Promise<void>;
}

/**
 * Plugin configuration
 */
export interface PluginsConfig {
  enabledPlugins: string[];
  disabledPlugins: string[];
  pluginSettings: Record<string, Record<string, unknown>>;
}

// Loaded plugins
const loadedPlugins: Map<string, Plugin> = new Map();

/**
 * Load plugins configuration
 */
export function loadPluginsConfig(): PluginsConfig {
  try {
    if (existsSync(PLUGINS_CONFIG)) {
      const data = readFileSync(PLUGINS_CONFIG, 'utf-8');
      return JSON.parse(data);
    }
  } catch {
    // Fall through to defaults
  }

  return {
    enabledPlugins: [],
    disabledPlugins: [],
    pluginSettings: {},
  };
}

/**
 * Load a plugin from a directory
 */
export async function loadPlugin(pluginDir: string): Promise<Plugin | null> {
  try {
    const manifestPath = join(pluginDir, 'plugin.json');
    if (!existsSync(manifestPath)) {
      return null;
    }

    const manifestData = readFileSync(manifestPath, 'utf-8');
    const manifest = JSON.parse(manifestData);

    // Load the plugin module if it has one
    const indexPath = join(pluginDir, 'index.js');
    let pluginModule: any = {};

    if (existsSync(indexPath)) {
      try {
        pluginModule = await import(indexPath);
      } catch {
        // Module loading failed, continue with manifest only
      }
    }

    const plugin: Plugin = {
      meta: {
        name: manifest.name,
        version: manifest.version || '1.0.0',
        description: manifest.description || '',
        author: manifest.author,
        homepage: manifest.homepage,
        enabled: true,
      },
      tools: manifest.tools || pluginModule.tools || [],
      resources: manifest.resources || pluginModule.resources || [],
      prompts: manifest.prompts || pluginModule.prompts || [],
      initialize: pluginModule.initialize,
      shutdown: pluginModule.shutdown,
    };

    return plugin;
  } catch {
    return null;
  }
}

/**
 * Discover and load all plugins
 */
export async function discoverPlugins(): Promise<Plugin[]> {
  const plugins: Plugin[] = [];

  if (!existsSync(PLUGINS_DIR)) {
    return plugins;
  }

  const config = loadPluginsConfig();
  const entries = readdirSync(PLUGINS_DIR, { withFileTypes: true });

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;

    const pluginDir = join(PLUGINS_DIR, entry.name);
    const plugin = await loadPlugin(pluginDir);

    if (plugin) {
      // Check if disabled
      if (config.disabledPlugins.includes(plugin.meta.name)) {
        plugin.meta.enabled = false;
      }

      plugins.push(plugin);
      loadedPlugins.set(plugin.meta.name, plugin);
    }
  }

  return plugins;
}

/**
 * Initialize all enabled plugins
 */
export async function initializePlugins(): Promise<void> {
  for (const [name, plugin] of loadedPlugins) {
    if (plugin.meta.enabled && plugin.initialize) {
      try {
        await plugin.initialize();
      } catch (error) {
        console.error(`Failed to initialize plugin ${name}:`, error);
      }
    }
  }
}

/**
 * Shutdown all plugins
 */
export async function shutdownPlugins(): Promise<void> {
  for (const [name, plugin] of loadedPlugins) {
    if (plugin.shutdown) {
      try {
        await plugin.shutdown();
      } catch (error) {
        console.error(`Failed to shutdown plugin ${name}:`, error);
      }
    }
  }
  loadedPlugins.clear();
}

/**
 * Get all tools from enabled plugins
 */
export function getPluginTools(): PluginTool[] {
  const tools: PluginTool[] = [];

  for (const plugin of loadedPlugins.values()) {
    if (plugin.meta.enabled) {
      tools.push(...plugin.tools);
    }
  }

  return tools;
}

/**
 * Get all resources from enabled plugins
 */
export function getPluginResources(): PluginResource[] {
  const resources: PluginResource[] = [];

  for (const plugin of loadedPlugins.values()) {
    if (plugin.meta.enabled) {
      resources.push(...plugin.resources);
    }
  }

  return resources;
}

/**
 * Get all prompts from enabled plugins
 */
export function getPluginPrompts(): PluginPrompt[] {
  const prompts: PluginPrompt[] = [];

  for (const plugin of loadedPlugins.values()) {
    if (plugin.meta.enabled) {
      prompts.push(...plugin.prompts);
    }
  }

  return prompts;
}

/**
 * Get a specific plugin
 */
export function getPlugin(name: string): Plugin | undefined {
  return loadedPlugins.get(name);
}

/**
 * Enable a plugin
 */
export function enablePlugin(name: string): boolean {
  const plugin = loadedPlugins.get(name);
  if (plugin) {
    plugin.meta.enabled = true;
    return true;
  }
  return false;
}

/**
 * Disable a plugin
 */
export function disablePlugin(name: string): boolean {
  const plugin = loadedPlugins.get(name);
  if (plugin) {
    plugin.meta.enabled = false;
    return true;
  }
  return false;
}

/**
 * List all plugins
 */
export function listPlugins(): PluginMeta[] {
  return Array.from(loadedPlugins.values()).map(p => p.meta);
}

/**
 * Create a sample plugin manifest
 */
export function createSamplePluginManifest(): string {
  return JSON.stringify({
    name: 'sample-plugin',
    version: '1.0.0',
    description: 'A sample Eames plugin',
    author: 'Your Name',
    homepage: 'https://github.com/your/plugin',
    tools: [
      {
        name: 'sample_tool',
        description: 'A sample tool that echoes input',
        inputSchema: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              description: 'Message to echo',
            },
          },
          required: ['message'],
        },
      },
    ],
    resources: [],
    prompts: [
      {
        name: 'sample_prompt',
        description: 'A sample prompt template',
        template: 'Hello, {{name}}! This is a sample prompt.',
        arguments: [
          {
            name: 'name',
            description: 'Name to greet',
            required: true,
          },
        ],
      },
    ],
  }, null, 2);
}

/**
 * Get plugin documentation
 */
export function getPluginDocumentation(): string {
  return `
# Eames Plugin System

Plugins extend Eames with additional tools, resources, and prompts.

## Creating a Plugin

1. Create a directory in ~/.eames/plugins/your-plugin/
2. Add a plugin.json manifest file
3. Optionally add an index.js module

## Plugin Manifest (plugin.json)

{
  "name": "your-plugin",
  "version": "1.0.0",
  "description": "What your plugin does",
  "tools": [...],
  "resources": [...],
  "prompts": [...]
}

## Tools

Tools are functions that Eames can call:

{
  "name": "tool_name",
  "description": "What the tool does",
  "inputSchema": {
    "type": "object",
    "properties": { ... },
    "required": [...]
  }
}

## Resources

Resources are data sources (files, URIs):

{
  "uri": "file:///path/to/resource",
  "name": "Resource Name",
  "description": "What this resource provides",
  "mimeType": "text/plain"
}

## Prompts

Prompt templates with arguments:

{
  "name": "prompt_name",
  "description": "What this prompt is for",
  "template": "Template with {{arguments}}",
  "arguments": [
    { "name": "arg", "description": "...", "required": true }
  ]
}

## index.js Module

Export functions for dynamic tools:

export const tools = [...];
export async function initialize() { ... }
export async function shutdown() { ... }
`.trim();
}
