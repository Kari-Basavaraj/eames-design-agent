// Updated: 2026-01-11 22:30:00
// Eames Design Agent - Tools Index
// Replaces finance tools with design-focused research tools

import { StructuredToolInterface } from '@langchain/core/tools';
import { tavilySearch } from './search/index.js';
import {
  searchCompetitors,
  searchUXPatterns,
  searchDesignTrends,
  searchAccessibility
} from './design/index.js';

export const TOOLS: StructuredToolInterface[] = [
  // Core web search (required)
  ...(process.env.TAVILY_API_KEY ? [tavilySearch] : []),

  // Design-specific research tools
  searchCompetitors,
  searchUXPatterns,
  searchDesignTrends,
  searchAccessibility,
];

export {
  tavilySearch,
  searchCompetitors,
  searchUXPatterns,
  searchDesignTrends,
  searchAccessibility,
};
