// Updated: 2026-02-16 12:00:00
// Eames Design Agent - Settings Management
// Settings saved globally in ~/.eames/settings.json

import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { homedir } from 'os';

const EAMES_DIR = join(homedir(), '.eames');
const SETTINGS_FILE = join(EAMES_DIR, 'settings.json');

// Also check legacy CWD-relative path for migration
const LEGACY_SETTINGS_FILE = '.eames/settings.json';

interface Config {
  provider?: string;
  modelId?: string;
  useSdkMode?: boolean;
  sdkPermissionMode?: string;
  [key: string]: unknown;
}

function ensureDir(): void {
  if (!existsSync(EAMES_DIR)) {
    mkdirSync(EAMES_DIR, { recursive: true });
  }
}

export function loadConfig(): Config {
  // Try global settings first
  try {
    if (existsSync(SETTINGS_FILE)) {
      return JSON.parse(readFileSync(SETTINGS_FILE, 'utf-8'));
    }
  } catch {
    // Fall through
  }

  // Try legacy CWD-relative path (migration)
  try {
    if (existsSync(LEGACY_SETTINGS_FILE)) {
      const config = JSON.parse(readFileSync(LEGACY_SETTINGS_FILE, 'utf-8'));
      // Migrate to global location
      saveConfig(config);
      return config;
    }
  } catch {
    // Fall through
  }

  return {};
}

export function saveConfig(config: Config): boolean {
  try {
    ensureDir();
    writeFileSync(SETTINGS_FILE, JSON.stringify(config, null, 2) + '\n');
    return true;
  } catch {
    return false;
  }
}

export function getSetting<T>(key: string, defaultValue: T): T {
  const config = loadConfig();
  return (config[key] as T) ?? defaultValue;
}

export function setSetting(key: string, value: unknown): boolean {
  const config = loadConfig();
  config[key] = value;
  return saveConfig(config);
}
