const express = require('express');
const router = express.Router();
const StopController = require('../controllers/stop.controller');
const { authenticateToken } = require('../middlewares/auth');
const { authorizeRoles } = require('../middlewares/role');

const adminOnly = [authenticateToken, authorizeRoles('admin')];

/**
 * @swagger
 * /api/stops:
 *   get:
 *     summary: Get all stops
 *     tags: [Stops]
 *     security: []
 *     responses:
 *       200: { description: List of stops }
 */
router.get('/', StopController.getAll);
router.get('/:id', StopController.getById);
router.post('/', ...adminOnly, StopController.create);
router.put('/:id', ...adminOnly, StopController.update);
router.delete('/:id', ...adminOnly, StopController.delete);

module.exports = router;
