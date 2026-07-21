import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getMyDriverProfile, getMyAssignment } from '../../api/driver.api';
import { getRouteById } from '../../api/route.api';
import { getSchedulesByRoute } from '../../api/schedule.api';
import useAutoRefresh from '../../hooks/useAutoRefresh';
import { routeDistanceMeters } from '../../utils/tripPlanner';

export default function DriverHome() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [assignment, setAssignment] = useState(null);
  const [route, setRoute] = useState(null);
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  useAutoRefresh(async (isCancelled) => {
    const [p, a] = await Promise.allSettled([getMyDriverProfile(), getMyAssignment()]);
    if (isCancelled()) return;
    if (p.status === 'fulfilled') setProfile(p.value.data);
    if (a.status === 'fulfilled') {
      const assign = a.value.data?.id ? a.value.data : null;
      setAssignment(assign);
      const routeId = assign?.routeId || assign?.Route?.id;
      if (routeId) {
        const [r, s] = await Promise.all([getRouteById(routeId), getSchedulesByRoute(routeId)]);
        if (isCancelled()) return;
        setRoute(r.data);
        setSchedules(s.data);
      } else {
        setRoute(null);
        setSchedules([]);
      }
    }
    setLoading(false);
  }, []);

  const formatTime = (d) =>
    d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const formatDate = (d) =>
    d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  const stops = route?.Stops || [];

  return (
    <div style={{ padding: '2rem' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h1 style={{ fontWeight: 800, fontSize: '1.55rem', color: '#111827', margin: 0 }}>Assigned Duty Overview</h1>
          <p style={{ color: '#6b7280', fontSize: '.875rem', marginTop: '0.3rem', marginBottom: 0 }}>View your upcoming trips and route details</p>
        </div>
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, padding: '0.5rem 1rem', fontSize: '.9rem', fontWeight: 600, color: '#374151', whiteSpace: 'nowrap', textAlign: 'right' }}>
          <div>{formatTime(time)}</div>
          <div style={{ fontSize: '.75rem', fontWeight: 500, color: '#9ca3af', marginTop: 2 }}>{formatDate(time)}</div>
        </div>
      </div>

      {loading ? <p style={{ color: '#9ca3af' }}>Loading...</p> : (
        <>
          {/* Current Assignment */}
          <div style={{ background: 'linear-gradient(135deg, #0f2a3d 0%, #1a5a7a 100%)', borderRadius: 14, padding: '1.75rem 2rem', marginBottom: '1.5rem' }}>
            <div style={{ fontSize: '.72rem', fontWeight: 700, color: 'rgba(255,255,255,0.55)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: '0.5rem' }}>
              Current Assignment
            </div>
            {assignment ? (
              <>
                <h2 style={{ fontWeight: 800, fontSize: '1.5rem', color: '#fff', margin: '0 0 0.3rem' }}>
                  {assignment.Route?.name}
                </h2>
                <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '.875rem', margin: '0 0 1.25rem' }}>
                  Date: {assignment.assignmentDate}
                </p>
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <div style={{ background: 'rgba(255,255,255,0.13)', borderRadius: 8, padding: '0.5rem 1.1rem' }}>
                    <div style={{ fontSize: '.68rem', color: 'rgba(255,255,255,0.55)', marginBottom: 2 }}>Assigned Bus</div>
                    <div style={{ fontWeight: 700, fontSize: '1rem', color: '#fff' }}>{assignment.Bus?.plateNumber}</div>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.13)', borderRadius: 8, padding: '0.5rem 1.1rem' }}>
                    <div style={{ fontSize: '.68rem', color: 'rgba(255,255,255,0.55)', marginBottom: 2 }}>Status</div>
                    <div style={{ fontWeight: 700, fontSize: '1rem', color: '#4ade80' }}>Active Duty</div>
                  </div>
                </div>
              </>
            ) : (
              <p style={{ color: 'rgba(255,255,255,0.65)', margin: 0 }}>No assigned route yet.</p>
            )}
          </div>

          {assignment && (
            /* Daily Schedule + Route Preview */
            <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1.5rem', alignItems: 'flex-start' }} className="landing-columns">

              {/* Daily Schedule */}
              <div style={{ flex: 1, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '1.25rem' }}>
                <h2 style={{ fontWeight: 700, fontSize: '1rem', color: '#111827', marginTop: 0, marginBottom: '1rem' }}>Daily Schedule</h2>
                {schedules.length === 0 ? (
                  <p style={{ color: '#9ca3af', fontSize: '.875rem' }}>No schedule data available.</p>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: '#f8fafc', borderRadius: 10, padding: '0.85rem 1rem', marginBottom: '1rem' }}>
                    <div style={{ background: '#1a5a7a', borderRadius: 8, padding: '0.45rem 0.65rem', textAlign: 'center', flexShrink: 0 }}>
                      <div style={{ fontSize: '.6rem', color: 'rgba(255,255,255,0.65)', fontWeight: 600 }}>DEPARTS</div>
                      <div style={{ fontSize: '.9rem', fontWeight: 800, color: '#fff' }}>{schedules[0].departureTime?.slice(0, 5)}</div>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: '.875rem', color: '#111827' }}>{assignment?.Route?.name}</div>
                      <div style={{ fontSize: '.78rem', color: '#6b7280', marginTop: 2 }}>
                        Arrival: {schedules[0].arrivalTime?.slice(0, 5)} &middot; {schedules[0].days || 'Daily'}
                      </div>
                    </div>
                    <span style={{ background: '#dcfce7', color: '#16a34a', fontSize: '.7rem', fontWeight: 700, padding: '3px 10px', borderRadius: 20, flexShrink: 0 }}>
                      Active
                    </span>
                  </div>
                )}

                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <div style={{ flex: 1, background: '#f8fafc', borderRadius: 10, padding: '0.75rem 1rem' }}>
                    <div style={{ fontSize: '.72rem', color: '#9ca3af', marginBottom: 2 }}>Distance</div>
                    <div style={{ fontWeight: 700, fontSize: '1rem', color: '#111827' }}>{(routeDistanceMeters(stops) / 1000).toFixed(1)} km</div>
                  </div>
                  <div style={{ flex: 1, background: '#f8fafc', borderRadius: 10, padding: '0.75rem 1rem' }}>
                    <div style={{ fontSize: '.72rem', color: '#9ca3af', marginBottom: 2 }}>Stops</div>
                    <div style={{ fontWeight: 700, fontSize: '1rem', color: '#111827' }}>{stops.length}</div>
                  </div>
                </div>
              </div>

              {/* Route Preview */}
              <div style={{ width: 260, flexShrink: 0, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '1.25rem' }}>
                <h2 style={{ fontWeight: 700, fontSize: '1rem', color: '#111827', marginBottom: '1rem' }}>Route Preview</h2>
                {stops.length === 0 ? (
                  <p style={{ color: '#9ca3af', fontSize: '.875rem' }}>No stops available.</p>
                ) : stops.map((stop, i) => (
                  <div key={stop.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                      <div style={{
                        width: 12, height: 12, borderRadius: '50%', marginTop: 4,
                        border: `2px solid ${i === 0 ? '#1a5a7a' : i === stops.length - 1 ? '#16a34a' : '#d1d5db'}`,
                        background: i === 0 ? '#1a5a7a' : i === stops.length - 1 ? '#16a34a' : '#fff',
                      }} />
                      {i < stops.length - 1 && <div style={{ width: 2, height: 28, background: '#e5e7eb' }} />}
                    </div>
                    <div style={{ paddingBottom: i < stops.length - 1 ? '0.4rem' : 0 }}>
                      <div style={{ fontWeight: i === 0 || i === stops.length - 1 ? 700 : 500, fontSize: '.875rem', color: i === stops.length - 1 ? '#16a34a' : '#111827' }}>
                        {stop.name}
                      </div>
                      <div style={{ fontSize: '.73rem', color: '#9ca3af' }}>
                        {i === 0 ? 'Origin' : i === stops.length - 1 ? 'Final Destination' : `Stop ${i + 1}`}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
