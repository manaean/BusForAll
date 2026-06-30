const { Bus } = require('../models');

const BusService = {
  getAll: () => Bus.findAll({ order: [['plate_number', 'ASC']] }),

  getById: async (id) => {
    const bus = await Bus.findByPk(id);
    if (!bus) throw Object.assign(new Error('Bus not found'), { status: 404 });
    return bus;
  },

  create: async ({ plateNumber, capacity, status }) => {
    if (!plateNumber) throw Object.assign(new Error('Plate number is required'), { status: 400 });
    return Bus.create({ plateNumber, capacity: capacity || 50, status: status || 'active' });
  },

  update: async (id, { plateNumber, capacity, status }) => {
    const bus = await Bus.findByPk(id);
    if (!bus) throw Object.assign(new Error('Bus not found'), { status: 404 });
    await bus.update({ plateNumber, capacity, status });
    return bus;
  },

  delete: async (id) => {
    const bus = await Bus.findByPk(id);
    if (!bus) throw Object.assign(new Error('Bus not found'), { status: 404 });
    await bus.destroy();
    return { message: 'Bus deleted successfully' };
  }
};

module.exports = BusService;
