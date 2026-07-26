const multer = require('multer');
const path = require('path');
const fs = require('fs');

let storage;

const isCloudinaryConfigured = 
    process.env.CLOUDINARY_CLOUD_NAME && 
    process.env.CLOUDINARY_API_KEY && 
    process.env.CLOUDINARY_API_SECRET;

if (isCloudinaryConfigured) {
    try {
        const { CloudinaryStorage } = require('multer-storage-cloudinary');
        const cloudinary = require('../config/cloudinary');
        storage = new CloudinaryStorage({
            cloudinary: cloudinary,
            params: async (req, file) => {
                // Determine folder based on field name
                const folder = file.fieldname === 'image' ? 'richclub/cms' : 'richclub/products';
                return {
                    folder: folder,
                    resource_type: 'auto',
                    public_id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
                };
            }
        });
        console.log('☁️  Using Cloudinary storage for uploads');
    } catch (err) {
        console.error('❌ Failed to initialize Cloudinary storage, falling back to local storage:', err.message);
    }
}

if (!storage) {
    // Local storage fallback for development
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
    }

    storage = multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, uploadDir);
        },
        filename: (req, file, cb) => {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            const ext = path.extname(file.originalname);
            cb(null, file.fieldname + '-' + uniqueSuffix + ext);
        }
    });
    console.log('📁 Using local disk storage fallback for uploads (Cloudinary keys missing)');
}

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

module.exports = upload;
