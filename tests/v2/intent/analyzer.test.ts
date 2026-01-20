// Updated: 2026-01-18 14:05:00
// Tests for Intent Analyzer (Stage 0)

import { describe, it, expect, beforeEach } from 'bun:test';
import { IntentAnalyzer, type IntentAnalysis, isVague, isClear, formatAnalysis } from '../../../src/v2/intent/analyzer.js';

describe('IntentAnalyzer', () => {
  let analyzer: IntentAnalyzer;

  beforeEach(() => {
    analyzer = new IntentAnalyzer({ offline: true });
  });

  describe('Vague Queries (should route to ASK mode)', () => {
    it('should detect very vague query', async () => {
      const result = await analyzer.analyze('Build a fintech app');
      
      expect(result.clarity_score).toBeLessThan(0.4);
      expect(result.recommended_mode).toBe('ask');
      expect(result.context_level).toMatch(/none|partial/);
      expect(result.missing_context).toBeDefined();
      expect(result.missing_context!.length).toBeGreaterThan(0);
    }, 30000); // 30s timeout for LLM call

    it('should detect generic request', async () => {
      const result = await analyzer.analyze('Design something cool');
      
      expect(result.clarity_score).toBeLessThan(0.4);
      expect(result.recommended_mode).toBe('ask');
    }, 30000);
  });

  describe('Partial Clarity Queries (should route to PLAN mode)', () => {
    it('should detect query with some context', async () => {
      const result = await analyzer.analyze('Design a split-bill feature for college students');
      
      expect(result.clarity_score).toBeGreaterThanOrEqual(0.4);
      expect(result.clarity_score).toBeLessThan(0.8);
      expect(result.recommended_mode).toBe('plan');
      expect(result.domain).toMatch(/design|define/);
    }, 30000);

    it('should detect PRD request', async () => {
      const result = await analyzer.analyze('Create a PRD for mobile onboarding');
      
      expect(result.recommended_mode).toBe('plan');
      expect(result.domain).toBe('define');
      expect(result.deliverable).toContain('PRD');
    }, 30000);
  });

  describe('Clear Queries (should route to EXECUTE mode)', () => {
    it('should detect specific research query', async () => {
      const result = await analyzer.analyze('Research how Venmo implements split bill feature');
      
      expect(result.clarity_score).toBeGreaterThanOrEqual(0.8);
      expect(result.recommended_mode).toBe('execute');
      expect(result.domain).toBe('discovery');
    }, 30000);

    it('should detect code conversion request', async () => {
      const result = await analyzer.analyze('Convert this Figma design to React components');
      
      expect(result.recommended_mode).toBe('execute');
      expect(result.domain).toBe('develop');
    }, 30000);
  });

  describe('Helper Functions', () => {
    it('isVague should correctly identify vague queries', () => {
      const vague: IntentAnalysis = {
        query: 'test',
        clarity_score: 0.3,
        context_level: 'none',
        domain: 'general',
        deliverable: 'unknown',
        recommended_mode: 'ask',
        reasoning: 'test',
        missing_context: ['problem', 'user']
      };
      
      expect(isVague(vague)).toBe(true);
    });

    it('isClear should correctly identify clear queries', () => {
      const clear: IntentAnalysis = {
        query: 'test',
        clarity_score: 0.9,
        context_level: 'complete',
        domain: 'discovery',
        deliverable: 'research report',
        recommended_mode: 'execute',
        reasoning: 'test'
      };
      
      expect(isClear(clear)).toBe(true);
    });

    it('formatAnalysis should produce readable output', () => {
      const analysis: IntentAnalysis = {
        query: 'test',
        clarity_score: 0.7,
        context_level: 'partial',
        domain: 'design',
        deliverable: 'wireframes',
        recommended_mode: 'plan',
        reasoning: 'Has target user and feature but missing specifics',
        missing_context: ['technical constraints']
      };
      
      const formatted = formatAnalysis(analysis);
      
      expect(formatted).toContain('Intent Analysis');
      expect(formatted).toContain('70%');
      expect(formatted).toContain('PLAN');
      expect(formatted).toContain('Missing');
    });
  });
});
