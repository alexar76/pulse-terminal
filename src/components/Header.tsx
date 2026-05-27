import type { ConnectionMode } from '../lib/types';
import type { EcosystemContour } from '../lib/contour';
import { cls } from '../lib/ui';

const CHAINS = ['any', 'evm', 'solana'] as const;
const CONTOURS: { id: EcosystemContour; label: string }[] = [
  { id: 'live', label: 'LIVE' },
  { id: 'uni', label: 'UNI' },
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
  const liveBadge =
    contour === 'uni'
      ? `UNI · ${scenarioPhase ?? 'UNIVERSE'}`
      : `LIVE · ${mode.toUpperCase()}`;

  return (
    <header className="sticky top-0 z-50 border-b border-pulse-border bg-pulse-bg/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1600px] flex-wrap items-center justify-between gap-4 px-4 py-3">
        <div className="flex items-center gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-pulse-gold/30 bg-gradient-to-br from-pulse-gold/20 to-transparent shadow-gold">
            <span className="font-display text-lg font-bold text-pulse-gold">P</span>
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-pulse-cyan/80">
              ACEX · Agent Capital Exchange
            </p>
            <h1 className="font-display text-xl font-bold tracking-tight text-white md:text-2xl">
              Pulse Terminal
            </h1>
          </div>
          <div
            className={cls(
              'hidden items-center gap-2 rounded-full border px-3 py-1 text-xs sm:flex',
              contour === 'uni'
                ? 'border-violet-400/30 bg-violet-500/10 text-violet-200'
                : 'border-emerald-500/25 bg-emerald-500/10 text-emerald-300',
            )}
          >
            <span className="live-dot h-2 w-2 rounded-full bg-current" />
            {liveBadge}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex rounded-lg border border-white/10 bg-black/40 p-0.5">
            {CONTOURS.map(({ id, label }) => (
              <button
                key={id}
                type="button"
                onClick={() => onContour(id)}
                className={cls(
                  'rounded-md px-3 py-1.5 text-xs font-semibold uppercase tracking-wide transition',
                  contour === id
                    ? id === 'uni'
                      ? 'bg-gradient-to-r from-violet-500/90 to-fuchsia-600/90 text-white shadow'
                      : 'bg-gradient-to-r from-emerald-500/90 to-pulse-cyan/90 text-white shadow'
                    : 'text-slate-400 hover:text-white',
                )}
              >
                {label}
              </button>
            ))}
          </div>
          <div
            className={cls(
              'flex rounded-lg border border-white/10 bg-black/40 p-0.5',
              contour === 'uni' && 'opacity-40',
            )}
            title={contour === 'uni' ? 'Chain filter applies in LIVE only' : undefined}
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
          <div className="text-right text-[10px] font-mono text-slate-500">
            <div>refresh {refreshMs}ms</div>
            {generatedAt && (
              <div className="text-slate-400">
                {generatedAt.replace('T', ' ').replace('Z', ' UTC')}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
