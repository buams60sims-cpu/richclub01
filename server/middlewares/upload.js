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

const multerUpload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

const deleteUploadedFile = async (file) => {
    try {
        if (file.path && (file.path.startsWith('http://') || file.path.startsWith('https://'))) {
            if (file.filename) {
                const cloudinary = require('../config/cloudinary');
                await cloudinary.uploader.destroy(file.filename);
                console.log(`🗑️ Deleted invalid file from Cloudinary: ${file.filename}`);
            }
        } else {
            const filePath = file.path;
            if (filePath && fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
                console.log(`🗑️ Deleted invalid local file: ${filePath}`);
            }
        }
    } catch (err) {
        console.error('❌ Error deleting invalid file:', err.message);
    }
};

const handleUploadLimits = (multerMiddleware) => {
    return (req, res, next) => {
        multerMiddleware(req, res, async (err) => {
            if (err) {
                // Handle Multer errors
                if (err instanceof multer.MulterError) {
                    let message = err.message;
                    if (err.code === 'LIMIT_FILE_SIZE') {
                        message = 'File too large. Maximum size allowed is 10MB.';
                    }
                    return res.status(400).json({
                        success: false,
                        message
                    });
                }
                return next(err);
            }

            // Check minimum size (1KB = 1024 bytes)
            const minSize = 1024;

            if (req.file) {
                if (req.file.size < minSize) {
                    await deleteUploadedFile(req.file);
                    return res.status(400).json({
                        success: false,
                        message: 'File size must be at least 1KB.'
                    });
                }
            }

            if (req.files && req.files.length > 0) {
                for (const file of req.files) {
                    if (file.size < minSize) {
                        // Cleanup all uploaded files in this request
                        for (const f of req.files) {
                            await deleteUploadedFile(f);
                        }
                        return res.status(400).json({
                            success: false,
                            message: 'All uploaded files must be at least 1KB.'
                        });
                    }
                }
            }

            next();
        });
    };
};

const upload = {
    single: (fieldname) => handleUploadLimits(multerUpload.single(fieldname)),
    array: (fieldname, maxCount) => handleUploadLimits(multerUpload.array(fieldname, maxCount)),
    fields: (fields) => handleUploadLimits(multerUpload.fields(fields)),
    none: () => multerUpload.none()
};

module.exports = upload;
