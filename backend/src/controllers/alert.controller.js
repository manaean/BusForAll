const AlertService = require('../services/alert.service');

const AlertController = {
  getAll: async (req, res, next) => {
    try {
      const activeOnly = req.query.active === 'true';
      res.json(await AlertService.getAll(activeOnly));
    } catch (err) { next(err); }
  },

  getById: async (req, res, next) => {
    try { res.json(await AlertService.getById(req.params.id)); } catch (err) { next(err); }
  },

  create: async (req, res, next) => {
    try { res.status(201).json(await AlertService.create(req.body)); } catch (err) { next(err); }
  },

  update: async (req, res, next) => {
    try { res.json(await AlertService.update(req.params.id, req.body)); } catch (err) { next(err); }
  },

  resolve: async (req, res, next) => {
    try { res.json(await AlertService.resolve(req.params.id)); } catch (err) { next(err); }
  },

  delete: async (req, res, next) => {
    try { res.json(await AlertService.delete(req.params.id)); } catch (err) { next(err); }
  }
};

module.exports = AlertController;
