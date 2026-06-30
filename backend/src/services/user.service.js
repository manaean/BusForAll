const bcrypt = require('bcrypt');
const { User } = require('../models');

const UserService = {
  getAll: () => User.findAll({ attributes: { exclude: ['passwordHash'] }, order: [['created_at', 'DESC']] }),

  getById: async (id) => {
    const user = await User.findByPk(id, { attributes: { exclude: ['passwordHash'] } });
    if (!user) throw Object.assign(new Error('User not found'), { status: 404 });
    return user;
  },

  create: async ({ name, email, password, role }) => {
    const existing = await User.findOne({ where: { email } });
    if (existing) throw Object.assign(new Error('Email already in use'), { status: 409 });
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, passwordHash, role: role || 'commuter' });
    return { id: user.id, name: user.name, email: user.email, role: user.role };
  },

  update: async (id, { name, email, role }) => {
    const user = await User.findByPk(id);
    if (!user) throw Object.assign(new Error('User not found'), { status: 404 });
    await user.update({ name, email, role });
    return { id: user.id, name: user.name, email: user.email, role: user.role };
  },

  delete: async (id) => {
    const user = await User.findByPk(id);
    if (!user) throw Object.assign(new Error('User not found'), { status: 404 });
    await user.destroy();
    return { message: 'User deleted successfully' };
  }
};

module.exports = UserService;
