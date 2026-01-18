// Updated: 2026-01-13 01:50:00
export const colors = {
  // Best Buy Official Brand Colors
  bestBuyBlue: '#0046BE',
  bestBuyYellow: '#FFF200',
  bestBuyLightBlue: '#55BBEB',
  bestBuyBlack: '#1D252D',

  // Claude Code compatible colors
  primary: '#58A6FF',
  primaryLight: '#a5cfff',
  secondary: '#A371F7',    // Purple - for file mentions
  secondaryLight: '#c9a9f9',
  success: 'green',
  error: 'red',
  warning: 'yellow',
  muted: '#808080',
  mutedDark: '#303030',
  accent: 'cyan',
  highlight: 'magenta',
  white: '#ffffff',
  info: '#6CB6FF',
  queryBg: '#3D3D3D',
  claude: '#E5896A',
  
  // Additional UI colors
  border: '#444444',
  selection: '#264F78',
} as const;

export const dimensions = {
  boxWidth: 80,
  introWidth: 50,
} as const;

export const spacing = {
  none: 0,
  tight: 1,     // Between related items
  normal: 2,    // Between sections
  loose: 3,     // Between major sections
} as const;

export const indent = {
  level1: 2,    // First indent
  level2: 4,    // Nested indent
  level3: 6,    // Deep nested
} as const;
