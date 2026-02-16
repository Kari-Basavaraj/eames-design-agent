// Updated: 2026-02-16 15:30:00
import { describe, it, expect, beforeEach, afterEach } from 'bun:test';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

// We test the loader functions by creating temp directories with skill files
describe('skills-loader', () => {
  let tmpDir: string;
  let origCwd: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'eames-skills-test-'));
    origCwd = process.cwd();
    process.chdir(tmpDir);
  });

  afterEach(() => {
    process.chdir(origCwd);
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  describe('frontmatter parsing', () => {
    it('should parse a skill file with frontmatter', async () => {
      // Create project skills dir
      fs.mkdirSync(path.join(tmpDir, '.claude', 'skills', 'my-skill'), { recursive: true });
      fs.writeFileSync(
        path.join(tmpDir, '.claude', 'skills', 'my-skill', 'SKILL.md'),
        `---
name: MySkill
description: A test skill
allowed-tools: Bash,Edit
context: fork
---
This is the skill body content.`
      );

      const { discoverAllSkills } = await import('../../../src/sdk/skills-loader.js');
      const skills = discoverAllSkills();
      const projectSkills = skills.filter(s => s.source === 'project');

      expect(projectSkills.length).toBeGreaterThanOrEqual(1);
      const skill = projectSkills.find(s => s.name === 'MySkill');
      expect(skill).toBeDefined();
      expect(skill!.description).toBe('A test skill');
      expect(skill!.frontmatter['allowed-tools']).toBe('Bash,Edit');
      expect(skill!.frontmatter.context).toBe('fork');
      expect(skill!.modelInvocable).toBe(true);
    });

    it('should detect non-model-invocable skills', async () => {
      fs.mkdirSync(path.join(tmpDir, '.claude', 'skills', 'manual-skill'), { recursive: true });
      fs.writeFileSync(
        path.join(tmpDir, '.claude', 'skills', 'manual-skill', 'SKILL.md'),
        `---
name: ManualOnly
disable-model-invocation: true
---
Only triggered by user.`
      );

      const { discoverAllSkills } = await import('../../../src/sdk/skills-loader.js');
      const skills = discoverAllSkills();
      const skill = skills.find(s => s.name === 'ManualOnly');
      expect(skill).toBeDefined();
      expect(skill!.modelInvocable).toBe(false);
    });

    it('should detect action skills via $ARGUMENTS', async () => {
      fs.mkdirSync(path.join(tmpDir, '.claude', 'skills', 'action-skill'), { recursive: true });
      fs.writeFileSync(
        path.join(tmpDir, '.claude', 'skills', 'action-skill', 'SKILL.md'),
        `---
name: Deployer
argument-hint: <environment>
---
Deploy to $ARGUMENTS environment.`
      );

      const { discoverAllSkills } = await import('../../../src/sdk/skills-loader.js');
      const skills = discoverAllSkills();
      const skill = skills.find(s => s.name === 'Deployer');
      expect(skill).toBeDefined();
      expect(skill!.isAction).toBe(true);
    });
  });

  describe('loadSkillContent', () => {
    it('should return body without frontmatter', async () => {
      fs.mkdirSync(path.join(tmpDir, '.claude', 'skills', 'content-test'), { recursive: true });
      const skillPath = path.join(tmpDir, '.claude', 'skills', 'content-test', 'SKILL.md');
      fs.writeFileSync(
        skillPath,
        `---
name: ContentTest
---
The actual skill content here.`
      );

      const { loadSkillContent } = await import('../../../src/sdk/skills-loader.js');
      const content = loadSkillContent(skillPath);
      expect(content).toBe('The actual skill content here.');
    });

    it('should return null for missing files', async () => {
      const { loadSkillContent } = await import('../../../src/sdk/skills-loader.js');
      expect(loadSkillContent('/nonexistent/SKILL.md')).toBeNull();
    });
  });

  describe('getSkillsSummary', () => {
    it('should return a summary string', async () => {
      const { getSkillsSummary } = await import('../../../src/sdk/skills-loader.js');
      const summary = getSkillsSummary();
      // May find user-level skills on the test machine, just verify it returns a string
      expect(typeof summary).toBe('string');
      expect(summary.length).toBeGreaterThan(0);
    });
  });
});
