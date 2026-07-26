const express = require('express');
const router = express.Router();
const upload = require('../middlewares/upload');
const { verifyJWT, isAdmin } = require('../middlewares/auth');

/**
 * @route   POST /api/upload/cms
 * @desc    Upload CMS images (Hero, Lookbook) to Cloudinary
 * @access  Admin
 */
router.post('/cms', verifyJWT, isAdmin, upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Please upload an image'
            });
        }

        console.log('📤 CMS Upload - File received:', {
            fieldname: req.file.fieldname,
            size: req.file.size,
            mimetype: req.file.mimetype,
            path: req.file.path,
            url: req.file.url,
            location: req.file.location
        });

        // Handle both Cloudinary and local storage responses
        let imageUrl;
        if (req.file.path && req.file.path.startsWith('http')) {
            // Cloudinary upload - path is the URL
            imageUrl = req.file.path;
        } else if (req.file.url) {
            // Some Cloudinary drivers use 'url' field
            imageUrl = req.file.url;
        } else if (req.file.location) {
            // Alternative Cloudinary field
            imageUrl = req.file.location;
        } else if (req.file.filename) {
            // Local storage fallback
            imageUrl = `/uploads/${req.file.filename}`;
        } else {
            return res.status(500).json({
                success: false,
                message: 'Unable to determine upload URL'
            });
        }

        console.log('✅ CMS Upload Success:', imageUrl);
        res.status(200).json({
            success: true,
            message: 'Image uploaded successfully',
            imageUrl
        });
    } catch (error) {
        console.error('❌ Upload Error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error uploading image'
        });
    }
});

/**
 * @route   POST /api/upload/product-images
 * @desc    Upload multiple product images to Cloudinary
 * @access  Admin
 */
router.post('/product-images', verifyJWT, isAdmin, upload.array('images', 8), async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Please upload at least one image'
            });
        }

        // Convert local absolute paths to URL paths if local storage was used
        const imageUrls = req.files.map(file => {
            if (file.path && !file.path.startsWith('http://') && !file.path.startsWith('https://')) {
                return `/uploads/${file.filename}`;
            }
            return file.path;
        });

        res.status(200).json({
            success: true,
            message: 'Images uploaded successfully',
            mainImage: imageUrls[0],
            images: imageUrls
        });
    } catch (error) {
        console.error('Upload Error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error uploading images'
        });
    }
});

module.exports = router;
