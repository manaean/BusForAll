import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllRoutes } from '../../api/route.api';
import { getAllSchedules, createSchedule, updateSchedule, deleteSchedule } from '../../api/schedule.api';

const page = { maxWidth: 900, margin: '0 auto', padding: '1.5rem 1rem' };
const th = { padding: '9px 12px', textAlign: 'left', fontSize: '.82rem', color: 'var(--text-light)', fontWeight: 600, borderBottom: '1px solid var(--border)' };
const td = { padding: '9px 12px', borderBottom: '1px solid #f0f0f0', fontSize: '.9rem' };
const btn = { padding: '0.4rem 0.85rem', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: '.83rem', fontWeight: 600 };

const emptyForm = { routeId: '', departureTime: '', arrivalTime: '', days: '', frequencyMinutes: '' };

export default function ManageSchedules() {
  const navigate = useNavigate();
  const [schedules, setSchedules] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');

  const load = () => Promise.all([getAllSchedules(), getAllRoutes()]).then(([s, r]) => { setSchedules(s.data); setRoutes(r.data); });
  useEffect(() => { load(); }, []);

  const submit = async (e) => {
    e.preventDefault(); setError('');
    try {
      const payload = { ...form, routeId: parseInt(form.routeId), frequencyMinutes: form.frequencyMinutes ? parseInt(form.frequencyMinutes) : null };
      if (editing) { await updateSchedule(editing, payload); }
      else { await createSchedule(payload); }
      setForm(emptyForm); setEditing(null); setShowForm(false); load();
    } catch (err) { setError(err.response?.data?.message || 'Error saving schedule'); }
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this schedule?')) return;
    await deleteSchedule(id); load();
  };

  const startEdit = (s) => {
    setForm({ routeId: s.routeId, departureTime: s.departureTime, arrivalTime: s.arrivalTime, days: s.days || '', frequencyMinutes: s.frequencyMinutes ?? '' });
    setEditing(s.id); setShowForm(true);
  };

  const routeName = (id) => routes.find(r => r.id === id)?.name || id;

  return (
    <>
      
      <div style={page}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', fontSize: '.875rem', fontWeight: 500, padding: '0 0 0.75rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>&#8592; Back</button>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Manage Schedules</h1>
          <button style={{ ...btn, background: 'var(--primary)', color: '#fff' }} onClick={() => { setForm(emptyForm); setEditing(null); setShowForm(!showForm); }}>
            {showForm ? 'Cancel' : 'Add Schedule'}
          </button>
        </div>

        {showForm && (
          <form onSubmit={submit} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10, padding: '1.25rem', marginBottom: '1rem' }}>
            <h3 style={{ fontWeight: 600, marginBottom: '0.75rem' }}>{editing ? 'Edit Schedule' : 'New Schedule'}</h3>
            {error && <p style={{ color: 'var(--danger)', marginBottom: '0.5rem', fontSize: '.875rem' }}>{error}</p>}
            <select required value={form.routeId} onChange={e => setForm(f => ({ ...f, routeId: e.target.value }))}
              style={{ width: '100%', padding: '0.6rem', border: '1px solid var(--border)', borderRadius: 6, marginBottom: '0.5rem', fontSize: '.9rem' }}>
              <option value="">Select route</option>
              {routes.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
            </select>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: '0.5rem' }}>
              <input required type="time" value={form.departureTime} onChange={e => setForm(f => ({ ...f, departureTime: e.target.value }))}
                style={{ padding: '0.6rem', border: '1px solid var(--border)', borderRadius: 6, fontSize: '.9rem' }} />
              <input required type="time" value={form.arrivalTime} onChange={e => setForm(f => ({ ...f, arrivalTime: e.target.value }))}
                style={{ padding: '0.6rem', border: '1px solid var(--border)', borderRadius: 6, fontSize: '.9rem' }} />
            </div>
            <input placeholder="Days (e.g. Mon-Fri)" value={form.days} onChange={e => setForm(f => ({ ...f, days: e.target.value }))}
              style={{ width: '100%', padding: '0.6rem', border: '1px solid var(--border)', borderRadius: 6, marginBottom: '0.5rem', fontSize: '.9rem' }} />
            <input type="number" min="1" placeholder="Frequency (minutes, optional)" value={form.frequencyMinutes}
              onChange={e => setForm(f => ({ ...f, frequencyMinutes: e.target.value }))}
              style={{ width: '100%', padding: '0.6rem', border: '1px solid var(--border)', borderRadius: 6, marginBottom: '0.75rem', fontSize: '.9rem' }} />
            <button type="submit" style={{ ...btn, background: 'var(--primary)', color: '#fff' }}>{editing ? 'Save Changes' : 'Create Schedule'}</button>
          </form>
        )}

        <div className="table-scroll" style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr><th style={th}>Route</th><th style={th}>Departure</th><th style={th}>Arrival</th><th style={th}>Days</th><th style={th}>Frequency</th><th style={th}>Actions</th></tr></thead>
            <tbody>
              {schedules.length === 0 ? <tr><td colSpan={6} style={{ ...td, color: 'var(--text-light)', textAlign: 'center' }}>No schedules found.</td></tr> :
                schedules.map(s => (
                  <tr key={s.id}>
                    <td style={{ ...td, fontWeight: 500 }}>{routeName(s.routeId)}</td>
                    <td style={td}>{s.departureTime}</td>
                    <td style={td}>{s.arrivalTime}</td>
                    <td style={{ ...td, color: 'var(--text-light)' }}>{s.days || '-'}</td>
                    <td style={{ ...td, color: 'var(--text-light)' }}>{s.frequencyMinutes ? `${s.frequencyMinutes} min` : '-'}</td>
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
