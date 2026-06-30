import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Polyline, CircleMarker, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { getRouteById } from '../api/route.api';

const STEP_MS = 6000;
const TICK_MS = 100;

function FitBounds({ positions }) {
  const map = useMap();
  useEffect(() => {
    if (positions.length > 1) map.fitBounds(positions, { padding: [40, 40] });
  }, [map, positions]);
  return null;
}

export default function BusTracker({ routeId }) {
  const [route, setRoute] = useState(null);
  const [stops, setStops] = useState([]);
  const [stopIdx, setStopIdx] = useState(0);
  const [t, setT] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userPos, setUserPos] = useState(null);

  useEffect(() => {
    if (!navigator.geolocation) return;
    const watchId = navigator.geolocation.watchPosition(
      pos => setUserPos({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => {}
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  useEffect(() => {
    getRouteById(routeId)
      .then(r => {
        const sorted = [...(r.data.Stops || [])]
          .sort((a, b) => (a.RouteStop?.stopOrder ?? 0) - (b.RouteStop?.stopOrder ?? 0))
          .filter(s => s.latitude && s.longitude);
        setRoute(r.data);
        setStops(sorted);
        setLoading(false);
      })
      .catch(() => { setError('Could not load route data.'); setLoading(false); });
  }, [routeId]);

  useEffect(() => {
    if (stops.length < 2) return;
    const interval = setInterval(() => {
      setT(prev => {
        if (prev >= 1) {
          setStopIdx(i => (i + 1) % stops.length);
          return 0;
        }
        return Math.min(prev + TICK_MS / STEP_MS, 1);
      });
    }, TICK_MS);
    return () => clearInterval(interval);
  }, [stops]);

  if (loading) return <div style={{ padding: '3rem', textAlign: 'center', color: '#9ca3af' }}>Loading map...</div>;
  if (error) return <div style={{ padding: '3rem', textAlign: 'center', color: '#9ca3af' }}>{error}</div>;
  if (stops.length < 2) return <div style={{ padding: '3rem', textAlign: 'center', color: '#9ca3af' }}>Not enough stop coordinates to simulate tracking.</div>;

  const current = stops[stopIdx];
  const next = stops[(stopIdx + 1) % stops.length];
  const busLat = parseFloat(current.latitude) + t * (parseFloat(next.latitude) - parseFloat(current.latitude));
  const busLng = parseFloat(current.longitude) + t * (parseFloat(next.longitude) - parseFloat(current.longitude));
  const positions = stops.map(s => [parseFloat(s.latitude), parseFloat(s.longitude)]);
  const progress = Math.round(((stopIdx + t) / stops.length) * 100);

  const busIcon = L.divIcon({
    className: '',
    html: `
      <div style="display:flex;flex-direction:column;align-items:center;">
        <div style="background:#1a5a7a;border:2.5px solid #fff;border-radius:8px;padding:4px 6px;box-shadow:0 3px 10px rgba(0,0,0,.45);display:flex;align-items:center;justify-content:center;">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="white">
            <path d="M4 16c0 .88.39 1.67 1 2.22V20c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h8v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1.78c.61-.55 1-1.34 1-2.22V6c0-3.5-3.58-4-8-4s-8 .5-8 4v10zm3.5 1c-.83 0-1.5-.67-1.5-1.5S6.67 14 7.5 14s1.5.67 1.5 1.5S8.33 17 7.5 17zm9 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm1.5-6H6V6h12v5z"/>
          </svg>
        </div>
        <div style="width:0;height:0;border-left:6px solid transparent;border-right:6px solid transparent;border-top:7px solid #1a5a7a;"></div>
      </div>`,
    iconSize: [32, 45],
    iconAnchor: [16, 45],
  });

  const userIcon = L.divIcon({
    className: '',
    html: `<div style="width:18px;height:18px;border-radius:50%;background:#3b82f6;border:3px solid #fff;box-shadow:0 2px 10px rgba(59,130,246,.6);"></div>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
  });

  return (
    <div>
      <MapContainer
        style={{ height: 420, width: '100%', borderRadius: 12, overflow: 'hidden' }}
        center={positions[0]}
        zoom={14}
        scrollWheelZoom={true}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitBounds positions={positions} />

        {/* Route line */}
        <Polyline positions={positions} color="#1a5a7a" weight={4} opacity={0.65} />

        {/* Stop markers */}
        {stops.map((stop, idx) => (
          <CircleMarker
            key={stop.id}
            center={[parseFloat(stop.latitude), parseFloat(stop.longitude)]}
            radius={idx === 0 || idx === stops.length - 1 ? 9 : 6}
            fillColor={idx === 0 ? '#16a34a' : idx === stops.length - 1 ? '#dc2626' : '#fff'}
            color="#1a5a7a"
            weight={2}
            fillOpacity={1}>
            <Popup>
              <strong>{stop.name}</strong>
              {idx === 0 && <div style={{ color: '#16a34a', fontSize: '.8rem' }}>First Stop</div>}
              {idx === stops.length - 1 && <div style={{ color: '#dc2626', fontSize: '.8rem' }}>Last Stop</div>}
            </Popup>
          </CircleMarker>
        ))}

        {/* Bus marker */}
        <Marker position={[busLat, busLng]} icon={busIcon}>
          <Popup>Bus is here · heading to {next.name}</Popup>
        </Marker>

        {/* User location */}
        {userPos && (
          <Marker position={[userPos.lat, userPos.lng]} icon={userIcon}>
            <Popup>You are here</Popup>
          </Marker>
        )}
      </MapContainer>

      {/* Status bar */}
      <div style={{ marginTop: '1rem', background: '#fff', borderRadius: 12, padding: '1rem 1.25rem', border: '1px solid #e5e7eb' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div style={{ fontWeight: 700, fontSize: '.95rem', color: '#111827' }}>{route?.name}</div>
          <span style={{ background: '#dcfce7', color: '#16a34a', padding: '3px 12px', borderRadius: 20, fontSize: '.78rem', fontWeight: 700 }}>Live (Simulated)</span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.78rem', color: '#6b7280', marginBottom: 4 }}>
          <span>Route Progress</span><span>{progress}%</span>
        </div>
        <div style={{ background: '#e5e7eb', borderRadius: 8, height: 8, overflow: 'hidden', marginBottom: '0.85rem' }}>
          <div style={{ background: '#1a5a7a', height: '100%', width: `${progress}%`, transition: 'width .1s linear', borderRadius: 8 }} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
          {[
            { label: 'Current Stop', value: current.name },
            { label: 'Next Stop', value: next.name },
            { label: 'Stops', value: `${stopIdx + 1} / ${stops.length}` },
          ].map(c => (
            <div key={c.label} style={{ background: '#f8fafc', borderRadius: 8, padding: '0.6rem 0.75rem' }}>
              <div style={{ fontSize: '.72rem', color: '#9ca3af', marginBottom: 2 }}>{c.label}</div>
              <div style={{ fontWeight: 600, fontSize: '.85rem', color: '#111827' }}>{c.value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
