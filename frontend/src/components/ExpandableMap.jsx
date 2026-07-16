import { useState, useEffect } from 'react';
import { MapContainer, useMap } from 'react-leaflet';

// Leaflet doesn't notice its container resizing on its own — nudge it after
// the fullscreen toggle's CSS change has taken effect.
function InvalidateOnToggle({ trigger }) {
  const map = useMap();
  useEffect(() => {
    const id = setTimeout(() => map.invalidateSize(), 260);
    return () => clearTimeout(id);
  }, [trigger, map]);
  return null;
}

// Drop-in replacement for <MapContainer>: same children, plus a fullscreen
// expand button. `mapProps` carries whatever props would normally go on
// MapContainer itself (center, zoom, scrollWheelZoom, ...).
export default function ExpandableMap({ height = 300, borderRadius = 0, mapProps = {}, children }) {
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (!expanded) return;
    const onKey = e => { if (e.key === 'Escape') setExpanded(false); };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }, [expanded]);

  return (
    <div style={expanded
      ? { position: 'fixed', inset: 0, zIndex: 2000, background: '#000' }
      : { position: 'relative', height, width: '100%', borderRadius, overflow: 'hidden' }}>
      <MapContainer style={{ height: '100%', width: '100%' }} {...mapProps}>
        {children}
        <InvalidateOnToggle trigger={expanded} />
      </MapContainer>
      <button
        type="button"
        onClick={() => setExpanded(v => !v)}
        title={expanded ? 'Exit full screen' : 'View full screen'}
        style={{
          position: 'absolute', bottom: 10, left: 10, zIndex: 1000,
          width: 34, height: 34, borderRadius: 8, border: '1px solid #e5e7eb',
          background: '#fff', color: '#374151', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.1rem', lineHeight: 1, boxShadow: '0 2px 8px rgba(0,0,0,.25)', padding: 0,
        }}>
        {expanded ? '✕' : '⛶'}
      </button>
    </div>
  );
}
