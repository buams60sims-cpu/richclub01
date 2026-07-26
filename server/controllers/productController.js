const path = require('path');
const Product = require('../models/Product');

/**
 * Product Controller
 * Handles all product-related operations
 */

/**
 * @desc    Create a new product
 * @route   POST /api/products
 * @access  Admin (no auth implemented yet)
 */
/**
 * @desc    Create a new product
 * @route   POST /api/products
 * @access  Admin
 */
const createProduct = async (req, res, next) => {
    try {
        let { name, description, price, category, sizes, isActive, isOnSale } = req.body;

        console.log('📝 Create Product Request:', { name, description, category, price, sizes, isActive, isOnSale });
        console.log('📁 Files received:', req.files ? req.files.length : 0);

        // Parse JSON fields if they are strings (multipart/form-data)
        if (typeof price === 'string') {
            try { 
                price = JSON.parse(price);
                console.log('✅ Parsed price:', price);
            } catch (e) { 
                console.error('❌ Error parsing price', e);
                throw new Error(`Invalid price format: ${e.message}`);
            }
        }
        if (typeof sizes === 'string') {
            try { 
                sizes = JSON.parse(sizes);
                console.log('✅ Parsed sizes:', sizes);
            } catch (e) { 
                console.error('❌ Error parsing sizes', e);
                throw new Error(`Invalid sizes format: ${e.message}`);
            }
        }

        // Ensure price is an object with original and selling
        if (!price || !price.original || !price.selling) {
            throw new Error('Price must have both original and selling values');
        }

        // Handle Images (Multer-Cloudinary puts URL in file.path, Local storage puts absolute path)
        let imageUrls = [];
        if (req.files && req.files.length > 0) {
            imageUrls = req.files.map(file => {
                // If it's a local storage upload (filesystem path instead of a URL)
                if (file.path && !file.path.startsWith('http://') && !file.path.startsWith('https://')) {
                    const filename = path.basename(file.path);
                    return `/uploads/${filename}`;
                }
                return file.path;
            });
            console.log('✅ Image URLs from upload:', imageUrls);
        } else if (req.body.images && Array.isArray(req.body.images)) {
            // Fallback for URL-only mode
            imageUrls = req.body.images;
        }

        // Validate required fields
        if (!name || !price || !category) {
            throw new Error('Please provide name, price, and category');
        }

        if (imageUrls.length === 0) {
            throw new Error('At least one product image is required');
        }

        // Create product
        const product = await Product.create({
            name,
            description,
            price,
            category,
            sizes: sizes || { S: 0, M: 0, L: 0, XL: 0, XXL: 0 },
            images: imageUrls,
            isActive: isActive === 'true' || isActive === true,
            isOnSale: isOnSale === 'true' || isOnSale === true
        });

        console.log('✅ Product created:', product._id);

        res.status(201).json({
            success: true,
            message: 'Product created successfully',
            data: product
        });
    } catch (error) {
        console.error('❌ Error in createProduct:', error.message);
        console.error('Stack:', error.stack);
        next(error);
    }
};

/**
 * @desc    Get all products (with optional filters)
 * @route   GET /api/products
 * @access  Public
 */
const getAllProducts = async (req, res, next) => {
    try {
        const { category, search, isActive } = req.query;
        const query = {};

        const allowedCategories = [
            "normal-tshirts",
            "oversize-tshirts",
            "collar-tshirts",
            "hoodies"
        ];

        if (category && allowedCategories.includes(category)) {
            query.category = category;
        }

        if (typeof search === 'string' && search.trim().length > 0) {
            query.name = { $regex: search.trim(), $options: 'i' };
        }

        if (isActive === 'true') query.isActive = true;
        else if (isActive === 'false') query.isActive = false;
        else query.isActive = true;

        const products = await Product.find(query).sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: products.length,
            data: products
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get product by ID
 * @route   GET /api/products/:id
 * @access  Public
 */
const getProductById = async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        // Safety check: Ensure images is always an array
        // and filter out any potentially undefined/null values
        if (product.images) {
            product.images = Array.isArray(product.images)
                ? product.images.filter(Boolean)
                : [];
        } else {
            product.images = [];
        }

        res.status(200).json({
            success: true,
            data: product
        });
    } catch (error) {
        // If ID is invalid format
        if (error.name === 'CastError') {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }
        next(error);
    }
};

/**
 * @desc    Update product
 * @route   PUT /api/products/:id
 * @access  Admin
 */
const updateProduct = async (req, res, next) => {
    try {
        let { name, description, price, category, sizes, existingImages, isActive, isOnSale } = req.body;

        let product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        // Parse JSON fields
        if (typeof price === 'string') {
            try { price = JSON.parse(price); } catch (e) { }
        }
        if (typeof sizes === 'string') {
            try { sizes = JSON.parse(sizes); } catch (e) { }
        }
        // Handle existingImages (could be string or array of strings)
        let currentImages = [];
        if (existingImages) {
            if (Array.isArray(existingImages)) {
                currentImages = existingImages;
            } else {
                // If single string, make array
                currentImages = [existingImages];
            }
        }

        // Update fields
        if (name !== undefined) product.name = name;
        if (description !== undefined) product.description = description;
        if (price !== undefined) product.price = price;
        if (category !== undefined) product.category = category;
        if (sizes !== undefined) product.sizes = sizes;
        if (isActive !== undefined) product.isActive = isActive === 'true' || isActive === true;
        if (isOnSale !== undefined) product.isOnSale = isOnSale === 'true' || isOnSale === true;

        // Handle Image Updates
        // 1. New files (CloudinaryStorage puts URL in file.path, Local storage puts absolute path)
        let newImageUrls = [];
        if (req.files && req.files.length > 0) {
            newImageUrls = req.files.map(file => {
                // If it's a local storage upload (filesystem path instead of a URL)
                if (file.path && !file.path.startsWith('http://') && !file.path.startsWith('https://')) {
                    const filename = path.basename(file.path);
                    return `/uploads/${filename}`;
                }
                return file.path;
            });
        }

        // 2. Combine with existing images that were kept
        if (existingImages !== undefined || newImageUrls.length > 0) {
            // If existingImages is sent (even empty), we update the list.
            // If new files are sent, we add them.
            product.images = [...currentImages, ...newImageUrls];
        }

        await product.save();

        res.status(200).json({
            success: true,
            message: 'Product updated successfully',
            data: product
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Delete product (hard delete - remove from database)
 * @route   DELETE /api/products/:id
 * @access  Admin
 */
const deleteProduct = async (req, res, next) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Product deleted permanently'
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Check stock availability for a specific size
 * @route   GET /api/products/:id/stock/:size
 * @access  Public
 */
const checkStock = async (req, res, next) => {
    try {
        const { id, size } = req.params;
        const { quantity } = req.query;

        const product = await Product.findById(id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        const availableStock = product.sizes[size] || 0;
        const requestedQty = parseInt(quantity) || 1;

        res.status(200).json({
            success: true,
            data: {
                productName: product.name,
                size,
                availableStock,
                requestedQuantity: requestedQty,
                isAvailable: availableStock >= requestedQty
            }
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createProduct,
    getAllProducts,
    getProductById,
    updateProduct,
    deleteProduct,
    checkStock
};
