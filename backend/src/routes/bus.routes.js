const express = require('express');
const router = express.Router();
const BusController = require('../controllers/bus.controller');
const { authenticateToken } = require('../middlewares/auth');
const { authorizeRoles } = require('../middlewares/role');

const adminOnly = [authenticateToken, authorizeRoles('admin')];

/**
 * @swagger
 * /api/buses:
 *   get:
 *     summary: Get all buses (admin only)
 *     tags: [Buses]
 *     responses:
 *       200: { description: List of buses }
 */
router.get('/', ...adminOnly, BusController.getAll);
router.get('/:id', ...adminOnly, BusController.getById);
router.post('/', ...adminOnly, BusController.create);
router.put('/:id', ...adminOnly, BusController.update);
router.delete('/:id', ...adminOnly, BusController.delete);

module.exports = router;
