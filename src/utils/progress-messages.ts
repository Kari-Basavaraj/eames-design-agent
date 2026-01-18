// Updated: 2026-01-18 04:45:00
/**
 * Fun, Claude Code-style progress messages
 * Rotating messages to keep the UI engaging during long operations
 */

export const PHASE_MESSAGES = {
  understand: [
    'Pondering your request...',
    'Reading between the lines...',
    'Decoding intent...',
    'Understanding the mission...',
    'Grokking the query...',
  ],
  plan: [
    'Strategizing...',
    'Plotting the course...',
    'Mapping out tasks...',
    'Orchestrating the plan...',
    'Drafting the blueprint...',
  ],
  execute: [
    'Making it happen...',
    'Rolling up sleeves...',
    'Executing with precision...',
    'Getting things done...',
    'Working the magic...',
  ],
  reflect: [
    'Contemplating results...',
    'Checking the work...',
    'Evaluating progress...',
    'Taking stock...',
    'Reflecting deeply...',
  ],
  answer: [
    'Synthesizing findings...',
    'Crafting response...',
    'Assembling insights...',
    'Weaving it together...',
    'Putting the bow on it...',
  ],
};

export const TASK_MESSAGES = [
  'Cogitating...',
  'Ruminating...',
  'Noodling on this...',
  'Deep in thought...',
  'Processing...',
  'Crunching data...',
  'Connecting dots...',
  'Following threads...',
  'Investigating...',
  'Searching high and low...',
];

export const TOOL_MESSAGES = {
  search: [
    'Scouring the web...',
    'Hunting for insights...',
    'Digging deep...',
    'Following the trail...',
  ],
  read: [
    'Reading carefully...',
    'Parsing content...',
    'Absorbing information...',
  ],
  write: [
    'Drafting...',
    'Composing...',
    'Writing it down...',
  ],
  edit: [
    'Polishing...',
    'Refining...',
    'Improving...',
  ],
};

/**
 * Get a random message from an array
 */
function getRandomMessage(messages: string[]): string {
  return messages[Math.floor(Math.random() * messages.length)];
}

/**
 * Get a fun progress message for a phase
 */
export function getPhaseMessage(phase: string): string {
  const messages = PHASE_MESSAGES[phase as keyof typeof PHASE_MESSAGES];
  return messages ? getRandomMessage(messages) : 'Working...';
}

/**
 * Get a fun task progress message
 */
export function getTaskMessage(): string {
  return getRandomMessage(TASK_MESSAGES);
}

/**
 * Get a fun tool-specific message
 */
export function getToolMessage(toolName: string): string {
  if (toolName.includes('search')) {
    return getRandomMessage(TOOL_MESSAGES.search);
  }
  if (toolName.includes('read')) {
    return getRandomMessage(TOOL_MESSAGES.read);
  }
  if (toolName.includes('write') || toolName.includes('create')) {
    return getRandomMessage(TOOL_MESSAGES.write);
  }
  if (toolName.includes('edit') || toolName.includes('update')) {
    return getRandomMessage(TOOL_MESSAGES.edit);
  }
  return 'Working...';
}
