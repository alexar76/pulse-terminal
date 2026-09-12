/** Resolve paths under the Vite base (production: `/pulse/`). */
export function pulseAssetUrl(path: string): string {
  const base = import.meta.env.BASE_URL || '/';
  const root = base.endsWith('/') ? base : `${base}/`;
  return `${root}${path.replace(/^\//, '')}`;
}

export function monitorApiBase(): string {
  return (import.meta.env.VITE_PULSE_MONITOR_API ?? 'api/monitor').replace(/^\//, '');
}

export function monitorStateUrl(): string {
  return pulseAssetUrl(`${monitorApiBase()}/state`);
}
