const DelayService = require('../services/delay.service');

const DelayController = {
  getAll: async (req, res, next) => {
    try {
      const activeOnly = req.query.active === 'true';
      res.json(await DelayService.getAll(activeOnly));
    } catch (err) { next(err); }
  },

  getById: async (req, res, next) => {
    try { res.json(await DelayService.getById(req.params.id)); } catch (err) { next(err); }
  },

  getActiveByRoute: async (req, res, next) => {
    try {
      const delay = await DelayService.getActiveByRoute(req.params.routeId);
      res.json(delay || { message: 'No active delay for this route' });
    } catch (err) { next(err); }
  },

  create: async (req, res, next) => {
    try { res.status(201).json(await DelayService.create(req.body)); } catch (err) { next(err); }
  },

  resolve: async (req, res, next) => {
    try { res.json(await DelayService.resolve(req.params.id)); } catch (err) { next(err); }
  },

  delete: async (req, res, next) => {
    try { res.json(await DelayService.delete(req.params.id)); } catch (err) { next(err); }
  }
};

module.exports = DelayController;
