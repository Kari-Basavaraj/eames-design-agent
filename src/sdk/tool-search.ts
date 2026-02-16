// Updated: 2026-02-16 16:00:00
// Eames Design Agent - Tool Search
// Claude Code parity: search/filter large MCP tool sets
// When tool count exceeds threshold, provides fuzzy search to find relevant tools

// ============================================================================
// Types
// ============================================================================

export interface ToolInfo {
  /** Tool name */
  name: string;
  /** Tool description */
  description: string;
  /** Source MCP server name */
  server: string;
  /** Input schema summary */
  inputSummary?: string;
}

export interface ToolSearchResult {
  /** Matched tools */
  tools: ToolInfo[];
  /** Total tools available */
  totalCount: number;
  /** Whether search was needed (> threshold) */
  wasFiltered: boolean;
}

// ============================================================================
// Constants
// ============================================================================

/** When tool count exceeds this, we search/filter instead of loading all */
const SEARCH_THRESHOLD = 50;

/** Max tools to include in context (Claude Code uses ~10% of context window) */
const MAX_TOOLS_IN_CONTEXT = 128;

// ============================================================================
// Tool Registry
// ============================================================================

let toolRegistry: ToolInfo[] = [];

/**
 * Register tools from an MCP server.
 * Call this when MCP servers are initialized.
 */
export function registerMcpTools(serverName: string, tools: Array<{ name: string; description?: string; inputSchema?: unknown }>): void {
  for (const tool of tools) {
    const existing = toolRegistry.find(t => t.name === tool.name && t.server === serverName);
    if (!existing) {
      toolRegistry.push({
        name: tool.name,
        description: tool.description || '',
        server: serverName,
        inputSummary: tool.inputSchema ? summarizeSchema(tool.inputSchema) : undefined,
      });
    }
  }
}

/**
 * Register built-in tools (Bash, Read, Write, Edit, etc.)
 */
export function registerBuiltinTools(): void {
  const builtins: Array<{ name: string; description: string }> = [
    { name: 'Bash', description: 'Execute shell commands' },
    { name: 'Read', description: 'Read file contents' },
    { name: 'Write', description: 'Write content to a file' },
    { name: 'Edit', description: 'Edit a file with search and replace' },
    { name: 'MultiEdit', description: 'Edit multiple files at once' },
    { name: 'Glob', description: 'Find files matching a pattern' },
    { name: 'Grep', description: 'Search file contents with regex' },
    { name: 'LS', description: 'List directory contents' },
    { name: 'WebFetch', description: 'Fetch content from a URL' },
    { name: 'WebSearch', description: 'Search the web' },
    { name: 'TodoRead', description: 'Read todo list' },
    { name: 'TodoWrite', description: 'Update todo list' },
    { name: 'NotebookEdit', description: 'Edit Jupyter notebooks' },
    { name: 'AskUserQuestion', description: 'Ask the user a question' },
  ];

  for (const tool of builtins) {
    const existing = toolRegistry.find(t => t.name === tool.name && t.server === 'builtin');
    if (!existing) {
      toolRegistry.push({ ...tool, server: 'builtin' });
    }
  }
}

/**
 * Clear all registered tools.
 */
export function clearToolRegistry(): void {
  toolRegistry = [];
}

/**
 * Get count of registered tools.
 */
export function getToolCount(): number {
  return toolRegistry.length;
}

// ============================================================================
// Search
// ============================================================================

/**
 * Search for tools matching a query.
 * Uses fuzzy matching on name and description.
 */
export function searchTools(query: string, maxResults: number = MAX_TOOLS_IN_CONTEXT): ToolSearchResult {
  const total = toolRegistry.length;

  if (!query.trim()) {
    // No query — return all (up to max)
    return {
      tools: toolRegistry.slice(0, maxResults),
      totalCount: total,
      wasFiltered: total > maxResults,
    };
  }

  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  const scored = toolRegistry.map(tool => {
    let score = 0;
    const nameLower = tool.name.toLowerCase();
    const descLower = tool.description.toLowerCase();
    const serverLower = tool.server.toLowerCase();

    for (const term of terms) {
      // Exact name match
      if (nameLower === term) score += 100;
      // Name starts with term
      else if (nameLower.startsWith(term)) score += 50;
      // Name contains term
      else if (nameLower.includes(term)) score += 30;
      // Description contains term
      if (descLower.includes(term)) score += 20;
      // Server name matches
      if (serverLower.includes(term)) score += 10;
      // Input schema summary matches
      if (tool.inputSummary?.toLowerCase().includes(term)) score += 5;
    }

    return { tool, score };
  });

  const matches = scored
    .filter(s => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, maxResults)
    .map(s => s.tool);

  return {
    tools: matches,
    totalCount: total,
    wasFiltered: true,
  };
}

/**
 * Get all tools for a specific MCP server.
 */
export function getToolsForServer(serverName: string): ToolInfo[] {
  return toolRegistry.filter(t => t.server === serverName);
}

/**
 * Get tool search needed status.
 */
export function isToolSearchNeeded(): boolean {
  return toolRegistry.length > SEARCH_THRESHOLD;
}

/**
 * Get a summary of the tool registry for /doctor or /status.
 */
export function getToolRegistrySummary(): string {
  if (toolRegistry.length === 0) return 'No tools registered.';

  const byServer = new Map<string, number>();
  for (const tool of toolRegistry) {
    byServer.set(tool.server, (byServer.get(tool.server) || 0) + 1);
  }

  const parts: string[] = [`${toolRegistry.length} tools registered:`];
  for (const [server, count] of byServer) {
    parts.push(`  ${server}: ${count} tools`);
  }

  if (isToolSearchNeeded()) {
    parts.push(`\n  Tool search active (>${SEARCH_THRESHOLD} tools)`);
  }

  return parts.join('\n');
}

// ============================================================================
// Helpers
// ============================================================================

function summarizeSchema(schema: unknown): string {
  if (!schema || typeof schema !== 'object') return '';
  const s = schema as Record<string, unknown>;
  const props = s.properties as Record<string, unknown> | undefined;
  if (!props) return '';
  return Object.keys(props).slice(0, 5).join(', ');
}
