const RouteService = require('../services/route.service');

const RouteController = {
  getAll: async (req, res, next) => {
    try {
      const routes = await RouteService.getAll();
      res.json(routes);
    } catch (err) { next(err); }
  },

  getById: async (req, res, next) => {
    try {
      const route = await RouteService.getById(req.params.id);
      res.json(route);
    } catch (err) { next(err); }
  },

  getStops: async (req, res, next) => {
    try {
      const stops = await RouteService.getStops(req.params.id);
      res.json(stops);
    } catch (err) { next(err); }
  },

  create: async (req, res, next) => {
    try {
      const route = await RouteService.create(req.body);
      res.status(201).json(route);
    } catch (err) { next(err); }
  },

  update: async (req, res, next) => {
    try {
      const route = await RouteService.update(req.params.id, req.body);
      res.json(route);
    } catch (err) { next(err); }
  },

  delete: async (req, res, next) => {
    try {
      const result = await RouteService.delete(req.params.id);
      res.json(result);
    } catch (err) { next(err); }
  },

  addStop: async (req, res, next) => {
    try {
      const { stopId, stopOrder } = req.body;
      const rs = await RouteService.addStop(req.params.id, stopId, stopOrder);
      res.status(201).json(rs);
    } catch (err) { next(err); }
  },

  removeStop: async (req, res, next) => {
    try {
      const result = await RouteService.removeStop(req.params.id, req.params.stopId);
      res.json(result);
    } catch (err) { next(err); }
  }
};

module.exports = RouteController;
