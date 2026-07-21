import { useParams, useNavigate } from 'react-router-dom';
import BusTracker from '../../components/BusTracker';

export default function Tracker() {
  const { routeId } = useParams();
  const navigate = useNavigate();

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh' }}>
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '2rem 1.5rem' }}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', fontSize: '.875rem', fontWeight: 500, padding: '0 0 0.75rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          &#8592; Back
        </button>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#111827', marginBottom: '0.35rem' }}>Live Bus Tracking</h1>
        <p style={{ color: '#6b7280', fontSize: '.875rem', marginBottom: '1.5rem' }}>
          Bus position is simulated and updates every 6 seconds per stop.
        </p>
        <BusTracker routeId={routeId} />
      </div>
    </div>
  );
}
