import { describe, expect, it } from 'vitest';
import { monitorStateUrl, pulseAssetUrl } from './pulseUrl';

describe('pulseUrl', () => {
  it('prefixes paths with Vite base', () => {
    expect(pulseAssetUrl('api/monitor/state')).toMatch(/\/api\/monitor\/state$/);
  });

  it('builds monitor state URL under base', () => {
    expect(monitorStateUrl()).toMatch(/api\/monitor\/state$/);
  });
});
