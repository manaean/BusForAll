const StopService = require('../services/stop.service');

const StopController = {
  getAll: async (req, res, next) => {
    try { res.json(await StopService.getAll()); } catch (err) { next(err); }
  },

  getById: async (req, res, next) => {
    try { res.json(await StopService.getById(req.params.id)); } catch (err) { next(err); }
  },

  create: async (req, res, next) => {
    try { res.status(201).json(await StopService.create(req.body)); } catch (err) { next(err); }
  },

  update: async (req, res, next) => {
    try { res.json(await StopService.update(req.params.id, req.body)); } catch (err) { next(err); }
  },

  delete: async (req, res, next) => {
    try { res.json(await StopService.delete(req.params.id)); } catch (err) { next(err); }
  }
};

module.exports = StopController;
