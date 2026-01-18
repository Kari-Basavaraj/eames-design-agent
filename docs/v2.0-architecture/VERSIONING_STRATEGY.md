# Eames Design Agent - Versioning & Release Strategy
**Date:** 2026-01-18  
**Follows:** Semantic Versioning 2.0.0

---

## 📊 Branch Structure

```
eames-design-agent/
├── main                 # Stable releases only (archive for now)
├── langchain           # LangChain implementation (long-lived)
└── sdk                 # Claude SDK implementation (long-lived)
```

**Branch Strategy:**
- `main`: Protected, only stable releases merged here
- `langchain`: All LangChain development happens here
- `sdk`: All Claude SDK development happens here

---

## 🏷️ Tagging Strategy

### Format
```
<branch>-v<MAJOR>.<MINOR>.<PATCH>

Examples:
langchain-v1.0.0    # First stable release
langchain-v1.0.1    # Bug fix
langchain-v1.1.0    # New feature
langchain-v2.0.0    # Breaking change

sdk-v1.0.0          # First stable release  
sdk-v1.0.1          # Bug fix
sdk-v1.1.0          # New feature
```

### When to Bump Versions

#### MAJOR (x.0.0) - Breaking Changes
- Incompatible API changes
- Removed features
- Changed CLI commands
- Example: `langchain-v1.0.0` → `langchain-v2.0.0`

#### MINOR (1.x.0) - New Features
- New features (backwards compatible)
- New commands
- New deployment targets
- Example: `langchain-v1.0.0` → `langchain-v1.1.0`

#### PATCH (1.0.x) - Bug Fixes
- Bug fixes
- Documentation updates
- Performance improvements
- Example: `langchain-v1.0.0` → `langchain-v1.0.1`

---

## 📅 Release Workflow

### Initial Releases (Current Task)

#### 1. Create LangChain v1.0.0
```bash
# Create branch
git checkout -b langchain

# Remove SDK code
rm -rf src/agent/sdk-agent.ts
rm -rf src/agent/enhanced-sdk-processor.ts
# ... (see below for full commands)

# Commit
git add .
git commit -m "feat: initial LangChain implementation v1.0.0"

# Push
git push -u origin langchain

# Tag
git tag -a langchain-v1.0.0 -m "LangChain v1.0.0 - Initial Release

Features:
- 5-phase product design lifecycle
- Multi-provider LLM support
- LangChain tool ecosystem
- Deployment to Netlify/Vercel"

git push origin langchain-v1.0.0
```

#### 2. Create SDK v1.0.0
```bash
# Create branch from main
git checkout main
git checkout -b sdk

# Remove LangChain code
rm -rf src/agent/orchestrator.ts
rm -rf src/agent/phases/
# ... (see below for full commands)

# Commit
git add .
git commit -m "feat: initial Claude SDK implementation v1.0.0"

# Push
git push -u origin sdk

# Tag
git tag -a sdk-v1.0.0 -m "Claude SDK v1.0.0 - Initial Release

Features:
- Direct Claude Agent SDK usage
- Eames Brain phase detection
- MCP server tools
- Smart file operations
- Deployment to Netlify/Vercel"

git push origin sdk-v1.0.0
```

---

## 🔄 Future Development Workflow

### For Bug Fixes (1.0.x)

```bash
# On langchain branch
git checkout langchain

# Fix bug
# ... make changes ...

git add .
git commit -m "fix: resolved deployment issue"

git push origin langchain

# Tag patch version
git tag -a langchain-v1.0.1 -m "Bug fix: deployment issue"
git push origin langchain-v1.0.1
```

### For New Features (1.x.0)

```bash
# Create feature branch
git checkout langchain
git checkout -b feature/figma-export

# Develop feature
# ... make changes ...

git add .
git commit -m "feat: add Figma export capability"

# Merge to langchain
git checkout langchain
git merge feature/figma-export

# Tag minor version
git tag -a langchain-v1.1.0 -m "New feature: Figma export"
git push origin langchain-v1.1.0

# Delete feature branch
git branch -d feature/figma-export
```

### For Breaking Changes (x.0.0)

```bash
# Similar to feature, but bump major version
git tag -a langchain-v2.0.0 -m "Breaking: new CLI interface"
git push origin langchain-v2.0.0
```

---

## 📦 Release Notes Template

### For Each Tag

```markdown
# [Branch] vMAJOR.MINOR.PATCH - Release Title

**Release Date:** YYYY-MM-DD  
**Branch:** [langchain|sdk]

## ✨ New Features
- Feature 1
- Feature 2

## 🐛 Bug Fixes
- Fix 1
- Fix 2

## 📚 Documentation
- Doc update 1

## ⚠️ Breaking Changes (if major)
- Breaking change 1

## 🔗 Links
- GitHub: https://github.com/Kari-Basavaraj/eames-design-agent/tree/[branch]
- Tag: https://github.com/Kari-Basavaraj/eames-design-agent/releases/tag/[branch]-v[version]
```

---

## 🎯 Version Matrix (Planned)

### LangChain Branch
| Version | Status | Features |
|---------|--------|----------|
| langchain-v1.0.0 | ✅ Next | Initial release, 5-phase lifecycle |
| langchain-v1.1.0 | 📋 Planned | Figma integration |
| langchain-v1.2.0 | 📋 Planned | Linear integration |
| langchain-v2.0.0 | 💡 Future | New orchestrator architecture |

### SDK Branch
| Version | Status | Features |
|---------|--------|----------|
| sdk-v1.0.0 | ✅ Next | Initial release, Eames Brain hooks |
| sdk-v1.1.0 | 📋 Planned | Enhanced MCP servers |
| sdk-v1.2.0 | 📋 Planned | Multi-project support |
| sdk-v2.0.0 | 💡 Future | New hook system |

---

## 🔍 Finding Specific Versions

### List All Versions
```bash
# All tags
git tag -l

# LangChain versions only
git tag -l "langchain-*"

# SDK versions only  
git tag -l "sdk-*"
```

### Checkout Specific Version
```bash
# Checkout exact version (read-only)
git checkout langchain-v1.0.0

# View version
cat package.json | grep version

# Go back to latest
git checkout langchain
```

### Compare Versions
```bash
# Compare two versions
git diff langchain-v1.0.0 langchain-v1.1.0

# See what changed
git log langchain-v1.0.0..langchain-v1.1.0 --oneline
```

---

## 📝 package.json Versioning

### LangChain Branch
```json
{
  "name": "eames-design-agent-langchain",
  "version": "1.0.0",
  "description": "End-to-end product design agent (LangChain version)"
}
```

### SDK Branch
```json
{
  "name": "eames-design-agent-sdk",
  "version": "1.0.0",
  "description": "End-to-end product design agent (Claude SDK version)"
}
```

**Update on each release:**
```bash
# On langchain branch for patch
npm version patch -m "chore: bump to %s"

# On langchain branch for minor
npm version minor -m "feat: bump to %s"

# On langchain branch for major
npm version major -m "feat!: bump to %s"
```

---

## 🚀 CI/CD Integration (Future)

### GitHub Actions (Planned)
```yaml
# .github/workflows/release.yml
name: Release

on:
  push:
    tags:
      - 'langchain-v*'
      - 'sdk-v*'

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - name: Create Release
        # Auto-create GitHub release from tag
      - name: Run Tests
        # Ensure all tests pass
      - name: Build
        # Build for distribution
```

---

## ✅ Best Practices

1. **Always tag releases** - Every stable state gets a tag
2. **Use annotated tags** - `git tag -a` with message
3. **Follow SemVer strictly** - Don't skip versions
4. **Keep CHANGELOG.md** - Document all changes
5. **Branch protection** - Protect `main`, require reviews
6. **Automate where possible** - Use `npm version` to bump

---

## 📚 References

- [Semantic Versioning 2.0.0](https://semver.org/)
- [Git Tagging](https://git-scm.com/book/en/v2/Git-Basics-Tagging)
- [GitHub Releases](https://docs.github.com/en/repositories/releasing-projects-on-github)

---

**Next Steps:** Create `langchain` and `sdk` branches with `v1.0.0` tags
