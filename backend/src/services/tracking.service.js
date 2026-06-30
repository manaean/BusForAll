const { BusTracking, Route, Bus, Stop, Schedule, Delay } = require('../models');

const timeToMinutes = (t) => {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
};

const TrackingService = {
  getByRoute: async (routeId) => {
    const tracking = await BusTracking.findOne({
      where: { routeId },
      include: [
        { model: Bus, as: 'Bus', attributes: ['id', 'plateNumber', 'capacity'] },
        { model: Stop, as: 'CurrentStop', attributes: ['id', 'name'] },
        {
          model: Route, as: 'Route',
          include: [
            { model: Schedule, as: 'Schedules', order: [['departureTime', 'ASC']] },
            { model: Delay, as: 'Delays', where: { isActive: true }, required: false }
          ]
        }
      ]
    });

    if (!tracking) throw Object.assign(new Error('Tracking data not found for this route'), { status: 404 });

    const progress = parseFloat(tracking.progress);
    const schedules = tracking.Route?.Schedules || [];
    const activeDelay = tracking.Route?.Delays?.[0] || null;
    const delayMinutes = activeDelay ? activeDelay.delayMinutes : 0;

    let etaMinutes = null;
    let etaTime = null;
    if (schedules.length > 0) {
      const s = schedules[0];
      const total = timeToMinutes(s.arrivalTime) - timeToMinutes(s.departureTime);
      const remaining = Math.max(0, Math.round(total * (1 - progress))) + delayMinutes;
      etaMinutes = remaining;
      const now = new Date();
      now.setMinutes(now.getMinutes() + remaining);
      etaTime = now.toTimeString().slice(0, 5);
    }

    return {
      routeId: tracking.routeId,
      routeName: tracking.Route?.name,
      progress,
      isRunning: tracking.isRunning,
      bus: tracking.Bus,
      currentStop: tracking.CurrentStop,
      etaMinutes,
      etaTime,
      activeDelay: activeDelay ? { minutes: activeDelay.delayMinutes, reason: activeDelay.reason } : null,
      lastUpdated: tracking.lastUpdated
    };
  },

  start: async (routeId, busId) => {
    const route = await Route.findByPk(routeId);
    if (!route) throw Object.assign(new Error('Route not found'), { status: 404 });

    await BusTracking.upsert({
      routeId,
      busId: busId || null,
      progress: 0,
      currentStopId: null,
      isRunning: true,
      lastUpdated: new Date()
    });
    return { message: 'Tracking started' };
  },

  stop: async (routeId) => {
    await BusTracking.update({ isRunning: false }, { where: { routeId } });
    return { message: 'Tracking stopped' };
  },

  reset: async (routeId) => {
    await BusTracking.update({ progress: 0, currentStopId: null, isRunning: false, lastUpdated: new Date() }, { where: { routeId } });
    return { message: 'Tracking reset' };
  },

  // Called by the background simulation every 5 seconds
  tickAll: async () => {
    const running = await BusTracking.findAll({
      where: { isRunning: true },
      include: [{
        model: Route, as: 'Route',
        include: [{ model: Stop, as: 'Stops', through: { attributes: ['stopOrder'] } }]
      }]
    });

    for (const t of running) {
      let progress = parseFloat(t.progress) + 0.005;
      if (progress >= 1.0) { progress = 1.0; }

      const stops = (t.Route?.Stops || []).sort((a, b) => a.RouteStop?.stopOrder - b.RouteStop?.stopOrder);
      let currentStopId = t.currentStopId;
      if (stops.length > 0) {
        const idx = Math.min(Math.floor(progress * stops.length), stops.length - 1);
        currentStopId = stops[idx]?.id || null;
      }

      await t.update({ progress, currentStopId, lastUpdated: new Date() });
      if (progress >= 1.0) await t.update({ isRunning: false });
    }
  }
};

module.exports = TrackingService;
