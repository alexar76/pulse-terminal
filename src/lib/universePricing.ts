import {
  change24hPct,
  indexLevel,
  impliedVolatility,
  sharePriceUsd,
} from './acexPricing';
import type { CapIndex, Listing, PricingSnapshot } from './types';

export type MonitorNode = {
  id: string;
  label?: string;
  group?: string;
  metrics?: Record<string, number>;
  status?: string;
};

type MonitorState = {
  ts?: string;
  nodes?: MonitorNode[];
  summary?: Record<string, unknown>;
  scenario?: { phase?: string; label?: string };
};

const MONITOR_API = import.meta.env.VITE_PULSE_MONITOR_API ?? 'api/monitor';

export function metricNumber(node: MonitorNode, ...keys: string[]): number {
  const m = node.metrics ?? {};
  for (const key of keys) {
    const val = m[key];
    if (typeof val === 'number' && Number.isFinite(val)) return val;
  }
  return 0;
}

/**
 * Map Alien Monitor graph metrics to ACEX pricing inputs (UNI contour).
 * Activity proxies $/call; success from invocation volume; trust from node health.
 */
export function monitorNodeToAcexInputs(node: MonitorNode): {
  pricePerCall: number;
  successRate: number;
  trust: number;
  capabilityCount: number;
} {
  const inv = Math.max(
    metricNumber(node, 'invocations_24h', 'tasks_done', 'products', 'volume_24h'),
    0,
  );
  const caps = Math.max(
    metricNumber(node, 'capabilities', 'products', 'channels_open', 'listings', 'agents'),
    1,
  );
  const trust =
    node.status === 'active' ? 0.88 : node.status === 'error' ? 0.45 : 0.65;
  const success = Math.min(0.99, 0.82 + Math.min(inv, 50) * 0.003);
  const pricePerCall = Math.max(0.05, Math.min(2, inv * 0.04 + caps * 0.02));
  return {
    pricePerCall,
    successRate: success,
    trust,
    capabilityCount: Math.round(caps),
  };
}

export function monitorNodeToListing(node: MonitorNode): Listing {
  const { pricePerCall, successRate, trust, capabilityCount } = monitorNodeToAcexInputs(node);

  return {
    listing_id: node.id,
    product_id: node.id,
    capability_count: capabilityCount,
    share_price_usd: sharePriceUsd(pricePerCall, successRate, trust),
    index_level: indexLevel(pricePerCall, successRate),
    implied_volatility: impliedVolatility(successRate, trust),
    avg_price_per_call_usd: Math.round(pricePerCall * 10000) / 10000,
    avg_success_rate_30d: Math.round(successRate * 10000) / 10000,
    avg_trust_score: trust,
    liquidity_route: 'uni_universe',
  };
}

function listingToIndex(listing: Listing): CapIndex {
  return {
    index_id: `uni-revenue:${listing.listing_id}`,
    listing_id: listing.listing_id,
    level: listing.index_level,
    change_24h_pct: change24hPct(listing.avg_trust_score),
    components: [
      {
        capability_id: `${listing.listing_id}@uni`,
        weight: 1,
        price_per_call_usd: listing.avg_price_per_call_usd,
      },
    ],
  };
}

export async function fetchUniversePricing(): Promise<PricingSnapshot> {
  const r = await fetch(`${MONITOR_API}/state`, { cache: 'no-store' });
  if (!r.ok) throw new Error(`monitor state ${r.status}`);
  const state = (await r.json()) as MonitorState;
  const nodes = (state.nodes ?? []).filter((n) =>
    ['cluster', 'core', 'contract', 'client', 'sdk', 'chain'].includes(n.group ?? ''),
  );
  const listings = nodes.slice(0, 50).map(monitorNodeToListing);
  const indices = listings.map(listingToIndex);
  const phase = state.scenario?.phase ?? 'UNI';
  const summary = state.summary ?? {};

  return {
    protocol: 'acex',
    protocol_version: '0.2.0',
    generated_at: state.ts ?? new Date().toISOString(),
    chain: 'any',
    listing_filter: null,
    listings,
    indices,
    liquidity: {
      mesh: summary,
      contour: 'uni',
      scenario_phase: phase,
      monitor_endpoint: `${MONITOR_API}/state`,
    },
    capsense: {
      enabled: true,
      chains: ['evm', 'solana'],
      series_template: { phase },
      open_series_count: listings.length,
    },
    pulse_terminal: {
      refresh_ms: 5000,
      pricing_endpoint: `${MONITOR_API}/state`,
      hub_endpoint: '/api/v2/capital/pricing',
    },
  };
}
