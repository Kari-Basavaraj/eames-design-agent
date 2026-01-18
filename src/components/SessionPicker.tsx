import React, { useState, useEffect } from 'react';
import { Box, Text, useInput } from 'ink';
import { existsSync, readdirSync, statSync, readFileSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';
import { colors } from '../theme.js';

interface Session {
	id: string;
	timestamp: Date;
	firstQuery: string;
	messageCount: number;
}

interface SessionPickerProps {
	onSelect: (sessionId: string) => void;
	onCancel: () => void;
}

export function SessionPicker({ onSelect, onCancel }: SessionPickerProps) {
	const [sessions, setSessions] = useState<Session[]>([]);
	const [selectedIndex, setSelectedIndex] = useState(0);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const loadSessions = async () => {
			try {
				// Try both .claude and .eames directories
				const dirs = [
					join(homedir(), '.claude', 'sessions'),
					join(homedir(), '.eames', 'sessions'),
				];
				
				const allSessions: Session[] = [];
				
				for (const dir of dirs) {
					if (!existsSync(dir)) continue;
					
					const files = readdirSync(dir)
						.filter(f => f.endsWith('.json'));
					
					for (const file of files) {
						try {
							const path = join(dir, file);
							const stat = statSync(path);
							const data = JSON.parse(readFileSync(path, 'utf-8'));
							const messages = data.messages || [];
							
							const firstUserMsg = messages.find((m: any) => m.role === 'user');
							
							allSessions.push({
								id: file.replace('.json', ''),
								timestamp: new Date(stat.mtime),
								firstQuery: firstUserMsg?.content?.slice(0, 80) || 'Untitled session',
								messageCount: messages.length,
							});
						} catch (e) {
							// Skip invalid sessions
							console.error(`Failed to load session ${file}:`, e);
						}
					}
				}
				
				// Sort by timestamp descending
				allSessions.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
				
				setSessions(allSessions);
			} catch (e) {
				console.error('Failed to load sessions:', e);
				setSessions([]);
			} finally {
				setLoading(false);
			}
		};
		
		loadSessions();
	}, []);

	useInput((input, key) => {
		if (key.upArrow && selectedIndex > 0) {
			setSelectedIndex(selectedIndex - 1);
		}
		if (key.downArrow && selectedIndex < sessions.length - 1) {
			setSelectedIndex(selectedIndex + 1);
		}
		if (key.return && sessions[selectedIndex]) {
			onSelect(sessions[selectedIndex].id);
		}
		if (key.escape) {
			onCancel();
		}
	});

	if (loading) {
		return (
			<Box borderStyle="round" borderColor="cyan" padding={1}>
				<Text color="cyan">Loading sessions...</Text>
			</Box>
		);
	}

	if (sessions.length === 0) {
		return (
			<Box borderStyle="round" borderColor="yellow" padding={1} flexDirection="column">
				<Text color="yellow" bold>No saved sessions found</Text>
				<Text color="gray">Start a new conversation to create a session</Text>
				<Box marginTop={1}>
					<Text color="gray">Press Esc to cancel</Text>
				</Box>
			</Box>
		);
	}

	return (
		<Box borderStyle="round" borderColor="cyan" padding={1} flexDirection="column">
			<Box>
				<Text bold color="cyan">📁 Resume Session</Text>
				<Text color="gray"> ({sessions.length} available)</Text>
			</Box>
			
			<Box flexDirection="column" marginTop={1}>
				{sessions.slice(0, 10).map((session, idx) => {
					const isSelected = idx === selectedIndex;
					const date = session.timestamp.toLocaleDateString();
					const time = session.timestamp.toLocaleTimeString([], { 
						hour: '2-digit', 
						minute: '2-digit' 
					});
					
					return (
						<Box key={session.id}>
							<Text 
								bold={isSelected} 
								color={isSelected ? colors.primary : colors.muted}
								backgroundColor={isSelected ? colors.selection : undefined}
							>
								{isSelected ? '❯ ' : '  '}
								{date} {time}
							</Text>
							<Text color={isSelected ? colors.white : colors.muted}> - </Text>
							<Text 
								color={isSelected ? colors.white : colors.muted}
								bold={isSelected}
							>
								{session.firstQuery}
							</Text>
							<Text color={isSelected ? colors.muted : colors.mutedDark}>
								{' '}({session.messageCount} msgs)
							</Text>
						</Box>
					);
				})}
			</Box>
			
			{sessions.length > 10 && (
				<Box marginTop={1}>
					<Text color="gray">... and {sessions.length - 10} more</Text>
				</Box>
			)}
			
			<Box marginTop={1}>
				<Text color="gray">↑↓ Navigate • Enter Select • Esc Cancel</Text>
			</Box>
		</Box>
	);
}
