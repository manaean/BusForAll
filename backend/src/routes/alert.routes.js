const express = require('express');
const router = express.Router();
const AlertController = require('../controllers/alert.controller');
const { authenticateToken } = require('../middlewares/auth');
const { authorizeRoles } = require('../middlewares/role');

const adminOnly = [authenticateToken, authorizeRoles('admin')];

/**
 * @swagger
 * /api/alerts:
 *   get:
 *     summary: Get alerts (use ?active=true for active only)
 *     tags: [Alerts]
 *     security: []
 *     parameters:
 *       - in: query
 *         name: active
 *         schema: { type: boolean }
 *     responses:
 *       200: { description: List of alerts }
 */
router.get('/', AlertController.getAll);
router.get('/:id', AlertController.getById);
router.post('/', ...adminOnly, AlertController.create);
router.put('/:id', ...adminOnly, AlertController.update);
router.patch('/:id/resolve', ...adminOnly, AlertController.resolve);
router.delete('/:id', ...adminOnly, AlertController.delete);

module.exports = router;
