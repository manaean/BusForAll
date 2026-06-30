const DriverService = require('../services/driver.service');

const DriverController = {
  getAll: async (req, res, next) => {
    try { res.json(await DriverService.getAll()); } catch (err) { next(err); }
  },

  getById: async (req, res, next) => {
    try { res.json(await DriverService.getById(req.params.id)); } catch (err) { next(err); }
  },

  create: async (req, res, next) => {
    try { res.status(201).json(await DriverService.create(req.body)); } catch (err) { next(err); }
  },

  update: async (req, res, next) => {
    try { res.json(await DriverService.update(req.params.id, req.body)); } catch (err) { next(err); }
  },

  delete: async (req, res, next) => {
    try { res.json(await DriverService.delete(req.params.id)); } catch (err) { next(err); }
  },

  getMe: async (req, res, next) => {
    try { res.json(await DriverService.getByUserId(req.user.id)); } catch (err) { next(err); }
  },

  getMyAssignment: async (req, res, next) => {
    try {
      const assignment = await DriverService.getTodayAssignment(req.user.id);
      if (!assignment) return res.json({ message: 'No assignment for today' });
      res.json(assignment);
    } catch (err) { next(err); }
  }
};

module.exports = DriverController;
