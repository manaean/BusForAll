import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllDrivers, getAllAssignments, createAssignment, deleteAssignment } from '../../api/driver.api';
import { getAllRoutes } from '../../api/route.api';
import { getAllBuses } from '../../api/bus.api';

const page = { maxWidth: 900, margin: '0 auto', padding: '1.5rem 1rem' };
const th = { padding: '9px 12px', textAlign: 'left', fontSize: '.82rem', color: 'var(--text-light)', fontWeight: 600, borderBottom: '1px solid var(--border)' };
const td = { padding: '9px 12px', borderBottom: '1px solid #f0f0f0', fontSize: '.9rem' };
const btn = { padding: '0.4rem 0.85rem', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: '.83rem', fontWeight: 600 };

const today = new Date().toISOString().split('T')[0];
const emptyForm = { driverId: '', busId: '', routeId: '', assignmentDate: today };

export default function ManageAssignments() {
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [buses, setBuses] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');

  const load = () => Promise.all([getAllAssignments(), getAllDrivers(), getAllBuses(), getAllRoutes()]).then(([a, d, b, r]) => {
    setAssignments(a.data); setDrivers(d.data); setBuses(b.data); setRoutes(r.data);
  });
  useEffect(() => { load(); }, []);

  const submit = async (e) => {
    e.preventDefault(); setError('');
    try {
      await createAssignment({ driverId: parseInt(form.driverId), busId: parseInt(form.busId), routeId: parseInt(form.routeId), assignmentDate: form.assignmentDate });
      setForm(emptyForm); setShowForm(false); load();
    } catch (err) { setError(err.response?.data?.message || 'Error creating assignment'); }
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this assignment?')) return;
    await deleteAssignment(id); load();
  };

  return (
    <>
      
      <div style={page}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', fontSize: '.875rem', fontWeight: 500, padding: '0 0 0.75rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>&#8592; Back</button>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Manage Assignments</h1>
          <button style={{ ...btn, background: 'var(--primary)', color: '#fff' }} onClick={() => { setForm(emptyForm); setShowForm(!showForm); }}>
            {showForm ? 'Cancel' : 'Add Assignment'}
          </button>
        </div>

        {showForm && (
          <form onSubmit={submit} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10, padding: '1.25rem', marginBottom: '1rem' }}>
            <h3 style={{ fontWeight: 600, marginBottom: '0.75rem' }}>New Assignment</h3>
            {error && <p style={{ color: 'var(--danger)', marginBottom: '0.5rem', fontSize: '.875rem' }}>{error}</p>}
            {[
              [form.driverId, 'driverId', 'Select driver', drivers.map(d => ({ id: d.id, label: d.User?.name || `Driver #${d.id}` }))],
              [form.busId, 'busId', 'Select bus', buses.map(b => ({ id: b.id, label: b.plateNumber }))],
              [form.routeId, 'routeId', 'Select route', routes.map(r => ({ id: r.id, label: r.name }))],
            ].map(([val, key, ph, opts]) => (
              <select key={key} required value={val} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                style={{ width: '100%', padding: '0.6rem', border: '1px solid var(--border)', borderRadius: 6, marginBottom: '0.5rem', fontSize: '.9rem' }}>
                <option value="">{ph}</option>
                {opts.map(o => <option key={o.id} value={o.id}>{o.label}</option>)}
              </select>
            ))}
            <input required type="date" value={form.assignmentDate} onChange={e => setForm(f => ({ ...f, assignmentDate: e.target.value }))}
              style={{ width: '100%', padding: '0.6rem', border: '1px solid var(--border)', borderRadius: 6, marginBottom: '0.75rem', fontSize: '.9rem' }} />
            <button type="submit" style={{ ...btn, background: 'var(--primary)', color: '#fff' }}>Create Assignment</button>
          </form>
        )}

        <div className="table-scroll" style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr><th style={th}>Date</th><th style={th}>Driver</th><th style={th}>Bus</th><th style={th}>Route</th><th style={th}>Actions</th></tr></thead>
            <tbody>
              {assignments.length === 0 ? <tr><td colSpan={5} style={{ ...td, color: 'var(--text-light)', textAlign: 'center' }}>No assignments found.</td></tr> :
                assignments.map(a => (
                  <tr key={a.id}>
                    <td style={td}>{a.assignmentDate}</td>
                    <td style={{ ...td, fontWeight: 500 }}>{a.Driver?.User?.name || '-'}</td>
                    <td style={td}>{a.Bus?.plateNumber || '-'}</td>
                    <td style={td}>{a.Route?.name || '-'}</td>
                    <td style={td}>
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
