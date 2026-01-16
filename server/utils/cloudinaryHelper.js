const cloudinary = require('../config/cloudinary');

/**
 * Upload buffer to Cloudinary
 * @param {Buffer} buffer - File buffer
 * @param {String} folder - Cloudinary folder path
 * @returns {Promise<Object>} - Cloudinary upload result
 */
const uploadToCloudinary = (buffer, folder) => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            {
                folder: folder,
                resource_type: 'auto',
                format: 'webp', // Auto-convert to WebP
                quality: 'auto'  // Auto-optimize quality
            },
            (error, result) => {
                if (error) return reject(error);
                resolve(result);
            }
        );
        stream.end(buffer);
    });
};

module.exports = {
    uploadToCloudinary
};
