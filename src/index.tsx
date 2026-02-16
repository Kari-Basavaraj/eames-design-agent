#!/usr/bin/env bun
// Updated: 2026-02-16 12:00:00
// Eames Design Agent - Entry Point
import React from 'react';
import { render } from 'ink';
import { config } from 'dotenv';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';
import { CLI } from './cli.js';
import { loadGlobalApiKeys } from './utils/env.js';

// 1. Load project-level .env (if present)
config({ quiet: true });

// 2. Load global API keys from ~/.eames/config.json
//    Keys saved via the TUI are stored globally so they work in any directory.
loadGlobalApiKeys();

// 3. Disable LangSmith tracing when key is missing/placeholder
const smithKey = process.env.LANGSMITH_API_KEY;
if (!smithKey || smithKey === 'your-api-key') {
  process.env.LANGSMITH_TRACING = 'false';
}

// 4. Load Eames global settings (legacy path)
const eamesConfigPath = join(homedir(), '.eames/config.json');
if (existsSync(eamesConfigPath)) {
  try {
    const eamesConfig = JSON.parse(readFileSync(eamesConfigPath, 'utf-8'));
    if (eamesConfig.env) {
      Object.entries(eamesConfig.env).forEach(([key, value]) => {
        if (!process.env[key]) {
          process.env[key] = value as string;
        }
      });
    }
  } catch {
    // Ignore config parse errors
  }
}

// 5. Parse CLI arguments
const args = process.argv.slice(2);
const initialQuery = args.join(' ') || undefined;

// 6. Render the Ink app
render(<CLI initialQuery={initialQuery} />, {
  stdin: process.stdin.isTTY ? process.stdin : undefined,
});
