// Updated: 2026-01-12 03:20:00
// Eames Design Agent - Tab Completion
// Claude Code-like autocomplete for commands and paths

import { existsSync, readdirSync, statSync } from 'fs';
import { join, dirname, basename, sep } from 'path';
import { homedir } from 'os';

/**
 * Completion result
 */
export interface CompletionResult {
  completions: string[];
  commonPrefix: string;
  startIndex: number;
  type: 'command' | 'path' | 'option' | 'history';
}

/**
 * Available slash commands
 */
export const SLASH_COMMANDS = [
  '/help',
  '/model',
  '/clear',
  '/compact',
  '/init',
  '/status',
  '/think',
  '/think-hard',
  '/ultrathink',
  '/export',
  '/undo',
  '/redo',
  '/checkpoint',
  '/git',
  '/search',
  '/files',
  '/theme',
];

/**
 * Command flags
 */
export const COMMAND_FLAGS: Record<string, string[]> = {
  default: ['--think', '--think-hard', '--ultrathink', '--no-think', '--verbose', '--quiet'],
  '/git': ['--status', '--branch', '--log', '--diff', '--commit'],
  '/export': ['--markdown', '--json', '--html'],
  '/theme': ['--dark', '--light', '--auto'],
};

/**
 * Get completions for input
 */
export function getCompletions(
  input: string,
  cursorPosition: number,
  history: string[] = []
): CompletionResult | null {
  const beforeCursor = input.slice(0, cursorPosition);
  const words = beforeCursor.split(/\s+/);
  const currentWord = words[words.length - 1] || '';
  const startIndex = beforeCursor.lastIndexOf(currentWord);

  // Empty input - show recent history
  if (!currentWord && history.length > 0) {
    return {
      completions: history.slice(-5).reverse(),
      commonPrefix: '',
      startIndex: cursorPosition,
      type: 'history',
    };
  }

  // Slash commands
  if (currentWord.startsWith('/')) {
    const matches = SLASH_COMMANDS.filter(cmd =>
      cmd.toLowerCase().startsWith(currentWord.toLowerCase())
    );
    if (matches.length > 0) {
      return {
        completions: matches,
        commonPrefix: findCommonPrefix(matches),
        startIndex,
        type: 'command',
      };
    }
  }

  // Flags (starting with --)
  if (currentWord.startsWith('--')) {
    const command = words[0] || 'default';
    const flags = COMMAND_FLAGS[command] || COMMAND_FLAGS.default;
    const matches = flags.filter(flag =>
      flag.toLowerCase().startsWith(currentWord.toLowerCase())
    );
    if (matches.length > 0) {
      return {
        completions: matches,
        commonPrefix: findCommonPrefix(matches),
        startIndex,
        type: 'option',
      };
    }
  }

  // File paths (starting with ./ or / or ~/ or containing /)
  if (
    currentWord.startsWith('./') ||
    currentWord.startsWith('/') ||
    currentWord.startsWith('~/') ||
    currentWord.includes('/')
  ) {
    const pathCompletions = getPathCompletions(currentWord);
    if (pathCompletions.length > 0) {
      return {
        completions: pathCompletions,
        commonPrefix: findCommonPrefix(pathCompletions),
        startIndex,
        type: 'path',
      };
    }
  }

  // History search
  if (currentWord.length >= 2) {
    const historyMatches = history.filter(h =>
      h.toLowerCase().includes(currentWord.toLowerCase())
    ).slice(-5);
    if (historyMatches.length > 0) {
      return {
        completions: historyMatches,
        commonPrefix: currentWord,
        startIndex,
        type: 'history',
      };
    }
  }

  return null;
}

/**
 * Get file path completions
 */
export function getPathCompletions(partial: string): string[] {
  try {
    // Expand ~ to home directory
    let expandedPath = partial;
    if (partial.startsWith('~/')) {
      expandedPath = join(homedir(), partial.slice(2));
    }

    // Get directory and prefix
    const isDir = partial.endsWith('/');
    const dir = isDir ? expandedPath : dirname(expandedPath);
    const prefix = isDir ? '' : basename(expandedPath);

    // Check if directory exists
    if (!existsSync(dir)) {
      return [];
    }

    // Read directory
    const entries = readdirSync(dir, { withFileTypes: true });
    const completions: string[] = [];

    for (const entry of entries) {
      // Skip hidden files unless prefix starts with .
      if (entry.name.startsWith('.') && !prefix.startsWith('.')) {
        continue;
      }

      if (entry.name.toLowerCase().startsWith(prefix.toLowerCase())) {
        const fullPath = join(dir, entry.name);
        // Restore ~ prefix if applicable
        let displayPath = partial.startsWith('~/')
          ? fullPath.replace(homedir(), '~')
          : fullPath;

        // Add trailing slash for directories
        if (entry.isDirectory()) {
          displayPath += '/';
        }

        completions.push(displayPath);
      }
    }

    // Sort: directories first, then files
    return completions.sort((a, b) => {
      const aIsDir = a.endsWith('/');
      const bIsDir = b.endsWith('/');
      if (aIsDir && !bIsDir) return -1;
      if (!aIsDir && bIsDir) return 1;
      return a.localeCompare(b);
    });
  } catch {
    return [];
  }
}

/**
 * Find common prefix among strings
 */
export function findCommonPrefix(strings: string[]): string {
  if (strings.length === 0) return '';
  if (strings.length === 1) return strings[0];

  let prefix = strings[0];
  for (let i = 1; i < strings.length; i++) {
    while (!strings[i].toLowerCase().startsWith(prefix.toLowerCase())) {
      prefix = prefix.slice(0, -1);
      if (prefix.length === 0) return '';
    }
  }
  return prefix;
}

/**
 * Apply completion to input
 */
export function applyCompletion(
  input: string,
  cursorPosition: number,
  completion: string,
  startIndex: number
): { newInput: string; newCursor: number } {
  const before = input.slice(0, startIndex);
  const after = input.slice(cursorPosition);
  const newInput = before + completion + after;
  const newCursor = before.length + completion.length;

  return { newInput, newCursor };
}

/**
 * Cycle through completions
 */
export function cycleCompletion(
  completions: string[],
  currentIndex: number,
  direction: 'next' | 'prev'
): number {
  if (completions.length === 0) return -1;

  if (direction === 'next') {
    return (currentIndex + 1) % completions.length;
  } else {
    return currentIndex <= 0 ? completions.length - 1 : currentIndex - 1;
  }
}

/**
 * Format completions for display
 */
export function formatCompletions(
  completions: string[],
  selectedIndex: number,
  maxDisplay: number = 10
): string[] {
  const start = Math.max(0, selectedIndex - Math.floor(maxDisplay / 2));
  const end = Math.min(completions.length, start + maxDisplay);
  const visible = completions.slice(start, end);

  return visible.map((c, i) => {
    const actualIndex = start + i;
    const prefix = actualIndex === selectedIndex ? '❯ ' : '  ';
    return prefix + c;
  });
}
