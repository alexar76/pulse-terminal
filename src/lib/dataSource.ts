import type { EcosystemContour } from './contour';
import { monitorStateUrl } from './pulseUrl';

export type DataSourceInfo = {
  contour: EcosystemContour;
  labelKey: string;
  formulaKey: string;
  endpoint: string;
};

export function dataSourceFor(
  contour: EcosystemContour,
  snapshot: { pulse_terminal?: { pricing_endpoint?: string } } | null,
): DataSourceInfo {
  if (contour === 'uni') {
    return {
      contour: 'uni',
      labelKey: 'dataSource.uni.label',
      formulaKey: 'dataSource.uni.formula',
      endpoint: snapshot?.pulse_terminal?.pricing_endpoint ?? monitorStateUrl(),
    };
  }
  return {
    contour: 'live',
    labelKey: 'dataSource.live.label',
    formulaKey: 'dataSource.live.formula',
    endpoint: snapshot?.pulse_terminal?.pricing_endpoint ?? '/api/v2/capital/pricing',
  };
}
