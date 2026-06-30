import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllBuses, createBus, updateBus, deleteBus } from '../../api/bus.api';

const page = { maxWidth: 900, margin: '0 auto', padding: '1.5rem 1rem' };
const th = { padding: '9px 12px', textAlign: 'left', fontSize: '.82rem', color: 'var(--text-light)', fontWeight: 600, borderBottom: '1px solid var(--border)' };
const td = { padding: '9px 12px', borderBottom: '1px solid #f0f0f0', fontSize: '.9rem' };
const btn = { padding: '0.4rem 0.85rem', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: '.83rem', fontWeight: 600 };

const STATUSES = ['available', 'in_service', 'maintenance', 'retired'];
const emptyForm = { plateNumber: '', capacity: '', status: 'available' };

export default function ManageBuses() {
  const navigate = useNavigate();
  const [buses, setBuses] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');

  const load = () => getAllBuses().then(r => setBuses(r.data));
  useEffect(() => { load(); }, []);

  const submit = async (e) => {
    e.preventDefault(); setError('');
    try {
      const payload = { plateNumber: form.plateNumber, capacity: parseInt(form.capacity), status: form.status };
      if (editing) { await updateBus(editing, payload); }
      else { await createBus(payload); }
      setForm(emptyForm); setEditing(null); setShowForm(false); load();
    } catch (err) { setError(err.response?.data?.message || 'Error saving bus'); }
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this bus?')) return;
    await deleteBus(id); load();
  };

  const startEdit = (b) => { setForm({ plateNumber: b.plateNumber, capacity: b.capacity, status: b.status }); setEditing(b.id); setShowForm(true); };

  const statusBadge = (s) => {
    const map = { available: ['#e8f5e9', '#2e7d32'], in_service: ['#e3f2fd', '#1565C0'], maintenance: ['#fff8e1', '#f57f17'], retired: ['#fce4ec', '#b71c1c'] };
    const [bg, color] = map[s] || ['#f5f5f5', '#555'];
    return <span style={{ background: bg, color, padding: '2px 10px', borderRadius: 20, fontSize: '.78rem', fontWeight: 600 }}>{s.replace('_', ' ')}</span>;
  };

  return (
    <>
      
      <div style={page}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', fontSize: '.875rem', fontWeight: 500, padding: '0 0 0.75rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>&#8592; Back</button>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Manage Buses</h1>
          <button style={{ ...btn, background: 'var(--primary)', color: '#fff' }} onClick={() => { setForm(emptyForm); setEditing(null); setShowForm(!showForm); }}>
            {showForm ? 'Cancel' : 'Add Bus'}
          </button>
        </div>

        {showForm && (
          <form onSubmit={submit} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10, padding: '1.25rem', marginBottom: '1rem' }}>
            <h3 style={{ fontWeight: 600, marginBottom: '0.75rem' }}>{editing ? 'Edit Bus' : 'New Bus'}</h3>
            {error && <p style={{ color: 'var(--danger)', marginBottom: '0.5rem', fontSize: '.875rem' }}>{error}</p>}
            <input required placeholder="Plate number" value={form.plateNumber} onChange={e => setForm(f => ({ ...f, plateNumber: e.target.value }))}
              style={{ width: '100%', padding: '0.6rem', border: '1px solid var(--border)', borderRadius: 6, marginBottom: '0.5rem', fontSize: '.9rem' }} />
            <input required type="number" min="1" placeholder="Capacity" value={form.capacity} onChange={e => setForm(f => ({ ...f, capacity: e.target.value }))}
              style={{ width: '100%', padding: '0.6rem', border: '1px solid var(--border)', borderRadius: 6, marginBottom: '0.5rem', fontSize: '.9rem' }} />
            <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
              style={{ width: '100%', padding: '0.6rem', border: '1px solid var(--border)', borderRadius: 6, marginBottom: '0.75rem', fontSize: '.9rem' }}>
              {STATUSES.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
            </select>
            <button type="submit" style={{ ...btn, background: 'var(--primary)', color: '#fff' }}>{editing ? 'Save Changes' : 'Create Bus'}</button>
          </form>
        )}

        <div className="table-scroll" style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr><th style={th}>Plate</th><th style={th}>Capacity</th><th style={th}>Status</th><th style={th}>Actions</th></tr></thead>
            <tbody>
              {buses.length === 0 ? <tr><td colSpan={4} style={{ ...td, color: 'var(--text-light)', textAlign: 'center' }}>No buses found.</td></tr> :
                buses.map(b => (
                  <tr key={b.id}>
                    <td style={{ ...td, fontWeight: 500 }}>{b.plateNumber}</td>
                    <td style={td}>{b.capacity}</td>
                    <td style={td}>{statusBadge(b.status)}</td>
                    <td style={td}>
                      <button style={{ ...btn, background: '#e3f0ff', color: 'var(--primary)', marginRight: 6 }} onClick={() => startEdit(b)}>Edit</button>
                      <button style={{ ...btn, background: '#ffe3e3', color: 'var(--danger)' }} onClick={() => remove(b.id)}>Delete</button>
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
