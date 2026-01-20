// Updated: 2026-01-18 14:00:00
// EAMES V2.0 - Intent Analyzer (Stage 0)
// Purpose: Analyze query clarity and route to Ask/Plan/Execute modes

import { ChatAnthropic } from '@langchain/anthropic';
import { z } from 'zod';

// ============================================================================
// Types & Schemas
// ============================================================================

/**
 * Context level - how much information the user provided
 */
export type ContextLevel = 'none' | 'partial' | 'complete';

/**
 * Recommended mode based on intent analysis
 */
export type RecommendedMode = 'ask' | 'plan' | 'execute';

/**
 * Design domain classification
 */
export type DesignDomain = 
  | 'discovery'      // Research, competitor analysis
  | 'define'         // PRD, requirements
  | 'design'         // UI/UX, wireframes
  | 'develop'        // Code generation
  | 'deliver'        // Deployment
  | 'general';       // General design question

/**
 * Intent Analysis Result
 */
export interface IntentAnalysis {
  query: string;
  clarity_score: number;          // 0.0 (vague) to 1.0 (crystal clear)
  context_level: ContextLevel;    // none, partial, complete
  domain: DesignDomain;            // which design phase
  deliverable: string;             // what user wants (PRD, code, analysis)
  recommended_mode: RecommendedMode; // ask, plan, or execute
  reasoning: string;               // why this classification
  missing_context?: string[];      // what's missing (if vague)
}

/**
 * Zod schema for structured output
 */
const IntentAnalysisSchema = z.object({
  clarity_score: z.number().min(0).max(1).describe('0.0 = very vague, 1.0 = crystal clear'),
  context_level: z.enum(['none', 'partial', 'complete']).describe('How much context was provided'),
  domain: z.enum(['discovery', 'define', 'design', 'develop', 'deliver', 'general']).describe('Primary design domain'),
  deliverable: z.string().describe('What the user wants as output'),
  recommended_mode: z.enum(['ask', 'plan', 'execute']).describe('Which mode to route to'),
  reasoning: z.string().describe('Why this classification was made'),
  missing_context: z.array(z.string()).optional().describe('What information is missing')
});

// ============================================================================
// Intent Analyzer
// ============================================================================

/**
 * Analyzes user query to determine clarity, context, and routing
 * 
 * This is Stage 0 - runs BEFORE any other processing
 * Uses Claude 3.5 Sonnet (fast, cheap, accurate)
 */
export interface IntentAnalyzerOptions {
  apiKey?: string;
  offline?: boolean; // If true, use heuristic (no network)
}

export class IntentAnalyzer {
  private model: ChatAnthropic | null;
  private offline: boolean;

  constructor(options: IntentAnalyzerOptions = {}) {
    this.offline = !!options.offline || process.env.EAMES_OFFLINE_TEST === '1';
    this.model = this.offline
      ? null
      : new ChatAnthropic({
          model: 'claude-3-5-sonnet-20241022',
          temperature: 0.3, // Lower temp for consistent classification
          maxTokens: 1024,
          anthropicApiKey: options.apiKey || process.env.ANTHROPIC_API_KEY,
        });
  }

  /**
   * Analyze a user query and determine how to route it
   */
  async analyze(query: string): Promise<IntentAnalysis> {
    if (this.offline || !this.model) {
      return heuristicAnalyze(query);
    }

    const systemPrompt = this.buildSystemPrompt();
    const userPrompt = this.buildUserPrompt(query);

    // Call LLM with structured output
    const response = await this.model.invoke([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ]);

    // Parse structured output
    const content = response.content as string;
    const parsed = JSON.parse(content);
    const validated = IntentAnalysisSchema.parse(parsed);

    return {
      query,
      ...validated
    };
  }

  /**
   * System prompt for intent classification
   */
  private buildSystemPrompt(): string {
    return `You are the Intent Analyzer for Eames, an AI product design agent.

Your job is to analyze user queries and classify them for routing.

## Classification Criteria

### Clarity Score (0.0 to 1.0)
- **0.0-0.3 (Vague)**: Missing critical context
  - Examples: "Build an app", "Design something"
  - Route to: ASK MODE (gather context)

- **0.4-0.7 (Partial)**: Has some context but needs planning
  - Examples: "Design a split-bill feature", "PRD for onboarding"
  - Route to: PLAN MODE (propose approach)

- **0.8-1.0 (Clear)**: Complete context, ready to execute
  - Examples: "Convert this Figma to React", "Research Venmo's split bill UX"
  - Route to: EXECUTE MODE (direct action)

### Context Level
- **none**: No user, problem, or deliverable specified
- **partial**: Has 1-2 of: user, problem, deliverable
- **complete**: Has user, problem, AND deliverable clearly defined

### Domain
- **discovery**: Competitor research, user research, market trends
- **define**: PRD, requirements, user stories
- **design**: UI/UX, wireframes, components
- **develop**: Code generation, implementation
- **deliver**: Deployment, CI/CD
- **general**: Design questions, advice

### Deliverable
Identify what format user wants:
- PRD document
- UI wireframes
- React code
- Analysis/comparison
- Design system
- etc.

### Recommended Mode
- **ask**: Clarity < 0.4 → Need to gather context
- **plan**: Clarity 0.4-0.7 → Need to propose approach
- **execute**: Clarity >= 0.8 → Can execute directly

## Output Format

Return JSON matching this schema:
{
  "clarity_score": number,
  "context_level": "none" | "partial" | "complete",
  "domain": "discovery" | "define" | "design" | "develop" | "deliver" | "general",
  "deliverable": string,
  "recommended_mode": "ask" | "plan" | "execute",
  "reasoning": string,
  "missing_context": string[] (optional)
}`;
  }

  /**
   * User prompt for the specific query
   */
  private buildUserPrompt(query: string): string {
    return `Analyze this user query:

"${query}"

Classify the query and recommend routing.`;
  }
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Heuristic-only analyzer (no LLM), used for tests/offline mode
 */
export function heuristicAnalyze(query: string): IntentAnalysis {
  const q = query.toLowerCase();
  // Patterns
  const wantsPRD = /\bprd\b|product requirements|requirements doc|user stories/i.test(query);
  const wantsCode = /\breact\b|code|component|typescript|convert .*figma|figma to react/i.test(query);
  const researchy = /\bresearch\b|compare|analysis|how .* (venmo|splitwise|paypal|stripe)|competitor/i.test(q);

  // Context hints
  const mentionsUser = /(student|college|gen z|enterprise|manager|designer|developer|parents|kids)/i.test(query);
  const mentionsFeature = /(split[- ]?bill|onboarding|checkout|notes|todo|payments?|auth|login|signup)/i.test(q);
  const mentionsPlatform = /(ios|android|mobile|web|desktop)/i.test(q);

  const contextCount = [mentionsUser, mentionsFeature, mentionsPlatform].filter(Boolean).length;
  const context_level: ContextLevel = contextCount >= 3 ? 'complete' : contextCount === 0 ? 'none' : 'partial';

  let domain: DesignDomain = 'general';
  if (wantsPRD) domain = 'define';
  else if (wantsCode) domain = 'develop';
  else if (researchy) domain = 'discovery';
  else if (/design|wireframe|ui|ux/.test(q)) domain = 'design';

  let deliverable = 'analysis';
  if (wantsPRD) deliverable = 'PRD document';
  else if (wantsCode) deliverable = 'React components';
  else if (researchy) deliverable = 'research report';
  else if (/wireframe|component|mockup|ui|ux/.test(q)) deliverable = 'UI/UX spec';

  // Clarity scoring heuristic
  let clarity = 0.2; // default vague
  if (wantsCode || researchy) clarity = 0.85; // clear → execute
  else if (wantsPRD) clarity = 0.7; // plan → needs planning before execution
  else if (mentionsFeature && mentionsUser) clarity = 0.6;
  else if (mentionsFeature || mentionsUser) clarity = 0.45;

  // Recommended mode
  const recommended_mode: RecommendedMode = clarity < 0.4 ? 'ask' : clarity < 0.8 ? 'plan' : 'execute';

  const missing_context: string[] = [];
  if (clarity < 0.4) {
    if (!mentionsUser) missing_context.push('target user');
    if (!mentionsFeature) missing_context.push('feature');
    if (!mentionsPlatform) missing_context.push('platform');
  }

  const reasoning =
    recommended_mode === 'ask'
      ? 'Insufficient context; gather user, feature, and platform details.'
      : recommended_mode === 'plan'
      ? 'Some context present; propose approach and select necessary phases.'
      : 'Query clear; can execute directly.';

  return {
    query,
    clarity_score: clarity,
    context_level,
    domain,
    deliverable,
    recommended_mode,
    reasoning,
    missing_context: missing_context.length ? missing_context : undefined,
  };
}

/**
 * Quick check if a query is vague (needs Ask Mode)
 */
export function isVague(analysis: IntentAnalysis): boolean {
  return analysis.clarity_score < 0.4;
}

/**
 * Quick check if a query is clear (can Execute directly)
 */
export function isClear(analysis: IntentAnalysis): boolean {
  return analysis.clarity_score >= 0.8;
}

/**
 * Format analysis for display
 */
export function formatAnalysis(analysis: IntentAnalysis): string {
  const lines = [
    `📊 Intent Analysis`,
    `├─ Clarity: ${(analysis.clarity_score * 100).toFixed(0)}%`,
    `├─ Context: ${analysis.context_level}`,
    `├─ Domain: ${analysis.domain}`,
    `├─ Deliverable: ${analysis.deliverable}`,
    `└─ Mode: ${analysis.recommended_mode.toUpperCase()}`
  ];

  if (analysis.missing_context && analysis.missing_context.length > 0) {
    lines.push(`\nMissing: ${analysis.missing_context.join(', ')}`);
  }

  return lines.join('\n');
}
