import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import { updateMe, changePassword } from '../../api/auth.api';

const inp = {
  width: '100%',
  padding: '0.6rem 0.85rem',
  border: '1.5px solid #d1d5db',
  borderRadius: 8,
  fontSize: '.9rem',
  outline: 'none',
  boxSizing: 'border-box',
};

const label = { fontSize: '.8rem', fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 };

export default function Profile() {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const isCommuter = user?.role === 'commuter';
  const sidebar = [
    { label: 'Profile', to: '/profile' },
    ...(isCommuter ? [{ label: 'Favourites', to: '/favourites' }] : []),
  ];
  const [favs, setFavs] = useState([]);

  const [profileForm, setProfileForm] = useState({ name: user?.name || '', email: user?.email || '' });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState(null);

  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [pwSaving, setPwSaving] = useState(false);
  const [pwMsg, setPwMsg] = useState(null);

  useEffect(() => {
    if (isCommuter) api.get('/api/favourites').then(r => setFavs(r.data.slice(0, 3))).catch(() => {});
  }, [isCommuter]);

  const handleLogout = () => { logout(); navigate('/'); };

  const saveProfile = async (e) => {
    e.preventDefault();
    setProfileMsg(null);
    setProfileSaving(true);
    try {
      const { data } = await updateMe(profileForm);
      updateUser({ name: data.name, email: data.email });
      setProfileMsg({ type: 'success', text: 'Profile updated.' });
    } catch (err) {
      setProfileMsg({ type: 'error', text: err.response?.data?.message || 'Failed to update profile.' });
    } finally { setProfileSaving(false); }
  };

  const savePassword = async (e) => {
    e.preventDefault();
    setPwMsg(null);
    if (pwForm.newPassword.length < 8) { setPwMsg({ type: 'error', text: 'New password must be at least 8 characters.' }); return; }
    if (pwForm.newPassword !== pwForm.confirm) { setPwMsg({ type: 'error', text: 'New passwords do not match.' }); return; }
    setPwSaving(true);
    try {
      await changePassword({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
      setPwForm({ currentPassword: '', newPassword: '', confirm: '' });
      setPwMsg({ type: 'success', text: 'Password updated.' });
    } catch (err) {
      setPwMsg({ type: 'error', text: err.response?.data?.message || 'Failed to update password.' });
    } finally { setPwSaving(false); }
  };

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh' }}>
      
      <div className="profile-layout page-container">

        {/* Sidebar */}
        <div className="profile-sidebar" style={{ background: '#fff', borderRadius: 14, border: '1px solid #e5e7eb', padding: '1rem' }}>
          {sidebar.map(item => (
            <Link key={item.to} to={item.to}
              style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '10px 12px', borderRadius: 8, textDecoration: 'none', color: '#374151', fontWeight: 500, fontSize: '.9rem', marginBottom: 4, background: window.location.pathname === item.to ? '#eff6ff' : 'transparent' }}>
              {item.label}
            </Link>
          ))}
          <button onClick={handleLogout}
            style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '10px 12px', borderRadius: 8, border: 'none', background: 'none', cursor: 'pointer', color: 'var(--danger)', fontWeight: 500, fontSize: '.9rem', width: '100%', marginTop: 8 }}>
            Log Out
          </button>
        </div>

        {/* Main */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', fontSize: '.875rem', fontWeight: 500, padding: '0 0 0.75rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>&#8592; Back</button>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#111827', marginBottom: '0.25rem' }}>My Account</h1>
          <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>Manage your profile{isCommuter ? ' and your favourite routes' : ''}.</p>

          {/* Profile Info */}
          <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e5e7eb', padding: '1.75rem', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h2 style={{ fontWeight: 700, fontSize: '1rem', color: '#111827' }}>Profile Information</h2>
            </div>
            <form onSubmit={saveProfile}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1.25rem', marginBottom: '1.25rem' }}>
                <div>
                  <label style={label}>Full Name</label>
                  <input style={inp} type="text" value={profileForm.name}
                    onChange={e => setProfileForm({ ...profileForm, name: e.target.value })} required />
                </div>
                <div>
                  <label style={label}>Email</label>
                  <input style={inp} type="email" value={profileForm.email}
                    onChange={e => setProfileForm({ ...profileForm, email: e.target.value })} required />
                </div>
                <div>
                  <div style={{ fontSize: '.78rem', color: '#9ca3af', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '.05em' }}>Role</div>
                  <div style={{ fontWeight: 600, color: '#111827', fontSize: '.95rem' }}>{user?.role}</div>
                </div>
              </div>
              {profileMsg && (
                <p style={{ fontSize: '.85rem', marginBottom: '1rem', color: profileMsg.type === 'error' ? '#dc2626' : '#16a34a' }}>{profileMsg.text}</p>
              )}
              <button type="submit" disabled={profileSaving}
                style={{ padding: '0.6rem 1.4rem', background: '#1a5a7a', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: '.875rem', cursor: 'pointer' }}>
                {profileSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          </div>

          {/* Change Password */}
          <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e5e7eb', padding: '1.75rem', marginBottom: '1.25rem' }}>
            <h2 style={{ fontWeight: 700, fontSize: '1rem', color: '#111827', marginBottom: '1.25rem' }}>Change Password</h2>
            <form onSubmit={savePassword}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1.25rem', marginBottom: '1.25rem' }}>
                <div>
                  <label style={label}>Current Password</label>
                  <input style={inp} type="password" value={pwForm.currentPassword}
                    onChange={e => setPwForm({ ...pwForm, currentPassword: e.target.value })} required />
                </div>
                <div>
                  <label style={label}>New Password</label>
                  <input style={inp} type="password" value={pwForm.newPassword} minLength={8}
                    onChange={e => setPwForm({ ...pwForm, newPassword: e.target.value })} required />
                </div>
                <div>
                  <label style={label}>Confirm New Password</label>
                  <input style={inp} type="password" value={pwForm.confirm}
                    onChange={e => setPwForm({ ...pwForm, confirm: e.target.value })} required />
                </div>
              </div>
              {pwMsg && (
                <p style={{ fontSize: '.85rem', marginBottom: '1rem', color: pwMsg.type === 'error' ? '#dc2626' : '#16a34a' }}>{pwMsg.text}</p>
              )}
              <button type="submit" disabled={pwSaving}
                style={{ padding: '0.6rem 1.4rem', background: '#1a5a7a', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: '.875rem', cursor: 'pointer' }}>
                {pwSaving ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          </div>

          {/* Favourite Routes */}
          {isCommuter && (
          <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e5e7eb', padding: '1.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div>
                <h2 style={{ fontWeight: 700, fontSize: '1rem', color: '#111827' }}>Favourite Routes</h2>
                <p style={{ fontSize: '.8rem', color: '#9ca3af', marginTop: 2 }}>Your frequently used routes</p>
              </div>
              <Link to="/favourites" style={{ color: 'var(--primary)', fontSize: '.875rem', fontWeight: 600, textDecoration: 'none' }}>View All</Link>
            </div>
            {favs.length === 0 ? (
              <p style={{ color: '#9ca3af', fontSize: '.875rem' }}>No saved routes yet. <Link to="/routes" style={{ color: 'var(--primary)' }}>Browse routes</Link></p>
            ) : favs.map((f, i) => (
              <Link key={f.routeId} to={`/schedule/${f.routeId}`} style={{ textDecoration: 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.85rem 0', borderBottom: i < favs.length - 1 ? '1px solid #f3f4f6' : 'none' }}>
                  <div style={{ width: 38, height: 38, borderRadius: 8, background: '#1565C0', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '.9rem', flexShrink: 0 }}>
                    {i + 1}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, color: '#111827', fontSize: '.9rem' }}>{f.Route?.name}</div>
                  </div>
                  <span style={{ color: '#d1d5db', fontSize: '1.2rem' }}>☆</span>
                </div>
              </Link>
            ))}
          </div>
          )}
        </div>
      </div>
    </div>
  );
}
