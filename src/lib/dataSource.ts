import type { EcosystemContour } from './contour';

export type DataSourceInfo = {
  contour: EcosystemContour;
  label: string;
  endpoint: string;
  formula: string;
};

export function dataSourceFor(
  contour: EcosystemContour,
  snapshot: { pulse_terminal?: { pricing_endpoint?: string } } | null,
): DataSourceInfo {
  if (contour === 'uni') {
    return {
      contour: 'uni',
      label: 'UNI · Alien Monitor',
      endpoint: snapshot?.pulse_terminal?.pricing_endpoint ?? 'api/monitor/state',
      formula:
        'Graph metrics → $/call proxy → ACEX v0.2 (NAV = $/call × success × trust × 100; index = $/call × success × 1000)',
    };
  }
  return {
    contour: 'live',
    label: 'LIVE · Factory / Hub',
    endpoint: snapshot?.pulse_terminal?.pricing_endpoint ?? '/api/v2/capital/pricing',
    formula:
      'Product capabilities (hub catalog) → ACEX v0.2 averages per listing; chain filter on capabilities',
  };
}
