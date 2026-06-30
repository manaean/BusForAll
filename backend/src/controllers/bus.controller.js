const BusService = require('../services/bus.service');

const BusController = {
  getAll: async (req, res, next) => {
    try { res.json(await BusService.getAll()); } catch (err) { next(err); }
  },

  getById: async (req, res, next) => {
    try { res.json(await BusService.getById(req.params.id)); } catch (err) { next(err); }
  },

  create: async (req, res, next) => {
    try { res.status(201).json(await BusService.create(req.body)); } catch (err) { next(err); }
  },

  update: async (req, res, next) => {
    try { res.json(await BusService.update(req.params.id, req.body)); } catch (err) { next(err); }
  },

  delete: async (req, res, next) => {
    try { res.json(await BusService.delete(req.params.id)); } catch (err) { next(err); }
  }
};

module.exports = BusController;
