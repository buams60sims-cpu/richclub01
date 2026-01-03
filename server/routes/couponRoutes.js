const express = require('express');
const router = express.Router();
const {
    createCoupon,
    getAllCoupons,
    validateCoupon,
    updateCoupon,
    deleteCoupon
} = require('../controllers/couponController');

/**
 * Coupon Routes
 * All routes for coupon management
 */

// @route   POST /api/coupons
// @desc    Create a new coupon
// @access  Admin
router.post('/', createCoupon);

// @route   GET /api/coupons
// @desc    Get all coupons
// @access  Admin
router.get('/', getAllCoupons);

// @route   POST /api/coupons/validate
// @desc    Validate a coupon code
// @access  Public
router.post('/validate', validateCoupon);

// @route   PUT /api/coupons/:id
// @desc    Update coupon
// @access  Admin
router.put('/:id', updateCoupon);

// @route   DELETE /api/coupons/:id
// @desc    Delete coupon
// @access  Admin
router.delete('/:id', deleteCoupon);

module.exports = router;
