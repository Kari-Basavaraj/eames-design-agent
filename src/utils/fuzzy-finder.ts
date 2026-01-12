// Updated: 2026-01-12 04:05:00
// Eames Design Agent - Fuzzy File Finder
// Quick file navigation

import { readdirSync, statSync, existsSync } from 'fs';
import { join, relative, sep } from 'path';

/**
 * File entry for fuzzy finder
 */
export interface FileEntry {
  path: string;
  relativePath: string;
  name: string;
  isDirectory: boolean;
  extension?: string;
  size?: number;
  modifiedTime?: number;
}

/**
 * Search result with score
 */
export interface FileSearchResult {
  entry: FileEntry;
  score: number;
  matchIndices: number[];
}

/**
 * Default ignored patterns
 */
export const DEFAULT_IGNORE_PATTERNS = [
  'node_modules',
  '.git',
  '.svn',
  '.hg',
  '__pycache__',
  '.next',
  '.nuxt',
  'dist',
  'build',
  'coverage',
  '.cache',
  '.vscode',
  '.idea',
  '*.pyc',
  '*.pyo',
  '.DS_Store',
  'Thumbs.db',
];

/**
 * Check if path matches ignore pattern
 */
function matchesIgnorePattern(name: string, patterns: string[]): boolean {
  for (const pattern of patterns) {
    if (pattern.startsWith('*')) {
      // Extension pattern
      if (name.endsWith(pattern.slice(1))) return true;
    } else {
      // Exact match
      if (name === pattern) return true;
    }
  }
  return false;
}

/**
 * Scan directory recursively
 */
export function scanDirectory(
  dir: string,
  options?: {
    maxDepth?: number;
    maxFiles?: number;
    ignorePatterns?: string[];
    includeDirectories?: boolean;
    extensions?: string[];
  }
): FileEntry[] {
  const maxDepth = options?.maxDepth ?? 10;
  const maxFiles = options?.maxFiles ?? 5000;
  const ignorePatterns = options?.ignorePatterns ?? DEFAULT_IGNORE_PATTERNS;
  const includeDirectories = options?.includeDirectories ?? false;
  const extensions = options?.extensions;

  const entries: FileEntry[] = [];

  function scan(currentDir: string, depth: number): void {
    if (depth > maxDepth || entries.length >= maxFiles) return;

    try {
      const items = readdirSync(currentDir, { withFileTypes: true });

      for (const item of items) {
        if (entries.length >= maxFiles) break;

        // Skip ignored
        if (matchesIgnorePattern(item.name, ignorePatterns)) continue;

        const fullPath = join(currentDir, item.name);
        const relativePath = relative(dir, fullPath);

        if (item.isDirectory()) {
          if (includeDirectories) {
            entries.push({
              path: fullPath,
              relativePath,
              name: item.name,
              isDirectory: true,
            });
          }
          scan(fullPath, depth + 1);
        } else {
          // Filter by extension if specified
          const ext = item.name.includes('.') ? item.name.split('.').pop() : undefined;
          if (extensions && ext && !extensions.includes(ext)) continue;

          try {
            const stats = statSync(fullPath);
            entries.push({
              path: fullPath,
              relativePath,
              name: item.name,
              isDirectory: false,
              extension: ext,
              size: stats.size,
              modifiedTime: stats.mtimeMs,
            });
          } catch {
            // Skip files we can't stat
          }
        }
      }
    } catch {
      // Skip directories we can't read
    }
  }

  scan(dir, 0);
  return entries;
}

/**
 * Fuzzy match with scoring
 */
function fuzzyMatch(query: string, target: string): { score: number; indices: number[] } {
  const q = query.toLowerCase();
  const t = target.toLowerCase();
  const indices: number[] = [];

  let qi = 0;
  let score = 0;
  let consecutive = 0;
  let lastIndex = -1;

  for (let ti = 0; ti < t.length && qi < q.length; ti++) {
    if (t[ti] === q[qi]) {
      indices.push(ti);

      // Consecutive bonus
      if (lastIndex === ti - 1) {
        consecutive++;
        score += consecutive * 3;
      } else {
        consecutive = 1;
        score += 1;
      }

      // Word boundary bonus
      if (ti === 0 || t[ti - 1] === '/' || t[ti - 1] === '\\' || t[ti - 1] === '_' || t[ti - 1] === '-' || t[ti - 1] === '.') {
        score += 5;
      }

      // Filename match bonus (last segment)
      const lastSep = Math.max(t.lastIndexOf('/'), t.lastIndexOf('\\'));
      if (ti > lastSep) {
        score += 2;
      }

      lastIndex = ti;
      qi++;
    }
  }

  if (qi !== q.length) {
    return { score: 0, indices: [] };
  }

  // Length bonus (shorter paths score higher)
  score += Math.max(0, 30 - t.length);

  return { score, indices };
}

/**
 * Search files with fuzzy matching
 */
export function searchFiles(
  query: string,
  entries: FileEntry[],
  limit: number = 20
): FileSearchResult[] {
  if (!query.trim()) {
    // Return recent files
    return entries
      .sort((a, b) => (b.modifiedTime || 0) - (a.modifiedTime || 0))
      .slice(0, limit)
      .map(entry => ({ entry, score: 0, matchIndices: [] }));
  }

  const results: FileSearchResult[] = [];

  for (const entry of entries) {
    const { score, indices } = fuzzyMatch(query, entry.relativePath);
    if (score > 0) {
      results.push({ entry, score, matchIndices: indices });
    }
  }

  // Sort by score
  results.sort((a, b) => b.score - a.score);

  return results.slice(0, limit);
}

/**
 * Format file size
 */
export function formatFileSize(bytes?: number): string {
  if (bytes === undefined) return '';
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)}MB`;
  return `${(bytes / 1024 / 1024 / 1024).toFixed(1)}GB`;
}

/**
 * Get file icon based on extension
 */
export function getFileIcon(entry: FileEntry): string {
  if (entry.isDirectory) return '📁';

  const iconMap: Record<string, string> = {
    ts: '📘',
    tsx: '⚛️',
    js: '📒',
    jsx: '⚛️',
    py: '🐍',
    rs: '🦀',
    go: '🐹',
    rb: '💎',
    java: '☕',
    c: '©️',
    cpp: '➕',
    h: '📋',
    hpp: '📋',
    css: '🎨',
    scss: '🎨',
    html: '🌐',
    json: '📋',
    yaml: '📋',
    yml: '📋',
    md: '📝',
    txt: '📄',
    sh: '🖥️',
    bash: '🖥️',
    zsh: '🖥️',
    sql: '🗃️',
    svg: '🖼️',
    png: '🖼️',
    jpg: '🖼️',
    jpeg: '🖼️',
    gif: '🖼️',
    pdf: '📕',
    zip: '📦',
    tar: '📦',
    gz: '📦',
  };

  return iconMap[entry.extension || ''] || '📄';
}

/**
 * Cached file index
 */
let cachedIndex: FileEntry[] | null = null;
let cachedDir: string | null = null;
let cacheTime: number = 0;
const CACHE_TTL = 60000; // 1 minute

/**
 * Get or create file index
 */
export function getFileIndex(
  dir: string = process.cwd(),
  forceRefresh: boolean = false
): FileEntry[] {
  const now = Date.now();

  if (!forceRefresh && cachedIndex && cachedDir === dir && now - cacheTime < CACHE_TTL) {
    return cachedIndex;
  }

  cachedIndex = scanDirectory(dir);
  cachedDir = dir;
  cacheTime = now;

  return cachedIndex;
}

/**
 * Quick search (uses cache)
 */
export function quickSearch(query: string, limit: number = 20): FileSearchResult[] {
  const index = getFileIndex();
  return searchFiles(query, index, limit);
}

/**
 * Format result for display with highlights
 */
export function formatWithHighlights(
  text: string,
  indices: number[],
  highlightStart: string = '\x1b[33m',
  highlightEnd: string = '\x1b[0m'
): string {
  if (indices.length === 0) return text;

  let result = '';
  let lastIndex = 0;

  for (const index of indices) {
    result += text.slice(lastIndex, index);
    result += highlightStart + text[index] + highlightEnd;
    lastIndex = index + 1;
  }

  result += text.slice(lastIndex);
  return result;
}
