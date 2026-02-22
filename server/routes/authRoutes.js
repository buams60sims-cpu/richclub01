const express = require('express');
const router = express.Router();
const { login, getMe, changePassword } = require('../controllers/authController');
const { verifyJWT, isAdmin } = require('../middlewares/auth');

/**
 * Authentication Routes
 * Handles admin login and authentication
 */

const { body } = require('express-validator');
const validate = require('../middlewares/validate');

// @route   POST /api/auth/login
// @desc    Admin login
// @access  Public
router.post(
    '/login',
    [
        body('email').isEmail().withMessage('Please provide a valid email').normalizeEmail(),
        body('password').notEmpty().withMessage('Password is required').trim(),
    ],
    validate,
    login
);

// @route   GET /api/auth/me
// @desc    Get current logged-in admin details
// @access  Private (Admin only)
router.get('/me', verifyJWT, isAdmin, getMe);

// @route   PUT /api/auth/change-password
// @desc    Change admin password
// @access  Private (Admin only)
router.put(
    '/change-password',
    verifyJWT,
    isAdmin,
    [
        body('currentPassword').notEmpty().withMessage('Current password is required').trim(),
        body('newPassword').notEmpty().withMessage('New password is required').trim(),
    ],
    validate,
    changePassword
);

module.exports = router;
