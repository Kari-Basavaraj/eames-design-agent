// Updated: 2026-01-12 04:20:00
// Eames Design Agent - Completion Menu Component
// Tab completion dropdown

import React from 'react';
import { Box, Text } from 'ink';

interface CompletionItem {
  value: string;
  description?: string;
  icon?: string;
  type?: 'command' | 'flag' | 'file' | 'directory' | 'history';
}

interface CompletionMenuProps {
  items: CompletionItem[];
  selectedIndex: number;
  visible: boolean;
  maxItems?: number;
  position?: { x: number; y: number };
}

export const CompletionMenu: React.FC<CompletionMenuProps> = ({
  items,
  selectedIndex,
  visible,
  maxItems = 8,
  position,
}) => {
  if (!visible || items.length === 0) return null;

  const displayItems = items.slice(0, maxItems);
  const hasMore = items.length > maxItems;

  const getTypeIcon = (type?: string): string => {
    switch (type) {
      case 'command':
        return '⚡';
      case 'flag':
        return '🏴';
      case 'file':
        return '📄';
      case 'directory':
        return '📁';
      case 'history':
        return '📜';
      default:
        return '○';
    }
  };

  const getTypeColor = (type?: string): string => {
    switch (type) {
      case 'command':
        return 'cyan';
      case 'flag':
        return 'yellow';
      case 'file':
        return 'white';
      case 'directory':
        return 'blue';
      case 'history':
        return 'magenta';
      default:
        return 'white';
    }
  };

  return (
    <Box
      flexDirection="column"
      borderStyle="round"
      borderColor="gray"
      paddingX={1}
      marginLeft={position?.x ?? 0}
    >
      {displayItems.map((item, index) => {
        const isSelected = index === selectedIndex;
        const icon = item.icon || getTypeIcon(item.type);
        const color = getTypeColor(item.type);

        return (
          <Box key={`${item.value}-${index}`} flexDirection="row">
            <Text
              backgroundColor={isSelected ? 'gray' : undefined}
              color={isSelected ? 'white' : (color as any)}
            >
              {isSelected ? '❯' : ' '} {icon}{' '}
            </Text>
            <Text
              backgroundColor={isSelected ? 'gray' : undefined}
              color={isSelected ? 'white' : (color as any)}
              bold={isSelected}
            >
              {item.value}
            </Text>
            {item.description && (
              <Text color="gray" dimColor>
                {' '}
                - {item.description}
              </Text>
            )}
          </Box>
        );
      })}

      {hasMore && (
        <Text color="gray" dimColor>
          +{items.length - maxItems} more (Tab to cycle)
        </Text>
      )}
    </Box>
  );
};

/**
 * Inline completion preview
 */
interface InlineCompletionProps {
  currentInput: string;
  completion: string;
  cursorPosition: number;
}

export const InlineCompletion: React.FC<InlineCompletionProps> = ({
  currentInput,
  completion,
  cursorPosition,
}) => {
  // Calculate the completion suffix
  const inputBeforeCursor = currentInput.slice(0, cursorPosition);
  const inputAfterCursor = currentInput.slice(cursorPosition);

  // Find common prefix
  let commonLength = 0;
  for (let i = 0; i < inputBeforeCursor.length && i < completion.length; i++) {
    if (inputBeforeCursor[inputBeforeCursor.length - 1 - i] === completion[completion.length - 1 - i]) {
      commonLength++;
    } else {
      break;
    }
  }

  const suffix = completion.slice(commonLength);

  if (!suffix) return null;

  return (
    <Text color="gray" dimColor>
      {suffix}
    </Text>
  );
};

/**
 * Completion status bar
 */
interface CompletionStatusProps {
  total: number;
  current: number;
  type: string;
}

export const CompletionStatus: React.FC<CompletionStatusProps> = ({
  total,
  current,
  type,
}) => {
  if (total === 0) return null;

  return (
    <Box>
      <Text color="gray">
        [{current + 1}/{total}] {type}
      </Text>
    </Box>
  );
};

export default CompletionMenu;
