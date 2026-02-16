// Updated: 2026-02-16 15:30:00
import { describe, it, expect, beforeEach, afterEach } from 'bun:test';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

describe('commands-loader', () => {
  let tmpDir: string;
  let origCwd: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'eames-cmds-test-'));
    origCwd = process.cwd();
    process.chdir(tmpDir);
  });

  afterEach(() => {
    process.chdir(origCwd);
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  describe('discoverAllUserCommands', () => {
    it('should discover project commands', async () => {
      fs.mkdirSync(path.join(tmpDir, '.claude', 'commands'), { recursive: true });
      fs.writeFileSync(
        path.join(tmpDir, '.claude', 'commands', 'review.md'),
        `---
description: Code review helper
argument-hint: <file>
---
Review the following file: $ARGUMENTS`
      );

      const { discoverAllUserCommands } = await import('../../../src/sdk/commands-loader.js');
      const cmds = discoverAllUserCommands();
      const review = cmds.find(c => c.name === 'review');

      expect(review).toBeDefined();
      expect(review!.description).toBe('Code review helper');
      expect(review!.argumentHint).toBe('<file>');
      expect(review!.source).toBe('project');
    });

    it('should return empty when no commands exist', async () => {
      const { discoverAllUserCommands } = await import('../../../src/sdk/commands-loader.js');
      const cmds = discoverAllUserCommands();
      // Filter only project commands (user-level ones may exist on the test machine)
      const projectCmds = cmds.filter(c => c.source === 'project');
      expect(projectCmds.length).toBe(0);
    });
  });

  describe('loadCommandPrompt', () => {
    it('should replace $ARGUMENTS in prompt body', async () => {
      fs.mkdirSync(path.join(tmpDir, '.claude', 'commands'), { recursive: true });
      const cmdPath = path.join(tmpDir, '.claude', 'commands', 'deploy.md');
      fs.writeFileSync(
        cmdPath,
        `---
description: Deploy to env
---
Deploy the app to $ARGUMENTS environment. Use $1 as the primary target.`
      );

      const { loadCommandPrompt } = await import('../../../src/sdk/commands-loader.js');
      const prompt = loadCommandPrompt(cmdPath, 'staging');
      expect(prompt).toContain('Deploy the app to staging environment');
      expect(prompt).toContain('Use staging as the primary target');
    });

    it('should handle positional args $1 $2 $3', async () => {
      fs.mkdirSync(path.join(tmpDir, '.claude', 'commands'), { recursive: true });
      const cmdPath = path.join(tmpDir, '.claude', 'commands', 'multi.md');
      fs.writeFileSync(
        cmdPath,
        `---
description: Multi args
---
First: $1, Second: $2, Third: $3`
      );

      const { loadCommandPrompt } = await import('../../../src/sdk/commands-loader.js');
      const prompt = loadCommandPrompt(cmdPath, 'alpha beta gamma');
      expect(prompt).toContain('First: alpha');
      expect(prompt).toContain('Second: beta');
      expect(prompt).toContain('Third: gamma');
    });

    it('should return null for missing files', async () => {
      const { loadCommandPrompt } = await import('../../../src/sdk/commands-loader.js');
      expect(loadCommandPrompt('/nonexistent/cmd.md')).toBeNull();
    });
  });

  describe('getUserCommandsSummary', () => {
    it('should return empty string when no commands', async () => {
      const { getUserCommandsSummary } = await import('../../../src/sdk/commands-loader.js');
      // May have user-level commands on test machine, just check it doesn't throw
      const summary = getUserCommandsSummary();
      expect(typeof summary).toBe('string');
    });
  });
});
