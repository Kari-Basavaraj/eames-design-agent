// Updated: 2026-01-12 04:00:00
// Eames Design Agent - Theme System
// Light/dark theme support

import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

const EAMES_DIR = join(homedir(), '.eames');
const THEME_FILE = join(EAMES_DIR, 'theme.json');

/**
 * Theme definition
 */
export interface Theme {
  name: string;
  type: 'dark' | 'light';
  colors: {
    // Base colors
    background: string;
    foreground: string;
    primary: string;
    secondary: string;
    accent: string;

    // UI elements
    border: string;
    muted: string;
    dimmed: string;

    // Semantic colors
    success: string;
    warning: string;
    error: string;
    info: string;

    // Syntax highlighting
    keyword: string;
    string: string;
    number: string;
    comment: string;
    function: string;
    variable: string;
    type: string;
    operator: string;

    // Special
    queryBg: string;
    selectionBg: string;
    matchHighlight: string;
  };
}

/**
 * One Dark theme (default)
 */
export const ONE_DARK: Theme = {
  name: 'One Dark',
  type: 'dark',
  colors: {
    background: '#1e1e1e',
    foreground: '#abb2bf',
    primary: '#61afef',
    secondary: '#c678dd',
    accent: '#98c379',

    border: '#3e4451',
    muted: '#5c6370',
    dimmed: '#4b5263',

    success: '#98c379',
    warning: '#e5c07b',
    error: '#e06c75',
    info: '#61afef',

    keyword: '#c678dd',
    string: '#98c379',
    number: '#d19a66',
    comment: '#5c6370',
    function: '#61afef',
    variable: '#e06c75',
    type: '#e5c07b',
    operator: '#56b6c2',

    queryBg: '#2c313a',
    selectionBg: '#3e4451',
    matchHighlight: '#e5c07b',
  },
};

/**
 * One Light theme
 */
export const ONE_LIGHT: Theme = {
  name: 'One Light',
  type: 'light',
  colors: {
    background: '#fafafa',
    foreground: '#383a42',
    primary: '#4078f2',
    secondary: '#a626a4',
    accent: '#50a14f',

    border: '#d3d3d3',
    muted: '#a0a1a7',
    dimmed: '#c8c8c8',

    success: '#50a14f',
    warning: '#c18401',
    error: '#e45649',
    info: '#4078f2',

    keyword: '#a626a4',
    string: '#50a14f',
    number: '#986801',
    comment: '#a0a1a7',
    function: '#4078f2',
    variable: '#e45649',
    type: '#c18401',
    operator: '#0184bc',

    queryBg: '#eaeaeb',
    selectionBg: '#e5e5e6',
    matchHighlight: '#c18401',
  },
};

/**
 * Dracula theme
 */
export const DRACULA: Theme = {
  name: 'Dracula',
  type: 'dark',
  colors: {
    background: '#282a36',
    foreground: '#f8f8f2',
    primary: '#bd93f9',
    secondary: '#ff79c6',
    accent: '#50fa7b',

    border: '#44475a',
    muted: '#6272a4',
    dimmed: '#44475a',

    success: '#50fa7b',
    warning: '#ffb86c',
    error: '#ff5555',
    info: '#8be9fd',

    keyword: '#ff79c6',
    string: '#f1fa8c',
    number: '#bd93f9',
    comment: '#6272a4',
    function: '#50fa7b',
    variable: '#f8f8f2',
    type: '#8be9fd',
    operator: '#ff79c6',

    queryBg: '#44475a',
    selectionBg: '#44475a',
    matchHighlight: '#ffb86c',
  },
};

/**
 * Nord theme
 */
export const NORD: Theme = {
  name: 'Nord',
  type: 'dark',
  colors: {
    background: '#2e3440',
    foreground: '#d8dee9',
    primary: '#88c0d0',
    secondary: '#b48ead',
    accent: '#a3be8c',

    border: '#3b4252',
    muted: '#4c566a',
    dimmed: '#434c5e',

    success: '#a3be8c',
    warning: '#ebcb8b',
    error: '#bf616a',
    info: '#5e81ac',

    keyword: '#81a1c1',
    string: '#a3be8c',
    number: '#b48ead',
    comment: '#4c566a',
    function: '#88c0d0',
    variable: '#d8dee9',
    type: '#8fbcbb',
    operator: '#81a1c1',

    queryBg: '#3b4252',
    selectionBg: '#434c5e',
    matchHighlight: '#ebcb8b',
  },
};

/**
 * Available themes
 */
export const THEMES: Record<string, Theme> = {
  'one-dark': ONE_DARK,
  'one-light': ONE_LIGHT,
  'dracula': DRACULA,
  'nord': NORD,
};

/**
 * Theme settings
 */
export interface ThemeSettings {
  currentTheme: string;
  autoDetect: boolean;
}

/**
 * Load theme settings
 */
export function loadThemeSettings(): ThemeSettings {
  try {
    if (!existsSync(EAMES_DIR)) {
      mkdirSync(EAMES_DIR, { recursive: true });
    }
    if (existsSync(THEME_FILE)) {
      const data = readFileSync(THEME_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch {
    // Ignore
  }
  return { currentTheme: 'one-dark', autoDetect: false };
}

/**
 * Save theme settings
 */
export function saveThemeSettings(settings: ThemeSettings): void {
  try {
    if (!existsSync(EAMES_DIR)) {
      mkdirSync(EAMES_DIR, { recursive: true });
    }
    writeFileSync(THEME_FILE, JSON.stringify(settings, null, 2));
  } catch {
    // Ignore
  }
}

/**
 * Get current theme
 */
export function getCurrentTheme(): Theme {
  const settings = loadThemeSettings();

  if (settings.autoDetect) {
    // Try to detect system preference (macOS)
    try {
      const { execSync } = require('child_process');
      const result = execSync('defaults read -g AppleInterfaceStyle 2>/dev/null', {
        encoding: 'utf-8',
      }).trim();
      if (result === 'Dark') {
        return THEMES['one-dark'];
      }
      return THEMES['one-light'];
    } catch {
      // Not macOS or failed
    }
  }

  return THEMES[settings.currentTheme] || ONE_DARK;
}

/**
 * Set theme
 */
export function setTheme(themeName: string): Theme | null {
  const theme = THEMES[themeName];
  if (!theme) return null;

  const settings = loadThemeSettings();
  settings.currentTheme = themeName;
  settings.autoDetect = false;
  saveThemeSettings(settings);

  return theme;
}

/**
 * Toggle between light and dark
 */
export function toggleTheme(): Theme {
  const current = getCurrentTheme();
  const newTheme = current.type === 'dark' ? 'one-light' : 'one-dark';
  return setTheme(newTheme) || current;
}

/**
 * Enable auto-detect
 */
export function enableAutoDetect(): void {
  const settings = loadThemeSettings();
  settings.autoDetect = true;
  saveThemeSettings(settings);
}

/**
 * List available themes
 */
export function listThemes(): Array<{ id: string; name: string; type: 'dark' | 'light' }> {
  return Object.entries(THEMES).map(([id, theme]) => ({
    id,
    name: theme.name,
    type: theme.type,
  }));
}

/**
 * Create theme colors object for the app
 */
export function getThemeColors(): Theme['colors'] {
  return getCurrentTheme().colors;
}

/**
 * Update theme.ts colors export (runtime)
 */
let currentColors = getCurrentTheme().colors;

export function refreshThemeColors(): Theme['colors'] {
  currentColors = getCurrentTheme().colors;
  return currentColors;
}

export function getColors(): Theme['colors'] {
  return currentColors;
}
