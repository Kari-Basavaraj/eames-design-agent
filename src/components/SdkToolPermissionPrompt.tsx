// Updated: 2026-02-16
// SDK tool permission prompt - Claude Code style
// Shown when Bash, Edit, or Write needs user approval (permissionMode: default)

import React from 'react';
import { Box, Text } from 'ink';
import { colors } from '../theme.js';
import type { SdkToolPermissionRequest } from '../sdk/agent.js';

interface SdkToolPermissionPromptProps {
  request: SdkToolPermissionRequest;
}

export function SdkToolPermissionPrompt({ request }: SdkToolPermissionPromptProps) {
  const { toolName, description, preview } = request;

  return (
    <Box flexDirection="column" marginTop={1} marginBottom={1}>
      <Box marginBottom={1}>
        <Text color="yellow" bold>
          ⚠️  Permission Required
        </Text>
      </Box>
      <Box marginLeft={2} flexDirection="column">
        <Box>
          <Text color="white" bold>
            {toolName}
          </Text>
          <Text color="gray" dimColor>
            {' '}
            wants to execute:
          </Text>
        </Box>
        {description && (
          <Box marginTop={1}>
            <Text color="cyan">{description}</Text>
          </Box>
        )}
        {preview && preview.trim() && (
          <Box
            marginTop={1}
            paddingX={2}
            paddingY={1}
            borderStyle="single"
            borderColor="gray"
            flexDirection="column"
          >
            {preview.split('\n').slice(0, 10).map((line, i) => (
              <Text key={i} color="gray">
                {line}
              </Text>
            ))}
          </Box>
        )}
        <Box marginTop={1}>
          <Text color="gray" dimColor>
            Allow? (y/n)
          </Text>
        </Box>
      </Box>
    </Box>
  );
}
