// Updated: 2026-02-16 15:00:00
// Eames Design Agent - Skills Discovery & Loader
// Claude Code parity: discovers SKILL.md from ~/.claude/skills/, .claude/skills/, plugins

import { existsSync, readdirSync, readFileSync, statSync } from 'fs';
import { join, basename, dirname } from 'path';
import { homedir } from 'os';

// ============================================================================
// Types
// ============================================================================

export interface SkillFrontmatter {
  name?: string;
  description?: string;
  'allowed-tools'?: string;
  'disable-model-invocation'?: boolean;
  context?: 'fork' | 'inline';
  'argument-hint'?: string;
}

export interface SkillInfo {
  /** Unique ID: scope:name or plugin:pluginName:name */
  id: string;
  /** Display name from frontmatter or directory */
  name: string;
  /** Description from frontmatter */
  description: string;
  /** Where it came from */
  source: 'user' | 'project' | 'plugin';
  /** Plugin or directory name */
  sourceName: string;
  /** Absolute path to SKILL.md */
  path: string;
  /** Parsed frontmatter */
  frontmatter: SkillFrontmatter;
  /** Whether the model can auto-invoke this skill */
  modelInvocable: boolean;
  /** Whether this is an action skill (has / trigger) */
  isAction: boolean;
}

// ============================================================================
// Frontmatter Parser
// ============================================================================

function parseFrontmatter(content: string): { frontmatter: SkillFrontmatter; body: string } {
  const match = content.match(/^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/);
  if (!match) return { frontmatter: {}, body: content };

  const raw = match[1];
  const body = match[2];
  const frontmatter: SkillFrontmatter = {};

  for (const line of raw.split('\n')) {
    const sep = line.indexOf(':');
    if (sep === -1) continue;
    const key = line.slice(0, sep).trim();
    const value = line.slice(sep + 1).trim();

    switch (key) {
      case 'name':
        frontmatter.name = value;
        break;
      case 'description':
        frontmatter.description = value;
        break;
      case 'allowed-tools':
        frontmatter['allowed-tools'] = value;
        break;
      case 'disable-model-invocation':
        frontmatter['disable-model-invocation'] = value === 'true';
        break;
      case 'context':
        frontmatter.context = value as 'fork' | 'inline';
        break;
      case 'argument-hint':
        frontmatter['argument-hint'] = value;
        break;
    }
  }

  return { frontmatter, body };
}

// ============================================================================
// Discovery
// ============================================================================

function discoverSkillsInDir(dir: string, source: 'user' | 'project' | 'plugin', sourceName: string): SkillInfo[] {
  const skills: SkillInfo[] = [];
  if (!existsSync(dir)) return skills;

  try {
    const entries = readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = join(dir, entry.name);

      if (entry.isDirectory()) {
        // Skill is a directory with SKILL.md inside
        const skillMd = join(fullPath, 'SKILL.md');
        if (existsSync(skillMd)) {
          const skill = loadSkillFile(skillMd, entry.name, source, sourceName);
          if (skill) skills.push(skill);
        }
      } else if (entry.isFile() && entry.name === 'SKILL.md') {
        // Skill is a SKILL.md at the root of the skills dir
        const dirName = basename(dir);
        const skill = loadSkillFile(fullPath, dirName, source, sourceName);
        if (skill) skills.push(skill);
      }
    }
  } catch {
    // Directory unreadable
  }

  return skills;
}

function loadSkillFile(
  filePath: string,
  fallbackName: string,
  source: 'user' | 'project' | 'plugin',
  sourceName: string
): SkillInfo | null {
  try {
    const content = readFileSync(filePath, 'utf-8');
    const { frontmatter } = parseFrontmatter(content);

    const name = frontmatter.name || fallbackName;
    const prefix = source === 'plugin' ? `plugin:${sourceName}:` : `${source}:`;

    return {
      id: `${prefix}${name}`,
      name,
      description: frontmatter.description || '',
      source,
      sourceName,
      path: filePath,
      frontmatter,
      modelInvocable: frontmatter['disable-model-invocation'] !== true,
      isAction: !!frontmatter['argument-hint'] || content.includes('$ARGUMENTS'),
    };
  } catch {
    return null;
  }
}

/**
 * Discover all available skills from all locations:
 * 1. User skills: ~/.claude/skills/
 * 2. Project skills: .claude/skills/
 * 3. Plugin skills: ~/.claude/plugins/cache/{name}/skills/
 */
export function discoverAllSkills(): SkillInfo[] {
  const skills: SkillInfo[] = [];

  // 1. User-level skills
  const userDir = join(homedir(), '.claude', 'skills');
  skills.push(...discoverSkillsInDir(userDir, 'user', '~/.claude/skills'));

  // 2. Project-level skills
  const projectDir = join(process.cwd(), '.claude', 'skills');
  skills.push(...discoverSkillsInDir(projectDir, 'project', '.claude/skills'));

  // 3. Plugin skills
  try {
    const pluginCache = join(homedir(), '.claude', 'plugins', 'cache');
    if (existsSync(pluginCache)) {
      const plugins = readdirSync(pluginCache, { withFileTypes: true });
      for (const plugin of plugins) {
        if (!plugin.isDirectory()) continue;
        const pluginSkillsDir = join(pluginCache, plugin.name, 'skills');
        skills.push(...discoverSkillsInDir(pluginSkillsDir, 'plugin', plugin.name));
      }
    }
  } catch {
    // Plugin cache unreadable
  }

  return skills.sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Load full content of a skill by its path.
 */
export function loadSkillContent(skillPath: string): string | null {
  try {
    if (!existsSync(skillPath)) return null;
    const content = readFileSync(skillPath, 'utf-8');
    const { body } = parseFrontmatter(content);
    return body.trim();
  } catch {
    return null;
  }
}

/**
 * Get a short summary of all skills for display.
 */
export function getSkillsSummary(): string {
  const skills = discoverAllSkills();
  if (skills.length === 0) return 'No skills installed.';

  const userSkills = skills.filter(s => s.source === 'user');
  const projectSkills = skills.filter(s => s.source === 'project');
  const pluginSkills = skills.filter(s => s.source === 'plugin');

  const parts: string[] = [`${skills.length} skill(s) found:`];
  if (userSkills.length > 0) parts.push(`  User: ${userSkills.length} (${userSkills.map(s => s.name).join(', ')})`);
  if (projectSkills.length > 0) parts.push(`  Project: ${projectSkills.length} (${projectSkills.map(s => s.name).join(', ')})`);
  if (pluginSkills.length > 0) parts.push(`  Plugin: ${pluginSkills.length} (${pluginSkills.map(s => s.name).join(', ')})`);

  return parts.join('\n');
}
