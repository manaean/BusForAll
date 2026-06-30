export default function StopList({ stops }) {
  if (!stops || stops.length === 0) return <p style={{ color: 'var(--text-light)', fontSize: '.9rem' }}>No stops found.</p>;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      {stops.map((stop, i) => (
        <div key={stop.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ width: 14, height: 14, borderRadius: '50%', background: i === 0 ? 'var(--success)' : i === stops.length - 1 ? 'var(--danger)' : 'var(--primary)', marginTop: 4, flexShrink: 0 }} />
            {i < stops.length - 1 && <div style={{ width: 2, height: 28, background: 'var(--border)', marginTop: 2 }} />}
          </div>
          <div style={{ paddingBottom: 12 }}>
            <div style={{ fontWeight: 500, fontSize: '.95rem' }}>{stop.name}</div>
            {stop.RouteStop && <div style={{ color: 'var(--text-light)', fontSize: '.78rem' }}>Stop #{stop.RouteStop.stopOrder || stop.routeStop?.stopOrder}</div>}
          </div>
        </div>
      ))}
    </div>
  );
}
