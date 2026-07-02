import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Polyline, CircleMarker, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const STEP_MS = 8000;
const TICK_MS = 100;
const MINS_PER_STOP = 3;

function FitBounds({ positions }) {
  const map = useMap();
  useEffect(() => {
    if (positions.length > 1) map.fitBounds(positions, { padding: [50, 50] });
  }, [map]); // eslint-disable-line
  return null;
}

export default function TripCard({ route, destStop, boardingStop, boardingDist, userPos, allStops, onRequestLocation, locationLoading = false, locationError = null }) {
  const [stopIdx, setStopIdx] = useState(0);
  const [t, setT] = useState(0);

  useEffect(() => {
    if (allStops.length < 2) return;
    const interval = setInterval(() => {
      setT(prev => {
        if (prev >= 1) { setStopIdx(i => (i + 1) % allStops.length); return 0; }
        return Math.min(prev + TICK_MS / STEP_MS, 1);
      });
    }, TICK_MS);
    return () => clearInterval(interval);
  }, [allStops.length]);

  const destIdx = allStops.findIndex(s => s.id === destStop.id);
  const boardingIdx = boardingStop ? allStops.findIndex(s => s.id === boardingStop.id) : null;

  // ETA calculation (only when boarding stop known)
  let etaToBoarding = null, etaToDest = null;
  if (boardingIdx !== null) {
    const stopsToBoarding = boardingIdx >= stopIdx
      ? boardingIdx - stopIdx
      : (allStops.length - stopIdx) + boardingIdx;
    etaToBoarding = Math.max(1, Math.round((stopsToBoarding - t) * MINS_PER_STOP));
    etaToDest = etaToBoarding + (destIdx - boardingIdx) * MINS_PER_STOP;
  }

  const cur = allStops[stopIdx];
  const nxt = allStops[(stopIdx + 1) % allStops.length];
  const busLat = parseFloat(cur.latitude) + t * (parseFloat(nxt.latitude) - parseFloat(cur.latitude));
  const busLng = parseFloat(cur.longitude) + t * (parseFloat(nxt.longitude) - parseFloat(cur.longitude));

  const routeLine = allStops
    .filter(s => s.latitude && s.longitude)
    .map(s => [parseFloat(s.latitude), parseFloat(s.longitude)]);

  const highlightLine = boardingStop
    ? allStops.slice(boardingIdx, destIdx + 1).filter(s => s.latitude && s.longitude).map(s => [parseFloat(s.latitude), parseFloat(s.longitude)])
    : allStops.slice(0, destIdx + 1).filter(s => s.latitude && s.longitude).map(s => [parseFloat(s.latitude), parseFloat(s.longitude)]);

  const fitPositions = [
    ...(boardingStop ? [[parseFloat(boardingStop.latitude), parseFloat(boardingStop.longitude)]] : []),
    [parseFloat(destStop.latitude), parseFloat(destStop.longitude)],
    ...(userPos ? [[userPos.lat, userPos.lng]] : []),
  ];

  const busIcon = L.divIcon({
    className: '',
    html: `<div style="display:flex;flex-direction:column;align-items:center;">
      <div style="background:#1a5a7a;border:2px solid #fff;border-radius:6px;padding:3px 5px;box-shadow:0 2px 8px rgba(0,0,0,.4);">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="white">
          <path d="M4 16c0 .88.39 1.67 1 2.22V20c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h8v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1.78c.61-.55 1-1.34 1-2.22V6c0-3.5-3.58-4-8-4s-8 .5-8 4v10zm3.5 1c-.83 0-1.5-.67-1.5-1.5S6.67 14 7.5 14s1.5.67 1.5 1.5S8.33 17 7.5 17zm9 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm1.5-6H6V6h12v5z"/>
        </svg>
      </div>
      <div style="width:0;height:0;border-left:5px solid transparent;border-right:5px solid transparent;border-top:6px solid #1a5a7a;"></div>
    </div>`,
    iconSize: [26, 38],
    iconAnchor: [13, 38],
  });

  const userIcon = L.divIcon({
    className: '',
    html: `<div style="width:16px;height:16px;border-radius:50%;background:#3b82f6;border:2.5px solid #fff;box-shadow:0 2px 8px rgba(59,130,246,.6);"></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });

  return (
    <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e5e7eb', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,.06)' }}>

      {/* Header */}
      <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
        <div style={{ background: '#1a5a7a', color: '#fff', borderRadius: 8, padding: '4px 12px', fontWeight: 800, fontSize: '.88rem', flexShrink: 0 }}>
          {route.name}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: '.95rem', color: '#111827' }}>
            {boardingStop ? `${boardingStop.name} → ${destStop.name}` : `To: ${destStop.name}`}
          </div>
          <div style={{ fontSize: '.8rem', color: '#6b7280', marginTop: 1 }}>
            {boardingStop
              ? `Board ${Math.round(boardingDist)}m from you · ${destIdx - boardingIdx} stop${destIdx - boardingIdx !== 1 ? 's' : ''}`
              : `${destIdx + 1} stops along route`}
          </div>
        </div>
        <span style={{ background: '#dcfce7', color: '#16a34a', padding: '3px 10px', borderRadius: 20, fontSize: '.75rem', fontWeight: 700, flexShrink: 0 }}>Live</span>
      </div>

      {/* Map */}
      <MapContainer
        style={{ height: 240, width: '100%' }}
        center={[parseFloat(destStop.latitude), parseFloat(destStop.longitude)]}
        zoom={13}
        scrollWheelZoom={false}
        zoomControl={true}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitBounds positions={fitPositions.length > 0 ? fitPositions : routeLine} />

        {/* Full route (faint) */}
        <Polyline positions={routeLine} color="#94a3b8" weight={2} opacity={0.35} dashArray="6 4" />
        {/* Highlighted segment */}
        <Polyline positions={highlightLine} color="#1a5a7a" weight={4} opacity={0.8} />

        {/* Boarding stop — green (only when location known) */}
        {boardingStop && (
          <CircleMarker center={[parseFloat(boardingStop.latitude), parseFloat(boardingStop.longitude)]}
            radius={9} fillColor="#16a34a" color="#fff" weight={2.5} fillOpacity={1}>
            <Popup><strong>Board here</strong><br />{boardingStop.name}</Popup>
          </CircleMarker>
        )}

        {/* Destination — red */}
        <CircleMarker center={[parseFloat(destStop.latitude), parseFloat(destStop.longitude)]}
          radius={9} fillColor="#dc2626" color="#fff" weight={2.5} fillOpacity={1}>
          <Popup><strong>Destination</strong><br />{destStop.name}</Popup>
        </CircleMarker>

        {/* Bus */}
        <Marker position={[busLat, busLng]} icon={busIcon}>
          <Popup>Bus heading to {nxt.name}</Popup>
        </Marker>

        {/* User */}
        {userPos && (
          <Marker position={[userPos.lat, userPos.lng]} icon={userIcon}>
            <Popup>You are here</Popup>
          </Marker>
        )}
      </MapContainer>

      {/* ETA / location prompt */}
      {etaToBoarding !== null ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', padding: '0.85rem 1.25rem', background: '#f8fafc' }}>
          <div style={{ background: '#fff', borderRadius: 10, padding: '0.75rem 1rem', border: '1px solid #e5e7eb', textAlign: 'center' }}>
            <div style={{ fontSize: '.72rem', color: '#9ca3af', marginBottom: 3 }}>Bus arrives your stop</div>
            <div style={{ fontWeight: 800, fontSize: '1.15rem', color: '#1a5a7a' }}>~{etaToBoarding} min</div>
            <div style={{ fontSize: '.72rem', color: '#6b7280', marginTop: 2 }}>{boardingStop.name}</div>
          </div>
          <div style={{ background: '#fff', borderRadius: 10, padding: '0.75rem 1rem', border: '1px solid #e5e7eb', textAlign: 'center' }}>
            <div style={{ fontSize: '.72rem', color: '#9ca3af', marginBottom: 3 }}>Estimated Time of Arrival</div>
            <div style={{ fontWeight: 800, fontSize: '1.15rem', color: '#16a34a' }}>~{etaToDest} min</div>
            <div style={{ fontSize: '.72rem', color: '#6b7280', marginTop: 2 }}>{destStop.name}</div>
          </div>
        </div>
      ) : (
        <div style={{ padding: '0.85rem 1.25rem', background: '#f8fafc' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '.85rem', color: '#6b7280' }}>Share your location to see ETA and your nearest boarding stop</span>
            <button onClick={onRequestLocation} disabled={locationLoading}
              style={{ padding: '6px 16px', background: locationLoading ? '#9ca3af' : '#1a5a7a', color: '#fff', border: 'none', borderRadius: 8, fontSize: '.82rem', fontWeight: 600, cursor: locationLoading ? 'default' : 'pointer', flexShrink: 0 }}>
              {locationLoading ? 'Locating…' : 'Use My Location'}
            </button>
          </div>
          {locationError && (
            <div style={{ fontSize: '.78rem', color: '#dc2626', marginTop: '0.5rem' }}>{locationError}</div>
          )}
        </div>
      )}
    </div>
  );
}
