import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import { useEffect } from 'react';

const sidebar = [
  { label: 'Profile', to: '/profile' },
  { label: 'Favourites', to: '/favourites' },
];

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [favs, setFavs] = useState([]);

  useEffect(() => { api.get('/api/favourites').then(r => setFavs(r.data.slice(0, 3))).catch(() => {}); }, []);

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh' }}>
      
      <div className="profile-layout page-container">

        {/* Sidebar */}
        <div className="profile-sidebar" style={{ background: '#fff', borderRadius: 14, border: '1px solid #e5e7eb', padding: '1rem' }}>
          {sidebar.map(item => (
            <Link key={item.to} to={item.to}
              style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '10px 12px', borderRadius: 8, textDecoration: 'none', color: '#374151', fontWeight: 500, fontSize: '.9rem', marginBottom: 4, background: window.location.pathname === item.to ? '#eff6ff' : 'transparent' }}>
              {item.label}
            </Link>
          ))}
          <button onClick={handleLogout}
            style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '10px 12px', borderRadius: 8, border: 'none', background: 'none', cursor: 'pointer', color: 'var(--danger)', fontWeight: 500, fontSize: '.9rem', width: '100%', marginTop: 8 }}>
            Log Out
          </button>
        </div>

        {/* Main */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', fontSize: '.875rem', fontWeight: 500, padding: '0 0 0.75rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>&#8592; Back</button>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#111827', marginBottom: '0.25rem' }}>My Account</h1>
          <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>Manage your profile and your favourite routes.</p>

          {/* Profile Info */}
          <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e5e7eb', padding: '1.75rem', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h2 style={{ fontWeight: 700, fontSize: '1rem', color: '#111827' }}>Profile Information</h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1.5rem' }}>
              {[
                { label: 'Full Name', value: user?.name },
                { label: 'Email', value: user?.email },
                { label: 'Role', value: user?.role },
              ].map(f => (
                <div key={f.label}>
                  <div style={{ fontSize: '.78rem', color: '#9ca3af', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '.05em' }}>{f.label}</div>
                  <div style={{ fontWeight: 600, color: '#111827', fontSize: '.95rem' }}>{f.value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Favourite Routes */}
          <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e5e7eb', padding: '1.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div>
                <h2 style={{ fontWeight: 700, fontSize: '1rem', color: '#111827' }}>Favourite Routes</h2>
                <p style={{ fontSize: '.8rem', color: '#9ca3af', marginTop: 2 }}>Your frequently used routes</p>
              </div>
              <Link to="/favourites" style={{ color: 'var(--primary)', fontSize: '.875rem', fontWeight: 600, textDecoration: 'none' }}>View All</Link>
            </div>
            {favs.length === 0 ? (
              <p style={{ color: '#9ca3af', fontSize: '.875rem' }}>No saved routes yet. <Link to="/routes" style={{ color: 'var(--primary)' }}>Browse routes</Link></p>
            ) : favs.map((f, i) => (
              <Link key={f.routeId} to={`/schedule/${f.routeId}`} style={{ textDecoration: 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.85rem 0', borderBottom: i < favs.length - 1 ? '1px solid #f3f4f6' : 'none' }}>
                  <div style={{ width: 38, height: 38, borderRadius: 8, background: '#1565C0', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '.9rem', flexShrink: 0 }}>
                    {i + 1}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, color: '#111827', fontSize: '.9rem' }}>{f.Route?.name}</div>
                  </div>
                  <span style={{ color: '#d1d5db', fontSize: '1.2rem' }}>☆</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
