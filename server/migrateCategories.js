const mongoose = require('mongoose');
const Product = require('./models/Product');
require('dotenv').config();

/**
 * Migration script to update existing product categories
 * Maps old categories to new T-shirt focused categories
 */

const categoryMapping = {
    'men': 'normal-tshirts',
    'women': 'normal-tshirts', 
    'kids': 'normal-tshirts',
    'accessories': 'hoodies',
    'footwear': 'normal-tshirts',
    'other': 'normal-tshirts'
};

async function migrateCategories() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const products = await Product.find({});
        console.log(`Found ${products.length} products to migrate`);

        let migrated = 0;
        for (const product of products) {
            const oldCategory = product.category;
            const newCategory = categoryMapping[oldCategory] || 'normal-tshirts';
            
            if (oldCategory !== newCategory) {
                await Product.findByIdAndUpdate(product._id, { category: newCategory });
                console.log(`Updated product "${product.name}": ${oldCategory} → ${newCategory}`);
                migrated++;
            }
        }

        console.log(`Migration completed. ${migrated} products updated.`);
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

migrateCategories();