const express = require('express');
const router = express.Router();
const TrackingController = require('../controllers/tracking.controller');
const { authenticateToken } = require('../middlewares/auth');
const { authorizeRoles } = require('../middlewares/role');

const adminOnly = [authenticateToken, authorizeRoles('admin')];

/**
 * @swagger
 * /api/tracking/{routeId}:
 *   get:
 *     summary: Get live tracking data for a route (polled every 5s by frontend)
 *     tags: [Tracking]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: routeId
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Tracking data with progress, ETA, current stop, and active delay
 *       404: { description: Tracking not found for this route }
 */
router.get('/:routeId', TrackingController.getByRoute);

/**
 * @swagger
 * /api/tracking/{routeId}/start:
 *   post:
 *     summary: Start bus simulation for a route (admin only)
 *     tags: [Tracking]
 *     parameters:
 *       - in: path
 *         name: routeId
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               busId: { type: integer }
 *     responses:
 *       200: { description: Tracking started }
 */
router.post('/:routeId/start', ...adminOnly, TrackingController.start);
router.post('/:routeId/stop', ...adminOnly, TrackingController.stop);
router.post('/:routeId/reset', ...adminOnly, TrackingController.reset);

module.exports = router;
