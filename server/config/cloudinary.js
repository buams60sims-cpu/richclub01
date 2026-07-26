const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const cloudinary = require('cloudinary');

console.log('🔧 Cloudinary Config - Using credentials:');
console.log('  ☁️  CLOUD_NAME:', process.env.CLOUDINARY_CLOUD_NAME);
console.log('  🔑 API_KEY:', process.env.CLOUDINARY_API_KEY ? process.env.CLOUDINARY_API_KEY.substring(0, 5) + '...' : 'NOT SET');
console.log('  🔐 API_SECRET:', process.env.CLOUDINARY_API_SECRET ? process.env.CLOUDINARY_API_SECRET.substring(0, 5) + '...' : 'NOT SET');

cloudinary.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

module.exports = cloudinary.v2;
