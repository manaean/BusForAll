import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import StopList from '../../components/StopList';
import { getMyAssignment } from '../../api/driver.api';
import { getRouteById } from '../../api/route.api';
import { getSchedulesByRoute } from '../../api/schedule.api';

const page = { maxWidth: 700, margin: '0 auto', padding: '1.5rem 1rem' };
const card = { background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10, padding: '1.25rem', marginBottom: '1rem' };
const th = { padding: '8px 12px', textAlign: 'left', fontSize: '.82rem', color: 'var(--text-light)', fontWeight: 600, borderBottom: '1px solid var(--border)' };
const td = { padding: '9px 12px', borderBottom: '1px solid #f0f0f0', fontSize: '.9rem' };

export default function DriverSchedule() {
  const navigate = useNavigate();
  const [assignment, setAssignment] = useState(null);
  const [route, setRoute] = useState(null);
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [noAssignment, setNoAssignment] = useState(false);

  useEffect(() => {
    getMyAssignment().then(res => {
      const a = res.data;
      if (!a) { setNoAssignment(true); setLoading(false); return; }
      setAssignment(a);
      Promise.all([getRouteById(a.routeId || a.Route?.id), getSchedulesByRoute(a.routeId || a.Route?.id)]).then(([r, s]) => {
        setRoute(r.data); setSchedules(s.data); setLoading(false);
      });
    }).catch(() => { setNoAssignment(true); setLoading(false); });
  }, []);

  if (loading) return <><div style={{ ...page, color: 'var(--text-light)' }}>Loading...</div></>;

  if (noAssignment) return (
    <>
      
      <div style={{ ...page, color: 'var(--text-light)', textAlign: 'center', paddingTop: '3rem' }}>
        <p style={{ marginBottom: '0.5rem', fontWeight: 500 }}>No assignment for today.</p>
        <p style={{ fontSize: '.875rem' }}>Check back later or contact your administrator.</p>
      </div>
    </>
  );

  return (
    <>
      
      <div style={page}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', fontSize: '.875rem', fontWeight: 500, padding: '0 0 0.75rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>&#8592; Back</button>
        <h1 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '0.25rem' }}>My Schedule</h1>
        <p style={{ color: 'var(--text-light)', fontSize: '.875rem', marginBottom: '1.25rem' }}>Today's route and timing details.</p>

        <div style={card}>
          <h2 style={{ fontWeight: 600, fontSize: '1rem', marginBottom: '0.75rem' }}>Assignment Details</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.9rem' }}>
              <span style={{ color: 'var(--text-light)' }}>Route</span><span style={{ fontWeight: 500 }}>{assignment?.Route?.name || route?.name}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.9rem' }}>
              <span style={{ color: 'var(--text-light)' }}>Bus</span><span>{assignment?.Bus?.plateNumber}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.9rem' }}>
              <span style={{ color: 'var(--text-light)' }}>Date</span><span>{assignment?.assignmentDate}</span>
            </div>
          </div>
        </div>

        <div style={card}>
          <h2 style={{ fontWeight: 600, fontSize: '1rem', marginBottom: '1rem' }}>Departure & Arrival</h2>
          {schedules.length === 0 ? <p style={{ color: 'var(--text-light)' }}>No schedule data available.</p> : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr><th style={th}>Departure</th><th style={th}>Arrival</th><th style={th}>Days</th></tr></thead>
              <tbody>
                {schedules.map(s => (
                  <tr key={s.id}>
                    <td style={td}>{s.departureTime}</td>
                    <td style={td}>{s.arrivalTime}</td>
                    <td style={{ ...td, color: 'var(--text-light)', fontSize: '.82rem' }}>{s.days || 'Daily'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {route?.Stops?.length > 0 && (
          <div style={card}>
            <h2 style={{ fontWeight: 600, fontSize: '1rem', marginBottom: '1rem' }}>Route Stops</h2>
            <StopList stops={route.Stops} />
          </div>
        )}
      </div>
    </>
  );
}
