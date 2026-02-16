// Updated: 2026-02-16
// SDK TUI state reducer - maps SDK messages to display state

import { describe, it, expect } from 'bun:test';
import { reduceSdkMessageToState, INITIAL_SDK_TUI_STATE } from '../../../src/utils/sdk-tui-state.js';

describe('reduceSdkMessageToState', () => {
  it('returns null for unknown message types', () => {
    expect(reduceSdkMessageToState({ type: 'unknown' }, INITIAL_SDK_TUI_STATE)).toBeNull();
  });

  it('maps tool_progress to statusLine with tool_name and elapsed', () => {
    const r = reduceSdkMessageToState(
      { type: 'tool_progress', tool_name: 'Bash', elapsed_time_seconds: 2 },
      INITIAL_SDK_TUI_STATE
    );
    expect(r).toEqual({ statusLine: 'Bash 2s' });
  });

  it('maps content_block_start tool_use to statusLine', () => {
    const r = reduceSdkMessageToState(
      { type: 'stream_event', event: { type: 'content_block_start', content_block: { type: 'tool_use', name: 'Read' } } },
      INITIAL_SDK_TUI_STATE
    );
    expect(r).toEqual({ statusLine: 'Read' });
  });

  it('maps content_block_delta text_delta to answerText', () => {
    const prev = { ...INITIAL_SDK_TUI_STATE, answerText: 'Hello ' };
    const r = reduceSdkMessageToState(
      { type: 'stream_event', event: { type: 'content_block_delta', delta: { type: 'text_delta', text: 'world' } } },
      prev
    );
    expect(r).toEqual({ answerText: 'Hello world', isStreaming: true });
  });

  it('maps result to final answer and clears status', () => {
    const prev = { ...INITIAL_SDK_TUI_STATE, answerText: 'Hi', statusLine: 'Bash', isStreaming: true };
    const r = reduceSdkMessageToState({ type: 'result', result: 'Done' }, prev);
    expect(r).toEqual({ statusLine: null, isStreaming: false, answerText: 'Done' });
  });

  it('skips system/init (model shown in SdkIntro)', () => {
    const r = reduceSdkMessageToState(
      { type: 'system', subtype: 'init', model: 'claude-sonnet-4' },
      INITIAL_SDK_TUI_STATE
    );
    expect(r).toBeNull();
  });
});
