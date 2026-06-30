const express = require('express');
const router = express.Router();
const DelayController = require('../controllers/delay.controller');
const { authenticateToken } = require('../middlewares/auth');
const { authorizeRoles } = require('../middlewares/role');

const adminOnly = [authenticateToken, authorizeRoles('admin')];

/**
 * @swagger
 * /api/delays:
 *   get:
 *     summary: Get delays (use ?active=true for active only)
 *     tags: [Delays]
 *     security: []
 *     parameters:
 *       - in: query
 *         name: active
 *         schema: { type: boolean }
 *     responses:
 *       200: { description: List of delays }
 */
router.get('/', DelayController.getAll);
router.get('/route/:routeId', DelayController.getActiveByRoute);
router.get('/:id', ...adminOnly, DelayController.getById);

/**
 * @swagger
 * /api/delays:
 *   post:
 *     summary: Set a delay for a route (admin only). Auto-resolves any existing active delay.
 *     tags: [Delays]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [routeId, delayMinutes]
 *             properties:
 *               routeId: { type: integer }
 *               delayMinutes: { type: integer }
 *               reason: { type: string }
 *     responses:
 *       201: { description: Delay created }
 */
router.post('/', ...adminOnly, DelayController.create);
router.patch('/:id/resolve', ...adminOnly, DelayController.resolve);
router.delete('/:id', ...adminOnly, DelayController.delete);

module.exports = router;
