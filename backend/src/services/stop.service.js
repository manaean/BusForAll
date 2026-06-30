const { Stop } = require('../models');

const StopService = {
  getAll: () => Stop.findAll({ order: [['name', 'ASC']] }),

  getById: async (id) => {
    const stop = await Stop.findByPk(id);
    if (!stop) throw Object.assign(new Error('Stop not found'), { status: 404 });
    return stop;
  },

  create: async ({ name, latitude, longitude }) => {
    if (!name) throw Object.assign(new Error('Stop name is required'), { status: 400 });
    return Stop.create({ name, latitude: latitude || null, longitude: longitude || null });
  },

  update: async (id, { name, latitude, longitude }) => {
    const stop = await Stop.findByPk(id);
    if (!stop) throw Object.assign(new Error('Stop not found'), { status: 404 });
    await stop.update({ name, latitude: latitude || null, longitude: longitude || null });
    return stop;
  },

  delete: async (id) => {
    const stop = await Stop.findByPk(id);
    if (!stop) throw Object.assign(new Error('Stop not found'), { status: 404 });
    await stop.destroy();
    return { message: 'Stop deleted successfully' };
  }
};

module.exports = StopService;
