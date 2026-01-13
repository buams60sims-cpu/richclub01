// ⚠️ DATA MIGRATION SCRIPT
// Run this ONCE to migrate existing products from old price structure to new structure

require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('../models/Product');

async function migrateProductPricing() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // Find all products with old price structure
        const productsToMigrate = await Product.find({
            'price.original': { $exists: false }
        });

        console.log(`Found ${productsToMigrate.length} products to migrate`);

        for (const product of productsToMigrate) {
            // Get old price value - handle both number and object cases
            let oldPrice, oldDiscountPrice;

            if (typeof product.price === 'number') {
                oldPrice = product.price;
            } else if (product.price && typeof product.price === 'object') {
                // Price is already an object but missing original/selling
                oldPrice = product.price.original || product.price.selling || 0;
            } else {
                oldPrice = 0;
            }

            oldDiscountPrice = product.discountPrice;

            // Calculate new structure
            let original, selling, discountPercent, isOnSale;

            if (oldDiscountPrice && oldDiscountPrice < oldPrice) {
                // Product had a discount
                original = oldPrice;
                selling = oldDiscountPrice;
                discountPercent = Math.round(((original - selling) / original) * 100);
                isOnSale = true;
            } else {
                // No discount - both prices same
                original = oldPrice || 1000; // Default to 1000 if no price found
                selling = oldPrice || 1000;
                discountPercent = 0;
                isOnSale = false;
            }

            // Step 1: Unset old fields
            await Product.updateOne(
                { _id: product._id },
                {
                    $unset: {
                        'price': '',
                        'discountPrice': ''
                    }
                }
            );

            // Step 2: Set new structure
            await Product.updateOne(
                { _id: product._id },
                {
                    $set: {
                        'price': {
                            original: original,
                            selling: selling
                        },
                        'discountPercent': discountPercent,
                        'isOnSale': isOnSale
                    }
                }
            );

            console.log(`✅ Migrated: ${product.name}`);
            console.log(`   Old: ₹${oldPrice} (discount: ₹${oldDiscountPrice || 'none'})`);
            console.log(`   New: ₹${original} → ₹${selling} (${discountPercent}% OFF)`);
        }

        console.log('\n✅ Migration completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
}

// Run migration
migrateProductPricing();
