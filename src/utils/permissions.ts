// Updated: 2026-01-12 02:00:00
// Eames Design Agent - Permission System
// Claude Code-like permission prompts for dangerous operations

import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

const EAMES_DIR = join(homedir(), '.eames');
const PERMISSIONS_FILE = join(EAMES_DIR, 'permissions.json');

/**
 * Permission levels for different operations
 */
export type PermissionLevel = 'always_allow' | 'ask' | 'always_deny';

/**
 * Tool categories that require permissions
 */
export type ToolCategory =
  | 'file_write'      // Writing/creating files
  | 'file_delete'     // Deleting files
  | 'command_exec'    // Running shell commands
  | 'network'         // Network requests
  | 'git'             // Git operations
  | 'browser'         // Opening browser
  | 'install';        // Installing packages

/**
 * Permission settings
 */
export interface PermissionSettings {
  global: Record<ToolCategory, PermissionLevel>;
  toolSpecific: Record<string, PermissionLevel>;
  sessionAllowed: Set<string>; // Tools allowed for this session
  sessionDenied: Set<string>;  // Tools denied for this session
}

/**
 * Default permission settings (ask for everything dangerous)
 */
const DEFAULT_PERMISSIONS: Omit<PermissionSettings, 'sessionAllowed' | 'sessionDenied'> = {
  global: {
    file_write: 'ask',
    file_delete: 'ask',
    command_exec: 'ask',
    network: 'always_allow',
    git: 'ask',
    browser: 'always_allow',
    install: 'ask',
  },
  toolSpecific: {},
};

/**
 * Map tool names to their categories
 */
const TOOL_CATEGORIES: Record<string, ToolCategory> = {
  // File operations
  'write_file': 'file_write',
  'edit_file': 'file_write',
  'scaffold_project': 'file_write',
  'create_directory': 'file_write',
  'copy_path': 'file_write',
  'delete_path': 'file_delete',

  // Command execution
  'run_command': 'command_exec',
  'launch_demo': 'command_exec',

  // Git
  'git_ops': 'git',

  // Browser
  'open_browser': 'browser',

  // Package installation
  'install_packages': 'install',

  // Network (research tools)
  'tavily_search': 'network',
  'search_competitors': 'network',
  'search_ux_patterns': 'network',
  'search_design_trends': 'network',
  'search_accessibility': 'network',
};

// In-memory session state
let sessionState: {
  allowed: Set<string>;
  denied: Set<string>;
} = {
  allowed: new Set(),
  denied: new Set(),
};

/**
 * Load permission settings from disk
 */
export function loadPermissions(): PermissionSettings {
  try {
    if (existsSync(PERMISSIONS_FILE)) {
      const data = readFileSync(PERMISSIONS_FILE, 'utf-8');
      const saved = JSON.parse(data);
      return {
        ...DEFAULT_PERMISSIONS,
        ...saved,
        sessionAllowed: sessionState.allowed,
        sessionDenied: sessionState.denied,
      };
    }
  } catch {
    // Fall through to defaults
  }

  return {
    ...DEFAULT_PERMISSIONS,
    sessionAllowed: sessionState.allowed,
    sessionDenied: sessionState.denied,
  };
}

/**
 * Save permission settings to disk
 */
export function savePermissions(settings: Partial<PermissionSettings>): void {
  try {
    const current = loadPermissions();
    const toSave = {
      global: settings.global || current.global,
      toolSpecific: settings.toolSpecific || current.toolSpecific,
    };
    writeFileSync(PERMISSIONS_FILE, JSON.stringify(toSave, null, 2));
  } catch {
    // Silently fail
  }
}

/**
 * Get the category for a tool
 */
export function getToolCategory(toolName: string): ToolCategory | null {
  return TOOL_CATEGORIES[toolName] || null;
}

/**
 * Check if a tool requires permission
 */
export function requiresPermission(toolName: string): boolean {
  const category = getToolCategory(toolName);
  if (!category) return false;

  const settings = loadPermissions();
  const level = settings.toolSpecific[toolName] || settings.global[category];

  return level === 'ask';
}

/**
 * Check if a tool is allowed (without prompting)
 */
export function isToolAllowed(toolName: string): boolean {
  // Check session state first
  if (sessionState.allowed.has(toolName)) return true;
  if (sessionState.denied.has(toolName)) return false;

  const category = getToolCategory(toolName);
  if (!category) return true; // Unknown tools are allowed

  const settings = loadPermissions();
  const level = settings.toolSpecific[toolName] || settings.global[category];

  return level === 'always_allow';
}

/**
 * Check if a tool is denied
 */
export function isToolDenied(toolName: string): boolean {
  if (sessionState.denied.has(toolName)) return true;

  const category = getToolCategory(toolName);
  if (!category) return false;

  const settings = loadPermissions();
  const level = settings.toolSpecific[toolName] || settings.global[category];

  return level === 'always_deny';
}

/**
 * Allow a tool for this session
 */
export function allowToolForSession(toolName: string): void {
  sessionState.allowed.add(toolName);
  sessionState.denied.delete(toolName);
}

/**
 * Deny a tool for this session
 */
export function denyToolForSession(toolName: string): void {
  sessionState.denied.add(toolName);
  sessionState.allowed.delete(toolName);
}

/**
 * Allow a tool permanently
 */
export function allowToolPermanently(toolName: string): void {
  const settings = loadPermissions();
  settings.toolSpecific[toolName] = 'always_allow';
  savePermissions(settings);
  sessionState.allowed.add(toolName);
}

/**
 * Reset session permissions
 */
export function resetSessionPermissions(): void {
  sessionState = {
    allowed: new Set(),
    denied: new Set(),
  };
}

/**
 * Get a human-readable description of what a tool does
 */
export function getToolRiskDescription(toolName: string, input: Record<string, unknown>): string {
  switch (toolName) {
    case 'write_file':
      return `Write to file: ${input.file_path}`;
    case 'edit_file':
      return `Edit file: ${input.file_path}`;
    case 'delete_path':
      return `Delete: ${input.path}`;
    case 'run_command':
      return `Run command: ${input.command}`;
    case 'git_ops':
      return `Git ${input.operation}: ${input.args || ''}`;
    case 'install_packages':
      return `Install packages: ${(input.packages as string[])?.join(', ')}`;
    case 'scaffold_project':
      return `Create project: ${input.project_name} (${input.template})`;
    case 'launch_demo':
      return `Launch demo server for: ${input.project_name}`;
    default:
      return `Execute: ${toolName}`;
  }
}

/**
 * Permission request for UI to handle
 */
export interface PermissionRequest {
  toolName: string;
  category: ToolCategory;
  description: string;
  input: Record<string, unknown>;
}

/**
 * Create a permission request object
 */
export function createPermissionRequest(
  toolName: string,
  input: Record<string, unknown>
): PermissionRequest | null {
  const category = getToolCategory(toolName);
  if (!category) return null;

  if (isToolAllowed(toolName)) return null;
  if (isToolDenied(toolName)) return null;
  if (!requiresPermission(toolName)) return null;

  return {
    toolName,
    category,
    description: getToolRiskDescription(toolName, input),
    input,
  };
}
