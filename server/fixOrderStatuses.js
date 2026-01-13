const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/richclub')
    .then(() => console.log('✅ MongoDB Connected'))
    .catch(err => {
        console.error('❌ MongoDB Connection Error:', err);
        process.exit(1);
    });

const Order = require('./models/Order');

async function fixOrderStatuses() {
    try {
        console.log('\n🔍 Checking for orders with invalid statuses...\n');

        // Find all orders
        const orders = await Order.find({});
        console.log(`📊 Found ${orders.length} total orders\n`);

        let fixed = 0;

        for (const order of orders) {
            let needsUpdate = false;
            const updates = {};

            // Fix payment status
            if (!['INITIATED', 'PAID', 'FAILED'].includes(order.paymentStatus)) {
                console.log(`❌ Order ${order.invoiceNumber}: Invalid paymentStatus "${order.paymentStatus}"`);

                // Map old statuses to new ones
                if (order.paymentStatus === 'PENDING' || order.paymentStatus === 'RAZORPAYPENDING') {
                    updates.paymentStatus = 'INITIATED';
                } else if (order.paymentStatus === 'COMPLETED' || order.paymentStatus === 'SUCCESS') {
                    updates.paymentStatus = 'PAID';
                }
                needsUpdate = true;
            }

            // Fix order status
            if (!['INITIATED', 'CONFIRMED', 'CANCELLED'].includes(order.orderStatus)) {
                console.log(`❌ Order ${order.invoiceNumber}: Invalid orderStatus "${order.orderStatus}"`);

                // Map old statuses to new ones
                if (order.orderStatus === 'PENDING' || order.orderStatus === 'PLACED') {
                    // If payment is PAID, order should be CONFIRMED
                    // If payment is INITIATED/PENDING, order should be INITIATED
                    if (updates.paymentStatus === 'PAID' || order.paymentStatus === 'PAID') {
                        updates.orderStatus = 'CONFIRMED';
                    } else {
                        updates.orderStatus = 'INITIATED';
                    }
                } else if (order.orderStatus === 'DELIVERED' || order.orderStatus === 'SHIPPED') {
                    updates.orderStatus = 'CONFIRMED'; // Keep as confirmed
                }
                needsUpdate = true;
            }

            // Apply business logic: If payment is INITIATED, order must be INITIATED
            if (order.paymentStatus === 'INITIATED' && order.orderStatus !== 'INITIATED') {
                console.log(`⚠️  Order ${order.invoiceNumber}: Payment INITIATED but order is ${order.orderStatus}`);
                updates.orderStatus = 'INITIATED';
                needsUpdate = true;
            }

            if (needsUpdate) {
                await Order.updateOne({ _id: order._id }, { $set: updates });
                console.log(`✅ Fixed Order ${order.invoiceNumber}:`, updates);
                fixed++;
            }
        }

        console.log(`\n✅ Migration complete! Fixed ${fixed} orders.\n`);

        // Show summary
        const summary = await Order.aggregate([
            {
                $group: {
                    _id: {
                        paymentStatus: '$paymentStatus',
                        orderStatus: '$orderStatus'
                    },
                    count: { $sum: 1 }
                }
            },
            { $sort: { '_id.paymentStatus': 1, '_id.orderStatus': 1 } }
        ]);

        console.log('📊 Current Status Distribution:');
        summary.forEach(s => {
            console.log(`   Payment: ${s._id.paymentStatus.padEnd(10)} | Order: ${s._id.orderStatus.padEnd(10)} | Count: ${s.count}`);
        });

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

fixOrderStatuses();
