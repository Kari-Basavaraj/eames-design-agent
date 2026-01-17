// Updated: 2026-01-13 01:00:00
// File Autocomplete Menu - Claude Code style @ mentions

import React from 'react';
import { Box, Text } from 'ink';
import { colors } from '../theme.js';
import * as fs from 'fs';
import * as path from 'path';

export interface FileItem {
  name: string;
  path: string;
  isDirectory: boolean;
}

interface FileAutocompleteProps {
  filter: string;
  selectedIndex: number;
  visible: boolean;
  files: FileItem[];
}

export function FileAutocomplete({ 
  filter, 
  selectedIndex, 
  visible,
  files 
}: FileAutocompleteProps) {
  if (!visible || files.length === 0) return null;

  const maxVisible = 10;
  const displayFiles = files.slice(0, maxVisible);

  return (
    <Box 
      flexDirection="column" 
      borderStyle="round" 
      borderColor={colors.secondary}
      paddingX={1}
      marginBottom={1}
    >
      <Box marginBottom={0}>
        <Text color={colors.muted} dimColor>
          Files {files.length > maxVisible && `(${files.length} total)`}
        </Text>
      </Box>
      
      {displayFiles.map((file, index) => {
        const isSelected = index === selectedIndex;
        const icon = file.isDirectory ? '📁' : '📄';
        
        return (
          <Box key={file.path} paddingY={0}>
            <Text 
              color={isSelected ? colors.white : colors.muted}
              backgroundColor={isSelected ? colors.secondary : undefined}
            >
              {isSelected ? ' › ' : '   '}
            </Text>
            <Text>{icon} </Text>
            <Text 
              color={isSelected ? colors.white : colors.primary}
              backgroundColor={isSelected ? colors.secondary : undefined}
              bold={file.isDirectory}
            >
              {file.name}
            </Text>
          </Box>
        );
      })}
      
      <Box marginTop={0}>
        <Text color={colors.muted} dimColor>
          ↑↓ to navigate • Enter/Tab to select
        </Text>
      </Box>
    </Box>
  );
}

// Get files matching a filter
export function getFilesForAutocomplete(filter: string, cwd: string = process.cwd()): FileItem[] {
  try {
    // Extract the path part after @
    const searchPath = filter.replace(/^@/, '');
    
    // Determine the directory to search
    let dir = cwd;
    let prefix = '';
    
    if (searchPath.includes('/')) {
      const lastSlash = searchPath.lastIndexOf('/');
      const dirPart = searchPath.slice(0, lastSlash + 1);
      prefix = searchPath.slice(lastSlash + 1);
      dir = path.resolve(cwd, dirPart);
    } else {
      prefix = searchPath;
    }
    
    // Read directory
    if (!fs.existsSync(dir)) return [];
    
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    // Filter and map
    const files: FileItem[] = entries
      .filter(entry => {
        // Skip hidden files unless explicitly searching for them
        if (entry.name.startsWith('.') && !prefix.startsWith('.')) return false;
        // Filter by prefix
        return entry.name.toLowerCase().startsWith(prefix.toLowerCase());
      })
      .map(entry => ({
        name: entry.name + (entry.isDirectory() ? '/' : ''),
        path: path.relative(cwd, path.join(dir, entry.name)),
        isDirectory: entry.isDirectory(),
      }))
      .sort((a, b) => {
        // Directories first
        if (a.isDirectory && !b.isDirectory) return -1;
        if (!a.isDirectory && b.isDirectory) return 1;
        return a.name.localeCompare(b.name);
      });
    
    return files.slice(0, 50); // Limit results
  } catch {
    return [];
  }
}
