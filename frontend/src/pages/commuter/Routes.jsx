import { useEffect, useState, useMemo } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { getAllRoutes } from '../../api/route.api';
import { getAllDelays } from '../../api/driver.api';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import TripResultRow from '../../components/TripResultRow';
import { planTrips } from '../../utils/tripPlanner';

const COLORS = ['#1565C0', '#2E7D32', '#E65100', '#6A1B9A', '#00838F', '#AD1457'];

function sortedStops(r) {
  return [...(r.Stops || [])].sort((a, b) => (a.RouteStop?.stopOrder ?? 0) - (b.RouteStop?.stopOrder ?? 0));
}

export default function Routes() {
  const { user } = useAuth();
  const [routes, setRoutes] = useState([]);
  const [favourites, setFavourites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('q') || '');
  const [userLocation, setUserLocation] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState(null);
  const [delays, setDelays] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    getAllRoutes().then(r => { setRoutes(r.data); setLoading(false); });
    getAllDelays().then(r => setDelays(r.data.filter(d => d.isActive))).catch(() => {});
    if (user) api.get('/api/favourites').then(r => setFavourites(r.data.map(f => f.routeId))).catch(() => {});
  }, [user]);

  const delayByRoute = useMemo(() => {
    const m = new Map();
    delays.forEach(d => m.set(d.routeId, d.delayMinutes));
    return m;
  }, [delays]);

  const requestLocation = () => {
    if (locationLoading) return;
    if (!navigator.geolocation) { setLocationError('Location is not supported by this browser.'); return; }
    if (!window.isSecureContext) { setLocationError('Location requires a secure (https) connection.'); return; }
    setLocationError(null);
    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      pos => { setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }); setLocationLoading(false); },
      err => { setLocationLoading(false); setLocationError(err.code === 1 ? 'Location access was denied.' : 'Could not get your location. Try again.'); },
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 60000 }
    );
  };

  const toggleFav = async (e, routeId) => {
    e.stopPropagation();
    if (!user) { navigate('/login'); return; }
    if (favourites.includes(routeId)) {
      await api.delete(`/api/favourites/${routeId}`);
      setFavourites(f => f.filter(id => id !== routeId));
    } else {
      await api.post(`/api/favourites/${routeId}`);
      setFavourites(f => [...f, routeId]);
    }
  };

  const getRouteLabel = (r) => {
    const stops = sortedStops(r);
    if (stops.length === 0) return r.name;
    if (stops.length === 1) return stops[0].name;
    return `${stops[0].name} → ${stops[stops.length - 1].name}`;
  };

  const showTripMode = search.trim().length > 0;

  // No location yet: fall back to direct-route matching only (no pathfinding possible
  // without a starting point). Each result lets the commuter opt in to location for ETA.
  const directResults = useMemo(() => {
    if (!showTripMode || userLocation) return [];
    const q = search.toLowerCase();
    return routes.map(r => {
        const stops = sortedStops(r).filter(s => s.latitude && s.longitude);
        if (stops.length < 2) return null;
        const destStop = stops.find(s => s.name.toLowerCase().includes(q));
        if (!destStop) return null;
        return { r, destStop, boardingStop: null, boardingDist: null, stops };
      })
      .filter(Boolean)
      .slice(0, 3);
  }, [showTripMode, userLocation, search, routes]);

  // Location known: run full pathfinding (with transfers) across the route network.
  const itineraries = useMemo(() => {
    if (!showTripMode || !userLocation || routes.length === 0) return [];
    return planTrips({ routes, userLocation, destinationQuery: search, maxResults: 3 });
  }, [showTripMode, userLocation, search, routes]);

  const destStopForQuery = useMemo(() => {
    if (!showTripMode) return null;
    const q = search.toLowerCase();
    for (const r of routes) {
      const match = sortedStops(r).filter(s => s.latitude && s.longitude).find(s => s.name.toLowerCase().includes(q));
      if (match) return match;
    }
    return null;
  }, [showTripMode, search, routes]);

  // Full filtered stop list per route — used to animate each leg's bus along its
  // whole route (not just the boarded segment), so the compact row's ETA-to-board
  // calculation accounts for the bus's real position even before it reaches you.
  const fullStopsByRoute = useMemo(() => {
    const m = new Map();
    routes.forEach(r => m.set(r.id, sortedStops(r).filter(s => s.latitude && s.longitude)));
    return m;
  }, [routes]);

  // Compact-row view: a single normalized shape for both the no-location
  // (direct-route) and location-known (multi-leg itinerary) result sets.
  const rowOptions = useMemo(() => {
    if (!userLocation) {
      return directResults.map(d => ({
        key: `direct-${d.r.id}`,
        kind: 'direct',
        raw: d,
        destStop: d.destStop,
        walkDist: null,
        walkMin: null,
        legs: [{ routeId: d.r.id, routeName: d.r.name, fullStops: fullStopsByRoute.get(d.r.id) || d.stops, boardStop: null, alightStop: d.destStop }],
      }));
    }
    return itineraries.map((it, i) => ({
      key: `it-${i}`,
      kind: 'itinerary',
      raw: it,
      destStop: it.legs[it.legs.length - 1].alightStop,
      walkDist: it.walkDist,
      walkMin: it.walkMin,
      legs: it.legs.map(l => ({ routeId: l.routeId, routeName: l.routeName, fullStops: fullStopsByRoute.get(l.routeId) || l.stops, boardStop: l.boardStop, alightStop: l.alightStop })),
    }));
  }, [directResults, itineraries, userLocation, fullStopsByRoute]);

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh' }}>
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '2rem 1.5rem' }}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', fontSize: '.875rem', fontWeight: 500, padding: '0 0 0.75rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>&#8592; Back</button>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#111827', marginBottom: '0.35rem' }}>All Routes</h1>
        <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>Browse routes or type a destination to see live tracking and ETA.</p>

        <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search a destination or stop name..."
            style={{ width: '100%', padding: '0.75rem 1rem', border: '1.5px solid #e5e7eb', borderRadius: 8, fontSize: '.95rem', outline: 'none', background: '#fff', boxSizing: 'border-box' }}
          />
          {search && (
            <button onClick={() => setSearch('')} style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', fontSize: '1.2rem', padding: 0, lineHeight: 1 }}>
              &times;
            </button>
          )}
        </div>

        {/* ── TRIP MODE ── */}
        {showTripMode && (
          loading ? (
            <p style={{ color: '#9ca3af', textAlign: 'center', padding: '3rem' }}>Loading routes...</p>

          ) : rowOptions.length === 0 ? (
            <p style={{ color: '#9ca3af', textAlign: 'center', padding: '3rem' }}>
              {!userLocation || !destStopForQuery ? `No routes found for "${search}".` : `No route — even with transfers — reaches "${search}" from your location.`}
            </p>

          ) : (
            <>
              <div style={{ marginBottom: '0.75rem', fontSize: '.88rem', color: '#6b7280' }}>
                {rowOptions.length} option{rowOptions.length > 1 ? 's' : ''} to <strong style={{ color: '#111827' }}>{search}</strong>
                {userLocation ? ' — ranked by ETA' : ''}
              </div>
              {!userLocation && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', background: '#eff6ff', borderRadius: 8, padding: '0.65rem 1rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '.83rem', color: '#1a5a7a' }}>Share your location for ETAs, walking distances, and transfers</span>
                  <button onClick={requestLocation} disabled={locationLoading}
                    style={{ padding: '5px 14px', background: locationLoading ? '#9ca3af' : '#1a5a7a', color: '#fff', border: 'none', borderRadius: 6, fontSize: '.8rem', fontWeight: 600, cursor: locationLoading ? 'default' : 'pointer', flexShrink: 0 }}>
                    {locationLoading ? 'Locating…' : 'Use My Location'}
                  </button>
                </div>
              )}
              {locationError && <div style={{ fontSize: '.78rem', color: '#dc2626', marginBottom: '0.5rem' }}>{locationError}</div>}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {rowOptions.map(opt => (
                  <TripResultRow
                    key={opt.key}
                    option={opt}
                    delayMinutes={delayByRoute.get(opt.legs[0].routeId) || 0}
                    onSelect={() => navigate(`/trip/${opt.legs[0].routeId}`, {
                      state: { option: opt, userLocation, delayMinutes: delayByRoute.get(opt.legs[0].routeId) || 0 },
                    })}
                  />
                ))}
              </div>
            </>
          )
        )}

        {/* ── DEFAULT MODE: all routes ── */}
        {!showTripMode && (
          loading ? (
            <p style={{ color: '#9ca3af', textAlign: 'center', padding: '3rem' }}>Loading routes...</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {routes.map((r, i) => {
                const color = COLORS[i % COLORS.length];
                const isFav = favourites.includes(r.id);
                return (
                  <div key={r.id}
                    onClick={() => navigate(`/schedule/${r.id}`)}
                    style={{ background: '#fff', borderRadius: 12, padding: '1.25rem 1.5rem', border: '1px solid #e5e7eb', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '1rem', boxShadow: '0 1px 3px rgba(0,0,0,.04)', transition: 'box-shadow .15s' }}
                    onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,.09)'}
                    onMouseLeave={e => e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,.04)'}>
                    <div style={{ width: 46, height: 46, borderRadius: 10, background: color, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.1rem', flexShrink: 0 }}>
                      {i + 1}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, color: '#111827', fontSize: '1rem', marginBottom: 2 }}>{getRouteLabel(r)}</div>
                      {r.description && <div style={{ fontSize: '.83rem', color: '#6b7280', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.description}</div>}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
                      <Link to={`/tracker/${r.id}`} onClick={e => e.stopPropagation()}
                        style={{ padding: '6px 14px', background: '#eff6ff', color: 'var(--primary)', borderRadius: 20, fontSize: '.8rem', fontWeight: 600, textDecoration: 'none' }}>
                        Track Live
                      </Link>
                      <button onClick={e => toggleFav(e, r.id)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.3rem', color: isFav ? '#f59e0b' : '#d1d5db', padding: '0 4px' }}
                        title={user ? (isFav ? 'Remove favourite' : 'Save route') : 'Login to save'}>
                        {isFav ? '★' : '☆'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )
        )}
      </div>
    </div>
  );
}
