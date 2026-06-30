const FavouriteService = require('../services/favourite.service');

const FavouriteController = {
  getMyFavourites: async (req, res, next) => {
    try { res.json(await FavouriteService.getByUser(req.user.id)); } catch (err) { next(err); }
  },

  add: async (req, res, next) => {
    try {
      const fav = await FavouriteService.add(req.user.id, req.params.routeId);
      res.status(201).json(fav);
    } catch (err) { next(err); }
  },

  remove: async (req, res, next) => {
    try { res.json(await FavouriteService.remove(req.user.id, req.params.routeId)); } catch (err) { next(err); }
  }
};

module.exports = FavouriteController;
