import type { ConnectionMode } from '../lib/types';
import type { EcosystemContour } from '../lib/contour';
import { LOCALES, useLocale } from '../i18n';
import { cls } from '../lib/ui';

const CHAINS = ['any', 'evm', 'solana'] as const;
const CONTOURS: { id: EcosystemContour; labelKey: string }[] = [
  { id: 'live', labelKey: 'contour.live' },
  { id: 'uni', labelKey: 'contour.uni' },
];

type Props = {
  chain: (typeof CHAINS)[number];
  onChain: (c: (typeof CHAINS)[number]) => void;
  contour: EcosystemContour;
  onContour: (c: EcosystemContour) => void;
  scenarioPhase?: string | null;
  mode: ConnectionMode;
  generatedAt: string | null;
  refreshMs: number;
};

export function Header({
  chain,
  onChain,
  contour,
  onContour,
  scenarioPhase,
  mode,
  generatedAt,
  refreshMs,
}: Props) {
  const { locale, setLocale, t } = useLocale();

  const liveBadge =
    contour === 'uni'
      ? t('contour.uniBadge', { phase: scenarioPhase ?? 'UNIVERSE' })
      : t('contour.liveBadge', { mode: mode.toUpperCase() });

  return (
    <header className="sticky top-0 z-50 border-b border-pulse-border bg-pulse-bg/90 backdrop-blur-xl">
      <div className="mx-auto max-w-[1600px] px-3 py-3 sm:px-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-pulse-gold/30 bg-gradient-to-br from-pulse-gold/20 to-transparent shadow-gold sm:h-10 sm:w-10">
              <span className="font-display text-base font-bold text-pulse-gold sm:text-lg">P</span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[9px] font-semibold uppercase tracking-[0.28em] text-pulse-cyan/80 sm:text-[10px] sm:tracking-[0.35em]">
                {t('app.brand')}
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="font-display text-lg font-bold tracking-tight text-white sm:text-xl md:text-2xl">
                  {t('app.title')}
                </h1>
                <div
                  className={cls(
                    'inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] sm:gap-2 sm:px-3 sm:py-1 sm:text-xs',
                    contour === 'uni'
                      ? 'border-violet-400/30 bg-violet-500/10 text-violet-200'
                      : 'border-emerald-500/25 bg-emerald-500/10 text-emerald-300',
                  )}
                >
                  <span className="live-dot h-1.5 w-1.5 rounded-full bg-current sm:h-2 sm:w-2" />
                  <span className="truncate">{liveBadge}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex rounded-lg border border-white/10 bg-black/40 p-0.5">
                {CONTOURS.map(({ id, labelKey }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => onContour(id)}
                    className={cls(
                      'rounded-md px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-wide transition sm:px-3 sm:text-xs',
                      contour === id
                        ? id === 'uni'
                          ? 'bg-gradient-to-r from-violet-500/90 to-fuchsia-600/90 text-white shadow'
                          : 'bg-gradient-to-r from-emerald-500/90 to-pulse-cyan/90 text-white shadow'
                        : 'text-slate-400 hover:text-white',
                    )}
                  >
                    {t(labelKey)}
                  </button>
                ))}
              </div>

              <label className="flex items-center gap-1.5">
                <span className="sr-only">{t('locale.label')}</span>
                <div className="flex rounded-lg border border-white/10 bg-black/40 p-0.5">
                  {LOCALES.map((code) => (
                    <button
                      key={code}
                      type="button"
                      onClick={() => setLocale(code)}
                      className={cls(
                        'rounded-md px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wide transition sm:px-2.5 sm:text-xs',
                        locale === code
                          ? 'bg-white/10 text-white'
                          : 'text-slate-400 hover:text-white',
                      )}
                    >
                      {code}
                    </button>
                  ))}
                </div>
              </label>

              <label className="flex items-center gap-1.5 md:hidden">
                <span className="text-[10px] uppercase text-slate-500">{t('header.chain')}</span>
                <select
                  value={chain}
                  disabled={contour === 'uni'}
                  onChange={(e) => onChain(e.target.value as (typeof CHAINS)[number])}
                  className="rounded-lg border border-white/10 bg-black/40 px-2 py-1.5 text-[10px] font-semibold uppercase text-white disabled:opacity-40"
                >
                  {CHAINS.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </label>

              <div
                className={cls(
                  'hidden rounded-lg border border-white/10 bg-black/40 p-0.5 md:flex',
                  contour === 'uni' && 'opacity-40',
                )}
                title={contour === 'uni' ? t('header.chainFilterUniOnly') : undefined}
              >
                {CHAINS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    disabled={contour === 'uni'}
                    onClick={() => onChain(c)}
                    className={cls(
                      'rounded-md px-3 py-1.5 text-xs font-semibold uppercase tracking-wide transition',
                      contour === 'uni' && 'cursor-not-allowed',
                      chain === c && contour !== 'uni'
                        ? 'bg-gradient-to-r from-pulse-cyan/90 to-violet-600/90 text-white shadow'
                        : 'text-slate-400 hover:text-white',
                    )}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between gap-2 text-[10px] font-mono text-slate-500 sm:justify-end sm:text-right">
              <span>{t('header.refresh', { ms: refreshMs })}</span>
              {generatedAt && (
                <span className="truncate text-slate-400 sm:max-w-[200px]">
                  {generatedAt.replace('T', ' ').replace('Z', ' UTC')}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
