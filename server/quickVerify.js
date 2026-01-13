/**
 * 🔍 RICH CLUB - Quick System Verification
 * 
 * This script performs a quick health check of the system before full testing.
 * Run with: node quickVerify.js
 */

const mongoose = require('mongoose');
require('dotenv').config();

const quickVerify = async () => {
    try {
        console.log('🔍 RICH CLUB - QUICK SYSTEM VERIFICATION\n');
        console.log('='.repeat(60));

        // 1. Database Connection
        console.log('\n1️⃣ Testing Database Connection...');
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/richclub');
        console.log('   ✅ MongoDB connected successfully');

        // 2. Check Products
        console.log('\n2️⃣ Checking Products...');
        const Product = mongoose.model('Product', new mongoose.Schema({}, { strict: false }));
        const productCount = await Product.countDocuments();
        console.log(`   📦 Total products: ${productCount}`);

        if (productCount > 0) {
            // Check pricing structure
            const sampleProduct = await Product.findOne();
            console.log('\n   📋 Sample Product Structure:');
            console.log(`   - Name: ${sampleProduct.name}`);
            console.log(`   - Category: ${sampleProduct.category}`);

            if (sampleProduct.price && typeof sampleProduct.price === 'object') {
                console.log(`   - Price.Original: ₹${sampleProduct.price.original}`);
                console.log(`   - Price.Selling: ₹${sampleProduct.price.selling}`);
                console.log(`   - Discount: ${sampleProduct.discountPercent}%`);
                console.log(`   - On Sale: ${sampleProduct.isOnSale}`);
                console.log('   ✅ New pricing structure detected');
            } else {
                console.log(`   - Price: ₹${sampleProduct.price}`);
                console.log('   ⚠️  Old pricing structure - migration needed');
            }

            // Check stock
            if (sampleProduct.sizes) {
                const totalStock = (sampleProduct.sizes.S || 0) +
                    (sampleProduct.sizes.M || 0) +
                    (sampleProduct.sizes.L || 0) +
                    (sampleProduct.sizes.XL || 0) +
                    (sampleProduct.sizes.XXL || 0);
                console.log(`   - Total Stock: ${totalStock}`);
            }

            // Check images
            if (sampleProduct.images && Array.isArray(sampleProduct.images)) {
                console.log(`   - Images: ${sampleProduct.images.length} image(s)`);
            }

            // Check categories
            console.log('\n   📊 Products by Category:');
            const categories = await Product.aggregate([
                { $group: { _id: '$category', count: { $sum: 1 } } },
                { $sort: { count: -1 } }
            ]);
            categories.forEach(cat => {
                console.log(`   - ${cat._id}: ${cat.count} product(s)`);
            });
        } else {
            console.log('   ⚠️  No products found in database');
            console.log('   💡 You may need to create test products');
        }

        // 3. Check Orders
        console.log('\n3️⃣ Checking Orders...');
        const Order = mongoose.model('Order', new mongoose.Schema({}, { strict: false }));
        const orderCount = await Order.countDocuments();
        console.log(`   📦 Total orders: ${orderCount}`);

        if (orderCount > 0) {
            const recentOrder = await Order.findOne().sort({ createdAt: -1 });
            console.log(`   - Most recent order: ${recentOrder.orderId || recentOrder._id}`);
            console.log(`   - Status: ${recentOrder.status}`);
            console.log(`   - Total: ₹${recentOrder.totalAmount}`);
        }

        // 4. Check Users
        console.log('\n4️⃣ Checking Users...');
        const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));
        const userCount = await User.countDocuments();
        const adminCount = await User.countDocuments({ role: 'admin' });
        console.log(`   👥 Total users: ${userCount}`);
        console.log(`   👑 Admin users: ${adminCount}`);

        if (adminCount === 0) {
            console.log('   ⚠️  No admin users found');
            console.log('   💡 You may need to create an admin account');
        }

        // 5. Environment Check
        console.log('\n5️⃣ Checking Environment Variables...');
        const requiredEnvVars = [
            'MONGO_URI',
            'JWT_SECRET',
            'RAZORPAY_KEY_ID',
            'RAZORPAY_KEY_SECRET'
        ];

        requiredEnvVars.forEach(varName => {
            if (process.env[varName]) {
                console.log(`   ✅ ${varName}: Set`);
            } else {
                console.log(`   ❌ ${varName}: Missing`);
            }
        });

        // 6. Summary
        console.log('\n' + '='.repeat(60));
        console.log('\n📊 VERIFICATION SUMMARY:\n');

        const issues = [];
        if (productCount === 0) issues.push('No products in database');
        if (adminCount === 0) issues.push('No admin users');
        if (!process.env.MONGO_URI) issues.push('MONGO_URI not set');
        if (!process.env.JWT_SECRET) issues.push('JWT_SECRET not set');
        if (!process.env.RAZORPAY_KEY_ID) issues.push('RAZORPAY_KEY_ID not set');

        if (issues.length === 0) {
            console.log('✅ All checks passed! System is ready for testing.');
        } else {
            console.log('⚠️  Issues found:');
            issues.forEach(issue => console.log(`   - ${issue}`));
        }

        console.log('\n' + '='.repeat(60));
        console.log('\n💡 Next Steps:');
        console.log('   1. Open testing-checklist.html in browser');
        console.log('   2. Navigate to http://localhost:5173 (frontend)');
        console.log('   3. Navigate to http://localhost:5173/shop');
        console.log('   4. Start checking off items in the testing tool');
        console.log('\n');

        process.exit(0);
    } catch (error) {
        console.error('\n❌ Verification failed:', error.message);
        console.error('\n💡 Make sure:');
        console.error('   - MongoDB is running');
        console.error('   - .env file exists with correct values');
        console.error('   - Backend server is running');
        process.exit(1);
    }
};

quickVerify();
