import { useNavigate } from 'react-router-dom';

const s = {
  card: { background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10, padding: '1rem 1.25rem', cursor: 'pointer', transition: 'transform .2s ease, box-shadow .2s ease', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  name: { fontWeight: 600, fontSize: '1rem', color: 'var(--primary)' },
  desc: { color: 'var(--text-light)', fontSize: '.85rem', marginTop: 4 },
  trackBtn: { background: '#E3F2FD', color: 'var(--primary)', border: 'none', fontSize: '.78rem', padding: '4px 10px', borderRadius: 12, fontWeight: 600, cursor: 'pointer', transition: 'background-color .2s ease, color .2s ease' },
  favBtn: { background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: 'var(--accent)', padding: '0 4px' }
};

export default function RouteCard({ route, onFavToggle, isFav, isGuest }) {
  const navigate = useNavigate();

  const handleFav = () => {
    if (isGuest) { navigate('/login'); return; }
    if (onFavToggle) onFavToggle(route.id);
  };

  return (
    <div className="route-list-card" style={s.card}>
      <div onClick={() => navigate(`/schedule/${route.id}`)} style={{ flex: 1 }}>
        <div style={s.name}>{route.name}</div>
        {route.description && <div style={s.desc}>{route.description}</div>}
      </div>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <button className="track-bus-button" style={s.trackBtn} onClick={() => navigate(`/tracker/${route.id}`)}>Live Tracking</button>
        <button style={s.favBtn} onClick={handleFav} title={isGuest ? 'Login to save' : isFav ? 'Remove favourite' : 'Add favourite'}>
          {isFav ? '★' : '☆'}
        </button>
      </div>
    </div>
  );
}
