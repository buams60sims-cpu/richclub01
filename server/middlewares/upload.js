const multer = require('multer');

// Use Memory Storage to get buffer
const storage = multer.memoryStorage();

// File filter (images only)
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Not an image! Please upload only images.'), false);
    }
};

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit (Cloudinary handles large files)
    },
    fileFilter: fileFilter
});

module.exports = upload;
