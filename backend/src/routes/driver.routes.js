const express = require('express');
const router = express.Router();
const DriverController = require('../controllers/driver.controller');
const { authenticateToken } = require('../middlewares/auth');
const { authorizeRoles } = require('../middlewares/role');

const adminOnly = [authenticateToken, authorizeRoles('admin')];
const driverOnly = [authenticateToken, authorizeRoles('driver')];

/**
 * @swagger
 * /api/drivers/me:
 *   get:
 *     summary: Get logged-in driver's own profile
 *     tags: [Drivers]
 *     responses:
 *       200: { description: Driver profile }
 */
router.get('/me', ...driverOnly, DriverController.getMe);

/**
 * @swagger
 * /api/drivers/me/assignment:
 *   get:
 *     summary: Get today's assignment for the logged-in driver
 *     tags: [Drivers]
 *     responses:
 *       200: { description: Today's assignment with route and bus info, or message if none }
 */
router.get('/me/assignment', ...driverOnly, DriverController.getMyAssignment);

/**
 * @swagger
 * /api/drivers:
 *   get:
 *     summary: Get all drivers (admin only)
 *     tags: [Drivers]
 *     responses:
 *       200: { description: List of drivers }
 */
router.get('/', ...adminOnly, DriverController.getAll);
router.get('/:id', ...adminOnly, DriverController.getById);
router.post('/', ...adminOnly, DriverController.create);
router.put('/:id', ...adminOnly, DriverController.update);
router.delete('/:id', ...adminOnly, DriverController.delete);

module.exports = router;
