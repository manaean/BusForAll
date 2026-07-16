import { useState, useEffect, useMemo } from 'react';
import { haversine, rideMinutesForDistance, AVG_BUS_SPEED_KMH } from '../utils/tripPlanner';

const TICK_MS = 100;
// Real-time simulation: ms of animation per meter of real hop distance,
// derived from AVG_BUS_SPEED_KMH so the moving icon actually travels at
// 60 km/h — the same speed the ETA/ride-time estimates assume elsewhere.
const MS_PER_METER = 3600 / AVG_BUS_SPEED_KMH;
const MIN_HOP_MS = 400;

// Duration (ms) of each hop around the full stop loop, at real distance / 60 km/h.
function hopDurationsFor(stops) {
  const len = stops?.length ?? 0;
  const durations = [];
  for (let i = 0; i < len; i++) {
    const cur = stops[i];
    const nxt = stops[(i + 1) % len];
    const meters = haversine(
      parseFloat(cur.latitude), parseFloat(cur.longitude),
      parseFloat(nxt.latitude), parseFloat(nxt.longitude)
    );
    durations.push(Math.max(meters * MS_PER_METER, MIN_HOP_MS));
  }
  return durations;
}

// Where the bus is right now, derived purely from the real wall-clock time
// (not from when this component happened to mount) — so every screen that
// tracks the same route agrees on its position, and reopening a search or
// a tracking view doesn't restart the bus back at stop 0.
function positionAt(now, hopDurations) {
  const totalMs = hopDurations.reduce((a, b) => a + b, 0);
  if (totalMs === 0) return { stopIdx: 0, t: 0 };
  let elapsed = now % totalMs;
  let stopIdx = 0;
  while (elapsed >= hopDurations[stopIdx]) {
    elapsed -= hopDurations[stopIdx];
    stopIdx = (stopIdx + 1) % hopDurations.length;
  }
  return { stopIdx, t: elapsed / hopDurations[stopIdx] };
}

// Simulates a bus looping forward through `stops` (array of {latitude, longitude, ...}),
// at a position derived from the real current time and real distance between stops
// (at AVG_BUS_SPEED_KMH). Shared by the compact result row (ETA only, no map), the live
// tracking map, and the trip detail map, so all three reflect the exact same live position.
export default function useSimulatedBus(stops) {
  const len = stops?.length ?? 0;
  const hopDurations = useMemo(() => hopDurationsFor(stops), [stops]);
  const [, forceTick] = useState(0);

  useEffect(() => {
    if (len < 2) return;
    const interval = setInterval(() => forceTick(n => n + 1), TICK_MS);
    return () => clearInterval(interval);
  }, [len]);

  if (len < 2) return { stopIdx: 0, t: 0, lat: null, lng: null, cur: null, nxt: null };

  const { stopIdx, t } = positionAt(Date.now(), hopDurations);
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
