const { Favourite, Route } = require('../models');

const FavouriteService = {
  getByUser: (userId) =>
    Favourite.findAll({
      where: { userId },
      include: [{ model: Route, as: 'Route' }],
      order: [['created_at', 'DESC']]
    }),

  add: async (userId, routeId) => {
    const exists = await Favourite.findOne({ where: { userId, routeId } });
    if (exists) throw Object.assign(new Error('Route already in favourites'), { status: 409 });
    return Favourite.create({ userId, routeId });
  },

  remove: async (userId, routeId) => {
    const deleted = await Favourite.destroy({ where: { userId, routeId } });
    if (!deleted) throw Object.assign(new Error('Favourite not found'), { status: 404 });
    return { message: 'Removed from favourites' };
  }
};

module.exports = FavouriteService;
