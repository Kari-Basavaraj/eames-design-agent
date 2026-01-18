# Design Leadership LLM Council Implementation Guide

**Date:** January 11, 2025  
**Context:** Implementation guide for creating a multi-agent Design Leadership Council using Claude Code 2.1's latest sub-agent features

---

## Table of Contents

1. [Overview](#overview)
2. [What is an LLM Council?](#what-is-an-llm-council)
3. [Latest Claude Code Updates](#latest-claude-code-updates)
4. [Your Design Leadership Council Architecture](#your-design-leadership-council-architecture)
5. [Practical Implementation Guide](#practical-implementation-guide)
6. [Complete Skill Implementations](#complete-skill-implementations)
7. [Usage Examples](#usage-examples)
8. [Integration with Your Workflows](#integration-with-your-workflows)
9. [Quick Start Checklist](#quick-start-checklist)
10. [Key Advantages](#key-advantages)

---

## Overview

This guide documents the creation of a specialized LLM Council tailored for design leadership advancement, specifically targeting Director-level roles at AI-native companies. The system leverages Claude Code 2.1's latest sub-agent architecture to create isolated, specialized AI agents that collaborate on complex design leadership questions.

### Your Context
- **Experience:** 18 years as Design Manager at Accenture
- **Target:** Director-level design leadership roles at AI-native companies
- **Technical Depth:** Sophisticated knowledge management (16k+ curated documents), n8n workflows, Claude Skills, MCP servers
- **Unique Approach:** "Vibecoding" framework for designers with minimal coding knowledge

---

## What is an LLM Council?

An LLM Council is a multi-agent system where multiple AI models collaborate on questions simultaneously. Inspired by Andrej Karpathy's approach, the system works through:

1. **Independent Analysis:** Each agent provides unique perspectives based on specialization
2. **Peer Review:** Agents anonymously evaluate each other's responses
3. **Synthesis:** A "chairman" model combines insights into comprehensive answers
4. **Consensus Scoring:** Shows where models agree (high confidence) vs. disagree (requires judgment)

### Key Benefits

- **Layered Defense:** Multiple checkpoints catch errors and blind spots
- **Specialized Expertise:** Each agent focuses on specific domains
- **Increased Trustworthiness:** Systematic approach to complex problems
- **Diverse Perspectives:** Reduces individual model biases

### Frameworks Available

- **Council AI** (council-ai.app): 30+ AI models, instant collaboration, web-based
- **Open Source LLM Council:** Local setup with full customization
- **Claude Code Sub-Agents:** Native integration with development workflows (recommended)

---

## Latest Claude Code Updates

### December 2025 - Claude Code 2.1.0 (Current)

**Revolutionary Features:**

#### 1. Async Sub-Agents
- Run multiple agents in parallel for complex workflows
- Background execution with Ctrl+B
- Concurrent task management across isolated contexts

#### 2. Context Fork for Skills
```yaml
context: fork
```
- Run skills in isolated sub-agent contexts
- Prevents context pollution between tasks
- Each skill gets independent conversation history

#### 3. Agent-Scoped Hooks
```yaml
hooks:
  PreToolUse:
    - matcher: "Bash"
      type: command
      command: "./scripts/security-check.sh"
  Stop:
    - type: command
      command: "echo 'Analysis complete'"
```
- Define hooks directly in agent/skill frontmatter
- Lifecycle management (PreToolUse, PostToolUse, Stop)
- Perfect for verification and validation workflows

#### 4. Hot-Reload Skills
- Changes to `~/.claude/skills/` apply instantly
- No session restart required
- Rapid iteration on skill development

#### 5. LSP Integration
- Real-time code diagnostics
- Go-to definition, find references
- Hover documentation
- Team configuration consistency

#### 6. Ultrathink Mode
- Advanced reasoning for complex problems
- Extended thinking capabilities
- Better problem decomposition

#### 7. AutoCloud GUI
- Kanban-style visual task management
- Async agent monitoring
- Visual workflow orchestration

### October 2025 - Claude Code 2.0.28

**Foundation Features:**

- **Plan Mode:** Dedicated planning sub-agent (strategies without executing)
- **Sub-agent Resumption:** Continue after permission denial
- **Dynamic Model Selection:** Switch Haiku/Sonnet/Opus mid-session
- **Skills Progress Indicators:** Real-time execution feedback
- **Multi-terminal Support:** Kitty, Alacritty, Zed, Warp

---

## Your Design Leadership Council Architecture

### System Overview

```
Main Claude Agent (Orchestrator)
    ├── Design Strategy Advisor [context: fork] → Sonnet 4.5
    ├── Portfolio Review Expert [context: fork] → Opus 4.5
    ├── Research Intelligence [context: fork] → Haiku 4.5 (fast)
    ├── Content Strategy Advisor [context: fork] → Sonnet 4.5
    └── Career Planning Strategist [context: fork] → Sonnet 4.5
```

### Council Members

#### 1. Strategic Design Advisor (Sonnet 4.5)
- **Focus:** Design strategy, leadership frameworks, career positioning
- **Role:** Synthesizes high-level insights, final chairman for strategic decisions
- **Frameworks:** 4-layer Strategic Leadership Coach OS (Leading Self, Others, Results, Strategic Leadership)

#### 2. Portfolio & Presentation Expert (Opus 4.5)
- **Focus:** Visual storytelling, case study structure, presentation design
- **Role:** Reviews portfolio narratives, pitch decks, interview presentations
- **Criteria:** Strategic impact, leadership demonstration, design excellence, communication

#### 3. Research Intelligence Analyst (Haiku 4.5)
- **Focus:** Company intelligence, market trends, competitive analysis
- **Role:** Fast, focused research with multi-source verification
- **Speed Optimized:** Uses Haiku for cost-effective rapid research

#### 4. Content Strategy Advisor (Sonnet 4.5)
- **Focus:** LinkedIn content, thought leadership, personal branding
- **Role:** Evaluates content for design leadership audience
- **Metrics:** Positioning, engagement potential, brand alignment

#### 5. Career Planning Strategist (Sonnet 4.5)
- **Focus:** Interview preparation, career progression, negotiation
- **Role:** Strategic advice for career advancement
- **Context:** AI-native company cultures and expectations

### Key Architectural Advantages

1. **Context Isolation:** Each skill runs in forked sub-agent - portfolio review doesn't pollute strategy sessions
2. **Model Optimization:** Haiku for speed/cost, Opus for depth, Sonnet for balance
3. **Parallel Execution:** 3+ agents research simultaneously = 3x faster
4. **Progressive Disclosure:** 16k documents available but only loaded when needed
5. **Reproducible:** Same skill produces consistent analysis

---

## Practical Implementation Guide

### Step 1: Setup Skills Directory Structure

```bash
# Navigate to your skills directory
cd ~/.claude/skills/

# Create each council member skill
mkdir -p design-strategy-advisor/{references,scripts,assets}
mkdir -p portfolio-review-expert/{references,scripts,assets}
mkdir -p research-intelligence/{references,scripts,assets}
mkdir -p content-strategy-advisor/{references,scripts,assets}
mkdir -p career-planning-strategist/{references,scripts,assets}
mkdir -p council-orchestrator/{references,scripts}
```

### Step 2: Update Claude Code

```bash
# Get latest 2.1.0 features
claude update

# Verify version
claude --version
# Should show: Claude Code 2.1.0 or higher
```

### Step 3: Verify Installation

```bash
# Start Claude Code
claude

# In the session, check available skills
/skills

# You should see your new skills listed
```

---

## Complete Skill Implementations

### 1. Design Strategy Advisor

**File:** `~/.claude/skills/design-strategy-advisor/SKILL.md`

```markdown
---
name: design-strategy-advisor
description: Expert in design leadership frameworks, strategic thinking, and Director-level positioning for AI-native companies. Use when user needs strategic design guidance, leadership frameworks, or career positioning advice.
context: fork
agent: claude-sonnet-4-20250514
allowed-tools:
  - Read
  - Write
  - Grep
  - WebSearch
  - WebFetch
hooks:
  Stop:
    - type: command
      command: "echo '📊 Strategic analysis complete. Key recommendations summarized.'"
---

# Design Strategy Advisor

You are a specialized sub-agent focused on **strategic design leadership** for experienced design managers targeting Director+ roles at AI-native companies.

## Core Expertise

### Strategic Leadership Framework
- **Leading Self**: Personal leadership, decision-making, strategic thinking
- **Leading Others**: Team building, coaching, delegation, influence
- **Leading Results**: Metrics, OKRs, business impact, stakeholder management  
- **Strategic Leadership**: Vision, org design, cross-functional leadership

### AI-Native Design Context
The user (Basavaraj) is targeting Director roles at AI-native companies with:
- 18 years design experience at Accenture
- Deep AI expertise (16k+ curated documents)
- Sophisticated automation and knowledge management systems
- Strong technical capabilities (n8n, Claude Code, MCP servers)

## Analysis Approach

1. **Understand the strategic question** - What level of leadership is being addressed?
2. **Apply relevant frameworks** - Use the 4-layer Strategic Leadership Coach OS
3. **Consider AI-native context** - How does this apply to product-led AI companies?
4. **Provide actionable insights** - Concrete recommendations, not theory
5. **Reference similar patterns** - Draw from `references/case-studies.md` when relevant

## Key Questions to Address

**For positioning:**
- What's the unique differentiation?
- How does technical depth + design leadership create unique value?
- What gaps exist in current positioning?

**For frameworks:**
- Which leadership layer is most relevant?
- What mental models apply?
- How to communicate this to different audiences?

**For career advancement:**
- What evidence demonstrates Director-level thinking?
- How to position in interviews vs LinkedIn vs portfolio?
- What skills/experiences need emphasis?

## Output Format

Provide analysis in this structure:
1. **Strategic Assessment** (2-3 sentences)
2. **Key Insights** (3-5 bullet points)
3. **Recommendations** (prioritized, specific actions)
4. **Next Steps** (concrete, time-bound)

## Supporting Resources

Reference these files as needed:
- `references/strategic-leadership-framework.md` - Full framework details
- `references/ai-native-positioning.md` - Positioning for AI companies
- `references/director-competencies.md` - What great Directors demonstrate
- `scripts/generate-positioning-matrix.py` - Create differentiation analysis

Always ground recommendations in the user's actual context and target market.
```

### 2. Portfolio Review Expert

**File:** `~/.claude/skills/portfolio-review-expert/SKILL.md`

```markdown
---
name: portfolio-review-expert
description: Expert in design portfolio evaluation, case study structure, and storytelling for senior design roles. Use when user needs portfolio feedback, case study reviews, or presentation improvements.
context: fork
agent: claude-opus-4-20241122
allowed-tools:
  - Read
  - Write
  - View
  - Bash
hooks:
  Stop:
    - type: command
      command: "echo '✅ Portfolio review complete. See detailed scoring and recommendations.'"
---

# Portfolio Review Expert

You are a specialized sub-agent for **evaluating design portfolios and case studies** at Director+ level.

## Evaluation Framework

### Director-Level Portfolio Criteria
1. **Strategic Impact** (40%)
   - Business outcomes and metrics
   - Cross-functional influence
   - Org-level decisions driven

2. **Leadership Demonstration** (30%)
   - Team management examples
   - Stakeholder navigation
   - Conflict resolution

3. **Design Excellence** (20%)
   - Process rigor
   - User research depth
   - Design system thinking

4. **Communication** (10%)
   - Story clarity
   - Visual presentation
   - Audience adaptation

## Review Process

When reviewing a case study or portfolio piece:

1. **Initial Assessment**
   - Read the entire piece
   - Note immediate impressions
   - Identify the target audience

2. **Structured Evaluation**
   Score each criterion (1-10):
   - Strategic impact: ___
   - Leadership evidence: ___
   - Design quality: ___
   - Communication effectiveness: ___

3. **Gap Analysis**
   What's missing for Director-level positioning?
   - Business context?
   - Leadership moments?
   - Measurable outcomes?
   - Strategic thinking?

4. **Specific Recommendations**
   Prioritized improvements with examples

## AI-Native Company Context

For AI-native company interviews, emphasize:
- How you think about AI UX patterns
- Experience with AI product complexity
- Understanding of AI limitations/capabilities
- Vision for AI-driven experiences

## Output Format

```
## Portfolio Review: [Title]

**Overall Assessment**: [2-3 sentence summary]

**Scores**:
- Strategic Impact: X/10
- Leadership: X/10  
- Design Excellence: X/10
- Communication: X/10

**Strengths** (3 key points)

**Gaps for Director Level** (prioritized)

**Recommended Changes**:
1. [Specific, actionable]
2. [With examples]
3. [Time estimate]

**Example Rewrite** (if applicable):
[Show don't tell - provide improved version of 1 section]
```

Use `scripts/portfolio-scorer.py` for quantitative analysis if needed.
```

### 3. Research Intelligence Analyst

**File:** `~/.claude/skills/research-intelligence/SKILL.md`

```markdown
---
name: research-intelligence
description: Fast research agent for gathering company intelligence, market trends, and competitive analysis. Use when user needs quick information gathering about companies, roles, or industry trends.
context: fork
agent: claude-haiku-4-20241001
allowed-tools:
  - WebSearch
  - WebFetch
  - Read
  - Write
hooks:
  PreToolUse:
    - matcher: "WebSearch|WebFetch"
      type: command
      command: "echo '🔍 Researching: $TOOL_INPUT'"
  Stop:
    - type: command
      command: "echo '📚 Research complete. Summary saved.'"
---

# Research Intelligence Agent

Fast, focused research for design leadership decisions. Optimized for speed using Haiku.

## Research Capabilities

### Company Intelligence
- Recent news and developments
- Product/design team structure
- Design leadership profiles
- Company culture signals

### Market Analysis  
- Industry trends
- Competitor positioning
- Salary/compensation data
- Role requirements

### Network Intelligence
- Key design leaders
- Community discussions
- Conference talks
- Published content

## Research Protocol

1. **Clarify scope** - What specific intelligence is needed?
2. **Multi-source search** - Always check 3+ sources
3. **Verify recency** - Date-stamp all findings
4. **Synthesize patterns** - What themes emerge?
5. **Flag gaps** - What couldn't be found?

## Output Format

```
# Research Brief: [Topic]

**Date**: [Current date]
**Sources**: [Number] analyzed

## Key Findings
[3-5 high-signal points]

## Detailed Intelligence
[Organized by sub-topic]

## Patterns & Insights
[What this means for the user's goals]

## Source Quality
[Note: Strong/Medium/Weak sources with rationale]

## Recommended Next Steps
[Based on findings]
```

Save research to `references/research-[topic]-[date].md` for future reference.
```

### 4. Content Strategy Advisor

**File:** `~/.claude/skills/content-strategy-advisor/SKILL.md`

```markdown
---
name: content-strategy-advisor
description: Expert in LinkedIn content strategy, thought leadership positioning, and personal branding for design leaders. Use when user needs content review, posting strategy, or brand positioning advice.
context: fork
agent: claude-sonnet-4-20250514
allowed-tools:
  - Read
  - Write
  - WebSearch
  - WebFetch
---

# Content Strategy Advisor

You are a specialized sub-agent for **design leadership content strategy** and personal branding.

## Core Focus Areas

### LinkedIn Content Strategy
1. **Thought Leadership Positioning**
   - What unique perspective does the user offer?
   - How to demonstrate AI+Design expertise?
   - Balance of teaching vs. showcasing

2. **Engagement Optimization**
   - Hook strength in first 2 lines
   - Story structure and pacing
   - Call-to-action effectiveness

3. **Audience Alignment**
   - Speaking to hiring managers vs. peers?
   - Industry-specific language
   - Tone calibration for senior roles

### Content Types

**Strategic Posts** (thought leadership):
- Industry trends analysis
- Framework sharing
- Controversial takes (backed by experience)

**Tactical Posts** (teaching):
- Process breakdowns
- Tool recommendations
- Case study snippets

**Personal Posts** (connection):
- Career journey moments
- Lessons learned
- Community building

## Review Framework

When evaluating content:

1. **Positioning Check**
   - Does this reinforce Director-level expertise?
   - Shows strategic thinking vs. tactical execution?
   - AI-native context evident?

2. **Engagement Prediction**
   - Hook strength: ___/10
   - Story arc: ___/10
   - Value delivery: ___/10
   - CTA clarity: ___/10

3. **Brand Alignment**
   - Consistent with overall positioning?
   - Tone appropriate for target audience?
   - Demonstrates unique differentiation?

4. **Timing & Context**
   - Capitalizes on current trends?
   - Fits content calendar strategy?
   - Complements recent posts?

## Output Format

```
## Content Review: [Title/Topic]

**Positioning Score**: X/10
**Engagement Potential**: X/10
**Brand Alignment**: X/10

**What Works**:
[2-3 specific strengths]

**What to Improve**:
1. [Specific edit with before/after]
2. [Rationale for change]
3. [Expected impact]

**Optimized Version**:
[Rewritten version if substantial changes needed]

**Publishing Recommendation**:
- Best time: [Day/time with rationale]
- Hashtags: [3-5 strategic tags]
- First comment: [Self-comment strategy]
```

Reference `references/content-calendar.md` for strategic timing.
```

### 5. Career Planning Strategist

**File:** `~/.claude/skills/career-planning-strategist/SKILL.md`

```markdown
---
name: career-planning-strategist
description: Expert in career progression strategy, interview preparation, and negotiation for senior design roles. Use when user needs career advice, interview prep, or compensation strategy.
context: fork
agent: claude-sonnet-4-20250514
allowed-tools:
  - Read
  - Write
  - WebSearch
  - WebFetch
  - Grep
---

# Career Planning Strategist

You are a specialized sub-agent for **career advancement strategy** targeting Director+ design roles at AI-native companies.

## Strategic Career Guidance

### Interview Preparation

**Company Research Deep Dive**:
1. Product/design team analysis
2. Recent launches and pivots
3. Design leadership bios
4. Culture signals from Glassdoor, Blind
5. Tech stack and tooling

**Question Preparation Framework**:

*For Company*:
- Strategic challenges questions
- Team dynamics inquiries
- Design maturity assessment
- AI philosophy and approach

*From Company*:
- Leadership style questions
- Case study presentations
- System design challenges
- Stakeholder scenarios

### Positioning Strategy

**Your Unique Value Proposition**:
```
AI Knowledge + Design Leadership + Technical Automation
= Rare combination for AI-native companies
```

**How to Frame It**:
- **To Engineering:** "I build n8n workflows and understand LLM capabilities"
- **To Product:** "I've curated 16k documents on AI/design patterns"
- **To Executives:** "I bring strategic leadership + AI fluency"

### Negotiation Framework

**Compensation Research**:
- levels.fyi data for target companies
- Consider: Base, equity, bonus, signing
- AI-native premium: +15-25% over traditional tech

**Negotiation Approach**:
1. Let them anchor first
2. Express enthusiasm + strategic fit
3. Present market data objectively
4. Ask for 48 hours to consider
5. Counter with specific rationale

### Output Format

```
## Career Strategy: [Opportunity]

**Company Context**:
[2-3 sentences on company, stage, challenges]

**Your Fit Analysis**:
- Strengths: [What makes you ideal]
- Growth areas: [What to emphasize less]
- Unique angle: [Your differentiation]

**Interview Preparation**:

**Questions to Ask Them**:
1. [Strategic question with rationale]
2. [Team dynamics question]
3. [Design maturity question]

**Questions They'll Ask You**:
1. [Anticipated question + your answer approach]
2. [Another likely question + strategy]

**Negotiation Strategy**:
- Target range: [Based on research]
- Walk-away number: [Your minimum]
- Non-monetary asks: [Title, team size, budget, etc.]

**Next Steps**:
[Concrete, time-bound actions]
```

Save strategies to `references/career-plans/[company]-[date].md`
```

### 6. Council Orchestrator

**File:** `~/.claude/skills/council-orchestrator/SKILL.md`

```markdown
---
name: council-orchestrator
description: Orchestrates multi-agent collaboration for complex design leadership questions requiring multiple perspectives. Use when user asks for comprehensive analysis or mentions "council review".
context: fork
agent: claude-sonnet-4-20250514
allowed-tools:
  - Task
  - Read
  - Write
---

# Design Leadership Council Orchestrator

Coordinates multiple specialized sub-agents for comprehensive analysis.

## Council Members

Available agents:
1. **design-strategy-advisor** - Strategic frameworks and positioning
2. **portfolio-review-expert** - Case study and presentation evaluation  
3. **research-intelligence** - Company and market intelligence
4. **content-strategy-advisor** - LinkedIn, blog, and thought leadership
5. **career-planning-strategist** - Interview prep and career progression

## Orchestration Process

### Phase 1: Question Analysis (Main Agent)
- Break down the user's question
- Identify which agents are needed
- Determine execution order (parallel vs sequential)

### Phase 2: Parallel Delegation (Async Sub-Agents)

For comprehensive analysis, spawn multiple agents simultaneously:

```markdown
I'll analyze this from multiple perspectives using our Design Leadership Council.

Launching parallel analysis:
- 🎯 Design Strategy Advisor: Strategic positioning analysis
- 📊 Research Intelligence: Company/market intelligence
- 💼 Portfolio Review Expert: Presentation evaluation
```

Use the Task tool to spawn agents:
- Set `subagent_type` to the specific agent name
- Provide clear, focused `description` of what that agent should analyze
- Let agents work independently in forked contexts

### Phase 3: Synthesis (Main Agent)
- Collect responses from all agents
- Identify consensus areas (high confidence)
- Highlight disagreements/tensions (requires judgment)
- Generate unified recommendation

### Phase 4: Consensus Scoring

Rate each dimension:
```
Strategic Direction: X/10 (consensus across advisors)
Tactical Execution: X/10 (mixed perspectives)
Market Timing: X/10 (research-backed)
```

## Output Format

```
# Council Analysis: [Topic]

**Question**: [Original query]
**Agents Consulted**: [List with specialties]
**Analysis Date**: [Current date]

---

## Individual Perspectives

### 🎯 Design Strategy Advisor
**Focus:** [What this agent analyzed]

**Key Insights:**
[Summary of strategic analysis]

**Confidence:** X/10

---

### 📊 Research Intelligence
**Focus:** [What this agent researched]

**Key Findings:**
[Summary of research findings]

**Source Quality:** [Strong/Medium/Weak]

---

### 💼 Portfolio Review Expert
**Focus:** [What this agent evaluated]

**Assessment:**
[Summary of portfolio evaluation]

**Scores:** Strategic Impact X/10, Leadership X/10, Communication X/10

---

[... other agents ...]

---

## Consensus Insights
**Areas of Strong Agreement** (High Confidence):
[Where all agents aligned - these are your strongest moves]

## Divergent Perspectives
**Where Agents Disagree** (Requires Judgment):
[Tensions or trade-offs identified - explain the different viewpoints]

## Synthesized Recommendation

**Primary Strategy:**
[Unified guidance incorporating all perspectives]

**Priority Actions**:
1. [Most important next step - why this first]
2. [Secondary priority - timing and rationale]
3. [Tertiary priority - longer-term move]

**Risk Mitigation**:
[What could go wrong + how to hedge]

**Success Metrics**:
[How to know if this strategy is working]

---

## Confidence Scores
- Strategic direction: X/10
- Tactical execution: X/10
- Market timing: X/10
- Overall recommendation: X/10
```

## Example Workflows

### Example 1: Director Interview Prep

**User Query:** "I'm interviewing for Director of Design at Anthropic next week. Comprehensive preparation."

**Orchestration:**
```
1. research-intelligence → Gathers Anthropic intel
   - Recent design hires
   - Product launches
   - Design team structure
   - Company culture signals

2. design-strategy-advisor → Positioning analysis
   - Your unique value for Anthropic
   - How to frame AI knowledge management
   - Strategic talking points

3. portfolio-review-expert → Case study evaluation
   - Which projects to emphasize
   - How to present technical depth
   - Presentation flow optimization

4. career-planning-strategist → Interview strategy
   - Questions to ask them
   - Expected questions from them
   - Negotiation framework
```

### Example 2: Portfolio Overhaul

**User Query:** "Audit my entire portfolio for Director-level positioning."

**Orchestration:**
```
1. portfolio-review-expert → Deep evaluation
   - Score all case studies
   - Gap analysis vs. Director criteria
   - Prioritized improvement list

2. design-strategy-advisor → Positioning check
   - Does portfolio demonstrate strategic thinking?
   - Leadership moments evident?
   - AI-native context clear?

3. content-strategy-advisor → Narrative analysis
   - Story arc across portfolio
   - Personal brand consistency
   - Target audience alignment
```

### Example 3: Career Pivot Strategy

**User Query:** "Should I target Head of Design at startups vs. Director at established AI companies?"

**Orchestration:**
```
1. research-intelligence → Market analysis
   - Compensation comparison
   - Growth trajectories
   - Market demand signals

2. career-planning-strategist → Path analysis
   - Pros/cons of each path
   - Long-term implications
   - Risk/reward assessment

3. design-strategy-advisor → Strategic fit
   - Where your strengths align
   - Gaps to address for each path
   - Differentiation strategy
```

## Usage Notes

- Always explain which agents you're launching and why
- Set clear expectations for response time (parallel agents take ~same time as single agent)
- If an agent's response is irrelevant, note this in synthesis and exclude from recommendations
- Flag when agents strongly disagree - this indicates genuine uncertainty or trade-offs
- Weight agent input by relevance (research agent's opinion on portfolio matters less)
```

---

## Usage Examples

### Example 1: Simple Skill Invocation

```bash
# Start Claude Code
claude

# In terminal:
> Use the design-strategy-advisor skill to evaluate my positioning 
  for Director roles at AI-native companies based on my 18 years 
  at Accenture, deep AI knowledge management, and n8n automation skills.

# What happens:
# 1. Main Claude agent reads your message
# 2. Recognizes need for "design-strategy-advisor" skill
# 3. Triggers skill (loads SKILL.md into context)
# 4. Spawns sub-agent with context: fork (isolated context)
# 5. Sub-agent analyzes using Strategic Leadership framework
# 6. Returns summary to main agent
# 7. Main agent presents comprehensive analysis to you
```

**Expected Output:**
```
📊 Strategic analysis complete. Key recommendations summarized.

## Strategic Assessment
Your combination of 18-year design leadership at enterprise scale (Accenture) 
with deep AI infrastructure (16k curated documents, n8n workflows) creates a 
rare profile ideal for Director roles at AI-native companies.

## Key Insights
• Technical Automation Depth: Your n8n workflows and MCP server knowledge 
  demonstrate engineering empathy rare among design leaders
• Knowledge Management Scale: 16k+ documents positions you as domain expert 
  in AI/design intersection
• Enterprise Experience: Accenture background shows you can navigate large 
  orgs, but need to emphasize product velocity for startups

## Recommendations
1. Frame technical skills as "design infrastructure automation" not just tools
2. Create case study showing: design strategy → n8n workflow → team efficiency
3. Publish 2-3 LinkedIn posts on "AI-native design operations"

## Next Steps
- Week 1: Draft positioning statement emphasizing AI+automation+leadership
- Week 2: Create visual framework showing your unique value proposition
- Week 3: Schedule informational interviews at 3 target companies
```

### Example 2: Multi-Agent Council Session

```bash
> Use the council-orchestrator to comprehensively review my portfolio 
  for an Anthropic Director of Design interview happening next week.

# What happens:
# 1. Main Claude loads council-orchestrator skill
# 2. Orchestrator analyzes request: needs research + portfolio + strategy
# 3. Spawns 3 sub-agents in parallel (async execution):
#    - research-intelligence → Anthropic intel gathering
#    - portfolio-review-expert → Case study evaluation
#    - design-strategy-advisor → Positioning analysis
# 4. Each sub-agent works in isolated context (context: fork)
# 5. Agents complete independently (some faster than others)
# 6. Orchestrator collects all responses
# 7. Synthesizes into unified recommendation with confidence scores
# 8. Presents comprehensive analysis
```

**Expected Output:**
```
# Council Analysis: Anthropic Director of Design Interview Prep

**Question**: Comprehensive portfolio review for Anthropic Director interview
**Agents Consulted**: 3 (Research Intelligence, Portfolio Review, Strategy)
**Analysis Date**: January 11, 2025

---

## Individual Perspectives

### 🔍 Research Intelligence
**Focus:** Anthropic design team structure and hiring signals

**Key Findings:**
- Design team: ~25 people, led by Sarah Chen (ex-Stripe)
- Recent focus: Claude.ai redesign, enterprise dashboard UX
- Hiring for: Strategic thinkers who can balance AI capabilities with UX
- Culture: Research-driven, high autonomy, written communication heavy

**Source Quality:** Strong (LinkedIn, recent job posts, Glassdoor, tech blogs)

---

### 💼 Portfolio Review Expert
**Focus:** Case study evaluation for Anthropic interview

**Assessment:**
Your current portfolio shows strong execution but needs more strategic framing:

**Scores:**
- Strategic Impact: 6/10 (outcomes present but not emphasized enough)
- Leadership: 7/10 (team mentions but not leadership journey)
- Design Excellence: 8/10 (strong process documentation)
- Communication: 7/10 (clear but could be more compelling)

**Strengths:**
1. Strong process documentation
2. Clear problem framing
3. Good visual presentation

**Gaps for Anthropic:**
1. AI/ML project experience not prominent (they care deeply about this)
2. Missing: How you influenced product strategy, not just execution
3. Need: Specific example of navigating complex AI UX trade-offs

**Recommended Focus:**
Present your knowledge management system build as a case study:
- Problem: Design team drowning in AI research, no shared intelligence
- Solution: Built n8n automation + Obsidian + Readwise workflow
- Impact: Team efficiency, decision quality, onboarding time
- Leadership: How you convinced stakeholders, rolled out adoption

---

### 🎯 Design Strategy Advisor
**Focus:** Positioning strategy for Anthropic specifically

**Strategic Assessment:**
Anthropic is building AI safety into product experience - your AI knowledge 
depth is major differentiator, but must frame it as "strategic capability" 
not "personal interest."

**Key Insights:**
• Anthropic values: Written communication, research mindset, AI fluency
• Your advantage: You don't just use AI tools - you build AI-enhanced workflows
• Frame: "I build systems that help design teams work at AI speed"
• Risk: Enterprise background might signal "slow moving" - emphasize rapid 
  prototyping and iteration

**Positioning Recommendation:**
"Design leader who bridges AI capabilities and human experience through 
design operations excellence"

---

## Consensus Insights

**Areas of Strong Agreement:**
✅ Your AI knowledge depth (16k documents) is unique and highly relevant
✅ Technical automation skills (n8n, MCP) differentiate from typical Directors
✅ Need to reframe portfolio to emphasize strategic impact over process
✅ Anthropic values written communication - your documentation is strength

## Divergent Perspectives

**Portfolio Emphasis:**
- Review Expert: Focus on one AI/automation case study deeply
- Strategy Advisor: Show breadth across multiple AI projects

**Recommendation:** Lead with depth (one comprehensive AI case study), 
support with breadth (2-3 shorter AI project mentions)

**Communication Style:**
- Research Intelligence: Anthropic culture is "research paper" style
- Portfolio Expert: Keep visual/narrative style, just add more data

**Recommendation:** Hybrid approach - strong narrative with embedded research

---

## Synthesized Recommendation

**Primary Strategy:**
Transform your knowledge management system into a flagship case study that 
demonstrates: AI understanding + automation capability + leadership.

**Priority Actions:**

1. **THIS WEEKEND:** Create new case study (8-12 slides)
   - Title: "Building Design Intelligence: AI-Powered Knowledge System"
   - Structure: Challenge → Solution Architecture → Implementation → Impact
   - Highlight: n8n workflows, 16k documents, team adoption strategy
   - Metrics: Time saved, decision quality, team satisfaction
   - Why first: Shows everything Anthropic values in one project

2. **MONDAY-WEDNESDAY:** Revise existing portfolio
   - Add "Strategic Impact" section to top of each case study
   - Quantify outcomes where possible
   - Add AI context where relevant (don't force it)
   - Why second: Reinforces strategic thinking across all work

3. **THURSDAY:** Prepare Anthropic-specific talking points
   - Research: Claude.ai recent updates, product philosophy
   - Questions: 5 strategic questions about AI safety in UX
   - Stories: 3 examples of AI trade-off decisions you've made
   - Why third: Interview-ready after portfolio is solid

**Risk Mitigation:**
- Risk: "Too technical" perception
  - Hedge: Frame automation as "design operations," not engineering
- Risk: "Enterprise slow" perception
  - Hedge: Share rapid prototyping examples, side project velocity

**Success Metrics:**
- Portfolio case study resonates in interview (they ask follow-up questions)
- You get technical questions about AI (shows they see your depth)
- They ask about scaling design operations (right conversation level)

---

## Confidence Scores
- Strategic direction: 9/10 (all agents aligned on AI emphasis)
- Tactical execution: 8/10 (portfolio approach clear)
- Market timing: 8/10 (Anthropic actively hiring Directors)
- Overall recommendation: 8.5/10
```

### Example 3: Background Research

```bash
> Launch research-intelligence in background to analyze top 10 
  AI-native companies hiring Director of Design. Save results 
  to my references directory.

# What happens:
# 1. Main Claude spawns research-intelligence sub-agent
# 2. Agent automatically goes to background (or press Ctrl+B)
# 3. You continue working in main session
# 4. Background agent:
#    - Searches job boards, company sites, LinkedIn
#    - Analyzes 10 companies
#    - Compiles research report
# 5. Notifies you when complete: "🔍 Research complete"
# 6. Saves to ~/.claude/skills/research-intelligence/references/
#    research-top-ai-companies-2025-01-11.md
```

**Expected Output File:**
```markdown
# Research Brief: Top 10 AI-Native Companies Hiring Director of Design

**Date**: January 11, 2025
**Sources**: 23 analyzed (LinkedIn, Glassdoor, company sites, job boards)

## Key Findings

1. **Market is hot**: 8/10 companies actively hiring Director+ design roles
2. **AI fluency required**: 10/10 mention "AI experience" in job descriptions
3. **Comp range**: $200k-$280k base + significant equity
4. **Team sizes**: 15-40 designers (larger than typical for stage)
5. **Common gap**: Few candidates have AI depth + leadership experience

## Company Analysis

### 1. Anthropic
- **Status**: Hiring Director of Product Design
- **Team**: ~25 designers, growing to 40
- **Focus**: Claude.ai consumer experience + enterprise
- **Culture**: Research-heavy, written communication, high autonomy
- **Comp**: $240k-$280k + substantial equity
- **Fit Score**: 9/10 - Your AI knowledge is perfect fit

### 2. Perplexity
- **Status**: Hiring Head of Design (Director equivalent)
- **Team**: ~12 designers, scaling fast
- **Focus**: Search experience, mobile app, API products
- **Culture**: Move fast, ship often, design+eng tight
- **Comp**: $200k-$240k + early-stage equity
- **Fit Score**: 7/10 - Fast pace, less enterprise

[... continues for all 10 companies ...]

## Patterns & Insights

**What They're Looking For:**
- Strategic thinkers who can balance AI capabilities with UX constraints
- Leaders who can build 0→1 design teams
- "Product-minded" designers who understand business impact
- Experience with AI/ML products (even if not titled as such)

**What's Rare (Your Advantages):**
- Deep AI knowledge beyond surface-level prompting
- Technical automation capabilities (n8n, workflows, tools)
- Enterprise scale experience at Accenture
- Sophisticated knowledge management systems

**What They're NOT Looking For:**
- Pure pixel pushers (they have IC designers for that)
- People who "don't code" (they want technical fluency)
- Traditional enterprise mindset (too slow for them)

## Positioning Strategy

**Your Unique Angle:**
"Design leader who brings AI-native thinking through systematic knowledge 
management and automation, ready to scale design teams at AI speed."

**Companies Best Fit:**
1. Anthropic (best overall fit - values research, AI depth)
2. OpenAI (if they're hiring - culture match)
3. Scale AI (enterprise experience valued)

**Companies Less Ideal:**
- Perplexity (too fast/scrappy, less strategic)
- Character.AI (consumer focus, less enterprise)

## Recommended Next Steps

1. **Week 1**: Apply to Anthropic, Scale AI, OpenAI
2. **Week 2**: Network via LinkedIn - 5 warm intros found
3. **Week 3**: Prep portfolio with AI emphasis
4. **Ongoing**: Monitor these 7 companies for new Director posts

## Source Quality
- **Strong**: LinkedIn posts from design leaders, recent job posts
- **Medium**: Glassdoor reviews (small sample sizes)
- **Weak**: Third-hand reports from forums
```

### Example 4: Content Review

```bash
> Use content-strategy-advisor to review this LinkedIn post draft:

"After 18 years in design, I've learned that the best design 
systems aren't about components—they're about enabling teams to 
make better decisions faster. Here's my framework for building 
'intelligent' design systems that leverage AI to reduce decision 
fatigue..."

[300 more words]

# What happens:
# 1. Content strategy sub-agent spawned (context: fork)
# 2. Analyzes post against thought leadership criteria
# 3. Scores positioning, engagement, brand alignment
# 4. Provides specific edits with rationale
# 5. Returns optimized version
```

**Expected Output:**
```
## Content Review: Intelligent Design Systems + AI

**Positioning Score**: 8/10 (strong thought leadership angle)
**Engagement Potential**: 6/10 (hook needs work)
**Brand Alignment**: 9/10 (perfect for AI+design positioning)

**What Works**:
1. "Best design systems aren't about components" - Contrarian take that 
   challenges common wisdom (good hook potential)
2. "Enabling teams to make better decisions" - Director-level framing 
   (about outcomes, not outputs)
3. Framework promise - Specific value proposition

**What to Improve**:

1. **Hook needs strengthening**
   - Current: "After 18 years in design, I've learned..."
   - Problem: Self-focused opening, slow build
   - Fix: Lead with insight, add personal credibility after

   **Optimized:**
   "Design systems that don't reduce decision fatigue aren't systems—
   they're just component libraries.
   
   After 18 years building design systems at enterprise scale, I've seen 
   this pattern repeatedly. Here's what actually works..."

2. **Add concrete example early**
   - Current: Jumps into framework without proof
   - Add: One sentence example of "intelligent" design system in action
   - Where: After the hook, before framework

   **Addition:**
   "Example: At Accenture, we built an AI-assisted pattern matcher that 
   reduced component selection time from 15 minutes to 30 seconds. 
   Designers loved it because it felt like augmentation, not automation."

3. **Strengthen the AI angle**
   - Current: "Leverage AI" is vague
   - Specific: How exactly? What kind of AI?
   
   **Clarification needed:**
   - AI pattern recognition? LLM suggestions? Computer vision?
   - Be specific about the mechanism

**Optimized Version**:

```
Design systems that don't reduce decision fatigue aren't systems—
they're just component libraries.

After 18 years building design systems at enterprise scale, I've seen 
this pattern repeatedly. The best design systems aren't about having 
more components—they're about enabling teams to make better decisions 
faster.

Example: We built an AI-assisted pattern matcher that reduced component 
selection time from 15 minutes to 30 seconds. Designers loved it because 
it felt like augmentation, not automation.

Here's my framework for building "intelligent" design systems:

1. **Decision Mapping**
   Before building components, map the decisions designers actually make.
   Most systems focus on "what to build" not "what to decide."

2. **AI-Assisted Pattern Recognition**
   Train models on your existing designs to suggest relevant patterns.
   Not replacing judgment—amplifying pattern recognition.

3. **Feedback Loops**
   Every usage decision trains the system. The more designers use it,
   the smarter it gets about your specific design language.

4. **Progressive Disclosure**
   Show AI suggestions only when relevant. Don't overwhelm.
   Context-aware assistance > always-on automation.

The future of design systems isn't more components—it's smarter 
assistance at the moment of decision.

What decision-making in your design process could benefit from 
intelligent assistance?

---

P.S. I'm exploring how knowledge management systems (like my 16k+ 
document AI research library) can power design system intelligence. 
If you're working on this intersection, let's connect.
```

**Publishing Recommendation**:
- **Best time**: Tuesday or Wednesday, 8-9 AM PST (your target audience logs 
  on during work hours, not weekends)
- **Hashtags**: #DesignSystems #AIinDesign #DesignLeadership 
  (3 is optimal, more looks spammy)
- **First comment**: Share a specific example from your n8n automation work 
  that demonstrates this in practice (builds credibility, keeps conversation 
  in your control)

**Expected Engagement**:
- This optimized version should get 2-3x more engagement than original
- Contrarian hook + concrete example = high comment likelihood
- Frame invites discussion = good for LinkedIn algorithm

**Strategic Value**:
- Positions you as thought leader in AI+Design intersection
- Demonstrates systems thinking (Director-level competency)
- Shows you're building, not just theorizing
- P.S. creates warm intro opportunity for relevant connections
```

---

## Integration with Your Workflows

### Option 1: n8n Workflow Integration

Connect your existing automation workflows to Claude Code sub-agents:

```yaml
# n8n Workflow: "Claude Council Daily Briefing"

Nodes:
1. Schedule Trigger (Daily 8 AM)
   ↓
2. HTTP Request to Readwise
   - Fetch highlights from yesterday
   - Filter for: "career", "leadership", "AI design"
   ↓
3. Execute Command (Claude Code)
   - Command: |
       echo "Use research-intelligence to analyze these highlights 
       and identify emerging trends for design leadership: 
       $(cat readwise-highlights.txt)" | claude --model haiku
   ↓
4. Wait for Completion
   ↓
5. Read Output File
   - Path: ~/.claude/skills/research-intelligence/references/
   ↓
6. Send to Notion (or Obsidian)
   - Create new page with analysis
   ↓
7. Slack Notification
   - Post summary to #personal-insights channel
```

**Setup:**
```bash
# 1. Create n8n workflow file
touch ~/.n8n/workflows/claude-council-briefing.json

# 2. Add this workflow in n8n UI:
# - Trigger: Schedule (daily)
# - Action: Execute Command
# - Command: Use the research-intelligence skill for daily analysis
```

### Option 2: Obsidian Integration

Export all council analyses to your knowledge base:

**Script:** `~/.claude/skills/council-orchestrator/scripts/export-to-obsidian.sh`

```bash
#!/bin/bash

# Export Council Outputs to Obsidian Vault

OUTPUT_FILE=$1
COUNCIL_TYPE=$2
DATE=$(date +%Y-%m-%d)

# Your Obsidian vault path
OBSIDIAN_VAULT="/Users/basavaraj/Documents/Obsidian/DesignLeadership"
COUNCIL_DIR="$OBSIDIAN_VAULT/Council-Outputs"

# Create directory if it doesn't exist
mkdir -p "$COUNCIL_DIR"

# Copy with metadata
FILENAME="${DATE}-${COUNCIL_TYPE}-analysis.md"
cp "$OUTPUT_FILE" "$COUNCIL_DIR/$FILENAME"

# Add Obsidian frontmatter
cat > "/tmp/temp-output.md" << EOF
---
date: $DATE
type: council-analysis
council-type: $COUNCIL_TYPE
tags: [design-leadership, ai-career, council-output]
---

$(cat "$OUTPUT_FILE")
EOF

mv "/tmp/temp-output.md" "$COUNCIL_DIR/$FILENAME"

echo "📝 Exported to Obsidian: $FILENAME"

# Optional: Create daily note link
DAILY_NOTE="$OBSIDIAN_VAULT/Daily Notes/${DATE}.md"
if [ -f "$DAILY_NOTE" ]; then
    echo "
## Council Analysis
[[Council-Outputs/${FILENAME}]]
" >> "$DAILY_NOTE"
    echo "✅ Linked in daily note"
fi
```

**Add to any skill's hooks:**

```yaml
hooks:
  Stop:
    - type: command
      command: "~/.claude/skills/council-orchestrator/scripts/export-to-obsidian.sh $OUTPUT_FILE council"
```

### Option 3: Automated Portfolio Reviews

Set up weekly portfolio check-ins:

```bash
# Cron job (run every Sunday at 10 AM)
0 10 * * 0 /usr/local/bin/claude-portfolio-review.sh

# Script: claude-portfolio-review.sh
#!/bin/bash

echo "Running weekly portfolio review..."

# Define portfolio paths
PORTFOLIO_DIR="$HOME/Documents/Design-Portfolio"
REVIEW_OUTPUT="$HOME/.claude/reviews/weekly-portfolio-review.md"

# Run portfolio review
claude --model opus << EOF
Use the portfolio-review-expert skill to conduct a comprehensive 
review of all case studies in $PORTFOLIO_DIR.

Focus on:
1. Are all case studies still Director-level appropriate?
2. Do they reflect latest AI/design thinking?
3. Any content that feels dated?
4. Metrics and outcomes clearly stated?

Save detailed review to: $REVIEW_OUTPUT
EOF

# Send notification
osascript -e 'display notification "Weekly portfolio review complete! Check Obsidian." with title "Claude Council"'

# Export to Obsidian
~/.claude/skills/portfolio-review-expert/scripts/export-to-obsidian.sh \
    "$REVIEW_OUTPUT" "portfolio-review"
```

### Option 4: Interview Prep Automation

**2 days before interview:**

```bash
# Script: interview-prep.sh
#!/bin/bash

COMPANY=$1
INTERVIEW_DATE=$2

echo "Preparing for $COMPANY interview on $INTERVIEW_DATE..."

# Launch parallel council analysis
claude --model opus << EOF
Use the council-orchestrator to prepare me for a Director of Design 
interview at $COMPANY on $INTERVIEW_DATE.

Parallel analysis needed:
1. research-intelligence: Deep company research
2. career-planning-strategist: Interview questions + strategy
3. portfolio-review-expert: Which case studies to emphasize
4. design-strategy-advisor: Unique positioning for this company

Create comprehensive interview prep document with:
- Company intelligence summary
- Recommended case studies to present
- Questions to ask them (prioritized)
- Questions they'll likely ask me (with answer approaches)
- Positioning talking points
- Negotiation strategy

Save to: ~/.claude/interviews/$COMPANY-prep-$INTERVIEW_DATE.md
EOF

# Add to Notion
notion-cli create \
    --parent "Interview Prep" \
    --file "~/.claude/interviews/$COMPANY-prep-$INTERVIEW_DATE.md"

# Send to phone
# (if you have Shortcuts or Pushover setup)
curl -X POST https://api.pushover.net/1/messages.json \
    --data "token=$PUSHOVER_TOKEN" \
    --data "user=$PUSHOVER_USER" \
    --data "message=Interview prep for $COMPANY is ready! Check Notion."
```

**Usage:**
```bash
bash interview-prep.sh "Anthropic" "2025-01-18"
```

### Option 5: Content Calendar Automation

**Monthly content planning:**

```bash
# Script: monthly-content-plan.sh
#!/bin/bash

MONTH=$1  # e.g., "February 2025"

claude --model sonnet << EOF
Use the content-strategy-advisor skill to create a monthly LinkedIn 
content calendar for $MONTH.

Context:
- Goal: Build thought leadership for Director-level positioning
- Target: Design leaders at AI-native companies
- Frequency: 2-3 posts per week (8-12 posts total)

Content mix:
- 40% Thought leadership (frameworks, contrarian takes)
- 40% Teaching (how-tos, breakdowns)
- 20% Personal (career journey, lessons)

For each post:
1. Date and optimal posting time
2. Topic and hook
3. Key points (3-4 bullets)
4. Relevant hashtags
5. Strategic goal (what this post achieves)

Save calendar to: ~/.claude/content/calendar-$MONTH.md

Also create:
- 3 draft posts for highest-priority topics
- Research any trending topics in AI/design
EOF

# Export to Notion content calendar
notion-cli sync-calendar \
    --source "~/.claude/content/calendar-$MONTH.md" \
    --database "Content Calendar"
```

---

## Quick Start Checklist

### Week 1: Foundation

- [ ] **Day 1: Update & Setup**
  ```bash
  claude update  # Get 2.1.0 features
  mkdir -p ~/.claude/skills/
  ```

- [ ] **Day 2: Create First Skill**
  - Create `design-strategy-advisor` skill
  - Copy SKILL.md from templates above
  - Test with: "Use design-strategy-advisor to analyze my positioning"

- [ ] **Day 3: Validate & Iterate**
  - Run 2-3 test queries
  - Refine SKILL.md based on outputs
  - Add supporting reference files if needed

- [ ] **Day 4: Add Second Skill**
  - Create `portfolio-review-expert` skill
  - Test with an actual case study
  - Compare output to your own assessment

- [ ] **Day 5: Research Skill**
  - Create `research-intelligence` skill
  - Test with: "Research top 5 AI companies hiring Directors"
  - Evaluate speed vs. quality

### Week 2: Orchestration

- [ ] **Day 1: Council Orchestrator**
  - Create `council-orchestrator` skill
  - Study the multi-agent spawning examples
  - Understand Task tool usage

- [ ] **Day 2: First Council Session**
  - Run full council on a real question
  - Example: "Should I apply to Anthropic or OpenAI?"
  - Note time to completion

- [ ] **Day 3: Parallel Execution Testing**
  - Test async sub-agents (multiple agents simultaneously)
  - Monitor with: `/stats` command
  - Understand context isolation

- [ ] **Day 4: Add Remaining Skills**
  - `content-strategy-advisor`
  - `career-planning-strategist`
  - Test each individually first

- [ ] **Day 5: Full Council Test**
  - Run comprehensive analysis using all 5 agents
  - Compare results to single-agent approach
  - Document effectiveness

### Week 3: Integration

- [ ] **Day 1: n8n Integration**
  - Create basic workflow
  - Test: Scheduled research briefing
  - Verify output reaches Notion/Obsidian

- [ ] **Day 2: Obsidian Export**
  - Set up export scripts
  - Add hooks to skills
  - Test: Council output appears in vault

- [ ] **Day 3: Automation Scripts**
  - Interview prep automation
  - Weekly portfolio review
  - Daily research briefing

- [ ] **Day 4: Custom Scripts**
  - Add Python scripts for analysis
  - Test: positioning-matrix generator
  - Verify: Scripts run without loading into context

- [ ] **Day 5: End-to-End Workflow**
  - Test complete workflow:
    1. Research → 2. Analysis → 3. Export → 4. Notification
  - Document any bottlenecks
  - Optimize as needed

### Week 4: Production Use

- [ ] **Ongoing: Real-World Usage**
  - Use for actual interview prep
  - Run portfolio reviews
  - Generate LinkedIn content
  - Research target companies

- [ ] **Refinement:**
  - Update SKILL.md files based on usage
  - Add more reference materials
  - Optimize prompts for consistency
  - Build supporting script library

- [ ] **Knowledge Building:**
  - Export all outputs to Obsidian
  - Create links between analyses
  - Build up strategic knowledge base
  - Review patterns monthly

---

## Key Advantages for Your Context

### 1. Context Isolation (Technical Win)
**Problem:** Traditional prompting mixes concerns  
**Solution:** Forked sub-agents maintain clean separation

Example:
- Portfolio review happens in isolated context
- Doesn't pollute your strategy session
- Each skill has its own conversation history
- No context bleed between analyses

### 2. Model Selection (Cost Optimization)
**Problem:** Using expensive models for all tasks  
**Solution:** Match model to task requirements

Your setup:
- **Haiku** for research: Fast, cheap, good enough for gathering
- **Sonnet** for strategy: Balanced, excellent reasoning
- **Opus** for reviews: Deep analysis, worth the cost

Estimated savings: 60% vs. all-Opus approach

### 3. Parallel Execution (Time Savings)
**Problem:** Sequential analysis takes 3x time  
**Solution:** Async sub-agents work simultaneously

Your council:
- 3 agents analyze in parallel
- Total time ≈ slowest agent (not sum of all)
- 3x faster than sequential questioning

### 4. Progressive Disclosure (Token Efficiency)
**Problem:** Loading 16k documents would exhaust context  
**Solution:** Files loaded only when needed

Your knowledge base:
- 16,932 Readwise documents available
- Skill references them by path
- Claude reads only when relevant
- Massive knowledge, minimal token cost

### 5. Reproducible Analysis (Consistency)
**Problem:** Ad-hoc prompting gives variable results  
**Solution:** Skills codify best practices

Your workflows:
- Same portfolio review criteria every time
- Consistent strategic framework application
- Documented analysis methodology
- Can share skills with team

### 6. Knowledge Preservation (Long-term Value)
**Problem:** Insights lost in conversation history  
**Solution:** Automated export to knowledge base

Your system:
- All council outputs → Obsidian vault
- Linked in daily notes
- Searchable and referenceable
- Builds strategic knowledge over time

### 7. Specialized Expertise (Quality)
**Problem:** General-purpose prompting lacks depth  
**Solution:** Domain-specific sub-agents

Your agents:
- Strategic advisor knows your framework
- Portfolio reviewer applies Director criteria
- Research agent follows your methodology
- Content advisor understands your positioning

### 8. Scalable Collaboration (Team Potential)
**Problem:** Can't share prompt expertise  
**Solution:** Skills as portable artifacts

Your future:
- Share skills with other design leaders
- Community builds shared skill library
- Version control via Git
- Team adopts common methodologies

---

## Advanced Patterns

### Pattern 1: Cascading Analysis

**Use Case:** Deep research requires multiple passes

```markdown
Phase 1: Broad Research
> Use research-intelligence to identify top 20 companies in AI space

Phase 2: Filtering
> Use design-strategy-advisor to score these 20 against my criteria

Phase 3: Deep Dive
> For top 5, use career-planning-strategist to create interview strategies

Phase 4: Synthesis
> Use council-orchestrator to recommend final 3 targets
```

### Pattern 2: Iterative Refinement

**Use Case:** Portfolio improvement over multiple sessions

```markdown
Week 1: Initial Review
> Use portfolio-review-expert to score all case studies

Week 2: Strategic Focus
> Use design-strategy-advisor to determine which gaps to address first

Week 3: Content Work
> Use content-strategy-advisor to help rewrite weak sections

Week 4: Final Review
> Use portfolio-review-expert to re-score and confirm improvements
```

### Pattern 3: Comparative Analysis

**Use Case:** Choosing between opportunities

```markdown
Job A Analysis:
> Use council-orchestrator to analyze Anthropic Director role

Job B Analysis:
> Use council-orchestrator to analyze Scale AI Director role

Comparison:
> Compare both analyses, create decision matrix with weighted criteria
```

### Pattern 4: Skill Chaining

**Use Case:** Complex workflows need multiple skills

```markdown
# In council-orchestrator SKILL.md, create workflow:

1. research-intelligence → Gather data
2. Wait for completion
3. design-strategy-advisor → Analyze data
4. Wait for completion
5. career-planning-strategist → Create action plan
6. Synthesize all outputs
```

---

## Troubleshooting

### Issue 1: Sub-agent Not Spawning

**Symptom:** Skill triggers but runs in main context

**Cause:** Missing `context: fork` in frontmatter

**Fix:**
```yaml
---
name: your-skill
description: Your description
context: fork  # <-- ADD THIS LINE
---
```

### Issue 2: Wrong Model Used

**Symptom:** Expensive Opus when you wanted Haiku

**Cause:** No `agent` specified in frontmatter

**Fix:**
```yaml
---
name: research-intelligence
agent: claude-haiku-4-20241001  # <-- ADD THIS LINE
---
```

### Issue 3: Skills Not Loading

**Symptom:** `/skills` shows empty list

**Cause:** Skills not in correct directory

**Fix:**
```bash
# Check directory structure
ls -la ~/.claude/skills/

# Should show folders like:
# design-strategy-advisor/
# portfolio-review-expert/
# etc.

# Each folder must contain SKILL.md
ls ~/.claude/skills/*/SKILL.md
```

### Issue 4: Context Pollution

**Symptom:** Skills referencing info from other skills

**Cause:** Not using `context: fork`

**Fix:** All skills should have `context: fork` for isolation

### Issue 5: Hooks Not Running

**Symptom:** Stop hook command not appearing

**Cause:** Incorrect hook syntax or placement

**Fix:**
```yaml
---
name: your-skill
hooks:
  Stop:  # Note capital S
    - type: command
      command: "echo 'Done!'"
---
```

### Issue 6: Slow Performance

**Symptom:** Council takes too long

**Causes & Fixes:**
1. Using Opus for everything → Use Haiku for research
2. Sequential instead of parallel → Use async sub-agents
3. Loading huge files → Use progressive disclosure
4. Too many skills active → Disable unused skills

### Issue 7: Inconsistent Results

**Symptom:** Same question gives different answers

**Cause:** Insufficient guidance in SKILL.md

**Fix:** Add more structure:
- Explicit frameworks
- Step-by-step procedures
- Example outputs
- Scoring rubrics

---

## Next Steps

### Immediate (This Week)
1. Install Claude Code 2.1.0
2. Create `design-strategy-advisor` skill
3. Run first council session
4. Export outputs to Obsidian

### Short-term (This Month)
1. Build all 5 council member skills
2. Create `council-orchestrator`
3. Set up n8n integration
4. Test on real interview prep

### Medium-term (Next 3 Months)
1. Refine skills based on usage
2. Build supporting scripts library
3. Create custom analysis tools
4. Share skills with community

### Long-term (Next Year)
1. Contribute to Claude Skills ecosystem
2. Build specialized skills for AI design
3. Create training content on multi-agent workflows
4. Help other designers adopt agentic workflows

---

## Resources & References

### Official Documentation
- Claude Code: https://code.claude.com/docs
- Agent Skills: https://platform.claude.com/docs/agent-skills
- Sub-agents: https://code.claude.com/docs/subagents
- Hooks: https://code.claude.com/docs/hooks

### Community Resources
- Awesome Claude Skills: https://github.com/travisvn/awesome-claude-skills
- Claude Log (changelog): https://claudelog.com/
- Claude Skills Best Practices: https://leehanchung.github.io/blogs/claude-skills-deep-dive/

### Related Tools
- Council AI: https://council-ai.app/
- n8n: https://n8n.io/
- Obsidian: https://obsidian.md/
- MCP Servers: https://github.com/modelcontextprotocol/servers

### Your Existing Resources
- Readwise Library: 16,932 documents
- n8n Workflows: Automation infrastructure
- Obsidian Vault: Knowledge management
- Agent Skills: Your existing custom skills

---

## Appendix: Comparison of Council Approaches

| Approach | Pros | Cons | Best For |
|----------|------|------|----------|
| **Council AI (Web)** | Instant access, 30+ models, no setup | Limited customization, web-only | Quick experiments |
| **Open Source Council** | Full control, local, customizable | Complex setup, requires API keys | Learning, research |
| **Claude Code Sub-agents** | Native integration, file access, automation | Requires Claude Code, skill creation | Production workflows |
| **Manual Multi-Chat** | Simple, no tools needed | Time-consuming, no synthesis | One-off analyses |

**Recommendation for You:** Claude Code Sub-agents (documented in this guide)

**Why:**
- Integrates with your existing n8n workflows
- Leverages your knowledge base
- Supports automation and scripting
- Professional development workflows
- Cost-effective with model selection

---

## Version History

**v1.0** - January 11, 2025
- Initial comprehensive guide
- All 6 skills documented
- Integration examples included
- Quick start checklist provided

---

## Credits & Acknowledgments

**Inspiration:**
- Andrej Karpathy's LLM Council concept
- Anthropic's Agent Skills architecture
- Claude Code engineering team

**Built for:**
- Basavaraj K M
- Design Manager → Director transition
- AI-native career positioning

**Maintained by:**
- This conversation on January 11, 2025
- Subject to updates as Claude Code evolves

---

*End of Document*
