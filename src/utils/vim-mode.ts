// Updated: 2026-01-12 03:15:00
// Eames Design Agent - Vim Mode Utilities
// Claude Code-like Vim keybindings for navigation

export type VimMode = 'normal' | 'insert' | 'visual' | 'command';

export interface VimState {
  mode: VimMode;
  commandBuffer: string;
  visualStart: number | null;
  lastSearch: string;
  searchDirection: 'forward' | 'backward';
  registers: Record<string, string>;
  lastYank: string;
  repeatCount: number;
}

/**
 * Create initial vim state
 */
export function createVimState(): VimState {
  return {
    mode: 'insert', // Start in insert mode for CLI
    commandBuffer: '',
    visualStart: null,
    lastSearch: '',
    searchDirection: 'forward',
    registers: {},
    lastYank: '',
    repeatCount: 0,
  };
}

/**
 * Vim key mappings
 */
export interface VimKeyAction {
  type: 'cursor' | 'mode' | 'edit' | 'search' | 'yank' | 'paste' | 'command';
  action: string;
  count?: number;
}

/**
 * Parse vim key sequence in normal mode
 */
export function parseVimKey(
  key: string,
  state: VimState,
  ctrl: boolean,
  meta: boolean
): VimKeyAction | null {
  // Handle escape - always go to normal mode
  if (key === 'escape') {
    return { type: 'mode', action: 'normal' };
  }

  // Insert mode - Ctrl combinations
  if (state.mode === 'insert') {
    if (ctrl && key === 'c') {
      return { type: 'mode', action: 'normal' };
    }
    if (ctrl && key === '[') {
      return { type: 'mode', action: 'normal' };
    }
    // Let all other keys pass through in insert mode
    return null;
  }

  // Normal mode
  if (state.mode === 'normal') {
    // Count prefix (1-9)
    if (/^[1-9]$/.test(key) && state.repeatCount === 0) {
      return { type: 'command', action: 'count', count: parseInt(key) };
    }
    if (/^[0-9]$/.test(key) && state.repeatCount > 0) {
      return { type: 'command', action: 'count', count: parseInt(key) };
    }

    // Mode changes
    if (key === 'i') return { type: 'mode', action: 'insert' };
    if (key === 'I') return { type: 'mode', action: 'insert_start' };
    if (key === 'a') return { type: 'mode', action: 'append' };
    if (key === 'A') return { type: 'mode', action: 'append_end' };
    if (key === 'o') return { type: 'mode', action: 'open_below' };
    if (key === 'O') return { type: 'mode', action: 'open_above' };
    if (key === 'v') return { type: 'mode', action: 'visual' };
    if (key === 'V') return { type: 'mode', action: 'visual_line' };
    if (key === ':') return { type: 'mode', action: 'command' };

    // Cursor movement
    if (key === 'h' || key === 'left') return { type: 'cursor', action: 'left', count: state.repeatCount || 1 };
    if (key === 'l' || key === 'right') return { type: 'cursor', action: 'right', count: state.repeatCount || 1 };
    if (key === 'j' || key === 'down') return { type: 'cursor', action: 'down', count: state.repeatCount || 1 };
    if (key === 'k' || key === 'up') return { type: 'cursor', action: 'up', count: state.repeatCount || 1 };
    if (key === '0') return { type: 'cursor', action: 'line_start' };
    if (key === '$') return { type: 'cursor', action: 'line_end' };
    if (key === 'w') return { type: 'cursor', action: 'word_forward', count: state.repeatCount || 1 };
    if (key === 'b') return { type: 'cursor', action: 'word_backward', count: state.repeatCount || 1 };
    if (key === 'e') return { type: 'cursor', action: 'word_end', count: state.repeatCount || 1 };
    if (key === 'g' && state.commandBuffer === 'g') return { type: 'cursor', action: 'file_start' };
    if (key === 'G') return { type: 'cursor', action: 'file_end' };

    // Editing
    if (key === 'x') return { type: 'edit', action: 'delete_char', count: state.repeatCount || 1 };
    if (key === 'X') return { type: 'edit', action: 'delete_char_before', count: state.repeatCount || 1 };
    if (key === 'd' && state.commandBuffer === 'd') return { type: 'edit', action: 'delete_line' };
    if (key === 'd') return { type: 'command', action: 'buffer_d' };
    if (key === 'D') return { type: 'edit', action: 'delete_to_end' };
    if (key === 'c' && state.commandBuffer === 'c') return { type: 'edit', action: 'change_line' };
    if (key === 'c') return { type: 'command', action: 'buffer_c' };
    if (key === 'C') return { type: 'edit', action: 'change_to_end' };
    if (key === 'r') return { type: 'edit', action: 'replace_char' };
    if (key === 'u') return { type: 'edit', action: 'undo' };
    if (ctrl && key === 'r') return { type: 'edit', action: 'redo' };

    // Yank and paste
    if (key === 'y' && state.commandBuffer === 'y') return { type: 'yank', action: 'yank_line' };
    if (key === 'y') return { type: 'command', action: 'buffer_y' };
    if (key === 'Y') return { type: 'yank', action: 'yank_line' };
    if (key === 'p') return { type: 'paste', action: 'paste_after' };
    if (key === 'P') return { type: 'paste', action: 'paste_before' };

    // Search
    if (key === '/') return { type: 'search', action: 'search_forward' };
    if (key === '?') return { type: 'search', action: 'search_backward' };
    if (key === 'n') return { type: 'search', action: 'search_next' };
    if (key === 'N') return { type: 'search', action: 'search_prev' };
    if (key === '*') return { type: 'search', action: 'search_word_forward' };
    if (key === '#') return { type: 'search', action: 'search_word_backward' };

    // Buffer commands
    if (key === 'g') return { type: 'command', action: 'buffer_g' };
  }

  // Visual mode
  if (state.mode === 'visual') {
    if (key === 'escape' || key === 'v') return { type: 'mode', action: 'normal' };
    if (key === 'h' || key === 'left') return { type: 'cursor', action: 'left' };
    if (key === 'l' || key === 'right') return { type: 'cursor', action: 'right' };
    if (key === 'y') return { type: 'yank', action: 'yank_selection' };
    if (key === 'd') return { type: 'edit', action: 'delete_selection' };
    if (key === 'c') return { type: 'edit', action: 'change_selection' };
  }

  // Command mode
  if (state.mode === 'command') {
    if (key === 'escape') return { type: 'mode', action: 'normal' };
    if (key === 'return') return { type: 'command', action: 'execute' };
  }

  return null;
}

/**
 * Get mode indicator for display
 */
export function getModeIndicator(mode: VimMode): string {
  switch (mode) {
    case 'normal': return '-- NORMAL --';
    case 'insert': return '-- INSERT --';
    case 'visual': return '-- VISUAL --';
    case 'command': return ':';
    default: return '';
  }
}

/**
 * Get mode color
 */
export function getModeColor(mode: VimMode): string {
  switch (mode) {
    case 'normal': return '#61afef';
    case 'insert': return '#98c379';
    case 'visual': return '#c678dd';
    case 'command': return '#e5c07b';
    default: return '#abb2bf';
  }
}

/**
 * Move cursor by word
 */
export function moveByWord(
  text: string,
  cursor: number,
  direction: 'forward' | 'backward',
  count: number = 1
): number {
  let pos = cursor;
  const wordBoundary = /\s/;

  for (let i = 0; i < count; i++) {
    if (direction === 'forward') {
      // Skip current word
      while (pos < text.length && !wordBoundary.test(text[pos])) {
        pos++;
      }
      // Skip whitespace
      while (pos < text.length && wordBoundary.test(text[pos])) {
        pos++;
      }
    } else {
      // Skip whitespace before
      while (pos > 0 && wordBoundary.test(text[pos - 1])) {
        pos--;
      }
      // Skip to start of word
      while (pos > 0 && !wordBoundary.test(text[pos - 1])) {
        pos--;
      }
    }
  }

  return pos;
}

/**
 * Find word under cursor
 */
export function getWordUnderCursor(text: string, cursor: number): string {
  const wordBoundary = /\s/;
  let start = cursor;
  let end = cursor;

  // Find start
  while (start > 0 && !wordBoundary.test(text[start - 1])) {
    start--;
  }

  // Find end
  while (end < text.length && !wordBoundary.test(text[end])) {
    end++;
  }

  return text.slice(start, end);
}
