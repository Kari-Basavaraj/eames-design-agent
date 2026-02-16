// Updated: 2026-01-12 15:35:00
// SDK Agent Unit Tests

import { describe, it, expect, beforeEach, mock, spyOn } from 'bun:test';
import { SdkAgent, createSdkAgent } from '../../../src/sdk/agent.js';

describe('SdkAgent', () => {
  describe('constructor', () => {
    it('should create instance with required model parameter', () => {
      const agent = new SdkAgent({ model: 'claude-sonnet-4-5-20250929' });
      expect(agent).toBeDefined();
    });

    it('should accept optional callbacks', () => {
      const callbacks = {
        onProgressMessage: () => {},
        onText: () => {},
      };

      const agent = new SdkAgent({
        model: 'claude-sonnet-4-5-20250929',
        callbacks,
      });

      expect(agent).toBeDefined();
    });

    it('should accept optional abort signal', () => {
      const controller = new AbortController();
      const agent = new SdkAgent({
        model: 'claude-sonnet-4-5-20250929',
        signal: controller.signal,
      });

      expect(agent).toBeDefined();
    });

    it('should accept optional system prompt', () => {
      const customPrompt = 'You are a test agent.';
      const agent = new SdkAgent({
        model: 'claude-sonnet-4-5-20250929',
        systemPrompt: customPrompt,
      });

      expect(agent).toBeDefined();
    });
  });

  describe('createSdkAgent factory', () => {
    it('should create SdkAgent instance', () => {
      const agent = createSdkAgent({ model: 'claude-sonnet-4-5-20250929' });
      expect(agent).toBeInstanceOf(SdkAgent);
    });
  });

  describe('cancel', () => {
    it('should not throw when called without active query', async () => {
      const agent = new SdkAgent({ model: 'claude-sonnet-4-5-20250929' });

      // Should not throw
      await expect(agent.cancel()).resolves.toBeUndefined();
    });
  });
});

describe('SdkAgent integration', () => {
  // These tests require mocking the Claude Agent SDK
  // TODO: Add integration tests when SDK mock is available

  it.skip('should execute query and return result', async () => {
    // Will be implemented with SDK mocking
  });

  it.skip('should call callbacks during execution', async () => {
    // Will be implemented with SDK mocking
  });

  it.skip('should handle cancellation gracefully', async () => {
    // Will be implemented with SDK mocking
  });
});
