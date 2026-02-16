// Updated: 2026-02-16
import { describe, it, expect, beforeEach, afterEach } from 'bun:test';
import { buildSdkEnvForModel, isOpenRouterKeyMissing } from '../../../src/sdk/env.js';

const ORIG = { ...process.env };

beforeEach(() => {
  delete process.env.OPENROUTER_API_KEY;
});

afterEach(() => {
  process.env = { ...ORIG };
});

describe('buildSdkEnvForModel', () => {
  it('returns undefined for Anthropic model', () => {
    expect(buildSdkEnvForModel('claude-sonnet-4-5-20250929')).toBeUndefined();
  });

  it('returns undefined for openai model when no OPENROUTER_API_KEY', () => {
    expect(buildSdkEnvForModel('openai/gpt-5.2')).toBeUndefined();
  });

  it('returns OpenRouter env when openai model and OPENROUTER_API_KEY set', () => {
    process.env.OPENROUTER_API_KEY = 'sk-or-xxx';
    const env = buildSdkEnvForModel('openai/gpt-5.2');
    expect(env).toBeDefined();
    expect(env!.ANTHROPIC_BASE_URL).toBe('https://openrouter.ai/api');
    expect(env!.ANTHROPIC_AUTH_TOKEN).toBe('sk-or-xxx');
    expect(env!.ANTHROPIC_API_KEY).toBe('');
  });
});

describe('isOpenRouterKeyMissing', () => {
  it('returns false for Anthropic model', () => {
    expect(isOpenRouterKeyMissing('claude-sonnet-4-5')).toBe(false);
  });

  it('returns true for openai model when no key', () => {
    expect(isOpenRouterKeyMissing('openai/gpt-5.2')).toBe(true);
  });

  it('returns false when OPENROUTER_API_KEY set', () => {
    process.env.OPENROUTER_API_KEY = 'sk-or-x';
    expect(isOpenRouterKeyMissing('openai/gpt-5.2')).toBe(false);
  });
});
