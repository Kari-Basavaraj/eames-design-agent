// Enhanced Input with ALL Claude Code keyboard shortcuts
// Implements: Ctrl+R history search, Alt+B/F word navigation, Shift+Tab, Alt+P, Alt+T

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Box, Text, useStdin } from 'ink';
import { colors } from '../theme.js';
import { SlashCommandMenu, getFilteredCommands } from './SlashCommandMenu.js';
import { FileAutocomplete, getFilesForAutocomplete } from './FileAutocomplete.js';
import { HistorySearch } from './HistorySearch.js';

interface EnhancedInputProps {
  onSubmit: (value: string) => void;
  commandHistory?: string[];
  onModelPicker?: () => void;  // Alt+P
  onToggleThinking?: () => void;  // Alt+T
  onTogglePermissionMode?: () => void;  // Shift+Tab
}

type MenuMode = 'none' | 'slash' | 'file' | 'history';

export function EnhancedInput({ 
  onSubmit, 
  commandHistory = [],
  onModelPicker,
  onToggleThinking,
  onTogglePermissionMode,
}: EnhancedInputProps) {
  const [value, setValue] = useState('');
  const [cursorPosition, setCursorPosition] = useState(0);
  const [menuMode, setMenuMode] = useState<MenuMode>('none');
  const [menuIndex, setMenuIndex] = useState(0);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [savedInput, setSavedInput] = useState('');
  const [multilineMode, setMultilineMode] = useState(false);
  const [multilineBuffer, setMultilineBuffer] = useState<string[]>([]);
  const [killBuffer, setKillBuffer] = useState('');
  const [historySearchQuery, setHistorySearchQuery] = useState('');
  const { stdin, setRawMode } = useStdin();

  // Slash command menu
  const isSlashMode = value.startsWith('/') && !value.includes(' ');
  const slashFilter = isSlashMode ? value : '';
  const filteredCommands = useMemo(() => 
    isSlashMode ? getFilteredCommands(slashFilter) : [], 
    [isSlashMode, slashFilter]
  );

  // File autocomplete
  const findAtMention = useCallback(() => {
    const textBeforeCursor = value.slice(0, cursorPosition);
    const lastAt = textBeforeCursor.lastIndexOf('@');
    if (lastAt === -1) return null;
    const afterAt = textBeforeCursor.slice(lastAt);
    if (afterAt.includes(' ')) return null;
    return afterAt;
  }, [value, cursorPosition]);

  const atMention = findAtMention();
  const isFileMode = atMention !== null;
  const fileFilter = atMention || '';
  const filteredFiles = useMemo(() => 
    isFileMode ? getFilesForAutocomplete(fileFilter) : [],
    [isFileMode, fileFilter]
  );

  // History search mode (Ctrl+R)
  const isHistoryMode = menuMode === 'history';
  const filteredHistory = useMemo(() => {
    if (!historySearchQuery) return commandHistory.slice().reverse();
    const query = historySearchQuery.toLowerCase();
    return commandHistory.filter(cmd => 
      cmd.toLowerCase().includes(query)
    ).reverse();
  }, [commandHistory, historySearchQuery]);

  // Menu state
  const showMenu = (isSlashMode && filteredCommands.length > 0) || 
                   (isFileMode && filteredFiles.length > 0) ||
                   isHistoryMode;
  const menuItemCount = isHistoryMode ? filteredHistory.length : 
                        isSlashMode ? filteredCommands.length : 
                        filteredFiles.length;

  // Update menu mode
  useEffect(() => {
    if (isHistoryMode) {
      // Stay in history mode
    } else if (isSlashMode && filteredCommands.length > 0) {
      setMenuMode('slash');
      setMenuIndex(0);
    } else if (isFileMode && filteredFiles.length > 0) {
      setMenuMode('file');
      setMenuIndex(0);
    } else {
      setMenuMode('none');
    }
  }, [isHistoryMode, isSlashMode, filteredCommands.length, isFileMode, filteredFiles.length]);

  // Word navigation helpers
  const findPrevWordBoundary = useCallback((text: string, pos: number): number => {
    let p = Math.max(0, pos - 1);
    // Skip whitespace
    while (p > 0 && /\s/.test(text[p])) p--;
    // Skip word
    while (p > 0 && !/\s/.test(text[p])) p--;
    return Math.max(0, p === 0 ? 0 : p + 1);
  }, []);

  const findNextWordBoundary = useCallback((text: string, pos: number): number => {
    let p = pos;
    // Skip current word
    while (p < text.length && !/\s/.test(text[p])) p++;
    // Skip whitespace
    while (p < text.length && /\s/.test(text[p])) p++;
    return Math.min(text.length, p);
  }, []);

  // Enable raw mode
  useEffect(() => {
    if (setRawMode) setRawMode(true);
    process.stdout.write('\x1b[?25l'); // Hide cursor
    return () => {
      if (setRawMode) setRawMode(false);
      process.stdout.write('\x1b[?25h'); // Show cursor
    };
  }, [setRawMode]);

  // Command selection
  const selectCommand = useCallback((index: number) => {
    const commands = getFilteredCommands(slashFilter);
    if (commands[index]) {
      const cmd = commands[index];
      if (cmd.immediate) {
        onSubmit(cmd.command);
        setValue('');
        setCursorPosition(0);
        setMenuMode('none');
      } else {
        setValue(cmd.command + ' ');
        setCursorPosition(cmd.command.length + 1);
        setMenuMode('none');
      }
    }
  }, [slashFilter, onSubmit]);

  // File selection
  const selectFile = useCallback((index: number) => {
    const files = getFilesForAutocomplete(fileFilter);
    if (files[index]) {
      const textBeforeCursor = value.slice(0, cursorPosition);
      const lastAt = textBeforeCursor.lastIndexOf('@');
      const beforeAt = value.slice(0, lastAt);
      const afterCursor = value.slice(cursorPosition);
      const newPath = '@' + files[index].path + (files[index].isDirectory ? '' : ' ');
      const newValue = beforeAt + newPath + afterCursor;
      setValue(newValue);
      setCursorPosition(beforeAt.length + newPath.length);
      setMenuMode('none');
    }
  }, [fileFilter, value, cursorPosition]);

  // History selection
  const selectHistory = useCallback((index: number) => {
    if (filteredHistory[index]) {
      setValue(filteredHistory[index]);
      setCursorPosition(filteredHistory[index].length);
      setMenuMode('none');
      setHistorySearchQuery('');
    }
  }, [filteredHistory]);

  // Input handler
  useEffect(() => {
    if (!stdin) return;

    const handleData = (data: Buffer) => {
      const str = data.toString();

      // Ctrl+R - History search
      if (str === '\x12') {
        if (menuMode === 'history') {
          // Cycle to next result
          setMenuIndex(prev => (prev + 1) % filteredHistory.length);
        } else {
          // Enter history search mode
          setMenuMode('history');
          setMenuIndex(0);
          setHistorySearchQuery('');
        }
        return;
      }

      // Shift+Tab - Toggle permission mode
      if (str === '\x1b[Z') {
        onTogglePermissionMode?.();
        return;
      }

      // Alt+P - Model picker
      if (str === '\x1bp' || str === 'π') {
        onModelPicker?.();
        return;
      }

      // Alt+T - Toggle thinking mode
      if (str === '\x1bt' || str === '†') {
        onToggleThinking?.();
        return;
      }

      // Alt+B - Word backward
      if (str === '\x1bb' || str === '∫') {
        const newPos = findPrevWordBoundary(value, cursorPosition);
        setCursorPosition(newPos);
        return;
      }

      // Alt+F - Word forward
      if (str === '\x1bf' || str === 'ƒ') {
        const newPos = findNextWordBoundary(value, cursorPosition);
        setCursorPosition(newPos);
        return;
      }

      // History search mode - typing updates query
      if (isHistoryMode && str.match(/^[a-zA-Z0-9 ]$/)) {
        setHistorySearchQuery(prev => prev + str);
        setMenuIndex(0);
        return;
      }

      // History search backspace
      if (isHistoryMode && (str === '\x7f' || str === '\b')) {
        if (historySearchQuery.length > 0) {
          setHistorySearchQuery(prev => prev.slice(0, -1));
          setMenuIndex(0);
        } else {
          setMenuMode('none');
        }
        return;
      }

      // Menu navigation
      if (showMenu) {
        if (str === '\x1b[A') { // Up
          setMenuIndex(prev => Math.max(0, prev - 1));
          return;
        }
        if (str === '\x1b[B') { // Down
          setMenuIndex(prev => Math.min(menuItemCount - 1, prev + 1));
          return;
        }
        if (str === '\t') { // Tab
          if (menuMode === 'slash') selectCommand(menuIndex);
          else if (menuMode === 'file') selectFile(menuIndex);
          else if (menuMode === 'history') selectHistory(menuIndex);
          return;
        }
        if (str === '\x1b' || str === '\x1b\x1b') { // Escape
          setMenuMode('none');
          setHistorySearchQuery('');
          if (multilineMode) {
            setMultilineMode(false);
            setMultilineBuffer([]);
          }
          return;
        }
      }

      // Enter
      if (str === '\r' || str === '\n') {
        if (showMenu && menuItemCount > 0) {
          if (menuMode === 'slash') selectCommand(menuIndex);
          else if (menuMode === 'file') selectFile(menuIndex);
          else if (menuMode === 'history') selectHistory(menuIndex);
          return;
        }
        
        const endsWithBackslash = value.trimEnd().endsWith('\\');
        
        if (endsWithBackslash) {
          const lineWithoutBackslash = value.trimEnd().slice(0, -1);
          setMultilineBuffer(prev => [...prev, lineWithoutBackslash]);
          setMultilineMode(true);
          setValue('');
          setCursorPosition(0);
          return;
        }
        
        if (multilineMode) {
          const fullInput = [...multilineBuffer, value].join('\n');
          setMultilineMode(false);
          setMultilineBuffer([]);
          onSubmit(fullInput);
          setValue('');
          setCursorPosition(0);
          setMenuMode('none');
          return;
        }
        
        if (value.trim()) {
          onSubmit(value);
          setValue('');
          setCursorPosition(0);
          setMenuMode('none');
        }
        return;
      }

      // Backspace
      if (str === '\x7f' || str === '\b') {
        if (cursorPosition > 0) {
          setValue(prev => prev.slice(0, cursorPosition - 1) + prev.slice(cursorPosition));
          setCursorPosition(prev => prev - 1);
        } else if (multilineMode && multilineBuffer.length > 0) {
          const lastLine = multilineBuffer[multilineBuffer.length - 1];
          setMultilineBuffer(prev => prev.slice(0, -1));
          setValue(lastLine + '\\');
          setCursorPosition(lastLine.length + 1);
          if (multilineBuffer.length === 1) setMultilineMode(false);
        }
        return;
      }

      // Ctrl+C
      if (str === '\x03') process.exit(0);

      // Ctrl+D - Exit
      if (str === '\x04') process.exit(0);

      // Ctrl+U - Clear line
      if (str === '\x15') {
        setKillBuffer(value.slice(0, cursorPosition));
        setValue('');
        setCursorPosition(0);
        return;
      }

      // Ctrl+W - Delete word
      if (str === '\x17') {
        const beforeCursor = value.slice(0, cursorPosition);
        const afterCursor = value.slice(cursorPosition);
        const lastSpace = beforeCursor.trimEnd().lastIndexOf(' ');
        const newBefore = lastSpace === -1 ? '' : beforeCursor.slice(0, lastSpace + 1);
        const killed = beforeCursor.slice(newBefore.length);
        setKillBuffer(killed);
        setValue(newBefore + afterCursor);
        setCursorPosition(newBefore.length);
        return;
      }

      // Ctrl+K - Delete to end
      if (str === '\x0b') {
        const afterCursor = value.slice(cursorPosition);
        setKillBuffer(afterCursor);
        setValue(value.slice(0, cursorPosition));
        return;
      }

      // Ctrl+Y - Yank
      if (str === '\x19') {
        if (killBuffer) {
          setValue(prev => prev.slice(0, cursorPosition) + killBuffer + prev.slice(cursorPosition));
          setCursorPosition(prev => prev + killBuffer.length);
        }
        return;
      }

      // Ctrl+L - Clear screen
      if (str === '\x0c') {
        console.clear();
        return;
      }

      // Arrow keys
      if (!showMenu || menuMode === 'none') {
        if (str === '\x1b[D') { // Left
          setCursorPosition(prev => Math.max(0, prev - 1));
          return;
        }
        if (str === '\x1b[C') { // Right
          setCursorPosition(prev => Math.min(value.length, prev + 1));
          return;
        }
        if (str === '\x1b[A') { // Up
          if (commandHistory.length > 0) {
            if (historyIndex === -1) setSavedInput(value);
            const newIndex = Math.min(historyIndex + 1, commandHistory.length - 1);
            setHistoryIndex(newIndex);
            const historyValue = commandHistory[commandHistory.length - 1 - newIndex];
            setValue(historyValue);
            setCursorPosition(historyValue.length);
          }
          return;
        }
        if (str === '\x1b[B') { // Down
          if (historyIndex > 0) {
            const newIndex = historyIndex - 1;
            setHistoryIndex(newIndex);
            const historyValue = commandHistory[commandHistory.length - 1 - newIndex];
            setValue(historyValue);
            setCursorPosition(historyValue.length);
          } else if (historyIndex === 0) {
            setHistoryIndex(-1);
            setValue(savedInput);
            setCursorPosition(savedInput.length);
          }
          return;
        }
      }

      // Home/End
      if (str === '\x1b[H' || str === '\x01') {
        setCursorPosition(0);
        return;
      }
      if (str === '\x1b[F' || str === '\x05') {
        setCursorPosition(value.length);
        return;
      }

      // Filter escape sequences
      if (str.startsWith('\x1b')) return;

      // Regular text
      const printable = str.replace(/[\x00-\x1f\x7f]/g, '');
      if (printable) {
        setValue(prev => prev.slice(0, cursorPosition) + printable + prev.slice(cursorPosition));
        setCursorPosition(prev => prev + printable.length);
      }
    };

    stdin.on('data', handleData);
    return () => stdin.off('data', handleData);
  }, [stdin, value, cursorPosition, onSubmit, showMenu, menuMode, menuIndex, menuItemCount,
      selectCommand, selectFile, selectHistory, commandHistory, isHistoryMode, filteredHistory,
      historySearchQuery, multilineMode, multilineBuffer, killBuffer, historyIndex, savedInput,
      findPrevWordBoundary, findNextWordBoundary, onModelPicker, onToggleThinking, onTogglePermissionMode]);

  // Display
  const beforeCursor = value.slice(0, cursorPosition);
  const atCursor = value[cursorPosition] || ' ';
  const afterCursor = value.slice(cursorPosition + 1);

  return (
    <Box flexDirection="column" minHeight={1}>
      {menuMode === 'slash' && (
        <SlashCommandMenu
          commands={filteredCommands}
          filter={slashFilter}
          selectedIndex={menuIndex}
          visible={true}
        />
      )}
      
      {menuMode === 'file' && (
        <FileAutocomplete
          files={filteredFiles}
          filter={fileFilter}
          selectedIndex={menuIndex}
          visible={true}
        />
      )}
      
      {menuMode === 'history' && (
        <HistorySearch
          commands={filteredHistory}
          query={historySearchQuery}
          selectedIndex={menuIndex}
          visible={true}
        />
      )}
      
      {multilineMode && multilineBuffer.length > 0 && (
        <Box flexDirection="column">
          {multilineBuffer.map((line, idx) => (
            <Box key={idx}>
              <Text color={colors.muted} dimColor>{'  '}</Text>
              <Text color={colors.muted}>{line}</Text>
            </Box>
          ))}
        </Box>
      )}
      
      <Box minHeight={1}>
        <Text color={colors.primary} bold>
          {isHistoryMode ? '(reverse-i-search) ' : multilineMode ? '… ' : '> '}
        </Text>
        <Text>{beforeCursor}</Text>
        <Text inverse>{atCursor}</Text>
        <Text>{afterCursor}</Text>
        {isHistoryMode && historySearchQuery && (
          <Text color={colors.muted}> `{historySearchQuery}'</Text>
        )}
      </Box>
    </Box>
  );
}
