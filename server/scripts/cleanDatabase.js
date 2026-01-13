const mongoose = require('mongoose');
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Coupon = require('../models/Coupon');
const HomeContent = require('../models/HomeContent');
require('dotenv').config();

const cleanDatabase = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        // Delete all products
        const deletedProducts = await Product.deleteMany({});
        console.log(`🗑️  Deleted ${deletedProducts.deletedCount} products`);

        // Delete all orders
        const deletedOrders = await Order.deleteMany({});
        console.log(`🗑️  Deleted ${deletedOrders.deletedCount} orders`);

        // Delete all coupons
        const deletedCoupons = await Coupon.deleteMany({});
        console.log(`🗑️  Deleted ${deletedCoupons.deletedCount} coupons`);

        // Delete all users except admin
        const deletedUsers = await User.deleteMany({ role: { $ne: 'admin' } });
        console.log(`🗑️  Deleted ${deletedUsers.deletedCount} regular users (kept admin)`);

        // Reset home content to default
        await HomeContent.deleteMany({});

        const defaultHomeContent = new HomeContent({
            heroSlides: [
                {
                    image: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=1920&h=1080&fit=crop',
                    headline: 'Welcome to Rich Club',
                    description: 'Discover premium streetwear designed for the modern individual',
                    ctaText: 'Shop Now',
                    ctaLink: '/shop',
                    badge: 'New Collection',
                    alignment: 'left',
                    isActive: true
                },
                {
                    image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1920&h=1080&fit=crop',
                    headline: 'Spring Collection 2026',
                    description: 'Elevate your style with our latest arrivals',
                    ctaText: 'Explore Now',
                    ctaLink: '/shop',
                    badge: 'Trending',
                    alignment: 'center',
                    isActive: true
                },
                {
                    image: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=1920&h=1080&fit=crop',
                    headline: 'Premium Quality',
                    description: 'Crafted with attention to detail and finest materials',
                    ctaText: 'Learn More',
                    ctaLink: '/shop',
                    badge: 'Quality',
                    alignment: 'right',
                    isActive: true
                },
                {
                    image: 'https://images.unsplash.com/photo-1558769132-cb1aea3c8565?w=1920&h=1080&fit=crop',
                    headline: 'Limited Edition',
                    description: 'Exclusive pieces available for a limited time',
                    ctaText: 'Shop Limited',
                    ctaLink: '/shop',
                    badge: 'Exclusive',
                    alignment: 'left',
                    isActive: true
                }
            ],
            lookbookItems: [
                {
                    image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1200&h=1500&fit=crop',
                    title: 'Spring Collection 2026',
                    description: 'Explore our latest arrivals featuring contemporary designs and premium fabrics',
                    link: '/shop',
                    isActive: true
                },
                {
                    image: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=1200&h=1500&fit=crop',
                    title: 'Urban Essentials',
                    description: 'Timeless pieces for the modern wardrobe',
                    link: '/shop',
                    isActive: true
                }
            ],
            featuredSection: {
                title: "Editor's Picks",
                subtitle: 'Curated selection of our finest pieces',
                productIds: [],
                isActive: true
            },
            customDesignSection: {
                title: 'Custom Design',
                subtitle: 'Create your unique style',
                description: 'Work with our designers to create something truly special',
                images: [],
                ctaText: 'Learn More',
                ctaLink: '/shop',
                isActive: false
            }
        });

        await defaultHomeContent.save();
        console.log('✅ Created default home content');

        console.log('\n🎉 Database cleaned successfully!');
        console.log('\n📊 Summary:');
        console.log(`   - Products: 0`);
        console.log(`   - Orders: 0`);
        console.log(`   - Coupons: 0`);
        console.log(`   - Users: Admin only`);
        console.log(`   - Home Content: Default template`);
        console.log('\n✨ Your database is now fresh and ready!');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error cleaning database:', error);
        process.exit(1);
    }
};

cleanDatabase();
