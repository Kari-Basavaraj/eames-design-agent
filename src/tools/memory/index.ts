// Updated: 2026-01-11 23:55:00
// Eames Design Agent - Memory & Context Tools
// Persistent memory across sessions - Claude Code-like intelligence

import { DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';
import * as fs from 'fs/promises';
import * as path from 'path';

const EAMES_OUTPUT_DIR = path.join(process.env.HOME || '', 'eames-projects');
const MEMORY_FILE = path.join(EAMES_OUTPUT_DIR, '.eames-memory.json');

interface MemoryEntry {
  timestamp: string;
  type: 'prd' | 'component' | 'project' | 'task' | 'note';
  title: string;
  content: string;
  project?: string;
  files?: string[];
}

interface EamesMemory {
  lastUpdated: string;
  currentProject?: string;
  entries: MemoryEntry[];
  recentFiles: string[];
}

async function loadMemory(): Promise<EamesMemory> {
  try {
    const data = await fs.readFile(MEMORY_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return {
      lastUpdated: new Date().toISOString(),
      entries: [],
      recentFiles: [],
    };
  }
}

async function saveMemory(memory: EamesMemory): Promise<void> {
  memory.lastUpdated = new Date().toISOString();
  await fs.mkdir(EAMES_OUTPUT_DIR, { recursive: true });
  await fs.writeFile(MEMORY_FILE, JSON.stringify(memory, null, 2));
}

/**
 * Remember something for future sessions
 */
export const remember = new DynamicStructuredTool({
  name: 'remember',
  description: 'Save important information to persistent memory for future sessions. Use this to remember PRDs, decisions, project context, or any important details.',
  schema: z.object({
    type: z.enum(['prd', 'component', 'project', 'task', 'note']).describe('Type of memory'),
    title: z.string().describe('Short title for this memory'),
    content: z.string().describe('Content to remember'),
    project: z.string().optional().describe('Associated project name'),
    files: z.array(z.string()).optional().describe('Associated file paths'),
  }),
  func: async (input) => {
    try {
      const memory = await loadMemory();

      const entry: MemoryEntry = {
        timestamp: new Date().toISOString(),
        type: input.type,
        title: input.title,
        content: input.content,
        project: input.project,
        files: input.files,
      };

      // Keep only last 50 entries
      memory.entries = [entry, ...memory.entries].slice(0, 50);

      if (input.project) {
        memory.currentProject = input.project;
      }

      await saveMemory(memory);

      return JSON.stringify({
        success: true,
        message: `Remembered: ${input.title}`,
        entryCount: memory.entries.length,
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
 * Recall memories from previous sessions
 */
export const recall = new DynamicStructuredTool({
  name: 'recall',
  description: 'Retrieve memories from previous sessions. Use this at the START of every conversation to check what work was done before. ALWAYS call this first when user mentions continuing previous work.',
  schema: z.object({
    type: z.enum(['prd', 'component', 'project', 'task', 'note', 'all']).optional().describe('Filter by memory type'),
    search: z.string().optional().describe('Search term to filter memories'),
    limit: z.number().optional().describe('Max number of memories to return (default: 10)'),
  }),
  func: async (input) => {
    try {
      const memory = await loadMemory();
      let entries = memory.entries;

      // Filter by type
      if (input.type && input.type !== 'all') {
        entries = entries.filter(e => e.type === input.type);
      }

      // Filter by search term
      if (input.search) {
        const search = input.search.toLowerCase();
        entries = entries.filter(e =>
          e.title.toLowerCase().includes(search) ||
          e.content.toLowerCase().includes(search)
        );
      }

      // Limit results
      const limit = input.limit || 10;
      entries = entries.slice(0, limit);

      return JSON.stringify({
        success: true,
        currentProject: memory.currentProject,
        lastUpdated: memory.lastUpdated,
        memories: entries,
        totalCount: memory.entries.length,
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
 * Scan workspace for existing projects and files
 */
export const scanWorkspace = new DynamicStructuredTool({
  name: 'scan_workspace',
  description: 'Scan the eames-projects directory to discover existing projects and recent work. Use this to understand what has been built before.',
  schema: z.object({
    detailed: z.boolean().optional().describe('Include file listings for each project'),
  }),
  func: async (input) => {
    try {
      await fs.mkdir(EAMES_OUTPUT_DIR, { recursive: true });

      const entries = await fs.readdir(EAMES_OUTPUT_DIR, { withFileTypes: true });
      const projects: any[] = [];

      for (const entry of entries) {
        if (entry.isDirectory() && !entry.name.startsWith('.')) {
          const projectPath = path.join(EAMES_OUTPUT_DIR, entry.name);
          const stat = await fs.stat(projectPath);

          const project: any = {
            name: entry.name,
            path: projectPath,
            lastModified: stat.mtime.toISOString(),
          };

          if (input.detailed) {
            try {
              const files = await fs.readdir(projectPath);
              project.files = files.filter(f => !f.startsWith('.'));

              // Check for key files
              project.hasPackageJson = files.includes('package.json');
              project.hasSrc = files.includes('src');

              // Try to read any PRD or README
              for (const prdName of ['PRD.md', 'prd.md', 'README.md']) {
                if (files.includes(prdName)) {
                  const prdContent = await fs.readFile(path.join(projectPath, prdName), 'utf-8');
                  project.prdSummary = prdContent.slice(0, 500) + (prdContent.length > 500 ? '...' : '');
                  break;
                }
              }
            } catch {
              // Ignore errors reading project contents
            }
          }

          projects.push(project);
        }
      }

      // Sort by last modified (newest first)
      projects.sort((a, b) => new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime());

      // Also look for standalone files (like PRDs)
      const standaloneFiles: string[] = [];
      for (const entry of entries) {
        if (entry.isFile() && (entry.name.endsWith('.md') || entry.name.endsWith('.json'))) {
          standaloneFiles.push(entry.name);
        }
      }

      return JSON.stringify({
        success: true,
        workspacePath: EAMES_OUTPUT_DIR,
        projectCount: projects.length,
        projects,
        standaloneFiles,
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
 * Get context about current work
 */
export const getContext = new DynamicStructuredTool({
  name: 'get_context',
  description: 'Get full context about current and recent work. Combines memory recall and workspace scan. Use this at the START of conversations to understand what to continue.',
  schema: z.object({}),
  func: async () => {
    try {
      // Load memory
      const memory = await loadMemory();

      // Scan workspace
      await fs.mkdir(EAMES_OUTPUT_DIR, { recursive: true });
      const entries = await fs.readdir(EAMES_OUTPUT_DIR, { withFileTypes: true });

      const recentProjects: any[] = [];
      for (const entry of entries) {
        if (entry.isDirectory() && !entry.name.startsWith('.')) {
          const projectPath = path.join(EAMES_OUTPUT_DIR, entry.name);
          const stat = await fs.stat(projectPath);
          recentProjects.push({
            name: entry.name,
            lastModified: stat.mtime.toISOString(),
          });
        }
      }
      recentProjects.sort((a, b) => new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime());

      // Get recent PRDs from memory
      const recentPRDs = memory.entries
        .filter(e => e.type === 'prd')
        .slice(0, 3);

      return JSON.stringify({
        success: true,
        currentProject: memory.currentProject,
        lastActivity: memory.lastUpdated,
        recentProjects: recentProjects.slice(0, 5),
        recentPRDs: recentPRDs.map(p => ({ title: p.title, project: p.project, timestamp: p.timestamp })),
        totalMemories: memory.entries.length,
        hint: recentPRDs.length > 0
          ? `Found ${recentPRDs.length} recent PRD(s). Use recall(type='prd') to get full content.`
          : 'No recent PRDs found. Check workspace for existing projects.',
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
 * Clear memory (for testing/reset)
 */
export const clearMemory = new DynamicStructuredTool({
  name: 'clear_memory',
  description: 'Clear all stored memories. Use with caution - this removes all persistent context.',
  schema: z.object({
    confirm: z.boolean().describe('Must be true to confirm deletion'),
  }),
  func: async (input) => {
    if (!input.confirm) {
      return JSON.stringify({
        success: false,
        error: 'Must set confirm=true to clear memory',
      });
    }

    try {
      await fs.unlink(MEMORY_FILE);
      return JSON.stringify({
        success: true,
        message: 'Memory cleared',
      });
    } catch (error) {
      return JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  },
});
