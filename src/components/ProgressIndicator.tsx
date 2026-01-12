// Updated: 2026-01-12 07:00:00
// Claude Code-style progress indicator with animated dots

import React, { useState, useEffect } from 'react';
import { Box, Text } from 'ink';

interface ProgressIndicatorProps {
  message: string;
  startTime: number;
  tokens?: number;
  thinkingTime?: number;
}

export function ProgressIndicator({
  message,
  startTime,
  tokens = 0,
  thinkingTime,
}: ProgressIndicatorProps) {
  const [dots, setDots] = useState('');
  const [elapsed, setElapsed] = useState(0);

  // Animate dots
  useEffect(() => {
    const interval = setInterval(() => {
      setDots(d => d.length >= 3 ? '' : d + '.');
    }, 400);
    return () => clearInterval(interval);
  }, []);

  // Update elapsed time
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [startTime]);

  const formatTime = (seconds: number): string => {
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const formatTokens = (t: number): string => {
    if (t >= 1000) return `${(t / 1000).toFixed(1)}k`;
    return String(t);
  };

  return (
    <Box flexDirection="column">
      <Text>
        <Text color="yellow">· {message}{dots}</Text>
        <Text color="gray"> (ctrl+c to interrupt</Text>
        <Text color="gray"> · {formatTime(elapsed)}</Text>
        {tokens > 0 && <Text color="gray"> · ↑ {formatTokens(tokens)} tokens</Text>}
        {thinkingTime && <Text color="gray"> · thought for {thinkingTime}s</Text>}
        <Text color="gray">)</Text>
      </Text>
    </Box>
  );
}
