const UserService = require('../services/user.service');

const UserController = {
  getAll: async (req, res, next) => {
    try {
      const users = await UserService.getAll();
      res.json(users);
    } catch (err) { next(err); }
  },

  getById: async (req, res, next) => {
    try {
      const user = await UserService.getById(req.params.id);
      res.json(user);
    } catch (err) { next(err); }
  },

  create: async (req, res, next) => {
    try {
      const user = await UserService.create(req.body);
      res.status(201).json(user);
    } catch (err) { next(err); }
  },

  update: async (req, res, next) => {
    try {
      const user = await UserService.update(req.params.id, req.body);
      res.json(user);
    } catch (err) { next(err); }
  },

  delete: async (req, res, next) => {
    try {
      const result = await UserService.delete(req.params.id);
      res.json(result);
    } catch (err) { next(err); }
  }
};

module.exports = UserController;
