// Updated: 2026-01-12 03:35:00
// Eames Design Agent - Undo/Checkpoint System
// Claude Code-like file change rollback

import { existsSync, readFileSync, writeFileSync, mkdirSync, readdirSync, unlinkSync, statSync } from 'fs';
import { join, dirname, basename } from 'path';
import { homedir } from 'os';
import { createHash } from 'crypto';

const EAMES_DIR = join(homedir(), '.eames');
const CHECKPOINTS_DIR = join(EAMES_DIR, 'checkpoints');
const UNDO_STACK_FILE = join(EAMES_DIR, 'undo-stack.json');

/**
 * File snapshot
 */
export interface FileSnapshot {
  path: string;
  content: string | null; // null means file didn't exist
  hash: string;
  timestamp: number;
}

/**
 * Checkpoint (group of file snapshots)
 */
export interface Checkpoint {
  id: string;
  name: string;
  description?: string;
  files: FileSnapshot[];
  timestamp: number;
  cwd: string;
}

/**
 * Undo entry
 */
export interface UndoEntry {
  id: string;
  type: 'edit' | 'create' | 'delete' | 'rename';
  path: string;
  oldPath?: string; // for rename
  before: FileSnapshot;
  after: FileSnapshot;
  timestamp: number;
  description: string;
}

/**
 * Undo stack
 */
interface UndoStack {
  entries: UndoEntry[];
  redoStack: UndoEntry[];
  maxSize: number;
}

// Initialize directories
function ensureDirs(): void {
  if (!existsSync(EAMES_DIR)) {
    mkdirSync(EAMES_DIR, { recursive: true });
  }
  if (!existsSync(CHECKPOINTS_DIR)) {
    mkdirSync(CHECKPOINTS_DIR, { recursive: true });
  }
}

/**
 * Generate content hash
 */
function hashContent(content: string | null): string {
  if (content === null) return 'null';
  return createHash('sha256').update(content).digest('hex').slice(0, 12);
}

/**
 * Generate unique ID
 */
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * Create file snapshot
 */
export function createFileSnapshot(path: string): FileSnapshot {
  let content: string | null = null;
  if (existsSync(path)) {
    try {
      content = readFileSync(path, 'utf-8');
    } catch {
      // Binary file or read error
      content = null;
    }
  }

  return {
    path,
    content,
    hash: hashContent(content),
    timestamp: Date.now(),
  };
}

/**
 * Restore file from snapshot
 */
export function restoreFileSnapshot(snapshot: FileSnapshot): boolean {
  try {
    if (snapshot.content === null) {
      // File should be deleted
      if (existsSync(snapshot.path)) {
        unlinkSync(snapshot.path);
      }
    } else {
      // Ensure directory exists
      const dir = dirname(snapshot.path);
      if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true });
      }
      writeFileSync(snapshot.path, snapshot.content);
    }
    return true;
  } catch {
    return false;
  }
}

// ============================================================================
// Undo System
// ============================================================================

/**
 * Load undo stack
 */
function loadUndoStack(): UndoStack {
  ensureDirs();
  try {
    if (existsSync(UNDO_STACK_FILE)) {
      const data = readFileSync(UNDO_STACK_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch {
    // Ignore
  }
  return { entries: [], redoStack: [], maxSize: 100 };
}

/**
 * Save undo stack
 */
function saveUndoStack(stack: UndoStack): void {
  ensureDirs();
  writeFileSync(UNDO_STACK_FILE, JSON.stringify(stack, null, 2));
}

/**
 * Record file change for undo
 */
export function recordFileChange(
  path: string,
  type: UndoEntry['type'],
  description: string,
  oldPath?: string
): void {
  const stack = loadUndoStack();

  // Create snapshots
  const before = oldPath ? createFileSnapshot(oldPath) : createFileSnapshot(path);
  const after = createFileSnapshot(path);

  // Don't record if no change
  if (before.hash === after.hash && type !== 'rename') {
    return;
  }

  const entry: UndoEntry = {
    id: generateId(),
    type,
    path,
    oldPath,
    before,
    after,
    timestamp: Date.now(),
    description,
  };

  // Add to stack
  stack.entries.push(entry);

  // Clear redo stack on new change
  stack.redoStack = [];

  // Trim if too large
  while (stack.entries.length > stack.maxSize) {
    stack.entries.shift();
  }

  saveUndoStack(stack);
}

/**
 * Record before state (call before making changes)
 */
export function recordBeforeChange(path: string): FileSnapshot {
  return createFileSnapshot(path);
}

/**
 * Record after state and add to undo stack
 */
export function recordAfterChange(
  path: string,
  before: FileSnapshot,
  type: UndoEntry['type'],
  description: string
): void {
  const stack = loadUndoStack();
  const after = createFileSnapshot(path);

  if (before.hash === after.hash && type !== 'rename') {
    return;
  }

  const entry: UndoEntry = {
    id: generateId(),
    type,
    path,
    before,
    after,
    timestamp: Date.now(),
    description,
  };

  stack.entries.push(entry);
  stack.redoStack = [];

  while (stack.entries.length > stack.maxSize) {
    stack.entries.shift();
  }

  saveUndoStack(stack);
}

/**
 * Undo last change
 */
export function undo(): { success: boolean; entry?: UndoEntry; message: string } {
  const stack = loadUndoStack();

  if (stack.entries.length === 0) {
    return { success: false, message: 'Nothing to undo' };
  }

  const entry = stack.entries.pop()!;

  // Restore before state
  const restored = restoreFileSnapshot(entry.before);
  if (!restored) {
    // Put it back on failure
    stack.entries.push(entry);
    saveUndoStack(stack);
    return { success: false, entry, message: `Failed to restore ${entry.path}` };
  }

  // Add to redo stack
  stack.redoStack.push(entry);
  saveUndoStack(stack);

  return {
    success: true,
    entry,
    message: `Undid: ${entry.description}`,
  };
}

/**
 * Redo last undone change
 */
export function redo(): { success: boolean; entry?: UndoEntry; message: string } {
  const stack = loadUndoStack();

  if (stack.redoStack.length === 0) {
    return { success: false, message: 'Nothing to redo' };
  }

  const entry = stack.redoStack.pop()!;

  // Restore after state
  const restored = restoreFileSnapshot(entry.after);
  if (!restored) {
    // Put it back on failure
    stack.redoStack.push(entry);
    saveUndoStack(stack);
    return { success: false, entry, message: `Failed to restore ${entry.path}` };
  }

  // Add back to undo stack
  stack.entries.push(entry);
  saveUndoStack(stack);

  return {
    success: true,
    entry,
    message: `Redid: ${entry.description}`,
  };
}

/**
 * Get undo history
 */
export function getUndoHistory(): UndoEntry[] {
  const stack = loadUndoStack();
  return [...stack.entries].reverse();
}

/**
 * Get redo history
 */
export function getRedoHistory(): UndoEntry[] {
  const stack = loadUndoStack();
  return [...stack.redoStack].reverse();
}

/**
 * Clear undo history
 */
export function clearUndoHistory(): void {
  saveUndoStack({ entries: [], redoStack: [], maxSize: 100 });
}

// ============================================================================
// Checkpoint System
// ============================================================================

/**
 * Create checkpoint for multiple files
 */
export function createCheckpoint(
  name: string,
  files: string[],
  description?: string
): Checkpoint {
  ensureDirs();

  const checkpoint: Checkpoint = {
    id: generateId(),
    name,
    description,
    files: files.map(createFileSnapshot),
    timestamp: Date.now(),
    cwd: process.cwd(),
  };

  const checkpointFile = join(CHECKPOINTS_DIR, `${checkpoint.id}.json`);
  writeFileSync(checkpointFile, JSON.stringify(checkpoint, null, 2));

  return checkpoint;
}

/**
 * Create checkpoint for all changed files in directory
 */
export function createCheckpointForChanges(
  name: string,
  changedFiles: string[],
  description?: string
): Checkpoint {
  return createCheckpoint(name, changedFiles, description);
}

/**
 * Restore checkpoint
 */
export function restoreCheckpoint(checkpointId: string): {
  success: boolean;
  restored: string[];
  failed: string[];
  message: string;
} {
  const checkpointFile = join(CHECKPOINTS_DIR, `${checkpointId}.json`);

  if (!existsSync(checkpointFile)) {
    return {
      success: false,
      restored: [],
      failed: [],
      message: `Checkpoint ${checkpointId} not found`,
    };
  }

  const checkpoint: Checkpoint = JSON.parse(readFileSync(checkpointFile, 'utf-8'));
  const restored: string[] = [];
  const failed: string[] = [];

  for (const snapshot of checkpoint.files) {
    if (restoreFileSnapshot(snapshot)) {
      restored.push(snapshot.path);
    } else {
      failed.push(snapshot.path);
    }
  }

  return {
    success: failed.length === 0,
    restored,
    failed,
    message: failed.length === 0
      ? `Restored checkpoint: ${checkpoint.name}`
      : `Partially restored checkpoint: ${restored.length} succeeded, ${failed.length} failed`,
  };
}

/**
 * List all checkpoints
 */
export function listCheckpoints(): Checkpoint[] {
  ensureDirs();
  const checkpoints: Checkpoint[] = [];

  try {
    const files = readdirSync(CHECKPOINTS_DIR);
    for (const file of files) {
      if (file.endsWith('.json')) {
        const data = readFileSync(join(CHECKPOINTS_DIR, file), 'utf-8');
        checkpoints.push(JSON.parse(data));
      }
    }
  } catch {
    // Ignore
  }

  return checkpoints.sort((a, b) => b.timestamp - a.timestamp);
}

/**
 * Delete checkpoint
 */
export function deleteCheckpoint(checkpointId: string): boolean {
  const checkpointFile = join(CHECKPOINTS_DIR, `${checkpointId}.json`);
  if (existsSync(checkpointFile)) {
    unlinkSync(checkpointFile);
    return true;
  }
  return false;
}

/**
 * Get checkpoint by ID
 */
export function getCheckpoint(checkpointId: string): Checkpoint | null {
  const checkpointFile = join(CHECKPOINTS_DIR, `${checkpointId}.json`);
  if (!existsSync(checkpointFile)) {
    return null;
  }
  return JSON.parse(readFileSync(checkpointFile, 'utf-8'));
}
