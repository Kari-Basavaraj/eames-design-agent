// Updated: 2026-01-12 04:20:00
// Eames Design Agent - Collapsible Section Component
// Expandable/collapsible output sections

import React, { useState } from 'react';
import { Box, Text, useInput } from 'ink';

interface CollapsibleSectionProps {
  title: string;
  children: React.ReactNode;
  defaultExpanded?: boolean;
  maxCollapsedLines?: number;
  icon?: string;
  badge?: string | number;
  borderColor?: string;
}

export const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
  title,
  children,
  defaultExpanded = false,
  maxCollapsedLines = 3,
  icon = '▶',
  badge,
  borderColor = 'gray',
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const expandedIcon = '▼';
  const collapsedIcon = icon;

  return (
    <Box flexDirection="column" marginY={1}>
      {/* Header */}
      <Box
        borderStyle="single"
        borderColor={borderColor as any}
        paddingX={1}
        flexDirection="row"
        justifyContent="space-between"
      >
        <Box>
          <Text color="cyan">
            {isExpanded ? expandedIcon : collapsedIcon}{' '}
          </Text>
          <Text bold>{title}</Text>
        </Box>
        {badge !== undefined && (
          <Text color="gray">({badge})</Text>
        )}
      </Box>

      {/* Content */}
      {isExpanded && (
        <Box
          borderStyle="single"
          borderColor={borderColor as any}
          borderTop={false}
          paddingX={1}
          flexDirection="column"
        >
          {children}
        </Box>
      )}

      {/* Collapsed preview */}
      {!isExpanded && (
        <Box paddingX={2}>
          <Text color="gray" dimColor>
            [Click to expand or press 'e']
          </Text>
        </Box>
      )}
    </Box>
  );
};

/**
 * Tool output section with auto-collapse
 */
interface ToolOutputSectionProps {
  toolName: string;
  output: string;
  success: boolean;
  duration?: number;
  defaultExpanded?: boolean;
}

export const ToolOutputSection: React.FC<ToolOutputSectionProps> = ({
  toolName,
  output,
  success,
  duration,
  defaultExpanded = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const lines = output.split('\n');
  const lineCount = lines.length;
  const previewLines = 3;

  const statusIcon = success ? '✓' : '✗';
  const statusColor = success ? 'green' : 'red';

  const formatDuration = (ms?: number): string => {
    if (!ms) return '';
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  return (
    <Box flexDirection="column" marginY={1}>
      {/* Header */}
      <Box flexDirection="row" gap={1}>
        <Text color={statusColor}>{statusIcon}</Text>
        <Text bold>{toolName}</Text>
        {duration && (
          <Text color="gray">({formatDuration(duration)})</Text>
        )}
        <Text color="gray">
          {isExpanded ? '▼' : '▶'} {lineCount} lines
        </Text>
      </Box>

      {/* Content */}
      <Box
        borderStyle="single"
        borderColor="gray"
        paddingX={1}
        flexDirection="column"
      >
        {isExpanded ? (
          // Full output
          lines.map((line, i) => (
            <Text key={i}>{line}</Text>
          ))
        ) : (
          // Preview
          <>
            {lines.slice(0, previewLines).map((line, i) => (
              <Text key={i}>{line}</Text>
            ))}
            {lineCount > previewLines && (
              <Text color="gray" dimColor>
                ... {lineCount - previewLines} more lines
              </Text>
            )}
          </>
        )}
      </Box>
    </Box>
  );
};

/**
 * Code block with collapse
 */
interface CollapsibleCodeProps {
  code: string;
  language?: string;
  filename?: string;
  defaultExpanded?: boolean;
}

export const CollapsibleCode: React.FC<CollapsibleCodeProps> = ({
  code,
  language,
  filename,
  defaultExpanded = true,
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const lines = code.split('\n');
  const lineCount = lines.length;

  return (
    <Box flexDirection="column" marginY={1}>
      {/* Header */}
      <Box
        backgroundColor="gray"
        paddingX={1}
        flexDirection="row"
        justifyContent="space-between"
      >
        <Box>
          <Text color="white">
            {isExpanded ? '▼' : '▶'}{' '}
          </Text>
          {filename && <Text color="yellow">{filename}</Text>}
          {language && !filename && (
            <Text color="cyan">{language}</Text>
          )}
        </Box>
        <Text color="white">{lineCount} lines</Text>
      </Box>

      {/* Code */}
      {isExpanded && (
        <Box
          borderStyle="single"
          borderColor="gray"
          borderTop={false}
          paddingX={1}
          flexDirection="column"
        >
          {lines.map((line, i) => (
            <Box key={i}>
              <Text color="gray">{String(i + 1).padStart(3)} │ </Text>
              <Text>{line}</Text>
            </Box>
          ))}
        </Box>
      )}

      {!isExpanded && (
        <Box borderStyle="single" borderColor="gray" borderTop={false} paddingX={1}>
          <Text color="gray">
            {lines.slice(0, 2).map((l, i) => (
              <Text key={i}>{l.slice(0, 60)}{l.length > 60 ? '...' : ''}{'\n'}</Text>
            ))}
            ... {lineCount - 2} more lines
          </Text>
        </Box>
      )}
    </Box>
  );
};

/**
 * Multi-section collapsible container
 */
interface AccordionProps {
  children: React.ReactNode;
  allowMultiple?: boolean;
}

export const Accordion: React.FC<AccordionProps> = ({
  children,
  allowMultiple = true,
}) => {
  const [expandedIndices, setExpandedIndices] = useState<Set<number>>(new Set());

  const handleToggle = (index: number) => {
    setExpandedIndices((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        if (!allowMultiple) {
          next.clear();
        }
        next.add(index);
      }
      return next;
    });
  };

  return (
    <Box flexDirection="column">
      {React.Children.map(children, (child, index) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as React.ReactElement<any>, {
            defaultExpanded: expandedIndices.has(index),
          });
        }
        return child;
      })}
    </Box>
  );
};

export default CollapsibleSection;
