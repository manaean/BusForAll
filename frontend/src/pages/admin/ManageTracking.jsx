import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllRoutes } from '../../api/route.api';

const page = { maxWidth: 900, margin: '0 auto', padding: '1.5rem 1rem' };
const card = { background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, padding: '1.25rem 1.5rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', flexWrap: 'wrap' };
const btn = { padding: '6px 16px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: '.83rem', fontWeight: 600 };

export default function ManageTracking() {
  const navigate = useNavigate();
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllRoutes().then(r => { setRoutes(r.data); setLoading(false); });
  }, []);

  return (
    <>

      <div style={page}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', fontSize: '.875rem', fontWeight: 500, padding: '0 0 0.75rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>&#8592; Back</button>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem' }}>Live Tracking Control</h1>

        {loading ? <p style={{ color: '#9ca3af' }}>Loading...</p> : routes.map(route => (
          <div key={route.id} style={card}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span style={{ background: '#1a5a7a', color: '#fff', fontSize: '.75rem', fontWeight: 700, padding: '3px 10px', borderRadius: 6, flexShrink: 0 }}>
                #{route.id}
              </span>
              <span style={{ fontWeight: 700, color: '#111827' }}>{route.name}</span>
            </div>
            <button style={{ ...btn, background: 'var(--primary)', color: '#fff' }} onClick={() => navigate(`/tracker/${route.id}`)}>
              Live Tracking
            </button>
          </div>
        ))}
      </div>
    </>
  );
}
