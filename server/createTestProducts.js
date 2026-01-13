const mongoose = require('mongoose');
const Product = require('./models/Product');
require('dotenv').config();

const testProducts = [
    {
        name: 'Premium Oversize T-Shirt - Black',
        description: 'Luxury streetwear oversize tee with premium cotton blend. Perfect for casual wear with a modern aesthetic.',
        category: 'oversize-tshirts',
        price: {
            original: 1999,
            selling: 1299
        },
        sizes: { S: 10, M: 15, L: 12, XL: 8, XXL: 5 },
        images: ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500']
    },
    {
        name: 'Classic Normal T-Shirt - White',
        description: 'Comfortable everyday wear with a classic fit. Made from 100% cotton for breathability.',
        category: 'normal-tshirts',
        price: {
            original: 1499,
            selling: 1499
        },
        sizes: { S: 5, M: 10, L: 8, XL: 5, XXL: 3 },
        images: ['https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=500']
    },
    {
        name: 'Premium Hoodie - Navy Blue',
        description: 'Warm and stylish hoodie with fleece lining. Perfect for cold weather with a modern streetwear look.',
        category: 'hoodies',
        price: {
            original: 2999,
            selling: 2499
        },
        sizes: { S: 8, M: 12, L: 10, XL: 6, XXL: 4 },
        images: ['https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=500']
    },
    {
        name: 'Collar T-Shirt - Grey',
        description: 'Smart casual collar tee perfect for semi-formal occasions. Breathable fabric with a modern fit.',
        category: 'collar-tshirts',
        price: {
            original: 1799,
            selling: 1599
        },
        sizes: { S: 6, M: 10, L: 8, XL: 4, XXL: 2 },
        images: ['https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=500']
    },
    {
        name: 'Limited Edition Oversize - Beige',
        description: 'Exclusive design with limited stock. Premium quality with unique graphics.',
        category: 'oversize-tshirts',
        price: {
            original: 2499,
            selling: 1999
        },
        sizes: { S: 2, M: 3, L: 2, XL: 1, XXL: 0 },
        images: ['https://images.unsplash.com/photo-1622445275576-721325763afe?w=500']
    },
    {
        name: 'Graphic Oversize T-Shirt - Black',
        description: 'Bold graphic design on premium oversize tee. Stand out with this statement piece.',
        category: 'oversize-tshirts',
        price: {
            original: 1799,
            selling: 1299
        },
        sizes: { S: 12, M: 18, L: 15, XL: 10, XXL: 7 },
        images: ['https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=500']
    },
    {
        name: 'Essential Normal T-Shirt - Navy',
        description: 'Wardrobe essential with a perfect fit. Versatile and comfortable for everyday wear.',
        category: 'normal-tshirts',
        price: {
            original: 1299,
            selling: 999
        },
        sizes: { S: 8, M: 15, L: 12, XL: 8, XXL: 5 },
        images: ['https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=500']
    },
    {
        name: 'Premium Hoodie - Black',
        description: 'Classic black hoodie with premium quality. Perfect for layering or standalone wear.',
        category: 'hoodies',
        price: {
            original: 3499,
            selling: 2799
        },
        sizes: { S: 10, M: 15, L: 12, XL: 8, XXL: 5 },
        images: ['https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=500']
    }
];

const createTestProducts = async () => {
    try {
        console.log('🔧 Creating Test Products...\n');

        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/richclub');
        console.log('✅ Connected to MongoDB\n');

        // Optional: Clear existing products
        const existingCount = await Product.countDocuments();
        if (existingCount > 0) {
            console.log(`⚠️  Found ${existingCount} existing products`);
            console.log('   Skipping creation to preserve existing data');
            console.log('   To replace, uncomment the deleteMany line in the script\n');
            process.exit(0);
        }

        // Create test products
        let created = 0;
        for (const productData of testProducts) {
            const product = await Product.create(productData);

            // Calculate and set discount
            const discount = Math.round(
                ((product.price.original - product.price.selling) / product.price.original) * 100
            );
            product.discountPercent = discount;
            product.isOnSale = discount > 0;
            await product.save();

            const totalStock = (product.sizes.S || 0) + (product.sizes.M || 0) +
                (product.sizes.L || 0) + (product.sizes.XL || 0) +
                (product.sizes.XXL || 0);

            console.log(`✅ Created: ${product.name}`);
            console.log(`   Category: ${product.category}`);
            console.log(`   Price: ₹${product.price.selling} (${discount}% OFF)`);
            console.log(`   Stock: ${totalStock} items\n`);

            created++;
        }

        console.log('━'.repeat(60));
        console.log(`\n🎉 Successfully created ${created} test products!`);
        console.log('\n💡 Next steps:');
        console.log('   1. Navigate to http://localhost:5173/shop');
        console.log('   2. Verify products display correctly');
        console.log('   3. Test filtering by category');
        console.log('   4. Test product details page\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error creating products:', error.message);
        console.error(error);
        process.exit(1);
    }
};

createTestProducts();
