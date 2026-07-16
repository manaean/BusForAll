import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllDrivers, getAllAssignments, createAssignment, deleteAssignment } from '../../api/driver.api';
import { getAllRoutes } from '../../api/route.api';
import { getAllBuses } from '../../api/bus.api';

const page = { maxWidth: 900, margin: '0 auto', padding: '1.5rem 1rem' };
const th = { padding: '9px 12px', textAlign: 'left', fontSize: '.82rem', color: 'var(--text-light)', fontWeight: 600, borderBottom: '1px solid var(--border)' };
const td = { padding: '9px 12px', borderBottom: '1px solid #f0f0f0', fontSize: '.9rem' };
const btn = { padding: '0.4rem 0.85rem', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: '.83rem', fontWeight: 600 };
const searchInput = { width: '100%', padding: '0.6rem', border: '1px solid var(--border)', borderRadius: 6, marginBottom: '0.5rem', fontSize: '.9rem', boxSizing: 'border-box' };

const today = new Date().toISOString().split('T')[0];
const emptyForm = { driverId: '', busId: '', routeId: '', assignmentDate: today };

function SearchSelect({ query, onQueryChange, focused, onFocus, onBlur, placeholder, suggestions, onPick, renderOption }) {
  return (
    <div style={{ position: 'relative', marginBottom: '0.5rem' }}>
      <input
        value={query}
        onChange={e => onQueryChange(e.target.value)}
        onFocus={onFocus}
        onBlur={() => setTimeout(onBlur, 120)}
        placeholder={placeholder}
        style={{ ...searchInput, marginBottom: 0 }}
      />
      {focused && suggestions.length > 0 && (
        <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, marginTop: 4, boxShadow: '0 6px 20px rgba(0,0,0,.1)', zIndex: 10, maxHeight: 220, overflowY: 'auto' }}>
          {suggestions.map((opt, i) => (
            <div key={opt.id} onMouseDown={() => onPick(opt)}
              style={{ padding: '0.55rem 0.8rem', fontSize: '.85rem', color: '#374151', cursor: 'pointer', borderTop: i === 0 ? 'none' : '1px solid #f3f4f6' }}>
              {renderOption(opt)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ManageAssignments() {
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [buses, setBuses] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');

  const [driverQuery, setDriverQuery] = useState('');
  const [driverFocused, setDriverFocused] = useState(false);
  const [busQuery, setBusQuery] = useState('');
  const [busFocused, setBusFocused] = useState(false);

  const load = () => Promise.all([getAllAssignments(), getAllDrivers(), getAllBuses(), getAllRoutes()]).then(([a, d, b, r]) => {
    setAssignments(a.data); setDrivers(d.data); setBuses(b.data); setRoutes(r.data);
  });
  useEffect(() => { load(); }, []);

  const driverSuggestions = useMemo(() => {
    const q = driverQuery.trim().toLowerCase();
    const list = drivers.filter(d => {
      const name = d.User?.name || `Driver #${d.id}`;
      return !q || name.toLowerCase().includes(q) || String(d.id).includes(q);
    });
    return list.slice(0, 8);
  }, [driverQuery, drivers]);

  const busSuggestions = useMemo(() => {
    const q = busQuery.trim().toLowerCase();
    const list = buses.filter(b => !q || b.plateNumber.toLowerCase().includes(q) || String(b.id).includes(q));
    return list.slice(0, 8);
  }, [busQuery, buses]);

  const resetForm = () => {
    setForm(emptyForm);
    setDriverQuery('');
    setBusQuery('');
  };

  const submit = async (e) => {
    e.preventDefault(); setError('');
    if (!form.driverId) { setError('Select a driver from the search results'); return; }
    if (!form.busId) { setError('Select a bus from the search results'); return; }
    try {
      await createAssignment({ driverId: parseInt(form.driverId), busId: parseInt(form.busId), routeId: parseInt(form.routeId), assignmentDate: form.assignmentDate });
      resetForm(); setShowForm(false); load();
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
          <button style={{ ...btn, background: 'var(--primary)', color: '#fff' }} onClick={() => { resetForm(); setShowForm(!showForm); }}>
            {showForm ? 'Cancel' : 'Add Assignment'}
          </button>
        </div>

        {showForm && (
          <form onSubmit={submit} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10, padding: '1.25rem', marginBottom: '1rem' }}>
            <h3 style={{ fontWeight: 600, marginBottom: '0.75rem' }}>New Assignment</h3>
            {error && <p style={{ color: 'var(--danger)', marginBottom: '0.5rem', fontSize: '.875rem' }}>{error}</p>}

            <SearchSelect
              query={driverQuery}
              onQueryChange={q => { setDriverQuery(q); setForm(f => ({ ...f, driverId: '' })); }}
              focused={driverFocused}
              onFocus={() => setDriverFocused(true)}
              onBlur={() => setDriverFocused(false)}
              placeholder="Search driver by name..."
              suggestions={driverSuggestions}
              onPick={d => { setForm(f => ({ ...f, driverId: d.id })); setDriverQuery(d.User?.name || `Driver #${d.id}`); setDriverFocused(false); }}
              renderOption={d => d.User?.name || `Driver #${d.id}`}
            />

            <SearchSelect
              query={busQuery}
              onQueryChange={q => { setBusQuery(q); setForm(f => ({ ...f, busId: '' })); }}
              focused={busFocused}
              onFocus={() => setBusFocused(true)}
              onBlur={() => setBusFocused(false)}
              placeholder="Search bus by number/ID..."
              suggestions={busSuggestions}
              onPick={b => { setForm(f => ({ ...f, busId: b.id })); setBusQuery(`${b.plateNumber} (#${b.id})`); setBusFocused(false); }}
              renderOption={b => `${b.plateNumber} (#${b.id})`}
            />

            <select required value={form.routeId} onChange={e => setForm(f => ({ ...f, routeId: e.target.value }))}
              style={searchInput}>
              <option value="">Select route</option>
              {routes.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
            </select>

            <input required type="date" value={form.assignmentDate} onChange={e => setForm(f => ({ ...f, assignmentDate: e.target.value }))}
              style={{ ...searchInput, marginBottom: '0.75rem' }} />
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
