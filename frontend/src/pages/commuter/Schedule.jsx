import { useEffect, useState, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getRouteById } from '../../api/route.api';
import { getSchedulesByRoute } from '../../api/schedule.api';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import { routeDistanceMeters } from '../../utils/tripPlanner';

const COLORS = ['#1565C0', '#2E7D32', '#E65100', '#6A1B9A', '#00838F', '#AD1457'];

export default function Schedule() {
  const { routeId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [route, setRoute] = useState(null);
  const [schedules, setSchedules] = useState([]);
  const [isFav, setIsFav] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getRouteById(routeId), getSchedulesByRoute(routeId)]).then(([r, s]) => {
      setRoute(r.data); setSchedules(s.data); setLoading(false);
    });
    if (user) api.get('/api/favourites').then(r => setIsFav(r.data.some(f => f.routeId === parseInt(routeId)))).catch(() => {});
  }, [routeId, user]);

  const toggleFav = async () => {
    if (!user) { navigate('/login'); return; }
    if (isFav) { await api.delete(`/api/favourites/${routeId}`); setIsFav(false); }
    else { await api.post(`/api/favourites/${routeId}`); setIsFav(true); }
  };

  const hasDelay = route?.Delays?.length > 0;
  const delay = hasDelay ? route.Delays[0] : null;
  const stops = route?.Stops || [];

  const distanceKm = useMemo(() => {
    const sorted = [...stops].sort((a, b) => (a.RouteStop?.stopOrder ?? 0) - (b.RouteStop?.stopOrder ?? 0));
    return sorted.filter(s => s.latitude && s.longitude).length > 1 ? routeDistanceMeters(sorted) / 1000 : null;
  }, [stops]);

  if (loading) return (
    <div style={{ background: '#f8fafc', minHeight: '100vh' }}>
      
      <div style={{ textAlign: 'center', padding: '4rem', color: '#9ca3af' }}>Loading...</div>
    </div>
  );

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh' }}>
      
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '1.5rem' }}>

        {/* Back */}
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', fontSize: '.875rem', fontWeight: 500, padding: '0 0 0.75rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>← Back</button>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', margin: '1.25rem 0 1.5rem', flexWrap: 'wrap' }}>
          <div style={{ width: 56, height: 56, borderRadius: 12, background: COLORS[parseInt(routeId) % COLORS.length], color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '1.4rem', flexShrink: 0 }}>
            {routeId}
          </div>
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#111827' }}>{route?.name}</h1>
              <span style={{ background: hasDelay ? '#fef2f2' : '#f0fdf4', color: hasDelay ? '#dc2626' : '#16a34a', padding: '3px 12px', borderRadius: 20, fontSize: '.78rem', fontWeight: 700, border: `1px solid ${hasDelay ? '#fecaca' : '#bbf7d0'}` }}>
                {hasDelay ? `+${delay.delayMinutes} min delay` : 'On Time'}
              </span>
            </div>
            {route?.description && <p style={{ color: '#6b7280', fontSize: '.9rem', marginTop: 2 }}>{route.description}</p>}
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', flexShrink: 0 }}>
            <button onClick={toggleFav}
              style={{ padding: '8px 18px', border: '1.5px solid #e5e7eb', borderRadius: 8, background: '#fff', cursor: 'pointer', fontWeight: 600, fontSize: '.875rem', color: isFav ? '#f59e0b' : '#374151', display: 'flex', alignItems: 'center', gap: 6 }}>
              {isFav ? '★ Saved' : '☆ Add to Favourites'}
            </button>
            <Link to={`/tracker/${routeId}`}
              style={{ padding: '8px 18px', background: hasDelay ? '#dc2626' : 'var(--primary)', color: '#fff', borderRadius: 8, textDecoration: 'none', fontWeight: 600, fontSize: '.875rem' }}>
              Track Live
            </Link>
          </div>
        </div>

        {/* Schedule info cards */}
        {schedules.length > 0 && (
          <div className="stats-grid">
            {[
              { label: 'First Bus', value: schedules[0]?.departureTime },
              { label: 'Last Bus', value: schedules[schedules.length - 1]?.departureTime },
              { label: 'Days', value: 'Monday - Sunday' },
            ].map(c => (
              <div key={c.label} style={{ background: '#fff', borderRadius: 12, padding: '1rem 1.25rem', border: '1px solid #e5e7eb' }}>
                <div style={{ fontSize: '.78rem', color: '#9ca3af', marginBottom: 4 }}>{c.label}</div>
                <div style={{ fontWeight: 700, fontSize: '1.1rem', color: '#111827' }}>{c.value}</div>
              </div>
            ))}
          </div>
        )}

        <div className="schedule-layout">
          {/* Route Stops */}
          <div style={{ background: '#fff', borderRadius: 14, padding: '1.5rem', border: '1px solid #e5e7eb' }}>
            <h2 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '1.25rem', color: '#111827' }}>Route Stops</h2>
            {stops.length === 0 ? <p style={{ color: '#9ca3af' }}>No stops listed.</p> : stops.map((stop, idx) => (
              <div key={stop.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.6rem 0', borderBottom: idx < stops.length - 1 ? '1px solid #f3f4f6' : 'none' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                  <div style={{ width: 14, height: 14, borderRadius: '50%', border: `2px solid ${idx === 0 ? 'var(--primary)' : '#d1d5db'}`, background: idx === 0 ? 'var(--primary)' : '#fff' }} />
                  {idx < stops.length - 1 && <div style={{ width: 2, height: 32, background: '#e5e7eb', marginTop: 2 }} />}
                </div>
                <div style={{ flex: 1, fontWeight: idx === 0 ? 600 : 400, color: idx === 0 ? 'var(--primary)' : '#374151', fontSize: '.9rem' }}>{stop.name}</div>
                {idx === 0 && <span style={{ background: '#eff6ff', color: 'var(--primary)', padding: '2px 10px', borderRadius: 20, fontSize: '.75rem', fontWeight: 600 }}>First Stop</span>}
                {idx === stops.length - 1 && <span style={{ background: '#f0fdf4', color: '#16a34a', padding: '2px 10px', borderRadius: 20, fontSize: '.75rem', fontWeight: 600 }}>Last Stop</span>}
              </div>
            ))}
          </div>

          {/* Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ background: '#fff', borderRadius: 14, padding: '1.5rem', border: '1px solid #e5e7eb' }}>
              <h2 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '1rem', color: '#111827' }}>Route Information</h2>
              {[
                { label: 'Total Stops', value: stops.length },
                ...(distanceKm !== null ? [{ label: 'Distance', value: `${distanceKm.toFixed(1)} km` }] : []),
                { label: 'Frequency', value: 'Every 20 min' },
                { label: 'Status', value: hasDelay ? 'Delayed' : 'On Time', color: hasDelay ? '#dc2626' : '#16a34a' },
              ].map(info => (
                <div key={info.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.6rem 0', borderBottom: '1px solid #f3f4f6', fontSize: '.875rem' }}>
                  <span style={{ color: '#6b7280' }}>{info.label}</span>
                  <span style={{ fontWeight: 600, color: info.color || '#111827' }}>{info.value}</span>
                </div>
              ))}
              {hasDelay && (
                <div style={{ marginTop: '1rem', background: '#fef2f2', borderRadius: 8, padding: '0.85rem', border: '1px solid #fecaca' }}>
                  <div style={{ fontWeight: 600, color: '#dc2626', fontSize: '.875rem', marginBottom: 4 }}>Active Delay: +{delay.delayMinutes} min</div>
                  {delay.reason && <div style={{ fontSize: '.8rem', color: '#6b7280' }}>{delay.reason}</div>}
                </div>
              )}
              {!hasDelay && (
                <div style={{ marginTop: '1rem', background: '#f0fdf4', borderRadius: 8, padding: '0.85rem', border: '1px solid #bbf7d0' }}>
                  <div style={{ fontWeight: 600, color: '#16a34a', fontSize: '.875rem' }}>No delays reported on this route.</div>
                  <div style={{ fontSize: '.8rem', color: '#6b7280', marginTop: 2 }}>You have enough time to reach the bus stop.</div>
                </div>
              )}
            </div>

            {/* Weekly Schedule */}
            {schedules.length > 0 && (
              <div style={{ background: '#fff', borderRadius: 14, padding: '1.5rem', border: '1px solid #e5e7eb' }}>
                <h2 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '1rem', color: '#111827' }}>Weekly Schedule</h2>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', fontSize: '.85rem' }}>
                  <span style={{ color: '#6b7280', fontWeight: 500 }}>Monday - Sunday</span>
                  <span style={{ fontWeight: 600, color: '#111827' }}>
                    {schedules[0]?.departureTime?.slice(0, 5)} - {schedules[schedules.length - 1]?.departureTime?.slice(0, 5)}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
