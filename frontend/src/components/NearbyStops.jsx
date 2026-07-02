import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { haversine, RIDE_MIN_PER_STOP } from '../utils/tripPlanner';
import useSimulatedBus, { etaMinutes } from '../hooks/useSimulatedBus';

function sortedStops(r) {
  return [...(r.Stops || [])]
    .sort((a, b) => (a.RouteStop?.stopOrder ?? 0) - (b.RouteStop?.stopOrder ?? 0))
    .filter(s => s.latitude && s.longitude);
}

function RouteEtaBadge({ routeName, fullStops, stopIdx }) {
  const bus = useSimulatedBus(fullStops);
  const eta = etaMinutes(bus.stopIdx, bus.t, stopIdx, fullStops.length, RIDE_MIN_PER_STOP);
  if (eta === null) return null;
  return (
    <span style={{ background: '#eff6ff', color: '#1a5a7a', borderRadius: 20, padding: '3px 10px', fontSize: '.76rem', fontWeight: 700, whiteSpace: 'nowrap' }}>
      {routeName.split('—')[0].split('(')[0].trim()} · {eta} min
    </span>
  );
}

function NearbyStopRow({ stop, dist, servingRoutes }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.75rem', padding: '0.65rem 0', borderBottom: '1px solid #f3f4f6' }}>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontWeight: 600, fontSize: '.88rem', color: '#111827' }}>{stop.name}</div>
        <div style={{ fontSize: '.78rem', color: '#9ca3af', marginTop: 2 }}>{Math.round(dist)}m walk</div>
      </div>
      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
        {servingRoutes.map(r => (
          <RouteEtaBadge key={r.routeId} routeName={r.routeName} fullStops={r.fullStops} stopIdx={r.stopIdx} />
        ))}
      </div>
    </div>
  );
}

// Auto-requests location (no button) and lists the closest stops with walking
// distance + live ETA of the next bus on every route serving that stop.
export default function NearbyStops({ routes, maxStops = 4 }) {
  const [userLocation, setUserLocation] = useState(null);
  const [status, setStatus] = useState('idle'); // idle | loading | denied | ok

  useEffect(() => {
    if (!navigator.geolocation) { setStatus('denied'); return; }
    setStatus('loading');
    navigator.geolocation.getCurrentPosition(
      pos => { setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }); setStatus('ok'); },
      () => setStatus('denied'),
      { timeout: 8000 }
    );
  }, []);

  // stopId -> { stop, servingRoutes: [{ routeId, routeName, fullStops, stopIdx }] }
  const stopRegistry = useMemo(() => {
    const m = new Map();
    routes.forEach(r => {
      const stops = sortedStops(r);
      stops.forEach((s, idx) => {
        if (!m.has(s.id)) m.set(s.id, { stop: s, servingRoutes: [] });
        m.get(s.id).servingRoutes.push({ routeId: r.id, routeName: r.name, fullStops: stops, stopIdx: idx });
      });
    });
    return m;
  }, [routes]);

  const nearby = useMemo(() => {
    if (!userLocation) return [];
    return [...stopRegistry.values()]
      .map(({ stop, servingRoutes }) => ({
        stop,
        servingRoutes: servingRoutes.slice(0, 3),
        dist: haversine(userLocation.lat, userLocation.lng, parseFloat(stop.latitude), parseFloat(stop.longitude)),
      }))
      .sort((a, b) => a.dist - b.dist)
      .slice(0, maxStops);
  }, [userLocation, stopRegistry, maxStops]);

  if (status === 'idle' || status === 'loading') {
    return <p style={{ color: '#9ca3af', fontSize: '.875rem' }}>Finding stops near you...</p>;
  }

  if (status === 'denied') {
    return (
      <div>
        <p style={{ color: '#9ca3af', fontSize: '.875rem', marginBottom: '1rem' }}>
          Enable location access to see stops near you and live arrival times.
        </p>
        <Link to="/routes" style={{ display: 'inline-block', padding: '0.7rem 1.5rem', background: '#fff', border: '1.5px solid #1a5a7a', color: '#1a5a7a', borderRadius: 8, textDecoration: 'none', fontWeight: 600, fontSize: '.875rem' }}>
          View All Stops
        </Link>
      </div>
    );
  }

  if (nearby.length === 0) {
    return <p style={{ color: '#9ca3af', fontSize: '.875rem' }}>No stops found nearby.</p>;
  }

  return (
    <div>
      {nearby.map(({ stop, dist, servingRoutes }) => (
        <NearbyStopRow key={stop.id} stop={stop} dist={dist} servingRoutes={servingRoutes} />
      ))}
    </div>
  );
}
