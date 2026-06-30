const { Driver, User, Assignment, Bus, Route, Schedule } = require('../models');

const DriverService = {
  getAll: () =>
    Driver.findAll({
      include: [{ model: User, as: 'User', attributes: ['id', 'name', 'email'] }],
      order: [[{ model: User, as: 'User' }, 'name', 'ASC']]
    }),

  getById: async (id) => {
    const driver = await Driver.findByPk(id, {
      include: [{ model: User, as: 'User', attributes: ['id', 'name', 'email'] }]
    });
    if (!driver) throw Object.assign(new Error('Driver not found'), { status: 404 });
    return driver;
  },

  getByUserId: async (userId) => {
    const driver = await Driver.findOne({
      where: { userId },
      include: [{ model: User, as: 'User', attributes: ['id', 'name', 'email'] }]
    });
    if (!driver) throw Object.assign(new Error('Driver profile not found'), { status: 404 });
    return driver;
  },

  create: async ({ userId, licenseNumber }) => {
    if (!userId || !licenseNumber) {
      throw Object.assign(new Error('userId and licenseNumber are required'), { status: 400 });
    }
    return Driver.create({ userId, licenseNumber });
  },

  update: async (id, { licenseNumber }) => {
    const driver = await Driver.findByPk(id);
    if (!driver) throw Object.assign(new Error('Driver not found'), { status: 404 });
    await driver.update({ licenseNumber });
    return driver;
  },

  delete: async (id) => {
    const driver = await Driver.findByPk(id);
    if (!driver) throw Object.assign(new Error('Driver not found'), { status: 404 });
    await driver.destroy();
    return { message: 'Driver deleted successfully' };
  },

  getTodayAssignment: async (userId) => {
    const driver = await Driver.findOne({ where: { userId } });
    if (!driver) throw Object.assign(new Error('Driver profile not found'), { status: 404 });

    const today = new Date().toISOString().split('T')[0];
    const assignment = await Assignment.findOne({
      where: { driverId: driver.id, assignmentDate: today },
      include: [
        { model: Bus, as: 'Bus' },
        {
          model: Route, as: 'Route',
          include: [{ model: Schedule, as: 'Schedules', order: [['departureTime', 'ASC']] }]
        }
      ]
    });
    return assignment || null;
  }
};

module.exports = DriverService;
