# Branch Rename Migration Rollback Procedure

**Date:** 2026-01-20
**Migration:** langchain → main rename

## If You Need to Rollback

### Quick Rollback (Restore from tags)

```bash
cd /Users/basavarajkm/code/eames-design-agent

# 1. Restore langchain branch from backup tag
git checkout -b langchain backup/langchain-20260120

# 2. Restore old main from backup tag  
git branch -f main backup/main-20260120

# 3. Delete the archive branch
git branch -D archive/original-hybrid

# 4. Force push to remote
git push origin langchain:langchain --force
git push origin main:main --force
git push origin --delete archive/original-hybrid

# 5. Change GitHub default branch back to main (old version)
#    Go to: https://github.com/Kari-Basavaraj/eames-design-agent/settings/branches
```

### Full Restore from Local Backup

```bash
# If tags don't work, use the full backup clone
cd /Users/basavarajkm/code

# Remove current directory
rm -rf eames-design-agent

# Restore from backup
cp -r eames-design-agent-BACKUP-20260120 eames-design-agent

cd eames-design-agent

# Force push all branches to remote
git push origin --all --force
git push origin --tags --force
```

## Recovery Tags

- `backup/main-20260120` → Old main (3b47310)
- `backup/langchain-20260120` → Langchain before rename (97eb622)
- `backup/sdk-20260120` → SDK (0aa680d)
- `migration/pre-rename` → Before rename (97eb622)
- `migration/post-rename` → After rename (161e7be)

## Current State (Post-Migration)

```
Branches:
- main → 161e7be (former langchain)
- archive/original-hybrid → 3b47310 (former main)
- sdk → 0aa680d (unchanged)
```

## Backup Locations

1. **Local:** `/Users/basavarajkm/code/eames-design-agent-BACKUP-20260120`
2. **Remote:** All tags pushed to GitHub
3. **History:** Fully preserved
