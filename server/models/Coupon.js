const mongoose = require('mongoose');

/**
 * Coupon Model
 * Manages discount coupons for the eCommerce platform
 */
const couponSchema = new mongoose.Schema(
    {
        code: {
            type: String,
            required: [true, 'Please provide a coupon code'],
            unique: true,
            uppercase: true,
            trim: true,
            minlength: [3, 'Coupon code must be at least 3 characters'],
            maxlength: [20, 'Coupon code cannot exceed 20 characters']
        },
        discountType: {
            type: String,
            required: [true, 'Please specify discount type'],
            enum: {
                values: ['flat', 'percentage'],
                message: 'Discount type must be either flat or percentage'
            }
        },
        discountValue: {
            type: Number,
            required: [true, 'Please provide discount value'],
            min: [0.01, 'Discount value must be greater than 0'],
            validate: {
                validator: function (value) {
                    // If percentage, max 100
                    if (this.discountType === 'percentage') {
                        return value > 0 && value <= 100;
                    }
                    // If flat, must be positive
                    return value > 0;
                },
                message: function (props) {
                    if (this.discountType === 'percentage') {
                        return 'Percentage discount must be between 0 and 100';
                    }
                    return 'Flat discount must be greater than 0';
                }
            }
        },
        isActive: {
            type: Boolean,
            default: true
        },
        expiryDate: {
            type: Date,
            required: [true, 'Please provide an expiry date'],
            validate: {
                validator: function (date) {
                    return date > new Date();
                },
                message: 'Expiry date must be in the future'
            }
        },
        minPurchaseAmount: {
            type: Number,
            default: 0,
            min: [0, 'Minimum purchase amount cannot be negative']
        },
        maxDiscountAmount: {
            type: Number,
            default: 0,
            min: [0, 'Maximum discount amount cannot be negative']
        },
        usageCount: {
            type: Number,
            default: 0,
            min: [0, 'Usage count cannot be negative']
        },
        usageLimit: {
            type: Number,
            default: 0,
            min: [0, 'Usage limit cannot be negative']
        }
    },
    {
        timestamps: true // Adds createdAt and updatedAt
    }
);

// Method to check if coupon is valid
couponSchema.methods.isValid = function (purchaseAmount) {
    if (!this.isActive || this.expiryDate <= new Date()) {
        return false;
    }
    if (this.usageLimit && this.usageLimit > 0 && this.usageCount >= this.usageLimit) {
        return false;
    }
    if (this.minPurchaseAmount && purchaseAmount !== undefined && purchaseAmount < this.minPurchaseAmount) {
        return false;
    }
    return true;
};

// Method to calculate discount amount
couponSchema.methods.calculateDiscount = function (subtotal) {
    if (!this.isValid()) {
        return 0;
    }

    if (this.discountType === 'percentage') {
        let discount = (subtotal * this.discountValue) / 100;
        if (this.maxDiscountAmount && this.maxDiscountAmount > 0) {
            discount = Math.min(discount, this.maxDiscountAmount);
        }
        return discount;
    }

    // Flat discount - cannot exceed subtotal
    return Math.min(this.discountValue, subtotal);
};

module.exports = mongoose.model('Coupon', couponSchema);
