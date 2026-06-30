const express = require('express');
const router = express.Router();
const FavouriteController = require('../controllers/favourite.controller');
const { authenticateToken } = require('../middlewares/auth');
const { authorizeRoles } = require('../middlewares/role');

const commuterAuth = [authenticateToken, authorizeRoles('commuter', 'admin')];

/**
 * @swagger
 * /api/favourites:
 *   get:
 *     summary: Get current user's favourite routes
 *     tags: [Favourites]
 *     responses:
 *       200: { description: List of favourite routes }
 */
router.get('/', ...commuterAuth, FavouriteController.getMyFavourites);

/**
 * @swagger
 * /api/favourites/{routeId}:
 *   post:
 *     summary: Add a route to favourites
 *     tags: [Favourites]
 *     parameters:
 *       - in: path
 *         name: routeId
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       201: { description: Added to favourites }
 *       409: { description: Already in favourites }
 */
router.post('/:routeId', ...commuterAuth, FavouriteController.add);

/**
 * @swagger
 * /api/favourites/{routeId}:
 *   delete:
 *     summary: Remove a route from favourites
 *     tags: [Favourites]
 *     parameters:
 *       - in: path
 *         name: routeId
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Removed from favourites }
 */
router.delete('/:routeId', ...commuterAuth, FavouriteController.remove);

module.exports = router;
