import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import { getAllRoutes } from '../api/route.api';
import { getAlerts } from '../api/alert.api';
import { getAllDelays } from '../api/driver.api';
import NearbyStops from '../components/NearbyStops';

export default function Landing() {
  const [query, setQuery] = useState('');
  const [routes, setRoutes] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [delays, setDelays] = useState([]);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    getAllRoutes().then(r => setRoutes(r.data)).catch(() => {});
    getAlerts(true).then(r => setAlerts(r.data.slice(0, 3))).catch(() => {});
    getAllDelays().then(r => setDelays(r.data.filter(d => d.isActive))).catch(() => {});
  }, []);

  const getRouteStatus = (routeId) => delays.find(d => d.routeId === routeId);

  const getRouteLabel = (r) => {
    const stops = [...(r.Stops || [])].sort((a, b) => (a.RouteStop?.stopOrder ?? 0) - (b.RouteStop?.stopOrder ?? 0));
    if (stops.length === 0) return r.name;
    if (stops.length === 1) return stops[0].name;
    return `${stops[0].name} → ${stops[stops.length - 1].name}`;
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    navigate(`/routes?q=${encodeURIComponent(query.trim())}`);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f1f5f9', fontFamily: 'inherit' }}>

      <Navbar />

      {/* Hero */}
      <div style={{
        /* swap to: backgroundImage: 'linear-gradient(rgba(0,0,0,0.55),rgba(0,0,0,0.55)), url(/bus-photo.jpg)', backgroundSize: 'cover', backgroundPosition: 'center' */
        background: 'linear-gradient(135deg, #0f2a3d 0%, #1a5a7a 60%, #2a7a9a 100%)',
        padding: '4rem 2rem 3.5rem',
        color: '#fff',
      }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          {user && (
            <p style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.75)', marginBottom: '0.5rem' }}>
              Hello, {user.name}
            </p>
          )}
          <h1 style={{ fontSize: '2.4rem', fontWeight: 900, maxWidth: 580, lineHeight: 1.2, marginBottom: '1rem', color: '#fff' }}>
            Navigate Phnom Penh with confidence.
          </h1>
          <p style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.8)', maxWidth: 500, marginBottom: '2rem', lineHeight: 1.6 }}>
            Real-time tracking, accurate schedules, and instant alerts for all your transit needs.
          </p>
          <form onSubmit={handleSearch} style={{ display: 'flex', maxWidth: 560, background: '#fff', borderRadius: 10, overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,.2)' }}>
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Where are you going?"
              style={{ flex: 1, border: 'none', padding: '0.9rem 1.25rem', fontSize: '.95rem', outline: 'none', color: '#374151', background: 'transparent' }}
            />
            <button type="submit" style={{ padding: '0 1.5rem', background: '#1a5a7a', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '.9rem', whiteSpace: 'nowrap' }}>
              Search Routes
            </button>
          </form>
          <p style={{ marginTop: '0.75rem', fontSize: '.82rem', color: 'rgba(255,255,255,0.6)' }}>
            Flat fare: 1,500 Riel
          </p>
        </div>
      </div>

      <div className="landing-grid" style={{ maxWidth: 1100, margin: '2rem auto', padding: '0 1.5rem' }}>

        {/* Live Status */}
        <div className="landing-live-status" style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ fontWeight: 700, fontSize: '1rem', color: '#111827', margin: 0 }}>Live Status</h2>
            <span style={{ background: '#dcfce7', color: '#16a34a', fontSize: '.72rem', fontWeight: 700, padding: '2px 10px', borderRadius: 20 }}>All Systems Go</span>
          </div>
          {alerts.length === 0 ? (
            <p style={{ color: '#9ca3af', fontSize: '.875rem' }}>No active alerts.</p>
          ) : alerts.map(a => (
            <div key={a.id} style={{ borderLeft: `3px solid ${a.severity === 'high' ? '#ef4444' : a.severity === 'medium' ? '#f59e0b' : '#3b82f6'}`, paddingLeft: '0.75rem', marginBottom: '0.85rem' }}>
              <div style={{ fontWeight: 600, fontSize: '.85rem', color: '#374151', marginBottom: 2 }}>{a.title}</div>
              <div style={{ fontSize: '.8rem', color: '#6b7280', lineHeight: 1.4 }}>{a.message}</div>
            </div>
          ))}
          <Link to="/alerts" style={{ display: 'block', textAlign: 'center', marginTop: '0.75rem', color: '#1a5a7a', fontSize: '.83rem', fontWeight: 600, textDecoration: 'none' }}>
            View all alerts
          </Link>
        </div>

        {/* Routes */}
        <div className="landing-routes" style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ fontWeight: 700, fontSize: '1rem', color: '#111827', margin: 0 }}>Routes</h2>
            <Link to="/routes" style={{ color: '#1a5a7a', fontSize: '.85rem', fontWeight: 600, textDecoration: 'none' }}>View All</Link>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            {routes.length === 0 ? (
              <p style={{ color: '#9ca3af', fontSize: '.875rem', gridColumn: 'span 2' }}>No routes available.</p>
            ) : routes.slice(0, 4).map(r => (
              <Link key={r.id} to={`/schedule/${r.id}`} style={{ textDecoration: 'none', border: '1px solid #e5e7eb', borderRadius: 10, padding: '0.9rem 1rem', display: 'block' }}>
                <div style={{ marginBottom: '0.4rem' }}>
                  <span style={{ background: '#1a5a7a', color: '#fff', fontSize: '.72rem', fontWeight: 700, padding: '2px 8px', borderRadius: 6 }}>Route {r.id}</span>
                </div>
                <div style={{ fontWeight: 600, fontSize: '.88rem', color: '#111827', marginBottom: '0.35rem' }}>{getRouteLabel(r)}</div>
                {(() => { const d = getRouteStatus(r.id); return d
                  ? <div style={{ fontSize: '.78rem', color: '#f59e0b', fontWeight: 500 }}>+{d.delayMinutes} min delay</div>
                  : <div style={{ fontSize: '.78rem', color: '#16a34a', fontWeight: 500 }}>On Time</div>;
                })()}
              </Link>
            ))}
          </div>
        </div>

        {/* Nearby Stops */}
        <div className="landing-nearby" style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '1.25rem' }}>
          <h2 style={{ fontWeight: 700, fontSize: '1rem', color: '#111827', marginBottom: '0.75rem' }}>Nearby Stops</h2>
          <NearbyStops routes={routes} maxStops={4} />
        </div>

        {/* Map */}
        <div className="landing-map" style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid #e5e7eb', minHeight: 220 }}>
          <img src="/all-route-map.jpg" alt="Phnom Penh Bus Route Map" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        </div>

      </div>

      {/* Footer */}
      <footer id="about" style={{ background: '#1a3a52', color: '#e5e7eb', padding: '3rem 2rem 2rem' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', gap: '3rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
          <div style={{ flex: 2, minWidth: 200 }}>
            <div style={{ fontWeight: 800, fontSize: '1.1rem', marginBottom: '0.75rem', color: '#fff' }}>Bus For All</div>
            <p style={{ fontSize: '.875rem', color: '#94a3b8', lineHeight: 1.7, margin: 0 }}>
              Providing safe, reliable, and accessible transportation for everyone in Phnom Penh.
            </p>
          </div>
          <div style={{ flex: 1, minWidth: 130 }}>
            <div style={{ fontWeight: 700, fontSize: '.9rem', marginBottom: '0.75rem', color: '#fff' }}>Quick Links</div>
            {[{ label: 'Routes', to: '/routes' }, { label: 'Alerts', to: '/alerts' }, { label: 'Login', to: '/login' }, { label: 'Register', to: '/register' }].map(l => (
              <div key={l.label} style={{ marginBottom: '0.45rem' }}>
                <Link to={l.to} style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '.875rem' }}>{l.label}</Link>
              </div>
            ))}
          </div>
          <div style={{ flex: 1, minWidth: 130 }}>
            <div style={{ fontWeight: 700, fontSize: '.9rem', marginBottom: '0.75rem', color: '#fff' }}>Support</div>
            {['Contact', 'Privacy Policy', 'Terms of Service', 'Accessibility'].map(l => (
              <div key={l} style={{ marginBottom: '0.45rem' }}>
                <span style={{ color: '#94a3b8', fontSize: '.875rem' }}>{l}</span>
              </div>
            ))}
          </div>
        </div>
        <div style={{ maxWidth: 1100, margin: '0 auto', paddingTop: '1.5rem', borderTop: '1px solid #2a4a6a', textAlign: 'center', fontSize: '.8rem', color: '#64748b' }}>
          2024 Bus For All. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
