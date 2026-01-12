// Updated: 2026-01-12 01:45:00
// Eames Design Agent - Project Context
// Auto-load EAMES.md files like Claude Code loads CLAUDE.md

import { existsSync, readFileSync } from 'fs';
import { join, dirname } from 'path';
import { homedir } from 'os';

/**
 * Project context loaded from EAMES.md files
 */
export interface ProjectContext {
  globalContext: string | null;
  projectContext: string | null;
  combinedContext: string;
}

/**
 * Find and read an EAMES.md file in a directory
 */
function readEamesMd(dir: string): string | null {
  const filePath = join(dir, 'EAMES.md');
  if (existsSync(filePath)) {
    try {
      return readFileSync(filePath, 'utf-8');
    } catch {
      return null;
    }
  }
  return null;
}

/**
 * Search for EAMES.md files up the directory tree
 */
function findProjectEamesMd(startDir: string): string | null {
  let currentDir = startDir;
  const root = dirname(currentDir);

  while (currentDir !== root) {
    const content = readEamesMd(currentDir);
    if (content) {
      return content;
    }
    currentDir = dirname(currentDir);
  }

  return null;
}

/**
 * Load project context from EAMES.md files
 *
 * Searches:
 * 1. ~/.eames/EAMES.md - Global context (always loaded)
 * 2. Project root EAMES.md - Project-specific context
 *
 * Similar to how Claude Code loads CLAUDE.md files
 */
export function loadProjectContext(projectDir?: string): ProjectContext {
  const homeDir = homedir();
  const cwd = projectDir || process.cwd();

  // Load global context from ~/.eames/EAMES.md
  const globalEamesPath = join(homeDir, '.eames', 'EAMES.md');
  let globalContext: string | null = null;
  if (existsSync(globalEamesPath)) {
    try {
      globalContext = readFileSync(globalEamesPath, 'utf-8');
    } catch {
      globalContext = null;
    }
  }

  // Find project-specific EAMES.md
  const projectContext = findProjectEamesMd(cwd);

  // Combine contexts
  const parts: string[] = [];

  if (globalContext) {
    parts.push('# Global Design Context\n' + globalContext);
  }

  if (projectContext) {
    parts.push('# Project Context\n' + projectContext);
  }

  return {
    globalContext,
    projectContext,
    combinedContext: parts.join('\n\n---\n\n'),
  };
}

/**
 * Get the enhanced system prompt with project context
 */
export function getEnhancedSystemPrompt(basePrompt: string, projectDir?: string): string {
  const context = loadProjectContext(projectDir);

  if (!context.combinedContext) {
    return basePrompt;
  }

  return `${basePrompt}

---

## Project & User Context

The following context has been loaded from EAMES.md files. Use this to understand the project and user preferences:

${context.combinedContext}

---

IMPORTANT: Follow any instructions in the EAMES.md files above. They take precedence over default behavior.`;
}

/**
 * Create a template EAMES.md file content
 */
export function createEamesMdTemplate(): string {
  return `# EAMES.md - Project Design Context

This file provides context to Eames, your AI Product Design Agent.
Similar to CLAUDE.md for Claude Code, this file helps Eames understand your project.

## Project Overview
<!-- Describe your project here -->

## Design System
<!-- Define colors, typography, spacing, etc. -->

## User Personas
<!-- Describe your target users -->

## Design Principles
<!-- List your design principles -->

## Technical Constraints
<!-- Any technical limitations to consider -->

## Brand Guidelines
<!-- Brand voice, visual identity, etc. -->

## Reference Links
<!-- Links to design systems, competitors, inspiration -->

---

Place this file in your project root or ~/.eames/ for global context.
`;
}

/**
 * Check if project has EAMES.md
 */
export function hasProjectContext(projectDir?: string): boolean {
  const context = loadProjectContext(projectDir);
  return context.projectContext !== null || context.globalContext !== null;
}
