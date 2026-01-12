#!/usr/bin/env bun
// Updated: 2026-01-11 22:50:00
import React from 'react';
import { render } from 'ink';
import { config } from 'dotenv';
import { CLI } from './cli.js';

// Load environment variables
config({ quiet: true });

// Get initial query from command line arguments
const args = process.argv.slice(2);
const initialQuery = args.join(' ') || undefined;

// Render the CLI app with optional initial query
render(<CLI initialQuery={initialQuery} />);
