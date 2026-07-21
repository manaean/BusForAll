import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import RouteCard from '../../components/RouteCard';
import api from '../../api/axios';
import useAutoRefresh from '../../hooks/useAutoRefresh';

const page = { maxWidth: 700, margin: '0 auto', padding: '1.5rem 1rem' };

export default function Favourites() {
  const navigate = useNavigate();
  const [favs, setFavs] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => api.get('/api/favourites').then(r => { setFavs(r.data); setLoading(false); });

  useAutoRefresh(load, []);

  const removeFav = async (routeId) => {
    await api.delete(`/api/favourites/${routeId}`);
    setFavs(f => f.filter(fav => fav.routeId !== routeId));
  };

  return (
    <>
      
      <div style={page}>
        <button onClick={() => navigate(-1)} className="back-link" style={{ background: 'none', border: 'none', borderRadius: 999, cursor: 'pointer', color: '#6b7280', fontSize: '.875rem', fontWeight: 600, padding: '0.4rem 0.85rem', margin: '0 0 0.75rem -0.85rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          &#8592; <span className="back-link-text">Back</span>
        </button>
        <h1 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '1rem' }}>My Favourite Routes</h1>
        {loading ? <p style={{ color: 'var(--text-light)' }}>Loading...</p> : favs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-light)' }}>
            <p style={{ marginBottom: '1rem' }}>No favourite routes yet.</p>
            <Link to="/routes" style={{ color: 'var(--primary)', fontWeight: 600 }}>Browse routes to add favourites</Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {favs.map(f => (
              <RouteCard key={f.routeId} route={f.Route} onFavToggle={removeFav} isFav={true} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
