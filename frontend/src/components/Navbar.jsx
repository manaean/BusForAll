import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar({ onMenuClick }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dropOpen, setDropOpen] = useState(false);

  const handleLogout = () => { logout(); setDropOpen(false); navigate('/'); };

  const linkStyle = { color: '#374151', textDecoration: 'none', fontSize: '.9rem', fontWeight: 500 };

  return (
    <nav style={{ background: '#fff', borderBottom: '1px solid #e5e7eb', padding: '0 2rem', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100 }}>

      {/* Left: Menu button (if provided) + Brand + links */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
        {onMenuClick && (
          <button onClick={onMenuClick} style={{ background: 'none', border: '1px solid #e5e7eb', borderRadius: 8, padding: '0.4rem 0.7rem', cursor: 'pointer', fontSize: '1.1rem', color: '#374151', lineHeight: 1, flexShrink: 0 }}>
            &#9776;
          </button>
        )}
        <Link to="/" style={{ fontWeight: 800, fontSize: '1.15rem', color: '#1a3a52', textDecoration: 'none' }}>Bus For All</Link>
        <div className="nav-links" style={{ display: 'flex', gap: '1.5rem' }}>
          <Link to="/routes" className="nav-link" style={linkStyle}>Routes</Link>
          {user && <Link to="/favourites" className="nav-link" style={linkStyle}>Favourites</Link>}
          <Link to="/alerts" className="nav-link" style={linkStyle}>Alerts</Link>
        </div>
      </div>

      {/* Right: Login or Settings */}
      <div style={{ position: 'relative' }}>
        {!user ? (
          <Link to="/login" style={{ padding: '0.45rem 1.25rem', background: '#1a5a7a', color: '#fff', borderRadius: 8, textDecoration: 'none', fontWeight: 600, fontSize: '.9rem' }}>
            Login
          </Link>
        ) : (
          <>
            <button onClick={() => setDropOpen(o => !o)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'none', border: '1px solid #e5e7eb', borderRadius: 8, padding: '0.4rem 0.9rem', cursor: 'pointer', fontSize: '.9rem', fontWeight: 600, color: '#1a3a52' }}>
              <div style={{ width: 26, height: 26, background: '#1a5a7a', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '.78rem', flexShrink: 0 }}>
                {user.name?.[0]?.toUpperCase()}
              </div>
              Settings <span style={{ fontSize: '.7rem', color: '#9ca3af' }}>▼</span>
            </button>

            {dropOpen && (
              <>
                <div onClick={() => setDropOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 150 }} />
                <div style={{ position: 'absolute', right: 0, top: '110%', background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, boxShadow: '0 4px 20px rgba(0,0,0,.1)', minWidth: 180, zIndex: 200 }}>
                  <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #f3f4f6' }}>
                    <div style={{ fontWeight: 600, fontSize: '.875rem', color: '#111827' }}>{user.name}</div>
                    <div style={{ fontSize: '.75rem', color: '#9ca3af', marginTop: 2 }}>{user.email}</div>
                  </div>
                  <Link to="/profile" onClick={() => setDropOpen(false)}
                    style={{ display: 'block', padding: '0.65rem 1rem', textDecoration: 'none', color: '#374151', fontSize: '.9rem', borderBottom: '1px solid #f3f4f6' }}>
                    My Account
                  </Link>
                  <button onClick={handleLogout}
                    style={{ display: 'block', width: '100%', textAlign: 'left', padding: '0.65rem 1rem', border: 'none', background: 'none', cursor: 'pointer', color: '#dc2626', fontSize: '.9rem', fontWeight: 500 }}>
                    Log Out
                  </button>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </nav>
  );
}
