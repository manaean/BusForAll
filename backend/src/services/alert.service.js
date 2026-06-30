const { Alert, Route } = require('../models');

const AlertService = {
  getAll: (activeOnly = false) => {
    const where = activeOnly ? { isActive: true } : {};
    return Alert.findAll({
      where,
      include: [{ model: Route, as: 'Route', attributes: ['id', 'name'], required: false }],
      order: [['created_at', 'DESC']]
    });
  },

  getById: async (id) => {
    const alert = await Alert.findByPk(id, {
      include: [{ model: Route, as: 'Route', attributes: ['id', 'name'], required: false }]
    });
    if (!alert) throw Object.assign(new Error('Alert not found'), { status: 404 });
    return alert;
  },

  create: async ({ routeId, title, message, type }) => {
    if (!title || !message) throw Object.assign(new Error('title and message are required'), { status: 400 });
    return Alert.create({ routeId: routeId || null, title, message, type: type || 'general' });
  },

  update: async (id, { routeId, title, message, type, isActive }) => {
    const alert = await Alert.findByPk(id);
    if (!alert) throw Object.assign(new Error('Alert not found'), { status: 404 });
    await alert.update({ routeId: routeId || null, title, message, type, isActive });
    return alert;
  },

  resolve: async (id) => {
    const alert = await Alert.findByPk(id);
    if (!alert) throw Object.assign(new Error('Alert not found'), { status: 404 });
    await alert.update({ isActive: false });
    return alert;
  },

  delete: async (id) => {
    const alert = await Alert.findByPk(id);
    if (!alert) throw Object.assign(new Error('Alert not found'), { status: 404 });
    await alert.destroy();
    return { message: 'Alert deleted successfully' };
  }
};

module.exports = AlertService;
