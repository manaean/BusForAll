const colors = {
  delay:        { bg: '#FFF3E0', border: '#FF6F00', label: 'DELAY' },
  breakdown:    { bg: '#FFEBEE', border: '#C62828', label: 'BREAKDOWN' },
  cancellation: { bg: '#FFEBEE', border: '#C62828', label: 'CANCELLED' },
  general:      { bg: '#E3F2FD', border: '#1565C0', label: 'NOTICE' }
};

export default function AlertBanner({ alerts }) {
  if (!alerts || alerts.length === 0) return null;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, margin: '1rem 0' }}>
      {alerts.map(a => {
        const c = colors[a.type] || colors.general;
        return (
          <div key={a.id} style={{ background: c.bg, borderLeft: `4px solid ${c.border}`, borderRadius: 6, padding: '10px 14px' }}>
            <span style={{ background: c.border, color: '#fff', fontSize: '.7rem', padding: '2px 6px', borderRadius: 3, fontWeight: 700, marginRight: 8 }}>{c.label}</span>
            <strong>{a.title}</strong>
            {a.Route && <span style={{ color: '#666', fontSize: '.8rem' }}> — {a.Route.name}</span>}
            <p style={{ margin: '4px 0 0', fontSize: '.9rem', color: '#444' }}>{a.message}</p>
          </div>
        );
      })}
    </div>
  );
}
