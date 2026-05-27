import { useMemo, useState } from 'react';
import { Header } from './components/Header';
import { TickerStrip } from './components/TickerStrip';
import { ListingsTable } from './components/ListingsTable';
import { DetailRail } from './components/DetailRail';
import { StatusBar } from './components/StatusBar';
import { DataSourceBar } from './components/DataSourceBar';
import { Panel } from './lib/ui';
import { usePricingStream } from './hooks/usePricingStream';
import { loadContour, saveContour, type EcosystemContour } from './lib/contour';
import { dataSourceFor } from './lib/dataSource';
import type { Chain } from './lib/types';

export default function App() {
  const [chain, setChain] = useState<Chain>('any');
  const [contour, setContour] = useState<EcosystemContour>(() => loadContour());
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { snapshot, historyForListing, mode, error, latencyMs, switching } =
    usePricingStream(chain, contour);
  const dataSource = dataSourceFor(contour, snapshot);

  const onContour = (next: EcosystemContour) => {
    setContour(next);
    saveContour(next);
    setSelectedId(null);
  };

  const listings = snapshot?.listings ?? [];
  const indices = snapshot?.indices ?? [];

  const selectedListing = useMemo(
    () => listings.find((l) => l.listing_id === selectedId) ?? listings[0] ?? null,
    [listings, selectedId],
  );

  const selectedIndex = useMemo(
    () => indices.find((i) => i.listing_id === selectedListing?.listing_id) ?? null,
    [indices, selectedListing],
  );

  const refreshMs = snapshot?.pulse_terminal.refresh_ms ?? 5000;
  const scenarioPhase =
    contour === 'uni'
      ? String((snapshot?.liquidity as { scenario_phase?: string } | undefined)?.scenario_phase ?? 'UNIVERSE')
      : null;

  return (
    <div className="terminal-grid min-h-screen pb-14">
      <Header
        chain={chain}
        onChain={setChain}
        contour={contour}
        onContour={onContour}
        scenarioPhase={scenarioPhase}
        mode={mode}
        generatedAt={snapshot?.generated_at ?? null}
        refreshMs={refreshMs}
      />
      <TickerStrip indices={indices} contour={contour} />
      <DataSourceBar source={dataSource} switching={switching} />

      {error && (
        <div className="mx-auto max-w-[1600px] px-4 pt-4">
          <div className="rounded-lg border border-pulse-rose/30 bg-pulse-rose/10 px-4 py-2 text-sm text-pulse-rose">
            {error} —{' '}
            {contour === 'uni' ? (
              <>
                ensure Alien Monitor on <code className="font-mono">:9100</code> (UNI mode)
              </>
            ) : (
              <>
                ensure API at <code className="font-mono">/api/v2/capital/pricing</code> (factory :9081)
              </>
            )}
          </div>
        </div>
      )}

      <main className="mx-auto grid max-w-[1600px] gap-4 px-4 py-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Panel
            title={contour === 'uni' ? 'Universe listings' : 'Agent listings'}
            subtitle={contour === 'uni' ? 'UNI contour · Alien Monitor graph' : 'CapShares · live NAV'}
          >
            <ListingsTable
              listings={listings}
              historyFor={historyForListing}
              contour={contour}
              selectedId={selectedListing?.listing_id ?? null}
              onSelect={setSelectedId}
            />
          </Panel>
        </div>
        <DetailRail
          listing={selectedListing}
          index={selectedIndex}
          history={historyForListing(selectedListing?.listing_id ?? '')}
          contour={contour}
          capsense={snapshot?.capsense ?? null}
          liquidity={snapshot?.liquidity ?? null}
        />
      </main>

      <StatusBar snapshot={snapshot} latencyMs={latencyMs} listingCount={listings.length} />
    </div>
  );
}
