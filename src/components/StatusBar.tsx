// Updated: 2026-01-18 - Simplified for Claude Code UX
// Eames Design Agent - Status Bar Component
// MINIMAL status bar - one line, key info only

import React from 'react';
import { Box, Text } from 'ink';
import { colors } from '../theme.js';
import type { PermissionMode } from '../types/permissions.js';

interface StatusBarProps {
	permissionMode?: PermissionMode;
	thinkingMode?: boolean;
	model?: string;
}

/**
 * MINIMAL status bar - Claude Code style
 * One line, key info only - shown at top of CLI
 */
export function StatusBar({ 
	permissionMode = 'bypassPermissions', 
	thinkingMode = false,
	model = 'claude-sonnet-4-5'
}: StatusBarProps) {
	const modeColors: Record<PermissionMode, string> = {
		default: 'yellow',
		acceptEdits: 'green',
		plan: 'blue',
		bypassPermissions: 'gray',
	};

	const modeLabels: Record<PermissionMode, string> = {
		default: 'PROMPT',
		acceptEdits: 'AUTO',
		plan: 'PLAN',
		bypassPermissions: 'BYPASS',
	};

	// Get short model name
	const shortModel = model.replace('claude-', '').replace('-20250929', '');

	return (
		<Box marginBottom={1}>
			{/* Permission mode indicator */}
			<Text color={modeColors[permissionMode]} dimColor>
				[{modeLabels[permissionMode]}]
			</Text>

			{/* Thinking mode */}
			{thinkingMode && (
				<Text color="blue"> 🧠</Text>
			)}

			{/* Model */}
			<Text color="gray" dimColor> · {shortModel}</Text>
		</Box>
	);
}
