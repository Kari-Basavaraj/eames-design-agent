// Updated: 2026-01-12 04:15:00
// Eames Design Agent - Clipboard Utilities
// Copy to clipboard with visual feedback

import { exec } from 'child_process';
import { platform } from 'os';

/**
 * Copy text to system clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  const os = platform();

  try {
    if (os === 'darwin') {
      // macOS
      await execWithInput('pbcopy', text);
      return true;
    } else if (os === 'linux') {
      // Linux (requires xclip or xsel)
      try {
        await execWithInput('xclip -selection clipboard', text);
        return true;
      } catch {
        try {
          await execWithInput('xsel --clipboard --input', text);
          return true;
        } catch {
          return false;
        }
      }
    } else if (os === 'win32') {
      // Windows
      await execWithInput('clip', text);
      return true;
    }
  } catch {
    return false;
  }

  return false;
}

/**
 * Read text from system clipboard
 */
export async function readFromClipboard(): Promise<string | null> {
  const os = platform();

  try {
    if (os === 'darwin') {
      return await execCommand('pbpaste');
    } else if (os === 'linux') {
      try {
        return await execCommand('xclip -selection clipboard -o');
      } catch {
        try {
          return await execCommand('xsel --clipboard --output');
        } catch {
          return null;
        }
      }
    } else if (os === 'win32') {
      return await execCommand('powershell -Command "Get-Clipboard"');
    }
  } catch {
    return null;
  }

  return null;
}

/**
 * Copy code block with language info
 */
export interface CodeBlockCopy {
  code: string;
  language?: string;
  filename?: string;
}

export async function copyCodeBlock(block: CodeBlockCopy): Promise<boolean> {
  return copyToClipboard(block.code);
}

/**
 * Copy with formatting for different targets
 */
export type CopyFormat = 'plain' | 'markdown' | 'html';

export async function copyFormatted(
  text: string,
  format: CopyFormat,
  options?: {
    language?: string;
    title?: string;
  }
): Promise<boolean> {
  let formatted: string;

  switch (format) {
    case 'markdown':
      if (options?.language) {
        formatted = `\`\`\`${options.language}\n${text}\n\`\`\``;
      } else {
        formatted = text;
      }
      break;

    case 'html':
      const escaped = text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
      if (options?.language) {
        formatted = `<pre><code class="language-${options.language}">${escaped}</code></pre>`;
      } else {
        formatted = `<pre>${escaped}</pre>`;
      }
      break;

    default:
      formatted = text;
  }

  return copyToClipboard(formatted);
}

/**
 * Copy multiple items (for batch operations)
 */
export async function copyMultiple(
  items: string[],
  separator: string = '\n\n'
): Promise<boolean> {
  return copyToClipboard(items.join(separator));
}

/**
 * Recent copies history (in-memory)
 */
interface ClipboardHistoryEntry {
  text: string;
  timestamp: number;
  source?: string;
}

const clipboardHistory: ClipboardHistoryEntry[] = [];
const MAX_HISTORY = 20;

/**
 * Copy with history tracking
 */
export async function copyWithHistory(
  text: string,
  source?: string
): Promise<boolean> {
  const success = await copyToClipboard(text);

  if (success) {
    // Add to history
    clipboardHistory.unshift({
      text,
      timestamp: Date.now(),
      source,
    });

    // Trim history
    if (clipboardHistory.length > MAX_HISTORY) {
      clipboardHistory.length = MAX_HISTORY;
    }
  }

  return success;
}

/**
 * Get clipboard history
 */
export function getClipboardHistory(): ClipboardHistoryEntry[] {
  return [...clipboardHistory];
}

/**
 * Clear clipboard history
 */
export function clearClipboardHistory(): void {
  clipboardHistory.length = 0;
}

/**
 * Get last copied item
 */
export function getLastCopied(): ClipboardHistoryEntry | null {
  return clipboardHistory[0] || null;
}

// Helper functions

function execWithInput(command: string, input: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const proc = exec(command, (error) => {
      if (error) reject(error);
      else resolve();
    });

    if (proc.stdin) {
      proc.stdin.write(input);
      proc.stdin.end();
    }
  });
}

function execCommand(command: string): Promise<string> {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout) => {
      if (error) reject(error);
      else resolve(stdout);
    });
  });
}

/**
 * Format bytes for display when copying large content
 */
export function formatCopySize(text: string): string {
  const bytes = Buffer.byteLength(text, 'utf-8');
  if (bytes < 1024) return `${bytes} bytes`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

/**
 * Truncate for preview
 */
export function truncateForPreview(text: string, maxLength: number = 50): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}
