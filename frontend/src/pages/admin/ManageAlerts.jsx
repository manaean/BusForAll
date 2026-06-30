import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllRoutes } from '../../api/route.api';
import { getAlerts, createAlert, updateAlert, resolveAlert, deleteAlert } from '../../api/alert.api';

const page = { maxWidth: 900, margin: '0 auto', padding: '1.5rem 1rem' };
const th = { padding: '9px 12px', textAlign: 'left', fontSize: '.82rem', color: 'var(--text-light)', fontWeight: 600, borderBottom: '1px solid var(--border)' };
const td = { padding: '9px 12px', borderBottom: '1px solid #f0f0f0', fontSize: '.9rem' };
const btn = { padding: '0.4rem 0.85rem', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: '.83rem', fontWeight: 600 };

const TYPES = ['delay', 'breakdown', 'cancellation', 'general'];
const emptyForm = { routeId: '', title: '', message: '', type: 'general' };

export default function ManageAlerts() {
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');

  const load = () => Promise.all([getAlerts(false), getAllRoutes()]).then(([a, r]) => { setAlerts(a.data); setRoutes(r.data); });
  useEffect(() => { load(); }, []);

  const submit = async (e) => {
    e.preventDefault(); setError('');
    try {
      const payload = { ...form, routeId: form.routeId ? parseInt(form.routeId) : null };
      if (editing) { await updateAlert(editing, payload); }
      else { await createAlert(payload); }
      setForm(emptyForm); setEditing(null); setShowForm(false); load();
    } catch (err) { setError(err.response?.data?.message || 'Error saving alert'); }
  };

  const doResolve = async (id) => { await resolveAlert(id); load(); };
  const remove = async (id) => { if (!window.confirm('Delete this alert?')) return; await deleteAlert(id); load(); };
  const startEdit = (a) => { setForm({ routeId: a.routeId || '', title: a.title, message: a.message || '', type: a.type }); setEditing(a.id); setShowForm(true); };

  const typeBadge = (t) => {
    const map = { delay: ['#fff3e0', '#e65100'], breakdown: ['#fce4ec', '#b71c1c'], cancellation: ['#f3e5f5', '#6a1b9a'], general: ['#e3f2fd', '#0d47a1'] };
    const [bg, color] = map[t] || ['#f5f5f5', '#555'];
    return <span style={{ background: bg, color, padding: '2px 10px', borderRadius: 20, fontSize: '.78rem', fontWeight: 600 }}>{t}</span>;
  };

  return (
    <>
      
      <div style={page}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', fontSize: '.875rem', fontWeight: 500, padding: '0 0 0.75rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>&#8592; Back</button>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Manage Alerts</h1>
          <button style={{ ...btn, background: 'var(--primary)', color: '#fff' }} onClick={() => { setForm(emptyForm); setEditing(null); setShowForm(!showForm); }}>
            {showForm ? 'Cancel' : 'Add Alert'}
          </button>
        </div>

        {showForm && (
          <form onSubmit={submit} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10, padding: '1.25rem', marginBottom: '1rem' }}>
            <h3 style={{ fontWeight: 600, marginBottom: '0.75rem' }}>{editing ? 'Edit Alert' : 'New Alert'}</h3>
            {error && <p style={{ color: 'var(--danger)', marginBottom: '0.5rem', fontSize: '.875rem' }}>{error}</p>}
            <select value={form.routeId} onChange={e => setForm(f => ({ ...f, routeId: e.target.value }))}
              style={{ width: '100%', padding: '0.6rem', border: '1px solid var(--border)', borderRadius: 6, marginBottom: '0.5rem', fontSize: '.9rem' }}>
              <option value="">All routes (system-wide)</option>
              {routes.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
            </select>
            <input required placeholder="Title" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              style={{ width: '100%', padding: '0.6rem', border: '1px solid var(--border)', borderRadius: 6, marginBottom: '0.5rem', fontSize: '.9rem' }} />
            <textarea placeholder="Message (optional)" value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
              style={{ width: '100%', padding: '0.6rem', border: '1px solid var(--border)', borderRadius: 6, marginBottom: '0.5rem', fontSize: '.9rem', resize: 'vertical', minHeight: 60 }} />
            <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
              style={{ width: '100%', padding: '0.6rem', border: '1px solid var(--border)', borderRadius: 6, marginBottom: '0.75rem', fontSize: '.9rem' }}>
              {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <button type="submit" style={{ ...btn, background: 'var(--primary)', color: '#fff' }}>{editing ? 'Save Changes' : 'Create Alert'}</button>
          </form>
        )}

        <div className="table-scroll" style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr><th style={th}>Title</th><th style={th}>Type</th><th style={th}>Route</th><th style={th}>Status</th><th style={th}>Actions</th></tr></thead>
            <tbody>
              {alerts.length === 0 ? <tr><td colSpan={5} style={{ ...td, color: 'var(--text-light)', textAlign: 'center' }}>No alerts found.</td></tr> :
                alerts.map(a => (
                  <tr key={a.id}>
                    <td style={{ ...td, fontWeight: 500 }}>{a.title}</td>
                    <td style={td}>{typeBadge(a.type)}</td>
                    <td style={{ ...td, color: 'var(--text-light)' }}>{a.Route?.name || 'System'}</td>
                    <td style={td}><span style={{ color: a.isActive ? 'var(--success)' : 'var(--text-light)', fontWeight: 500, fontSize: '.82rem' }}>{a.isActive ? 'Active' : 'Resolved'}</span></td>
                    <td style={td}>
                      <button style={{ ...btn, background: '#e3f0ff', color: 'var(--primary)', marginRight: 6 }} onClick={() => startEdit(a)}>Edit</button>
                      {a.isActive && <button style={{ ...btn, background: '#e8f5e9', color: '#2e7d32', marginRight: 6 }} onClick={() => doResolve(a.id)}>Resolve</button>}
                      <button style={{ ...btn, background: '#ffe3e3', color: 'var(--danger)' }} onClick={() => remove(a.id)}>Delete</button>
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
