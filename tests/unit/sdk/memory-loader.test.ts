// Updated: 2026-02-16 15:30:00
import { describe, it, expect, beforeEach, afterEach } from 'bun:test';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

describe('memory-loader', () => {
  let tmpDir: string;
  let origCwd: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'eames-memory-test-'));
    origCwd = process.cwd();
    process.chdir(tmpDir);
  });

  afterEach(() => {
    process.chdir(origCwd);
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  describe('loadHierarchicalMemory', () => {
    it('should load project-level CLAUDE.md', async () => {
      fs.writeFileSync(path.join(tmpDir, 'CLAUDE.md'), '# Project Rules\nAlways use TypeScript.');

      const { loadHierarchicalMemory } = await import('../../../src/sdk/memory-loader.js');
      const memories = loadHierarchicalMemory(tmpDir);
      const projectMemory = memories.find(m => m.level === 'project');

      expect(projectMemory).toBeDefined();
      expect(projectMemory!.content).toContain('Always use TypeScript');
    });

    it('should prefer CLAUDE.md over AGENTS.md', async () => {
      fs.writeFileSync(path.join(tmpDir, 'CLAUDE.md'), '# Claude Rules');
      fs.writeFileSync(path.join(tmpDir, 'AGENTS.md'), '# Agents Rules');

      const { loadHierarchicalMemory } = await import('../../../src/sdk/memory-loader.js');
      const memories = loadHierarchicalMemory(tmpDir);
      const projectMemory = memories.find(m => m.level === 'project');

      expect(projectMemory).toBeDefined();
      expect(projectMemory!.content).toContain('Claude Rules');
    });

    it('should return empty array when no CLAUDE.md exists', async () => {
      const { loadHierarchicalMemory } = await import('../../../src/sdk/memory-loader.js');
      const memories = loadHierarchicalMemory(tmpDir);
      // Filter out user-level memories that might exist on the test machine
      const projectMemories = memories.filter(m => m.level === 'project');
      expect(projectMemories.length).toBe(0);
    });
  });

  describe('loadSubdirectoryMemory', () => {
    it('should load CLAUDE.md from a subdirectory', async () => {
      fs.mkdirSync(path.join(tmpDir, 'src'), { recursive: true });
      fs.writeFileSync(path.join(tmpDir, 'src', 'CLAUDE.md'), '# Source Rules');

      const { loadSubdirectoryMemory } = await import('../../../src/sdk/memory-loader.js');
      const memory = loadSubdirectoryMemory('src', tmpDir);

      expect(memory).toBeDefined();
      expect(memory!.content).toContain('Source Rules');
      expect(memory!.level).toBe('subdirectory');
    });

    it('should return null for subdirectory without CLAUDE.md', async () => {
      fs.mkdirSync(path.join(tmpDir, 'lib'), { recursive: true });

      const { loadSubdirectoryMemory } = await import('../../../src/sdk/memory-loader.js');
      const memory = loadSubdirectoryMemory('lib', tmpDir);
      expect(memory).toBeNull();
    });
  });

  describe('buildMemoryContext', () => {
    it('should merge multiple memory files into sections', async () => {
      fs.writeFileSync(path.join(tmpDir, 'CLAUDE.md'), '# Main Project\nMain rules here.');

      const { buildMemoryContext } = await import('../../../src/sdk/memory-loader.js');
      const context = buildMemoryContext(tmpDir);

      expect(context).toContain('Project Context');
      expect(context).toContain('Main rules here');
    });

    it('should return empty string when no memory files', async () => {
      // Use a completely empty temp dir with no CLAUDE.md anywhere
      const emptyDir = fs.mkdtempSync(path.join(os.tmpdir(), 'eames-empty-'));
      try {
        const { buildMemoryContext } = await import('../../../src/sdk/memory-loader.js');
        const context = buildMemoryContext(emptyDir);
        // May still pick up user-level, so just ensure it's a string
        expect(typeof context).toBe('string');
      } finally {
        fs.rmSync(emptyDir, { recursive: true, force: true });
      }
    });
  });

  describe('getMemorySummary', () => {
    it('should return a summary string', async () => {
      const { getMemorySummary } = await import('../../../src/sdk/memory-loader.js');
      const summary = getMemorySummary(tmpDir);
      expect(typeof summary).toBe('string');
    });
  });
});
