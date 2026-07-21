const Coupon = require('../models/Coupon');

/**
 * Coupon Controller
 * Handles coupon creation and validation
 */

/**
 * @desc    Create a new coupon
 * @route   POST /api/coupons
 * @access  Admin
 */
const createCoupon = async (req, res, next) => {
    try {
        let { code, discountType, discountValue, discountAmount, expiryDate, isActive, minOrderAmount, minPurchaseAmount, maxDiscountAmount, usageLimit, maxUses } = req.body;

        // Map frontend fields (if provided) to schema fields
        discountValue = discountValue || discountAmount;
        minPurchaseAmount = minPurchaseAmount || minOrderAmount || 0;
        maxDiscountAmount = maxDiscountAmount || 0;
        const parsedUsageLimit = Number(usageLimit || maxUses || 0);

        // Normalize discountType
        if (discountType === 'PERCENTAGE' || discountType === 'Percentage') discountType = 'percentage';
        if (discountType === 'FIXED' || discountType === 'Fixed') discountType = 'flat';

        // Validate required fields
        if (!code || !discountType || !discountValue || !expiryDate) {
            return res.status(400).json({
                success: false,
                message: 'Please provide code, discountType, discountValue, and expiryDate'
            });
        }

        // Check if coupon code already exists
        const existingCoupon = await Coupon.findOne({ code: code.toUpperCase() });
        if (existingCoupon) {
            return res.status(400).json({
                success: false,
                message: 'Coupon code already exists'
            });
        }

        // Create coupon
        const coupon = await Coupon.create({
            code: code.toUpperCase(),
            discountType,
            discountValue,
            expiryDate,
            isActive: isActive !== undefined ? isActive : true,
            minPurchaseAmount,
            maxDiscountAmount,
            usageLimit: parsedUsageLimit
        });

        res.status(201).json({
            success: true,
            message: 'Coupon created successfully',
            data: coupon
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get all coupons
 * @route   GET /api/coupons
 * @access  Admin
 */
const getAllCoupons = async (req, res, next) => {
    try {
        const { isActive } = req.query;

        const query = {};
        if (isActive !== undefined) {
            query.isActive = isActive === 'true';
        }

        const coupons = await Coupon.find(query).sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: coupons.length,
            data: coupons
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Validate and get coupon details
 * @route   POST /api/coupons/validate
 * @access  Public
 */
const validateCoupon = async (req, res, next) => {
    try {
        const { code, subtotal } = req.body;

        if (!code) {
            return res.status(400).json({
                success: false,
                message: 'Please provide coupon code'
            });
        }

        // Find coupon
        const coupon = await Coupon.findOne({ code: code.toUpperCase() });

        if (!coupon) {
            return res.status(404).json({
                success: false,
                message: 'Invalid coupon code'
            });
        }

        // Check if coupon is valid
        if (!coupon.isValid(subtotal)) {
            let reason = 'Coupon is invalid';
            if (!coupon.isActive) reason = 'Coupon is inactive';
            else if (new Date() > coupon.expiryDate) reason = 'Coupon has expired';
            else if (coupon.usageLimit && coupon.usageLimit > 0 && coupon.usageCount >= coupon.usageLimit) {
                reason = `Coupon limit reached (${coupon.usageLimit} members limit).`;
            }
            else if (subtotal && subtotal < coupon.minPurchaseAmount) reason = `Minimum purchase of ₹${coupon.minPurchaseAmount} required`;

            return res.status(400).json({
                success: false,
                message: reason
            });
        }

        // Calculate discount if subtotal provided
        let discountAmount = 0;
        if (subtotal) {
            discountAmount = coupon.calculateDiscount(subtotal);
        }

        res.status(200).json({
            success: true,
            message: 'Coupon is valid',
            data: {
                code: coupon.code,
                discountType: coupon.discountType,
                discountValue: coupon.discountValue,
                discountAmount,
                expiryDate: coupon.expiryDate
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Update coupon
 * @route   PUT /api/coupons/:id
 * @access  Admin
 */
const updateCoupon = async (req, res, next) => {
    try {
        const { discountType, discountValue, expiryDate, isActive, usageLimit, maxUses } = req.body;

        let coupon = await Coupon.findById(req.params.id);

        if (!coupon) {
            return res.status(404).json({
                success: false,
                message: 'Coupon not found'
            });
        }

        // Update fields (code cannot be updated)
        if (discountType !== undefined) coupon.discountType = discountType;
        if (discountValue !== undefined) coupon.discountValue = discountValue;
        if (expiryDate !== undefined) coupon.expiryDate = expiryDate;
        if (isActive !== undefined) coupon.isActive = isActive;
        if (usageLimit !== undefined || maxUses !== undefined) {
            coupon.usageLimit = Number(usageLimit || maxUses || 0);
        }

        await coupon.save();

        await coupon.save();

        res.status(200).json({
            success: true,
            message: 'Coupon updated successfully',
            data: coupon
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Delete coupon
 * @route   DELETE /api/coupons/:id
 * @access  Admin
 */
const deleteCoupon = async (req, res, next) => {
    try {
        const coupon = await Coupon.findById(req.params.id);

        if (!coupon) {
            return res.status(404).json({
                success: false,
                message: 'Coupon not found'
            });
        }

        await coupon.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Coupon deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createCoupon,
    getAllCoupons,
    validateCoupon,
    updateCoupon,
    deleteCoupon
};
