// Updated: 2026-01-12 03:30:00
// Eames Design Agent - Git Status Utilities
// Claude Code-like git integration

import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { join } from 'path';

/**
 * Git repository status
 */
export interface GitStatus {
  isRepo: boolean;
  branch: string;
  ahead: number;
  behind: number;
  staged: number;
  modified: number;
  untracked: number;
  conflicts: number;
  stashes: number;
  isDirty: boolean;
  isClean: boolean;
  lastCommit?: {
    hash: string;
    message: string;
    author: string;
    date: string;
  };
}

/**
 * File change status
 */
export interface FileChange {
  path: string;
  status: 'added' | 'modified' | 'deleted' | 'renamed' | 'copied' | 'untracked' | 'ignored' | 'conflict';
  staged: boolean;
  oldPath?: string;
}

/**
 * Check if current directory is a git repo
 */
export function isGitRepo(cwd: string = process.cwd()): boolean {
  try {
    execSync('git rev-parse --is-inside-work-tree', {
      cwd,
      stdio: 'pipe',
    });
    return true;
  } catch {
    return false;
  }
}

/**
 * Get current branch name
 */
export function getCurrentBranch(cwd: string = process.cwd()): string {
  try {
    return execSync('git branch --show-current', {
      cwd,
      encoding: 'utf-8',
      stdio: 'pipe',
    }).trim();
  } catch {
    // Detached HEAD
    try {
      const hash = execSync('git rev-parse --short HEAD', {
        cwd,
        encoding: 'utf-8',
        stdio: 'pipe',
      }).trim();
      return `(${hash})`;
    } catch {
      return 'unknown';
    }
  }
}

/**
 * Get ahead/behind count from remote
 */
export function getAheadBehind(cwd: string = process.cwd()): { ahead: number; behind: number } {
  try {
    const output = execSync('git rev-list --left-right --count HEAD...@{u}', {
      cwd,
      encoding: 'utf-8',
      stdio: 'pipe',
    }).trim();
    const [ahead, behind] = output.split(/\s+/).map(n => parseInt(n) || 0);
    return { ahead, behind };
  } catch {
    return { ahead: 0, behind: 0 };
  }
}

/**
 * Get file status counts
 */
export function getStatusCounts(cwd: string = process.cwd()): {
  staged: number;
  modified: number;
  untracked: number;
  conflicts: number;
} {
  try {
    const output = execSync('git status --porcelain', {
      cwd,
      encoding: 'utf-8',
      stdio: 'pipe',
    });

    let staged = 0;
    let modified = 0;
    let untracked = 0;
    let conflicts = 0;

    for (const line of output.split('\n')) {
      if (!line) continue;
      const x = line[0];
      const y = line[1];

      // Conflicts
      if (x === 'U' || y === 'U' || (x === 'A' && y === 'A') || (x === 'D' && y === 'D')) {
        conflicts++;
        continue;
      }

      // Staged
      if (x !== ' ' && x !== '?') {
        staged++;
      }

      // Modified (unstaged)
      if (y === 'M' || y === 'D') {
        modified++;
      }

      // Untracked
      if (x === '?' && y === '?') {
        untracked++;
      }
    }

    return { staged, modified, untracked, conflicts };
  } catch {
    return { staged: 0, modified: 0, untracked: 0, conflicts: 0 };
  }
}

/**
 * Get stash count
 */
export function getStashCount(cwd: string = process.cwd()): number {
  try {
    const output = execSync('git stash list', {
      cwd,
      encoding: 'utf-8',
      stdio: 'pipe',
    });
    return output.split('\n').filter(l => l.trim()).length;
  } catch {
    return 0;
  }
}

/**
 * Get last commit info
 */
export function getLastCommit(cwd: string = process.cwd()): GitStatus['lastCommit'] | undefined {
  try {
    const output = execSync('git log -1 --format="%h|%s|%an|%ar"', {
      cwd,
      encoding: 'utf-8',
      stdio: 'pipe',
    }).trim();
    const [hash, message, author, date] = output.split('|');
    return { hash, message, author, date };
  } catch {
    return undefined;
  }
}

/**
 * Get full git status
 */
export function getGitStatus(cwd: string = process.cwd()): GitStatus {
  if (!isGitRepo(cwd)) {
    return {
      isRepo: false,
      branch: '',
      ahead: 0,
      behind: 0,
      staged: 0,
      modified: 0,
      untracked: 0,
      conflicts: 0,
      stashes: 0,
      isDirty: false,
      isClean: true,
    };
  }

  const branch = getCurrentBranch(cwd);
  const { ahead, behind } = getAheadBehind(cwd);
  const { staged, modified, untracked, conflicts } = getStatusCounts(cwd);
  const stashes = getStashCount(cwd);
  const lastCommit = getLastCommit(cwd);

  const isDirty = staged > 0 || modified > 0 || untracked > 0 || conflicts > 0;

  return {
    isRepo: true,
    branch,
    ahead,
    behind,
    staged,
    modified,
    untracked,
    conflicts,
    stashes,
    isDirty,
    isClean: !isDirty,
    lastCommit,
  };
}

/**
 * Get detailed file changes
 */
export function getFileChanges(cwd: string = process.cwd()): FileChange[] {
  try {
    const output = execSync('git status --porcelain', {
      cwd,
      encoding: 'utf-8',
      stdio: 'pipe',
    });

    const changes: FileChange[] = [];

    for (const line of output.split('\n')) {
      if (!line) continue;
      const x = line[0];
      const y = line[1];
      const path = line.slice(3).trim();

      // Parse rename
      let actualPath = path;
      let oldPath: string | undefined;
      if (path.includes(' -> ')) {
        const [from, to] = path.split(' -> ');
        oldPath = from;
        actualPath = to;
      }

      // Determine status
      let status: FileChange['status'];
      let staged = false;

      if (x === 'U' || y === 'U' || (x === 'A' && y === 'A') || (x === 'D' && y === 'D')) {
        status = 'conflict';
      } else if (x === '?' && y === '?') {
        status = 'untracked';
      } else if (x === '!') {
        status = 'ignored';
      } else if (x === 'R') {
        status = 'renamed';
        staged = true;
      } else if (x === 'C') {
        status = 'copied';
        staged = true;
      } else if (x === 'A') {
        status = 'added';
        staged = true;
      } else if (x === 'D' || y === 'D') {
        status = 'deleted';
        staged = x === 'D';
      } else if (x === 'M' || y === 'M') {
        status = 'modified';
        staged = x === 'M';
      } else {
        status = 'modified';
      }

      changes.push({ path: actualPath, status, staged, oldPath });
    }

    return changes;
  } catch {
    return [];
  }
}

/**
 * Format git status for prompt display
 */
export function formatGitPrompt(status: GitStatus): string {
  if (!status.isRepo) return '';

  const parts: string[] = [];

  // Branch
  parts.push(status.branch);

  // Ahead/behind
  if (status.ahead > 0) parts.push(`↑${status.ahead}`);
  if (status.behind > 0) parts.push(`↓${status.behind}`);

  // Status indicators
  const indicators: string[] = [];
  if (status.staged > 0) indicators.push(`+${status.staged}`);
  if (status.modified > 0) indicators.push(`~${status.modified}`);
  if (status.untracked > 0) indicators.push(`?${status.untracked}`);
  if (status.conflicts > 0) indicators.push(`!${status.conflicts}`);
  if (status.stashes > 0) indicators.push(`≡${status.stashes}`);

  if (indicators.length > 0) {
    parts.push(`[${indicators.join(' ')}]`);
  }

  return parts.join(' ');
}

/**
 * Get color for branch based on status
 */
export function getBranchColor(status: GitStatus): string {
  if (status.conflicts > 0) return '#e06c75'; // red
  if (status.isDirty) return '#e5c07b'; // yellow
  if (status.ahead > 0) return '#61afef'; // blue
  return '#98c379'; // green
}

/**
 * Get status icon
 */
export function getStatusIcon(status: FileChange['status']): string {
  switch (status) {
    case 'added': return '✚';
    case 'modified': return '✎';
    case 'deleted': return '✖';
    case 'renamed': return '➜';
    case 'copied': return '⧉';
    case 'untracked': return '?';
    case 'conflict': return '⚠';
    case 'ignored': return '◌';
    default: return '•';
  }
}

/**
 * Get status color
 */
export function getStatusColor(status: FileChange['status']): string {
  switch (status) {
    case 'added': return '#98c379'; // green
    case 'modified': return '#e5c07b'; // yellow
    case 'deleted': return '#e06c75'; // red
    case 'renamed': return '#61afef'; // blue
    case 'copied': return '#61afef'; // blue
    case 'untracked': return '#5c6370'; // gray
    case 'conflict': return '#e06c75'; // red
    case 'ignored': return '#5c6370'; // gray
    default: return '#abb2bf';
  }
}
