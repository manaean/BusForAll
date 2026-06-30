const TrackingService = require('../services/tracking.service');

const TrackingController = {
  getByRoute: async (req, res, next) => {
    try { res.json(await TrackingService.getByRoute(req.params.routeId)); } catch (err) { next(err); }
  },

  start: async (req, res, next) => {
    try {
      const { busId } = req.body;
      res.json(await TrackingService.start(req.params.routeId, busId));
    } catch (err) { next(err); }
  },

  stop: async (req, res, next) => {
    try { res.json(await TrackingService.stop(req.params.routeId)); } catch (err) { next(err); }
  },

  reset: async (req, res, next) => {
    try { res.json(await TrackingService.reset(req.params.routeId)); } catch (err) { next(err); }
  }
};

module.exports = TrackingController;
