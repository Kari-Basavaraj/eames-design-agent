// Updated: 2026-02-16
// SDK env (OpenRouter) unit tests

import { describe, it, expect, beforeEach, afterEach } from 'bun:test';
import { buildSdkEnvForModel, isOpenRouterKeyMissing } from '../../../src/utils/sdk-env.js';

const ORIG = { ...process.env };

beforeEach(() => {
  delete process.env.OPENROUTER_API_KEY;
  delete process.env.OPENAI_API_KEY;
});

afterEach(() => {
  process.env = { ...ORIG };
});

describe('buildSdkEnvForModel', () => {
  it('returns undefined for Anthropic model', () => {
    expect(buildSdkEnvForModel('claude-sonnet-4-5-20250929')).toBeUndefined();
    expect(buildSdkEnvForModel('claude-3-5-sonnet-20241022')).toBeUndefined();
  });

  it('returns undefined for openai model when no key', () => {
    expect(buildSdkEnvForModel('openai/gpt-5.2')).toBeUndefined();
  });

  it('returns OpenRouter env when openai model and OPENROUTER_API_KEY set', () => {
    process.env.OPENROUTER_API_KEY = 'sk-xxx';
    const env = buildSdkEnvForModel('openai/gpt-5.2');
    expect(env).toBeDefined();
    expect(env!.ANTHROPIC_BASE_URL).toBe('https://openrouter.ai/api');
    expect(env!.ANTHROPIC_AUTH_TOKEN).toBe('sk-xxx');
    expect(env!.ANTHROPIC_API_KEY).toBe('');
  });

  it('uses OPENAI_API_KEY as fallback when OPENROUTER_API_KEY not set', () => {
    process.env.OPENAI_API_KEY = 'sk-openai';
    const env = buildSdkEnvForModel('openai/gpt-4.1');
    expect(env).toBeDefined();
    expect(env!.ANTHROPIC_AUTH_TOKEN).toBe('sk-openai');
  });

  it('returns OpenRouter env for google model when key set', () => {
    process.env.OPENROUTER_API_KEY = 'sk-gg';
    const env = buildSdkEnvForModel('google/gemini-2.0-flash');
    expect(env).toBeDefined();
    expect(env!.ANTHROPIC_BASE_URL).toBe('https://openrouter.ai/api');
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
    process.env.OPENROUTER_API_KEY = 'sk-x';
    expect(isOpenRouterKeyMissing('openai/gpt-5.2')).toBe(false);
  });

  it('returns false when OPENAI_API_KEY set (fallback)', () => {
    process.env.OPENAI_API_KEY = 'sk-y';
    expect(isOpenRouterKeyMissing('openai/gpt-4.1')).toBe(false);
  });
});
