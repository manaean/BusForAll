import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllRoutes, createRoute, updateRoute, deleteRoute } from '../../api/route.api';

const page = { maxWidth: 900, margin: '0 auto', padding: '1.5rem 1rem' };
const th = { padding: '9px 12px', textAlign: 'left', fontSize: '.82rem', color: 'var(--text-light)', fontWeight: 600, borderBottom: '1px solid var(--border)' };
const td = { padding: '9px 12px', borderBottom: '1px solid #f0f0f0', fontSize: '.9rem' };
const btn = { padding: '0.4rem 0.85rem', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: '.83rem', fontWeight: 600 };

const emptyForm = { name: '', description: '' };

export default function ManageRoutes() {
  const navigate = useNavigate();
  const [routes, setRoutes] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');

  const load = () => getAllRoutes().then(r => setRoutes(r.data));
  useEffect(() => { load(); }, []);

  const submit = async (e) => {
    e.preventDefault(); setError('');
    try {
      if (editing) { await updateRoute(editing, form); }
      else { await createRoute(form); }
      setForm(emptyForm); setEditing(null); setShowForm(false); load();
    } catch (err) { setError(err.response?.data?.message || 'Error saving route'); }
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this route?')) return;
    await deleteRoute(id); load();
  };

  const startEdit = (r) => { setForm({ name: r.name, description: r.description || '' }); setEditing(r.id); setShowForm(true); };

  return (
    <>
      
      <div style={page}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', fontSize: '.875rem', fontWeight: 500, padding: '0 0 0.75rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>&#8592; Back</button>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Manage Routes</h1>
          <button style={{ ...btn, background: 'var(--primary)', color: '#fff' }} onClick={() => { setForm(emptyForm); setEditing(null); setShowForm(!showForm); }}>
            {showForm ? 'Cancel' : 'Add Route'}
          </button>
        </div>

        {showForm && (
          <form onSubmit={submit} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10, padding: '1.25rem', marginBottom: '1rem' }}>
            <h3 style={{ fontWeight: 600, marginBottom: '0.75rem' }}>{editing ? 'Edit Route' : 'New Route'}</h3>
            {error && <p style={{ color: 'var(--danger)', marginBottom: '0.5rem', fontSize: '.875rem' }}>{error}</p>}
            <input required placeholder="Route name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              style={{ width: '100%', padding: '0.6rem', border: '1px solid var(--border)', borderRadius: 6, marginBottom: '0.5rem', fontSize: '.9rem' }} />
            <textarea placeholder="Description (optional)" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              style={{ width: '100%', padding: '0.6rem', border: '1px solid var(--border)', borderRadius: 6, marginBottom: '0.75rem', fontSize: '.9rem', resize: 'vertical', minHeight: 70 }} />
            <button type="submit" style={{ ...btn, background: 'var(--primary)', color: '#fff' }}>{editing ? 'Save Changes' : 'Create Route'}</button>
          </form>
        )}

        <div className="table-scroll" style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr><th style={th}>#</th><th style={th}>Name</th><th style={th}>Description</th><th style={th}>Actions</th></tr></thead>
            <tbody>
              {routes.length === 0 ? <tr><td colSpan={4} style={{ ...td, color: 'var(--text-light)', textAlign: 'center' }}>No routes found.</td></tr> :
                routes.map((r, i) => (
                  <tr key={r.id}>
                    <td style={{ ...td, color: 'var(--text-light)' }}>{i + 1}</td>
                    <td style={{ ...td, fontWeight: 500 }}>{r.name}</td>
                    <td style={{ ...td, color: 'var(--text-light)' }}>{r.description || '-'}</td>
                    <td style={td}>
                      <button style={{ ...btn, background: '#e3f0ff', color: 'var(--primary)', marginRight: 6 }} onClick={() => startEdit(r)}>Edit</button>
                      <button style={{ ...btn, background: '#ffe3e3', color: 'var(--danger)' }} onClick={() => remove(r.id)}>Delete</button>
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
