const { Delay, Route } = require('../models');

const DelayService = {
  getAll: (activeOnly = false) => {
    const where = activeOnly ? { isActive: true } : {};
    return Delay.findAll({
      where,
      include: [{ model: Route, as: 'Route', attributes: ['id', 'name'] }],
      order: [['created_at', 'DESC']]
    });
  },

  getById: async (id) => {
    const delay = await Delay.findByPk(id, {
      include: [{ model: Route, as: 'Route', attributes: ['id', 'name'] }]
    });
    if (!delay) throw Object.assign(new Error('Delay not found'), { status: 404 });
    return delay;
  },

  getActiveByRoute: (routeId) =>
    Delay.findOne({ where: { routeId, isActive: true } }),

  create: async ({ routeId, delayMinutes, reason }) => {
    if (!routeId || !delayMinutes) {
      throw Object.assign(new Error('routeId and delayMinutes are required'), { status: 400 });
    }
    // Auto-resolve any existing active delay for this route
    await Delay.update({ isActive: false }, { where: { routeId, isActive: true } });
    return Delay.create({ routeId, delayMinutes, reason: reason || null, isActive: true });
  },

  resolve: async (id) => {
    const delay = await Delay.findByPk(id);
    if (!delay) throw Object.assign(new Error('Delay not found'), { status: 404 });
    await delay.update({ isActive: false });
    return delay;
  },

  delete: async (id) => {
    const delay = await Delay.findByPk(id);
    if (!delay) throw Object.assign(new Error('Delay not found'), { status: 404 });
    await delay.destroy();
    return { message: 'Delay deleted successfully' };
  }
};

module.exports = DelayService;
