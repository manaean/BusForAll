const RouteModel = require('../models/route.model');

const RouteService = {

  getAllRoutes: async () => {
    return await RouteModel.getAll();
  },

  getRouteById: async (id) => {
    const route = await RouteModel.getById(id);
    if (!route) throw new Error('Route not found');
    return route;
  },

  createRoute: async (name, description) => {
    const id = await RouteModel.create(name, description);
    return { id, name, description };
  },

  updateRoute: async (id, name, description) => {
    const affected = await RouteModel.update(id, name, description);
    if (!affected) throw new Error('Route not found');
    return { id, name, description };
  },

  deleteRoute: async (id) => {
    const affected = await RouteModel.delete(id);
    if (!affected) throw new Error('Route not found');
    return { message: 'Route deleted successfully' };
  }

};

module.exports = RouteService;