const express = require('express');
const router = express.Router();
const RouteController = require('../controllers/route.controller');
const { authenticateToken } = require('../middlewares/auth');
const { authorizeRoles } = require('../middlewares/role');

const adminOnly = [authenticateToken, authorizeRoles('admin')];

/**
 * @swagger
 * /api/routes:
 *   get:
 *     summary: Get all bus routes
 *     tags: [Routes]
 *     security: []
 *     responses:
 *       200: { description: List of routes }
 */
router.get('/', RouteController.getAll);

/**
 * @swagger
 * /api/routes/{id}:
 *   get:
 *     summary: Get route by ID with stops, schedule, and active delays
 *     tags: [Routes]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Route detail }
 *       404: { description: Route not found }
 */
router.get('/:id', RouteController.getById);

/**
 * @swagger
 * /api/routes/{id}/stops:
 *   get:
 *     summary: Get all stops for a route in order
 *     tags: [Routes]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: List of stops }
 */
router.get('/:id/stops', RouteController.getStops);

router.post('/', ...adminOnly, RouteController.create);
router.put('/:id', ...adminOnly, RouteController.update);
router.delete('/:id', ...adminOnly, RouteController.delete);
router.post('/:id/stops', ...adminOnly, RouteController.addStop);
router.delete('/:id/stops/:stopId', ...adminOnly, RouteController.removeStop);

module.exports = router;
