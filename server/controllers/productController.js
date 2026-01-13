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

        // Parse JSON fields if they are strings (multipart/form-data)
        if (typeof price === 'string') {
            try { price = JSON.parse(price); } catch (e) { console.error('Error parsing price', e); }
        }
        if (typeof sizes === 'string') {
            try { sizes = JSON.parse(sizes); } catch (e) { console.error('Error parsing sizes', e); }
        }

        // Handle Images
        let imageUrls = [];
        if (req.files && req.files.length > 0) {
            imageUrls = req.files.map(file => '/uploads/products/' + file.filename);
        } else if (req.body.images && Array.isArray(req.body.images)) {
            // Fallback for URL-only mode if needed
            imageUrls = req.body.images;
        }

        // Validate required fields
        if (!name || !price || !category) {
            return res.status(400).json({
                success: false,
                message: 'Please provide name, price, and category'
            });
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

        res.status(201).json({
            success: true,
            message: 'Product created successfully',
            data: product
        });
    } catch (error) {
        next(error);
    }
};

// ... getAllProducts and getProductById remain same ...

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
        // 1. New files
        let newImageUrls = [];
        if (req.files && req.files.length > 0) {
            newImageUrls = req.files.map(file => '/uploads/products/' + file.filename);
        }

        // 2. Combine with existing images that were kept
        if (existingImages !== undefined || newImageUrls.length > 0) {
            // If existingImages is sent (even empty), we update the list.
            // If new files are sent, we add them.
            // If neither, we don't touch images (unless we want to allow deleting all by sending empty existingImages)
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
