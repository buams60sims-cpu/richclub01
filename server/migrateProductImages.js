const mongoose = require('mongoose');
require('dotenv').config();

const Product = require('./models/Product');

/**
 * Migration Script: Update Product Schema for 4-Image Gallery
 * Adds mainImage field and ensures images array compatibility
 */

const migrateProducts = async () => {
    try {
        console.log('🔄 Starting product image migration...');
        
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        // Find all products
        const products = await Product.find({});
        console.log(`📦 Found ${products.length} products to migrate`);

        let migrated = 0;
        let skipped = 0;

        for (const product of products) {
            let needsUpdate = false;
            const updates = {};

            // Add mainImage if missing
            if (!product.mainImage) {
                if (product.images && product.images.length > 0) {
                    updates.mainImage = product.images[0];
                    needsUpdate = true;
                } else {
                    updates.mainImage = '';
                    updates.images = [];
                    needsUpdate = true;
                }
            }

            // Ensure images array exists and has max 4 items
            if (!product.images || !Array.isArray(product.images)) {
                updates.images = product.mainImage ? [product.mainImage] : [];
                needsUpdate = true;
            } else if (product.images.length > 4) {
                updates.images = product.images.slice(0, 4);
                needsUpdate = true;
            }

            if (needsUpdate) {
                await Product.findByIdAndUpdate(product._id, updates);
                console.log(`✅ Migrated: ${product.name}`);
                migrated++;
            } else {
                console.log(`⏭️  Skipped: ${product.name} (already compatible)`);
                skipped++;
            }
        }

        console.log('\n🎉 Migration completed!');
        console.log(`✅ Migrated: ${migrated} products`);
        console.log(`⏭️  Skipped: ${skipped} products`);
        
    } catch (error) {
        console.error('❌ Migration failed:', error);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Disconnected from MongoDB');
        process.exit(0);
    }
};

// Run migration
migrateProducts();