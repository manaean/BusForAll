import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import BusTracker from '../../components/BusTracker';
import { getMyAssignment } from '../../api/driver.api';

const page = { maxWidth: 700, margin: '0 auto', padding: '1.5rem 1rem' };
const card = { background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10, padding: '1.25rem', marginBottom: '1rem' };

export default function DriverBus() {
  const { routeId: paramRouteId } = useParams();
  const [assignment, setAssignment] = useState(null);
  const [routeId, setRouteId] = useState(paramRouteId || null);
  const [loading, setLoading] = useState(!paramRouteId);

  useEffect(() => {
    if (!paramRouteId) {
      getMyAssignment().then(r => {
        setAssignment(r.data);
        if (r.data?.Route?.id) setRouteId(r.data.Route.id);
        setLoading(false);
      }).catch(() => setLoading(false));
    }
  }, [paramRouteId]);

  if (loading) return <><div style={{ ...page, color: 'var(--text-light)' }}>Loading...</div></>;

  if (!routeId) return (
    <>
      
      <div style={{ ...page, color: 'var(--text-light)', textAlign: 'center', paddingTop: '3rem' }}>
        <p style={{ fontWeight: 500, marginBottom: '0.5rem' }}>No active route found.</p>
        <Link to="/driver" style={{ color: 'var(--primary)', fontWeight: 600 }}>Back to Home</Link>
      </div>
    </>
  );

  return (
    <>
      
      <div style={page}>
        <Link to="/driver" style={{ color: 'var(--primary)', fontSize: '.875rem', textDecoration: 'none' }}>← Back to Home</Link>
        <h1 style={{ fontSize: '1.3rem', fontWeight: 700, margin: '0.75rem 0 0.25rem' }}>My Bus Status</h1>
        {assignment && (
          <p style={{ color: 'var(--text-light)', fontSize: '.875rem', marginBottom: '1rem' }}>
            Bus {assignment.Bus?.plateNumber} on {assignment.Route?.name}
          </p>
        )}

        <div style={card}>
          <h2 style={{ fontWeight: 600, fontSize: '.95rem', marginBottom: '0.75rem' }}>Live Position</h2>
          <BusTracker routeId={routeId} />
        </div>

        <p style={{ color: 'var(--text-light)', fontSize: '.8rem', textAlign: 'center' }}>
          Position updates every 5 seconds. This view is read-only for drivers.
        </p>
      </div>
    </>
  );
}
