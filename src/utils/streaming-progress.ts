// Updated: 2026-01-12 04:15:00
// Eames Design Agent - Streaming Progress
// Visual progress indicators for tool execution

/**
 * Progress state for a tool execution
 */
export interface ToolProgress {
  toolName: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  startTime: number;
  endTime?: number;
  progress?: number; // 0-100
  message?: string;
  details?: string[];
  bytesProcessed?: number;
  totalBytes?: number;
  itemsProcessed?: number;
  totalItems?: number;
}

/**
 * Progress tracker for multiple tools
 */
export interface ProgressTracker {
  tools: Map<string, ToolProgress>;
  onUpdate?: (progress: ToolProgress) => void;
}

/**
 * Create a new progress tracker
 */
export function createProgressTracker(
  onUpdate?: (progress: ToolProgress) => void
): ProgressTracker {
  return {
    tools: new Map(),
    onUpdate,
  };
}

/**
 * Start tracking a tool
 */
export function startToolProgress(
  tracker: ProgressTracker,
  toolId: string,
  toolName: string
): ToolProgress {
  const progress: ToolProgress = {
    toolName,
    status: 'running',
    startTime: Date.now(),
  };

  tracker.tools.set(toolId, progress);
  tracker.onUpdate?.(progress);

  return progress;
}

/**
 * Update tool progress
 */
export function updateToolProgress(
  tracker: ProgressTracker,
  toolId: string,
  updates: Partial<Omit<ToolProgress, 'toolName' | 'startTime'>>
): ToolProgress | null {
  const progress = tracker.tools.get(toolId);
  if (!progress) return null;

  Object.assign(progress, updates);
  tracker.onUpdate?.(progress);

  return progress;
}

/**
 * Complete tool progress
 */
export function completeToolProgress(
  tracker: ProgressTracker,
  toolId: string,
  success: boolean = true,
  message?: string
): ToolProgress | null {
  const progress = tracker.tools.get(toolId);
  if (!progress) return null;

  progress.status = success ? 'completed' : 'failed';
  progress.endTime = Date.now();
  progress.progress = 100;
  if (message) progress.message = message;

  tracker.onUpdate?.(progress);

  return progress;
}

/**
 * Get elapsed time
 */
export function getElapsedTime(progress: ToolProgress): number {
  const end = progress.endTime || Date.now();
  return end - progress.startTime;
}

/**
 * Format elapsed time
 */
export function formatElapsedTime(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  const mins = Math.floor(ms / 60000);
  const secs = Math.floor((ms % 60000) / 1000);
  return `${mins}m ${secs}s`;
}

/**
 * Progress bar characters
 */
const PROGRESS_CHARS = {
  filled: '█',
  partial: ['▏', '▎', '▍', '▌', '▋', '▊', '▉'],
  empty: '░',
};

/**
 * Render progress bar
 */
export function renderProgressBar(
  progress: number,
  width: number = 20,
  showPercent: boolean = true
): string {
  const percent = Math.min(100, Math.max(0, progress));
  const filled = (percent / 100) * width;
  const fullBlocks = Math.floor(filled);
  const remainder = filled - fullBlocks;

  let bar = PROGRESS_CHARS.filled.repeat(fullBlocks);

  if (remainder > 0 && fullBlocks < width) {
    const partialIndex = Math.floor(remainder * PROGRESS_CHARS.partial.length);
    bar += PROGRESS_CHARS.partial[Math.min(partialIndex, PROGRESS_CHARS.partial.length - 1)];
  }

  const emptyBlocks = width - Math.ceil(filled);
  bar += PROGRESS_CHARS.empty.repeat(Math.max(0, emptyBlocks));

  if (showPercent) {
    return `[${bar}] ${percent.toFixed(0)}%`;
  }

  return `[${bar}]`;
}

/**
 * Spinner frames
 */
const SPINNER_FRAMES = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];

/**
 * Get spinner frame based on time
 */
export function getSpinnerFrame(startTime: number): string {
  const elapsed = Date.now() - startTime;
  const frameIndex = Math.floor(elapsed / 80) % SPINNER_FRAMES.length;
  return SPINNER_FRAMES[frameIndex];
}

/**
 * Tool-specific progress formatters
 */
export const TOOL_FORMATTERS: Record<string, (progress: ToolProgress) => string> = {
  read: (p) => {
    if (p.bytesProcessed !== undefined && p.totalBytes !== undefined) {
      const percent = (p.bytesProcessed / p.totalBytes) * 100;
      return `Reading: ${renderProgressBar(percent, 15)} ${formatBytes(p.bytesProcessed)}/${formatBytes(p.totalBytes)}`;
    }
    return `Reading file...`;
  },

  write: (p) => {
    if (p.bytesProcessed !== undefined) {
      return `Writing: ${formatBytes(p.bytesProcessed)}`;
    }
    return `Writing file...`;
  },

  edit: (p) => {
    return p.message || `Editing file...`;
  },

  bash: (p) => {
    const elapsed = formatElapsedTime(getElapsedTime(p));
    return `Running command... (${elapsed})`;
  },

  glob: (p) => {
    if (p.itemsProcessed !== undefined) {
      return `Found ${p.itemsProcessed} files...`;
    }
    return `Searching files...`;
  },

  grep: (p) => {
    if (p.itemsProcessed !== undefined) {
      return `Found ${p.itemsProcessed} matches...`;
    }
    return `Searching content...`;
  },

  task: (p) => {
    const elapsed = formatElapsedTime(getElapsedTime(p));
    return `Running agent task... (${elapsed})`;
  },
};

/**
 * Format progress for display
 */
export function formatToolProgress(progress: ToolProgress): string {
  const formatter = TOOL_FORMATTERS[progress.toolName.toLowerCase()];
  if (formatter) {
    return formatter(progress);
  }

  // Default format
  if (progress.progress !== undefined) {
    return `${progress.toolName}: ${renderProgressBar(progress.progress, 15)}`;
  }

  const elapsed = formatElapsedTime(getElapsedTime(progress));
  return `${progress.toolName}... (${elapsed})`;
}

/**
 * Format bytes
 */
function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)}MB`;
}

/**
 * Status icons
 */
export const STATUS_ICONS: Record<ToolProgress['status'], string> = {
  pending: '○',
  running: '●',
  completed: '✓',
  failed: '✗',
};

/**
 * Status colors (ANSI)
 */
export const STATUS_COLORS: Record<ToolProgress['status'], string> = {
  pending: '\x1b[90m', // Gray
  running: '\x1b[33m', // Yellow
  completed: '\x1b[32m', // Green
  failed: '\x1b[31m', // Red
};

/**
 * Render complete progress line
 */
export function renderProgressLine(progress: ToolProgress): string {
  const icon = STATUS_ICONS[progress.status];
  const color = STATUS_COLORS[progress.status];
  const reset = '\x1b[0m';

  let line = `${color}${icon}${reset} `;

  if (progress.status === 'running') {
    const spinner = getSpinnerFrame(progress.startTime);
    line = `${color}${spinner}${reset} `;
  }

  line += formatToolProgress(progress);

  if (progress.status === 'completed' || progress.status === 'failed') {
    const elapsed = formatElapsedTime(getElapsedTime(progress));
    line += ` ${color}(${elapsed})${reset}`;
  }

  return line;
}

/**
 * Multi-tool progress display
 */
export function renderMultiProgress(tracker: ProgressTracker): string[] {
  const lines: string[] = [];

  for (const [, progress] of tracker.tools) {
    lines.push(renderProgressLine(progress));
  }

  return lines;
}

/**
 * Estimate remaining time
 */
export function estimateRemainingTime(progress: ToolProgress): number | null {
  if (progress.progress === undefined || progress.progress === 0) return null;

  const elapsed = getElapsedTime(progress);
  const rate = progress.progress / elapsed;
  const remaining = (100 - progress.progress) / rate;

  return Math.max(0, remaining);
}

/**
 * Format ETA
 */
export function formatETA(progress: ToolProgress): string | null {
  const remaining = estimateRemainingTime(progress);
  if (remaining === null) return null;

  return `ETA: ${formatElapsedTime(remaining)}`;
}
