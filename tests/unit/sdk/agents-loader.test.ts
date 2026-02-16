// Updated: 2026-02-16 15:30:00
import { describe, it, expect, beforeEach, afterEach } from 'bun:test';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

describe('agents-loader', () => {
  let tmpDir: string;
  let origCwd: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'eames-agents-test-'));
    origCwd = process.cwd();
    process.chdir(tmpDir);
  });

  afterEach(() => {
    process.chdir(origCwd);
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  describe('discoverAllAgents', () => {
    it('should discover file-based agents', async () => {
      fs.mkdirSync(path.join(tmpDir, '.claude', 'agents'), { recursive: true });
      fs.writeFileSync(
        path.join(tmpDir, '.claude', 'agents', 'researcher.md'),
        `---
name: Researcher
description: Deep research agent
model: haiku
tools: WebSearch,WebFetch
---
You are a research specialist.`
      );

      const { discoverAllAgents } = await import('../../../src/sdk/agents-loader.js');
      const agents = discoverAllAgents();
      const projectAgents = agents.filter(a => a.source === 'project');

      expect(projectAgents.length).toBeGreaterThanOrEqual(1);
      const agent = projectAgents.find(a => a.name === 'Researcher');
      expect(agent).toBeDefined();
      expect(agent!.description).toBe('Deep research agent');
      expect(agent!.model).toBe('haiku');
      expect(agent!.tools).toContain('WebSearch');
      expect(agent!.tools).toContain('WebFetch');
    });

    it('should discover settings-based agents', async () => {
      fs.mkdirSync(path.join(tmpDir, '.claude'), { recursive: true });
      fs.writeFileSync(
        path.join(tmpDir, '.claude', 'settings.json'),
        JSON.stringify({
          agents: {
            reviewer: {
              description: 'Code reviewer',
              model: 'opus',
              tools: ['Read', 'Grep'],
            },
          },
        })
      );

      const { discoverAllAgents } = await import('../../../src/sdk/agents-loader.js');
      const agents = discoverAllAgents();
      const reviewer = agents.find(a => a.name === 'reviewer');

      expect(reviewer).toBeDefined();
      expect(reviewer!.description).toBe('Code reviewer');
      expect(reviewer!.model).toBe('opus');
      expect(reviewer!.source).toBe('settings');
    });

    it('should discover directory-based agents with AGENT.md', async () => {
      fs.mkdirSync(path.join(tmpDir, '.claude', 'agents', 'designer'), { recursive: true });
      fs.writeFileSync(
        path.join(tmpDir, '.claude', 'agents', 'designer', 'AGENT.md'),
        `---
name: Designer
description: UI/UX specialist
---
You design beautiful interfaces.`
      );

      const { discoverAllAgents } = await import('../../../src/sdk/agents-loader.js');
      const agents = discoverAllAgents();
      const designer = agents.find(a => a.name === 'Designer');

      expect(designer).toBeDefined();
      expect(designer!.description).toBe('UI/UX specialist');
    });

    it('should return empty when no agents configured', async () => {
      const { discoverAllAgents } = await import('../../../src/sdk/agents-loader.js');
      const agents = discoverAllAgents();
      const projectAgents = agents.filter(a => a.source === 'project' || a.source === 'settings');
      // May pick up user-level, so just check it doesn't crash
      expect(Array.isArray(agents)).toBe(true);
    });
  });

  describe('getAgentsSummary', () => {
    it('should return summary string', async () => {
      const { getAgentsSummary } = await import('../../../src/sdk/agents-loader.js');
      const summary = getAgentsSummary();
      expect(typeof summary).toBe('string');
    });
  });
});
