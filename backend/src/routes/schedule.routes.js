const express = require('express');
const router = express.Router();
const ScheduleController = require('../controllers/schedule.controller');
const { authenticateToken } = require('../middlewares/auth');
const { authorizeRoles } = require('../middlewares/role');

const adminOnly = [authenticateToken, authorizeRoles('admin')];

/**
 * @swagger
 * /api/schedules:
 *   get:
 *     summary: Get all schedules
 *     tags: [Schedules]
 *     security: []
 *     responses:
 *       200: { description: List of schedules }
 */
router.get('/', ScheduleController.getAll);
router.get('/route/:routeId', ScheduleController.getByRoute);
router.get('/:id', ScheduleController.getById);
router.post('/', ...adminOnly, ScheduleController.create);
router.put('/:id', ...adminOnly, ScheduleController.update);
router.delete('/:id', ...adminOnly, ScheduleController.delete);

module.exports = router;
