const express = require('express');
const router = express.Router();
const multer = require('multer');
const { uploadToCloudinary } = require('../utils/cloudinaryHelper');
const { verifyJWT, isAdmin } = require('../middlewares/auth');

// Memory storage for direct upload
const storage = multer.memoryStorage();

// File filter for images
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype) {
        cb(null, true);
    } else {
        cb(new Error('Only images (jpg, jpeg, png, webp) are allowed!'), false);
    }
};

const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit (Cloudinary handles large files well)
    fileFilter: fileFilter
});


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

        const { section } = req.body; // 'hero' or 'lookbook'
        const folder = `richclub/cms/${section || 'general'}`;

        const result = await uploadToCloudinary(req.file.buffer, folder);

        res.status(200).json({
            success: true,
            message: 'Image uploaded successfully',
            imageUrl: result.secure_url,
            publicId: result.public_id
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

        const { productId } = req.body;
        const folder = `richclub/products/${productId || 'temp'}`;

        const uploadPromises = req.files.map(file => uploadToCloudinary(file.buffer, folder));
        const results = await Promise.all(uploadPromises);

        const imageUrls = results.map(r => r.secure_url);

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
