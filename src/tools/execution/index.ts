// Updated: 2026-01-11 23:15:00
// Eames Design Agent - Autonomous Execution Tools
// Enables Eames to create files, scaffold projects, and run commands

import { DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs/promises';
import * as path from 'path';

const execAsync = promisify(exec);

// Default output directory for Eames projects
const EAMES_OUTPUT_DIR = path.join(process.env.HOME || '', 'eames-projects');

/**
 * Write a file to disk
 */
export const writeFile = new DynamicStructuredTool({
  name: 'write_file',
  description: 'Write content to a file. Creates directories if they don\'t exist. Use this to save generated code, components, or configuration files.',
  schema: z.object({
    file_path: z.string().describe('Path to the file (relative to project root or absolute)'),
    content: z.string().describe('Content to write to the file'),
    project_name: z.string().optional().describe('Project name (creates in ~/eames-projects/<project_name>/)'),
  }),
  func: async (input) => {
    try {
      let targetPath = input.file_path;

      // If project_name is provided, prefix with eames-projects directory
      if (input.project_name) {
        targetPath = path.join(EAMES_OUTPUT_DIR, input.project_name, input.file_path);
      } else if (!path.isAbsolute(targetPath)) {
        targetPath = path.join(EAMES_OUTPUT_DIR, targetPath);
      }

      // Ensure directory exists
      const dir = path.dirname(targetPath);
      await fs.mkdir(dir, { recursive: true });

      // Write the file
      await fs.writeFile(targetPath, input.content, 'utf-8');

      return JSON.stringify({
        success: true,
        message: `File written successfully`,
        path: targetPath,
      });
    } catch (error) {
      return JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  },
});

/**
 * Scaffold a new React + Vite + Tailwind project
 */
export const scaffoldProject = new DynamicStructuredTool({
  name: 'scaffold_project',
  description: 'Create a new React + Vite + Tailwind CSS project. Use this when you need to create a working demo from scratch.',
  schema: z.object({
    project_name: z.string().describe('Name of the project (will be created in ~/eames-projects/)'),
    description: z.string().optional().describe('Project description for package.json'),
  }),
  func: async (input) => {
    try {
      const projectPath = path.join(EAMES_OUTPUT_DIR, input.project_name);

      // Check if project already exists
      try {
        await fs.access(projectPath);
        return JSON.stringify({
          success: true,
          message: `Project already exists`,
          path: projectPath,
          alreadyExists: true,
        });
      } catch {
        // Project doesn't exist, continue creating
      }

      // Ensure eames-projects directory exists
      await fs.mkdir(EAMES_OUTPUT_DIR, { recursive: true });

      // Create Vite React project
      console.log(`\n🏗️  Scaffolding project: ${input.project_name}...`);
      await execAsync(`cd "${EAMES_OUTPUT_DIR}" && bun create vite ${input.project_name} --template react`, {
        timeout: 60000,
      });

      // Install dependencies
      console.log(`📦  Installing dependencies...`);
      await execAsync(`cd "${projectPath}" && bun install`, {
        timeout: 120000,
      });

      // Install Tailwind CSS
      console.log(`🎨  Adding Tailwind CSS...`);
      await execAsync(`cd "${projectPath}" && bun add -D tailwindcss @tailwindcss/vite`, {
        timeout: 60000,
      });

      // Install lucide-react for icons
      await execAsync(`cd "${projectPath}" && bun add lucide-react`, {
        timeout: 60000,
      });

      // Update vite.config.js for Tailwind
      const viteConfig = `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
})
`;
      await fs.writeFile(path.join(projectPath, 'vite.config.js'), viteConfig);

      // Update index.css for Tailwind
      const indexCss = `@import "tailwindcss";
`;
      await fs.writeFile(path.join(projectPath, 'src', 'index.css'), indexCss);

      // Update package.json description
      if (input.description) {
        const pkgPath = path.join(projectPath, 'package.json');
        const pkg = JSON.parse(await fs.readFile(pkgPath, 'utf-8'));
        pkg.description = input.description;
        await fs.writeFile(pkgPath, JSON.stringify(pkg, null, 2));
      }

      return JSON.stringify({
        success: true,
        message: `Project scaffolded successfully with React + Vite + Tailwind`,
        path: projectPath,
        commands: {
          dev: `cd "${projectPath}" && bun run dev`,
          build: `cd "${projectPath}" && bun run build`,
        },
      });
    } catch (error) {
      return JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  },
});

/**
 * Run a shell command
 */
export const runCommand = new DynamicStructuredTool({
  name: 'run_command',
  description: 'Run a shell command. Use this for installing dependencies, running build commands, or starting dev servers. Be careful with destructive commands.',
  schema: z.object({
    command: z.string().describe('The shell command to run'),
    working_directory: z.string().optional().describe('Working directory for the command'),
    project_name: z.string().optional().describe('Project name (uses ~/eames-projects/<project_name>/ as working directory)'),
    background: z.boolean().optional().describe('Run in background (for dev servers)'),
  }),
  func: async (input) => {
    try {
      let cwd = input.working_directory;

      if (input.project_name) {
        cwd = path.join(EAMES_OUTPUT_DIR, input.project_name);
      }

      // Security: block dangerous commands
      const blockedPatterns = ['rm -rf /', 'sudo rm', 'mkfs', ':(){', 'dd if='];
      for (const pattern of blockedPatterns) {
        if (input.command.includes(pattern)) {
          return JSON.stringify({
            success: false,
            error: 'Command blocked for safety reasons',
          });
        }
      }

      console.log(`\n⚡ Running: ${input.command}`);
      if (cwd) console.log(`   in: ${cwd}`);

      if (input.background) {
        // For background processes like dev servers
        const child = exec(input.command, { cwd });

        // Give it a moment to start
        await new Promise(resolve => setTimeout(resolve, 3000));

        return JSON.stringify({
          success: true,
          message: `Command started in background`,
          command: input.command,
          pid: child.pid,
        });
      }

      const { stdout, stderr } = await execAsync(input.command, {
        cwd,
        timeout: 120000,
      });

      return JSON.stringify({
        success: true,
        stdout: stdout.slice(0, 2000), // Limit output size
        stderr: stderr.slice(0, 500),
      });
    } catch (error) {
      return JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  },
});

/**
 * Start the dev server and open in browser
 */
export const launchDemo = new DynamicStructuredTool({
  name: 'launch_demo',
  description: 'Start the development server and open the project in a browser. Use this after creating a project and adding components.',
  schema: z.object({
    project_name: z.string().describe('Name of the project to launch'),
    port: z.number().optional().describe('Port to run on (default: 5173)'),
  }),
  func: async (input) => {
    try {
      const projectPath = path.join(EAMES_OUTPUT_DIR, input.project_name);
      const port = input.port || 5173;

      // Check if project exists
      try {
        await fs.access(projectPath);
      } catch {
        return JSON.stringify({
          success: false,
          error: `Project not found: ${projectPath}`,
        });
      }

      console.log(`\n🚀 Launching demo: ${input.project_name}`);
      console.log(`   Project path: ${projectPath}`);
      console.log(`   URL: http://localhost:${port}`);

      // Start dev server in background
      const devCommand = `cd "${projectPath}" && bun run dev --port ${port}`;
      exec(devCommand);

      // Wait for server to start
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Open in browser (macOS)
      exec(`open http://localhost:${port}`);

      return JSON.stringify({
        success: true,
        message: `Demo launched successfully`,
        url: `http://localhost:${port}`,
        projectPath,
      });
    } catch (error) {
      return JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  },
});

/**
 * Read a file from disk
 */
export const readFile = new DynamicStructuredTool({
  name: 'read_file',
  description: 'Read the contents of a file. Use this to check existing code or configuration.',
  schema: z.object({
    file_path: z.string().describe('Path to the file'),
    project_name: z.string().optional().describe('Project name (looks in ~/eames-projects/<project_name>/)'),
  }),
  func: async (input) => {
    try {
      let targetPath = input.file_path;

      if (input.project_name) {
        targetPath = path.join(EAMES_OUTPUT_DIR, input.project_name, input.file_path);
      } else if (!path.isAbsolute(targetPath)) {
        targetPath = path.join(EAMES_OUTPUT_DIR, targetPath);
      }

      const content = await fs.readFile(targetPath, 'utf-8');

      return JSON.stringify({
        success: true,
        path: targetPath,
        content: content.slice(0, 10000), // Limit content size
      });
    } catch (error) {
      return JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  },
});

/**
 * List files in a directory
 */
export const listFiles = new DynamicStructuredTool({
  name: 'list_files',
  description: 'List files and directories at a path. Use this to explore project structure.',
  schema: z.object({
    directory_path: z.string().optional().describe('Path to list (defaults to ~/eames-projects/)'),
    project_name: z.string().optional().describe('Project name (lists ~/eames-projects/<project_name>/)'),
  }),
  func: async (input) => {
    try {
      let targetPath = input.directory_path || EAMES_OUTPUT_DIR;

      if (input.project_name) {
        targetPath = path.join(EAMES_OUTPUT_DIR, input.project_name);
      }

      const entries = await fs.readdir(targetPath, { withFileTypes: true });
      const files = entries.map(entry => ({
        name: entry.name,
        type: entry.isDirectory() ? 'directory' : 'file',
      }));

      return JSON.stringify({
        success: true,
        path: targetPath,
        files,
      });
    } catch (error) {
      return JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  },
});
