# Eames Design Agent - Repository Strategy
**Date:** 2026-01-18  
**Goal:** Maintain two parallel versions (LangChain + SDK) aligned to vision

---

## 🎯 The Vision (Both Versions)

**End-to-end autonomous product design agent with HITL:**

```
Discovery → Define → Design → Develop → Deliver
    ↓         ↓        ↓         ↓         ↓
Research   PRD     UI/UX     Code    Deploy to Netlify/Vercel
    ↓         ↓        ↓         ↓         ↓
(Tools)   (Docs)  (Comps)  (Local)   (Live Link)
```

**Both versions must:**
- ✅ Execute full product design lifecycle
- ✅ Human-in-the-loop at key decision points
- ✅ Generate production-ready code
- ✅ Run locally first (localhost preview)
- ✅ Deploy to Netlify/Vercel automatically
- ✅ Share live link via GitHub
- ✅ Version control all artifacts

---

## 📊 Repository Strategy Options

### Option A: Monorepo with Branches ⭐ RECOMMENDED

```
eames-design-agent/
├── .git/
├── main                    # Current state (archive)
├── langchain-v1           # Pure LangChain implementation
└── sdk-v1                 # Pure Claude SDK implementation
```

**Structure:**
```bash
# Main branch - current state (frozen)
main
  ├── All current code (don't touch)
  └── README: "See langchain-v1 or sdk-v1 branches"

# LangChain branch
langchain-v1
  ├── src/agent/orchestrator.ts        # 5-phase Eames Brain
  ├── src/agent/phases/                # Discovery → Deliver
  ├── src/tools/                       # LangChain tools
  ├── src/deployment/                  # Netlify/Vercel deploy
  └── README.md                        # LangChain version docs

# SDK branch
sdk-v1
  ├── src/eames-brain.ts               # Phase detection
  ├── src/hooks/useClaudeSDK.ts        # Direct SDK usage
  ├── src/mcp-servers/                 # Custom MCP tools
  ├── src/deployment/                  # Netlify/Vercel deploy
  └── README.md                        # SDK version docs
```

**Pros:**
- ✅ Single repo to manage
- ✅ Easy to compare (`git diff langchain-v1 sdk-v1`)
- ✅ Shared issues/PRs
- ✅ One set of CI/CD
- ✅ Maintains full history
- ✅ Easy to merge improvements between versions
- ✅ Single GitHub link

**Cons:**
- ❌ Slightly more complex branching

---

### Option B: Separate Repositories

```
GitHub:
├── eames-design-agent                  # Archive (current)
├── eames-design-agent-langchain        # LangChain version
└── eames-design-agent-sdk              # SDK version
```

**Pros:**
- ✅ Complete independence
- ✅ Separate issues/PRs
- ✅ Can have different contributors
- ✅ Clearer separation

**Cons:**
- ❌ Harder to sync improvements
- ❌ Duplicate CI/CD setup
- ❌ Three repos to maintain
- ❌ Shared code needs to be copied
- ❌ More overhead

---

## 🚀 RECOMMENDED APPROACH: Monorepo with Branches

### Phase 1: Commit Current State (10 min)

```bash
cd /Users/basavarajkm/code/eames-design-agent

# 1. Commit all current changes
git add .
git commit -m "chore: archive current hybrid state

- Mixed LangChain + SDK implementation
- Analysis documents added
- Identified architectural conflicts
- Ready to split into clean versions"

# 2. Push to main
git push origin main

# 3. Tag this state
git tag -a v0.9.0-hybrid -m "Hybrid state before split"
git push origin v0.9.0-hybrid
```

### Phase 2: Create LangChain Branch (2 hours)

```bash
# 1. Create and switch to langchain-v1 branch
git checkout -b langchain-v1

# 2. Remove SDK-specific code
rm -rf src/agent/sdk-agent.ts
rm -rf src/agent/enhanced-sdk-processor.ts
rm -rf src/agent/sdk-message-processor.ts
rm -rf src/hooks/useSdkAgentExecution.ts
rm -rf src/model/claude-native.ts

# 3. Keep LangChain code
# - src/agent/orchestrator.ts ✅
# - src/agent/phases/ ✅
# - src/tools/ ✅
# - src/model/llm.ts ✅

# 4. Add deployment module
mkdir -p src/deployment

# 5. Commit
git add .
git commit -m "feat: pure LangChain implementation v1.0.0

- Removed SDK wrapper layer
- Restored Dexter's 5-phase orchestration
- Kept all LangChain tools
- Added deployment module for Netlify/Vercel
- Clean, working implementation"

# 6. Push
git push -u origin langchain-v1

# 7. Tag
git tag -a v1.0.0-langchain -m "LangChain v1.0.0 - Pure implementation"
git push origin v1.0.0-langchain
```

### Phase 3: Create SDK Branch (2 hours)

```bash
# 1. Go back to main, create sdk-v1 branch
git checkout main
git checkout -b sdk-v1

# 2. Remove LangChain-specific code
rm -rf src/agent/orchestrator.ts
rm -rf src/agent/phases/
rm -rf src/agent/task-executor.ts
rm -rf src/agent/tool-executor.ts

# 3. Keep SDK code + simplify
# - src/hooks/useClaudeSDK.ts (new, simple version)
# - src/eames-brain.ts (new, PreQuery hook)
# - src/mcp-servers/ (new)

# 4. Add deployment module
mkdir -p src/deployment

# 5. Commit
git add .
git commit -m "feat: pure Claude SDK implementation v1.0.0

- Direct SDK usage (no wrapper)
- Eames Brain as PreQuery hook
- Custom tools via MCP servers
- Added deployment module for Netlify/Vercel
- Clean, minimal implementation"

# 6. Push
git push -u origin sdk-v1

# 7. Tag
git tag -a v1.0.0-sdk -m "Claude SDK v1.0.0 - Pure implementation"
git push origin v1.0.0-sdk
```

### Phase 4: Update Main Branch README

```bash
git checkout main

# Create README explaining the branches
cat > README.md << 'EOF'
# Eames Design Agent

**End-to-end autonomous product design agent: Discovery → Delivery**

## 🎯 Two Implementations

This repository contains two parallel implementations of Eames:

### 🔗 [LangChain Version (v1.0.0)](../../tree/langchain-v1)
- **Branch:** `langchain-v1`
- **Architecture:** Pure LangChain with 5-phase orchestration
- **Pros:** Multi-provider, flexible, custom tools easy
- **Use when:** You want full control and provider flexibility

### ⚡ [Claude SDK Version (v1.0.0)](../../tree/sdk-v1)
- **Branch:** `sdk-v1`
- **Architecture:** Pure Claude Agent SDK with Eames Brain
- **Pros:** Smart file ops, permissions, production-ready
- **Use when:** You want Claude Code features and simplicity

## 🚀 Quick Start

```bash
# Clone the repo
git clone https://github.com/Kari-Basavaraj/eames-design-agent.git
cd eames-design-agent

# Choose your version:

# Option 1: LangChain
git checkout langchain-v1
bun install
bun start

# Option 2: Claude SDK
git checkout sdk-v1
bun install
bun start
```

## 📊 Comparison

| Feature | LangChain | Claude SDK |
|---------|-----------|------------|
| Control | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| Simplicity | ⭐⭐ | ⭐⭐⭐⭐⭐ |
| Multi-provider | ✅ | ❌ |
| File Operations | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| Custom Tools | ⭐⭐⭐⭐⭐ | ⭐⭐ |
| Production Ready | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |

See [LANGCHAIN_VS_SDK_COMPLETE.md](./LANGCHAIN_VS_SDK_COMPLETE.md) for detailed comparison.

## 📖 Documentation

- [Vision & Roadmap](./docs/EAMES_VISION.md)
- [LangChain vs SDK Analysis](./LANGCHAIN_VS_SDK_COMPLETE.md)
- [LangChain Implementation Plan](./docs/langchain-v1/)
- [SDK Implementation Plan](./EAMES_2.0_REWRITE_PLAN.md)

## 🎯 The Vision

Both versions implement the full product design lifecycle:

1. **Discovery** - Research competitors, market, user needs
2. **Define** - Generate PRD, user stories, requirements
3. **Design** - Create UI/UX, wireframes, components
4. **Develop** - Generate production code, run locally
5. **Deliver** - Deploy to Netlify/Vercel, share live link

## 🤝 Contributing

Both versions are actively maintained. Choose the branch that fits your use case.

## 📄 License

MIT
EOF

git add README.md
git commit -m "docs: add branch strategy explanation"
git push origin main
```

---

## 📋 Deployment Module (Both Versions)

Both versions need a deployment module. Here's the shared interface:

### File: `src/deployment/index.ts` (same for both)

```typescript
// Deployment manager for Netlify/Vercel
import { execSync } from 'child_process';
import { existsSync, writeFileSync } from 'fs';
import { join } from 'path';

export interface DeploymentConfig {
  platform: 'netlify' | 'vercel';
  projectName: string;
  buildCommand: string;
  buildDir: string;
  githubRepo?: string;
}

export class DeploymentManager {
  constructor(private config: DeploymentConfig) {}
  
  /**
   * Initialize Git repo if not exists
   */
  initGit(projectPath: string): void {
    const gitPath = join(projectPath, '.git');
    if (!existsSync(gitPath)) {
      execSync('git init', { cwd: projectPath });
      execSync('git add .', { cwd: projectPath });
      execSync('git commit -m "Initial commit by Eames"', { cwd: projectPath });
    }
  }
  
  /**
   * Create GitHub repo and push
   */
  async createGitHubRepo(projectPath: string): Promise<string> {
    // Use GitHub CLI
    const repoName = this.config.projectName;
    
    try {
      // Create repo
      execSync(`gh repo create ${repoName} --private --source=. --remote=origin`, {
        cwd: projectPath
      });
      
      // Push
      execSync('git push -u origin main', { cwd: projectPath });
      
      return `https://github.com/${repoName}`;
    } catch (error) {
      throw new Error(`Failed to create GitHub repo: ${error.message}`);
    }
  }
  
  /**
   * Deploy to Netlify
   */
  async deployToNetlify(projectPath: string): Promise<string> {
    // Install Netlify CLI if needed
    try {
      execSync('which netlify', { stdio: 'ignore' });
    } catch {
      execSync('npm install -g netlify-cli');
    }
    
    // Deploy
    const result = execSync(
      `netlify deploy --prod --dir=${this.config.buildDir}`,
      { cwd: projectPath, encoding: 'utf-8' }
    );
    
    // Extract URL from output
    const match = result.match(/Website URL:\s+(https:\/\/[^\s]+)/);
    if (!match) throw new Error('Failed to extract Netlify URL');
    
    return match[1];
  }
  
  /**
   * Deploy to Vercel
   */
  async deployToVercel(projectPath: string): Promise<string> {
    // Install Vercel CLI if needed
    try {
      execSync('which vercel', { stdio: 'ignore' });
    } catch {
      execSync('npm install -g vercel');
    }
    
    // Deploy
    const result = execSync('vercel --prod', {
      cwd: projectPath,
      encoding: 'utf-8'
    });
    
    // Extract URL from output
    const match = result.match(/https:\/\/[^\s]+/);
    if (!match) throw new Error('Failed to extract Vercel URL');
    
    return match[0];
  }
  
  /**
   * Full deployment flow
   */
  async deploy(projectPath: string): Promise<{
    githubUrl: string;
    liveUrl: string;
    localUrl: string;
  }> {
    console.log('🚀 Starting deployment process...');
    
    // 1. Initialize Git
    console.log('📦 Initializing Git repository...');
    this.initGit(projectPath);
    
    // 2. Create GitHub repo and push
    console.log('📤 Pushing to GitHub...');
    const githubUrl = await this.createGitHubRepo(projectPath);
    console.log(`✅ GitHub: ${githubUrl}`);
    
    // 3. Build project
    console.log('🔨 Building project...');
    execSync(this.config.buildCommand, { cwd: projectPath });
    
    // 4. Start local server (background)
    console.log('🖥️  Starting local server...');
    const localUrl = 'http://localhost:3000';
    // Start in background (implementation depends on framework)
    
    // 5. Deploy to platform
    console.log(`🌐 Deploying to ${this.config.platform}...`);
    const liveUrl = this.config.platform === 'netlify'
      ? await this.deployToNetlify(projectPath)
      : await this.deployToVercel(projectPath);
    console.log(`✅ Live at: ${liveUrl}`);
    
    return {
      githubUrl,
      liveUrl,
      localUrl,
    };
  }
}

/**
 * Create deployment config from project detection
 */
export function detectProjectConfig(projectPath: string): DeploymentConfig {
  // Detect framework from package.json
  const packageJson = JSON.parse(
    require('fs').readFileSync(join(projectPath, 'package.json'), 'utf-8')
  );
  
  // Determine build command and dir based on framework
  let buildCommand = 'npm run build';
  let buildDir = 'dist';
  
  if (packageJson.dependencies?.['next']) {
    buildCommand = 'npm run build';
    buildDir = '.next';
  } else if (packageJson.dependencies?.['vite']) {
    buildCommand = 'npm run build';
    buildDir = 'dist';
  } else if (packageJson.dependencies?.['react-scripts']) {
    buildCommand = 'npm run build';
    buildDir = 'build';
  }
  
  return {
    platform: 'netlify', // or 'vercel'
    projectName: packageJson.name,
    buildCommand,
    buildDir,
  };
}
```

---

## 🎯 Integration with Eames Brain

### LangChain Version (langchain-v1 branch)

Add deployment as a tool:

```typescript
// src/tools/deployment/deploy.ts
import { DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';
import { DeploymentManager, detectProjectConfig } from '../../deployment/index.js';

export const deployProjectTool = new DynamicStructuredTool({
  name: 'deploy_project',
  description: 'Deploy a project to Netlify or Vercel with GitHub integration',
  schema: z.object({
    projectPath: z.string().describe('Path to the project directory'),
    platform: z.enum(['netlify', 'vercel']).describe('Deployment platform'),
  }),
  func: async ({ projectPath, platform }) => {
    const config = detectProjectConfig(projectPath);
    config.platform = platform;
    
    const manager = new DeploymentManager(config);
    const result = await manager.deploy(projectPath);
    
    return JSON.stringify(result, null, 2);
  },
});
```

### SDK Version (sdk-v1 branch)

Add deployment as MCP server:

```typescript
// src/mcp-servers/deployment/index.ts
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { DeploymentManager, detectProjectConfig } from '../../deployment/index.js';

const server = new Server({ name: 'deployment-server', version: '1.0.0' }, {
  capabilities: { tools: {} }
});

server.setRequestHandler('tools/list', async () => ({
  tools: [{
    name: 'deploy_project',
    description: 'Deploy a project to Netlify or Vercel',
    inputSchema: {
      type: 'object',
      properties: {
        projectPath: { type: 'string' },
        platform: { type: 'string', enum: ['netlify', 'vercel'] },
      },
      required: ['projectPath', 'platform'],
    },
  }],
}));

server.setRequestHandler('tools/call', async (request) => {
  const { projectPath, platform } = request.params.arguments;
  
  const config = detectProjectConfig(projectPath);
  config.platform = platform;
  
  const manager = new DeploymentManager(config);
  const result = await manager.deploy(projectPath);
  
  return {
    content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
  };
});

const transport = new StdioServerTransport();
await server.connect(transport);
```

---

## 📅 Implementation Timeline

| Phase | Time | Description |
|-------|------|-------------|
| 1. Commit current | 10 min | Save current state to main |
| 2. Create langchain-v1 | 2 hours | Clean LangChain implementation |
| 3. Create sdk-v1 | 2 hours | Clean SDK implementation |
| 4. Add deployment (both) | 2 hours | Netlify/Vercel integration |
| 5. Test both versions | 2 hours | Verify end-to-end flow |
| **TOTAL** | **8.5 hours** | **~1 day** |

---

## ✅ Success Criteria (Both Versions)

- [ ] User can ask for a product feature
- [ ] Eames researches (Discovery phase)
- [ ] Eames generates PRD (Define phase)
- [ ] Eames creates UI components (Design phase)
- [ ] Eames generates working code (Develop phase)
- [ ] Code runs on localhost automatically
- [ ] Eames pushes to GitHub
- [ ] Eames deploys to Netlify/Vercel
- [ ] User receives live link
- [ ] All artifacts versioned in Git

---

## 🚀 Next Steps

1. **Commit current state** to main branch
2. **Create langchain-v1** branch with clean LangChain
3. **Create sdk-v1** branch with clean SDK
4. **Add deployment module** to both
5. **Test end-to-end** on both versions
6. **Compare and decide** which to continue with (or maintain both)

Ready to start? Let's begin with Phase 1 - committing current state.
