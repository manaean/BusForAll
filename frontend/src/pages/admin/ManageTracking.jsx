import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllRoutes } from '../../api/route.api';
import { getAllBuses } from '../../api/bus.api';
import api from '../../api/axios';

const page = { maxWidth: 900, margin: '0 auto', padding: '1.5rem 1rem' };
const card = { background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, padding: '1.25rem 1.5rem', marginBottom: '0.75rem' };
const btn = { padding: '6px 16px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: '.83rem', fontWeight: 600 };

export default function ManageTracking() {
  const navigate = useNavigate();
  const [routes, setRoutes] = useState([]);
  const [buses, setBuses] = useState([]);
  const [tracking, setTracking] = useState({});
  const [selectedBus, setSelectedBus] = useState({});
  const [loading, setLoading] = useState(true);

  const loadAll = async () => {
    const [r, b] = await Promise.all([getAllRoutes(), getAllBuses()]);
    setRoutes(r.data);
    setBuses(b.data);

    const statuses = {};
    await Promise.allSettled(r.data.map(async route => {
      try {
        const res = await api.get(`/api/tracking/${route.id}`);
        statuses[route.id] = res.data;
      } catch {
        statuses[route.id] = null;
      }
    }));
    setTracking(statuses);
    setLoading(false);
  };

  useEffect(() => { loadAll(); }, []);

  // Auto-refresh tracking status every 5 seconds
  useEffect(() => {
    const interval = setInterval(async () => {
      const statuses = {};
      await Promise.allSettled(routes.map(async route => {
        try {
          const res = await api.get(`/api/tracking/${route.id}`);
          statuses[route.id] = res.data;
        } catch {
          statuses[route.id] = null;
        }
      }));
      setTracking(statuses);
    }, 5000);
    return () => clearInterval(interval);
  }, [routes]);

  const start = async (routeId) => {
    const busId = selectedBus[routeId];
    if (!busId) { alert('Select a bus first'); return; }
    await api.post(`/api/tracking/${routeId}/start`, { busId: parseInt(busId) });
    loadAll();
  };

  const stop = async (routeId) => {
    await api.post(`/api/tracking/${routeId}/stop`);
    loadAll();
  };

  const reset = async (routeId) => {
    await api.post(`/api/tracking/${routeId}/reset`);
    loadAll();
  };

  const progressBar = (progress) => {
    const pct = Math.round((progress || 0) * 100);
    return (
      <div style={{ marginTop: 8 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.78rem', color: '#6b7280', marginBottom: 3 }}>
          <span>Progress</span><span>{pct}%</span>
        </div>
        <div style={{ height: 8, background: '#e5e7eb', borderRadius: 4, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${pct}%`, background: pct >= 100 ? '#16a34a' : 'var(--primary)', borderRadius: 4, transition: 'width .5s' }} />
        </div>
      </div>
    );
  };

  return (
    <>
      
      <div style={page}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', fontSize: '.875rem', fontWeight: 500, padding: '0 0 0.75rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>&#8592; Back</button>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.35rem' }}>Live Tracking Control</h1>
        <p style={{ color: '#6b7280', fontSize: '.875rem', marginBottom: '1.5rem' }}>
          Start tracking for a route to begin the live bus simulation. Progress updates every 5 seconds.
        </p>

        {loading ? <p style={{ color: '#9ca3af' }}>Loading...</p> : routes.map(route => {
          const t = tracking[route.id];
          const isRunning = t?.isRunning;
          const isIdle = t && !t.isRunning;
          const notStarted = !t;

          return (
            <div key={route.id} style={card}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div style={{ fontWeight: 700, color: '#111827', marginBottom: 2 }}>{route.name}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{
                      padding: '2px 10px', borderRadius: 20, fontSize: '.75rem', fontWeight: 700,
                      background: isRunning ? '#dcfce7' : isIdle ? '#fef9c3' : '#f3f4f6',
                      color: isRunning ? '#16a34a' : isIdle ? '#a16207' : '#6b7280'
                    }}>
                      {isRunning ? 'Running' : isIdle ? 'Stopped' : 'Not Started'}
                    </span>
                    {t?.currentStop && <span style={{ fontSize: '.78rem', color: '#6b7280' }}>At: {t.currentStop.name}</span>}
                    {t?.etaMinutes != null && <span style={{ fontSize: '.78rem', color: 'var(--primary)', fontWeight: 600 }}>ETA: {t.etaMinutes} min</span>}
                  </div>
                  {t && progressBar(t.progress)}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0, flexWrap: 'wrap' }}>
                  {(notStarted || isIdle) && (
                    <>
                      <select
                        value={selectedBus[route.id] || ''}
                        onChange={e => setSelectedBus(s => ({ ...s, [route.id]: e.target.value }))}
                        style={{ padding: '6px 10px', border: '1px solid var(--border)', borderRadius: 6, fontSize: '.83rem' }}>
                        <option value="">Select bus</option>
                        {buses.map(b => <option key={b.id} value={b.id}>{b.plateNumber}</option>)}
                      </select>
                      <button style={{ ...btn, background: '#dcfce7', color: '#16a34a' }} onClick={() => start(route.id)}>
                        Start
                      </button>
                    </>
                  )}
                  {isRunning && (
                    <button style={{ ...btn, background: '#fef2f2', color: '#dc2626' }} onClick={() => stop(route.id)}>
                      Stop
                    </button>
                  )}
                  {(isRunning || isIdle) && (
                    <button style={{ ...btn, background: '#f3f4f6', color: '#374151' }} onClick={() => reset(route.id)}>
                      Reset
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
