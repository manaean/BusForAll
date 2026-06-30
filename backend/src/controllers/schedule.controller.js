const ScheduleService = require('../services/schedule.service');

const ScheduleController = {
  getAll: async (req, res, next) => {
    try { res.json(await ScheduleService.getAll()); } catch (err) { next(err); }
  },

  getById: async (req, res, next) => {
    try { res.json(await ScheduleService.getById(req.params.id)); } catch (err) { next(err); }
  },

  getByRoute: async (req, res, next) => {
    try { res.json(await ScheduleService.getByRouteId(req.params.routeId)); } catch (err) { next(err); }
  },

  create: async (req, res, next) => {
    try { res.status(201).json(await ScheduleService.create(req.body)); } catch (err) { next(err); }
  },

  update: async (req, res, next) => {
    try { res.json(await ScheduleService.update(req.params.id, req.body)); } catch (err) { next(err); }
  },

  delete: async (req, res, next) => {
    try { res.json(await ScheduleService.delete(req.params.id)); } catch (err) { next(err); }
  }
};

module.exports = ScheduleController;
