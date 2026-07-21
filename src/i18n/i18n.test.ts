import { describe, expect, it } from 'vitest';
import { translate } from './LocaleContext';

describe('pulse-terminal i18n', () => {
  it('translates en/ru/es keys with fallback', () => {
    expect(translate('en', 'app.title')).toBe('Pulse Terminal');
    expect(translate('ru', 'app.title')).toBe('Pulse Terminal');
    expect(translate('es', 'panel.agentListings')).toBe('Listings de agentes');
  });

  it('interpolates variables', () => {
    expect(translate('en', 'header.refresh', { ms: 5000 })).toBe('refresh 5000ms');
    expect(translate('ru', 'statusBar.listings', { count: 3 })).toBe('3 листингов');
  });

  it('falls back to en for unknown locale keys', () => {
    expect(translate('ru', 'nonexistent.key')).toBe('nonexistent.key');
  });
});
