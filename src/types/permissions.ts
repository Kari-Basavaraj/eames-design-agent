export type PermissionMode = 'default' | 'acceptEdits' | 'plan' | 'bypassPermissions';

export interface PermissionRequest {
	type: 'file_edit' | 'bash_command' | 'file_delete';
	tool: string;
	description: string;
	preview?: string;
}

export interface PermissionPromptProps extends PermissionRequest {
	onApprove: () => void;
	onDeny: () => void;
}

export const PERMISSION_MODE_LABELS: Record<PermissionMode, string> = {
	default: 'PROMPT',
	acceptEdits: 'AUTO-ACCEPT',
	plan: 'PLAN-ONLY',
	bypassPermissions: 'BYPASS',
};

export const PERMISSION_MODE_COLORS: Record<PermissionMode, string> = {
	default: 'yellow',
	acceptEdits: 'green',
	plan: 'blue',
	bypassPermissions: 'red',
};
