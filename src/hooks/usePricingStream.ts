import { useCallback, useEffect, useRef, useState } from 'react';
import { fetchPricing, pricingSseUrl, pricingWsUrl } from '../lib/api';
import type { EcosystemContour } from '../lib/contour';
import { fetchUniversePricing } from '../lib/universePricing';
import type { Chain, ConnectionMode, PricingSnapshot } from '../lib/types';

type HistoryMap = Record<string, number[]>;

const MAX_HISTORY = 48;

function historyKey(contour: EcosystemContour, chain: Chain, listingId: string): string {
  return `${contour}:${chain}:${listingId}`;
}

function pushHistory(
  prev: HistoryMap,
  snap: PricingSnapshot,
  contour: EcosystemContour,
  chain: Chain,
): HistoryMap {
  const next = { ...prev };
  for (const idx of snap.indices) {
    const key = historyKey(contour, chain, idx.listing_id);
    const arr = [...(next[key] ?? []), idx.level];
    next[key] = arr.slice(-MAX_HISTORY);
  }
  return next;
}

export function usePricingStream(chain: Chain, contour: EcosystemContour) {
  const [snapshot, setSnapshot] = useState<PricingSnapshot | null>(null);
  const [history, setHistory] = useState<HistoryMap>({});
  const [mode, setMode] = useState<ConnectionMode>('offline');
  const [error, setError] = useState<string | null>(null);
  const [latencyMs, setLatencyMs] = useState(0);
  const [switching, setSwitching] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const esRef = useRef<EventSource | null>(null);
  const pollRef = useRef<number | null>(null);
  const generationRef = useRef(0);

  const applySnap = useCallback(
    (snap: PricingSnapshot, ms: number, gen: number) => {
      if (gen !== generationRef.current) return;
      setSnapshot(snap);
      setHistory((h) => pushHistory(h, snap, contour, chain));
      setLatencyMs(ms);
      setError(null);
      setSwitching(false);
    },
    [chain, contour],
  );

  useEffect(() => {
    generationRef.current += 1;
    const gen = generationRef.current;
    setSwitching(true);
    setSnapshot(null);
    setHistory({});
    setError(null);
    setMode('offline');

    let cancelled = false;

    const cleanup = () => {
      wsRef.current?.close();
      wsRef.current = null;
      esRef.current?.close();
      esRef.current = null;
      if (pollRef.current) window.clearInterval(pollRef.current);
      pollRef.current = null;
    };

    const startPolling = (refreshMs: number) => {
      if (cancelled) return;
      setMode('polling');
      const tick = async () => {
        const t0 = performance.now();
        try {
          const snap = await fetchPricing(chain);
          if (!cancelled) applySnap(snap, Math.round(performance.now() - t0), gen);
        } catch (e) {
          if (!cancelled && gen === generationRef.current) {
            setError(e instanceof Error ? e.message : 'poll failed');
            setSwitching(false);
          }
        }
      };
      void tick();
      pollRef.current = window.setInterval(tick, Math.max(refreshMs, 2000));
    };

    const startSse = () => {
      if (cancelled) return;
      setMode('sse');
      const es = new EventSource(pricingSseUrl(chain));
      esRef.current = es;
      es.onmessage = (ev) => {
        const t0 = performance.now();
        try {
          const snap = JSON.parse(ev.data) as PricingSnapshot;
          applySnap(snap, Math.round(performance.now() - t0), gen);
        } catch {
          if (gen === generationRef.current) setError('invalid SSE payload');
        }
      };
      es.onerror = () => {
        es.close();
        esRef.current = null;
        if (!cancelled) startPolling(5000);
      };
    };

    const startWs = () => {
      if (cancelled) return;
      setMode('websocket');
      const ws = new WebSocket(pricingWsUrl(chain));
      wsRef.current = ws;
      ws.onmessage = (ev) => {
        const t0 = performance.now();
        try {
          const snap = JSON.parse(ev.data) as PricingSnapshot;
          applySnap(snap, Math.round(performance.now() - t0), gen);
        } catch {
          if (gen === generationRef.current) setError('invalid WebSocket payload');
        }
      };
      ws.onerror = () => {
        ws.close();
        wsRef.current = null;
        if (!cancelled) startSse();
      };
      ws.onclose = () => {
        if (!cancelled && !wsRef.current) startSse();
      };
    };

    const startUniPolling = (refreshMs: number) => {
      if (cancelled) return;
      setMode('polling');
      const tick = async () => {
        const t0 = performance.now();
        try {
          const snap = await fetchUniversePricing();
          if (!cancelled) applySnap(snap, Math.round(performance.now() - t0), gen);
        } catch (e) {
          if (!cancelled && gen === generationRef.current) {
            setError(e instanceof Error ? e.message : 'UNI poll failed');
            setSwitching(false);
          }
        }
      };
      void tick();
      pollRef.current = window.setInterval(tick, Math.max(refreshMs, 3000));
    };

    cleanup();

    if (contour === 'uni') {
      startUniPolling(5000);
    } else {
      startWs();
    }

    return () => {
      cancelled = true;
      cleanup();
    };
  }, [chain, contour, applySnap]);

  const historyForListing = useCallback(
    (listingId: string) => history[historyKey(contour, chain, listingId)] ?? [],
    [history, contour, chain],
  );

  return { snapshot, history, historyForListing, mode, error, latencyMs, switching };
}
