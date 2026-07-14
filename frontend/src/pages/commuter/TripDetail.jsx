import { useEffect, useState, useMemo, Fragment } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { TileLayer, Polyline, CircleMarker, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { getSchedulesByRoute } from '../../api/schedule.api';
import { getAllDelays } from '../../api/driver.api';
import TripItinerary from '../../components/TripItinerary';
import ExpandableMap from '../../components/ExpandableMap';
import useSimulatedBus, { etaMinutes } from '../../hooks/useSimulatedBus';
import { haversine, routeDistanceMeters, rideMinutesForDistance } from '../../utils/tripPlanner';

const LEG_COLORS = ['#1a5a7a', '#2E7D32', '#AD1457', '#E65100'];

function FitBounds({ positions }) {
  const map = useMap();
  useEffect(() => {
    if (positions.length > 1) map.fitBounds(positions, { padding: [50, 50] });
  }, [map]); // eslint-disable-line
  return null;
}

function computeStopTimes(stops, departureTime) {
  if (!departureTime || !stops.length) return [];
  const [h, m] = departureTime.split(':').map(Number);
  const base = h * 60 + m;
  let cumMin = 0;
  return stops.map((s, i) => {
    if (i > 0) cumMin += rideMinutesForDistance(routeDistanceMeters([stops[i - 1], s]));
    const total = Math.round(base + cumMin);
    const hh = Math.floor(total / 60) % 24;
    const mm = total % 60;
    return { stop: s, time: `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}` };
  });
}

function stopStatus(i, busStopIdx) {
  if (i <= busStopIdx) return 'Passed';
  if (i === busStopIdx + 1) return 'Next';
  return 'Upcoming';
}

const busMarkerIcon = L.divIcon({
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

const userMarkerIcon = L.divIcon({
  className: '',
  html: `<div style="width:16px;height:16px;border-radius:50%;background:#3b82f6;border:2.5px solid #fff;box-shadow:0 2px 8px rgba(59,130,246,.6);"></div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

export default function TripDetail() {
  const { routeId } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();

  const option = state?.option || null;
  const primaryStops = option?.legs[0]?.fullStops || [];

  const [userLocation, setUserLocation] = useState(state?.userLocation || null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState(null);
  const [schedules, setSchedules] = useState([]);
  const [delayMinutes, setDelayMinutes] = useState(state?.delayMinutes || 0);

  useEffect(() => {
    getSchedulesByRoute(routeId).then(r => setSchedules(r.data)).catch(() => {});
    if (!state?.delayMinutes) {
      getAllDelays().then(r => {
        const d = r.data.find(d => d.isActive && d.routeId === parseInt(routeId));
        if (d) setDelayMinutes(d.delayMinutes);
      }).catch(() => {});
    }
  }, [routeId]); // eslint-disable-line

  // Must be called before any conditional return
  const bus = useSimulatedBus(primaryStops);

  const boardStop = useMemo(() => {
    if (!option) return null;
    const firstLeg = option.legs[0];
    if (firstLeg.boardStop) return firstLeg.boardStop;
    if (!userLocation || !primaryStops.length) return null;
    const destStop = option.destStop;
    const destIdx = primaryStops.findIndex(s => s.id === destStop.id);
    const candidates = destIdx > 0 ? primaryStops.slice(0, destIdx) : primaryStops;
    if (!candidates.length) return null;
    return candidates.reduce((best, s) => {
      const d = haversine(userLocation.lat, userLocation.lng, parseFloat(s.latitude), parseFloat(s.longitude));
      return d < haversine(userLocation.lat, userLocation.lng, parseFloat(best.latitude), parseFloat(best.longitude)) ? s : best;
    }, candidates[0]);
  }, [option, userLocation, primaryStops]);

  const requestLocation = () => {
    if (locationLoading) return;
    if (!navigator.geolocation) { setLocationError('Location is not supported by this browser.'); return; }
    if (!window.isSecureContext) { setLocationError('Location requires a secure connection.'); return; }
    setLocationError(null);
    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      pos => { setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }); setLocationLoading(false); },
      err => { setLocationLoading(false); setLocationError(err.code === 1 ? 'Location access was denied.' : 'Could not get your location. Try again.'); },
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 60000 }
    );
  };

  if (!option) {
    return (
      <div style={{ background: '#f8fafc', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: '#6b7280', marginBottom: '1rem' }}>No trip information found.</p>
          <button onClick={() => navigate('/routes')}
            style={{ background: '#1a5a7a', color: '#fff', border: 'none', borderRadius: 8, padding: '0.6rem 1.25rem', cursor: 'pointer', fontWeight: 600 }}>
            Search Routes
          </button>
        </div>
      </div>
    );
  }

  const firstLeg = option.legs[0];
  const lastLeg = option.legs[option.legs.length - 1];
  const destStop = option.destStop;
  const isMultiLeg = option.kind === 'itinerary' && option.legs.length > 1;
  const isDelayed = delayMinutes > 0;

  const boardIdx = boardStop ? primaryStops.findIndex(s => s.id === boardStop.id) : null;
  const destIdx = primaryStops.findIndex(s => s.id === destStop?.id);
  const busEta = boardIdx !== null ? etaMinutes(primaryStops, bus.stopIdx, bus.t, boardIdx) : null;
  const displayEta = busEta !== null ? busEta + delayMinutes : null;
  const rideStops = boardIdx !== null && destIdx > boardIdx ? destIdx - boardIdx : null;
  const rideMin = rideStops !== null ? Math.round(rideMinutesForDistance(routeDistanceMeters(primaryStops.slice(boardIdx, destIdx + 1)))) : null;
  const walkDist = userLocation && boardStop
    ? haversine(userLocation.lat, userLocation.lng, parseFloat(boardStop.latitude), parseFloat(boardStop.longitude))
    : option.walkDist;

  // Map data
  const routeLine = primaryStops.map(s => [parseFloat(s.latitude), parseFloat(s.longitude)]);
  const highlightLine = boardStop && destStop
    ? primaryStops.slice(boardIdx ?? 0, destIdx + 1).map(s => [parseFloat(s.latitude), parseFloat(s.longitude)])
    : destStop ? primaryStops.slice(0, destIdx + 1).map(s => [parseFloat(s.latitude), parseFloat(s.longitude)]) : routeLine;
  const fitPositions = [
    ...(boardStop ? [[parseFloat(boardStop.latitude), parseFloat(boardStop.longitude)]] : []),
    ...(destStop ? [[parseFloat(destStop.latitude), parseFloat(destStop.longitude)]] : []),
    ...(userLocation ? [[userLocation.lat, userLocation.lng]] : []),
  ];

  // Route header label
  const routeFrom = primaryStops[0]?.name || firstLeg.routeName;
  const routeTo = primaryStops[primaryStops.length - 1]?.name || destStop?.name || '';

  // Schedule
  const primarySchedule = schedules[0];
  const stopTimes = computeStopTimes(primaryStops, primarySchedule?.departureTime);

  const card = (children, extraStyle = {}) => (
    <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', overflow: 'hidden', marginBottom: '0.75rem', ...extraStyle }}>
      {children}
    </div>
  );

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh' }}>
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '1.5rem 1.5rem 3rem' }}>

        {/* ── 1. Header ── */}
        {card(
          <div style={{ padding: '1rem 1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
              <button onClick={() => navigate(-1)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', fontSize: '.875rem', fontWeight: 500, padding: 0, display: 'flex', alignItems: 'center', gap: '0.3rem', flexShrink: 0 }}>
                &#8592; Back
              </button>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                {option.legs.map((l, i) => (
                  <Fragment key={i}>
                    <span style={{ background: LEG_COLORS[i % LEG_COLORS.length], color: '#fff', borderRadius: 8, padding: '3px 12px', fontWeight: 800, fontSize: '.88rem' }}>
                      {l.routeName.split('—')[0].split('(')[0].trim()}
                    </span>
                    {i < option.legs.length - 1 && <span style={{ color: '#9ca3af', fontSize: '.8rem' }}>&#8594;</span>}
                  </Fragment>
                ))}
                <span style={{
                  background: isDelayed ? '#fef2f2' : '#f0fdf4',
                  color: isDelayed ? '#dc2626' : '#16a34a',
                  padding: '2px 10px', borderRadius: 20, fontSize: '.75rem', fontWeight: 700,
                  border: `1px solid ${isDelayed ? '#fecaca' : '#bbf7d0'}`,
                }}>
                  {isDelayed ? `Delayed +${delayMinutes} min` : 'On Time'}
                </span>
              </div>
            </div>
            <div style={{ fontSize: '.9rem', color: '#374151', fontWeight: 500 }}>
              {routeFrom} &#8594; {routeTo}
            </div>
          </div>
        )}

        {/* ── 2. Live map ── */}
        {isMultiLeg ? (
          <div style={{ marginBottom: '0.75rem' }}>
            <TripItinerary itinerary={option.raw} destStop={destStop} userPos={userLocation} />
          </div>
        ) : card(
          <ExpandableMap
            height={300}
            mapProps={{
              center: destStop ? [parseFloat(destStop.latitude), parseFloat(destStop.longitude)] : [11.5564, 104.9282],
              zoom: 13,
              scrollWheelZoom: false,
            }}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <FitBounds positions={fitPositions.length > 1 ? fitPositions : routeLine} />
            <Polyline positions={routeLine} color="#94a3b8" weight={2} opacity={0.35} dashArray="6 4" />
            <Polyline positions={highlightLine} color="#1a5a7a" weight={4} opacity={0.8} />
            {boardStop && (
              <CircleMarker center={[parseFloat(boardStop.latitude), parseFloat(boardStop.longitude)]}
                radius={9} fillColor="#16a34a" color="#fff" weight={2.5} fillOpacity={1}>
                <Popup><strong>Board here</strong><br />{boardStop.name}</Popup>
              </CircleMarker>
            )}
            {destStop && (
              <CircleMarker center={[parseFloat(destStop.latitude), parseFloat(destStop.longitude)]}
                radius={9} fillColor="#dc2626" color="#fff" weight={2.5} fillOpacity={1}>
                <Popup><strong>Destination</strong><br />{destStop.name}</Popup>
              </CircleMarker>
            )}
            {bus.lat !== null && (
              <Marker position={[bus.lat, bus.lng]} icon={busMarkerIcon}>
                <Popup>Bus en route</Popup>
              </Marker>
            )}
            {userLocation && (
              <Marker position={[userLocation.lat, userLocation.lng]} icon={userMarkerIcon}>
                <Popup>You are here</Popup>
              </Marker>
            )}
          </ExpandableMap>,
          { overflow: 'hidden' }
        )}

        {/* ── 3. Bus status ── */}
        {card(
          <div style={{ padding: '1rem 1.25rem' }}>
            <div style={{ fontSize: '.75rem', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: '0.65rem' }}>
              Bus status
            </div>
            {displayEta !== null ? (
              <>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '0.35rem' }}>
                  <div>
                    <span style={{ fontWeight: 900, fontSize: '1.6rem', color: isDelayed ? '#dc2626' : '#111827', lineHeight: 1 }}>{displayEta}</span>
                    <span style={{ fontSize: '.85rem', color: '#6b7280', marginLeft: '0.35rem' }}>min</span>
                    {isDelayed && <span style={{ fontSize: '.75rem', color: '#dc2626', fontWeight: 700, marginLeft: '0.5rem' }}>+{delayMinutes} delay</span>}
                  </div>
                  <span style={{
                    background: isDelayed ? '#fef2f2' : '#f0fdf4',
                    color: isDelayed ? '#dc2626' : '#16a34a',
                    padding: '4px 14px', borderRadius: 20, fontSize: '.8rem', fontWeight: 700,
                    border: `1px solid ${isDelayed ? '#fecaca' : '#bbf7d0'}`,
                  }}>
                    {isDelayed ? 'Delayed' : 'On Time'}
                  </span>
                </div>
                <div style={{ fontSize: '.83rem', color: '#6b7280' }}>
                  Arriving at <strong style={{ color: '#111827' }}>{boardStop?.name}</strong>
                </div>
              </>
            ) : (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '.85rem', color: '#6b7280' }}>Share your location to see when the bus arrives at your stop</span>
                  <button onClick={requestLocation} disabled={locationLoading}
                    style={{ padding: '6px 16px', background: locationLoading ? '#9ca3af' : '#1a5a7a', color: '#fff', border: 'none', borderRadius: 8, fontSize: '.82rem', fontWeight: 600, cursor: locationLoading ? 'default' : 'pointer', flexShrink: 0 }}>
                    {locationLoading ? 'Locating…' : 'Use My Location'}
                  </button>
                </div>
                {locationError && <div style={{ fontSize: '.78rem', color: '#dc2626', marginTop: '0.4rem' }}>{locationError}</div>}
              </div>
            )}
          </div>
        )}

        {/* ── 4. Your journey ── */}
        {card(
          <div style={{ padding: '1rem 1.25rem' }}>
            <div style={{ fontSize: '.75rem', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: '0.75rem' }}>
              Your journey
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
              {walkDist != null && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.875rem' }}>
                  <span style={{ color: '#6b7280' }}>Walk</span>
                  <span style={{ fontWeight: 600, color: '#374151' }}>{Math.round(walkDist)}m to stop</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.875rem' }}>
                <span style={{ color: '#6b7280' }}>Board</span>
                <span style={{ fontWeight: 600, color: '#374151' }}>{boardStop?.name || <span style={{ color: '#9ca3af', fontWeight: 400 }}>Share location to see</span>}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.875rem' }}>
                <span style={{ color: '#6b7280' }}>Get off</span>
                <span style={{ fontWeight: 600, color: '#374151' }}>{lastLeg.alightStop?.name || destStop?.name}</span>
              </div>
              {rideStops != null && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.875rem' }}>
                  <span style={{ color: '#6b7280' }}>Stops</span>
                  <span style={{ fontWeight: 600, color: '#374151' }}>{rideStops} stop{rideStops !== 1 ? 's' : ''} away</span>
                </div>
              )}
              {rideMin != null && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.875rem' }}>
                  <span style={{ color: '#6b7280' }}>Ride</span>
                  <span style={{ fontWeight: 600, color: '#374151' }}>~{rideMin} min</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── 5. Today's schedule ── */}
        {stopTimes.length > 0 && card(
          <>
            <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <div style={{ fontWeight: 700, fontSize: '.95rem', color: '#111827' }}>Today's Schedule</div>
              {primarySchedule && (
                <span style={{ fontSize: '.75rem', color: '#9ca3af' }}>
                  {primarySchedule.days.split(',').map(d => d.trim()).join(' · ')}
                </span>
              )}
            </div>
            {/* Column headers */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: '0.5rem', padding: '0.5rem 1.25rem', borderBottom: '1px solid #f3f4f6' }}>
              <span style={{ fontSize: '.72rem', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '.05em' }}>Stop</span>
              <span style={{ fontSize: '.72rem', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '.05em' }}>Time</span>
              <span style={{ fontSize: '.72rem', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '.05em' }}>Status</span>
            </div>
            {stopTimes.map(({ stop, time }, i) => {
              const status = stopStatus(i, bus.stopIdx);
              const isNext = status === 'Next';
              const isPassed = status === 'Passed';
              const isBoard = stop.id === boardStop?.id;
              const isAlight = stop.id === lastLeg.alightStop?.id;
              return (
                <div key={stop.id} style={{
                  display: 'grid', gridTemplateColumns: '1fr auto auto', gap: '0.5rem',
                  alignItems: 'center', padding: '0.6rem 1.25rem',
                  background: isNext ? '#eff6ff' : isBoard || isAlight ? '#f0fdf4' : 'transparent',
                  borderLeft: `3px solid ${isNext ? '#1a5a7a' : isBoard ? '#16a34a' : isAlight ? '#dc2626' : 'transparent'}`,
                  opacity: isPassed ? 0.45 : 1,
                }}>
                  <span style={{ fontSize: '.875rem', fontWeight: isNext || isBoard || isAlight ? 700 : 400, color: '#111827', minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {isNext ? '► ' : ''}{stop.name}
                    {isBoard && !isNext && <span style={{ marginLeft: '0.4rem', fontSize: '.68rem', color: '#16a34a', fontWeight: 700 }}>board</span>}
                    {isAlight && <span style={{ marginLeft: '0.4rem', fontSize: '.68rem', color: '#dc2626', fontWeight: 700 }}>your stop</span>}
                  </span>
                  <span style={{ fontSize: '.875rem', fontWeight: isNext ? 700 : 400, color: isNext ? '#1a5a7a' : '#6b7280', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>
                    {time}
                  </span>
                  <span style={{
                    fontSize: '.72rem', fontWeight: 700, whiteSpace: 'nowrap',
                    color: isNext ? '#1a5a7a' : isPassed ? '#9ca3af' : '#374151',
                  }}>
                    {status}
                  </span>
                </div>
              );
            })}
          </>
        )}

      </div>
    </div>
  );
}
