const { Route, Stop, RouteStop, Schedule, Delay } = require('../models');

const RouteService = {
  getAll: () => Route.findAll({
    include: [{ model: Stop, as: 'Stops', through: { attributes: ['stopOrder'] } }],
    order: [['name', 'ASC']]
  }),

  getById: async (id) => {
    const route = await Route.findByPk(id, {
      include: [
        { model: Stop, as: 'Stops', through: { attributes: ['stopOrder', 'id'] } },
        { model: Schedule, as: 'Schedules', order: [['departureTime', 'ASC']] },
        { model: Delay, as: 'Delays', where: { isActive: true }, required: false }
      ]
    });
    if (!route) throw Object.assign(new Error('Route not found'), { status: 404 });
    return route;
  },

  getStops: async (routeId) => {
    const route = await Route.findByPk(routeId, {
      include: [{ model: Stop, as: 'Stops', through: { attributes: ['stopOrder'] } }]
    });
    if (!route) throw Object.assign(new Error('Route not found'), { status: 404 });
    return route.Stops || [];
  },

  create: async ({ name, description }) => {
    if (!name) throw Object.assign(new Error('Route name is required'), { status: 400 });
    return Route.create({ name, description });
  },

  update: async (id, { name, description }) => {
    const route = await Route.findByPk(id);
    if (!route) throw Object.assign(new Error('Route not found'), { status: 404 });
    await route.update({ name, description });
    return route;
  },

  delete: async (id) => {
    const route = await Route.findByPk(id);
    if (!route) throw Object.assign(new Error('Route not found'), { status: 404 });
    await route.destroy();
    return { message: 'Route deleted successfully' };
  },

  addStop: async (routeId, stopId, stopOrder) => {
    if (!routeId || !stopId || stopOrder === undefined) {
      throw Object.assign(new Error('routeId, stopId, and stopOrder are required'), { status: 400 });
    }
    return RouteStop.create({ routeId, stopId, stopOrder });
  },

  removeStop: async (routeId, stopId) => {
    const deleted = await RouteStop.destroy({ where: { routeId, stopId } });
    if (!deleted) throw Object.assign(new Error('Stop not found on this route'), { status: 404 });
    return { message: 'Stop removed from route' };
  }
};

module.exports = RouteService;
