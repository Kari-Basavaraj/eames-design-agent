// Updated: 2026-02-16 15:00:00
// Eames Design Agent - Subagent Discovery
// Claude Code parity: discovers agents from .claude/agents/, settings.json

import { existsSync, readdirSync, readFileSync } from 'fs';
import { join, basename } from 'path';
import { homedir } from 'os';

// ============================================================================
// Types
// ============================================================================

export interface AgentFrontmatter {
  name?: string;
  description?: string;
  tools?: string;
  model?: string;
  skills?: string;
}

export interface SubagentInfo {
  /** Agent name */
  name: string;
  /** Description */
  description: string;
  /** Source: user, project, or settings */
  source: 'user' | 'project' | 'settings';
  /** Source path */
  sourcePath: string;
  /** Model override (sonnet, opus, haiku, inherit) */
  model: string;
  /** Allowed tools */
  tools: string[];
  /** Preloaded skills */
  skills: string[];
}

// ============================================================================
// Frontmatter Parser
// ============================================================================

function parseFrontmatter(content: string): { frontmatter: AgentFrontmatter; body: string } {
  const match = content.match(/^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/);
  if (!match) return { frontmatter: {}, body: content };

  const raw = match[1];
  const body = match[2];
  const frontmatter: AgentFrontmatter = {};

  for (const line of raw.split('\n')) {
    const sep = line.indexOf(':');
    if (sep === -1) continue;
    const key = line.slice(0, sep).trim();
    const value = line.slice(sep + 1).trim();

    switch (key) {
      case 'name': frontmatter.name = value; break;
      case 'description': frontmatter.description = value; break;
      case 'tools': frontmatter.tools = value; break;
      case 'model': frontmatter.model = value; break;
      case 'skills': frontmatter.skills = value; break;
    }
  }

  return { frontmatter, body };
}

// ============================================================================
// Discovery
// ============================================================================

function discoverAgentsInDir(dir: string, source: 'user' | 'project'): SubagentInfo[] {
  const agents: SubagentInfo[] = [];
  if (!existsSync(dir)) return agents;

  try {
    const entries = readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = join(dir, entry.name);

      if (entry.isFile() && entry.name.endsWith('.md')) {
        // Agent defined as a single .md file
        try {
          const content = readFileSync(fullPath, 'utf-8');
          const { frontmatter } = parseFrontmatter(content);
          const name = frontmatter.name || basename(entry.name, '.md');

          agents.push({
            name,
            description: frontmatter.description || '',
            source,
            sourcePath: fullPath,
            model: frontmatter.model || 'inherit',
            tools: frontmatter.tools ? frontmatter.tools.split(',').map(t => t.trim()) : [],
            skills: frontmatter.skills ? frontmatter.skills.split(',').map(s => s.trim()) : [],
          });
        } catch {
          // Skip unreadable
        }
      } else if (entry.isDirectory()) {
        // Agent defined as a directory with agent.md or AGENT.md
        for (const agentFile of ['agent.md', 'AGENT.md']) {
          const agentPath = join(fullPath, agentFile);
          if (existsSync(agentPath)) {
            try {
              const content = readFileSync(agentPath, 'utf-8');
              const { frontmatter } = parseFrontmatter(content);
              const name = frontmatter.name || entry.name;

              agents.push({
                name,
                description: frontmatter.description || '',
                source,
                sourcePath: agentPath,
                model: frontmatter.model || 'inherit',
                tools: frontmatter.tools ? frontmatter.tools.split(',').map(t => t.trim()) : [],
                skills: frontmatter.skills ? frontmatter.skills.split(',').map(s => s.trim()) : [],
              });
            } catch {
              // Skip
            }
            break;
          }
        }
      }
    }
  } catch {
    // Directory unreadable
  }

  return agents;
}

function discoverAgentsFromSettings(filePath: string, source: 'user' | 'project'): SubagentInfo[] {
  const agents: SubagentInfo[] = [];
  if (!existsSync(filePath)) return agents;

  try {
    const data = JSON.parse(readFileSync(filePath, 'utf-8'));
    const agentsConfig = data.agents as Record<string, Record<string, unknown>> | undefined;
    if (!agentsConfig) return agents;

    for (const [name, config] of Object.entries(agentsConfig)) {
      agents.push({
        name,
        description: (config.description as string) || '',
        source: 'settings',
        sourcePath: filePath,
        model: (config.model as string) || 'inherit',
        tools: Array.isArray(config.tools) ? config.tools : [],
        skills: Array.isArray(config.skills) ? config.skills : [],
      });
    }
  } catch {
    // Invalid file
  }

  return agents;
}

/**
 * Discover all configured subagents from:
 * 1. User: ~/.claude/agents/
 * 2. Project: .claude/agents/
 * 3. User settings: ~/.claude/settings.json (agents key)
 * 4. Project settings: .claude/settings.json (agents key)
 */
export function discoverAllAgents(): SubagentInfo[] {
  const agents: SubagentInfo[] = [];

  // File-based agents
  agents.push(...discoverAgentsInDir(join(homedir(), '.claude', 'agents'), 'user'));
  agents.push(...discoverAgentsInDir(join(process.cwd(), '.claude', 'agents'), 'project'));

  // Settings-based agents
  agents.push(...discoverAgentsFromSettings(join(homedir(), '.claude', 'settings.json'), 'user'));
  agents.push(...discoverAgentsFromSettings(join(process.cwd(), '.claude', 'settings.json'), 'project'));

  // Deduplicate by name (project overrides user)
  const seen = new Map<string, SubagentInfo>();
  for (const agent of agents) {
    const existing = seen.get(agent.name);
    if (!existing || agent.source === 'project') {
      seen.set(agent.name, agent);
    }
  }

  return Array.from(seen.values()).sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Get a summary for /agents display.
 */
export function getAgentsSummary(): string {
  const agents = discoverAllAgents();
  if (agents.length === 0) return 'No subagents configured.\nAdd agents to .claude/agents/ or .claude/settings.json';

  const parts: string[] = [`${agents.length} subagent(s):`];
  for (const agent of agents) {
    const modelStr = agent.model !== 'inherit' ? ` (${agent.model})` : '';
    const toolsStr = agent.tools.length > 0 ? ` tools: ${agent.tools.join(', ')}` : '';
    const src = agent.source === 'project' ? '' : ` [${agent.source}]`;
    parts.push(`  ${agent.name}${modelStr}${src}`);
    if (agent.description) parts.push(`    ${agent.description}`);
    if (toolsStr) parts.push(`   ${toolsStr}`);
    if (agent.skills.length > 0) parts.push(`    skills: ${agent.skills.join(', ')}`);
  }

  return parts.join('\n');
}
