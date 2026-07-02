import { useState, useEffect } from 'react';

const TICK_MS = 100;

// Simulates a bus looping forward through `stops` (array of {latitude, longitude, ...}),
// advancing one hop every `stepMs`. Shared by the compact result row (ETA only, no map)
// and the live tracking map, so both reflect the exact same simulated position.
export default function useSimulatedBus(stops, stepMs = 8000) {
  const [stopIdx, setStopIdx] = useState(0);
  const [t, setT] = useState(0);
  const len = stops?.length ?? 0;

  useEffect(() => {
    if (len < 2) return;
    const interval = setInterval(() => {
      setT(prev => {
        if (prev >= 1) { setStopIdx(i => (i + 1) % len); return 0; }
        return Math.min(prev + TICK_MS / stepMs, 1);
      });
    }, TICK_MS);
    return () => clearInterval(interval);
  }, [len, stepMs]);

  if (len < 2) return { stopIdx: 0, t: 0, lat: null, lng: null, cur: null, nxt: null };

  const cur = stops[stopIdx];
  const nxt = stops[(stopIdx + 1) % len];
  const lat = parseFloat(cur.latitude) + t * (parseFloat(nxt.latitude) - parseFloat(cur.latitude));
  const lng = parseFloat(cur.longitude) + t * (parseFloat(nxt.longitude) - parseFloat(cur.longitude));

  return { stopIdx, t, lat, lng, cur, nxt };
}

// Minutes until the bus (currently at stopIdx/t) reaches targetIdx, looping forward.
export function etaMinutes(stopIdx, t, targetIdx, totalStops, minPerStop) {
  if (targetIdx == null || totalStops < 2) return null;
  const hops = targetIdx >= stopIdx ? targetIdx - stopIdx : (totalStops - stopIdx) + targetIdx;
  return Math.max(1, Math.round((hops - t) * minPerStop));
}
