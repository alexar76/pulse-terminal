import type { DataSourceInfo } from '../lib/dataSource';

type Props = {
  source: DataSourceInfo;
  switching?: boolean;
};

export function DataSourceBar({ source, switching }: Props) {
  return (
    <div className="mx-auto max-w-[1600px] px-4 pb-2">
      <div className="rounded-lg border border-white/5 bg-black/30 px-3 py-2 text-[11px] leading-relaxed text-slate-400">
        <span className="font-semibold text-slate-300">{source.label}</span>
        {switching && <span className="ml-2 text-pulse-cyan">· loading…</span>}
        <span className="mx-2 text-slate-600">|</span>
        <span className="font-mono text-slate-500">{source.endpoint}</span>
        <span className="mx-2 text-slate-600">|</span>
        <span>{source.formula}</span>
      </div>
    </div>
  );
}
