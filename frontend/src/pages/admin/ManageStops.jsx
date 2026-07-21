import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { getAllRoutes, getRouteStops, addStopToRoute } from '../../api/route.api';

const page = { maxWidth: 900, margin: '0 auto', padding: '1.5rem 1rem' };
const th = { padding: '9px 12px', textAlign: 'left', fontSize: '.82rem', color: 'var(--text-light)', fontWeight: 600, borderBottom: '1px solid var(--border)' };
const td = { padding: '9px 12px', borderBottom: '1px solid #f0f0f0', fontSize: '.9rem' };
const btn = { padding: '0.4rem 0.85rem', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: '.83rem', fontWeight: 600 };
const inputStyle = { width: '100%', padding: '0.6rem', border: '1px solid var(--border)', borderRadius: 6, marginBottom: '0.5rem', fontSize: '.9rem' };

const emptyForm = { name: '', latitude: '', longitude: '', routeId: '' };

export default function ManageStops() {
  const navigate = useNavigate();
  const [stops, setStops] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');

  const load = () => api.get('/api/stops').then(r => setStops(r.data));
  useEffect(() => { load(); getAllRoutes().then(r => setRoutes(r.data)); }, []);

  const submit = async (e) => {
    e.preventDefault(); setError('');
    try {
      const payload = { name: form.name, latitude: parseFloat(form.latitude), longitude: parseFloat(form.longitude) };
      let stopId = editing;
      if (editing) { await api.put(`/api/stops/${editing}`, payload); }
      else { const r = await api.post('/api/stops', payload); stopId = r.data.id; }

      if (form.routeId) {
        const existing = await getRouteStops(form.routeId);
        const nextOrder = existing.data.reduce((max, s) => Math.max(max, s.RouteStop.stopOrder), 0) + 1;
        await addStopToRoute(form.routeId, { stopId, stopOrder: nextOrder });
      }

      setForm(emptyForm); setEditing(null); setShowForm(false); load();
    } catch (err) { setError(err.response?.data?.message || 'Error saving stop'); }
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this stop?')) return;
    await api.delete(`/api/stops/${id}`); load();
  };

  const startEdit = (s) => { setForm({ name: s.name, latitude: s.latitude, longitude: s.longitude, routeId: '' }); setEditing(s.id); setShowForm(true); };

  return (
    <>

      <div style={page}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', fontSize: '.875rem', fontWeight: 500, padding: '0 0 0.75rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>&#8592; Back</button>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Manage Stops</h1>
          <button style={{ ...btn, background: 'var(--primary)', color: '#fff' }} onClick={() => { setForm(emptyForm); setEditing(null); setShowForm(!showForm); }}>
            {showForm ? 'Cancel' : 'Add Stop'}
          </button>
        </div>

        {showForm && (
          <form onSubmit={submit} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10, padding: '1.25rem', marginBottom: '1rem' }}>
            <h3 style={{ fontWeight: 600, marginBottom: '0.75rem' }}>{editing ? 'Edit Stop' : 'New Stop'}</h3>
            {error && <p style={{ color: 'var(--danger)', marginBottom: '0.5rem', fontSize: '.875rem' }}>{error}</p>}
            {[['name', 'Stop name', 'text'], ['latitude', 'Latitude', 'number'], ['longitude', 'Longitude', 'number']].map(([k, ph, t]) => (
              <input key={k} required type={t} placeholder={ph} value={form[k]} step="any"
                className={t === 'number' ? 'no-spinner' : undefined}
                onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))}
                style={inputStyle} />
            ))}

            <select required className="no-arrow" value={form.routeId} onChange={e => setForm(f => ({ ...f, routeId: e.target.value }))}
              style={{ ...inputStyle, fontFamily: 'inherit', fontWeight: 400, color: form.routeId ? 'inherit' : '#9ca3af' }}>
              <option value="">Assign to route</option>
              {routes.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
            </select>

            <button type="submit" style={{ ...btn, background: 'var(--primary)', color: '#fff', marginTop: 4 }}>{editing ? 'Save Changes' : 'Create Stop'}</button>
          </form>
        )}

        <div className="table-scroll" style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr><th style={th}>#</th><th style={th}>Name</th><th style={th}>Latitude</th><th style={th}>Longitude</th><th style={th}>Actions</th></tr></thead>
            <tbody>
              {stops.length === 0 ? <tr><td colSpan={5} style={{ ...td, color: 'var(--text-light)', textAlign: 'center' }}>No stops found.</td></tr> :
                stops.map((s, i) => (
                  <tr key={s.id}>
                    <td style={{ ...td, color: 'var(--text-light)' }}>{i + 1}</td>
                    <td style={{ ...td, fontWeight: 500 }}>{s.name}</td>
                    <td style={{ ...td, color: 'var(--text-light)' }}>{s.latitude}</td>
                    <td style={{ ...td, color: 'var(--text-light)' }}>{s.longitude}</td>
                    <td style={td}>
                      <button style={{ ...btn, background: '#e3f0ff', color: 'var(--primary)', marginRight: 6 }} onClick={() => startEdit(s)}>Edit</button>
                      <button style={{ ...btn, background: '#ffe3e3', color: 'var(--danger)' }} onClick={() => remove(s.id)}>Delete</button>
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
