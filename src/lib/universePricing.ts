import {
  change24hPct,
  indexLevel,
  impliedVolatility,
  sharePriceUsd,
} from './acexPricing';
import { monitorStateUrl } from './pulseUrl';
import type { CapIndex, Listing, PricingSnapshot, PricingSource } from './types';

/**
 * UNI/universe pricing is derived entirely from Alien Monitor graph heuristics:
 * there is no real IPO/market overlay feeding these NAV/price/24h-change figures.
 * Every object produced by this module is therefore flagged `synthetic` so the
 * terminal never presents heuristic numbers as observed market data. Switch to
 * `'ipo_overlay'` here (and at the relevant call sites) once a real overlay is wired in.
 */
const UNIVERSE_PRICING_SOURCE: PricingSource = 'synthetic';

export type MonitorChild = {
  id: string;
  label?: string;
};

export type MonitorNode = {
  id: string;
  label?: string;
  group?: string;
  metrics?: Record<string, number>;
  status?: string;
  children?: MonitorChild[];
};

type MonitorState = {
  ts?: string;
  nodes?: MonitorNode[];
  summary?: Record<string, unknown>;
  scenario?: { phase?: string; label?: string };
};

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
    pricing_source: UNIVERSE_PRICING_SOURCE,
  };
}

function listingToIndex(listing: Listing): CapIndex {
  return {
    index_id: `uni-revenue:${listing.listing_id}`,
    listing_id: listing.listing_id,
    level: listing.index_level,
    change_24h_pct: change24hPct(listing.avg_trust_score),
    pricing_source: listing.pricing_source,
    components: [
      {
        capability_id: `${listing.listing_id}@uni`,
        weight: 1,
        price_per_call_usd: listing.avg_price_per_call_usd,
      },
    ],
  };
}

const UNI_INFRA_GROUPS = new Set(['core', 'contract', 'client', 'sdk', 'chain']);

/** Expand cluster children into product rows; keep infra nodes as-is. */
export function expandUniverseNodes(nodes: MonitorNode[]): MonitorNode[] {
  const out: MonitorNode[] = [];
  for (const node of nodes) {
    if (node.group === 'cluster' && node.children?.length) {
      const clusterCount = Math.max(
        metricNumber(node, 'count', 'products'),
        node.children.length,
        1,
      );
      for (const child of node.children) {
        out.push({
          id: child.id,
          label: child.label ?? child.id,
          group: 'product',
          status: node.status ?? 'active',
          metrics: {
            capabilities: 1,
            products: 1,
            invocations_24h: Math.max(1, Math.floor(clusterCount / node.children.length)),
          },
        });
      }
      continue;
    }
    if (UNI_INFRA_GROUPS.has(node.group ?? '')) {
      out.push(node);
    }
  }
  return out;
}

export async function fetchUniversePricing(): Promise<PricingSnapshot> {
  const r = await fetch(monitorStateUrl(), { cache: 'no-store' });
  if (!r.ok) throw new Error(`monitor state ${r.status}`);
  const state = (await r.json()) as MonitorState;
  const nodes = expandUniverseNodes(state.nodes ?? []);
  const listings = nodes.slice(0, 50).map(monitorNodeToListing);
  const indices = listings.map(listingToIndex);
  const phase = state.scenario?.phase ?? 'UNI';
  const summary = state.summary ?? {};

  return {
    protocol: 'acex',
    protocol_version: '0.2.0',
    generated_at: state.ts ?? new Date().toISOString(),
    chain: 'any',
    pricing_source: UNIVERSE_PRICING_SOURCE,
    listing_filter: null,
    listings,
    indices,
    liquidity: {
      mesh: summary,
      contour: 'uni',
      scenario_phase: phase,
      monitor_endpoint: monitorStateUrl(),
    },
    capsense: {
      enabled: true,
      chains: ['evm', 'solana'],
      series_template: { phase },
      open_series_count: listings.length,
    },
    pulse_terminal: {
      refresh_ms: 5000,
      pricing_endpoint: monitorStateUrl(),
      hub_endpoint: '/api/v2/capital/pricing',
    },
  };
}
