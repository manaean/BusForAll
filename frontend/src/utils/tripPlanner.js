// Client-side transit trip planner — mirrors the stages a real system uses,
// scoped to data already available in the app (no external APIs):
//   1. Geocoding      → match typed text against known stop names
//   2. Nearby stops   → Haversine distance from the user's GPS position
//   3. Route matching → does any single route connect a nearby stop to the destination?
//   4. Pathfinding    → if not, search the stop/route graph for a path with transfers
//   5. Ranking        → sort candidate itineraries by total time (walk + ride + transfers)

export const RIDE_MIN_PER_STOP = 3;
export const TRANSFER_PENALTY_MIN = 5;
const WALK_SPEED_M_PER_MIN = 80; // ~4.8 km/h

export function haversine(lat1, lng1, lat2, lng2) {
  const R = 6371000;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function sortedStops(r) {
  return [...(r.Stops || [])]
    .sort((a, b) => (a.RouteStop?.stopOrder ?? 0) - (b.RouteStop?.stopOrder ?? 0))
    .filter(s => s.latitude && s.longitude);
}

// Builds a directed graph: edge = riding one route from one stop to the next stop
// (forward only, matching each route's defined stopOrder).
function buildGraph(routes) {
  const stopsById = new Map();
  const edgesFrom = new Map(); // stopId -> [{ to, routeId, routeName, weight }]

  routes.forEach(r => {
    const stops = sortedStops(r);
    stops.forEach(s => stopsById.set(s.id, s));
    for (let i = 0; i < stops.length - 1; i++) {
      const from = stops[i].id;
      if (!edgesFrom.has(from)) edgesFrom.set(from, []);
      edgesFrom.get(from).push({ to: stops[i + 1].id, routeId: r.id, routeName: r.name, weight: RIDE_MIN_PER_STOP });
    }
  });

  return { stopsById, edgesFrom };
}

// Dijkstra over states (stopId + last-ridden routeId) so route changes can be
// penalized as transfers. Returns the lowest-cost path to any stop in destIds.
function dijkstra({ stopsById, edgesFrom }, startStopId, destIds) {
  const stateKey = (stopId, routeId) => `${stopId}|${routeId ?? '_'}`;
  const dist = new Map();
  const prev = new Map(); // stateKey -> { stateKey, edge }
  const startKey = stateKey(startStopId, null);
  dist.set(startKey, 0);

  const visited = new Set();
  const frontier = [{ key: startKey, stopId: startStopId, routeId: null, cost: 0 }];

  while (frontier.length) {
    frontier.sort((a, b) => a.cost - b.cost);
    const cur = frontier.shift();
    if (visited.has(cur.key)) continue;
    visited.add(cur.key);

    if (destIds.has(cur.stopId)) {
      // Reconstruct path of edges taken
      const edges = [];
      let k = cur.key;
      while (prev.has(k)) {
        const { fromKey, edge } = prev.get(k);
        edges.unshift(edge);
        k = fromKey;
      }
      return { totalCost: cur.cost, edges, destStopId: cur.stopId };
    }

    const outgoing = edgesFrom.get(cur.stopId) || [];
    outgoing.forEach(e => {
      const transfer = cur.routeId !== null && cur.routeId !== e.routeId ? TRANSFER_PENALTY_MIN : 0;
      const newCost = cur.cost + e.weight + transfer;
      const newKey = stateKey(e.to, e.routeId);
      if (!dist.has(newKey) || newCost < dist.get(newKey)) {
        dist.set(newKey, newCost);
        prev.set(newKey, { fromKey: cur.key, edge: { from: cur.stopId, to: e.to, routeId: e.routeId, routeName: e.routeName, weight: e.weight } });
        frontier.push({ key: newKey, stopId: e.to, routeId: e.routeId, cost: newCost });
      }
    });
  }

  return null; // no path found
}

// Collapses a run of same-route edges into a single "leg" (one bus ride,
// boarding once and alighting once, even if it passes through several stops).
function edgesToLegs(edges, stopsById) {
  const legs = [];
  edges.forEach(e => {
    const last = legs[legs.length - 1];
    if (last && last.routeId === e.routeId) {
      last.stops.push(stopsById.get(e.to));
      last.alightStop = stopsById.get(e.to);
    } else {
      legs.push({
        routeId: e.routeId,
        routeName: e.routeName,
        boardStop: stopsById.get(e.from),
        alightStop: stopsById.get(e.to),
        stops: [stopsById.get(e.from), stopsById.get(e.to)],
      });
    }
  });
  return legs;
}

// Top-level entry point: given all routes, the user's location (optional) and
// destination search text, returns up to `maxResults` ranked itineraries.
// Each itinerary: { legs, walkDist, walkMin, rideMin, transferMin, totalMin }
export function planTrips({ routes, userLocation, destinationQuery, maxResults = 3 }) {
  const q = destinationQuery.trim().toLowerCase();
  if (!q) return [];

  const { stopsById, edgesFrom } = buildGraph(routes);
  const destStops = [...stopsById.values()].filter(s => s.name.toLowerCase().includes(q));
  if (destStops.length === 0) return [];
  const destIds = new Set(destStops.map(s => s.id));

  if (!userLocation) return [];

  const nearby = [...stopsById.values()]
    .map(s => ({ stop: s, dist: haversine(userLocation.lat, userLocation.lng, parseFloat(s.latitude), parseFloat(s.longitude)) }))
    .sort((a, b) => a.dist - b.dist)
    .slice(0, 6);

  const itineraries = [];
  nearby.forEach(({ stop, dist }) => {
    if (destIds.has(stop.id)) return; // already at a destination stop, nothing to ride
    const result = dijkstra({ stopsById, edgesFrom }, stop.id, destIds);
    if (!result) return;

    const legs = edgesToLegs(result.edges, stopsById);
    const walkMin = dist / WALK_SPEED_M_PER_MIN;
    const rideMin = legs.reduce((sum, l) => sum + (l.stops.length - 1) * RIDE_MIN_PER_STOP, 0);
    const transferMin = (legs.length - 1) * TRANSFER_PENALTY_MIN;

    itineraries.push({
      legs,
      walkDist: dist,
      walkMin,
      rideMin,
      transferMin,
      totalMin: walkMin + rideMin + transferMin,
    });
  });

  // Dedupe itineraries that resolve to the identical sequence of routes + alight stop
  const seen = new Set();
  const deduped = itineraries.filter(it => {
    const sig = it.legs.map(l => `${l.routeId}:${l.alightStop.id}`).join('>');
    if (seen.has(sig)) return false;
    seen.add(sig);
    return true;
  });

  return deduped.sort((a, b) => a.totalMin - b.totalMin).slice(0, maxResults);
}
