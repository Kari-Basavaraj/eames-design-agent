# MCP Server Troubleshooting Guide

## Common Issues and Solutions

### 1. Missing Greptile API Key

**Error**: `MCP server greptile invalid: Missing environment variables: GREPTILE_API_KEY`

**Solution**:
- If you don't use Greptile, remove it from your MCP config
- If you want to use Greptile, set your API key:
  ```bash
  export GREPTILE_API_KEY="your-key-here"
  ```

### 2. Missing TypeScript Language Server

**Error**: `Executable not found in $PATH: "typescript-language-server"`

**Solution**:
```bash
# Install globally
npm install -g typescript-language-server typescript

# Or with bun
bun add -g typescript-language-server typescript
```

### 3. Removing Optional MCP Servers

To remove MCP servers you don't need, check these locations:

**User Settings**: `~/.claude/settings.json`
```json
{
  "mcpServers": {
    // Remove servers you don't need
  }
}
```

**VS Code Settings**: `~/.vscode/mcp.json` or workspace `.vscode/mcp.json`

## Quick Fix: Minimal MCP Configuration

If you want to start fresh with just the essential MCP servers, edit `~/.claude/settings.json`:

```json
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "your-token-here"
      }
    }
  }
}
```

## Eames Behavior

Eames now handles MCP configuration errors gracefully:
- ✅ Shows warning message instead of crashing
- ✅ Continues working with available MCP servers
- ✅ Logs errors for debugging

You can ignore non-critical MCP errors and Eames will work with whatever tools are available.
