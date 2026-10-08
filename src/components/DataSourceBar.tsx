import type { DataSourceInfo } from '../lib/dataSource';
import { useT } from '../i18n';

type Props = {
  source: DataSourceInfo;
  switching?: boolean;
};

export function DataSourceBar({ source, switching }: Props) {
  const t = useT();

  return (
    <div className="mx-auto max-w-[1600px] px-3 pb-2 sm:px-4">
      <div className="rounded-lg border border-white/5 bg-black/30 px-3 py-2 text-[11px] leading-relaxed text-slate-400">
        <div className="flex flex-col gap-1.5 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-2 sm:gap-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold text-slate-300">{t(source.labelKey)}</span>
            {switching && <span className="text-pulse-cyan">· {t('dataSourceBar.loading')}</span>}
          </div>
          <span className="hidden text-slate-600 sm:inline">|</span>
          <span className="truncate font-mono text-slate-500" title={source.endpoint}>
            {source.endpoint}
          </span>
          <span className="hidden text-slate-600 sm:inline">|</span>
          <span className="text-slate-400">{t(source.formulaKey)}</span>
        </div>
      </div>
    </div>
  );
}
