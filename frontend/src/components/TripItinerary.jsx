import { useState, useEffect, Fragment } from 'react';
import { MapContainer, TileLayer, Polyline, CircleMarker, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const STEP_MS = 8000;
const TICK_MS = 100;
const LEG_COLORS = ['#1a5a7a', '#2E7D32', '#AD1457', '#E65100'];

function FitBounds({ positions }) {
  const map = useMap();
  useEffect(() => {
    if (positions.length > 1) map.fitBounds(positions, { padding: [50, 50] });
  }, [map]); // eslint-disable-line
  return null;
}

function busIcon(color) {
  return L.divIcon({
    className: '',
    html: `<div style="display:flex;flex-direction:column;align-items:center;">
      <div style="background:${color};border:2px solid #fff;border-radius:6px;padding:3px 5px;box-shadow:0 2px 8px rgba(0,0,0,.4);">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="white">
          <path d="M4 16c0 .88.39 1.67 1 2.22V20c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h8v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1.78c.61-.55 1-1.34 1-2.22V6c0-3.5-3.58-4-8-4s-8 .5-8 4v10zm3.5 1c-.83 0-1.5-.67-1.5-1.5S6.67 14 7.5 14s1.5.67 1.5 1.5S8.33 17 7.5 17zm9 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm1.5-6H6V6h12v5z"/>
        </svg>
      </div>
      <div style="width:0;height:0;border-left:5px solid transparent;border-right:5px solid transparent;border-top:6px solid ${color};"></div>
    </div>`,
    iconSize: [26, 38],
    iconAnchor: [13, 38],
  });
}

const userIcon = L.divIcon({
  className: '',
  html: `<div style="width:16px;height:16px;border-radius:50%;background:#3b82f6;border:2.5px solid #fff;box-shadow:0 2px 8px rgba(59,130,246,.6);"></div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

function LegBus({ leg, color }) {
  const [idx, setIdx] = useState(0);
  const [t, setT] = useState(0);

  useEffect(() => {
    if (leg.stops.length < 2) return;
    const interval = setInterval(() => {
      setT(prev => {
        if (prev >= 1) { setIdx(i => (i + 1) % leg.stops.length); return 0; }
        return Math.min(prev + TICK_MS / STEP_MS, 1);
      });
    }, TICK_MS);
    return () => clearInterval(interval);
  }, [leg.stops.length]);

  const cur = leg.stops[idx];
  const nxt = leg.stops[(idx + 1) % leg.stops.length];
  const lat = parseFloat(cur.latitude) + t * (parseFloat(nxt.latitude) - parseFloat(cur.latitude));
  const lng = parseFloat(cur.longitude) + t * (parseFloat(nxt.longitude) - parseFloat(cur.longitude));

  return (
    <Marker position={[lat, lng]} icon={busIcon(color)}>
      <Popup>{leg.routeName} — heading to {nxt.name}</Popup>
    </Marker>
  );
}

export default function TripItinerary({ itinerary, destStop, userPos }) {
  const { legs, walkMin, rideMin, transferMin, totalMin } = itinerary;
  const transfers = legs.length - 1;

  const fitPositions = [
    ...(userPos ? [[userPos.lat, userPos.lng]] : []),
    ...legs.flatMap(l => l.stops.map(s => [parseFloat(s.latitude), parseFloat(s.longitude)])),
  ];

  return (
    <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e5e7eb', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,.06)' }}>

      {/* Header */}
      <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #f3f4f6' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
          {legs.map((l, i) => (
            <span key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ background: LEG_COLORS[i % LEG_COLORS.length], color: '#fff', borderRadius: 8, padding: '4px 10px', fontWeight: 800, fontSize: '.85rem' }}>
                {l.routeName.split('—')[0].trim()}
              </span>
              {i < legs.length - 1 && <span style={{ color: '#9ca3af', fontSize: '.85rem' }}>&rarr; transfer &rarr;</span>}
            </span>
          ))}
          <span style={{ marginLeft: 'auto', background: '#dcfce7', color: '#16a34a', padding: '3px 10px', borderRadius: 20, fontSize: '.75rem', fontWeight: 700 }}>Live</span>
        </div>
        <div style={{ fontWeight: 700, fontSize: '.95rem', color: '#111827' }}>
          {legs[0].boardStop.name} &rarr; {destStop.name}
        </div>
        <div style={{ fontSize: '.8rem', color: '#6b7280', marginTop: 2 }}>
          {transfers === 0 ? 'Direct route' : `${transfers} transfer${transfers > 1 ? 's' : ''}`} · {Math.round(itinerary.walkDist)}m walk to board
        </div>
      </div>

      {/* Map */}
      <MapContainer
        style={{ height: 260, width: '100%' }}
        center={[parseFloat(destStop.latitude), parseFloat(destStop.longitude)]}
        zoom={13}
        scrollWheelZoom={false}
        zoomControl={true}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitBounds positions={fitPositions} />

        {legs.map((l, i) => {
          const color = LEG_COLORS[i % LEG_COLORS.length];
          const line = l.stops.map(s => [parseFloat(s.latitude), parseFloat(s.longitude)]);
          return (
            <Fragment key={i}>
              <Polyline positions={line} color={color} weight={4} opacity={0.85} />
              <LegBus leg={l} color={color} />
              {/* Board marker for this leg */}
              <CircleMarker center={[parseFloat(l.boardStop.latitude), parseFloat(l.boardStop.longitude)]}
                radius={9} fillColor={i === 0 ? '#16a34a' : '#f59e0b'} color="#fff" weight={2.5} fillOpacity={1}>
                <Popup><strong>{i === 0 ? 'Board here' : 'Transfer here'}</strong><br />{l.boardStop.name}</Popup>
              </CircleMarker>
            </Fragment>
          );
        })}

        {/* Final destination — red */}
        <CircleMarker center={[parseFloat(destStop.latitude), parseFloat(destStop.longitude)]}
          radius={9} fillColor="#dc2626" color="#fff" weight={2.5} fillOpacity={1}>
          <Popup><strong>Destination</strong><br />{destStop.name}</Popup>
        </CircleMarker>

        {/* User */}
        {userPos && (
          <Marker position={[userPos.lat, userPos.lng]} icon={userIcon}>
            <Popup>You are here</Popup>
          </Marker>
        )}
      </MapContainer>

      {/* ETA breakdown */}
      <div style={{ padding: '0.85rem 1.25rem', background: '#f8fafc' }}>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.65rem' }}>
          <span style={{ fontSize: '.78rem', color: '#6b7280', background: '#fff', border: '1px solid #e5e7eb', borderRadius: 20, padding: '3px 10px' }}>
            Walk ~{Math.max(1, Math.round(walkMin))} min
          </span>
          {legs.map((l, i) => (
            <span key={i} style={{ fontSize: '.78rem', color: '#6b7280', background: '#fff', border: '1px solid #e5e7eb', borderRadius: 20, padding: '3px 10px' }}>
              Ride {l.routeName.split('—')[0].trim()} ~{Math.round((l.stops.length - 1) * 3)} min
            </span>
          ))}
          {transfers > 0 && (
            <span style={{ fontSize: '.78rem', color: '#6b7280', background: '#fff', border: '1px solid #e5e7eb', borderRadius: 20, padding: '3px 10px' }}>
              Transfer wait ~{Math.round(transferMin)} min
            </span>
          )}
        </div>
        <div style={{ background: '#fff', borderRadius: 10, padding: '0.75rem 1rem', border: '1px solid #e5e7eb', textAlign: 'center' }}>
          <div style={{ fontSize: '.72rem', color: '#9ca3af', marginBottom: 3 }}>Estimated Time of Arrival</div>
          <div style={{ fontWeight: 800, fontSize: '1.15rem', color: '#16a34a' }}>~{Math.round(totalMin)} min</div>
          <div style={{ fontSize: '.72rem', color: '#6b7280', marginTop: 2 }}>{destStop.name}</div>
        </div>
      </div>
    </div>
  );
}
