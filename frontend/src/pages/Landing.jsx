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
        backgroundImage: "url('/bus-hero.png')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
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
          <form onSubmit={handleSearch} style={{ display: 'flex', width: '100%', maxWidth: 520, minHeight: 44, background: '#fff', borderRadius: 9, overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,.2)' }}>
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Where are you going?"
              style={{ flex: 1, border: 'none', padding: '0.7rem 1rem', fontSize: '.875rem', outline: 'none', color: '#374151', background: 'transparent' }}
            />
            <button type="submit" style={{ padding: '0 1rem', background: '#1a5a7a', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '.85rem', whiteSpace: 'nowrap' }}>
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
        <div className="landing-live-status app-card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ fontWeight: 700, fontSize: '1rem', color: '#111827', margin: 0 }}>Live Status</h2>
            <span className="status-badge status-badge-success">All Systems Go</span>
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
        <div className="landing-routes app-card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ fontWeight: 700, fontSize: '1rem', color: '#111827', margin: 0 }}>Routes</h2>
            <Link to="/routes" style={{ color: '#1a5a7a', fontSize: '.85rem', fontWeight: 600, textDecoration: 'none' }}>View All</Link>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            {routes.length === 0 ? (
              <p style={{ color: '#9ca3af', fontSize: '.875rem', gridColumn: 'span 2' }}>No routes available.</p>
            ) : routes.slice(0, 4).map(r => (
              <Link key={r.id} className="route-card" to={`/schedule/${r.id}`} style={{ textDecoration: 'none', padding: '0.9rem 1rem', display: 'block' }}>
                <div style={{ marginBottom: '0.4rem' }}>
                  <span style={{ background: '#1a5a7a', color: '#fff', fontSize: '.72rem', fontWeight: 700, padding: '2px 8px', borderRadius: 6 }}>Route {r.id}</span>
                </div>
                <div style={{ fontWeight: 600, fontSize: '.88rem', color: '#111827', marginBottom: '0.35rem' }}>{getRouteLabel(r)}</div>
                {(() => { const d = getRouteStatus(r.id); return d
                  ? <span className="status-badge status-badge-warning">+{d.delayMinutes} min delay</span>
                  : <span className="status-badge status-badge-success">On Time</span>;
                })()}
              </Link>
            ))}
          </div>
        </div>

        {/* Nearby Stops */}
        <div className="landing-nearby app-card" style={{ padding: '1.25rem' }}>
          <h2 style={{ fontWeight: 700, fontSize: '1rem', color: '#111827', marginBottom: '0.75rem' }}>Nearby Stops</h2>
          <NearbyStops routes={routes} maxStops={4} />
        </div>

        {/* Map */}
        <div className="landing-map app-card" style={{ overflow: 'hidden', minHeight: 220 }}>
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
            <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.45rem', fontSize: '.875rem' }}>
              <a href="mailto:busforall@gmail.com" style={{ color: '#cbd5e1', textDecoration: 'none' }}>✉ busforall@gmail.com</a>
              <a href="tel:+85512345678" style={{ color: '#cbd5e1', textDecoration: 'none' }}>☎ +855 12 345 678</a>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
              {['f', '◎', '𝕏'].map((icon, index) => (
                <a key={icon} href="#" aria-label={['Facebook', 'Instagram', 'X'][index]} style={{ width: 32, height: 32, borderRadius: '50%', background: '#2a4a6a', color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none', fontWeight: 700, fontSize: index === 1 ? '1.1rem' : '.85rem' }}>
                  {icon}
                </a>
              ))}
            </div>
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
            <div style={{ fontWeight: 700, fontSize: '.9rem', marginBottom: '0.75rem', color: '#fff' }}>Get the App</div>
            <a href="#" style={{ display: 'block', width: 'fit-content', marginBottom: '0.6rem', padding: '0.55rem 0.8rem', borderRadius: 8, background: '#fff', color: '#1a3a52', textDecoration: 'none', fontSize: '.78rem', fontWeight: 700 }}>
              ▶ Google Play
            </a>
            <a href="#" style={{ display: 'block', width: 'fit-content', padding: '0.55rem 0.8rem', borderRadius: 8, background: '#fff', color: '#1a3a52', textDecoration: 'none', fontSize: '.78rem', fontWeight: 700 }}>
              ● App Store
            </a>
          </div>
        </div>
        <div style={{ maxWidth: 1100, margin: '0 auto', paddingTop: '1.5rem', borderTop: '1px solid #2a4a6a', textAlign: 'center', fontSize: '.8rem', color: '#64748b' }}>
          © {new Date().getFullYear()} Bus For All. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
