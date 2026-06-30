import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllRoutes } from '../../api/route.api';
import { getAllDelays, createDelay, resolveDelay, deleteDelay } from '../../api/driver.api';

const page = { maxWidth: 900, margin: '0 auto', padding: '1.5rem 1rem' };
const th = { padding: '9px 12px', textAlign: 'left', fontSize: '.82rem', color: 'var(--text-light)', fontWeight: 600, borderBottom: '1px solid var(--border)' };
const td = { padding: '9px 12px', borderBottom: '1px solid #f0f0f0', fontSize: '.9rem' };
const btn = { padding: '0.4rem 0.85rem', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: '.83rem', fontWeight: 600 };

const emptyForm = { routeId: '', delayMinutes: '', reason: '' };

export default function ManageDelays() {
  const navigate = useNavigate();
  const [delays, setDelays] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');

  const load = () => Promise.all([getAllDelays(), getAllRoutes()]).then(([d, r]) => { setDelays(d.data); setRoutes(r.data); });
  useEffect(() => { load(); }, []);

  const submit = async (e) => {
    e.preventDefault(); setError('');
    try {
      await createDelay({ routeId: parseInt(form.routeId), delayMinutes: parseInt(form.delayMinutes), reason: form.reason });
      setForm(emptyForm); setShowForm(false); load();
    } catch (err) { setError(err.response?.data?.message || 'Error creating delay'); }
  };

  const doResolve = async (id) => { await resolveDelay(id); load(); };
  const remove = async (id) => { if (!window.confirm('Delete this delay?')) return; await deleteDelay(id); load(); };

  const routeName = (id) => routes.find(r => r.id === id)?.name || id;

  return (
    <>
      
      <div style={page}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', fontSize: '.875rem', fontWeight: 500, padding: '0 0 0.75rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>&#8592; Back</button>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Manage Delays</h1>
          <button style={{ ...btn, background: 'var(--primary)', color: '#fff' }} onClick={() => { setForm(emptyForm); setShowForm(!showForm); }}>
            {showForm ? 'Cancel' : 'Report Delay'}
          </button>
        </div>

        {showForm && (
          <form onSubmit={submit} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10, padding: '1.25rem', marginBottom: '1rem' }}>
            <h3 style={{ fontWeight: 600, marginBottom: '0.75rem' }}>New Delay</h3>
            {error && <p style={{ color: 'var(--danger)', marginBottom: '0.5rem', fontSize: '.875rem' }}>{error}</p>}
            <select required value={form.routeId} onChange={e => setForm(f => ({ ...f, routeId: e.target.value }))}
              style={{ width: '100%', padding: '0.6rem', border: '1px solid var(--border)', borderRadius: 6, marginBottom: '0.5rem', fontSize: '.9rem' }}>
              <option value="">Select route</option>
              {routes.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
            </select>
            <input required type="number" min="1" placeholder="Delay minutes" value={form.delayMinutes} onChange={e => setForm(f => ({ ...f, delayMinutes: e.target.value }))}
              style={{ width: '100%', padding: '0.6rem', border: '1px solid var(--border)', borderRadius: 6, marginBottom: '0.5rem', fontSize: '.9rem' }} />
            <input placeholder="Reason (optional)" value={form.reason} onChange={e => setForm(f => ({ ...f, reason: e.target.value }))}
              style={{ width: '100%', padding: '0.6rem', border: '1px solid var(--border)', borderRadius: 6, marginBottom: '0.75rem', fontSize: '.9rem' }} />
            <button type="submit" style={{ ...btn, background: 'var(--primary)', color: '#fff' }}>Report Delay</button>
          </form>
        )}

        <div className="table-scroll" style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr><th style={th}>Route</th><th style={th}>Delay (min)</th><th style={th}>Reason</th><th style={th}>Status</th><th style={th}>Actions</th></tr></thead>
            <tbody>
              {delays.length === 0 ? <tr><td colSpan={5} style={{ ...td, color: 'var(--text-light)', textAlign: 'center' }}>No delays found.</td></tr> :
                delays.map(d => (
                  <tr key={d.id}>
                    <td style={{ ...td, fontWeight: 500 }}>{routeName(d.routeId)}</td>
                    <td style={{ ...td, color: 'var(--accent)', fontWeight: 600 }}>+{d.delayMinutes}</td>
                    <td style={{ ...td, color: 'var(--text-light)' }}>{d.reason || '-'}</td>
                    <td style={td}><span style={{ color: d.isActive ? 'var(--danger)' : 'var(--text-light)', fontWeight: 500, fontSize: '.82rem' }}>{d.isActive ? 'Active' : 'Resolved'}</span></td>
                    <td style={td}>
                      {d.isActive && <button style={{ ...btn, background: '#e8f5e9', color: '#2e7d32', marginRight: 6 }} onClick={() => doResolve(d.id)}>Resolve</button>}
                      <button style={{ ...btn, background: '#ffe3e3', color: 'var(--danger)' }} onClick={() => remove(d.id)}>Delete</button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
