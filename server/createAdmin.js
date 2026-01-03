/**
 * Create Admin User Script
 * Run this script to create an admin user in the database
 * 
 * Usage: node createAdmin.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const createAdmin = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        // Check if admin already exists
        const existingAdmin = await User.findOne({ email: 'admin@richclub.com' });

        if (existingAdmin) {
            console.log('⚠️  Admin user already exists!');
            console.log('Email:', existingAdmin.email);
            console.log('Name:', existingAdmin.name);
            console.log('Role:', existingAdmin.role);
            process.exit(0);
        }

        // Create admin user
        const admin = await User.create({
            name: 'Admin User',
            email: 'admin@richclub.com',
            password: 'admin123', // Will be automatically hashed by pre-save hook
            role: 'ADMIN',
            isActive: true
        });

        console.log('\n✅ Admin user created successfully!');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📧 Email:', admin.email);
        console.log('👤 Name:', admin.name);
        console.log('🔑 Password: admin123');
        console.log('👑 Role:', admin.role);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('\n🔐 Use these credentials to login via POST /api/auth/login');
        console.log('\n⚠️  IMPORTANT: Change the password after first login!\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error creating admin:', error.message);
        process.exit(1);
    }
};

// Run the function
createAdmin();
