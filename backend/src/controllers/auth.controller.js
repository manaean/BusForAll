const AuthService = require('../services/auth.service');

const AuthController = {
  register: async (req, res, next) => {
    try {
      const { name, email, password } = req.body;
      if (!name || !email || !password) {
        return res.status(400).json({ message: 'name, email, and password are required' });
      }
      const user = await AuthService.register(name, email, password);
      res.status(201).json({ message: 'Registration successful', user });
    } catch (err) { next(err); }
  },

  login: async (req, res, next) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ message: 'email and password are required' });
      }
      const result = await AuthService.login(email, password);
      res.json(result);
    } catch (err) { next(err); }
  },

  getMe: async (req, res, next) => {
    try {
      const user = await AuthService.getMe(req.user.id);
      res.json(user);
    } catch (err) { next(err); }
  }
};

module.exports = AuthController;
