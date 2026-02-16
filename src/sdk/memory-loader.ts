// Updated: 2026-02-16 15:00:00
// Eames Design Agent - Hierarchical CLAUDE.md Loader
// Claude Code parity: merges enterprise → user → project → subdirectory

import { existsSync, readFileSync, readdirSync, statSync } from 'fs';
import { join, dirname, resolve, sep } from 'path';
import { homedir } from 'os';

// ============================================================================
// Types
// ============================================================================

export interface MemoryFile {
  /** Absolute path to the CLAUDE.md */
  path: string;
  /** Content of the file */
  content: string;
  /** Level: enterprise, user, project, subdirectory */
  level: 'enterprise' | 'user' | 'project' | 'subdirectory';
  /** Relative path from project root (for subdirectories) */
  relativePath?: string;
}

// ============================================================================
// Discovery
// ============================================================================

const MEMORY_FILENAMES = ['CLAUDE.md', 'AGENTS.md'];

/**
 * Load all CLAUDE.md files in hierarchical order:
 * 1. Enterprise (managed) - not applicable in open source
 * 2. User: ~/.claude/CLAUDE.md
 * 3. Project root: ./CLAUDE.md (and parent directories up to root)
 * 4. Subdirectories as they're accessed
 *
 * Returns them in order from broadest (user) to most specific (subdirectory).
 */
export function loadHierarchicalMemory(cwd?: string): MemoryFile[] {
  const projectRoot = cwd || process.cwd();
  const memories: MemoryFile[] = [];

  // 1. User-level memory: ~/.claude/CLAUDE.md
  for (const filename of MEMORY_FILENAMES) {
    const userMemory = join(homedir(), '.claude', filename);
    if (existsSync(userMemory)) {
      try {
        memories.push({
          path: userMemory,
          content: readFileSync(userMemory, 'utf-8'),
          level: 'user',
        });
      } catch {
        // Skip unreadable
      }
      break; // Only load one
    }
  }

  // 2. Walk from project root upward to filesystem root
  //    (Claude Code loads CLAUDE.md from cwd up to root)
  const visitedDirs = new Set<string>();
  let currentDir = resolve(projectRoot);

  while (currentDir && !visitedDirs.has(currentDir)) {
    visitedDirs.add(currentDir);

    for (const filename of MEMORY_FILENAMES) {
      const memoryPath = join(currentDir, filename);
      if (existsSync(memoryPath)) {
        try {
          const isProjectRoot = currentDir === resolve(projectRoot);
          memories.push({
            path: memoryPath,
            content: readFileSync(memoryPath, 'utf-8'),
            level: isProjectRoot ? 'project' : 'subdirectory',
            relativePath: isProjectRoot ? '.' : currentDir.replace(resolve(projectRoot) + sep, ''),
          });
        } catch {
          // Skip
        }
        break; // Only load one filename per directory
      }
    }

    const parent = dirname(currentDir);
    if (parent === currentDir) break; // Reached filesystem root
    currentDir = parent;
  }

  return memories;
}

/**
 * Load CLAUDE.md from a specific subdirectory (when agent accesses files there).
 */
export function loadSubdirectoryMemory(subdir: string, projectRoot?: string): MemoryFile | null {
  const root = projectRoot || process.cwd();
  const resolvedSubdir = resolve(root, subdir);

  for (const filename of MEMORY_FILENAMES) {
    const memoryPath = join(resolvedSubdir, filename);
    if (existsSync(memoryPath)) {
      try {
        return {
          path: memoryPath,
          content: readFileSync(memoryPath, 'utf-8'),
          level: 'subdirectory',
          relativePath: subdir,
        };
      } catch {
        return null;
      }
    }
  }

  return null;
}

/**
 * Merge all memory files into a single system prompt section.
 */
export function buildMemoryContext(cwd?: string): string {
  const memories = loadHierarchicalMemory(cwd);
  if (memories.length === 0) return '';

  const sections: string[] = [];

  for (const memory of memories) {
    const label = memory.level === 'user' ? 'User Preferences'
      : memory.level === 'project' ? 'Project Context'
      : `Context (${memory.relativePath || memory.path})`;

    sections.push(`## ${label}\n\n${memory.content.trim()}`);
  }

  return sections.join('\n\n---\n\n');
}

/**
 * Get a summary of loaded memory files.
 */
export function getMemorySummary(cwd?: string): string {
  const memories = loadHierarchicalMemory(cwd);
  if (memories.length === 0) return 'No CLAUDE.md files found.';

  const parts: string[] = [`${memories.length} memory file(s) loaded:`];
  for (const memory of memories) {
    const shortPath = memory.path.replace(homedir(), '~');
    const lines = memory.content.split('\n').length;
    parts.push(`  [${memory.level}] ${shortPath} (${lines} lines)`);
  }

  return parts.join('\n');
}
