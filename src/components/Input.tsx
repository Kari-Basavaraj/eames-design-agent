// Updated: 2026-01-12 00:30:00
// Eames Design Agent - Input Component
// Fixed paste handling (Claude Code-like input)

import React, { useState, useEffect } from 'react';
import { Box, Text, useInput, useStdin } from 'ink';
import { colors } from '../theme.js';

interface InputProps {
  onSubmit: (value: string) => void;
}

export function Input({ onSubmit }: InputProps) {
  const [value, setValue] = useState('');
  const [cursorPosition, setCursorPosition] = useState(0);
  const { stdin, setRawMode } = useStdin();

  // Enable raw mode for proper input handling
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

  // Handle paste and character input via stdin directly
  useEffect(() => {
    if (!stdin) return;

    const handleData = (data: Buffer) => {
      const str = data.toString();

      // Handle special keys
      if (str === '\r' || str === '\n') {
        // Enter key - submit
        if (value.trim()) {
          onSubmit(value);
          setValue('');
          setCursorPosition(0);
        }
        return;
      }

      if (str === '\x7f' || str === '\b') {
        // Backspace
        if (cursorPosition > 0) {
          setValue(prev => prev.slice(0, cursorPosition - 1) + prev.slice(cursorPosition));
          setCursorPosition(prev => prev - 1);
        }
        return;
      }

      if (str === '\x03') {
        // Ctrl+C - exit
        process.exit(0);
      }

      if (str === '\x15') {
        // Ctrl+U - clear line
        setValue('');
        setCursorPosition(0);
        return;
      }

      if (str === '\x17') {
        // Ctrl+W - delete word
        const beforeCursor = value.slice(0, cursorPosition);
        const afterCursor = value.slice(cursorPosition);
        const lastSpace = beforeCursor.trimEnd().lastIndexOf(' ');
        const newBefore = lastSpace === -1 ? '' : beforeCursor.slice(0, lastSpace + 1);
        setValue(newBefore + afterCursor);
        setCursorPosition(newBefore.length);
        return;
      }

      // Arrow keys (escape sequences)
      if (str === '\x1b[D') {
        // Left arrow
        setCursorPosition(prev => Math.max(0, prev - 1));
        return;
      }

      if (str === '\x1b[C') {
        // Right arrow
        setCursorPosition(prev => Math.min(value.length, prev + 1));
        return;
      }

      if (str === '\x1b[H' || str === '\x01') {
        // Home or Ctrl+A
        setCursorPosition(0);
        return;
      }

      if (str === '\x1b[F' || str === '\x05') {
        // End or Ctrl+E
        setCursorPosition(value.length);
        return;
      }

      // Filter out other escape sequences
      if (str.startsWith('\x1b')) {
        return;
      }

      // Regular text input (including paste - comes as full string)
      // Filter to printable characters
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
  }, [stdin, value, cursorPosition, onSubmit]);

  // Display with cursor
  const displayValue = value || '';
  const beforeCursor = displayValue.slice(0, cursorPosition);
  const atCursor = displayValue[cursorPosition] || ' ';
  const afterCursor = displayValue.slice(cursorPosition + 1);

  return (
    <Box
      flexDirection="column"
      marginBottom={1}
      borderStyle="single"
      borderColor={colors.muted}
      borderLeft={false}
      borderRight={false}
      width="100%"
    >
      <Box paddingX={1}>
        <Text color={colors.primary} bold>
          {'> '}
        </Text>
        <Text>{beforeCursor}</Text>
        <Text inverse>{atCursor}</Text>
        <Text>{afterCursor}</Text>
      </Box>
    </Box>
  );
}
