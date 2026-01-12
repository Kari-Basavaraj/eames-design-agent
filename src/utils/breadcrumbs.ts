// Updated: 2026-01-12 04:15:00
// Eames Design Agent - Breadcrumb Navigation
// Context breadcrumbs for navigation

import { basename, dirname, relative, sep } from 'path';

/**
 * Breadcrumb item
 */
export interface BreadcrumbItem {
  label: string;
  path?: string;
  type: 'root' | 'directory' | 'file' | 'context' | 'action';
  icon?: string;
  active?: boolean;
}

/**
 * Navigation context
 */
export interface NavigationContext {
  cwd: string;
  currentFile?: string;
  repoRoot?: string;
  branch?: string;
  action?: string;
}

/**
 * Generate breadcrumbs from path
 */
export function pathToBreadcrumbs(
  filePath: string,
  cwd: string = process.cwd(),
  maxItems: number = 5
): BreadcrumbItem[] {
  const relativePath = relative(cwd, filePath);
  const parts = relativePath.split(sep).filter(Boolean);
  const breadcrumbs: BreadcrumbItem[] = [];

  // Add root
  breadcrumbs.push({
    label: basename(cwd),
    path: cwd,
    type: 'root',
    icon: '📁',
  });

  // Add intermediate directories
  let currentPath = cwd;
  for (let i = 0; i < parts.length - 1; i++) {
    currentPath = `${currentPath}${sep}${parts[i]}`;
    breadcrumbs.push({
      label: parts[i],
      path: currentPath,
      type: 'directory',
      icon: '📂',
    });
  }

  // Add file if exists
  if (parts.length > 0) {
    const fileName = parts[parts.length - 1];
    breadcrumbs.push({
      label: fileName,
      path: filePath,
      type: 'file',
      icon: getFileIcon(fileName),
      active: true,
    });
  }

  // Collapse if too many items
  if (breadcrumbs.length > maxItems) {
    const keep = Math.floor(maxItems / 2);
    const collapsed = [
      ...breadcrumbs.slice(0, keep),
      { label: '...', type: 'directory' as const, icon: '•' },
      ...breadcrumbs.slice(-keep),
    ];
    return collapsed;
  }

  return breadcrumbs;
}

/**
 * Generate context breadcrumbs
 */
export function contextBreadcrumbs(context: NavigationContext): BreadcrumbItem[] {
  const breadcrumbs: BreadcrumbItem[] = [];

  // Project root
  if (context.repoRoot) {
    breadcrumbs.push({
      label: basename(context.repoRoot),
      path: context.repoRoot,
      type: 'root',
      icon: '🏠',
    });
  } else {
    breadcrumbs.push({
      label: basename(context.cwd),
      path: context.cwd,
      type: 'root',
      icon: '📁',
    });
  }

  // Git branch
  if (context.branch) {
    breadcrumbs.push({
      label: context.branch,
      type: 'context',
      icon: '🌿',
    });
  }

  // Current file
  if (context.currentFile) {
    const relativePath = relative(context.cwd, context.currentFile);
    breadcrumbs.push({
      label: relativePath,
      path: context.currentFile,
      type: 'file',
      icon: getFileIcon(context.currentFile),
      active: !context.action,
    });
  }

  // Current action
  if (context.action) {
    breadcrumbs.push({
      label: context.action,
      type: 'action',
      icon: '⚡',
      active: true,
    });
  }

  return breadcrumbs;
}

/**
 * Format breadcrumbs for display
 */
export function formatBreadcrumbs(
  breadcrumbs: BreadcrumbItem[],
  options?: {
    separator?: string;
    showIcons?: boolean;
    maxWidth?: number;
    highlightActive?: boolean;
  }
): string {
  const separator = options?.separator ?? ' › ';
  const showIcons = options?.showIcons ?? true;
  const maxWidth = options?.maxWidth;
  const highlightActive = options?.highlightActive ?? true;

  let result = breadcrumbs
    .map((item) => {
      let text = showIcons && item.icon ? `${item.icon} ${item.label}` : item.label;

      if (highlightActive && item.active) {
        text = `\x1b[1m${text}\x1b[0m`; // Bold
      }

      return text;
    })
    .join(separator);

  // Truncate if too long
  if (maxWidth && result.length > maxWidth) {
    result = truncateMiddle(result, maxWidth);
  }

  return result;
}

/**
 * Format breadcrumbs with colors
 */
export function formatBreadcrumbsColored(
  breadcrumbs: BreadcrumbItem[],
  options?: {
    separator?: string;
    showIcons?: boolean;
    maxWidth?: number;
  }
): string {
  const separator = options?.separator ?? ' › ';
  const showIcons = options?.showIcons ?? true;

  const colors: Record<BreadcrumbItem['type'], string> = {
    root: '\x1b[36m', // Cyan
    directory: '\x1b[34m', // Blue
    file: '\x1b[33m', // Yellow
    context: '\x1b[35m', // Magenta
    action: '\x1b[32m', // Green
  };

  const reset = '\x1b[0m';
  const dim = '\x1b[90m';

  const parts = breadcrumbs.map((item) => {
    const color = colors[item.type];
    let text = showIcons && item.icon ? `${item.icon} ${item.label}` : item.label;

    if (item.active) {
      text = `\x1b[1m${color}${text}${reset}`; // Bold + Color
    } else {
      text = `${color}${text}${reset}`;
    }

    return text;
  });

  return parts.join(`${dim}${separator}${reset}`);
}

/**
 * Breadcrumb navigation state
 */
export interface BreadcrumbState {
  history: NavigationContext[];
  currentIndex: number;
  maxHistory: number;
}

/**
 * Create navigation state
 */
export function createBreadcrumbState(maxHistory: number = 50): BreadcrumbState {
  return {
    history: [],
    currentIndex: -1,
    maxHistory,
  };
}

/**
 * Push navigation context
 */
export function pushContext(
  state: BreadcrumbState,
  context: NavigationContext
): BreadcrumbState {
  // Remove forward history if navigating from middle
  const newHistory = state.history.slice(0, state.currentIndex + 1);

  // Add new context
  newHistory.push(context);

  // Trim if too large
  if (newHistory.length > state.maxHistory) {
    newHistory.shift();
  }

  return {
    ...state,
    history: newHistory,
    currentIndex: newHistory.length - 1,
  };
}

/**
 * Go back in history
 */
export function goBack(state: BreadcrumbState): { state: BreadcrumbState; context: NavigationContext | null } {
  if (state.currentIndex <= 0) {
    return { state, context: null };
  }

  const newIndex = state.currentIndex - 1;
  return {
    state: { ...state, currentIndex: newIndex },
    context: state.history[newIndex],
  };
}

/**
 * Go forward in history
 */
export function goForward(state: BreadcrumbState): { state: BreadcrumbState; context: NavigationContext | null } {
  if (state.currentIndex >= state.history.length - 1) {
    return { state, context: null };
  }

  const newIndex = state.currentIndex + 1;
  return {
    state: { ...state, currentIndex: newIndex },
    context: state.history[newIndex],
  };
}

/**
 * Get current context
 */
export function getCurrentContext(state: BreadcrumbState): NavigationContext | null {
  if (state.currentIndex < 0 || state.currentIndex >= state.history.length) {
    return null;
  }
  return state.history[state.currentIndex];
}

/**
 * Can go back?
 */
export function canGoBack(state: BreadcrumbState): boolean {
  return state.currentIndex > 0;
}

/**
 * Can go forward?
 */
export function canGoForward(state: BreadcrumbState): boolean {
  return state.currentIndex < state.history.length - 1;
}

// Helper functions

function getFileIcon(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase();

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
    md: '📝',
    json: '📋',
    yaml: '📋',
    yml: '📋',
    css: '🎨',
    html: '🌐',
    sql: '🗃️',
    sh: '🖥️',
  };

  return iconMap[ext || ''] || '📄';
}

function truncateMiddle(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;

  const ellipsis = '...';
  const charsToShow = maxLength - ellipsis.length;
  const frontChars = Math.ceil(charsToShow / 2);
  const backChars = Math.floor(charsToShow / 2);

  return str.slice(0, frontChars) + ellipsis + str.slice(-backChars);
}

/**
 * Build prompt breadcrumb string
 */
export function buildPromptBreadcrumb(context: NavigationContext): string {
  const parts: string[] = [];

  // Short project name
  const projectName = basename(context.repoRoot || context.cwd);
  parts.push(projectName);

  // Branch
  if (context.branch) {
    parts.push(`(${context.branch})`);
  }

  // File indicator
  if (context.currentFile) {
    const fileName = basename(context.currentFile);
    parts.push(`:${fileName}`);
  }

  return parts.join('');
}
