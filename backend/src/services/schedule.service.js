const { Schedule, Route } = require('../models');

const ScheduleService = {
  getAll: () =>
    Schedule.findAll({
      include: [{ model: Route, as: 'Route', attributes: ['id', 'name'] }],
      order: [['departure_time', 'ASC']]
    }),

  getById: async (id) => {
    const s = await Schedule.findByPk(id, {
      include: [{ model: Route, as: 'Route', attributes: ['id', 'name'] }]
    });
    if (!s) throw Object.assign(new Error('Schedule not found'), { status: 404 });
    return s;
  },

  getByRouteId: (routeId) =>
    Schedule.findAll({ where: { routeId }, order: [['departure_time', 'ASC']] }),

  create: async ({ routeId, departureTime, arrivalTime, days, frequencyMinutes }) => {
    if (!routeId || !departureTime || !arrivalTime) {
      throw Object.assign(new Error('routeId, departureTime, and arrivalTime are required'), { status: 400 });
    }
    return Schedule.create({ routeId, departureTime, arrivalTime, days: days || 'Mon,Tue,Wed,Thu,Fri', frequencyMinutes: frequencyMinutes || null });
  },

  update: async (id, data) => {
    const s = await Schedule.findByPk(id);
    if (!s) throw Object.assign(new Error('Schedule not found'), { status: 404 });
    await s.update(data);
    return s;
  },

  delete: async (id) => {
    const s = await Schedule.findByPk(id);
    if (!s) throw Object.assign(new Error('Schedule not found'), { status: 404 });
    await s.destroy();
    return { message: 'Schedule deleted successfully' };
  }
};

module.exports = ScheduleService;
