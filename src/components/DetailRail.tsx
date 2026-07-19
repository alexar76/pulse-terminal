import type { EcosystemContour } from '../lib/contour';
import type { CapIndex, Listing, ProofOfAudit, PricingSnapshot } from '../lib/types';
import { useT } from '../i18n';
import { Gauge, Panel, Sparkline, cls, fmtNum, fmtUsd } from '../lib/ui';

type Props = {
  listing: Listing | null;
  index: CapIndex | null;
  history: number[];
  contour: EcosystemContour;
  capsense: PricingSnapshot['capsense'] | null;
  liquidity: PricingSnapshot['liquidity'] | null;
};

export function DetailRail({ listing, index, history, contour, capsense, liquidity }: Props) {
  const t = useT();

  if (!listing) {
    return (
      <Panel title={t('panel.agentListing')} subtitle={t('panel.selectRow')}>
        <p className="text-sm text-slate-500">{t('panel.selectHint')}</p>
      </Panel>
    );
  }

  const expiryDays = Array.isArray(capsense?.series_template.expiry_days)
    ? (capsense.series_template.expiry_days as number[]).join(' / ')
    : '7 / 30 / 90';

  return (
    <div className="space-y-4">
      <Panel
        title={listing.product_id}
        subtitle={contour === 'uni' ? t('detail.uniSubtitle') : t('detail.liveSubtitle')}
      >
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-slate-500">{t('detail.capShareNav')}</p>
            <p className="font-display text-2xl font-bold text-white sm:text-3xl">
              {fmtUsd(listing.share_price_usd, 3)}
            </p>
          </div>
          <Sparkline data={history} width={140} height={44} stroke="#d4af37" className="max-w-full" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Metric label={t('detail.indexLevel')} value={fmtNum(listing.index_level, 2)} />
          <Metric label={t('detail.iv')} value={`${Math.round(listing.implied_volatility * 100)}%`} />
          <Metric label={t('detail.pricePerCall')} value={fmtUsd(listing.avg_price_per_call_usd, 4)} />
          <Metric
            label={t('detail.success30d')}
            value={`${Math.round(listing.avg_success_rate_30d * 100)}%`}
          />
        </div>
        <div className="mt-4 space-y-3">
          <Gauge value={listing.avg_trust_score} label={t('detail.trustScore')} />
          <Gauge value={listing.avg_success_rate_30d} label={t('detail.reliability')} />
        </div>
      </Panel>

      {listing.proof_of_audit && <ProofOfAuditPanel audit={listing.proof_of_audit} />}

      {index && (
        <Panel title={t('detail.indexComponents')} subtitle={index.index_id}>
          <ul className="space-y-2">
            {index.components.map((c) => (
              <li
                key={c.capability_id}
                className="flex flex-col gap-1 rounded-lg border border-white/5 bg-black/30 px-3 py-2 text-xs sm:flex-row sm:items-center sm:justify-between"
              >
                <span className="truncate font-mono text-pulse-cyan">{c.capability_id}</span>
                <div className="flex items-center justify-between gap-3 sm:justify-end">
                  <span className="text-slate-400">{(c.weight * 100).toFixed(0)}%</span>
                  <span className="font-mono text-white">{fmtUsd(Number(c.price_per_call_usd), 3)}</span>
                </div>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-right font-mono text-xs text-slate-500">
            {t('detail.change24h', {
              value: `${index.change_24h_pct >= 0 ? '+' : ''}${index.change_24h_pct.toFixed(2)}%`,
            })}
          </p>
        </Panel>
      )}

      {capsense?.enabled && (
        <Panel title={t('detail.capsenseTitle')} subtitle={t('detail.capsenseSub')}>
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-400">{t('detail.openSeries')}</span>
            <span className="font-mono text-pulse-gold">{capsense.open_series_count}</span>
          </div>
          <p className="mt-2 text-xs text-slate-500">
            {t('detail.capsenseHint', { days: expiryDays })}
          </p>
        </Panel>
      )}

      {liquidity && (
        <Panel title={t('detail.liquidityTitle')} subtitle={t('detail.liquiditySub')}>
          <pre className="overflow-x-auto rounded-lg bg-black/40 p-3 font-mono text-[10px] text-slate-400">
            {JSON.stringify(liquidity, null, 2)}
          </pre>
        </Panel>
      )}
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-wider text-slate-500">{label}</p>
      <p className="font-mono text-sm text-white">{value}</p>
    </div>
  );
}

function ProofOfAuditPanel({ audit }: { audit: ProofOfAudit }) {
  const t = useT();
  const scorePct = Math.round(audit.aggregate_score_bps / 100);

  return (
    <Panel title={t('detail.poaTitle')} subtitle={t('detail.poaSub')}>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <DefaultRiskBadge risk={audit.default_risk} />
        {audit.enabled ? (
          <span className="rounded border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-300">
            {t('detail.insured')}
          </span>
        ) : (
          <span className="rounded border border-slate-500/30 bg-white/5 px-2 py-0.5 text-[10px] uppercase tracking-wide text-slate-400">
            {t('detail.noCover')}
          </span>
        )}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Metric label={t('detail.aggregateScore')} value={`${scorePct}%`} />
        <Metric label={t('detail.totalCover')} value={fmtUsd(audit.total_cover_usd, 0)} />
        <Metric label={t('detail.auditors')} value={String(audit.auditor_count)} />
        <Metric label={t('detail.auditFee')} value={`${(audit.audit_fee_bps / 100).toFixed(2)}%`} />
        <Metric label={t('detail.accruedRewards')} value={fmtUsd(audit.accrued_audit_rewards_usd, 4)} />
        <Metric
          label={t('detail.noteSpread')}
          value={
            audit.suggested_note_spread_bps != null
              ? `${(audit.suggested_note_spread_bps / 100).toFixed(1)}% APR`
              : '—'
          }
        />
      </div>
      {audit.default.baseline_price_usd != null && (
        <p className="mt-3 text-xs text-slate-500">
          {t('detail.baseline', { value: fmtUsd(audit.default.baseline_price_usd, 3) })}
          {audit.default.twap_price_usd != null && (
            <> · {t('detail.twap', { value: fmtUsd(audit.default.twap_price_usd, 3) })}</>
          )}
          {audit.default.drawdown_bps != null && (
            <>
              {' '}
              ·{' '}
              {t('detail.drawdown', {
                pct: (audit.default.drawdown_bps / 100).toFixed(0),
              })}
            </>
          )}
        </p>
      )}
      {audit.coverages.length > 0 && (
        <ul className="mt-4 space-y-2">
          {audit.coverages.map((c) => (
            <li
              key={c.auditor}
              className="rounded-lg border border-white/5 bg-black/30 px-3 py-2 text-xs"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="truncate font-mono text-pulse-cyan">{c.auditor}</span>
                <PhaseBadge phase={c.phase} />
              </div>
              <div className="mt-1 flex flex-wrap gap-3 text-slate-400">
                <span>{t('detail.coverLine', { value: fmtUsd(c.cover_usd, 0) })}</span>
                <span>{t('detail.scoreLine', { pct: (c.score_bps / 100).toFixed(0) })}</span>
                <span>{t('detail.pendingLine', { value: fmtUsd(c.pending_rewards_usd, 4) })}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}

function DefaultRiskBadge({ risk }: { risk: ProofOfAudit['default_risk'] }) {
  const t = useT();
  const styles: Record<ProofOfAudit['default_risk'], string> = {
    none: 'border-emerald-500/30 text-emerald-300 bg-emerald-500/10',
    watch: 'border-amber-500/30 text-amber-300 bg-amber-500/10',
    elevated: 'border-orange-500/30 text-orange-300 bg-orange-500/10',
    defaulted: 'border-red-500/30 text-red-300 bg-red-500/10',
  };
  return (
    <span
      className={cls(
        'rounded border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
        styles[risk],
      )}
    >
      {t(`defaultRisk.${risk}`)}
    </span>
  );
}

function PhaseBadge({ phase }: { phase: string }) {
  const slashed = phase === 'slashed';
  return (
    <span
      className={cls(
        'rounded px-1.5 py-0.5 text-[10px] uppercase',
        slashed ? 'bg-red-500/15 text-red-300' : 'bg-white/5 text-slate-400',
      )}
    >
      {phase}
    </span>
  );
}
