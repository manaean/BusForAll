import { useState, useEffect } from 'react';
import { haversine, rideMinutesForDistance } from '../utils/tripPlanner';

const TICK_MS = 100;
// Simulation pacing, not real time: ms of animation per meter of real hop
// distance. Tuned so a typical ~1km stop spacing takes a few seconds, while
// a 3km hop visibly takes ~3x longer than a 300m one — proportional to the
// real distance rather than a flat time per stop.
const MS_PER_METER = 7;
const MIN_HOP_MS = 400;

// Simulates a bus looping forward through `stops` (array of {latitude, longitude, ...}),
// moving from one stop to the next at a rate proportional to the real distance between
// them. Shared by the compact result row (ETA only, no map), the live tracking map, and
// the trip detail map, so all three reflect the exact same simulated position.
export default function useSimulatedBus(stops) {
  const [state, setState] = useState({ stopIdx: 0, t: 0 });
  const len = stops?.length ?? 0;

  useEffect(() => {
    if (len < 2) return;
    const interval = setInterval(() => {
      setState(({ stopIdx, t }) => {
        const cur = stops[stopIdx];
        const nxt = stops[(stopIdx + 1) % len];
        const hopMeters = haversine(
          parseFloat(cur.latitude), parseFloat(cur.longitude),
          parseFloat(nxt.latitude), parseFloat(nxt.longitude)
        );
        const hopMs = Math.max(hopMeters * MS_PER_METER, MIN_HOP_MS);
        const nextT = t + TICK_MS / hopMs;
        if (nextT >= 1) return { stopIdx: (stopIdx + 1) % len, t: 0 };
        return { stopIdx, t: nextT };
      });
    }, TICK_MS);
    return () => clearInterval(interval);
  }, [stops, len]); // eslint-disable-line react-hooks/exhaustive-deps

  if (len < 2) return { stopIdx: 0, t: 0, lat: null, lng: null, cur: null, nxt: null };

  const { stopIdx, t } = state;
  const cur = stops[stopIdx];
  const nxt = stops[(stopIdx + 1) % len];
  const lat = parseFloat(cur.latitude) + t * (parseFloat(nxt.latitude) - parseFloat(cur.latitude));
  const lng = parseFloat(cur.longitude) + t * (parseFloat(nxt.longitude) - parseFloat(cur.longitude));

  return { stopIdx, t, lat, lng, cur, nxt };
}

// Minutes until the bus (currently at stopIdx/t along `stops`) reaches targetIdx,
// looping forward — computed from the real distance remaining, at the assumed
// average bus speed, so it matches the pathfinder's ride-time estimates.
export function etaMinutes(stops, stopIdx, t, targetIdx) {
  const len = stops?.length ?? 0;
  if (targetIdx == null || len < 2) return null;
  // Bus is at (or just departing) the target stop right now — not "one full lap away".
  if (targetIdx === stopIdx) return 1;

  let idx = stopIdx;
  const cur = stops[idx];
  const nxt = stops[(idx + 1) % len];
  let remainingMeters = haversine(
    parseFloat(cur.latitude), parseFloat(cur.longitude),
    parseFloat(nxt.latitude), parseFloat(nxt.longitude)
  ) * (1 - t);
  idx = (idx + 1) % len;

  while (idx !== targetIdx) {
    const a = stops[idx];
    const b = stops[(idx + 1) % len];
    remainingMeters += haversine(
      parseFloat(a.latitude), parseFloat(a.longitude),
      parseFloat(b.latitude), parseFloat(b.longitude)
    );
    idx = (idx + 1) % len;
  }

  return Math.max(1, Math.round(rideMinutesForDistance(remainingMeters)));
}
