const AssignmentService = require('../services/assignment.service');

const AssignmentController = {
  getAll: async (req, res, next) => {
    try { res.json(await AssignmentService.getAll(req.query.driverId)); } catch (err) { next(err); }
  },

  getById: async (req, res, next) => {
    try { res.json(await AssignmentService.getById(req.params.id)); } catch (err) { next(err); }
  },

  create: async (req, res, next) => {
    try { res.status(201).json(await AssignmentService.create(req.body)); } catch (err) { next(err); }
  },

  update: async (req, res, next) => {
    try { res.json(await AssignmentService.update(req.params.id, req.body)); } catch (err) { next(err); }
  },

  delete: async (req, res, next) => {
    try { res.json(await AssignmentService.delete(req.params.id)); } catch (err) { next(err); }
  }
};

module.exports = AssignmentController;
