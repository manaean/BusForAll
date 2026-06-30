const { Assignment, Driver, Bus, Route, User } = require('../models');

const AssignmentService = {
  getAll: () =>
    Assignment.findAll({
      include: [
        { model: Driver, as: 'Driver', include: [{ model: User, as: 'User', attributes: ['id', 'name', 'email'] }] },
        { model: Bus, as: 'Bus' },
        { model: Route, as: 'Route', attributes: ['id', 'name'] }
      ],
      order: [['assignment_date', 'DESC']]
    }),

  getById: async (id) => {
    const a = await Assignment.findByPk(id, {
      include: [
        { model: Driver, as: 'Driver', include: [{ model: User, as: 'User', attributes: ['id', 'name', 'email'] }] },
        { model: Bus, as: 'Bus' },
        { model: Route, as: 'Route', attributes: ['id', 'name'] }
      ]
    });
    if (!a) throw Object.assign(new Error('Assignment not found'), { status: 404 });
    return a;
  },

  create: async ({ driverId, busId, routeId, assignmentDate }) => {
    if (!driverId || !busId || !routeId || !assignmentDate) {
      throw Object.assign(new Error('driverId, busId, routeId, and assignmentDate are required'), { status: 400 });
    }
    return Assignment.create({ driverId, busId, routeId, assignmentDate });
  },

  update: async (id, data) => {
    const a = await Assignment.findByPk(id);
    if (!a) throw Object.assign(new Error('Assignment not found'), { status: 404 });
    await a.update(data);
    return a;
  },

  delete: async (id) => {
    const a = await Assignment.findByPk(id);
    if (!a) throw Object.assign(new Error('Assignment not found'), { status: 404 });
    await a.destroy();
    return { message: 'Assignment deleted successfully' };
  }
};

module.exports = AssignmentService;
