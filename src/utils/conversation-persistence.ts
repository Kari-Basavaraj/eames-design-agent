// Updated: 2026-01-12 01:35:00
// Eames Design Agent - Conversation Persistence
// Save and restore conversations like Claude Code

import { existsSync, mkdirSync, readFileSync, writeFileSync, readdirSync, unlinkSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';
import type { MessageParam } from '@anthropic-ai/sdk/resources/messages';

const EAMES_DIR = join(homedir(), '.eames');
const CONVERSATIONS_DIR = join(EAMES_DIR, 'conversations');

// Ensure directories exist
function ensureDirectories(): void {
  if (!existsSync(EAMES_DIR)) {
    mkdirSync(EAMES_DIR, { recursive: true });
  }
  if (!existsSync(CONVERSATIONS_DIR)) {
    mkdirSync(CONVERSATIONS_DIR, { recursive: true });
  }
}

/**
 * Conversation metadata
 */
export interface ConversationMeta {
  id: string;
  title: string;
  created: number;
  updated: number;
  messageCount: number;
  projectPath?: string;
}

/**
 * Full conversation with messages
 */
export interface Conversation {
  meta: ConversationMeta;
  messages: MessageParam[];
}

/**
 * Generate a unique conversation ID
 */
export function generateConversationId(): string {
  return `conv-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * Get the file path for a conversation
 */
function getConversationPath(id: string): string {
  return join(CONVERSATIONS_DIR, `${id}.json`);
}

/**
 * Save a conversation to disk
 */
export function saveConversation(conversation: Conversation): void {
  ensureDirectories();
  const path = getConversationPath(conversation.meta.id);
  writeFileSync(path, JSON.stringify(conversation, null, 2));
}

/**
 * Load a conversation from disk
 */
export function loadConversation(id: string): Conversation | null {
  const path = getConversationPath(id);
  if (!existsSync(path)) {
    return null;
  }
  try {
    const data = readFileSync(path, 'utf-8');
    return JSON.parse(data) as Conversation;
  } catch {
    return null;
  }
}

/**
 * List all saved conversations
 */
export function listConversations(): ConversationMeta[] {
  ensureDirectories();
  const files = readdirSync(CONVERSATIONS_DIR).filter(f => f.endsWith('.json'));
  const conversations: ConversationMeta[] = [];

  for (const file of files) {
    try {
      const path = join(CONVERSATIONS_DIR, file);
      const data = readFileSync(path, 'utf-8');
      const conv = JSON.parse(data) as Conversation;
      conversations.push(conv.meta);
    } catch {
      // Skip invalid files
    }
  }

  // Sort by updated time, newest first
  return conversations.sort((a, b) => b.updated - a.updated);
}

/**
 * Delete a conversation
 */
export function deleteConversation(id: string): boolean {
  const path = getConversationPath(id);
  if (existsSync(path)) {
    unlinkSync(path);
    return true;
  }
  return false;
}

/**
 * Get the most recent conversation for a project path
 */
export function getRecentConversation(projectPath?: string): Conversation | null {
  const conversations = listConversations();

  if (projectPath) {
    // Find most recent for this project
    const projectConv = conversations.find(c => c.projectPath === projectPath);
    if (projectConv) {
      return loadConversation(projectConv.id);
    }
  }

  // Return most recent overall
  if (conversations.length > 0) {
    return loadConversation(conversations[0].id);
  }

  return null;
}

/**
 * Create a new conversation
 */
export function createConversation(
  messages: MessageParam[] = [],
  projectPath?: string
): Conversation {
  const id = generateConversationId();
  const now = Date.now();

  // Generate title from first user message
  let title = 'New conversation';
  const firstUserMessage = messages.find(m => m.role === 'user');
  if (firstUserMessage && typeof firstUserMessage.content === 'string') {
    title = firstUserMessage.content.slice(0, 50) + (firstUserMessage.content.length > 50 ? '...' : '');
  }

  const conversation: Conversation = {
    meta: {
      id,
      title,
      created: now,
      updated: now,
      messageCount: messages.length,
      projectPath,
    },
    messages,
  };

  saveConversation(conversation);
  return conversation;
}

/**
 * Update an existing conversation with new messages
 */
export function updateConversation(
  id: string,
  messages: MessageParam[]
): Conversation | null {
  const existing = loadConversation(id);
  if (!existing) {
    return null;
  }

  const updated: Conversation = {
    meta: {
      ...existing.meta,
      updated: Date.now(),
      messageCount: messages.length,
    },
    messages,
  };

  saveConversation(updated);
  return updated;
}

/**
 * Compact a conversation by summarizing old messages
 * Keeps recent messages and creates a summary of older ones
 */
export function compactConversation(
  id: string,
  keepRecentCount: number = 10
): Conversation | null {
  const existing = loadConversation(id);
  if (!existing || existing.messages.length <= keepRecentCount) {
    return existing;
  }

  const oldMessages = existing.messages.slice(0, -keepRecentCount);
  const recentMessages = existing.messages.slice(-keepRecentCount);

  // Create a summary message
  const summaryContent = `[Conversation compacted. Previous ${oldMessages.length} messages summarized.]`;

  const compactedMessages: MessageParam[] = [
    { role: 'user', content: '[Previous conversation context]' },
    { role: 'assistant', content: summaryContent },
    ...recentMessages,
  ];

  const updated: Conversation = {
    meta: {
      ...existing.meta,
      updated: Date.now(),
      messageCount: compactedMessages.length,
    },
    messages: compactedMessages,
  };

  saveConversation(updated);
  return updated;
}

/**
 * Get session file path (for current working directory context)
 */
export function getSessionPath(): string {
  return join(EAMES_DIR, 'current-session.json');
}

/**
 * Save current session ID
 */
export function saveCurrentSession(conversationId: string): void {
  ensureDirectories();
  const sessionData = {
    conversationId,
    cwd: process.cwd(),
    timestamp: Date.now(),
  };
  writeFileSync(getSessionPath(), JSON.stringify(sessionData, null, 2));
}

/**
 * Load current session
 */
export function loadCurrentSession(): { conversationId: string; cwd: string } | null {
  const path = getSessionPath();
  if (!existsSync(path)) {
    return null;
  }
  try {
    const data = readFileSync(path, 'utf-8');
    return JSON.parse(data);
  } catch {
    return null;
  }
}
