// Updated: 2026-01-12 03:25:00
// Eames Design Agent - Syntax Highlighting
// Claude Code-like colored code blocks

/**
 * Token types for syntax highlighting
 */
export type TokenType =
  | 'keyword'
  | 'string'
  | 'number'
  | 'comment'
  | 'function'
  | 'variable'
  | 'operator'
  | 'punctuation'
  | 'type'
  | 'constant'
  | 'property'
  | 'tag'
  | 'attribute'
  | 'text';

/**
 * Highlighted token
 */
export interface Token {
  type: TokenType;
  value: string;
}

/**
 * Theme colors for syntax highlighting
 */
export interface SyntaxTheme {
  keyword: string;
  string: string;
  number: string;
  comment: string;
  function: string;
  variable: string;
  operator: string;
  punctuation: string;
  type: string;
  constant: string;
  property: string;
  tag: string;
  attribute: string;
  text: string;
}

/**
 * One Dark theme (default)
 */
export const ONE_DARK_THEME: SyntaxTheme = {
  keyword: '#c678dd',    // purple
  string: '#98c379',     // green
  number: '#d19a66',     // orange
  comment: '#5c6370',    // gray
  function: '#61afef',   // blue
  variable: '#e06c75',   // red
  operator: '#56b6c2',   // cyan
  punctuation: '#abb2bf', // light gray
  type: '#e5c07b',       // yellow
  constant: '#d19a66',   // orange
  property: '#e06c75',   // red
  tag: '#e06c75',        // red
  attribute: '#d19a66',  // orange
  text: '#abb2bf',       // light gray
};

/**
 * Light theme
 */
export const LIGHT_THEME: SyntaxTheme = {
  keyword: '#a626a4',    // purple
  string: '#50a14f',     // green
  number: '#986801',     // orange
  comment: '#a0a1a7',    // gray
  function: '#4078f2',   // blue
  variable: '#e45649',   // red
  operator: '#0184bc',   // cyan
  punctuation: '#383a42', // dark gray
  type: '#c18401',       // yellow
  constant: '#986801',   // orange
  property: '#e45649',   // red
  tag: '#e45649',        // red
  attribute: '#986801',  // orange
  text: '#383a42',       // dark gray
};

/**
 * Language definitions
 */
interface LanguageDefinition {
  keywords: string[];
  types?: string[];
  constants?: string[];
  operators: string[];
  stringDelimiters: string[];
  commentSingle?: string;
  commentMultiStart?: string;
  commentMultiEnd?: string;
}

const LANGUAGES: Record<string, LanguageDefinition> = {
  javascript: {
    keywords: ['const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while', 'do', 'switch', 'case', 'break', 'continue', 'try', 'catch', 'finally', 'throw', 'new', 'class', 'extends', 'import', 'export', 'default', 'from', 'async', 'await', 'yield', 'static', 'get', 'set', 'typeof', 'instanceof', 'in', 'of', 'delete', 'void', 'this', 'super'],
    types: ['string', 'number', 'boolean', 'object', 'undefined', 'null', 'symbol', 'bigint'],
    constants: ['true', 'false', 'null', 'undefined', 'NaN', 'Infinity'],
    operators: ['+', '-', '*', '/', '%', '=', '==', '===', '!=', '!==', '<', '>', '<=', '>=', '&&', '||', '!', '?', ':', '??', '?.', '=>', '...'],
    stringDelimiters: ['"', "'", '`'],
    commentSingle: '//',
    commentMultiStart: '/*',
    commentMultiEnd: '*/',
  },
  typescript: {
    keywords: ['const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while', 'do', 'switch', 'case', 'break', 'continue', 'try', 'catch', 'finally', 'throw', 'new', 'class', 'extends', 'import', 'export', 'default', 'from', 'async', 'await', 'yield', 'static', 'get', 'set', 'typeof', 'instanceof', 'in', 'of', 'delete', 'void', 'this', 'super', 'interface', 'type', 'enum', 'namespace', 'module', 'declare', 'abstract', 'implements', 'private', 'protected', 'public', 'readonly', 'as', 'is', 'keyof', 'infer'],
    types: ['string', 'number', 'boolean', 'object', 'undefined', 'null', 'symbol', 'bigint', 'any', 'unknown', 'never', 'void'],
    constants: ['true', 'false', 'null', 'undefined', 'NaN', 'Infinity'],
    operators: ['+', '-', '*', '/', '%', '=', '==', '===', '!=', '!==', '<', '>', '<=', '>=', '&&', '||', '!', '?', ':', '??', '?.', '=>', '...'],
    stringDelimiters: ['"', "'", '`'],
    commentSingle: '//',
    commentMultiStart: '/*',
    commentMultiEnd: '*/',
  },
  python: {
    keywords: ['def', 'class', 'return', 'if', 'elif', 'else', 'for', 'while', 'break', 'continue', 'try', 'except', 'finally', 'raise', 'import', 'from', 'as', 'with', 'pass', 'yield', 'lambda', 'and', 'or', 'not', 'in', 'is', 'global', 'nonlocal', 'assert', 'del', 'async', 'await'],
    types: ['int', 'float', 'str', 'bool', 'list', 'dict', 'tuple', 'set', 'bytes'],
    constants: ['True', 'False', 'None'],
    operators: ['+', '-', '*', '/', '//', '%', '**', '=', '==', '!=', '<', '>', '<=', '>=', '+=', '-=', '*=', '/='],
    stringDelimiters: ['"', "'", '"""', "'''"],
    commentSingle: '#',
  },
  rust: {
    keywords: ['fn', 'let', 'mut', 'const', 'static', 'if', 'else', 'match', 'for', 'while', 'loop', 'break', 'continue', 'return', 'struct', 'enum', 'impl', 'trait', 'type', 'pub', 'mod', 'use', 'crate', 'self', 'super', 'where', 'async', 'await', 'move', 'ref', 'unsafe', 'extern', 'dyn'],
    types: ['i8', 'i16', 'i32', 'i64', 'i128', 'isize', 'u8', 'u16', 'u32', 'u64', 'u128', 'usize', 'f32', 'f64', 'bool', 'char', 'str', 'String', 'Vec', 'Option', 'Result'],
    constants: ['true', 'false', 'Some', 'None', 'Ok', 'Err'],
    operators: ['+', '-', '*', '/', '%', '=', '==', '!=', '<', '>', '<=', '>=', '&&', '||', '!', '?', '::', '->', '=>', '..', '..='],
    stringDelimiters: ['"'],
    commentSingle: '//',
    commentMultiStart: '/*',
    commentMultiEnd: '*/',
  },
  go: {
    keywords: ['package', 'import', 'func', 'return', 'var', 'const', 'type', 'struct', 'interface', 'map', 'chan', 'if', 'else', 'for', 'range', 'switch', 'case', 'default', 'break', 'continue', 'goto', 'fallthrough', 'defer', 'go', 'select'],
    types: ['int', 'int8', 'int16', 'int32', 'int64', 'uint', 'uint8', 'uint16', 'uint32', 'uint64', 'float32', 'float64', 'complex64', 'complex128', 'bool', 'string', 'byte', 'rune', 'error'],
    constants: ['true', 'false', 'nil', 'iota'],
    operators: ['+', '-', '*', '/', '%', '=', ':=', '==', '!=', '<', '>', '<=', '>=', '&&', '||', '!', '&', '|', '^', '<<', '>>', '<-'],
    stringDelimiters: ['"', '`'],
    commentSingle: '//',
    commentMultiStart: '/*',
    commentMultiEnd: '*/',
  },
  bash: {
    keywords: ['if', 'then', 'else', 'elif', 'fi', 'case', 'esac', 'for', 'while', 'until', 'do', 'done', 'in', 'function', 'return', 'local', 'export', 'readonly', 'declare', 'typeset', 'source', 'alias', 'unalias', 'set', 'unset', 'shift', 'exit', 'break', 'continue', 'trap', 'eval', 'exec'],
    constants: ['true', 'false'],
    operators: ['=', '==', '!=', '-eq', '-ne', '-lt', '-le', '-gt', '-ge', '-z', '-n', '-e', '-f', '-d', '-r', '-w', '-x', '&&', '||', '|', '>', '<', '>>', '<<', '&'],
    stringDelimiters: ['"', "'"],
    commentSingle: '#',
  },
  json: {
    keywords: [],
    constants: ['true', 'false', 'null'],
    operators: [':', ','],
    stringDelimiters: ['"'],
  },
  yaml: {
    keywords: [],
    constants: ['true', 'false', 'null', 'yes', 'no', 'on', 'off'],
    operators: [':', '-', '|', '>'],
    stringDelimiters: ['"', "'"],
    commentSingle: '#',
  },
  markdown: {
    keywords: [],
    constants: [],
    operators: [],
    stringDelimiters: [],
  },
};

/**
 * Detect language from file extension or content
 */
export function detectLanguage(code: string, filename?: string): string {
  if (filename) {
    const ext = filename.split('.').pop()?.toLowerCase();
    const extMap: Record<string, string> = {
      js: 'javascript',
      jsx: 'javascript',
      ts: 'typescript',
      tsx: 'typescript',
      py: 'python',
      rs: 'rust',
      go: 'go',
      sh: 'bash',
      bash: 'bash',
      zsh: 'bash',
      json: 'json',
      yaml: 'yaml',
      yml: 'yaml',
      md: 'markdown',
    };
    if (ext && extMap[ext]) {
      return extMap[ext];
    }
  }

  // Heuristic detection
  if (code.includes('#!/bin/bash') || code.includes('#!/bin/sh')) return 'bash';
  if (code.includes('import React') || code.includes('from "react"')) return 'javascript';
  if (code.includes('interface ') || code.includes(': string') || code.includes(': number')) return 'typescript';
  if (code.includes('def ') && code.includes(':')) return 'python';
  if (code.includes('fn ') && code.includes('->')) return 'rust';
  if (code.includes('func ') && code.includes(':=')) return 'go';
  if (code.trim().startsWith('{') || code.trim().startsWith('[')) return 'json';

  return 'text';
}

/**
 * Tokenize code for syntax highlighting
 */
export function tokenize(code: string, language: string): Token[] {
  const lang = LANGUAGES[language];
  if (!lang) {
    return [{ type: 'text', value: code }];
  }

  const tokens: Token[] = [];
  let i = 0;

  while (i < code.length) {
    let matched = false;

    // Comments
    if (lang.commentSingle && code.slice(i).startsWith(lang.commentSingle)) {
      const end = code.indexOf('\n', i);
      const value = end === -1 ? code.slice(i) : code.slice(i, end);
      tokens.push({ type: 'comment', value });
      i += value.length;
      matched = true;
    } else if (lang.commentMultiStart && code.slice(i).startsWith(lang.commentMultiStart)) {
      const end = code.indexOf(lang.commentMultiEnd!, i + lang.commentMultiStart.length);
      const value = end === -1 ? code.slice(i) : code.slice(i, end + lang.commentMultiEnd!.length);
      tokens.push({ type: 'comment', value });
      i += value.length;
      matched = true;
    }

    // Strings
    if (!matched) {
      for (const delim of lang.stringDelimiters) {
        if (code.slice(i).startsWith(delim)) {
          let j = i + delim.length;
          while (j < code.length) {
            if (code.slice(j).startsWith(delim) && code[j - 1] !== '\\') {
              j += delim.length;
              break;
            }
            j++;
          }
          const value = code.slice(i, j);
          tokens.push({ type: 'string', value });
          i = j;
          matched = true;
          break;
        }
      }
    }

    // Numbers
    if (!matched && /[0-9]/.test(code[i])) {
      let j = i;
      while (j < code.length && /[0-9.xXa-fA-F_]/.test(code[j])) {
        j++;
      }
      tokens.push({ type: 'number', value: code.slice(i, j) });
      i = j;
      matched = true;
    }

    // Identifiers and keywords
    if (!matched && /[a-zA-Z_$]/.test(code[i])) {
      let j = i;
      while (j < code.length && /[a-zA-Z0-9_$]/.test(code[j])) {
        j++;
      }
      const word = code.slice(i, j);

      if (lang.keywords.includes(word)) {
        tokens.push({ type: 'keyword', value: word });
      } else if (lang.types?.includes(word)) {
        tokens.push({ type: 'type', value: word });
      } else if (lang.constants?.includes(word)) {
        tokens.push({ type: 'constant', value: word });
      } else if (code[j] === '(') {
        tokens.push({ type: 'function', value: word });
      } else {
        tokens.push({ type: 'variable', value: word });
      }
      i = j;
      matched = true;
    }

    // Operators
    if (!matched) {
      let foundOp = '';
      for (const op of lang.operators) {
        if (code.slice(i).startsWith(op) && op.length > foundOp.length) {
          foundOp = op;
        }
      }
      if (foundOp) {
        tokens.push({ type: 'operator', value: foundOp });
        i += foundOp.length;
        matched = true;
      }
    }

    // Punctuation
    if (!matched && /[{}()\[\];,.]/.test(code[i])) {
      tokens.push({ type: 'punctuation', value: code[i] });
      i++;
      matched = true;
    }

    // Whitespace and other characters
    if (!matched) {
      tokens.push({ type: 'text', value: code[i] });
      i++;
    }
  }

  return tokens;
}

/**
 * Apply theme colors to tokens
 */
export function applyTheme(tokens: Token[], theme: SyntaxTheme = ONE_DARK_THEME): Array<{ text: string; color: string }> {
  return tokens.map(token => ({
    text: token.value,
    color: theme[token.type],
  }));
}

/**
 * Highlight code and return formatted output
 */
export function highlightCode(
  code: string,
  language?: string,
  filename?: string,
  theme: SyntaxTheme = ONE_DARK_THEME
): Array<{ text: string; color: string }> {
  const lang = language || detectLanguage(code, filename);
  const tokens = tokenize(code, lang);
  return applyTheme(tokens, theme);
}
