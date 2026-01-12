// Updated: 2026-01-12 04:25:00
// Eames Design Agent - Enhanced Input Component
// Full-featured input with Vim mode, completions, history search

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Box, Text, useStdin } from 'ink';
import { colors } from '../theme.js';
import {
  VimState,
  VimMode,
  createInitialState,
  parseVimKey,
  processAction,
  getModeIndicator,
} from '../utils/vim-mode.js';
import {
  getCompletions,
  applyCompletion,
  CompletionResult,
} from '../utils/tab-completion.js';
import { addToHistory } from '../utils/history-search.js';
import { getGitStatus, formatGitPrompt, getBranchColor } from '../utils/git-status.js';
import { CompletionMenu } from './CompletionMenu.js';

interface EnhancedInputProps {
  onSubmit: (value: string) => void;
  onCommandPalette?: () => void;
  onHistorySearch?: () => void;
  onFuzzyFinder?: () => void;
  vimModeEnabled?: boolean;
  gitStatusEnabled?: boolean;
  completionsEnabled?: boolean;
  cwd?: string;
  disabled?: boolean;
}

export function EnhancedInput({
  onSubmit,
  onCommandPalette,
  onHistorySearch,
  onFuzzyFinder,
  vimModeEnabled = false,
  gitStatusEnabled = true,
  completionsEnabled = true,
  cwd = process.cwd(),
  disabled = false,
}: EnhancedInputProps) {
  const [value, setValue] = useState('');
  const [cursorPosition, setCursorPosition] = useState(0);
  const [vimState, setVimState] = useState<VimState>(createInitialState());
  const [completions, setCompletions] = useState<CompletionResult | null>(null);
  const [completionIndex, setCompletionIndex] = useState(0);
  const [showCompletions, setShowCompletions] = useState(false);
  const [gitStatus, setGitStatus] = useState<ReturnType<typeof getGitStatus> | null>(null);

  const { stdin, setRawMode } = useStdin();

  // Refs for event handler
  const valueRef = useRef(value);
  const cursorRef = useRef(cursorPosition);
  const vimStateRef = useRef(vimState);
  const onSubmitRef = useRef(onSubmit);

  // Keep refs in sync
  useEffect(() => { valueRef.current = value; }, [value]);
  useEffect(() => { cursorRef.current = cursorPosition; }, [cursorPosition]);
  useEffect(() => { vimStateRef.current = vimState; }, [vimState]);
  useEffect(() => { onSubmitRef.current = onSubmit; }, [onSubmit]);

  // Load git status
  useEffect(() => {
    if (gitStatusEnabled) {
      const status = getGitStatus(cwd);
      setGitStatus(status);
    }
  }, [cwd, gitStatusEnabled]);

  // Update completions
  useEffect(() => {
    if (completionsEnabled && value && !showCompletions) {
      const result = getCompletions(value, cursorPosition, []);
      setCompletions(result);
    } else if (!value) {
      setCompletions(null);
    }
  }, [value, cursorPosition, completionsEnabled, showCompletions]);

  // Enable raw mode
  useEffect(() => {
    if (setRawMode) {
      setRawMode(true);
    }
    return () => {
      if (setRawMode) {
        setRawMode(false);
      }
    };
  }, [setRawMode]);

  // Main input handler
  useEffect(() => {
    if (!stdin || disabled) return;

    const handleData = (data: Buffer) => {
      const str = data.toString();
      let currentValue = valueRef.current;
      let currentCursor = cursorRef.current;
      let currentVimState = vimStateRef.current;

      // Command palette: Ctrl+P
      if (str === '\x10' && onCommandPalette) {
        onCommandPalette();
        return;
      }

      // History search: Ctrl+R
      if (str === '\x12' && onHistorySearch) {
        onHistorySearch();
        return;
      }

      // Fuzzy finder: Ctrl+T
      if (str === '\x14' && onFuzzyFinder) {
        onFuzzyFinder();
        return;
      }

      // Tab completion
      if (str === '\t' && completionsEnabled) {
        if (completions && completions.items.length > 0) {
          if (showCompletions) {
            // Cycle through completions
            const nextIndex = (completionIndex + 1) % completions.items.length;
            setCompletionIndex(nextIndex);
          } else {
            // Apply first completion or show menu
            if (completions.items.length === 1) {
              const result = applyCompletion(
                currentValue,
                currentCursor,
                completions.items[0],
                completions.startIndex
              );
              setValue(result.newInput);
              setCursorPosition(result.newCursor);
              valueRef.current = result.newInput;
              cursorRef.current = result.newCursor;
              setCompletions(null);
            } else {
              setShowCompletions(true);
              setCompletionIndex(0);
            }
          }
        }
        return;
      }

      // Apply selected completion on Enter when menu is open
      if ((str === '\r' || str === '\n') && showCompletions && completions) {
        const result = applyCompletion(
          currentValue,
          currentCursor,
          completions.items[completionIndex],
          completions.startIndex
        );
        setValue(result.newInput);
        setCursorPosition(result.newCursor);
        valueRef.current = result.newInput;
        cursorRef.current = result.newCursor;
        setShowCompletions(false);
        setCompletions(null);
        return;
      }

      // Close completions on Escape
      if (str === '\x1b' && showCompletions) {
        setShowCompletions(false);
        return;
      }

      // Navigate completions with arrows
      if (showCompletions && completions) {
        if (str === '\x1b[A') { // Up
          setCompletionIndex((i) => Math.max(0, i - 1));
          return;
        }
        if (str === '\x1b[B') { // Down
          setCompletionIndex((i) => Math.min(completions.items.length - 1, i + 1));
          return;
        }
      }

      // Close completions on any other input
      if (showCompletions && str !== '\t') {
        setShowCompletions(false);
      }

      // Vim mode processing
      if (vimModeEnabled) {
        const isCtrl = str.charCodeAt(0) < 32;
        const isMeta = str.startsWith('\x1b');

        const action = parseVimKey(str, currentVimState, isCtrl, isMeta);

        if (action) {
          const result = processAction(action, currentValue, currentCursor, currentVimState);

          if (result.newText !== currentValue) {
            setValue(result.newText);
            valueRef.current = result.newText;
          }
          if (result.newCursor !== currentCursor) {
            setCursorPosition(result.newCursor);
            cursorRef.current = result.newCursor;
          }
          if (result.newState !== currentVimState) {
            setVimState(result.newState);
            vimStateRef.current = result.newState;
          }
          return;
        }
      }

      // Shift+Enter variants (insert newline)
      if (str === '\x1b[13;2u' || str === '\x1bOM' || str === '\x1b\r' || str === '\x1b\n') {
        const newValue = currentValue.slice(0, currentCursor) + '\n' + currentValue.slice(currentCursor);
        const newCursor = currentCursor + 1;
        setValue(newValue);
        setCursorPosition(newCursor);
        valueRef.current = newValue;
        cursorRef.current = newCursor;
        return;
      }

      // Enter - submit
      if (str === '\r' || str === '\n') {
        if (currentValue.trim()) {
          // Add to history
          addToHistory(currentValue, cwd);
          onSubmitRef.current(currentValue);
          setValue('');
          setCursorPosition(0);
          valueRef.current = '';
          cursorRef.current = 0;
          // Reset vim to insert mode for next input
          if (vimModeEnabled) {
            setVimState(createInitialState());
            vimStateRef.current = createInitialState();
          }
        }
        return;
      }

      // Backspace
      if (str === '\x7f' || str === '\b') {
        if (currentCursor > 0) {
          const newValue = currentValue.slice(0, currentCursor - 1) + currentValue.slice(currentCursor);
          const newCursor = currentCursor - 1;
          setValue(newValue);
          setCursorPosition(newCursor);
          valueRef.current = newValue;
          cursorRef.current = newCursor;
        }
        return;
      }

      // Ctrl+C - exit
      if (str === '\x03') {
        process.exit(0);
      }

      // Ctrl+U - clear line
      if (str === '\x15') {
        setValue('');
        setCursorPosition(0);
        valueRef.current = '';
        cursorRef.current = 0;
        return;
      }

      // Ctrl+W - delete word
      if (str === '\x17') {
        const beforeCursor = currentValue.slice(0, currentCursor);
        const afterCursor = currentValue.slice(currentCursor);
        const lastSpace = beforeCursor.trimEnd().lastIndexOf(' ');
        const newBefore = lastSpace === -1 ? '' : beforeCursor.slice(0, lastSpace + 1);
        const newValue = newBefore + afterCursor;
        const newCursor = newBefore.length;
        setValue(newValue);
        setCursorPosition(newCursor);
        valueRef.current = newValue;
        cursorRef.current = newCursor;
        return;
      }

      // Arrow keys
      if (str === '\x1b[D') { // Left
        const newCursor = Math.max(0, currentCursor - 1);
        setCursorPosition(newCursor);
        cursorRef.current = newCursor;
        return;
      }

      if (str === '\x1b[C') { // Right
        const newCursor = Math.min(currentValue.length, currentCursor + 1);
        setCursorPosition(newCursor);
        cursorRef.current = newCursor;
        return;
      }

      if (str === '\x1b[H' || str === '\x01') { // Home/Ctrl+A
        setCursorPosition(0);
        cursorRef.current = 0;
        return;
      }

      if (str === '\x1b[F' || str === '\x05') { // End/Ctrl+E
        setCursorPosition(currentValue.length);
        cursorRef.current = currentValue.length;
        return;
      }

      // Filter escape sequences
      if (str.startsWith('\x1b')) {
        return;
      }

      // Regular text input
      const printable = str.replace(/[\x00-\x1f\x7f]/g, '');
      if (printable) {
        const newValue = currentValue.slice(0, currentCursor) + printable + currentValue.slice(currentCursor);
        const newCursor = currentCursor + printable.length;
        setValue(newValue);
        setCursorPosition(newCursor);
        valueRef.current = newValue;
        cursorRef.current = newCursor;
      }
    };

    stdin.on('data', handleData);
    return () => {
      stdin.off('data', handleData);
    };
  }, [stdin, vimModeEnabled, completionsEnabled, completions, showCompletions, completionIndex, disabled, cwd, onCommandPalette, onHistorySearch, onFuzzyFinder]);

  // Display with cursor
  const displayValue = value || '';
  const beforeCursor = displayValue.slice(0, cursorPosition);
  const atCursor = displayValue[cursorPosition] || ' ';
  const afterCursor = displayValue.slice(cursorPosition + 1);

  // Multi-line handling
  const lines = displayValue.split('\n');
  const isMultiLine = lines.length > 1;

  let charCount = 0;
  let cursorLine = 0;
  let cursorCol = cursorPosition;
  for (let i = 0; i < lines.length; i++) {
    if (charCount + lines[i].length >= cursorPosition) {
      cursorLine = i;
      cursorCol = cursorPosition - charCount;
      break;
    }
    charCount += lines[i].length + 1;
  }

  // Prompt parts
  const gitPrompt = gitStatus?.isRepo ? formatGitPrompt(gitStatus) : '';
  const gitColor = gitStatus?.isRepo ? getBranchColor(gitStatus) : '';
  const vimIndicator = vimModeEnabled ? getModeIndicator(vimState.mode) : '';

  return (
    <Box flexDirection="column" marginBottom={1}>
      {/* Prompt line with git status */}
      {(gitStatus?.isRepo || vimModeEnabled) && (
        <Box paddingX={1}>
          {vimModeEnabled && (
            <Text color={vimState.mode === 'normal' ? 'cyan' : vimState.mode === 'insert' ? 'green' : 'yellow'}>
              {vimIndicator}{' '}
            </Text>
          )}
          {gitStatus?.isRepo && (
            <Text color={gitColor as any}>
              {gitPrompt}
            </Text>
          )}
        </Box>
      )}

      {/* Main input area */}
      <Box
        flexDirection="column"
        borderStyle="single"
        borderColor={disabled ? 'gray' : colors.muted}
        borderLeft={false}
        borderRight={false}
        width="100%"
      >
        {isMultiLine ? (
          <Box flexDirection="column" paddingX={1}>
            {lines.map((line, lineIndex) => (
              <Box key={lineIndex}>
                <Text color={colors.primary} bold>
                  {lineIndex === 0 ? '> ' : '  '}
                </Text>
                {lineIndex === cursorLine ? (
                  <>
                    <Text>{line.slice(0, cursorCol)}</Text>
                    <Text inverse>{line[cursorCol] || ' '}</Text>
                    <Text>{line.slice(cursorCol + 1)}</Text>
                  </>
                ) : (
                  <Text>{line}</Text>
                )}
              </Box>
            ))}
          </Box>
        ) : (
          <Box paddingX={1}>
            <Text color={colors.primary} bold>
              {'> '}
            </Text>
            <Text>{beforeCursor}</Text>
            <Text inverse>{atCursor}</Text>
            <Text>{afterCursor}</Text>
          </Box>
        )}
      </Box>

      {/* Completion menu */}
      {showCompletions && completions && completions.items.length > 0 && (
        <CompletionMenu
          items={completions.items.map((item) => ({
            value: item,
            type: completions.type as any,
          }))}
          selectedIndex={completionIndex}
          visible={true}
          position={{ x: completions.startIndex + 2, y: 0 }}
        />
      )}

      {/* Hints */}
      <Box paddingX={1}>
        <Text color={colors.muted} dimColor>
          {isMultiLine ? 'Shift+Enter: newline • Enter: submit' : ''}
          {!isMultiLine && 'Tab: complete • Ctrl+R: history • Ctrl+P: commands'}
        </Text>
      </Box>
    </Box>
  );
}

export default EnhancedInput;
