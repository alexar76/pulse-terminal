export type Chain = 'any' | 'evm' | 'solana';

/**
 * Provenance of a price/NAV/24h-change figure.
 * - `ipo_overlay`: backed by a real IPO/market overlay (observed on-chain or off-chain quote).
 * - `synthetic`: derived from monitor-graph heuristics (no real overlay); not market data.
 */
export type PricingSource = 'ipo_overlay' | 'synthetic';

export type ProofOfAuditCoverage = {
  auditor: string;
  cover_usd: number;
  score_bps: number;
  phase: string;
  pending_rewards_usd: number;
  claimed_rewards_usd: number;
};

export type ProofOfAudit = {
  enabled: boolean;
  aggregate_score_bps: number;
  total_cover_usd: number;
  auditor_count: number;
  audit_fee_bps: number;
  accrued_audit_rewards_usd: number;
  suggested_note_spread_bps: number | null;
  default_risk: 'none' | 'watch' | 'elevated' | 'defaulted';
  default: {
    defaulted: boolean;
    baseline_price_usd: number | null;
    twap_price_usd: number | null;
    drawdown_bps: number | null;
  };
  coverages: ProofOfAuditCoverage[];
};

export type Listing = {
  listing_id: string;
  product_id: string;
  capability_count: number;
  share_price_usd: number;
  index_level: number;
  implied_volatility: number;
  avg_price_per_call_usd: number;
  avg_success_rate_30d: number;
  avg_trust_score: number;
  liquidity_route: string;
  /** Provenance of share_price_usd / index_level / NAV figures on this listing. */
  pricing_source: PricingSource;
  proof_of_audit?: ProofOfAudit;
};

export type IndexComponent = {
  capability_id: string;
  weight: number;
  price_per_call_usd: number;
};

export type CapIndex = {
  index_id: string;
  listing_id: string;
  level: number;
  change_24h_pct: number;
  /** Provenance of level / change_24h_pct figures on this index. */
  pricing_source: PricingSource;
  components: IndexComponent[];
};

export type PricingSnapshot = {
  protocol: string;
  protocol_version: string;
  generated_at: string;
  chain: string;
  /**
   * Provenance of the figures in this snapshot. `synthetic` means prices/NAVs
   * were derived from monitor-graph heuristics rather than a real IPO overlay.
   */
  pricing_source: PricingSource;
  listing_filter: string | null;
  listings: Listing[];
  indices: CapIndex[];
  liquidity: Record<string, unknown>;
  capsense: {
    enabled: boolean;
    chains: string[];
    series_template: Record<string, unknown>;
    open_series_count: number;
  };
  proof_of_audit?: {
    protocol_version: string;
    audit_pool_address: string | null;
    listings_with_coverage: number;
    total_cover_usd: number;
  };
  pulse_terminal: {
    refresh_ms: number;
    pricing_endpoint: string;
    hub_endpoint: string;
    audit_detail_fields?: string[];
  };
};

export type ConnectionMode = 'websocket' | 'sse' | 'polling' | 'offline';
