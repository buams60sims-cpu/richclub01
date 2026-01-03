const mongoose = require('mongoose');

/**
 * Product Model
 * Defines the schema for eCommerce products
 */
const productSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Please provide a product name'],
            trim: true,
            maxlength: [100, 'Product name cannot exceed 100 characters']
        },
        description: {
            type: String,
            required: [true, 'Please provide a product description'],
            maxlength: [2000, 'Description cannot exceed 2000 characters']
        },
        price: {
            type: Number,
            required: [true, 'Please provide a product price'],
            min: [0, 'Price cannot be negative']
        },
        category: {
            type: String,
            required: [true, 'Please provide a product category'],
            enum: ['electronics', 'clothing', 'books', 'home', 'sports', 'other']
        },
        stock: {
            type: Number,
            required: true,
            min: [0, 'Stock cannot be negative'],
            default: 0
        },
        images: [{
            type: String // URL to product images
        }],
        rating: {
            type: Number,
            default: 0,
            min: [0, 'Rating cannot be less than 0'],
            max: [5, 'Rating cannot be more than 5']
        },
        numReviews: {
            type: Number,
            default: 0
        },
        isActive: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true
    }
);

// Add indexes for better query performance
productSchema.index({ name: 'text', description: 'text' }); // Text search
productSchema.index({ category: 1 });
productSchema.index({ price: 1 });

module.exports = mongoose.model('Product', productSchema);
