// Updated: 2026-01-12 19:45:00
// Project Detector - Automatically detects project type and context

import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

// ============================================================================
// Types
// ============================================================================

export interface ProjectContext {
  cwd: string;
  name: string;
  type: ProjectType;
  framework?: string;
  packageManager: 'npm' | 'yarn' | 'pnpm' | 'bun';
  scripts: Record<string, string>;
  devCommand?: string;
  buildCommand?: string;
  devPort?: number;
  mainFiles: string[];
}

export type ProjectType =
  | 'react-vite'
  | 'react-cra'
  | 'nextjs'
  | 'remix'
  | 'vue'
  | 'svelte'
  | 'angular'
  | 'node'
  | 'unknown';

// ============================================================================
// Detection Logic
// ============================================================================

/**
 * Detects project context from the current working directory.
 */
export function detectProject(cwd: string = process.cwd()): ProjectContext {
  const context: ProjectContext = {
    cwd,
    name: 'unknown',
    type: 'unknown',
    packageManager: detectPackageManager(cwd),
    scripts: {},
    mainFiles: [],
  };

  // Read package.json if exists
  const packageJsonPath = join(cwd, 'package.json');
  if (existsSync(packageJsonPath)) {
    try {
      const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
      context.name = packageJson.name || 'unnamed-project';
      context.scripts = packageJson.scripts || {};

      // Detect project type from dependencies
      const deps = {
        ...packageJson.dependencies,
        ...packageJson.devDependencies,
      };

      context.type = detectProjectType(deps, cwd);
      context.framework = detectFramework(deps);
      context.devCommand = detectDevCommand(context.scripts, context.packageManager);
      context.buildCommand = detectBuildCommand(context.scripts, context.packageManager);
      context.devPort = detectDevPort(context.scripts);
    } catch {
      // Ignore parse errors
    }
  }

  // Find main files
  context.mainFiles = findMainFiles(cwd, context.type);

  return context;
}

/**
 * Detects the package manager being used.
 */
function detectPackageManager(cwd: string): 'npm' | 'yarn' | 'pnpm' | 'bun' {
  if (existsSync(join(cwd, 'bun.lockb')) || existsSync(join(cwd, 'bun.lock'))) return 'bun';
  if (existsSync(join(cwd, 'pnpm-lock.yaml'))) return 'pnpm';
  if (existsSync(join(cwd, 'yarn.lock'))) return 'yarn';
  return 'npm';
}

/**
 * Detects the project type from dependencies.
 */
function detectProjectType(deps: Record<string, string>, cwd: string): ProjectType {
  if (deps['next']) return 'nextjs';
  if (deps['@remix-run/react']) return 'remix';
  if (deps['vue']) return 'vue';
  if (deps['svelte']) return 'svelte';
  if (deps['@angular/core']) return 'angular';

  if (deps['react']) {
    // Check for Vite vs CRA
    if (deps['vite'] || existsSync(join(cwd, 'vite.config.ts')) || existsSync(join(cwd, 'vite.config.js'))) {
      return 'react-vite';
    }
    if (deps['react-scripts']) return 'react-cra';
    return 'react-vite'; // Default React to Vite
  }

  if (deps['express'] || deps['fastify'] || deps['koa']) return 'node';

  return 'unknown';
}

/**
 * Detects UI framework (Tailwind, etc.)
 */
function detectFramework(deps: Record<string, string>): string | undefined {
  const frameworks: string[] = [];

  if (deps['tailwindcss']) frameworks.push('Tailwind');
  if (deps['@chakra-ui/react']) frameworks.push('Chakra UI');
  if (deps['@mui/material']) frameworks.push('MUI');
  if (deps['styled-components']) frameworks.push('Styled Components');
  if (deps['@emotion/react']) frameworks.push('Emotion');

  return frameworks.length > 0 ? frameworks.join(', ') : undefined;
}

/**
 * Detects the dev command from scripts.
 */
function detectDevCommand(scripts: Record<string, string>, pm: string): string | undefined {
  const runCmd = pm === 'npm' ? 'npm run' : pm;

  if (scripts['dev']) return `${runCmd} dev`;
  if (scripts['start']) return `${runCmd} start`;
  if (scripts['serve']) return `${runCmd} serve`;
  if (scripts['develop']) return `${runCmd} develop`;

  return undefined;
}

/**
 * Detects the build command from scripts.
 */
function detectBuildCommand(scripts: Record<string, string>, pm: string): string | undefined {
  const runCmd = pm === 'npm' ? 'npm run' : pm;

  if (scripts['build']) return `${runCmd} build`;

  return undefined;
}

/**
 * Detects the dev server port from scripts.
 */
function detectDevPort(scripts: Record<string, string>): number | undefined {
  const devScript = scripts['dev'] || scripts['start'] || '';

  // Common patterns: --port 3000, -p 3000, PORT=3000
  const portMatch = devScript.match(/(?:--port|PORT=|-p)\s*(\d+)/);
  if (portMatch) return parseInt(portMatch[1], 10);

  // Default ports by framework detection
  if (devScript.includes('next')) return 3000;
  if (devScript.includes('vite')) return 5173;
  if (devScript.includes('react-scripts')) return 3000;

  return 5173; // Default to Vite port
}

/**
 * Finds main source files for the project.
 */
function findMainFiles(cwd: string, type: ProjectType): string[] {
  const files: string[] = [];

  const candidates = [
    'src/App.tsx',
    'src/App.jsx',
    'src/app/page.tsx',  // Next.js app router
    'pages/index.tsx',   // Next.js pages router
    'src/main.tsx',
    'src/index.tsx',
    'src/theme.ts',
    'tailwind.config.js',
    'tailwind.config.ts',
  ];

  for (const file of candidates) {
    if (existsSync(join(cwd, file))) {
      files.push(file);
    }
  }

  return files;
}

// ============================================================================
// Context Formatting
// ============================================================================

/**
 * Formats project context for the system prompt.
 */
export function formatProjectContext(ctx: ProjectContext): string {
  const lines: string[] = [
    `## PROJECT CONTEXT`,
    `- **Directory**: ${ctx.cwd}`,
    `- **Name**: ${ctx.name}`,
    `- **Type**: ${ctx.type}`,
  ];

  if (ctx.framework) {
    lines.push(`- **Framework**: ${ctx.framework}`);
  }

  lines.push(`- **Package Manager**: ${ctx.packageManager}`);

  if (ctx.devCommand) {
    lines.push(`- **Dev Command**: \`${ctx.devCommand}\``);
  }

  if (ctx.devPort) {
    lines.push(`- **Dev URL**: http://localhost:${ctx.devPort}`);
  }

  if (ctx.mainFiles.length > 0) {
    lines.push(`- **Key Files**: ${ctx.mainFiles.join(', ')}`);
  }

  // Add available scripts
  const scriptNames = Object.keys(ctx.scripts);
  if (scriptNames.length > 0) {
    lines.push(`- **Scripts**: ${scriptNames.join(', ')}`);
  }

  return lines.join('\n');
}
