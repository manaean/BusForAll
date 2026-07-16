const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/auth.controller');
const { authenticateToken } = require('../middlewares/auth');

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new commuter account
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name: { type: string }
 *               email: { type: string }
 *               password: { type: string }
 *     responses:
 *       201: { description: Registration successful }
 *       409: { description: Email already in use }
 */
router.post('/register', AuthController.register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login and receive JWT token
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string }
 *               password: { type: string }
 *     responses:
 *       200: { description: Login successful, returns token and user }
 *       401: { description: Invalid credentials }
 */
router.post('/login', AuthController.login);

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Get current authenticated user
 *     tags: [Auth]
 *     responses:
 *       200: { description: Current user data }
 *       401: { description: Unauthorized }
 */
router.get('/me', authenticateToken, AuthController.getMe);

/**
 * @swagger
 * /api/auth/me:
 *   put:
 *     summary: Update the current authenticated user's profile
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               email: { type: string }
 *     responses:
 *       200: { description: Updated user }
 *       409: { description: Email already in use }
 */
router.put('/me', authenticateToken, AuthController.updateMe);

/**
 * @swagger
 * /api/auth/me/password:
 *   put:
 *     summary: Change the current authenticated user's password
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [currentPassword, newPassword]
 *             properties:
 *               currentPassword: { type: string }
 *               newPassword: { type: string }
 *     responses:
 *       200: { description: Password updated }
 *       401: { description: Current password is incorrect }
 */
router.put('/me/password', authenticateToken, AuthController.changePassword);

module.exports = router;
