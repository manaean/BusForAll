import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';

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

export default function Dashboard() {
  const [stats, setStats] = useState({});

  useEffect(() => {
    Promise.allSettled([
      api.get('/api/routes'),
      api.get('/api/buses'),
      api.get('/api/users'),
      api.get('/api/alerts?active=true'),
      api.get('/api/delays?active=true'),
    ]).then(([routes, buses, users, alerts, delays]) => {
      setStats({
        routes: routes.status === 'fulfilled' ? routes.value.data.length : 0,
        buses: buses.status === 'fulfilled' ? buses.value.data.length : 0,
        users: users.status === 'fulfilled' ? users.value.data.length : 0,
        alerts: alerts.status === 'fulfilled' ? alerts.value.data.length : 0,
        delays: delays.status === 'fulfilled' ? delays.value.data.length : 0,
      });
    });
  }, []);

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 style={{ fontWeight: 800, fontSize: '1.55rem', color: '#111827', margin: 0 }}>Admin Dashboard</h1>
        <p style={{ color: '#6b7280', fontSize: '.875rem', marginTop: '0.25rem', marginBottom: 0 }}>System overview and quick navigation.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '0.75rem', maxWidth: 900, marginBottom: '2rem' }}>
        {[
          { label: 'Routes', value: stats.routes, color: '#1a5a7a' },
          { label: 'Buses', value: stats.buses, color: '#1a5a7a' },
          { label: 'Users', value: stats.users, color: '#1a5a7a' },
          { label: 'Active Alerts', value: stats.alerts, color: '#f59e0b' },
          { label: 'Active Delays', value: stats.delays, color: '#ef4444' },
        ].map(s => (
          <div key={s.label} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '1.25rem' }}>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: s.color }}>{s.value ?? '-'}</div>
            <div style={{ fontSize: '.82rem', color: '#6b7280', marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#111827', marginBottom: '0.75rem' }}>Management</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.6rem', maxWidth: 900 }}>
        {navLinks.map(l => (
          <Link key={l.to} to={l.to} style={{ display: 'block', background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '0.85rem 1rem', textDecoration: 'none', color: '#1a5a7a', fontWeight: 500, fontSize: '.9rem' }}>
            {l.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
