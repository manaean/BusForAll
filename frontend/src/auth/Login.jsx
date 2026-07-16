import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { login as loginApi } from '../api/auth.api';

const bg = {
  minHeight: '100vh',
  background: '#f8fafc',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '2rem 1rem',
};

const inp = {
  width: '100%',
  padding: '0.75rem 1rem',
  border: '1.5px solid #d1d5db',
  borderRadius: 8,
  fontSize: '.95rem',
  outline: 'none',
  background: '#f0f5f8',
  boxSizing: 'border-box',
};

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await loginApi(form);
      login(data.user, data.token);
      if (data.user.role === 'admin') navigate('/admin');
      else if (data.user.role === 'driver') navigate('/driver');
      else navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally { setLoading(false); }
  };

  return (
    <div style={bg}>
      {/* Logo */}
      <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
        <div style={{ width: 64, height: 64, background: '#1a5a7a', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.75rem', boxShadow: '0 4px 16px rgba(26,90,122,.3)' }}>
          <span style={{ color: '#fff', fontWeight: 900, fontSize: '.7rem', letterSpacing: 1 }}>BUS</span>
        </div>
        <div style={{ fontWeight: 900, fontSize: '1.6rem', color: '#1a3a52' }}>Bus For All</div>
      </div>

      {/* Card */}
      <div style={{ background: '#fff', borderRadius: 16, padding: '2rem 2.25rem', width: '100%', maxWidth: 440, boxShadow: '0 4px 32px rgba(0,0,0,.1)' }}>
        <div style={{ marginBottom: '1.25rem' }}>
          <Link to="/" className="back-link" style={{ fontSize: '.85rem', color: '#5a7a90', textDecoration: 'none', fontWeight: 600, borderRadius: 999, padding: '0.4rem 0.85rem', margin: '-0.4rem 0 -0.4rem -0.85rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
            &#8592; <span className="back-link-text">Back</span>
          </Link>
        </div>
        <h2 style={{ fontWeight: 800, fontSize: '1.35rem', color: '#0f172a', marginBottom: '1.5rem' }}>Welcome back</h2>

        {error && (
          <div style={{ background: '#fef2f2', color: '#dc2626', padding: '0.7rem 1rem', borderRadius: 8, marginBottom: '1rem', fontSize: '.875rem', border: '1px solid #fecaca' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ fontSize: '.85rem', fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>
              Email or Phone Number
            </label>
            <input
              style={inp}
              type="email"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              required
              placeholder="name@example.com"
            />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <label style={{ fontSize: '.85rem', fontWeight: 600, color: '#374151' }}>Password</label>
              <span style={{ fontSize: '.8rem', color: '#1a5a7a', fontWeight: 600, cursor: 'default' }}>Forgot?</span>
            </div>
            <div style={{ position: 'relative' }}>
              <input
                style={{ ...inp, paddingRight: '3.5rem' }}
                type={showPw ? 'text' : 'password'}
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                required
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPw(p => !p)}
                style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', fontSize: '.8rem', fontWeight: 600 }}
              >
                {showPw ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.5rem', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={remember}
              onChange={e => setRemember(e.target.checked)}
              style={{ width: 16, height: 16, accentColor: '#1a5a7a' }}
            />
            <span style={{ fontSize: '.88rem', color: '#374151' }}>Remember this device</span>
          </label>

          <button
            type="submit"
            disabled={loading}
            style={{ width: '100%', padding: '0.85rem', background: '#1a5a7a', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
          >
            {loading ? 'Signing in...' : <><span>Log In</span><span>&#8594;</span></>}
          </button>
        </form>

        <hr style={{ border: 'none', borderTop: '1px solid #e5e7eb', margin: '1.5rem 0' }} />

        <p style={{ textAlign: 'center', fontSize: '.875rem', color: '#6b7280', margin: 0 }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: '#1a5a7a', fontWeight: 700, textDecoration: 'none' }}>Register</Link>
        </p>
      </div>

    </div>
  );
}
