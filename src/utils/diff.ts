// Updated: 2026-01-12 02:15:00
// Eames Design Agent - Diff Utilities
// Claude Code-like diff preview for file changes

/**
 * Line change type
 */
export type ChangeType = 'add' | 'remove' | 'unchanged';

/**
 * A single line in a diff
 */
export interface DiffLine {
  type: ChangeType;
  content: string;
  oldLineNumber?: number;
  newLineNumber?: number;
}

/**
 * A hunk (section) of changes
 */
export interface DiffHunk {
  oldStart: number;
  oldCount: number;
  newStart: number;
  newCount: number;
  lines: DiffLine[];
}

/**
 * Complete diff result
 */
export interface DiffResult {
  hunks: DiffHunk[];
  additions: number;
  deletions: number;
  hasChanges: boolean;
}

/**
 * Simple diff algorithm (Myers-like)
 */
export function computeDiff(oldText: string, newText: string): DiffResult {
  const oldLines = oldText.split('\n');
  const newLines = newText.split('\n');

  const hunks: DiffHunk[] = [];
  let additions = 0;
  let deletions = 0;

  // Simple line-by-line comparison with context
  let oldIdx = 0;
  let newIdx = 0;
  let currentHunk: DiffHunk | null = null;

  while (oldIdx < oldLines.length || newIdx < newLines.length) {
    const oldLine = oldLines[oldIdx];
    const newLine = newLines[newIdx];

    if (oldLine === newLine) {
      // Lines match
      if (currentHunk) {
        // Add context line to current hunk
        currentHunk.lines.push({
          type: 'unchanged',
          content: oldLine || '',
          oldLineNumber: oldIdx + 1,
          newLineNumber: newIdx + 1,
        });
      }
      oldIdx++;
      newIdx++;
    } else {
      // Lines differ - start or continue a hunk
      if (!currentHunk) {
        currentHunk = {
          oldStart: oldIdx + 1,
          oldCount: 0,
          newStart: newIdx + 1,
          newCount: 0,
          lines: [],
        };
      }

      // Look ahead to find matching lines
      let foundMatch = false;
      const lookAhead = 3;

      // Check if old line exists later in new
      for (let i = 1; i <= lookAhead && newIdx + i < newLines.length; i++) {
        if (oldLine === newLines[newIdx + i]) {
          // Add new lines as additions
          for (let j = 0; j < i; j++) {
            currentHunk.lines.push({
              type: 'add',
              content: newLines[newIdx + j],
              newLineNumber: newIdx + j + 1,
            });
            additions++;
            currentHunk.newCount++;
          }
          newIdx += i;
          foundMatch = true;
          break;
        }
      }

      if (!foundMatch) {
        // Check if new line exists later in old
        for (let i = 1; i <= lookAhead && oldIdx + i < oldLines.length; i++) {
          if (newLine === oldLines[oldIdx + i]) {
            // Add old lines as deletions
            for (let j = 0; j < i; j++) {
              currentHunk.lines.push({
                type: 'remove',
                content: oldLines[oldIdx + j],
                oldLineNumber: oldIdx + j + 1,
              });
              deletions++;
              currentHunk.oldCount++;
            }
            oldIdx += i;
            foundMatch = true;
            break;
          }
        }
      }

      if (!foundMatch) {
        // No match found - treat as replacement
        if (oldIdx < oldLines.length) {
          currentHunk.lines.push({
            type: 'remove',
            content: oldLine,
            oldLineNumber: oldIdx + 1,
          });
          deletions++;
          currentHunk.oldCount++;
          oldIdx++;
        }
        if (newIdx < newLines.length) {
          currentHunk.lines.push({
            type: 'add',
            content: newLine,
            newLineNumber: newIdx + 1,
          });
          additions++;
          currentHunk.newCount++;
          newIdx++;
        }
      }
    }

    // Check if we should close the hunk (gap in changes)
    if (currentHunk && currentHunk.lines.length > 0) {
      const lastLine = currentHunk.lines[currentHunk.lines.length - 1];
      if (lastLine.type === 'unchanged') {
        // Count consecutive unchanged lines
        let unchangedCount = 0;
        for (let i = currentHunk.lines.length - 1; i >= 0; i--) {
          if (currentHunk.lines[i].type === 'unchanged') {
            unchangedCount++;
          } else {
            break;
          }
        }

        // If more than 3 context lines, close the hunk
        if (unchangedCount > 6) {
          // Keep only 3 context lines at the end
          const toRemove = unchangedCount - 3;
          currentHunk.lines.splice(currentHunk.lines.length - toRemove, toRemove);
          hunks.push(currentHunk);
          currentHunk = null;
        }
      }
    }
  }

  // Close any remaining hunk
  if (currentHunk && currentHunk.lines.some(l => l.type !== 'unchanged')) {
    hunks.push(currentHunk);
  }

  return {
    hunks,
    additions,
    deletions,
    hasChanges: additions > 0 || deletions > 0,
  };
}

/**
 * Format diff for terminal display with colors
 */
export function formatDiffForTerminal(diff: DiffResult, showLineNumbers: boolean = true): string {
  if (!diff.hasChanges) {
    return 'No changes';
  }

  const lines: string[] = [];

  for (const hunk of diff.hunks) {
    // Hunk header
    lines.push(`@@ -${hunk.oldStart},${hunk.oldCount} +${hunk.newStart},${hunk.newCount} @@`);

    for (const line of hunk.lines) {
      let prefix: string;
      let lineNum = '';

      switch (line.type) {
        case 'add':
          prefix = '+';
          if (showLineNumbers && line.newLineNumber) {
            lineNum = `${line.newLineNumber.toString().padStart(4)} `;
          }
          break;
        case 'remove':
          prefix = '-';
          if (showLineNumbers && line.oldLineNumber) {
            lineNum = `${line.oldLineNumber.toString().padStart(4)} `;
          }
          break;
        default:
          prefix = ' ';
          if (showLineNumbers) {
            const num = line.oldLineNumber || line.newLineNumber || '';
            lineNum = `${num.toString().padStart(4)} `;
          }
      }

      lines.push(`${lineNum}${prefix} ${line.content}`);
    }
  }

  // Summary
  lines.push('');
  lines.push(`+${diff.additions} -${diff.deletions}`);

  return lines.join('\n');
}

/**
 * Format diff as unified diff string
 */
export function formatUnifiedDiff(
  diff: DiffResult,
  oldPath: string,
  newPath: string
): string {
  if (!diff.hasChanges) {
    return '';
  }

  const lines: string[] = [
    `--- ${oldPath}`,
    `+++ ${newPath}`,
  ];

  for (const hunk of diff.hunks) {
    lines.push(`@@ -${hunk.oldStart},${hunk.oldCount} +${hunk.newStart},${hunk.newCount} @@`);

    for (const line of hunk.lines) {
      switch (line.type) {
        case 'add':
          lines.push(`+${line.content}`);
          break;
        case 'remove':
          lines.push(`-${line.content}`);
          break;
        default:
          lines.push(` ${line.content}`);
      }
    }
  }

  return lines.join('\n');
}

/**
 * Apply a diff to the original text
 */
export function applyDiff(originalText: string, diff: DiffResult): string {
  if (!diff.hasChanges) {
    return originalText;
  }

  const originalLines = originalText.split('\n');
  const resultLines: string[] = [];
  let originalIdx = 0;

  for (const hunk of diff.hunks) {
    // Add unchanged lines before this hunk
    while (originalIdx < hunk.oldStart - 1) {
      resultLines.push(originalLines[originalIdx]);
      originalIdx++;
    }

    // Process hunk lines
    for (const line of hunk.lines) {
      switch (line.type) {
        case 'add':
          resultLines.push(line.content);
          break;
        case 'remove':
          originalIdx++;
          break;
        case 'unchanged':
          resultLines.push(line.content);
          originalIdx++;
          break;
      }
    }
  }

  // Add remaining lines
  while (originalIdx < originalLines.length) {
    resultLines.push(originalLines[originalIdx]);
    originalIdx++;
  }

  return resultLines.join('\n');
}

/**
 * Get a compact summary of changes
 */
export function getDiffSummary(diff: DiffResult): string {
  if (!diff.hasChanges) {
    return 'No changes';
  }

  const parts: string[] = [];
  if (diff.additions > 0) {
    parts.push(`+${diff.additions}`);
  }
  if (diff.deletions > 0) {
    parts.push(`-${diff.deletions}`);
  }

  return `${parts.join(' ')} (${diff.hunks.length} ${diff.hunks.length === 1 ? 'hunk' : 'hunks'})`;
}
