import type { EcosystemContour } from '../lib/contour';
import type { Listing } from '../lib/types';
import { useT } from '../i18n';
import { Sparkline, cls, fmtNum, fmtUsd, shortId } from '../lib/ui';

type Props = {
  listings: Listing[];
  historyFor: (listingId: string) => number[];
  contour: EcosystemContour;
  selectedId: string | null;
  onSelect: (id: string) => void;
};

export function ListingsTable({ listings, historyFor, contour, selectedId, onSelect }: Props) {
  const t = useT();

  const empty = (
    <p className="py-8 text-center text-sm text-slate-500">
      {contour === 'uni' ? t('listings.emptyUni') : t('listings.emptyLive')}
    </p>
  );

  if (listings.length === 0) {
    return empty;
  }

  return (
    <>
      <ul className="space-y-2 md:hidden">
        {listings.map((row) => (
          <li key={row.listing_id}>
            <ListingCard
              row={row}
              history={historyFor(row.listing_id)}
              selected={row.listing_id === selectedId}
              onSelect={() => onSelect(row.listing_id)}
            />
          </li>
        ))}
      </ul>

      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="border-b border-white/5 text-[10px] uppercase tracking-wider text-slate-500">
              <th className="pb-2 pr-4 font-medium">{t('listings.colListing')}</th>
              <th className="pb-2 pr-4 font-medium">{t('listings.colCapShare')}</th>
              <th className="hidden pb-2 pr-4 font-medium lg:table-cell">{t('listings.colIndex')}</th>
              <th className="pb-2 pr-4 font-medium">{t('listings.colIv')}</th>
              <th className="pb-2 pr-4 font-medium">{t('listings.colTrust')}</th>
              <th className="hidden pb-2 pr-4 font-medium lg:table-cell">{t('listings.colAudit')}</th>
              <th className="hidden pb-2 pr-4 font-medium xl:table-cell">{t('listings.colRoute')}</th>
              <th className="pb-2 font-medium">{t('listings.colTrend')}</th>
            </tr>
          </thead>
          <tbody>
            {listings.map((row) => {
              const sel = row.listing_id === selectedId;
              return (
                <tr
                  key={row.listing_id}
                  onClick={() => onSelect(row.listing_id)}
                  className={cls(
                    'cursor-pointer border-b border-white/[0.03] transition hover:bg-white/[0.03]',
                    sel && 'bg-pulse-cyan/[0.06]',
                  )}
                >
                  <td className="py-3 pr-4">
                    <div className="font-mono text-xs text-pulse-cyan">{shortId(row.product_id)}</div>
                    <div className="text-[10px] text-slate-500">
                      {t('listings.caps', { count: row.capability_count })}
                    </div>
                  </td>
                  <td className="py-3 pr-4 font-mono text-white">{fmtUsd(row.share_price_usd, 3)}</td>
                  <td className="hidden py-3 pr-4 font-mono text-slate-200 lg:table-cell">
                    {fmtNum(row.index_level, 1)}
                  </td>
                  <td className="py-3 pr-4">
                    <IvBadge iv={row.implied_volatility} />
                  </td>
                  <td className="py-3 pr-4 font-mono text-slate-300">
                    {Math.round(row.avg_trust_score * 100)}%
                  </td>
                  <td className="hidden py-3 pr-4 lg:table-cell">
                    <AuditCell audit={row.proof_of_audit} />
                  </td>
                  <td className="hidden py-3 pr-4 xl:table-cell">
                    <RouteBadge route={row.liquidity_route} />
                  </td>
                  <td className="py-3">
                    <Sparkline data={historyFor(row.listing_id)} width={100} height={28} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}

function ListingCard({
  row,
  history,
  selected,
  onSelect,
}: {
  row: Listing;
  history: number[];
  selected: boolean;
  onSelect: () => void;
}) {
  const t = useT();

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cls(
        'w-full rounded-xl border px-3 py-3 text-left transition active:scale-[0.99]',
        selected
          ? 'border-pulse-cyan/40 bg-pulse-cyan/[0.08] shadow-glow'
          : 'border-white/10 bg-black/30 hover:border-white/20',
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate font-mono text-xs text-pulse-cyan">{shortId(row.product_id)}</p>
          <p className="text-[10px] text-slate-500">
            {t('listings.capabilities', { count: row.capability_count })}
          </p>
        </div>
        <div className="text-right">
          <p className="font-mono text-sm font-semibold text-white">{fmtUsd(row.share_price_usd, 3)}</p>
          <p className="text-[10px] text-slate-500">{t('listings.capShareNav')}</p>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <IvBadge iv={row.implied_volatility} />
        <AuditCell audit={row.proof_of_audit} />
        <RouteBadge route={row.liquidity_route} />
        <span className="rounded bg-white/5 px-1.5 py-0.5 font-mono text-[10px] text-slate-300">
          {t('listings.trust', { pct: Math.round(row.avg_trust_score * 100) })}
        </span>
        <span className="font-mono text-[10px] text-slate-400">
          {t('listings.idx', { value: fmtNum(row.index_level, 1) })}
        </span>
      </div>
      <div className="mt-3 flex items-end justify-between gap-2">
        <Sparkline data={history} width={120} height={32} />
        <span className="text-[10px] font-semibold uppercase tracking-wide text-pulse-cyan/80">
          {t('listings.details')}
        </span>
      </div>
    </button>
  );
}

function IvBadge({ iv }: { iv: number }) {
  const t = useT();
  const pct = Math.round(iv * 100);
  const hot = iv > 0.45;
  return (
    <span
      className={cls(
        'rounded px-1.5 py-0.5 font-mono text-[10px]',
        hot ? 'bg-pulse-amber/15 text-pulse-amber' : 'bg-white/5 text-slate-400',
      )}
    >
      {t('listings.iv', { pct })}
    </span>
  );
}

function RouteBadge({ route }: { route: string }) {
  const jup = route === 'jupiter';
  return (
    <span
      className={cls(
        'rounded border px-1.5 py-0.5 text-[10px] uppercase tracking-wide',
        jup ? 'border-violet-500/30 text-violet-300' : 'border-cyan-500/30 text-cyan-300',
      )}
    >
      {route}
    </span>
  );
}

function AuditCell({ audit }: { audit: Listing['proof_of_audit'] }) {
  const t = useT();

  if (!audit) {
    return <span className="text-[10px] text-slate-600">—</span>;
  }
  const score = Math.round(audit.aggregate_score_bps / 100);
  const hot = audit.default_risk === 'elevated' || audit.default_risk === 'defaulted';
  const watch = audit.default_risk === 'watch';
  return (
    <div className="flex flex-col gap-0.5">
      <span
        className={cls(
          'font-mono text-[10px]',
          audit.enabled ? 'text-emerald-300' : 'text-slate-500',
        )}
      >
        {audit.enabled ? `${score}% · ${fmtUsd(audit.total_cover_usd, 0)}` : t('listings.uncovered')}
      </span>
      {hot ? (
        <span className="text-[10px] uppercase text-red-400">{audit.default_risk}</span>
      ) : watch ? (
        <span className="text-[10px] uppercase text-amber-400">{t('listings.watch')}</span>
      ) : null}
    </div>
  );
}
