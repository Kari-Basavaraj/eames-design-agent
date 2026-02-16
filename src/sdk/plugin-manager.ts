// Updated: 2026-02-16 16:00:00
// Eames Design Agent - Plugin Install/Uninstall
// Claude Code parity: install plugins from npm, manage plugin cache

import { existsSync, mkdirSync, readFileSync, writeFileSync, rmSync, readdirSync } from 'fs';
import { join, basename } from 'path';
import { homedir } from 'os';
import { execSync } from 'child_process';

// ============================================================================
// Types
// ============================================================================

export interface InstalledPlugin {
  /** npm package name */
  name: string;
  /** Installed version */
  version: string;
  /** Install path in cache */
  path: string;
  /** Whether it has MCP servers */
  hasMcp: boolean;
  /** Whether it has skills */
  hasSkills: boolean;
  /** Whether it has commands */
  hasCommands: boolean;
}

export interface PluginManifest {
  name: string;
  version: string;
  description?: string;
  skills?: number;
  commands?: number;
  mcpServers?: Record<string, unknown>;
}

// ============================================================================
// Paths
// ============================================================================

function getPluginCacheDir(): string {
  return join(homedir(), '.claude', 'plugins', 'cache');
}

function getPluginRegistryPath(): string {
  return join(homedir(), '.claude', 'plugins', 'registry.json');
}

function ensurePluginDirs(): void {
  const cacheDir = getPluginCacheDir();
  if (!existsSync(cacheDir)) {
    mkdirSync(cacheDir, { recursive: true });
  }
}

// ============================================================================
// Registry
// ============================================================================

interface PluginRegistry {
  plugins: Record<string, { version: string; installedAt: string }>;
}

function loadRegistry(): PluginRegistry {
  const regPath = getPluginRegistryPath();
  if (!existsSync(regPath)) return { plugins: {} };
  try {
    return JSON.parse(readFileSync(regPath, 'utf-8'));
  } catch {
    return { plugins: {} };
  }
}

function saveRegistry(registry: PluginRegistry): void {
  ensurePluginDirs();
  const regPath = getPluginRegistryPath();
  const dir = join(homedir(), '.claude', 'plugins');
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  writeFileSync(regPath, JSON.stringify(registry, null, 2));
}

// ============================================================================
// Install / Uninstall
// ============================================================================

/**
 * Install a plugin from npm.
 * Creates a local install in ~/.claude/plugins/cache/<name>/
 */
export function installPlugin(packageName: string): { success: boolean; message: string; plugin?: InstalledPlugin } {
  ensurePluginDirs();

  const safeName = packageName.replace(/[^a-zA-Z0-9@/_-]/g, '');
  const installDir = join(getPluginCacheDir(), safeName.replace(/\//g, '__'));

  try {
    // Create install directory
    if (!existsSync(installDir)) {
      mkdirSync(installDir, { recursive: true });
    }

    // Initialize package.json if needed
    const pkgJsonPath = join(installDir, 'package.json');
    if (!existsSync(pkgJsonPath)) {
      writeFileSync(pkgJsonPath, JSON.stringify({ name: `eames-plugin-${safeName}`, private: true }, null, 2));
    }

    // Install via npm (or bun if available)
    const runtime = typeof Bun !== 'undefined' ? 'bun' : 'npm';
    const installCmd = runtime === 'bun'
      ? `bun add ${safeName}`
      : `npm install ${safeName} --save`;

    execSync(installCmd, {
      cwd: installDir,
      stdio: 'pipe',
      timeout: 60000,
    });

    // Read installed version
    let version = 'unknown';
    try {
      const installedPkg = JSON.parse(
        readFileSync(join(installDir, 'node_modules', safeName, 'package.json'), 'utf-8')
      );
      version = installedPkg.version || 'unknown';
    } catch {
      // Version detection failed
    }

    // Check for skills, commands, mcp
    const nodeModulePath = join(installDir, 'node_modules', safeName);
    const hasMcp = existsSync(join(nodeModulePath, '.mcp.json'));
    const hasSkills = existsSync(join(nodeModulePath, 'skills'));
    const hasCommands = existsSync(join(nodeModulePath, 'commands'));

    // Update registry
    const registry = loadRegistry();
    registry.plugins[safeName] = {
      version,
      installedAt: new Date().toISOString(),
    };
    saveRegistry(registry);

    const plugin: InstalledPlugin = {
      name: safeName,
      version,
      path: installDir,
      hasMcp,
      hasSkills,
      hasCommands,
    };

    return { success: true, message: `Installed ${safeName}@${version}`, plugin };
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return { success: false, message: `Failed to install ${safeName}: ${msg}` };
  }
}

/**
 * Uninstall a plugin by removing its cache directory.
 */
export function uninstallPlugin(packageName: string): { success: boolean; message: string } {
  const safeName = packageName.replace(/[^a-zA-Z0-9@/_-]/g, '');
  const installDir = join(getPluginCacheDir(), safeName.replace(/\//g, '__'));

  try {
    if (existsSync(installDir)) {
      rmSync(installDir, { recursive: true, force: true });
    }

    // Remove from registry
    const registry = loadRegistry();
    delete registry.plugins[safeName];
    saveRegistry(registry);

    return { success: true, message: `Uninstalled ${safeName}` };
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return { success: false, message: `Failed to uninstall ${safeName}: ${msg}` };
  }
}

/**
 * List all installed plugins.
 */
export function listInstalledPlugins(): InstalledPlugin[] {
  const cacheDir = getPluginCacheDir();
  if (!existsSync(cacheDir)) return [];

  const plugins: InstalledPlugin[] = [];
  const registry = loadRegistry();

  try {
    const dirs = readdirSync(cacheDir, { withFileTypes: true });
    for (const dir of dirs) {
      if (!dir.isDirectory()) continue;
      const pluginDir = join(cacheDir, dir.name);

      // Try to find the actual package name
      const name = dir.name.replace(/__/g, '/');
      const regEntry = registry.plugins[name];

      // Check for features
      let hasMcp = false;
      let hasSkills = false;
      let hasCommands = false;

      try {
        const nodeModules = join(pluginDir, 'node_modules');
        if (existsSync(nodeModules)) {
          const pkgs = readdirSync(nodeModules, { withFileTypes: true });
          for (const pkg of pkgs) {
            if (pkg.name.startsWith('.')) continue;
            const pkgDir = join(nodeModules, pkg.name);
            if (existsSync(join(pkgDir, '.mcp.json'))) hasMcp = true;
            if (existsSync(join(pkgDir, 'skills'))) hasSkills = true;
            if (existsSync(join(pkgDir, 'commands'))) hasCommands = true;
          }
        }
      } catch {
        // Scan failed
      }

      plugins.push({
        name,
        version: regEntry?.version || 'unknown',
        path: pluginDir,
        hasMcp,
        hasSkills,
        hasCommands,
      });
    }
  } catch {
    // Cache unreadable
  }

  return plugins.sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Get a quick summary for /plugin display.
 */
export function getPluginsSummary(): string {
  const plugins = listInstalledPlugins();
  if (plugins.length === 0) return 'No plugins installed.\nInstall with: /plugin install <npm-package>';

  const parts: string[] = [`${plugins.length} plugin(s) installed:`];
  for (const plugin of plugins) {
    const features: string[] = [];
    if (plugin.hasMcp) features.push('MCP');
    if (plugin.hasSkills) features.push('Skills');
    if (plugin.hasCommands) features.push('Commands');
    const featureStr = features.length > 0 ? ` [${features.join(', ')}]` : '';
    parts.push(`  ${plugin.name}@${plugin.version}${featureStr}`);
  }

  return parts.join('\n');
}
