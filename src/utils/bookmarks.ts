// Updated: 2026-01-12 04:10:00
// Eames Design Agent - Query Bookmarks
// Save and recall favorite queries

import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

const EAMES_DIR = join(homedir(), '.eames');
const BOOKMARKS_FILE = join(EAMES_DIR, 'bookmarks.json');

/**
 * Bookmark entry
 */
export interface Bookmark {
  id: string;
  name: string;
  query: string;
  description?: string;
  tags?: string[];
  createdAt: number;
  lastUsedAt: number;
  useCount: number;
  shortcut?: string; // e.g., "b1", "b2" for quick access
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
 * Generate unique ID
 */
function generateId(): string {
  return `bm-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * Load bookmarks
 */
export function loadBookmarks(): Bookmark[] {
  ensureDir();
  try {
    if (existsSync(BOOKMARKS_FILE)) {
      const data = readFileSync(BOOKMARKS_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch {
    // Ignore
  }
  return [];
}

/**
 * Save bookmarks
 */
export function saveBookmarks(bookmarks: Bookmark[]): void {
  ensureDir();
  writeFileSync(BOOKMARKS_FILE, JSON.stringify(bookmarks, null, 2));
}

/**
 * Add bookmark
 */
export function addBookmark(
  name: string,
  query: string,
  options?: {
    description?: string;
    tags?: string[];
    shortcut?: string;
  }
): Bookmark {
  const bookmarks = loadBookmarks();

  // Check for duplicate shortcut
  if (options?.shortcut) {
    const existing = bookmarks.find(b => b.shortcut === options.shortcut);
    if (existing) {
      existing.shortcut = undefined;
    }
  }

  const bookmark: Bookmark = {
    id: generateId(),
    name,
    query,
    description: options?.description,
    tags: options?.tags,
    shortcut: options?.shortcut,
    createdAt: Date.now(),
    lastUsedAt: Date.now(),
    useCount: 0,
  };

  bookmarks.push(bookmark);
  saveBookmarks(bookmarks);

  return bookmark;
}

/**
 * Update bookmark
 */
export function updateBookmark(
  id: string,
  updates: Partial<Omit<Bookmark, 'id' | 'createdAt'>>
): Bookmark | null {
  const bookmarks = loadBookmarks();
  const index = bookmarks.findIndex(b => b.id === id);

  if (index === -1) return null;

  // Check for duplicate shortcut
  if (updates.shortcut) {
    const existing = bookmarks.find(b => b.shortcut === updates.shortcut && b.id !== id);
    if (existing) {
      existing.shortcut = undefined;
    }
  }

  bookmarks[index] = { ...bookmarks[index], ...updates };
  saveBookmarks(bookmarks);

  return bookmarks[index];
}

/**
 * Delete bookmark
 */
export function deleteBookmark(id: string): boolean {
  const bookmarks = loadBookmarks();
  const index = bookmarks.findIndex(b => b.id === id);

  if (index === -1) return false;

  bookmarks.splice(index, 1);
  saveBookmarks(bookmarks);

  return true;
}

/**
 * Get bookmark by ID
 */
export function getBookmark(id: string): Bookmark | null {
  const bookmarks = loadBookmarks();
  return bookmarks.find(b => b.id === id) || null;
}

/**
 * Get bookmark by shortcut
 */
export function getBookmarkByShortcut(shortcut: string): Bookmark | null {
  const bookmarks = loadBookmarks();
  return bookmarks.find(b => b.shortcut === shortcut) || null;
}

/**
 * Use bookmark (update usage stats)
 */
export function useBookmark(id: string): Bookmark | null {
  const bookmarks = loadBookmarks();
  const bookmark = bookmarks.find(b => b.id === id);

  if (!bookmark) return null;

  bookmark.lastUsedAt = Date.now();
  bookmark.useCount++;
  saveBookmarks(bookmarks);

  return bookmark;
}

/**
 * Search bookmarks
 */
export function searchBookmarks(query: string): Bookmark[] {
  const bookmarks = loadBookmarks();
  const q = query.toLowerCase();

  return bookmarks.filter(b =>
    b.name.toLowerCase().includes(q) ||
    b.query.toLowerCase().includes(q) ||
    b.description?.toLowerCase().includes(q) ||
    b.tags?.some(t => t.toLowerCase().includes(q))
  );
}

/**
 * Get bookmarks by tag
 */
export function getBookmarksByTag(tag: string): Bookmark[] {
  const bookmarks = loadBookmarks();
  return bookmarks.filter(b => b.tags?.includes(tag));
}

/**
 * Get all tags
 */
export function getAllTags(): string[] {
  const bookmarks = loadBookmarks();
  const tags = new Set<string>();

  for (const bookmark of bookmarks) {
    if (bookmark.tags) {
      for (const tag of bookmark.tags) {
        tags.add(tag);
      }
    }
  }

  return Array.from(tags).sort();
}

/**
 * Get recent bookmarks
 */
export function getRecentBookmarks(limit: number = 10): Bookmark[] {
  const bookmarks = loadBookmarks();
  return [...bookmarks]
    .sort((a, b) => b.lastUsedAt - a.lastUsedAt)
    .slice(0, limit);
}

/**
 * Get most used bookmarks
 */
export function getMostUsedBookmarks(limit: number = 10): Bookmark[] {
  const bookmarks = loadBookmarks();
  return [...bookmarks]
    .sort((a, b) => b.useCount - a.useCount)
    .slice(0, limit);
}

/**
 * Export bookmarks
 */
export function exportBookmarks(): string {
  const bookmarks = loadBookmarks();
  return JSON.stringify(bookmarks, null, 2);
}

/**
 * Import bookmarks
 */
export function importBookmarks(data: string, merge: boolean = true): number {
  try {
    const imported: Bookmark[] = JSON.parse(data);

    if (merge) {
      const existing = loadBookmarks();
      const existingIds = new Set(existing.map(b => b.id));

      // Add only new bookmarks
      for (const bookmark of imported) {
        if (!existingIds.has(bookmark.id)) {
          // Generate new ID to avoid conflicts
          bookmark.id = generateId();
          existing.push(bookmark);
        }
      }

      saveBookmarks(existing);
      return imported.filter(b => !existingIds.has(b.id)).length;
    } else {
      // Replace all
      saveBookmarks(imported);
      return imported.length;
    }
  } catch {
    return 0;
  }
}

/**
 * Assign next available shortcut
 */
export function assignNextShortcut(bookmarkId: string): string | null {
  const bookmarks = loadBookmarks();
  const bookmark = bookmarks.find(b => b.id === bookmarkId);

  if (!bookmark) return null;

  const usedShortcuts = new Set(bookmarks.map(b => b.shortcut).filter(Boolean));

  // Find next available shortcut (b1, b2, ..., b9)
  for (let i = 1; i <= 9; i++) {
    const shortcut = `b${i}`;
    if (!usedShortcuts.has(shortcut)) {
      bookmark.shortcut = shortcut;
      saveBookmarks(bookmarks);
      return shortcut;
    }
  }

  return null;
}
