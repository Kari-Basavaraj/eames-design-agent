// Updated: 2026-01-12 03:40:00
// Eames Design Agent - Session Export
// Export conversations to various formats

import { writeFileSync } from 'fs';
import { join } from 'path';

/**
 * Message for export
 */
export interface ExportMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: number;
  toolCalls?: Array<{
    name: string;
    input: Record<string, unknown>;
    output?: string;
  }>;
}

/**
 * Export session to markdown
 */
export function exportToMarkdown(
  messages: ExportMessage[],
  metadata?: {
    title?: string;
    model?: string;
    date?: string;
    cost?: number;
    tokens?: number;
  }
): string {
  const lines: string[] = [];

  // Header
  lines.push(`# ${metadata?.title || 'Eames Session Export'}`);
  lines.push('');

  // Metadata
  if (metadata) {
    lines.push('## Session Info');
    lines.push('');
    if (metadata.model) lines.push(`- **Model:** ${metadata.model}`);
    if (metadata.date) lines.push(`- **Date:** ${metadata.date}`);
    if (metadata.tokens) lines.push(`- **Tokens:** ${metadata.tokens.toLocaleString()}`);
    if (metadata.cost) lines.push(`- **Cost:** $${metadata.cost.toFixed(4)}`);
    lines.push('');
  }

  lines.push('---');
  lines.push('');

  // Messages
  for (const msg of messages) {
    if (msg.role === 'user') {
      lines.push('## 🧑 User');
      lines.push('');
      lines.push(msg.content);
      lines.push('');
    } else if (msg.role === 'assistant') {
      lines.push('## 🤖 Eames');
      lines.push('');

      // Tool calls
      if (msg.toolCalls && msg.toolCalls.length > 0) {
        lines.push('### Tool Calls');
        lines.push('');
        for (const tool of msg.toolCalls) {
          lines.push(`<details>`);
          lines.push(`<summary>🔧 ${tool.name}</summary>`);
          lines.push('');
          lines.push('**Input:**');
          lines.push('```json');
          lines.push(JSON.stringify(tool.input, null, 2));
          lines.push('```');
          if (tool.output) {
            lines.push('');
            lines.push('**Output:**');
            lines.push('```');
            lines.push(tool.output.slice(0, 500) + (tool.output.length > 500 ? '...' : ''));
            lines.push('```');
          }
          lines.push('</details>');
          lines.push('');
        }
      }

      lines.push(msg.content);
      lines.push('');
    } else if (msg.role === 'system') {
      lines.push('## ⚙️ System');
      lines.push('');
      lines.push(`> ${msg.content}`);
      lines.push('');
    }

    lines.push('---');
    lines.push('');
  }

  // Footer
  lines.push('');
  lines.push(`*Exported from Eames Design Agent on ${new Date().toISOString()}*`);

  return lines.join('\n');
}

/**
 * Export session to JSON
 */
export function exportToJson(
  messages: ExportMessage[],
  metadata?: Record<string, unknown>
): string {
  return JSON.stringify({
    exportedAt: new Date().toISOString(),
    metadata,
    messages,
  }, null, 2);
}

/**
 * Export session to HTML
 */
export function exportToHtml(
  messages: ExportMessage[],
  metadata?: {
    title?: string;
    model?: string;
    date?: string;
    cost?: number;
    tokens?: number;
  }
): string {
  const escapeHtml = (str: string) =>
    str.replace(/&/g, '&amp;')
       .replace(/</g, '&lt;')
       .replace(/>/g, '&gt;')
       .replace(/"/g, '&quot;');

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(metadata?.title || 'Eames Session')}</title>
  <style>
    :root {
      --bg: #1e1e1e;
      --fg: #d4d4d4;
      --user-bg: #264f78;
      --assistant-bg: #2d2d2d;
      --border: #404040;
      --accent: #569cd6;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: var(--bg);
      color: var(--fg);
      max-width: 900px;
      margin: 0 auto;
      padding: 20px;
      line-height: 1.6;
    }
    h1 { color: var(--accent); border-bottom: 2px solid var(--border); padding-bottom: 10px; }
    .meta { background: var(--assistant-bg); padding: 15px; border-radius: 8px; margin-bottom: 20px; }
    .meta span { margin-right: 20px; }
    .message { margin: 20px 0; padding: 15px; border-radius: 8px; }
    .user { background: var(--user-bg); }
    .assistant { background: var(--assistant-bg); border-left: 3px solid var(--accent); }
    .role { font-weight: bold; margin-bottom: 10px; }
    pre { background: #1a1a1a; padding: 15px; border-radius: 5px; overflow-x: auto; }
    code { font-family: 'Fira Code', 'Consolas', monospace; }
    .tool { background: #1a1a1a; padding: 10px; margin: 10px 0; border-radius: 5px; }
    .tool-name { color: #dcdcaa; font-weight: bold; }
  </style>
</head>
<body>
  <h1>${escapeHtml(metadata?.title || 'Eames Session Export')}</h1>

  ${metadata ? `
  <div class="meta">
    ${metadata.model ? `<span><strong>Model:</strong> ${escapeHtml(metadata.model)}</span>` : ''}
    ${metadata.date ? `<span><strong>Date:</strong> ${escapeHtml(metadata.date)}</span>` : ''}
    ${metadata.tokens ? `<span><strong>Tokens:</strong> ${metadata.tokens.toLocaleString()}</span>` : ''}
    ${metadata.cost ? `<span><strong>Cost:</strong> $${metadata.cost.toFixed(4)}</span>` : ''}
  </div>
  ` : ''}

  ${messages.map(msg => `
  <div class="message ${msg.role}">
    <div class="role">${msg.role === 'user' ? '🧑 User' : msg.role === 'assistant' ? '🤖 Eames' : '⚙️ System'}</div>
    ${msg.toolCalls?.map(tool => `
      <div class="tool">
        <span class="tool-name">🔧 ${escapeHtml(tool.name)}</span>
        <pre><code>${escapeHtml(JSON.stringify(tool.input, null, 2))}</code></pre>
      </div>
    `).join('') || ''}
    <div>${escapeHtml(msg.content).replace(/\n/g, '<br>')}</div>
  </div>
  `).join('')}

  <footer style="text-align: center; margin-top: 40px; color: #666;">
    Exported from Eames Design Agent on ${new Date().toISOString()}
  </footer>
</body>
</html>`;

  return html;
}

/**
 * Export session to file
 */
export function exportSessionToFile(
  messages: ExportMessage[],
  format: 'markdown' | 'json' | 'html',
  outputPath: string,
  metadata?: Record<string, unknown>
): string {
  let content: string;
  let extension: string;

  switch (format) {
    case 'markdown':
      content = exportToMarkdown(messages, metadata as any);
      extension = '.md';
      break;
    case 'json':
      content = exportToJson(messages, metadata);
      extension = '.json';
      break;
    case 'html':
      content = exportToHtml(messages, metadata as any);
      extension = '.html';
      break;
    default:
      throw new Error(`Unknown format: ${format}`);
  }

  const finalPath = outputPath.endsWith(extension) ? outputPath : outputPath + extension;
  writeFileSync(finalPath, content);
  return finalPath;
}

/**
 * Generate filename for export
 */
export function generateExportFilename(format: 'markdown' | 'json' | 'html'): string {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const extensions = { markdown: 'md', json: 'json', html: 'html' };
  return `eames-session-${timestamp}.${extensions[format]}`;
}
