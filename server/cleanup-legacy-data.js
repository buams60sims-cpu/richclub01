require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');

const cleanup = async () => {
    try {
        console.log('🔌 Connecting to database...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected');

        console.log('🔍 Searching for products with local /uploads paths...');

        // Find products where ANY image string starts with /uploads
        const query = {
            images: { $elemMatch: { $regex: "^/uploads" } }
        };

        const count = await Product.countDocuments(query);
        console.log(`📊 Found ${count} products with legacy image paths.`);

        if (count > 0) {
            const result = await Product.deleteMany(query);
            console.log(`🗑️  Deleted ${result.deletedCount} products.`);
        } else {
            console.log('✨ No legacy products found. Database is clean.');
        }

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('👋 Disconnected');
        process.exit();
    }
};

cleanup();
