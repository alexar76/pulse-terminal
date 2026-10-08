import { useMemo, useState } from 'react';
import { Header } from './components/Header';
import { TickerStrip } from './components/TickerStrip';
import { ListingsTable } from './components/ListingsTable';
import { DetailRail } from './components/DetailRail';
import { MobileDetailSheet } from './components/MobileDetailSheet';
import { StatusBar } from './components/StatusBar';
import { DataSourceBar } from './components/DataSourceBar';
import { Panel } from './lib/ui';
import { usePricingStream } from './hooks/usePricingStream';
import { useT } from './i18n';
import { loadContour, saveContour, type EcosystemContour } from './lib/contour';
import { dataSourceFor } from './lib/dataSource';
import type { Chain } from './lib/types';

export default function App() {
  const t = useT();
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

  const mobileListing = useMemo(
    () => (selectedId ? listings.find((l) => l.listing_id === selectedId) ?? null : null),
    [listings, selectedId],
  );

  const selectedIndex = useMemo(
    () => indices.find((i) => i.listing_id === selectedListing?.listing_id) ?? null,
    [indices, selectedListing],
  );

  const mobileIndex = useMemo(
    () => indices.find((i) => i.listing_id === mobileListing?.listing_id) ?? null,
    [indices, mobileListing],
  );

  const refreshMs = snapshot?.pulse_terminal.refresh_ms ?? 5000;
  const scenarioPhase =
    contour === 'uni'
      ? String((snapshot?.liquidity as { scenario_phase?: string } | undefined)?.scenario_phase ?? 'UNIVERSE')
      : null;

  const panelTitle = contour === 'uni' ? t('panel.universeListings') : t('panel.agentListings');
  const panelSubtitle =
    contour === 'uni' ? t('panel.universeListingsSub') : t('panel.agentListingsSub');

  return (
    <div
      className="terminal-grid min-h-screen pb-[calc(3.5rem+env(safe-area-inset-bottom,0px))]"
    >
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
        <div className="mx-auto max-w-[1600px] px-3 pt-4 sm:px-4">
          <div className="rounded-lg border border-pulse-rose/30 bg-pulse-rose/10 px-3 py-2 text-sm text-pulse-rose sm:px-4">
            {error} —{' '}
            {contour === 'uni' ? t('error.uniHint') : t('error.liveHint')}
          </div>
        </div>
      )}

      <main className="mx-auto grid max-w-[1600px] gap-4 px-3 py-4 sm:px-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Panel title={panelTitle} subtitle={panelSubtitle}>
            <ListingsTable
              listings={listings}
              historyFor={historyForListing}
              contour={contour}
              selectedId={selectedId ?? selectedListing?.listing_id ?? null}
              onSelect={setSelectedId}
            />
          </Panel>
        </div>
        <div className="hidden lg:block">
          <DetailRail
            listing={selectedListing}
            index={selectedIndex}
            history={historyForListing(selectedListing?.listing_id ?? '')}
            contour={contour}
            capsense={snapshot?.capsense ?? null}
            liquidity={snapshot?.liquidity ?? null}
          />
        </div>
      </main>

      <MobileDetailSheet
        open={!!mobileListing}
        title={mobileListing?.product_id ?? t('panel.listingFallback')}
        onClose={() => setSelectedId(null)}
      >
        {mobileListing && (
          <DetailRail
            listing={mobileListing}
            index={mobileIndex}
            history={historyForListing(mobileListing.listing_id)}
            contour={contour}
            capsense={snapshot?.capsense ?? null}
            liquidity={snapshot?.liquidity ?? null}
          />
        )}
      </MobileDetailSheet>

      <StatusBar snapshot={snapshot} latencyMs={latencyMs} listingCount={listings.length} />
    </div>
  );
}
