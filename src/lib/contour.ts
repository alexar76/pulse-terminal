export type EcosystemContour = 'live' | 'uni';

const STORAGE_KEY = 'pulse_terminal_contour';

export function defaultContour(): EcosystemContour {
  const raw = (import.meta.env.VITE_PULSE_DEFAULT_CONTOUR ?? 'live').toLowerCase();
  return raw === 'uni' ? 'uni' : 'live';
}

export function loadContour(): EcosystemContour {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'live' || saved === 'uni') return saved;
  } catch {
    /* ignore */
  }
  return defaultContour();
}

export function saveContour(contour: EcosystemContour): void {
  try {
    localStorage.setItem(STORAGE_KEY, contour);
  } catch {
    /* ignore */
  }
}
