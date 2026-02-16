// Updated: 2026-02-16 15:30:00
import { describe, it, expect, beforeEach, afterEach } from 'bun:test';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

describe('hooks-loader', () => {
  let tmpDir: string;
  let origCwd: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'eames-hooks-test-'));
    origCwd = process.cwd();
    process.chdir(tmpDir);
  });

  afterEach(() => {
    process.chdir(origCwd);
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  describe('discoverAllHooks', () => {
    it('should discover hooks from project settings.json', async () => {
      fs.mkdirSync(path.join(tmpDir, '.claude'), { recursive: true });
      fs.writeFileSync(
        path.join(tmpDir, '.claude', 'settings.json'),
        JSON.stringify({
          hooks: {
            PostToolUse: [
              {
                matcher: 'Edit|Write',
                hooks: [
                  { type: 'command', command: 'npm run lint' },
                ],
              },
            ],
            PreToolUse: [
              {
                hooks: [
                  { type: 'prompt', prompt: 'Check if this tool call is safe' },
                ],
              },
            ],
          },
        })
      );

      const { discoverAllHooks } = await import('../../../src/sdk/hooks-loader.js');
      const hooks = discoverAllHooks();
      const projectHooks = hooks.filter(h => h.source === 'project');

      expect(projectHooks.length).toBe(2);

      const postHook = projectHooks.find(h => h.event === 'PostToolUse');
      expect(postHook).toBeDefined();
      expect(postHook!.matcher).toBe('Edit|Write');
      expect(postHook!.type).toBe('command');
      expect(postHook!.value).toBe('npm run lint');

      const preHook = projectHooks.find(h => h.event === 'PreToolUse');
      expect(preHook).toBeDefined();
      expect(preHook!.matcher).toBe('*');
      expect(preHook!.type).toBe('prompt');
    });

    it('should return empty when no settings exist', async () => {
      const { discoverAllHooks } = await import('../../../src/sdk/hooks-loader.js');
      const hooks = discoverAllHooks();
      const projectHooks = hooks.filter(h => h.source === 'project');
      expect(projectHooks.length).toBe(0);
    });

    it('should handle malformed settings gracefully', async () => {
      fs.mkdirSync(path.join(tmpDir, '.claude'), { recursive: true });
      fs.writeFileSync(path.join(tmpDir, '.claude', 'settings.json'), 'not json');

      const { discoverAllHooks } = await import('../../../src/sdk/hooks-loader.js');
      const hooks = discoverAllHooks();
      const projectHooks = hooks.filter(h => h.source === 'project');
      expect(projectHooks.length).toBe(0);
    });
  });

  describe('getHooksSummary', () => {
    it('should return a summary string', async () => {
      const { getHooksSummary } = await import('../../../src/sdk/hooks-loader.js');
      const summary = getHooksSummary();
      // May find user-level hooks on the test machine, just verify it returns a string
      expect(typeof summary).toBe('string');
      expect(summary.length).toBeGreaterThan(0);
    });
  });
});
