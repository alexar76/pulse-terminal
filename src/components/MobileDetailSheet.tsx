import type { ReactNode } from 'react';
import { useT } from '../i18n';

type Props = {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
};

export function MobileDetailSheet({ open, title, onClose, children }: Props) {
  const t = useT();

  if (!open) return null;

  return (
    <div className="lg:hidden">
      <button
        type="button"
        aria-label={t('mobile.close')}
        className="fixed inset-0 z-[60] bg-black/65 backdrop-blur-[2px]"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="fixed inset-x-0 bottom-0 z-[70] flex max-h-[88vh] flex-col rounded-t-2xl border border-pulse-border bg-pulse-bg shadow-2xl"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-white/5 bg-pulse-bg/95 px-4 py-3 backdrop-blur-md">
          <div className="flex min-w-0 flex-1 flex-col">
            <div className="mx-auto mb-2 h-1 w-10 shrink-0 rounded-full bg-white/20" />
            <p className="truncate font-display text-sm font-semibold text-white">{title}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-lg border border-white/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-slate-300"
          >
            {t('mobile.close')}
          </button>
        </div>
        <div className="overflow-y-auto overscroll-contain px-3 py-3">{children}</div>
      </div>
    </div>
  );
}
