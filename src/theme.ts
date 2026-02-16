// Updated: 2026-02-16 00:00:00
// Eames Design Agent - Theme
// Claude Code-inspired, blue-themed

export const colors = {
  // Eames blue primary palette
  primary: '#58A6FF',
  primaryBold: '#79C0FF',
  primaryDim: '#388BFD',

  // Secondary accent
  secondary: '#A371F7',
  secondaryLight: '#c9a9f9',

  // Semantic
  success: '#3FB950',
  error: '#F85149',
  warning: '#D29922',
  info: '#58A6FF',

  // Neutrals
  white: '#E6EDF3',
  muted: '#8B949E',
  mutedDark: '#484F58',
  border: '#30363D',
  bg: '#0D1117',
  bgSubtle: '#161B22',

  // Accents for specific UI elements
  accent: '#58A6FF',
  highlight: '#A371F7',
  queryBg: '#161B22',

  // Tool call colors (Claude Code-style)
  toolName: '#58A6FF',
  toolProgress: '#8B949E',
  toolResult: '#3FB950',

  // Selection
  selection: '#264F78',
} as const;

export const dimensions = {
  boxWidth: 80,
  introWidth: 50,
} as const;

export const spacing = {
  none: 0,
  tight: 1,
  normal: 2,
  loose: 3,
} as const;

export const indent = {
  level1: 2,
  level2: 4,
  level3: 6,
} as const;
