// Updated: 2026-01-12 03:45:00
// Eames Design Agent - Command Palette
// Claude Code-like fuzzy command search (Ctrl+P)

/**
 * Command definition
 */
export interface Command {
  id: string;
  label: string;
  description: string;
  category: 'general' | 'navigation' | 'edit' | 'git' | 'view' | 'settings' | 'thinking';
  shortcut?: string;
  action: string; // Command to execute
  keywords?: string[]; // Additional search terms
}

/**
 * All available commands
 */
export const COMMANDS: Command[] = [
  // General
  { id: 'help', label: 'Help', description: 'Show help and available commands', category: 'general', shortcut: '/help', action: '/help', keywords: ['guide', 'docs'] },
  { id: 'clear', label: 'Clear Conversation', description: 'Clear all conversation history', category: 'general', shortcut: '/clear', action: '/clear', keywords: ['reset', 'new'] },
  { id: 'exit', label: 'Exit', description: 'Exit Eames', category: 'general', action: 'exit', keywords: ['quit', 'close'] },

  // Navigation
  { id: 'model', label: 'Change Model', description: 'Switch AI model or provider', category: 'navigation', shortcut: '/model', action: '/model', keywords: ['switch', 'provider'] },
  { id: 'files', label: 'Find Files', description: 'Search for files in project', category: 'navigation', shortcut: '/files', action: '/files', keywords: ['search', 'open'] },
  { id: 'goto', label: 'Go to File', description: 'Open a specific file', category: 'navigation', action: '/goto', keywords: ['open', 'navigate'] },

  // Edit
  { id: 'undo', label: 'Undo', description: 'Undo last file change', category: 'edit', shortcut: '/undo', action: '/undo', keywords: ['revert', 'rollback'] },
  { id: 'redo', label: 'Redo', description: 'Redo last undone change', category: 'edit', shortcut: '/redo', action: '/redo' },
  { id: 'checkpoint', label: 'Create Checkpoint', description: 'Save current state for rollback', category: 'edit', shortcut: '/checkpoint', action: '/checkpoint', keywords: ['save', 'snapshot'] },
  { id: 'restore', label: 'Restore Checkpoint', description: 'Restore a saved checkpoint', category: 'edit', action: '/restore', keywords: ['rollback'] },

  // Git
  { id: 'git-status', label: 'Git Status', description: 'Show git repository status', category: 'git', action: '/git status', keywords: ['changes', 'modified'] },
  { id: 'git-diff', label: 'Git Diff', description: 'Show uncommitted changes', category: 'git', action: '/git diff', keywords: ['changes'] },
  { id: 'git-log', label: 'Git Log', description: 'Show commit history', category: 'git', action: '/git log', keywords: ['history', 'commits'] },
  { id: 'git-branch', label: 'Git Branch', description: 'Show or switch branches', category: 'git', action: '/git branch', keywords: ['checkout'] },
  { id: 'git-commit', label: 'Git Commit', description: 'Commit staged changes', category: 'git', action: '/git commit', keywords: ['save'] },

  // View
  { id: 'compact', label: 'Compact Context', description: 'Summarize older messages to save context', category: 'view', shortcut: '/compact', action: '/compact', keywords: ['compress', 'summarize'] },
  { id: 'status', label: 'Session Status', description: 'Show session statistics', category: 'view', shortcut: '/status', action: '/status', keywords: ['info', 'stats'] },
  { id: 'export', label: 'Export Session', description: 'Export conversation to file', category: 'view', shortcut: '/export', action: '/export', keywords: ['save', 'download'] },

  // Settings
  { id: 'init', label: 'Initialize Project', description: 'Create EAMES.md template', category: 'settings', shortcut: '/init', action: '/init', keywords: ['setup', 'config'] },
  { id: 'theme', label: 'Change Theme', description: 'Switch between light and dark themes', category: 'settings', shortcut: '/theme', action: '/theme', keywords: ['color', 'dark', 'light'] },

  // Thinking
  { id: 'think', label: 'Enable Thinking', description: 'Enable basic thinking mode (4K tokens)', category: 'thinking', shortcut: '/think', action: '/think', keywords: ['reasoning'] },
  { id: 'think-hard', label: 'Deep Thinking', description: 'Enable deep thinking mode (10K tokens)', category: 'thinking', shortcut: '/think-hard', action: '/think-hard', keywords: ['reasoning', 'analyze'] },
  { id: 'ultrathink', label: 'Ultra Thinking', description: 'Enable ultra thinking mode (32K tokens)', category: 'thinking', shortcut: '/ultrathink', action: '/ultrathink', keywords: ['reasoning', 'complex'] },
];

/**
 * Fuzzy match score
 */
function fuzzyScore(query: string, target: string): number {
  const q = query.toLowerCase();
  const t = target.toLowerCase();

  // Exact match
  if (t === q) return 100;

  // Starts with
  if (t.startsWith(q)) return 80 + (q.length / t.length) * 20;

  // Contains
  if (t.includes(q)) return 60 + (q.length / t.length) * 20;

  // Fuzzy match (all chars in order)
  let qi = 0;
  let score = 0;
  let consecutive = 0;

  for (let ti = 0; ti < t.length && qi < q.length; ti++) {
    if (t[ti] === q[qi]) {
      qi++;
      consecutive++;
      score += consecutive * 2;
    } else {
      consecutive = 0;
    }
  }

  if (qi === q.length) {
    return 40 + (score / (q.length * 2)) * 20;
  }

  return 0;
}

/**
 * Search commands
 */
export function searchCommands(query: string): Command[] {
  if (!query.trim()) {
    return COMMANDS;
  }

  const results: Array<{ command: Command; score: number }> = [];

  for (const cmd of COMMANDS) {
    // Score label
    let maxScore = fuzzyScore(query, cmd.label);

    // Score description
    maxScore = Math.max(maxScore, fuzzyScore(query, cmd.description) * 0.8);

    // Score ID
    maxScore = Math.max(maxScore, fuzzyScore(query, cmd.id) * 0.9);

    // Score keywords
    if (cmd.keywords) {
      for (const kw of cmd.keywords) {
        maxScore = Math.max(maxScore, fuzzyScore(query, kw) * 0.7);
      }
    }

    // Score category
    maxScore = Math.max(maxScore, fuzzyScore(query, cmd.category) * 0.5);

    if (maxScore > 0) {
      results.push({ command: cmd, score: maxScore });
    }
  }

  // Sort by score
  return results
    .sort((a, b) => b.score - a.score)
    .map(r => r.command);
}

/**
 * Get commands by category
 */
export function getCommandsByCategory(category: Command['category']): Command[] {
  return COMMANDS.filter(cmd => cmd.category === category);
}

/**
 * Get category display info
 */
export function getCategoryInfo(category: Command['category']): { label: string; icon: string; color: string } {
  const info: Record<Command['category'], { label: string; icon: string; color: string }> = {
    general: { label: 'General', icon: '⚡', color: '#61afef' },
    navigation: { label: 'Navigation', icon: '📁', color: '#98c379' },
    edit: { label: 'Edit', icon: '✏️', color: '#e5c07b' },
    git: { label: 'Git', icon: '📦', color: '#c678dd' },
    view: { label: 'View', icon: '👁️', color: '#56b6c2' },
    settings: { label: 'Settings', icon: '⚙️', color: '#abb2bf' },
    thinking: { label: 'Thinking', icon: '🧠', color: '#e06c75' },
  };
  return info[category];
}

/**
 * Format command for display
 */
export function formatCommand(cmd: Command, query?: string): {
  label: string;
  description: string;
  shortcut?: string;
  category: { label: string; icon: string; color: string };
} {
  return {
    label: cmd.label,
    description: cmd.description,
    shortcut: cmd.shortcut,
    category: getCategoryInfo(cmd.category),
  };
}

/**
 * Get recent commands (would be persisted)
 */
let recentCommands: string[] = [];

export function getRecentCommands(): Command[] {
  return recentCommands
    .map(id => COMMANDS.find(c => c.id === id))
    .filter((c): c is Command => c !== undefined);
}

export function addRecentCommand(id: string): void {
  recentCommands = [id, ...recentCommands.filter(c => c !== id)].slice(0, 10);
}
