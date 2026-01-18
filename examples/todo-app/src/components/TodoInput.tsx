// Updated: 2026-01-17 17:19:00
// TodoInput Component - Text input for adding/editing todos

import React, { useState } from 'react';
import { Box, Text } from 'ink';
import TextInput from 'ink-text-input';

interface TodoInputProps {
  placeholder?: string;
  initialValue?: string;
  onSubmit: (value: string) => void;
  onCancel?: () => void;
  label?: string;
}

export function TodoInput({
  placeholder = 'Enter todo title...',
  initialValue = '',
  onSubmit,
  onCancel,
  label,
}: TodoInputProps) {
  const [value, setValue] = useState(initialValue);

  const handleSubmit = (submittedValue: string) => {
    const trimmed = submittedValue.trim();
    if (trimmed) {
      onSubmit(trimmed);
      setValue('');
    }
  };

  return (
    <Box flexDirection="row" paddingX={1}>
      {label && (
        <Text color="cyan" bold>
          {label}{' '}
        </Text>
      )}
      <Text color="green">❯ </Text>
      <TextInput
        value={value}
        onChange={setValue}
        onSubmit={handleSubmit}
        placeholder={placeholder}
      />
      {onCancel && (
        <Text color="gray" dimColor>
          {' '}(Esc to cancel)
        </Text>
      )}
    </Box>
  );
}
