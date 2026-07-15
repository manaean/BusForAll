import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

const navLinks = [
  { to: '/admin/tracking', label: 'Live Tracking' },
  { to: '/admin/routes', label: 'Manage Routes' },
  { to: '/admin/stops', label: 'Manage Stops' },
  { to: '/admin/buses', label: 'Manage Buses' },
  { to: '/admin/schedules', label: 'Manage Schedules' },
  { to: '/admin/drivers', label: 'Manage Drivers' },
  { to: '/admin/assignments', label: 'Manage Assignments' },
  { to: '/admin/delays', label: 'Manage Delays' },
  { to: '/admin/alerts', label: 'Manage Alerts' },
  { to: '/admin/users', label: 'Manage Users' },
];

const metaItemStyle = { display: 'flex', flexDirection: 'column', gap: 2 };
const metaLabelStyle = { fontSize: '.72rem', color: 'rgba(255,255,255,0.65)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.04em' };
const metaValueStyle = { fontSize: '.9rem', color: '#fff', fontWeight: 700 };

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({});
  const [now, setNow] = useState(new Date());
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    Promise.allSettled([
      api.get('/api/routes'),
      api.get('/api/stops'),
      api.get('/api/buses'),
      api.get('/api/drivers'),
      api.get('/api/users'),
      api.get('/api/alerts?active=true'),
      api.get('/api/delays?active=true'),
    ]).then(([routes, stops, buses, drivers, users, alerts, delays]) => {
      const busList = buses.status === 'fulfilled' ? buses.value.data : [];
      setStats({
        routes: routes.status === 'fulfilled' ? routes.value.data.length : 0,
        stops: stops.status === 'fulfilled' ? stops.value.data.length : 0,
        buses: busList.length,
        busesOperating: busList.filter(b => b.status === 'active').length,
        drivers: drivers.status === 'fulfilled' ? drivers.value.data.length : 0,
        users: users.status === 'fulfilled' ? users.value.data.length : 0,
        alerts: alerts.status === 'fulfilled' ? alerts.value.data.length : 0,
        delays: delays.status === 'fulfilled' ? delays.value.data.length : 0,
      });
      setLastUpdated(new Date());
    });
  }, []);

  const dateStr = now.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const timeStr = now.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const lastUpdatedStr = lastUpdated ? lastUpdated.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }) : '—';

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{
        marginBottom: '1.75rem', background: 'linear-gradient(135deg, #1a5a7a 0%, #123f57 100%)',
        borderRadius: 16, padding: '1.75rem 2rem',
      }}>
        <h1 style={{ fontWeight: 800, fontSize: '1.55rem', color: '#fff', margin: 0 }}>Welcome back, {user?.name || 'Admin'}.</h1>
        <div style={{ display: 'flex', gap: '1.75rem', flexWrap: 'wrap', marginTop: '1.1rem' }}>
          <div style={metaItemStyle}>
            <span style={metaLabelStyle}>Today's Date</span>
            <span style={metaValueStyle}>{dateStr}</span>
          </div>
          <div style={metaItemStyle}>
            <span style={metaLabelStyle}>Current Time</span>
            <span style={metaValueStyle}>{timeStr}</span>
          </div>
          <div style={metaItemStyle}>
            <span style={metaLabelStyle}>Last System Update</span>
            <span style={metaValueStyle}>{lastUpdatedStr}</span>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '0.75rem', maxWidth: 900, marginBottom: '2rem' }}>
        {[
          { label: 'Routes', value: stats.routes, color: '#1a5a7a' },
          { label: 'Bus Stops', value: stats.stops, color: '#1a5a7a' },
          { label: 'Drivers', value: stats.drivers, color: '#1a5a7a' },
          { label: 'Users', value: stats.users, color: '#1a5a7a' },
          { label: 'Buses', value: stats.buses, color: '#1a5a7a' },
          { label: 'Buses Operating', value: stats.busesOperating, color: '#2E7D32' },
          { label: 'Active Alerts', value: stats.alerts, color: '#f59e0b' },
          { label: 'Active Delays', value: stats.delays, color: '#ef4444' },
        ].map(s => (
          <div key={s.label} className="dashboard-stat-card" style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '1.25rem' }}>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: s.color }}>{s.value ?? '-'}</div>
            <div style={{ fontSize: '.82rem', color: '#6b7280', marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#111827', marginBottom: '0.75rem' }}>Management</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.6rem', maxWidth: 900 }}>
        {navLinks.map(l => (
          <Link key={l.to} to={l.to} className="dashboard-nav-button" style={{ display: 'block', background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '0.85rem 1rem', textDecoration: 'none', color: '#1a5a7a', fontWeight: 500, fontSize: '.9rem' }}>
            {l.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
