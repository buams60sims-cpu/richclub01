const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },

        price: {
            original: {
                type: Number,
                required: true
            },
            selling: {
                type: Number,
                required: true
            }
        },

        discountPercent: {
            type: Number,
            default: 0
        },

        isOnSale: {
            type: Boolean,
            default: false
        },

        category: {
            type: String,
            required: true,
            enum: [
                "normal-tshirts",
                "oversize-tshirts",
                "collar-tshirts",
                "hoodies"
            ]
        },

        description: {
            type: String,
            default: ""
        },

        images: {
            type: [String],
            validate: [
                {
                    validator: arr => Array.isArray(arr) && arr.length > 0,
                    message: "At least one product image is required"
                },
                {
                    validator: arr => arr.length <= 8,
                    message: "Maximum 8 images allowed per product"
                }
            ]
        },

        sizes: {
            S: { type: Number, default: 0, min: 0 },
            M: { type: Number, default: 0, min: 0 },
            L: { type: Number, default: 0, min: 0 },
            XL: { type: Number, default: 0, min: 0 },
            XXL: { type: Number, default: 0, min: 0 }
        },

        isActive: {
            type: Boolean,
            default: true
        }
    },
    { timestamps: true }
);

// Add indexes for text search
ProductSchema.index({ name: 'text', description: 'text' });

// Virtual field to calculate total stock across all sizes
ProductSchema.virtual('totalStock').get(function () {
    return (this.sizes?.S || 0) + (this.sizes?.M || 0) +
        (this.sizes?.L || 0) + (this.sizes?.XL || 0) + (this.sizes?.XXL || 0);
});

// Ensure virtuals are included in JSON output
ProductSchema.set('toJSON', { virtuals: true });
ProductSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Product', ProductSchema);