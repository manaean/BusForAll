import useSimulatedBus, { etaMinutes } from '../hooks/useSimulatedBus';
import { RIDE_MIN_PER_STOP, TRANSFER_PENALTY_MIN } from '../utils/tripPlanner';

const LEG_COLORS = ['#1a5a7a', '#2E7D32', '#AD1457', '#E65100'];

function formatTime(date) {
  return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

function legStopCount(leg) {
  const boardIdx = leg.boardStop ? leg.fullStops.findIndex(s => s.id === leg.boardStop.id) : 0;
  const alightIdx = leg.fullStops.findIndex(s => s.id === leg.alightStop.id);
  return Math.max(0, alightIdx - boardIdx);
}

export default function TripResultRow({ option, delayMinutes = 0, onSelect }) {
  const firstLeg = option.legs[0];
  const bus = useSimulatedBus(firstLeg.fullStops);

  const boardIdx = firstLeg.boardStop ? firstLeg.fullStops.findIndex(s => s.id === firstLeg.boardStop.id) : null;
  const busEta = boardIdx !== null ? etaMinutes(bus.stopIdx, bus.t, boardIdx, firstLeg.fullStops.length, RIDE_MIN_PER_STOP) : null;
  const displayEta = busEta !== null ? busEta + delayMinutes : null;

  const transfers = option.legs.length - 1;
  const totalStops = option.legs.reduce((sum, l) => sum + legStopCount(l), 0);
  const rideMin = totalStops * RIDE_MIN_PER_STOP + transfers * TRANSFER_PENALTY_MIN;

  const now = Date.now();
  const leaveByDate = displayEta !== null && option.walkMin !== null
    ? new Date(now + Math.max(0, displayEta - option.walkMin) * 60000)
    : null;
  const arrivalDate = displayEta !== null
    ? new Date(now + (displayEta + rideMin) * 60000)
    : null;

  return (
    <div
      onClick={onSelect}
      style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,.04)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.9rem', padding: '0.9rem 1.1rem' }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,.09)'}
      onMouseLeave={e => e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,.04)'}>

      {/* Headline ETA */}
      <div style={{ minWidth: 64, textAlign: 'center', flexShrink: 0 }}>
        {displayEta === null ? (
          <div style={{ fontSize: '.78rem', color: '#9ca3af', fontWeight: 600 }}>—</div>
        ) : (
          <>
            <div style={{ fontWeight: 800, fontSize: '1.4rem', lineHeight: 1, color: delayMinutes > 0 ? '#dc2626' : '#111827' }}>
              {displayEta}<span style={{ fontSize: '.7rem', fontWeight: 600, marginLeft: 2 }}>min</span>
            </div>
            {delayMinutes > 0 && (
              <div style={{ fontSize: '.7rem', color: '#dc2626', fontWeight: 700, marginTop: 2 }}>delayed +{delayMinutes}</div>
            )}
          </>
        )}
      </div>

      {/* Route badges + stop/walk details */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.3rem' }}>
          {option.legs.map((l, i) => (
            <span key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ width: 10, height: 10, borderRadius: 3, background: LEG_COLORS[i % LEG_COLORS.length], flexShrink: 0 }} />
              <span style={{ fontWeight: 700, fontSize: '.85rem', color: '#111827' }}>{l.routeName.split('—')[0].split('(')[0].trim()}</span>
              {i < option.legs.length - 1 && <span style={{ color: '#9ca3af', fontSize: '.8rem' }}>&rarr;</span>}
            </span>
          ))}
        </div>
        <div style={{ fontSize: '.8rem', color: '#6b7280' }}>
          {firstLeg.boardStop ? (
            <>Board at {firstLeg.boardStop.name} · {Math.round(option.walkMin)} min walk{leaveByDate ? ` · leave by ${formatTime(leaveByDate)}` : ''}</>
          ) : (
            <>Tap to see live map and schedule</>
          )}
        </div>
        <div style={{ fontSize: '.78rem', color: '#9ca3af', marginTop: 2 }}>
          {totalStops} stop{totalStops !== 1 ? 's' : ''}{transfers > 0 ? ` · ${transfers} transfer${transfers > 1 ? 's' : ''}` : ''}
          {arrivalDate ? ` · arrives ${formatTime(arrivalDate)}` : ''}
        </div>
      </div>

      <div style={{ color: '#9ca3af', fontSize: '1.1rem', flexShrink: 0 }}>&#8250;</div>
    </div>
  );
}
