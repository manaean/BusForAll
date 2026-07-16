import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AlertBanner from '../../components/AlertBanner';
import { useAuth } from '../../context/AuthContext';
import { getAllRoutes } from '../../api/route.api';
import { getAlerts } from '../../api/alert.api';
import api from '../../api/axios';

const page = { maxWidth: 700, margin: '0 auto', padding: '1.5rem 1rem' };
const heading = { fontSize: '1.35rem', fontWeight: 700, marginBottom: '0.25rem' };
const sub = { color: 'var(--text-light)', fontSize: '.9rem', marginBottom: '1.5rem' };
const grid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.75rem', marginBottom: '1.5rem' };
const quickCard = { background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10, padding: '1rem', textDecoration: 'none', color: 'var(--text)' };

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [routes, setRoutes] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [favourites, setFavourites] = useState([]);

  useEffect(() => {
    getAllRoutes()
      .then(r => setRoutes(r.data.slice(0, 3)))
      .catch(err => console.error('Routes error:', err));
    getAlerts(true)
      .then(r => setAlerts(r.data))
      .catch(err => console.error('Alerts error:', err));
    if (user) api.get('/api/favourites').then(r => setFavourites(r.data.map(f => f.routeId))).catch(() => {});
  }, [user]);

  const toggleFav = async (e, routeId) => {
    e.preventDefault();
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
    const stops = [...(r.Stops || [])].sort((a, b) => (a.RouteStop?.stopOrder ?? 0) - (b.RouteStop?.stopOrder ?? 0));
    if (stops.length === 0) return r.name;
    if (stops.length === 1) return stops[0].name;
    return `${stops[0].name} → ${stops[stops.length - 1].name}`;
  };

  return (
    <>

      <div style={page}>
        <h1 style={heading}>Welcome, {user?.name}</h1>
        <p style={sub}>View routes, check schedules, and track buses in real time.</p>

        <AlertBanner alerts={alerts} />

        <h2 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.75rem' }}>Quick Access</h2>
        <div style={grid}>
          <Link to="/routes" style={quickCard}>
            <div style={{ fontWeight: 600, color: 'var(--primary)' }}>Browse Routes</div>
            <div style={{ fontSize: '.82rem', color: 'var(--text-light)', marginTop: 4 }}>View all available bus routes</div>
          </Link>
          <Link to="/favourites" style={quickCard}>
            <div style={{ fontWeight: 600, color: 'var(--primary)' }}>My Favourites</div>
            <div style={{ fontSize: '.82rem', color: 'var(--text-light)', marginTop: 4 }}>Your saved routes</div>
          </Link>
        </div>

        {routes.length > 0 && (
          <>
            <h2 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.75rem' }}>Recent Routes</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {routes.map(r => (
                <Link key={r.id} to={`/schedule/${r.id}`} style={{ textDecoration: 'none', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, padding: '0.75rem 1rem', color: 'var(--primary)', fontWeight: 500, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                  {getRouteLabel(r)}
                  <button onClick={(e) => toggleFav(e, r.id)} title={favourites.includes(r.id) ? 'Remove favourite' : 'Save route'}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem', color: favourites.includes(r.id) ? '#f59e0b' : '#d1d5db', padding: 0, flexShrink: 0, lineHeight: 1 }}>
                    {favourites.includes(r.id) ? '★' : '☆'}
                  </button>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </>
  );
}
