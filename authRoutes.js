const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');

// POST /api/register (backward compatibility)
router.post('/register', authController.register);

// POST /api/login (backward compatibility)
router.post('/login', authController.login);

// GET /api/profile - Protected route
router.get('/profile', authenticateToken, authController.getProfile);

// POST /api/logout
router.post('/logout', authController.logout);

module.exports = router;
