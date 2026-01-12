// Updated: 2026-01-11 22:30:00
// Eames Design Agent - Design Research Tools

import { DynamicStructuredTool } from '@langchain/core/tools';
import { TavilySearch } from '@langchain/tavily';
import { z } from 'zod';
import { formatToolResult } from '../types.js';

// Initialize Tavily client for all design tools
const tavilyClient = new TavilySearch({ maxResults: 8 });

/**
 * Search for competitor analysis and feature comparisons
 */
export const searchCompetitors = new DynamicStructuredTool({
  name: 'search_competitors',
  description: 'Search for competitor products, their features, and user flows. Use this to understand what existing products do and how they solve similar problems.',
  schema: z.object({
    product_type: z.string().describe('Type of product or feature to research (e.g., "fintech onboarding", "e-commerce checkout", "saas dashboard")'),
    competitors: z.array(z.string()).optional().describe('Specific competitor names to research (e.g., ["Stripe", "Square", "PayPal"])'),
    focus_area: z.string().optional().describe('Specific aspect to focus on (e.g., "mobile experience", "pricing page", "user flow")'),
  }),
  func: async (input) => {
    const competitorList = input.competitors?.join(', ') || 'top products';
    const focus = input.focus_area ? ` focusing on ${input.focus_area}` : '';
    const query = `${input.product_type} ${competitorList} features UX analysis${focus}`;

    const result = await tavilyClient.invoke({ query });
    const parsed = typeof result === 'string' ? JSON.parse(result) : result;
    const urls = parsed.results
      ?.map((r: { url?: string }) => r.url)
      .filter((url: string | undefined): url is string => Boolean(url)) ?? [];
    return formatToolResult(parsed, urls);
  },
});

/**
 * Search for UX patterns and best practices
 */
export const searchUXPatterns = new DynamicStructuredTool({
  name: 'search_ux_patterns',
  description: 'Search for UX design patterns, best practices, and interaction design guidelines. Use this for understanding established solutions to common design problems.',
  schema: z.object({
    pattern_type: z.string().describe('Type of UX pattern to research (e.g., "form validation", "navigation menu", "error handling", "empty states")'),
    platform: z.string().optional().describe('Target platform (e.g., "mobile", "web", "iOS", "Android")'),
    context: z.string().optional().describe('Additional context (e.g., "e-commerce", "enterprise", "consumer")'),
  }),
  func: async (input) => {
    const platform = input.platform ? ` ${input.platform}` : '';
    const context = input.context ? ` ${input.context}` : '';
    const query = `${input.pattern_type} UX pattern best practices${platform}${context} Nielsen Norman Group`;

    const result = await tavilyClient.invoke({ query });
    const parsed = typeof result === 'string' ? JSON.parse(result) : result;
    const urls = parsed.results
      ?.map((r: { url?: string }) => r.url)
      .filter((url: string | undefined): url is string => Boolean(url)) ?? [];
    return formatToolResult(parsed, urls);
  },
});

/**
 * Search for current design trends
 */
export const searchDesignTrends = new DynamicStructuredTool({
  name: 'search_design_trends',
  description: 'Search for current UI/UX design trends, visual styles, and emerging patterns. Use this to understand what modern products look like.',
  schema: z.object({
    category: z.string().describe('Design category (e.g., "mobile app", "dashboard", "landing page", "SaaS")'),
    year: z.string().optional().describe('Year for trends (defaults to current year)'),
    style: z.string().optional().describe('Specific style to research (e.g., "minimalist", "glassmorphism", "dark mode")'),
  }),
  func: async (input) => {
    const year = input.year || new Date().getFullYear().toString();
    const style = input.style ? ` ${input.style}` : '';
    const query = `${input.category} UI design trends ${year}${style} Dribbble Behance`;

    const result = await tavilyClient.invoke({ query });
    const parsed = typeof result === 'string' ? JSON.parse(result) : result;
    const urls = parsed.results
      ?.map((r: { url?: string }) => r.url)
      .filter((url: string | undefined): url is string => Boolean(url)) ?? [];
    return formatToolResult(parsed, urls);
  },
});

/**
 * Search for accessibility guidelines and WCAG standards
 */
export const searchAccessibility = new DynamicStructuredTool({
  name: 'search_accessibility',
  description: 'Search for accessibility guidelines, WCAG standards, and inclusive design practices. Use this to ensure designs are accessible.',
  schema: z.object({
    topic: z.string().describe('Accessibility topic (e.g., "color contrast", "screen reader", "keyboard navigation", "forms")'),
    wcag_level: z.string().optional().describe('WCAG conformance level (e.g., "AA", "AAA")'),
    component: z.string().optional().describe('Specific UI component (e.g., "modal", "dropdown", "carousel")'),
  }),
  func: async (input) => {
    const level = input.wcag_level ? ` WCAG ${input.wcag_level}` : ' WCAG';
    const component = input.component ? ` ${input.component}` : '';
    const query = `${input.topic} accessibility${level}${component} a11y best practices`;

    const result = await tavilyClient.invoke({ query });
    const parsed = typeof result === 'string' ? JSON.parse(result) : result;
    const urls = parsed.results
      ?.map((r: { url?: string }) => r.url)
      .filter((url: string | undefined): url is string => Boolean(url)) ?? [];
    return formatToolResult(parsed, urls);
  },
});
