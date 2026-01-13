const mongoose = require('mongoose');
require('dotenv').config();

const migrateProducts = async () => {
    try {
        // Connect to MongoDB
        console.log('🔌 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/richclub');
        console.log('✅ Connected to MongoDB');

        console.log('🔄 Starting product price migration...');

        // Find products with old price structure (price is a number)
        const result = await mongoose.connection.db.collection('products').updateMany(
            {
                $or: [
                    { "price.original": { $exists: false } },
                    { "price": { $type: "number" } }
                ]
            },
            [
                {
                    $set: {
                        "price": {
                            "original": "$price",
                            "selling": "$price"
                        },
                        "discountPercent": 0,
                        "isOnSale": false
                    }
                }
            ]
        );

        console.log(`✅ Migration completed! Updated ${result.modifiedCount} products`);
        console.log('📊 All products now have the new price structure');

        // Verify migration
        const sampleProduct = await mongoose.connection.db.collection('products').findOne({});
        if (sampleProduct) {
            console.log('📋 Sample product structure:', JSON.stringify(sampleProduct.price, null, 2));
        } else {
            console.log('ℹ️  No products found in database');
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
};

migrateProducts();