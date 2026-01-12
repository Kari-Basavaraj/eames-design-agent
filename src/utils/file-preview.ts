// Updated: 2026-01-12 04:15:00
// Eames Design Agent - Quick File Preview
// Preview files without full read

import { readFileSync, statSync, existsSync } from 'fs';
import { basename, extname } from 'path';
import { highlightCode, detectLanguage } from './syntax-highlight.js';

/**
 * File preview result
 */
export interface FilePreview {
  path: string;
  name: string;
  extension: string;
  size: number;
  lines: number;
  preview: string[];
  language?: string;
  binary: boolean;
  truncated: boolean;
  error?: string;
}

/**
 * Preview options
 */
export interface PreviewOptions {
  maxLines?: number;
  maxLineLength?: number;
  highlight?: boolean;
  context?: 'start' | 'middle' | 'end' | number; // line number
  contextLines?: number;
}

const DEFAULT_OPTIONS: PreviewOptions = {
  maxLines: 15,
  maxLineLength: 120,
  highlight: true,
  context: 'start',
  contextLines: 7,
};

/**
 * Binary file signatures
 */
const BINARY_SIGNATURES: Array<{ bytes: number[]; ext?: string[] }> = [
  { bytes: [0x89, 0x50, 0x4e, 0x47], ext: ['png'] }, // PNG
  { bytes: [0xff, 0xd8, 0xff], ext: ['jpg', 'jpeg'] }, // JPEG
  { bytes: [0x47, 0x49, 0x46], ext: ['gif'] }, // GIF
  { bytes: [0x25, 0x50, 0x44, 0x46], ext: ['pdf'] }, // PDF
  { bytes: [0x50, 0x4b, 0x03, 0x04], ext: ['zip', 'docx', 'xlsx'] }, // ZIP
  { bytes: [0x7f, 0x45, 0x4c, 0x46], ext: [] }, // ELF
  { bytes: [0xfe, 0xed, 0xfa, 0xce], ext: [] }, // Mach-O 32
  { bytes: [0xfe, 0xed, 0xfa, 0xcf], ext: [] }, // Mach-O 64
  { bytes: [0xca, 0xfe, 0xba, 0xbe], ext: [] }, // Java class
];

/**
 * Check if file is binary
 */
function isBinaryFile(path: string): boolean {
  try {
    const buffer = Buffer.alloc(8);
    const fd = require('fs').openSync(path, 'r');
    require('fs').readSync(fd, buffer, 0, 8, 0);
    require('fs').closeSync(fd);

    // Check signatures
    for (const sig of BINARY_SIGNATURES) {
      if (sig.bytes.every((b, i) => buffer[i] === b)) {
        return true;
      }
    }

    // Check for null bytes (common in binaries)
    for (let i = 0; i < buffer.length; i++) {
      if (buffer[i] === 0) return true;
    }

    return false;
  } catch {
    return false;
  }
}

/**
 * Get file preview
 */
export function getFilePreview(
  path: string,
  options: PreviewOptions = {}
): FilePreview {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const name = basename(path);
  const extension = extname(path).slice(1);

  // Check existence
  if (!existsSync(path)) {
    return {
      path,
      name,
      extension,
      size: 0,
      lines: 0,
      preview: [],
      binary: false,
      truncated: false,
      error: 'File not found',
    };
  }

  // Get stats
  const stats = statSync(path);

  // Check if binary
  if (isBinaryFile(path)) {
    return {
      path,
      name,
      extension,
      size: stats.size,
      lines: 0,
      preview: [`[Binary file: ${formatSize(stats.size)}]`],
      binary: true,
      truncated: false,
    };
  }

  try {
    // Read file
    const content = readFileSync(path, 'utf-8');
    const allLines = content.split('\n');
    const totalLines = allLines.length;
    const language = detectLanguage(content, name);

    // Determine which lines to show
    let startLine: number;
    let endLine: number;

    if (typeof opts.context === 'number') {
      // Center around specific line
      const half = Math.floor(opts.contextLines! / 2);
      startLine = Math.max(0, opts.context - half - 1);
      endLine = Math.min(totalLines, opts.context + half);
    } else if (opts.context === 'end') {
      startLine = Math.max(0, totalLines - opts.maxLines!);
      endLine = totalLines;
    } else if (opts.context === 'middle') {
      const half = Math.floor(opts.maxLines! / 2);
      const middle = Math.floor(totalLines / 2);
      startLine = Math.max(0, middle - half);
      endLine = Math.min(totalLines, middle + half);
    } else {
      // Start
      startLine = 0;
      endLine = Math.min(totalLines, opts.maxLines!);
    }

    // Extract lines
    let previewLines = allLines.slice(startLine, endLine);

    // Truncate long lines
    previewLines = previewLines.map((line) => {
      if (line.length > opts.maxLineLength!) {
        return line.slice(0, opts.maxLineLength! - 3) + '...';
      }
      return line;
    });

    // Add line numbers
    previewLines = previewLines.map((line, i) => {
      const lineNum = startLine + i + 1;
      const padding = String(endLine).length;
      return `${String(lineNum).padStart(padding)} │ ${line}`;
    });

    // Add truncation indicators
    if (startLine > 0) {
      previewLines.unshift(`... (${startLine} lines above)`);
    }
    if (endLine < totalLines) {
      previewLines.push(`... (${totalLines - endLine} lines below)`);
    }

    return {
      path,
      name,
      extension,
      size: stats.size,
      lines: totalLines,
      preview: previewLines,
      language,
      binary: false,
      truncated: startLine > 0 || endLine < totalLines,
    };
  } catch (error) {
    return {
      path,
      name,
      extension,
      size: stats.size,
      lines: 0,
      preview: [],
      binary: false,
      truncated: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Format preview for display
 */
export function formatPreview(preview: FilePreview): string {
  const lines: string[] = [];

  // Header
  const header = `${preview.name} (${formatSize(preview.size)}, ${preview.lines} lines)`;
  lines.push(`\x1b[1m${header}\x1b[0m`);

  if (preview.error) {
    lines.push(`\x1b[31mError: ${preview.error}\x1b[0m`);
    return lines.join('\n');
  }

  if (preview.binary) {
    lines.push(...preview.preview);
    return lines.join('\n');
  }

  // Language badge
  if (preview.language) {
    lines.push(`\x1b[90m${preview.language}\x1b[0m`);
  }

  // Separator
  lines.push('─'.repeat(50));

  // Content
  lines.push(...preview.preview);

  // Footer
  lines.push('─'.repeat(50));

  return lines.join('\n');
}

/**
 * Get syntax-highlighted preview
 */
export function getHighlightedPreview(
  path: string,
  options: PreviewOptions = {}
): string[] {
  const preview = getFilePreview(path, { ...options, highlight: true });

  if (preview.error || preview.binary || !preview.language) {
    return preview.preview;
  }

  // Re-read and highlight
  try {
    const content = readFileSync(path, 'utf-8');
    const highlighted = highlightCode(content, preview.language, preview.name);

    // This returns colored segments - join and split by lines
    const coloredText = highlighted.map((seg) => seg.text).join('');
    return coloredText.split('\n').slice(0, options.maxLines || 15);
  } catch {
    return preview.preview;
  }
}

/**
 * Preview multiple files
 */
export function getMultiFilePreview(
  paths: string[],
  options: PreviewOptions = {}
): Map<string, FilePreview> {
  const results = new Map<string, FilePreview>();

  for (const path of paths) {
    results.set(path, getFilePreview(path, options));
  }

  return results;
}

/**
 * Get file type icon
 */
export function getFileTypeIcon(path: string): string {
  const ext = extname(path).slice(1).toLowerCase();

  const icons: Record<string, string> = {
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
    scss: '🎨',
    html: '🌐',
    sql: '🗃️',
    sh: '🖥️',
    png: '🖼️',
    jpg: '🖼️',
    jpeg: '🖼️',
    gif: '🖼️',
    svg: '🖼️',
    pdf: '📕',
    zip: '📦',
  };

  return icons[ext] || '📄';
}

/**
 * Format file size
 */
function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)}MB`;
}

/**
 * Quick peek at file (first few lines)
 */
export function peekFile(path: string, lines: number = 5): string[] {
  try {
    if (!existsSync(path)) return ['[File not found]'];
    if (isBinaryFile(path)) return ['[Binary file]'];

    const content = readFileSync(path, 'utf-8');
    return content.split('\n').slice(0, lines);
  } catch {
    return ['[Error reading file]'];
  }
}

/**
 * Get file info summary
 */
export function getFileInfo(path: string): string {
  try {
    if (!existsSync(path)) return 'File not found';

    const stats = statSync(path);
    const name = basename(path);
    const ext = extname(path).slice(1);
    const size = formatSize(stats.size);
    const modified = stats.mtime.toLocaleDateString();

    if (isBinaryFile(path)) {
      return `${getFileTypeIcon(path)} ${name} (${size}, binary, modified ${modified})`;
    }

    const content = readFileSync(path, 'utf-8');
    const lines = content.split('\n').length;
    const lang = detectLanguage(content, name);

    return `${getFileTypeIcon(path)} ${name} (${size}, ${lines} lines, ${lang || ext}, modified ${modified})`;
  } catch {
    return 'Error getting file info';
  }
}
