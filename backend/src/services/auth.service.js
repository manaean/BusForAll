const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User } = require('../models');

const AuthService = {
  register: async (name, email, password) => {
    const existing = await User.findOne({ where: { email } });
    if (existing) throw Object.assign(new Error('Email already in use'), { status: 409 });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, passwordHash, role: 'commuter' });
    return { id: user.id, name: user.name, email: user.email, role: user.role };
  },

  login: async (email, password) => {
    const user = await User.findOne({ where: { email } });
    if (!user) throw Object.assign(new Error('Invalid email or password'), { status: 401 });

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) throw Object.assign(new Error('Invalid email or password'), { status: 401 });

    if (!user.isActive) throw Object.assign(new Error('Account is disabled'), { status: 403 });

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
    return { token, user: { id: user.id, name: user.name, email: user.email, role: user.role } };
  },

  getMe: async (id) => {
    const user = await User.findByPk(id, { attributes: { exclude: ['passwordHash'] } });
    if (!user) throw Object.assign(new Error('User not found'), { status: 404 });
    return user;
  },

  updateMe: async (id, { name, email }) => {
    const user = await User.findByPk(id);
    if (!user) throw Object.assign(new Error('User not found'), { status: 404 });
    if (email !== undefined && email !== user.email) {
      const existing = await User.findOne({ where: { email } });
      if (existing) throw Object.assign(new Error('Email already in use'), { status: 409 });
    }
    const changes = {};
    if (name !== undefined) changes.name = name;
    if (email !== undefined) changes.email = email;
    await user.update(changes);
    return { id: user.id, name: user.name, email: user.email, role: user.role };
  },

  changePassword: async (id, currentPassword, newPassword) => {
    const user = await User.findByPk(id);
    if (!user) throw Object.assign(new Error('User not found'), { status: 404 });
    const valid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!valid) throw Object.assign(new Error('Current password is incorrect'), { status: 401 });
    const passwordHash = await bcrypt.hash(newPassword, 10);
    await user.update({ passwordHash });
    return { message: 'Password updated successfully' };
  }
};

module.exports = AuthService;
