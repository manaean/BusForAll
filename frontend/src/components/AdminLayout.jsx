import { useState } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import { useAuth } from '../context/AuthContext';

const navLinks = [
  { to: '/admin', label: 'Dashboard' },
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

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isActive = (to) => location.pathname === to;

  return (
    <div style={{ minHeight: '100vh', background: '#f1f5f9' }}>
      <Navbar onMenuClick={() => setSidebarOpen(true)} />

      {sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', zIndex: 200 }} />
      )}

      {/* Sidebar */}
      <div style={{ width: 240, background: '#fff', borderRight: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column', position: 'fixed', top: 60, left: 0, height: 'calc(100vh - 60px)', zIndex: 300, transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)', transition: 'transform 0.25s ease' }}>

        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1rem', color: '#1a3a52' }}>Bus For All</div>
            <div style={{ fontSize: '.73rem', color: '#9ca3af', marginTop: 2 }}>Admin Portal</div>
          </div>
          <button onClick={() => setSidebarOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.25rem', color: '#9ca3af', lineHeight: 1 }}>&#10005;</button>
        </div>

        <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #f0f0f0', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: 38, height: 38, background: '#1a5a7a', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '.95rem', flexShrink: 0 }}>
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: '.875rem', color: '#111827' }}>{user?.name}</div>
            <div style={{ fontSize: '.73rem', color: '#9ca3af' }}>Administrator</div>
          </div>
        </div>

        <nav style={{ flex: 1, padding: '1rem 0.75rem', overflowY: 'auto' }}>
          {navLinks.map(item => (
            <Link key={item.to} to={item.to} onClick={() => setSidebarOpen(false)} style={{
              display: 'block', padding: '0.6rem 0.85rem', borderRadius: 8,
              textDecoration: 'none', fontSize: '.875rem',
              fontWeight: isActive(item.to) ? 600 : 500,
              color: isActive(item.to) ? '#fff' : '#374151',
              background: isActive(item.to) ? '#1a5a7a' : 'transparent',
              marginBottom: '0.2rem',
            }}>
              {item.label}
            </Link>
          ))}
        </nav>

        <div style={{ padding: '1rem 0.75rem', borderTop: '1px solid #f0f0f0' }}>
          <button onClick={() => { logout(); navigate('/'); }} style={{ width: '100%', textAlign: 'left', padding: '0.6rem 0.85rem', borderRadius: 8, border: 'none', background: 'none', fontSize: '.9rem', color: '#dc2626', fontWeight: 500, cursor: 'pointer' }}>
            Log Out
          </button>
        </div>
      </div>

      <Outlet />
    </div>
  );
}
