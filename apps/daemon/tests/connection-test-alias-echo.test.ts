import { describe, expect, it } from 'vitest';

import { inspectAliasRoutedOpenAiCompletion } from '../src/connection-test-alias-echo.js';

const validCompletion = (model: string) => ({
  model,
  choices: [{ message: { role: 'assistant', content: 'ok' }, finish_reason: 'stop' }],
});

describe('inspectAliasRoutedOpenAiCompletion', () => {
  it('reports a mismatched echo on a valid completion as detail', () => {
    expect(
      inspectAliasRoutedOpenAiCompletion(
        'openai',
        validCompletion('deepseek-flash'),
        'ds/deepseek-flash',
        true,
      ),
    ).toEqual({
      valid: true,
      sample: 'valid completion (stop)',
      detail: 'Served by "deepseek-flash" (requested "ds/deepseek-flash").',
    });
  });

  it('returns null when the echoed model matches the request', () => {
    expect(
      inspectAliasRoutedOpenAiCompletion('openai', validCompletion('m'), 'm', true),
    ).toBeNull();
  });

  it('returns null when the response model is not enforced (non-loopback)', () => {
    expect(
      inspectAliasRoutedOpenAiCompletion('openai', validCompletion('b'), 'a', false),
    ).toBeNull();
  });

  it('returns null when choices are empty so the strict check still fails it', () => {
    expect(
      inspectAliasRoutedOpenAiCompletion('openai', { model: 'b', choices: [] }, 'a', true),
    ).toBeNull();
  });

  it('returns null for senseaudio', () => {
    expect(
      inspectAliasRoutedOpenAiCompletion('senseaudio', validCompletion('b'), 'a', true),
    ).toBeNull();
  });
});
