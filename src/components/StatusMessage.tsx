import React from 'react';
import { useState, useEffect } from 'react';
import { Box, Text } from 'ink';

interface StatusMessageProps {
  message: string | null;
  timeout?: number;
}

/**
 * Displays a status message (dimmed text) with optional auto-dismiss timeout
 * Default timeout increased to 30 seconds to prevent /context output from vanishing
 */
export function StatusMessage({ message, timeout = 30000 }: StatusMessageProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (message) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
      }, timeout);
      return () => clearTimeout(timer);
    }
  }, [message, timeout]);

  if (!message || !visible) {
    return null;
  }

  return (
    <Box marginTop={1}>
      <Text dimColor>{message}</Text>
    </Box>
  );
}

