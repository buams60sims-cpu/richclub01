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

        // CloudinaryStorage puts the URL in req.file.path
        res.status(200).json({
            success: true,
            message: 'Image uploaded successfully',
            imageUrl: req.file.path
        });
    } catch (error) {
        console.error('Upload Error:', error);
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

        // CloudinaryStorage puts the URL in file.path for each file
        const imageUrls = req.files.map(file => file.path);

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
