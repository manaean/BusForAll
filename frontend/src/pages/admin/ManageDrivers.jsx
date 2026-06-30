import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllDrivers, createDriver, updateDriver, deleteDriver } from '../../api/driver.api';
import api from '../../api/axios';

const page = { maxWidth: 900, margin: '0 auto', padding: '1.5rem 1rem' };
const th = { padding: '9px 12px', textAlign: 'left', fontSize: '.82rem', color: 'var(--text-light)', fontWeight: 600, borderBottom: '1px solid var(--border)' };
const td = { padding: '9px 12px', borderBottom: '1px solid #f0f0f0', fontSize: '.9rem' };
const btn = { padding: '0.4rem 0.85rem', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: '.83rem', fontWeight: 600 };

const emptyForm = { userId: '', licenseNumber: '' };

export default function ManageDrivers() {
  const navigate = useNavigate();
  const [drivers, setDrivers] = useState([]);
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');

  const load = () => Promise.all([getAllDrivers(), api.get('/api/users')]).then(([d, u]) => { setDrivers(d.data); setUsers(u.data.filter(u => u.role === 'driver')); });
  useEffect(() => { load(); }, []);

  const submit = async (e) => {
    e.preventDefault(); setError('');
    try {
      const payload = { userId: parseInt(form.userId), licenseNumber: form.licenseNumber };
      if (editing) { await updateDriver(editing, payload); }
      else { await createDriver(payload); }
      setForm(emptyForm); setEditing(null); setShowForm(false); load();
    } catch (err) { setError(err.response?.data?.message || 'Error saving driver'); }
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this driver record?')) return;
    await deleteDriver(id); load();
  };

  const startEdit = (d) => { setForm({ userId: d.userId, licenseNumber: d.licenseNumber }); setEditing(d.id); setShowForm(true); };

  return (
    <>
      
      <div style={page}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', fontSize: '.875rem', fontWeight: 500, padding: '0 0 0.75rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>&#8592; Back</button>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Manage Drivers</h1>
          <button style={{ ...btn, background: 'var(--primary)', color: '#fff' }} onClick={() => { setForm(emptyForm); setEditing(null); setShowForm(!showForm); }}>
            {showForm ? 'Cancel' : 'Add Driver'}
          </button>
        </div>

        {showForm && (
          <form onSubmit={submit} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10, padding: '1.25rem', marginBottom: '1rem' }}>
            <h3 style={{ fontWeight: 600, marginBottom: '0.75rem' }}>{editing ? 'Edit Driver' : 'New Driver'}</h3>
            {error && <p style={{ color: 'var(--danger)', marginBottom: '0.5rem', fontSize: '.875rem' }}>{error}</p>}
            <select required value={form.userId} onChange={e => setForm(f => ({ ...f, userId: e.target.value }))}
              style={{ width: '100%', padding: '0.6rem', border: '1px solid var(--border)', borderRadius: 6, marginBottom: '0.5rem', fontSize: '.9rem' }}>
              <option value="">Select driver user</option>
              {users.map(u => <option key={u.id} value={u.id}>{u.name} ({u.email})</option>)}
            </select>
            <input required placeholder="License number" value={form.licenseNumber} onChange={e => setForm(f => ({ ...f, licenseNumber: e.target.value }))}
              style={{ width: '100%', padding: '0.6rem', border: '1px solid var(--border)', borderRadius: 6, marginBottom: '0.75rem', fontSize: '.9rem' }} />
            <button type="submit" style={{ ...btn, background: 'var(--primary)', color: '#fff' }}>{editing ? 'Save Changes' : 'Create Driver'}</button>
          </form>
        )}

        <div className="table-scroll" style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr><th style={th}>Name</th><th style={th}>Email</th><th style={th}>License</th><th style={th}>Actions</th></tr></thead>
            <tbody>
              {drivers.length === 0 ? <tr><td colSpan={4} style={{ ...td, color: 'var(--text-light)', textAlign: 'center' }}>No drivers found.</td></tr> :
                drivers.map(d => (
                  <tr key={d.id}>
                    <td style={{ ...td, fontWeight: 500 }}>{d.User?.name || '-'}</td>
                    <td style={{ ...td, color: 'var(--text-light)' }}>{d.User?.email || '-'}</td>
                    <td style={td}>{d.licenseNumber}</td>
                    <td style={td}>
                      <button style={{ ...btn, background: '#e3f0ff', color: 'var(--primary)', marginRight: 6 }} onClick={() => startEdit(d)}>Edit</button>
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
