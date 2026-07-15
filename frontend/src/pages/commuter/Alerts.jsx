import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAlerts } from '../../api/alert.api';

const TYPE_STYLE = {
  delay:      { bg: '#fef2f2', border: '#fecaca', badge: '#dc2626', label: 'Delayed' },
  breakdown:  { bg: '#fff7ed', border: '#fed7aa', badge: '#ea580c', label: 'Breakdown' },
  cancelled:  { bg: '#fdf4ff', border: '#e9d5ff', badge: '#9333ea', label: 'Cancelled' },
  notice:     { bg: '#eff6ff', border: '#bfdbfe', badge: '#2563eb', label: 'Notice' },
};

export default function Alerts() {
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { getAlerts(false).then(r => { setAlerts(r.data); setLoading(false); }); }, []);

  const active = alerts.filter(a => a.isActive);
  const resolved = alerts.filter(a => !a.isActive);

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh' }}>
      
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '2rem 1.5rem' }}>
        <button onClick={() => navigate(-1)} className="back-link" style={{ background: 'none', border: 'none', borderRadius: 999, cursor: 'pointer', color: '#6b7280', fontSize: '.875rem', fontWeight: 600, padding: '0.4rem 0.85rem', margin: '0 0 0.75rem -0.85rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          &#8592; <span className="back-link-text">Back</span>
        </button>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#111827', marginBottom: '0.25rem' }}>Delay Notifications</h1>
            <p style={{ color: '#6b7280', fontSize: '.9rem' }}>Stay updated with the latest delays and service changes.</p>
          </div>
          {active.length > 0 && (
            <span style={{ background: '#fef2f2', color: '#dc2626', padding: '4px 12px', borderRadius: 20, fontSize: '.8rem', fontWeight: 700, border: '1px solid #fecaca' }}>
              {active.length} Active
            </span>
          )}
        </div>

        {loading ? (
          <p style={{ color: '#9ca3af', textAlign: 'center', padding: '3rem' }}>Loading...</p>
        ) : alerts.length === 0 ? (
          <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 12, padding: '2rem', textAlign: 'center' }}>
            <div style={{ fontWeight: 600, color: '#16a34a', marginBottom: 4 }}>No alerts at this time.</div>
            <div style={{ color: '#6b7280', fontSize: '.875rem' }}>All routes are operating normally.</div>
          </div>
        ) : (
          <>
            {active.length > 0 && (
              <>
                <h2 style={{ fontSize: '.875rem', fontWeight: 700, color: '#374151', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '.05em' }}>Active Alerts</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem' }}>
                  {active.map(a => {
                    const s = TYPE_STYLE[a.type] || TYPE_STYLE.notice;
                    return (
                      <div key={a.id} style={{ background: s.bg, border: `1px solid ${s.border}`, borderRadius: 12, padding: '1.25rem 1.5rem', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                        <div style={{ width: 10, height: 10, borderRadius: '50%', background: s.badge, marginTop: 5, flexShrink: 0 }} />
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap' }}>
                            <div style={{ fontWeight: 700, color: '#111827', fontSize: '.95rem' }}>{a.title}</div>
                            <span style={{ background: s.badge, color: '#fff', padding: '2px 10px', borderRadius: 20, fontSize: '.75rem', fontWeight: 700, flexShrink: 0 }}>{s.label}</span>
                          </div>
                          {a.message && <p style={{ color: '#4b5563', fontSize: '.875rem', marginTop: 4, lineHeight: 1.5 }}>{a.message}</p>}
                          {a.Route && <div style={{ fontSize: '.78rem', color: '#6b7280', marginTop: 6, fontWeight: 500 }}>Route: {a.Route.name}</div>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            {resolved.length > 0 && (
              <>
                <h2 style={{ fontSize: '.875rem', fontWeight: 700, color: '#9ca3af', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '.05em' }}>Resolved</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  {resolved.map(a => (
                    <div key={a.id} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '1rem 1.5rem', display: 'flex', gap: '1rem', alignItems: 'center', opacity: .65 }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#9ca3af', flexShrink: 0 }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, color: '#374151', fontSize: '.875rem' }}>{a.title}</div>
                        {a.Route && <div style={{ fontSize: '.78rem', color: '#9ca3af', marginTop: 2 }}>Route: {a.Route.name}</div>}
                      </div>
                      <span style={{ fontSize: '.75rem', color: '#9ca3af', fontWeight: 500 }}>Resolved</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
