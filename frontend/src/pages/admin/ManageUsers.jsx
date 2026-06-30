import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';

const page = { maxWidth: 900, margin: '0 auto', padding: '1.5rem 1rem' };
const th = { padding: '9px 12px', textAlign: 'left', fontSize: '.82rem', color: 'var(--text-light)', fontWeight: 600, borderBottom: '1px solid var(--border)' };
const td = { padding: '9px 12px', borderBottom: '1px solid #f0f0f0', fontSize: '.9rem' };
const btn = { padding: '0.4rem 0.85rem', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: '.83rem', fontWeight: 600 };

const ROLES = ['commuter', 'admin', 'driver'];

export default function ManageUsers() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');

  const load = () => api.get('/api/users').then(r => setUsers(r.data));
  useEffect(() => { load(); }, []);

  const changeRole = async (id, role) => {
    setError('');
    try { await api.put(`/api/users/${id}`, { role }); load(); }
    catch (err) { setError(err.response?.data?.message || 'Error updating role'); }
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this user? This cannot be undone.')) return;
    try { await api.delete(`/api/users/${id}`); load(); }
    catch (err) { setError(err.response?.data?.message || 'Error deleting user'); }
  };

  const roleBadge = (r) => {
    const map = { admin: ['#e3f2fd', '#1565C0'], driver: ['#e8f5e9', '#2e7d32'], commuter: ['#f5f5f5', '#555'] };
    const [bg, color] = map[r] || ['#f5f5f5', '#555'];
    return <span style={{ background: bg, color, padding: '2px 10px', borderRadius: 20, fontSize: '.78rem', fontWeight: 600 }}>{r}</span>;
  };

  return (
    <>
      
      <div style={page}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', fontSize: '.875rem', fontWeight: 500, padding: '0 0 0.75rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>&#8592; Back</button>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem' }}>Manage Users</h1>
        {error && <p style={{ color: 'var(--danger)', marginBottom: '0.75rem', fontSize: '.875rem' }}>{error}</p>}
        <div className="table-scroll" style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr><th style={th}>Name</th><th style={th}>Email</th><th style={th}>Role</th><th style={th}>Change Role</th><th style={th}>Actions</th></tr></thead>
            <tbody>
              {users.length === 0 ? <tr><td colSpan={5} style={{ ...td, color: 'var(--text-light)', textAlign: 'center' }}>No users found.</td></tr> :
                users.map(u => (
                  <tr key={u.id}>
                    <td style={{ ...td, fontWeight: 500 }}>{u.name}</td>
                    <td style={{ ...td, color: 'var(--text-light)' }}>{u.email}</td>
                    <td style={td}>{roleBadge(u.role)}</td>
                    <td style={td}>
                      <select defaultValue={u.role} onChange={e => changeRole(u.id, e.target.value)}
                        style={{ padding: '0.3rem 0.5rem', border: '1px solid var(--border)', borderRadius: 5, fontSize: '.82rem' }}>
                        {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                      </select>
                    </td>
                    <td style={td}>
                      <button style={{ ...btn, background: '#ffe3e3', color: 'var(--danger)' }} onClick={() => remove(u.id)}>Delete</button>
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
