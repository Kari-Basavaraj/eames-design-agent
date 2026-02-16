// Updated: 2026-02-16 15:00:00
/**
 * Application state for the CLI
 */
export type AppState = 
  | 'setup'            // First-run setup (API key wizard)
  | 'idle' 
  | 'running' 
  | 'provider_select'  // Selecting LLM provider
  | 'model_select'     // Selecting model for the chosen provider
  | 'api_key_confirm' 
  | 'api_key_input'
  | 'plugin_manager'   // Interactive plugin management
  | 'mcp_manager'      // Interactive MCP server management
  | 'session_picker'   // Session picker for /resume
  | 'skills_manager'   // Skills browser
  | 'hooks_manager'    // Hooks browser
  | 'agents_manager';  // Subagents browser

/**
 * Generate a unique ID for turns
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}
