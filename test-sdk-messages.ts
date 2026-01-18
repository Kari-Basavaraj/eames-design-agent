#!/usr/bin/env bun
// Test script to inspect SDK messages
import { query } from '@anthropic-ai/claude-agent-sdk';

const messages: any[] = [];

const q = query({
  prompt: 'List files in the current directory',
  options: {
    model: 'claude-sonnet-4-5-20250929',
    tools: { type: 'preset', preset: 'claude_code' },
    permissionMode: 'bypassPermissions',
    allowDangerouslySkipPermissions: true,
    cwd: process.cwd(),
    env: process.env,
  },
});

console.log('Starting query...\n');

for await (const message of q) {
  messages.push(message);
  console.log(`\n=== Message ${messages.length} ===`);
  console.log('Type:', message.type);
  
  if (message.type === 'assistant' && message.message?.content) {
    console.log('Content blocks:', message.message.content.length);
    for (const block of message.message.content) {
      console.log('  - Block type:', block.type);
      if (block.type === 'tool_use') {
        console.log('    Tool:', block.name, 'ID:', block.id);
        console.log('    Input:', JSON.stringify(block.input).slice(0, 100));
      } else if (block.type === 'text') {
        console.log('    Text:', block.text?.slice(0, 80));
      }
    }
  } else if (message.type === 'tool_result') {
    console.log('Tool result ID:', message.tool_use_id);
    console.log('Error?:', message.is_error);
  } else if (message.type === 'result') {
    console.log('Subtype:', message.subtype);
    console.log('Result:', typeof message.result === 'string' ? message.result.slice(0, 100) : message.result);
  }
}

console.log('\n\nTotal messages:', messages.length);
