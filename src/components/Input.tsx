// Updated: 2026-01-13 02:05:00
// Eames Design Agent - Simplified Input Component
// Clean Claude Code style input without UI bugs

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Box, Text, useStdin } from 'ink';
import { colors } from '../theme.js';
import { SlashCommandMenu, getFilteredCommands } from './SlashCommandMenu.js';
import { FileAutocomplete, getFilesForAutocomplete } from './FileAutocomplete.js';

interface InputProps {
  onSubmit: (value: string) => void;
  commandHistory?: string[];  // History of previous commands
}

type MenuMode = 'none' | 'slash' | 'file';

export function Input({ onSubmit, commandHistory = [] }: InputProps) {
  const [value, setValue] = useState('');
  const [cursorPosition, setCursorPosition] = useState(0);
  const [menuMode, setMenuMode] = useState<MenuMode>('none');
  const [menuIndex, setMenuIndex] = useState(0);
  const [historyIndex, setHistoryIndex] = useState(-1);  // -1 means current input
  const [savedInput, setSavedInput] = useState('');  // Save current input when browsing history
  const [multilineMode, setMultilineMode] = useState(false);  // Multiline input mode
  const [multilineBuffer, setMultilineBuffer] = useState<string[]>([]);  // Lines in multiline mode
  const [killBuffer, setKillBuffer] = useState('');  // Kill buffer for Ctrl+K/Y
  const { stdin, setRawMode } = useStdin();

  // Check if we should show the slash command menu
  const isSlashMode = value.startsWith('/') && !value.includes(' ');
  const slashFilter = isSlashMode ? value : '';
  const filteredCommands = useMemo(() => 
    isSlashMode ? getFilteredCommands(slashFilter) : [], 
    [isSlashMode, slashFilter]
  );

  // Check for @ file mention mode
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

  // Derive showMenu
  const showMenu = (isSlashMode && filteredCommands.length > 0) || (isFileMode && filteredFiles.length > 0);
  const menuItemCount = isSlashMode ? filteredCommands.length : filteredFiles.length;

  // Update menu mode
  useEffect(() => {
    if (isSlashMode && filteredCommands.length > 0) {
      setMenuMode('slash');
      setMenuIndex(0);
    } else if (isFileMode && filteredFiles.length > 0) {
      setMenuMode('file');
      setMenuIndex(0);
    } else {
      setMenuMode('none');
    }
  }, [isSlashMode, filteredCommands.length, isFileMode, filteredFiles.length]);

  // Enable raw mode and hide terminal cursor
  useEffect(() => {
    if (setRawMode) {
      setRawMode(true);
    }
    // Hide terminal cursor to prevent dual cursors
    process.stdout.write('\x1b[?25l');
    return () => {
      if (setRawMode) {
        setRawMode(false);
      }
      // Show terminal cursor on cleanup
      process.stdout.write('\x1b[?25h');
    };
  }, [setRawMode]);

  // Select slash command - submit immediately if command has immediate flag
  const selectCommand = useCallback((index: number) => {
    const commands = getFilteredCommands(slashFilter);
    if (commands[index]) {
      const cmd = commands[index];
      if (cmd.immediate) {
        // Submit immediately for commands that don't need arguments
        onSubmit(cmd.command);
        setValue('');
        setCursorPosition(0);
        setMenuMode('none');
      } else {
        // Set value and wait for user to add arguments
        setValue(cmd.command + ' ');
        setCursorPosition(cmd.command.length + 1);
        setMenuMode('none');
      }
    }
  }, [slashFilter, onSubmit]);

  // Select file
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

  // Handle input
  useEffect(() => {
    if (!stdin) return;

    const handleData = (data: Buffer) => {
      const str = data.toString();

      // Menu navigation
      if (showMenu) {
        if (str === '\x1b[A') { // Up
          setMenuIndex(prev => {
            const newIndex = prev - 1;
            return Math.max(0, Math.min(newIndex, menuItemCount - 1));
          });
          return;
        }
        if (str === '\x1b[B') { // Down
          setMenuIndex(prev => {
            const newIndex = prev + 1;
            return Math.max(0, Math.min(newIndex, menuItemCount - 1));
          });
          return;
        }
        if (str === '\t') { // Tab - select
          if (menuMode === 'slash') selectCommand(menuIndex);
          else if (menuMode === 'file') selectFile(menuIndex);
          return;
        }
        if (str === '\x1b' || str === '\x1b\x1b') { // Escape
          setMenuMode('none');
          // Exit multiline mode on Escape
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
          return;
        }
        
        // Check if line ends with backslash for multiline continuation
        const endsWithBackslash = value.trimEnd().endsWith('\\');
        
        if (endsWithBackslash) {
          // Enter multiline mode - remove trailing \ and add to buffer
          const lineWithoutBackslash = value.trimEnd().slice(0, -1);
          setMultilineBuffer(prev => [...prev, lineWithoutBackslash]);
          setMultilineMode(true);
          setValue('');
          setCursorPosition(0);
          return;
        }
        
        // In multiline mode and doesn't end with \, submit all lines
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
        
        // Normal single-line submit
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
        }
        // If at start of line in multiline mode, go back to previous line
        else if (multilineMode && multilineBuffer.length > 0) {
          const lastLine = multilineBuffer[multilineBuffer.length - 1];
          setMultilineBuffer(prev => prev.slice(0, -1));
          setValue(lastLine + '\\');  // Restore the backslash
          setCursorPosition(lastLine.length + 1);
          if (multilineBuffer.length === 1) {
            setMultilineMode(false);
          }
        }
        return;
      }

      // Ctrl+C
      if (str === '\x03') {
        process.exit(0);
      }

      // Ctrl+D - exit on empty line (standard Unix EOF)
      if (str === '\x04') {
        if (value.length === 0 && !multilineMode) {
          process.exit(0);
        }
        return;
      }

      // Ctrl+U - clear line
      if (str === '\x15') {
        // Store cleared text in kill buffer
        setKillBuffer(value.slice(0, cursorPosition));
        setValue('');
        setCursorPosition(0);
        return;
      }

      // Ctrl+W - delete word
      if (str === '\x17') {
        const beforeCursor = value.slice(0, cursorPosition);
        const afterCursor = value.slice(cursorPosition);
        const lastSpace = beforeCursor.trimEnd().lastIndexOf(' ');
        const newBefore = lastSpace === -1 ? '' : beforeCursor.slice(0, lastSpace + 1);
        const killed = beforeCursor.slice(newBefore.length);
        setKillBuffer(killed);  // Store deleted word in kill buffer
        setValue(newBefore + afterCursor);
        setCursorPosition(newBefore.length);
        return;
      }

      // Ctrl+K - delete to end of line
      if (str === '\x0b') {
        const beforeCursor = value.slice(0, cursorPosition);
        const afterCursor = value.slice(cursorPosition);
        setKillBuffer(afterCursor);  // Store deleted text in kill buffer
        setValue(beforeCursor);
        return;
      }

      // Ctrl+Y - yank/paste from kill buffer
      if (str === '\x19') {
        if (killBuffer) {
          setValue(prev => prev.slice(0, cursorPosition) + killBuffer + prev.slice(cursorPosition));
          setCursorPosition(prev => prev + killBuffer.length);
        }
        return;
      }

      // Ctrl+L - clear screen
      if (str === '\x0c') {
        console.clear();
        return;
      }

      // Ctrl+R - reverse history search (search as you type)
      if (str === '\x12') {
        if (commandHistory.length > 0 && value.trim()) {
          // Find first matching command in history
          const matches = commandHistory.filter(cmd => 
            cmd.toLowerCase().includes(value.toLowerCase())
          );
          if (matches.length > 0) {
            setValue(matches[matches.length - 1]);
            setCursorPosition(matches[matches.length - 1].length);
          }
        }
        return;
      }

      // Arrow keys (when menu NOT open)
      if (!showMenu) {
        if (str === '\x1b[D') { // Left
          setCursorPosition(prev => Math.max(0, prev - 1));
          return;
        }
        if (str === '\x1b[C') { // Right
          setCursorPosition(prev => Math.min(value.length, prev + 1));
          return;
        }
        // Up arrow - history navigation
        if (str === '\x1b[A') {
          if (commandHistory.length > 0) {
            if (historyIndex === -1) {
              // Save current input before browsing
              setSavedInput(value);
            }
            const newIndex = Math.min(historyIndex + 1, commandHistory.length - 1);
            setHistoryIndex(newIndex);
            const historyValue = commandHistory[commandHistory.length - 1 - newIndex];
            setValue(historyValue);
            setCursorPosition(historyValue.length);
          }
          return;
        }
        // Down arrow - history navigation
        if (str === '\x1b[B') {
          if (historyIndex > 0) {
            const newIndex = historyIndex - 1;
            setHistoryIndex(newIndex);
            const historyValue = commandHistory[commandHistory.length - 1 - newIndex];
            setValue(historyValue);
            setCursorPosition(historyValue.length);
          } else if (historyIndex === 0) {
            // Return to saved input
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
      if (str.startsWith('\x1b')) {
        return;
      }

      // Regular text
      const printable = str.replace(/[\x00-\x1f\x7f]/g, '');
      if (printable) {
        setValue(prev => prev.slice(0, cursorPosition) + printable + prev.slice(cursorPosition));
        setCursorPosition(prev => prev + printable.length);
      }
    };

    stdin.on('data', handleData);
    return () => {
      stdin.off('data', handleData);
    };
  }, [stdin, value, cursorPosition, onSubmit, showMenu, menuMode, menuIndex, menuItemCount, selectCommand, selectFile]);

  // Display
  const displayValue = value || '';
  const beforeCursor = displayValue.slice(0, cursorPosition);
  const atCursor = displayValue[cursorPosition] || ' ';
  const afterCursor = displayValue.slice(cursorPosition + 1);

  return (
    <Box flexDirection="column" minHeight={1}>
      {/* Slash command menu */}
      {menuMode === 'slash' && (
        <SlashCommandMenu
          commands={filteredCommands}
          filter={slashFilter}
          selectedIndex={menuIndex}
          visible={true}
        />
      )}
      
      {/* File autocomplete menu */}
      {menuMode === 'file' && (
        <FileAutocomplete
          files={filteredFiles}
          filter={fileFilter}
          selectedIndex={menuIndex}
          visible={true}
        />
      )}
      
      {/* Multiline buffer display */}
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
      
      {/* Input line */}
      <Box minHeight={1}>
        <Text color={colors.primary} bold>{multilineMode ? '… ' : '> '}</Text>
        <Text>{beforeCursor}</Text>
        <Text inverse>{atCursor}</Text>
        <Text>{afterCursor}</Text>
        {multilineMode && <Text color={colors.muted} dimColor> (\ for continue, Enter to submit, Esc to cancel)</Text>}
      </Box>
    </Box>
  );
}
