import { useEffect, useState, useMemo } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { getAllRoutes } from '../../api/route.api';
import { getAllDelays } from '../../api/driver.api';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import TripResultRow from '../../components/TripResultRow';
import { planTrips, routeDistanceMeters } from '../../utils/tripPlanner';
import useAutoRefresh from '../../hooks/useAutoRefresh';

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
  const [startQuery, setStartQuery] = useState('');
  const [startFocused, setStartFocused] = useState(false);
  const [destFocused, setDestFocused] = useState(false);
  const [autoLocationTried, setAutoLocationTried] = useState(false);
  const [delays, setDelays] = useState([]);
  const navigate = useNavigate();

  useAutoRefresh(() => {
    getAllRoutes().then(r => { setRoutes(r.data); setLoading(false); });
    getAllDelays().then(r => setDelays(r.data.filter(d => d.isActive))).catch(() => {});
    if (user) api.get('/api/favourites').then(r => setFavourites(r.data.map(f => f.routeId))).catch(() => {});
  }, [user]);

  const delayByRoute = useMemo(() => {
    const m = new Map();
    delays.forEach(d => m.set(d.routeId, d.delayMinutes));
    return m;
  }, [delays]);

  // All known stops (deduped by name) — backs the autocomplete suggestions for
  // both the start-point and destination fields.
  const allStops = useMemo(() => {
    const byName = new Map();
    routes.forEach(r => sortedStops(r).forEach(s => {
      if (s.latitude && s.longitude && !byName.has(s.name)) byName.set(s.name, s);
    }));
    return [...byName.values()];
  }, [routes]);

  const startStopForQuery = useMemo(() => {
    const q = startQuery.trim().toLowerCase();
    if (!q) return null;
    return allStops.find(s => s.name.toLowerCase().includes(q)) || null;
  }, [startQuery, allStops]);

  const startSuggestions = useMemo(() => {
    const q = startQuery.trim().toLowerCase();
    if (!q) return [];
    return allStops.filter(s => s.name.toLowerCase().includes(q)).slice(0, 6);
  }, [startQuery, allStops]);

  const destSuggestions = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return [];
    return allStops.filter(s => s.name.toLowerCase().includes(q)).slice(0, 6);
  }, [search, allStops]);

  // Effective trip-planning origin: a manually typed start point takes priority
  // over geolocation. An unmatched start query means no usable origin at all.
  const effectiveOrigin = startQuery.trim()
    ? (startStopForQuery ? { lat: parseFloat(startStopForQuery.latitude), lng: parseFloat(startStopForQuery.longitude) } : null)
    : userLocation;

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

  const useCurrentLocationForStart = () => {
    setStartQuery('');
    setStartFocused(false);
    requestLocation();
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

  // Google Maps-style default: as soon as the commuter searches for a destination,
  // silently try to use their current location as the start point. They can still
  // override it by typing into the start field — that always takes priority (see
  // effectiveOrigin above). Only auto-prompted once per visit so a denial (or a
  // manual start point) doesn't re-trigger the browser permission prompt.
  useEffect(() => {
    if (showTripMode && !autoLocationTried && !userLocation && !startQuery.trim()) {
      setAutoLocationTried(true);
      requestLocation();
    }
  }, [showTripMode, autoLocationTried, userLocation, startQuery]);

  // No location yet: fall back to direct-route matching only (no pathfinding possible
  // without a starting point). Each result lets the commuter opt in to location for ETA.
  const directResults = useMemo(() => {
    if (!showTripMode || effectiveOrigin) return [];
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
  }, [showTripMode, effectiveOrigin, search, routes]);

  // Origin known (geolocation or manual start point): run full pathfinding
  // (with transfers) across the route network.
  const itineraries = useMemo(() => {
    if (!showTripMode || !effectiveOrigin || routes.length === 0) return [];
    return planTrips({ routes, userLocation: effectiveOrigin, destinationQuery: search, maxResults: 3 });
  }, [showTripMode, effectiveOrigin, search, routes]);

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
    if (!effectiveOrigin) {
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
  }, [directResults, itineraries, effectiveOrigin, fullStopsByRoute]);

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh' }}>
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '2rem 1.5rem' }}>
        <button onClick={() => navigate(-1)} className="back-link" style={{ background: 'none', border: 'none', borderRadius: 999, cursor: 'pointer', color: '#6b7280', fontSize: '.875rem', fontWeight: 600, padding: '0.4rem 0.85rem', margin: '0 0 0.75rem -0.85rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          &#8592; <span className="back-link-text">Back</span>
        </button>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#111827', marginBottom: '0.35rem' }}>All Routes</h1>
        <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>Browse routes or type a destination to see live tracking and ETA.</p>

        <div style={{ background: '#fff', border: '1.5px solid #e5e7eb', borderRadius: 10, marginBottom: '0.5rem' }}>
          {/* Start point */}
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.65rem 0.9rem' }}>
            <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#16a34a', flexShrink: 0 }} />
            <input
              value={startQuery}
              onChange={e => setStartQuery(e.target.value)}
              onFocus={() => setStartFocused(true)}
              onBlur={() => setTimeout(() => setStartFocused(false), 120)}
              placeholder={locationLoading ? 'Locating…' : userLocation ? 'My Location' : 'Choose starting point'}
              style={{ flex: 1, minWidth: 0, border: 'none', outline: 'none', fontSize: '.92rem', background: 'transparent' }}
            />
            <button type="button" onClick={useCurrentLocationForStart} disabled={locationLoading}
              title={locationLoading ? 'Locating…' : 'Use current location'}
              style={{ background: 'none', border: 'none', cursor: locationLoading ? 'default' : 'pointer', color: userLocation && !startQuery ? 'var(--primary)' : '#9ca3af', fontSize: '1.05rem', padding: '0 2px', flexShrink: 0 }}>
              &#8982;
            </button>
            {startQuery && (
              <button type="button" onClick={() => setStartQuery('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', fontSize: '1.1rem', padding: 0, lineHeight: 1, flexShrink: 0 }}>&times;</button>
            )}

            {startFocused && (startSuggestions.length > 0 || !startQuery) && (
              <div style={{ position: 'absolute', top: '100%', left: '2.2rem', right: '0.5rem', background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, marginTop: 4, boxShadow: '0 6px 20px rgba(0,0,0,.1)', zIndex: 10, overflow: 'hidden' }}>
                {!startQuery && (
                  <div onMouseDown={useCurrentLocationForStart}
                    style={{ padding: '0.6rem 0.8rem', fontSize: '.85rem', color: 'var(--primary)', fontWeight: 600, cursor: 'pointer' }}>
                    &#8982;&nbsp; Use my current location
                  </div>
                )}
                {startSuggestions.map((s, i) => (
                  <div key={s.id} onMouseDown={() => { setStartQuery(s.name); setStartFocused(false); }}
                    style={{ padding: '0.6rem 0.8rem', fontSize: '.85rem', color: '#374151', cursor: 'pointer', borderTop: (i === 0 && startQuery) ? 'none' : '1px solid #f3f4f6' }}>
                    {s.name}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Swap */}
          <div style={{ display: 'flex', alignItems: 'center', padding: '0 0.9rem' }}>
            <div style={{ flex: 1, borderTop: '1px solid #f3f4f6' }} />
            <button type="button" onClick={() => { const s = search, st = startQuery; setSearch(st); setStartQuery(s); }}
              title="Swap start and destination"
              style={{ background: '#f3f4f6', border: '1px solid #e5e7eb', borderRadius: '50%', width: 26, height: 26, margin: '0 0.5rem', cursor: 'pointer', color: '#6b7280', fontSize: '.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              &#8645;
            </button>
            <div style={{ flex: 1, borderTop: '1px solid #f3f4f6' }} />
          </div>

          {/* Destination */}
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.65rem 0.9rem' }}>
            <span style={{ width: 9, height: 9, borderRadius: 2, background: '#dc2626', flexShrink: 0 }} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              onFocus={() => setDestFocused(true)}
              onBlur={() => setTimeout(() => setDestFocused(false), 120)}
              placeholder="Search a destination or stop name..."
              style={{ flex: 1, minWidth: 0, border: 'none', outline: 'none', fontSize: '.92rem', background: 'transparent' }}
            />
            {search && (
              <button type="button" onClick={() => setSearch('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', fontSize: '1.1rem', padding: 0, lineHeight: 1, flexShrink: 0 }}>&times;</button>
            )}

            {destFocused && destSuggestions.length > 0 && (
              <div style={{ position: 'absolute', top: '100%', left: '2.2rem', right: '0.5rem', background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, marginTop: 4, boxShadow: '0 6px 20px rgba(0,0,0,.1)', zIndex: 10, overflow: 'hidden' }}>
                {destSuggestions.map((s, i) => (
                  <div key={s.id} onMouseDown={() => { setSearch(s.name); setDestFocused(false); }}
                    style={{ padding: '0.6rem 0.8rem', fontSize: '.85rem', color: '#374151', cursor: 'pointer', borderTop: i === 0 ? 'none' : '1px solid #f3f4f6' }}>
                    {s.name}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <div style={{ fontSize: '.78rem', color: '#dc2626', marginBottom: '1rem', minHeight: locationError ? undefined : 0 }}>{locationError}</div>

        {/* ── TRIP MODE ── */}
        {showTripMode && (
          loading ? (
            <p style={{ color: '#9ca3af', textAlign: 'center', padding: '3rem' }}>Loading routes...</p>

          ) : rowOptions.length === 0 ? (
            <p style={{ color: '#9ca3af', textAlign: 'center', padding: '3rem' }}>
              {!effectiveOrigin || !destStopForQuery ? `No routes found for "${search}".` : `No route — even with transfers — reaches "${search}" from your starting point.`}
            </p>

          ) : (
            <>
              <div style={{ marginBottom: '0.75rem', fontSize: '.88rem', color: '#6b7280' }}>
                {rowOptions.length} option{rowOptions.length > 1 ? 's' : ''} to <strong style={{ color: '#111827' }}>{search}</strong>
                {effectiveOrigin ? ' — ranked by ETA' : ''}
              </div>
              {!effectiveOrigin && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', background: '#eff6ff', borderRadius: 8, padding: '0.65rem 1rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '.83rem', color: '#1a5a7a' }}>
                    {startQuery.trim() ? `No stop matches "${startQuery}" — try a different start point` : 'Add a starting point above for ETAs, walking distances, and transfers'}
                  </span>
                  <button onClick={useCurrentLocationForStart} disabled={locationLoading}
                    style={{ padding: '5px 14px', background: locationLoading ? '#9ca3af' : '#1a5a7a', color: '#fff', border: 'none', borderRadius: 6, fontSize: '.8rem', fontWeight: 600, cursor: locationLoading ? 'default' : 'pointer', flexShrink: 0 }}>
                    {locationLoading ? 'Locating…' : 'Use My Location'}
                  </button>
                </div>
              )}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {rowOptions.map(opt => (
                  <TripResultRow
                    key={opt.key}
                    option={opt}
                    delayMinutes={delayByRoute.get(opt.legs[0].routeId) || 0}
                    isFav={favourites.includes(opt.legs[0].routeId)}
                    onFavToggle={e => toggleFav(e, opt.legs[0].routeId)}
                    onSelect={() => navigate(`/trip/${opt.legs[0].routeId}`, {
                      state: { option: opt, userLocation: effectiveOrigin, delayMinutes: delayByRoute.get(opt.legs[0].routeId) || 0 },
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
                const stops = sortedStops(r).filter(s => s.latitude && s.longitude);
                const distanceKm = stops.length > 1 ? routeDistanceMeters(stops) / 1000 : null;
                const routeDelayed = delayByRoute.has(r.id);
                return (
                  <div key={r.id} className="route-list-card"
                    onClick={() => navigate(`/schedule/${r.id}`)}
                    style={{ background: '#fff', borderRadius: 12, padding: '1.25rem 1.5rem', border: '1px solid #e5e7eb', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '1rem', boxShadow: '0 1px 3px rgba(0,0,0,.04)', transition: 'transform .2s ease, box-shadow .2s ease' }}>
                    <div style={{ width: 46, height: 46, borderRadius: 10, background: color, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.1rem', flexShrink: 0 }}>
                      {i + 1}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, color: '#111827', fontSize: '1rem', marginBottom: 2 }}>{getRouteLabel(r)}</div>
                      {r.description && <div style={{ fontSize: '.83rem', color: '#6b7280', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.description}</div>}
                      <div style={{ fontSize: '.78rem', color: '#9ca3af', marginTop: 2 }}>
                        {stops.length} stop{stops.length !== 1 ? 's' : ''}{distanceKm !== null ? ` · ${distanceKm.toFixed(1)} km` : ''}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
                      <Link to={`/tracker/${r.id}`} className={`track-bus-button${routeDelayed ? ' delayed' : ''}`} onClick={e => e.stopPropagation()}
                        style={{ padding: '6px 14px', background: routeDelayed ? '#fef2f2' : '#eff6ff', color: routeDelayed ? '#dc2626' : 'var(--primary)', borderRadius: 20, fontSize: '.8rem', fontWeight: 600, textDecoration: 'none' }}>
                        Live Tracking
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
