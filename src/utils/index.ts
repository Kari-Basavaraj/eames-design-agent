// Updated: 2026-01-12 04:30:00
// Eames Design Agent - Utils Index
// All utility exports

export { loadConfig, saveConfig, getSetting, setSetting } from './config.js';
export {
  getApiKeyNameForProvider,
  getProviderDisplayName,
  checkApiKeyExists,
  checkApiKeyExistsForProvider,
  saveApiKeyToEnv,
  saveApiKeyForProvider,
} from './env.js';
export { ToolContextManager } from './context.js';
export { MessageHistory } from './message-history.js';

// New UX utilities
export * from './vim-mode.js';
export * from './tab-completion.js';
export * from './syntax-highlight.js';
export * from './git-status.js';
export * from './undo-system.js';
export * from './session-export.js';
export * from './command-palette.js';
export * from './history-search.js';
export * from './notifications.js';
export * from './themes.js';
export * from './fuzzy-finder.js';
export * from './bookmarks.js';
export * from './clipboard.js';
export * from './streaming-progress.js';
export * from './breadcrumbs.js';
export * from './token-budget.js';
export * from './file-preview.js';

