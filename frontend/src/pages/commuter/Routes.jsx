import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { getAllRoutes } from '../../api/route.api';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import TripCard from '../../components/TripCard';

const COLORS = ['#1565C0', '#2E7D32', '#E65100', '#6A1B9A', '#00838F', '#AD1457'];

function haversine(lat1, lng1, lat2, lng2) {
  const R = 6371000;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

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
  const navigate = useNavigate();

  useEffect(() => {
    getAllRoutes().then(r => { setRoutes(r.data); setLoading(false); });
    if (user) api.get('/api/favourites').then(r => setFavourites(r.data.map(f => f.routeId))).catch(() => {});
  }, [user]);

  const requestLocation = () => {
    if (!navigator.geolocation || locationLoading) return;
    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      pos => { setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }); setLocationLoading(false); },
      () => setLocationLoading(false)
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

  // Build trip results whenever search or location changes
  const tripResults = showTripMode
    ? routes.map(r => {
        const stops = sortedStops(r).filter(s => s.latitude && s.longitude);
        if (stops.length < 2) return null;

        const q = search.toLowerCase();
        const destStop = stops.find(s => s.name.toLowerCase().includes(q));
        if (!destStop) return null;

        const destOrder = destStop.RouteStop?.stopOrder ?? 0;

        let boardingStop = null, boardingDist = null;
        if (userLocation) {
          let minDist = Infinity;
          stops.forEach(s => {
            if ((s.RouteStop?.stopOrder ?? 0) < destOrder) {
              const d = haversine(userLocation.lat, userLocation.lng, parseFloat(s.latitude), parseFloat(s.longitude));
              if (d < minDist) { minDist = d; boardingStop = s; }
            }
          });
          if (boardingStop) boardingDist = minDist;
        }

        return { r, destStop, boardingStop, boardingDist, stops };
      })
      .filter(Boolean)
      .sort((a, b) => {
        if (a.boardingDist !== null && b.boardingDist !== null) return a.boardingDist - b.boardingDist;
        if (a.boardingDist !== null) return -1;
        if (b.boardingDist !== null) return 1;
        return 0;
      })
      .slice(0, 3)
    : [];

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
          ) : tripResults.length === 0 ? (
            <p style={{ color: '#9ca3af', textAlign: 'center', padding: '3rem' }}>No routes found for "{search}".</p>
          ) : (
            <>
              <div style={{ marginBottom: '1rem', fontSize: '.88rem', color: '#6b7280' }}>
                {tripResults.length} route{tripResults.length > 1 ? 's' : ''} serving <strong style={{ color: '#111827' }}>{search}</strong>
                {userLocation ? ' — sorted by nearest boarding stop' : ''}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {tripResults.map(({ r, destStop, boardingStop, boardingDist, stops }) => (
                  <TripCard
                    key={r.id}
                    route={r}
                    destStop={destStop}
                    boardingStop={boardingStop}
                    boardingDist={boardingDist}
                    userPos={userLocation}
                    allStops={stops}
                    onRequestLocation={requestLocation}
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
