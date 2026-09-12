import { describe, expect, it } from 'vitest';
import { change24hPct, indexLevel, impliedVolatility, sharePriceUsd } from './acexPricing';

/** Python reference: acex/integrations/pricing.py prod example */
describe('acexPricing', () => {
  it('matches LIVE listing math for sample capability averages', () => {
    const price = 0.3;
    const success = 0.97;
    const trust = 0.8;
    expect(sharePriceUsd(price, success, trust)).toBeCloseTo(23.28, 2);
    expect(indexLevel(price, success)).toBeCloseTo(291.0, 1);
    expect(impliedVolatility(success, trust)).toBeCloseTo(0.31, 2);
    expect(change24hPct(trust)).toBe(-0.5);
  });

  it('UNI hub-like monitor inputs produce stable NAV', () => {
    const inv = 6;
    const caps = 1;
    const price = Math.max(0.05, inv * 0.04 + caps * 0.02);
    const success = Math.min(0.99, 0.82 + Math.min(inv, 50) * 0.003);
    const trust = 0.88;
    const share = sharePriceUsd(price, success, trust);
    expect(share).toBeGreaterThan(5);
    expect(share).toBeLessThan(30);
  });
});
