import type { PricingSnapshot } from '../lib/types';
import { useT } from '../i18n';
import { fmtUsd } from '../lib/ui';

type Props = {
  snapshot: PricingSnapshot | null;
  latencyMs: number;
  listingCount: number;
};

export function StatusBar({ snapshot, latencyMs, listingCount }: Props) {
  const t = useT();
  const vol = snapshot?.listings.reduce((s, l) => s + l.share_price_usd, 0) ?? 0;

  return (
    <footer
      className="fixed bottom-0 left-0 right-0 z-40 border-t border-pulse-border bg-pulse-bg/95 backdrop-blur-md"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="mx-auto flex max-w-[1600px] flex-wrap items-center justify-between gap-x-4 gap-y-1 px-3 py-2 font-mono text-[10px] text-slate-500 sm:px-4">
        <div className="flex flex-wrap gap-x-3 gap-y-0.5 sm:gap-4">
          <span className="hidden sm:inline">
            {t('statusBar.acex', { version: snapshot?.protocol_version ?? '—' })}
          </span>
          <span>{t('statusBar.listings', { count: listingCount })}</span>
          <span>{t('statusBar.latency', { ms: latencyMs })}</span>
        </div>
        <div className="flex flex-wrap gap-x-3 gap-y-0.5 sm:gap-4">
          <span className="hidden sm:inline">{t('statusBar.navSum', { value: fmtUsd(vol, 0) })}</span>
          <span className="text-pulse-gold">{t('statusBar.version')}</span>
        </div>
      </div>
    </footer>
  );
}
