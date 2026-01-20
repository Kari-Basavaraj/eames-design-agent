---
name: eames-idea-capture
description: Quick capture ideas to inbox with minimal friction - GitHub repos, links, or notes
argument-hint: <url or repo or note>
allowed-tools:
  - Read
  - Write
  - Bash(curl -s:*)
  - Bash(date:*)
  - Bash(printf:*)
---

<objective>
Quick capture of ideas to IDEA_INBOX.md with minimal friction.

If no $ARGUMENTS provided, ask user what they want to capture.

**Goal:** Get idea captured in < 30 seconds, analyze later with `/eames-analyze-reference`.
</objective>

<context>
@./IDEA_INBOX.md
</context>

<success_criteria>
- Input received (not empty)
- Type auto-detected (GitHub/Article/Video/Tool/Concept/Note)
- Quick metadata extracted (for GitHub: stars, description)
- Entry added to IDEA_INBOX.md
- Next IN-XXX ID generated correctly
- Dashboard row added
- Inbox stats updated
- No deep analysis (that's for /eames-analyze-reference)
</success_criteria>

<process>

1. **Validate Input**
   If $ARGUMENTS is empty, prompt: "What would you like to capture? (URL, GitHub repo, or quick note)"

2. **Detect Type**
   Auto-detect from input:

   | Pattern | Type | Action |
   |---------|------|--------|
   | `github.com/owner/repo` | GitHub | Extract owner/repo, fetch basic metadata |
   | `owner/repo` (no dots) | GitHub | Treat as shorthand, fetch metadata |
   | `http(s)://...youtube...` | Video | Extract title if possible |
   | `http(s)://...` | Article | Note URL |
   | Everything else | Note | Capture as quick idea |

3. **Quick Metadata** (GitHub only)
   For GitHub repos, fetch ONLY basic info (< 5 seconds):
   ```bash
   curl -s "https://api.github.com/repos/{owner}/{repo}" | grep -E '"(stargazers_count|description)"'
   ```
   Extract: stars, one-line description

   If fetch fails, proceed anyway with "Unknown" for metadata.

4. **Generate ID**
   Read IDEA_INBOX.md:
   - Find last IN-XXX in dashboard
   - Increment to get next ID
   - If no entries, start with IN-001

5. **Prompt for Quick Context** (optional)
   Ask user: "Quick note on why this is interesting? (Enter to skip)"

   If user provides note, use it.
   If skipped, use auto-generated based on type:
   - GitHub: Use repo description
   - Article: "Saved for later review"
   - Note: Use the note itself as description

6. **Prompt for Tags** (optional)
   Ask user: "Tags? (comma-separated, Enter to skip)"

   Default tags by type:
   - GitHub: `github, ai-agent` (if repo name suggests AI)
   - Article: `article, to-read`
   - Video: `video, to-watch`
   - Note: `idea, quick-capture`

7. **Prompt for Project Relevance** (optional)
   Ask user: "Project? (eames/general-ai/other, Enter for eames)"

   Default: `eames`

8. **Add Entry to Inbox**
   Add to "📥 Unprocessed Ideas" section:

   ```markdown
   ### IN-XXX: [Name]
   | Field | Value |
   |-------|-------|
   | **URL** | [link or N/A] |
   | **Type** | [detected type] |
   | **Tags** | [tags] |
   | **Project Relevance** | [project] |
   | **Date Added** | [today YYYY-MM-DD] |
   | **Added By** | User |
   | **Quick Note** | [note] |
   | **Status** | 📥 Unprocessed |

   ---
   ```

9. **Update Dashboard**
   Add row to inbox dashboard:
   ```
   | IN-XXX | [Name] | [tags] | [date] | 📥 Unprocessed | [project] |
   ```

10. **Update GitHub Stars Queue** (if GitHub)
    If GitHub repo, also add to "🌟 GitHub Stars Queue" section:
    ```
    | [owner/repo] | [stars] | [quick note] | [date] | 📥 Unprocessed |
    ```

11. **Update Stats**
    Increment appropriate stat in "📊 Inbox Stats":
    - Total Unprocessed += 1
    - GitHub Stars Pending += 1 (if GitHub)
    - Saved Links Pending += 1 (if Article/Video)
    - Quick Ideas Pending += 1 (if Note)

12. **Timestamp**
    Update "Last Updated" at top and bottom of file.

</process>

<output>
Display:
```
✅ Captured: IN-XXX - [Name]
   Type: [type]
   Tags: [tags]
   Project: [project]

📥 Added to IDEA_INBOX.md
💡 Run `/eames-analyze-reference [source]` for full analysis
```

Files modified:
- IDEA_INBOX.md

Do NOT commit. Do NOT run full analysis.
</output>

<rules>
DO: Quick capture, auto-detect type, generate correct ID, update all inbox sections, allow skipping optional fields

DO NOT: Deep analysis (use /eames-analyze-reference), vision scoring, tech alignment, Linear integration, commit changes, take more than 30 seconds of user time
</rules>

<examples>

**Example 1: GitHub repo**
```
User: /eames-idea-capture langchain-ai/langgraph

→ Detects: GitHub
→ Fetches: ⭐ 8.2k, "Build stateful multi-actor applications with LLMs"
→ Prompts: Quick note? Tags? Project?
→ Creates: IN-003 with auto-filled metadata
```

**Example 2: Article URL**
```
User: /eames-idea-capture https://every.to/chain-of-thought/agent-native-apps

→ Detects: Article
→ Prompts: Quick note? Tags? Project?
→ Creates: IN-004 with URL saved
```

**Example 3: Quick note**
```
User: /eames-idea-capture add approval gates between phases

→ Detects: Note
→ Uses note as description
→ Prompts: Tags? Project?
→ Creates: IN-005 as quick idea
```

</examples>
