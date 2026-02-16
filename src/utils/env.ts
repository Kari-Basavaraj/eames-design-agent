// Updated: 2026-02-16 12:00:00
// Eames Design Agent - Environment & API Key Management
// API keys stored globally in ~/.eames/config.json so they persist across projects

import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';
import { config } from 'dotenv';

// Load .env on module import (project-level overrides)
config({ quiet: true });

// ============================================================================
// Global config path: ~/.eames/config.json
// ============================================================================

const EAMES_DIR = join(homedir(), '.eames');
const EAMES_CONFIG = join(EAMES_DIR, 'config.json');

interface EamesGlobalConfig {
  apiKeys?: Record<string, string>;
  [key: string]: unknown;
}

function ensureEamesDir(): void {
  if (!existsSync(EAMES_DIR)) {
    mkdirSync(EAMES_DIR, { recursive: true });
  }
}

function loadGlobalConfig(): EamesGlobalConfig {
  try {
    if (existsSync(EAMES_CONFIG)) {
      return JSON.parse(readFileSync(EAMES_CONFIG, 'utf-8'));
    }
  } catch {
    // Ignore parse errors
  }
  return {};
}

function saveGlobalConfig(cfg: EamesGlobalConfig): boolean {
  try {
    ensureEamesDir();
    writeFileSync(EAMES_CONFIG, JSON.stringify(cfg, null, 2) + '\n');
    return true;
  } catch {
    return false;
  }
}

// ============================================================================
// Provider definitions
// ============================================================================

type ProviderConfig = {
  displayName: string;
  apiKeyEnvVar?: string;
};

const PROVIDERS: Record<string, ProviderConfig> = {
  anthropic: { displayName: 'Anthropic', apiKeyEnvVar: 'ANTHROPIC_API_KEY' },
  openai: { displayName: 'OpenAI', apiKeyEnvVar: 'OPENAI_API_KEY' },
  google: { displayName: 'Google', apiKeyEnvVar: 'GOOGLE_API_KEY' },
  openrouter: { displayName: 'OpenRouter', apiKeyEnvVar: 'OPENROUTER_API_KEY' },
  ollama: { displayName: 'Ollama (local)' },
};

export function getApiKeyNameForProvider(providerId: string): string | undefined {
  return PROVIDERS[providerId]?.apiKeyEnvVar;
}

export function getProviderDisplayName(providerId: string): string {
  return PROVIDERS[providerId]?.displayName || providerId;
}

// ============================================================================
// API Key resolution: env var > ~/.eames/config.json > project .env
// ============================================================================

function isValidKey(value: string | undefined): boolean {
  if (!value) return false;
  const trimmed = value.trim();
  return trimmed.length > 0 && !trimmed.startsWith('your-');
}

/**
 * Resolves an API key by checking (in order):
 * 1. Process environment variable (set via shell or .env)
 * 2. Global ~/.eames/config.json
 */
export function resolveApiKey(envVarName: string): string | undefined {
  // 1. Check process.env (includes .env loaded by dotenv)
  if (isValidKey(process.env[envVarName])) {
    return process.env[envVarName]!.trim();
  }

  // 2. Check global config
  const cfg = loadGlobalConfig();
  const globalKey = cfg.apiKeys?.[envVarName];
  if (isValidKey(globalKey)) {
    return globalKey!.trim();
  }

  return undefined;
}

export function checkApiKeyExists(apiKeyName: string): boolean {
  return resolveApiKey(apiKeyName) !== undefined;
}

export function checkApiKeyExistsForProvider(providerId: string): boolean {
  const apiKeyName = getApiKeyNameForProvider(providerId);
  if (!apiKeyName) return true; // Ollama doesn't need a key
  return checkApiKeyExists(apiKeyName);
}

/**
 * Save API key to ~/.eames/config.json (global, persists across projects).
 * Also injects into process.env so it takes effect immediately.
 */
export function saveApiKeyForProvider(providerId: string, apiKey: string): boolean {
  const apiKeyName = getApiKeyNameForProvider(providerId);
  if (!apiKeyName) return false;
  return saveApiKeyGlobal(apiKeyName, apiKey);
}

export function saveApiKeyGlobal(envVarName: string, value: string): boolean {
  const cfg = loadGlobalConfig();
  if (!cfg.apiKeys) cfg.apiKeys = {};
  cfg.apiKeys[envVarName] = value;
  const ok = saveGlobalConfig(cfg);
  if (ok) {
    // Also inject into current process so it works immediately
    process.env[envVarName] = value;
  }
  return ok;
}

/**
 * Load all saved API keys from ~/.eames/config.json into process.env.
 * Called once at startup so SDK/LangChain can find them.
 */
export function loadGlobalApiKeys(): void {
  const cfg = loadGlobalConfig();
  if (cfg.apiKeys) {
    for (const [key, value] of Object.entries(cfg.apiKeys)) {
      if (isValidKey(value) && !isValidKey(process.env[key])) {
        process.env[key] = value;
      }
    }
  }
}

// Legacy compat: also exported as saveApiKeyToEnv
export const saveApiKeyToEnv = saveApiKeyGlobal;
