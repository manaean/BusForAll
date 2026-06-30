const express = require('express');
const router = express.Router();
const AssignmentController = require('../controllers/assignment.controller');
const { authenticateToken } = require('../middlewares/auth');
const { authorizeRoles } = require('../middlewares/role');

const adminOnly = [authenticateToken, authorizeRoles('admin')];

/**
 * @swagger
 * /api/assignments:
 *   get:
 *     summary: Get all driver assignments (admin only)
 *     tags: [Assignments]
 *     responses:
 *       200: { description: List of assignments }
 */
router.get('/', ...adminOnly, AssignmentController.getAll);
router.get('/:id', ...adminOnly, AssignmentController.getById);

/**
 * @swagger
 * /api/assignments:
 *   post:
 *     summary: Assign a driver to a bus and route (admin only)
 *     tags: [Assignments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [driverId, busId, routeId, assignmentDate]
 *             properties:
 *               driverId: { type: integer }
 *               busId: { type: integer }
 *               routeId: { type: integer }
 *               assignmentDate: { type: string, format: date }
 *     responses:
 *       201: { description: Assignment created }
 */
router.post('/', ...adminOnly, AssignmentController.create);
router.put('/:id', ...adminOnly, AssignmentController.update);
router.delete('/:id', ...adminOnly, AssignmentController.delete);

module.exports = router;
