// Updated: 2026-02-16 14:00:00
// Eames Design Agent - Thinking/Reasoning Indicator
// Displays when Claude is using extended thinking

import React, { useState, useEffect } from 'react';
import { Box, Text } from 'ink';
import { colors } from '../theme.js';

interface ThinkingViewProps {
  isThinking: boolean;
  thinkingText?: string;
}

const SPINNER_FRAMES = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];

export function ThinkingView({ isThinking, thinkingText }: ThinkingViewProps) {
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    if (!isThinking) return;
    const interval = setInterval(() => {
      setFrame(f => (f + 1) % SPINNER_FRAMES.length);
    }, 80);
    return () => clearInterval(interval);
  }, [isThinking]);

  if (!isThinking) return null;

  const preview = thinkingText
    ? thinkingText.slice(-120).replace(/\n/g, ' ').trim()
    : '';

  return (
    <Box>
      <Text color={colors.secondary}>{SPINNER_FRAMES[frame]} </Text>
      <Text color={colors.secondary} dimColor>Thinking</Text>
      {preview ? (
        <Text color={colors.mutedDark}> {preview.length >= 120 ? '...' + preview : preview}</Text>
      ) : null}
    </Box>
  );
}
