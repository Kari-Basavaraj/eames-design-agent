#!/usr/bin/env bun
/**
 * Direct agent run for testing - bypasses CLI/Ink to capture output.
 * Run: bun run scripts/run-todo-test.ts
 */
import { config } from 'dotenv';
import { Agent } from '../src/agent/orchestrator.js';
import { MessageHistory } from '../src/utils/message-history.js';

config({ quiet: true });

const query = 'Create a simple todo app with React. Scaffold a new project, add a basic todo list component with add/complete/delete, and run the dev server.';

async function main() {
  console.log('Eames Todo App Test');
  console.log('==================');
  console.log('Query:', query);
  console.log('');

  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('ANTHROPIC_API_KEY required. Set in .env or ~/.eames/config.json');
    process.exit(1);
  }

  const messageHistory = new MessageHistory('claude-sonnet-4-5-20250929');
  const agent = new Agent({
    model: 'claude-sonnet-4-5-20250929',
    callbacks: {
      onPhaseStart: (p) => console.log(`[Phase] ${p}`),
      onPhaseComplete: (p) => console.log(`[Phase] ${p} complete`),
      onPlanCreated: (plan) => console.log(`[Plan] ${plan.tasks.length} tasks`),
      onProgressMessage: (msg) => console.log(`  → ${msg}`),
      onAnswerStream: async function* (stream) {
        for await (const chunk of stream) {
          process.stdout.write(chunk);
        }
      },
    },
  });

  try {
    const answer = await agent.run(query, messageHistory);
    if (answer) console.log(answer);
    console.log('\n\nDone.');
  } catch (e) {
    console.error('\nError:', e);
    process.exit(1);
  }
}

main();
