// Updated: 2026-02-16
// Eames Design Agent - Tools Index
// Replaces finance tools with design-focused research tools + execution tools

import { StructuredToolInterface } from '@langchain/core/tools';
import { tavilySearch } from './search/index.js';
import {
  searchCompetitors,
  searchUXPatterns,
  searchDesignTrends,
  searchAccessibility
} from './design/index.js';
import {
  writeFile,
  scaffoldProject,
  runCommand,
  readFile,
  listFiles,
  launchDemo,
} from './execution/index.js';

export const TOOLS: StructuredToolInterface[] = [
  // Core web search (required)
  ...(process.env.TAVILY_API_KEY ? [tavilySearch] : []),

  // Design-specific research tools
  searchCompetitors,
  searchUXPatterns,
  searchDesignTrends,
  searchAccessibility,

  // Execution tools - create apps, write files, run commands
  writeFile,
  scaffoldProject,
  runCommand,
  readFile,
  listFiles,
  launchDemo,
];

export {
  tavilySearch,
  searchCompetitors,
  searchUXPatterns,
  searchDesignTrends,
  searchAccessibility,
  writeFile,
  scaffoldProject,
  runCommand,
  readFile,
  listFiles,
  launchDemo,
};
