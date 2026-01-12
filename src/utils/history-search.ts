// Updated: 2026-01-12 03:50:00
// Eames Design Agent - History Search
// Claude Code-like Ctrl+R history search

import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

const EAMES_DIR = join(homedir(), '.eames');
const HISTORY_FILE = join(EAMES_DIR, 'query-history.json');
const MAX_HISTORY = 1000;

/**
 * History entry
 */
export interface HistoryEntry {
  query: string;
  timestamp: number;
  cwd: string;
  model?: string;
}

/**
 * Search result
 */
export interface SearchResult {
  entry: HistoryEntry;
  score: number;
  matchIndices: number[];
}

/**
 * Ensure directory exists
 */
function ensureDir(): void {
  if (!existsSync(EAMES_DIR)) {
    mkdirSync(EAMES_DIR, { recursive: true });
  }
}

/**
 * Load history
 */
export function loadHistory(): HistoryEntry[] {
  ensureDir();
  try {
    if (existsSync(HISTORY_FILE)) {
      const data = readFileSync(HISTORY_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch {
    // Ignore
  }
  return [];
}

/**
 * Save history
 */
export function saveHistory(history: HistoryEntry[]): void {
  ensureDir();
  writeFileSync(HISTORY_FILE, JSON.stringify(history, null, 2));
}

/**
 * Add query to history
 */
export function addToHistory(
  query: string,
  cwd: string = process.cwd(),
  model?: string
): void {
  // Skip empty or very short queries
  if (!query.trim() || query.length < 3) return;

  // Skip slash commands
  if (query.startsWith('/')) return;

  const history = loadHistory();

  // Remove duplicate if exists
  const existingIndex = history.findIndex(h => h.query === query);
  if (existingIndex !== -1) {
    history.splice(existingIndex, 1);
  }

  // Add new entry at beginning
  history.unshift({
    query,
    timestamp: Date.now(),
    cwd,
    model,
  });

  // Trim if too large
  if (history.length > MAX_HISTORY) {
    history.length = MAX_HISTORY;
  }

  saveHistory(history);
}

/**
 * Search history with fuzzy matching
 */
export function searchHistory(
  query: string,
  options?: {
    cwd?: string;
    model?: string;
    limit?: number;
  }
): SearchResult[] {
  const history = loadHistory();
  const results: SearchResult[] = [];
  const q = query.toLowerCase();

  for (const entry of history) {
    // Filter by cwd if specified
    if (options?.cwd && entry.cwd !== options.cwd) continue;

    // Filter by model if specified
    if (options?.model && entry.model !== options.model) continue;

    // Calculate match score
    const target = entry.query.toLowerCase();
    const { score, matchIndices } = fuzzyMatch(q, target);

    if (score > 0) {
      results.push({ entry, score, matchIndices });
    }
  }

  // Sort by score (descending), then by timestamp (newest first)
  results.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return b.entry.timestamp - a.entry.timestamp;
  });

  // Apply limit
  const limit = options?.limit || 20;
  return results.slice(0, limit);
}

/**
 * Fuzzy match with indices
 */
function fuzzyMatch(query: string, target: string): { score: number; matchIndices: number[] } {
  if (!query) return { score: 100, matchIndices: [] };

  const matchIndices: number[] = [];
  let qi = 0;
  let score = 0;
  let consecutive = 0;
  let lastMatchIndex = -1;

  for (let ti = 0; ti < target.length && qi < query.length; ti++) {
    if (target[ti] === query[qi]) {
      matchIndices.push(ti);

      // Bonus for consecutive matches
      if (lastMatchIndex === ti - 1) {
        consecutive++;
        score += consecutive * 3;
      } else {
        consecutive = 1;
        score += 1;
      }

      // Bonus for word boundary matches
      if (ti === 0 || /\s/.test(target[ti - 1])) {
        score += 5;
      }

      lastMatchIndex = ti;
      qi++;
    }
  }

  // All query chars must match
  if (qi !== query.length) {
    return { score: 0, matchIndices: [] };
  }

  // Bonus for shorter targets (more precise matches)
  score += Math.max(0, 20 - (target.length - query.length));

  // Bonus for matches starting at beginning
  if (matchIndices[0] === 0) {
    score += 10;
  }

  return { score, matchIndices };
}

/**
 * Get recent queries (no search)
 */
export function getRecentQueries(
  limit: number = 10,
  cwd?: string
): HistoryEntry[] {
  const history = loadHistory();
  let filtered = history;

  if (cwd) {
    filtered = history.filter(h => h.cwd === cwd);
  }

  return filtered.slice(0, limit);
}

/**
 * Clear history
 */
export function clearHistory(): void {
  saveHistory([]);
}

/**
 * Delete specific entry
 */
export function deleteHistoryEntry(query: string): boolean {
  const history = loadHistory();
  const index = history.findIndex(h => h.query === query);
  if (index !== -1) {
    history.splice(index, 1);
    saveHistory(history);
    return true;
  }
  return false;
}

/**
 * Get history stats
 */
export function getHistoryStats(): {
  total: number;
  uniqueCwds: number;
  oldestTimestamp: number;
  newestTimestamp: number;
} {
  const history = loadHistory();
  const cwds = new Set(history.map(h => h.cwd));

  return {
    total: history.length,
    uniqueCwds: cwds.size,
    oldestTimestamp: history.length > 0 ? history[history.length - 1].timestamp : 0,
    newestTimestamp: history.length > 0 ? history[0].timestamp : 0,
  };
}

/**
 * Format entry for display with highlighted matches
 */
export function formatWithHighlights(
  query: string,
  matchIndices: number[],
  highlightStart: string = '\x1b[33m', // Yellow
  highlightEnd: string = '\x1b[0m' // Reset
): string {
  if (matchIndices.length === 0) return query;

  let result = '';
  let lastIndex = 0;

  for (const index of matchIndices) {
    result += query.slice(lastIndex, index);
    result += highlightStart + query[index] + highlightEnd;
    lastIndex = index + 1;
  }

  result += query.slice(lastIndex);
  return result;
}

/**
 * History navigation state
 */
export interface HistoryNavigationState {
  isActive: boolean;
  searchQuery: string;
  results: SearchResult[];
  selectedIndex: number;
  originalInput: string;
}

/**
 * Create navigation state
 */
export function createNavigationState(originalInput: string = ''): HistoryNavigationState {
  return {
    isActive: false,
    searchQuery: '',
    results: [],
    selectedIndex: 0,
    originalInput,
  };
}

/**
 * Update search in navigation
 */
export function updateNavigationSearch(
  state: HistoryNavigationState,
  query: string,
  cwd?: string
): HistoryNavigationState {
  const results = query ? searchHistory(query, { cwd, limit: 20 }) : [];
  return {
    ...state,
    searchQuery: query,
    results,
    selectedIndex: 0,
  };
}

/**
 * Navigate up/down in results
 */
export function navigateHistory(
  state: HistoryNavigationState,
  direction: 'up' | 'down'
): HistoryNavigationState {
  if (state.results.length === 0) return state;

  let newIndex = state.selectedIndex;
  if (direction === 'up') {
    newIndex = Math.max(0, state.selectedIndex - 1);
  } else {
    newIndex = Math.min(state.results.length - 1, state.selectedIndex + 1);
  }

  return {
    ...state,
    selectedIndex: newIndex,
  };
}

/**
 * Get selected entry
 */
export function getSelectedEntry(state: HistoryNavigationState): HistoryEntry | null {
  if (state.results.length === 0) return null;
  return state.results[state.selectedIndex]?.entry || null;
}
