/**
 * ACEX Protocol v0.2 pricing — mirrors acex/integrations/pricing.py
 * so LIVE (factory API) and UNI (monitor-derived) stay comparable.
 */

export function clamp(n: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, n));
}

/** NAV proxy: $/call × reliability × trust × 100 */
export function sharePriceUsd(pricePerCall: number, successRate: number, trust: number): number {
  const base = Math.max(pricePerCall, 0.001);
  const s = clamp(successRate, 0.5, 1);
  const t = clamp(trust, 0.5, 1);
  return Math.round(base * s * t * 100 * 1e6) / 1e6;
}

/** Revenue index level */
export function indexLevel(pricePerCall: number, successRate: number): number {
  const base = Math.max(pricePerCall, 0);
  const s = clamp(successRate, 0, 1);
  return Math.round(base * s * 1000 * 1e4) / 1e4;
}

export function impliedVolatility(successRate: number, trust: number): number {
  const s = clamp(successRate, 0, 1);
  const t = clamp(trust, 0, 1);
  return Math.round(clamp(0.15 + (1 - s) * 2 + (1 - t) * 0.5, 0, 0.85) * 1e4) / 1e4;
}

/** Same heuristic as factory pricing snapshot indices */
export function change24hPct(trust: number): number {
  return Math.round((trust - 0.85) * 10 * 100) / 100;
}
