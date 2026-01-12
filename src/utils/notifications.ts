// Updated: 2026-01-12 03:55:00
// Eames Design Agent - Notifications & Sound Effects
// Desktop notifications and audio feedback

import { exec } from 'child_process';
import { platform } from 'os';

/**
 * Notification options
 */
export interface NotificationOptions {
  title: string;
  message: string;
  subtitle?: string;
  sound?: boolean;
  urgency?: 'low' | 'normal' | 'critical';
}

/**
 * Sound effect types
 */
export type SoundEffect =
  | 'success'
  | 'error'
  | 'warning'
  | 'notification'
  | 'complete'
  | 'start'
  | 'thinking';

/**
 * Notification settings
 */
export interface NotificationSettings {
  enabled: boolean;
  soundEnabled: boolean;
  onTaskComplete: boolean;
  onError: boolean;
  onPermissionRequired: boolean;
}

/**
 * Default settings
 */
export const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  enabled: true,
  soundEnabled: true,
  onTaskComplete: true,
  onError: true,
  onPermissionRequired: true,
};

// Current settings (would be loaded from config)
let settings = { ...DEFAULT_NOTIFICATION_SETTINGS };

/**
 * Update notification settings
 */
export function updateNotificationSettings(newSettings: Partial<NotificationSettings>): void {
  settings = { ...settings, ...newSettings };
}

/**
 * Get current settings
 */
export function getNotificationSettings(): NotificationSettings {
  return { ...settings };
}

/**
 * Send desktop notification
 */
export async function sendNotification(options: NotificationOptions): Promise<boolean> {
  if (!settings.enabled) return false;

  const os = platform();

  try {
    if (os === 'darwin') {
      // macOS
      const script = `display notification "${escapeAppleScript(options.message)}" with title "${escapeAppleScript(options.title)}"${options.subtitle ? ` subtitle "${escapeAppleScript(options.subtitle)}"` : ''}${options.sound !== false ? ' sound name "default"' : ''}`;
      await execAsync(`osascript -e '${script}'`);
      return true;
    } else if (os === 'linux') {
      // Linux (requires notify-send)
      const urgency = options.urgency || 'normal';
      await execAsync(`notify-send -u ${urgency} "${escapeShell(options.title)}" "${escapeShell(options.message)}"`);
      return true;
    } else if (os === 'win32') {
      // Windows (PowerShell)
      const script = `
        [Windows.UI.Notifications.ToastNotificationManager, Windows.UI.Notifications, ContentType = WindowsRuntime] | Out-Null
        $template = [Windows.UI.Notifications.ToastNotificationManager]::GetTemplateContent([Windows.UI.Notifications.ToastTemplateType]::ToastText02)
        $textNodes = $template.GetElementsByTagName("text")
        $textNodes.Item(0).AppendChild($template.CreateTextNode("${options.title}")) | Out-Null
        $textNodes.Item(1).AppendChild($template.CreateTextNode("${options.message}")) | Out-Null
        $toast = [Windows.UI.Notifications.ToastNotification]::new($template)
        [Windows.UI.Notifications.ToastNotificationManager]::CreateToastNotifier("Eames").Show($toast)
      `;
      await execAsync(`powershell -Command "${script.replace(/\n/g, ' ')}"`);
      return true;
    }
  } catch {
    // Notification failed silently
  }

  return false;
}

/**
 * Play sound effect
 */
export async function playSound(effect: SoundEffect): Promise<boolean> {
  if (!settings.soundEnabled) return false;

  const os = platform();

  // Sound file mapping (system sounds)
  const sounds: Record<string, Record<SoundEffect, string>> = {
    darwin: {
      success: 'Glass',
      error: 'Basso',
      warning: 'Sosumi',
      notification: 'Pop',
      complete: 'Hero',
      start: 'Tink',
      thinking: 'Morse',
    },
    linux: {
      success: '/usr/share/sounds/freedesktop/stereo/complete.oga',
      error: '/usr/share/sounds/freedesktop/stereo/dialog-error.oga',
      warning: '/usr/share/sounds/freedesktop/stereo/dialog-warning.oga',
      notification: '/usr/share/sounds/freedesktop/stereo/message.oga',
      complete: '/usr/share/sounds/freedesktop/stereo/complete.oga',
      start: '/usr/share/sounds/freedesktop/stereo/bell.oga',
      thinking: '/usr/share/sounds/freedesktop/stereo/message.oga',
    },
  };

  try {
    if (os === 'darwin') {
      const sound = sounds.darwin[effect];
      await execAsync(`afplay /System/Library/Sounds/${sound}.aiff &`);
      return true;
    } else if (os === 'linux') {
      const sound = sounds.linux[effect];
      await execAsync(`paplay ${sound} &`);
      return true;
    } else if (os === 'win32') {
      // Use system beep on Windows
      const frequency: Record<SoundEffect, number> = {
        success: 800,
        error: 300,
        warning: 500,
        notification: 600,
        complete: 1000,
        start: 700,
        thinking: 400,
      };
      await execAsync(`powershell -Command "[console]::beep(${frequency[effect]}, 200)"`);
      return true;
    }
  } catch {
    // Sound failed silently
  }

  return false;
}

/**
 * Terminal bell
 */
export function terminalBell(): void {
  process.stdout.write('\x07');
}

/**
 * Notify task completion
 */
export async function notifyTaskComplete(taskName: string, success: boolean = true): Promise<void> {
  if (!settings.onTaskComplete) return;

  if (success) {
    await playSound('success');
    await sendNotification({
      title: 'Task Complete',
      message: taskName,
      subtitle: 'Eames',
    });
  } else {
    await playSound('error');
    await sendNotification({
      title: 'Task Failed',
      message: taskName,
      subtitle: 'Eames',
      urgency: 'critical',
    });
  }
}

/**
 * Notify error
 */
export async function notifyError(error: string): Promise<void> {
  if (!settings.onError) return;

  await playSound('error');
  await sendNotification({
    title: 'Error',
    message: error,
    subtitle: 'Eames',
    urgency: 'critical',
  });
}

/**
 * Notify permission required
 */
export async function notifyPermissionRequired(toolName: string): Promise<void> {
  if (!settings.onPermissionRequired) return;

  await playSound('warning');
  await sendNotification({
    title: 'Permission Required',
    message: `${toolName} requires your approval`,
    subtitle: 'Eames',
    urgency: 'normal',
  });
}

// Helper functions

function escapeAppleScript(str: string): string {
  return str.replace(/"/g, '\\"').replace(/'/g, "\\'");
}

function escapeShell(str: string): string {
  return str.replace(/"/g, '\\"').replace(/`/g, '\\`').replace(/\$/g, '\\$');
}

function execAsync(command: string): Promise<string> {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout) => {
      if (error) reject(error);
      else resolve(stdout);
    });
  });
}
