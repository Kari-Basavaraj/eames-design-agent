// Updated: 2026-02-16 15:00:00
// Eames Design Agent - User Slash Commands Discovery
// Claude Code parity: discovers .claude/commands/*.md files

import { existsSync, readdirSync, readFileSync } from 'fs';
import { join, basename } from 'path';
import { homedir } from 'os';

// ============================================================================
// Types
// ============================================================================

export interface CommandFrontmatter {
  description?: string;
  'argument-hint'?: string;
  'allowed-tools'?: string;
}

export interface UserCommand {
  /** Slash name, e.g. "review" (invoked as /review) */
  name: string;
  /** Description from frontmatter */
  description: string;
  /** Argument hint */
  argumentHint: string;
  /** Source: user or project */
  source: 'user' | 'project';
  /** Absolute path to the .md file */
  path: string;
  /** Parsed frontmatter */
  frontmatter: CommandFrontmatter;
}

// ============================================================================
// Frontmatter Parser
// ============================================================================

function parseFrontmatter(content: string): { frontmatter: CommandFrontmatter; body: string } {
  const match = content.match(/^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/);
  if (!match) return { frontmatter: {}, body: content };

  const raw = match[1];
  const body = match[2];
  const frontmatter: CommandFrontmatter = {};

  for (const line of raw.split('\n')) {
    const sep = line.indexOf(':');
    if (sep === -1) continue;
    const key = line.slice(0, sep).trim();
    const value = line.slice(sep + 1).trim();

    switch (key) {
      case 'description':
        frontmatter.description = value;
        break;
      case 'argument-hint':
        frontmatter['argument-hint'] = value;
        break;
      case 'allowed-tools':
        frontmatter['allowed-tools'] = value;
        break;
    }
  }

  return { frontmatter, body };
}

// ============================================================================
// Discovery
// ============================================================================

function discoverCommandsInDir(dir: string, source: 'user' | 'project'): UserCommand[] {
  const commands: UserCommand[] = [];
  if (!existsSync(dir)) return commands;

  try {
    const files = readdirSync(dir).filter(f => f.endsWith('.md'));
    for (const file of files) {
      const filePath = join(dir, file);
      try {
        const content = readFileSync(filePath, 'utf-8');
        const { frontmatter } = parseFrontmatter(content);
        const name = basename(file, '.md');

        commands.push({
          name,
          description: frontmatter.description || `Custom command: ${name}`,
          argumentHint: frontmatter['argument-hint'] || '',
          source,
          path: filePath,
          frontmatter,
        });
      } catch {
        // Skip unreadable files
      }
    }
  } catch {
    // Directory unreadable
  }

  return commands;
}

/**
 * Discover all user-created commands from:
 * 1. Project: .claude/commands/
 * 2. User: ~/.claude/commands/
 */
export function discoverAllUserCommands(): UserCommand[] {
  const commands: UserCommand[] = [];

  // 1. Project-level commands (higher priority)
  const projectDir = join(process.cwd(), '.claude', 'commands');
  commands.push(...discoverCommandsInDir(projectDir, 'project'));

  // 2. User-level commands
  const userDir = join(homedir(), '.claude', 'commands');
  commands.push(...discoverCommandsInDir(userDir, 'user'));

  // Deduplicate: project overrides user
  const seen = new Set<string>();
  return commands.filter(cmd => {
    if (seen.has(cmd.name)) return false;
    seen.add(cmd.name);
    return true;
  });
}

/**
 * Load full prompt content of a user command.
 * Replaces $ARGUMENTS with the provided args string.
 */
export function loadCommandPrompt(commandPath: string, args: string = ''): string | null {
  try {
    if (!existsSync(commandPath)) return null;
    const content = readFileSync(commandPath, 'utf-8');
    const { body } = parseFrontmatter(content);

    let prompt = body.trim();

    // Replace argument placeholders
    prompt = prompt.replace(/\$ARGUMENTS/g, args);
    prompt = prompt.replace(/\$1/g, args.split(' ')[0] || '');
    prompt = prompt.replace(/\$2/g, args.split(' ')[1] || '');
    prompt = prompt.replace(/\$3/g, args.split(' ')[2] || '');

    return prompt;
  } catch {
    return null;
  }
}

/**
 * Get a quick summary for /help display.
 */
export function getUserCommandsSummary(): string {
  const commands = discoverAllUserCommands();
  if (commands.length === 0) return '';

  return commands.map(cmd => {
    const hint = cmd.argumentHint ? ` ${cmd.argumentHint}` : '';
    const src = cmd.source === 'project' ? '' : ' (user)';
    return `  /${cmd.name}${hint}  ${cmd.description}${src}`;
  }).join('\n');
}
