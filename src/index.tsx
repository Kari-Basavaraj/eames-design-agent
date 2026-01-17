#!/usr/bin/env bun
// Updated: 2026-01-12 22:45:00
import React from 'react';
import { render } from 'ink';
import { config } from 'dotenv';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';
import { spawn } from 'bun';
import { CLI } from './cli.js';

// Load environment variables from .env
config({ quiet: true });

// Load Eames-specific settings (separate from Claude Code)
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

// Clean up any stale ngrok/callme processes from previous sessions
// This ensures fresh connections when SDK starts the MCP server
try {
  spawn(['pkill', '-9', '-f', 'ngrok'], { stdout: 'ignore', stderr: 'ignore' });
  spawn(['pkill', '-9', '-f', 'bun.*callme'], { stdout: 'ignore', stderr: 'ignore' });
} catch {
  // Ignore cleanup errors
}

// Get initial query from command line arguments
const args = process.argv.slice(2);
const initialQuery = args.join(' ') || undefined;

// Render the CLI app with optional initial query
render(<CLI initialQuery={initialQuery} />, {
  stdin: process.stdin.isTTY ? process.stdin : undefined,
});
