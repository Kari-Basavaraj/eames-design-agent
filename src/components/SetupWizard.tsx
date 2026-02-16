// Updated: 2026-02-16 12:00:00
// Eames Design Agent - First-Run Setup Wizard
// Shown when no API key is configured. Guides user through authentication.

import React, { useState } from 'react';
import { Box, Text, useInput } from 'ink';
import { colors } from '../theme.js';
import { saveApiKeyGlobal, checkApiKeyExists } from '../utils/env.js';

type SetupStep = 'welcome' | 'enter_key' | 'done';

interface SetupWizardProps {
  onComplete: () => void;
}

export function SetupWizard({ onComplete }: SetupWizardProps) {
  const [step, setStep] = useState<SetupStep>('welcome');
  const [keyValue, setKeyValue] = useState('');
  const [error, setError] = useState<string | null>(null);

  useInput((input, key) => {
    if (step === 'welcome') {
      if (key.return || input === 'y' || input === 'Y') {
        setStep('enter_key');
      }
      if (key.escape || input === 'q') {
        process.exit(0);
      }
      return;
    }

    if (step === 'enter_key') {
      if (key.return) {
        const trimmed = keyValue.trim();
        if (!trimmed) {
          setError('API key cannot be empty.');
          return;
        }
        if (!trimmed.startsWith('sk-ant-')) {
          setError('Anthropic keys start with sk-ant-. Check your key and try again.');
          return;
        }
        const saved = saveApiKeyGlobal('ANTHROPIC_API_KEY', trimmed);
        if (saved) {
          setStep('done');
          setTimeout(onComplete, 1500);
        } else {
          setError('Failed to save key. Check ~/.eames/ permissions.');
        }
        return;
      }
      if (key.escape) {
        setStep('welcome');
        setKeyValue('');
        setError(null);
        return;
      }
      if (key.backspace || key.delete) {
        setKeyValue(prev => prev.slice(0, -1));
        setError(null);
        return;
      }
      if (input && !key.ctrl && !key.meta) {
        setKeyValue(prev => prev + input);
        setError(null);
      }
      return;
    }
  });

  if (step === 'done') {
    return (
      <Box flexDirection="column" marginTop={1} marginBottom={1}>
        <Text color={colors.success} bold>  API key saved to ~/.eames/config.json</Text>
        <Text color={colors.muted}>  Starting Eames...</Text>
      </Box>
    );
  }

  if (step === 'enter_key') {
    const masked = keyValue.length > 8
      ? keyValue.slice(0, 8) + '*'.repeat(keyValue.length - 8)
      : keyValue.length > 0 ? '*'.repeat(keyValue.length) : '';

    return (
      <Box flexDirection="column" marginTop={1}>
        <Text color={colors.primary} bold>  Enter your Anthropic API key</Text>
        <Text color={colors.muted}>  Get one at: https://console.anthropic.com/settings/keys</Text>
        <Box marginTop={1}>
          <Text color={colors.primary}>  {'❯ '}</Text>
          <Text>{masked}</Text>
          <Text color={colors.muted}>{'█'}</Text>
        </Box>
        {error && (
          <Box marginTop={1}>
            <Text color={colors.error}>  {error}</Text>
          </Box>
        )}
        <Box marginTop={1}>
          <Text color={colors.muted}>  Enter to confirm  ·  Esc to go back</Text>
        </Box>
      </Box>
    );
  }

  // Welcome step
  return (
    <Box flexDirection="column" marginTop={1}>
      <Text color={colors.primary} bold>
{`  ███████╗ █████╗ ███╗   ███╗███████╗███████╗
  ██╔════╝██╔══██╗████╗ ████║██╔════╝██╔════╝
  █████╗  ███████║██╔████╔██║█████╗  ███████╗
  ██╔══╝  ██╔══██║██║╚██╔╝██║██╔══╝  ╚════██║
  ███████╗██║  ██║██║ ╚═╝ ██║███████╗███████║
  ╚══════╝╚═╝  ╚═╝╚═╝     ╚═╝╚══════╝╚══════╝`}
      </Text>

      <Box marginTop={1} flexDirection="column">
        <Text>
          <Text color={colors.primary} bold>  Welcome to Eames</Text>
          <Text color={colors.muted}> — Autonomous Design Agent</Text>
        </Text>
      </Box>

      <Box marginTop={1} flexDirection="column">
        <Text color={colors.muted}>  Eames needs an Anthropic API key to get started.</Text>
        <Text color={colors.muted}>  Your key is saved locally at <Text color={colors.white}>~/.eames/config.json</Text></Text>
        <Text color={colors.muted}>  and never sent anywhere except Anthropic's API.</Text>
      </Box>

      <Box marginTop={1} flexDirection="column">
        <Text color={colors.muted}>  Don't have a key? Get one at:</Text>
        <Text color={colors.primaryBold}>  https://console.anthropic.com/settings/keys</Text>
      </Box>

      <Box marginTop={1}>
        <Text color={colors.primary}>  Press Enter to set up your API key</Text>
        <Text color={colors.muted}>  (q to quit)</Text>
      </Box>
    </Box>
  );
}

/**
 * Returns true if Eames has a usable Anthropic API key.
 * Checks env vars and ~/.eames/config.json.
 */
export function hasAnthropicKey(): boolean {
  return checkApiKeyExists('ANTHROPIC_API_KEY');
}
