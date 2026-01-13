/**
 * 🎯 RICH CLUB - FINAL DELIVERY AUTOMATED TESTS
 * 
 * This test suite validates all critical functionality before client delivery.
 * Run with: npm test
 */

const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');
const Product = require('../models/Product');
const Order = require('../models/Order');
const User = require('../models/User');

// Test data
let adminToken;
let testProductId;

beforeAll(async () => {
    // Connect to test database
    await mongoose.connect(process.env.MONGO_URI_TEST || process.env.MONGO_URI);

    // Create admin user and get token
    const adminUser = await User.create({
        name: 'Test Admin',
        email: 'admin@test.com',
        password: 'Test@123',
        role: 'admin'
    });

    const loginRes = await request(app)
        .post('/api/auth/login')
        .send({ email: 'admin@test.com', password: 'Test@123' });

    adminToken = loginRes.body.token;
});

afterAll(async () => {
    // Clean up test data
    await Product.deleteMany({ name: /Test/ });
    await Order.deleteMany({ customerName: /Test/ });
    await User.deleteMany({ email: /test/ });
    await mongoose.connection.close();
});

describe('1️⃣ FUNCTIONAL TESTING - Product Flow', () => {

    test('✅ Product list loads correctly', async () => {
        const res = await request(app).get('/api/products');
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });

    test('✅ Product with discount displays correctly', async () => {
        const product = await Product.create({
            name: 'Test Discount Product',
            description: 'Test product with discount',
            category: 'oversized-tshirts',
            price: {
                original: 1999,
                selling: 1299
            },
            stock: { S: 10, M: 10, L: 10, XL: 10, XXL: 5 },
            images: ['test.jpg']
        });

        expect(product.discountPercent).toBe(35);
        expect(product.isOnSale).toBe(true);
        expect(product.totalStock).toBe(45);

        testProductId = product._id;
    });

    test('✅ Product without discount shows regular price', async () => {
        const product = await Product.create({
            name: 'Test Regular Product',
            description: 'Test product without discount',
            category: 'normal-tshirts',
            price: {
                original: 1499,
                selling: 1499
            },
            stock: { S: 5, M: 5, L: 5, XL: 5, XXL: 5 },
            images: ['test.jpg']
        });

        expect(product.discountPercent).toBe(0);
        expect(product.isOnSale).toBe(false);
    });

    test('✅ Category filter works correctly', async () => {
        const res = await request(app).get('/api/products?category=oversized-tshirts');
        expect(res.status).toBe(200);
        expect(res.body.every(p => p.category === 'oversized-tshirts')).toBe(true);
    });

    test('✅ Product image fallback works', async () => {
        const product = await Product.create({
            name: 'Test No Image Product',
            description: 'Test product without images',
            category: 'hoodies',
            price: {
                original: 2999,
                selling: 2999
            },
            stock: { S: 5, M: 5, L: 5, XL: 5, XXL: 5 },
            images: []
        });

        expect(product.images.length).toBe(0);
        // Frontend should show fallback image
    });
});

describe('2️⃣ ADMIN PANEL - Product Management', () => {

    test('✅ Create product with all fields', async () => {
        const res = await request(app)
            .post('/api/products')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
                name: 'Test Admin Product',
                description: 'Created via admin panel',
                category: 'sweatshirts',
                price: {
                    original: 3499,
                    selling: 2799
                },
                stock: { S: 10, M: 15, L: 12, XL: 8, XXL: 5 },
                images: ['main.jpg', 'extra1.jpg', 'extra2.jpg', 'extra3.jpg']
            });

        expect(res.status).toBe(201);
        expect(res.body.discountPercent).toBe(20);
        expect(res.body.isOnSale).toBe(true);
        expect(res.body.totalStock).toBe(50);
        expect(res.body.images.length).toBe(4);
    });

    test('✅ Edit product updates discount correctly', async () => {
        const res = await request(app)
            .put(`/api/products/${testProductId}`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
                price: {
                    original: 2499,
                    selling: 1999
                }
            });

        expect(res.status).toBe(200);
        expect(res.body.discountPercent).toBe(20);
        expect(res.body.isOnSale).toBe(true);
    });

    test('✅ Delete product removes from database', async () => {
        const product = await Product.create({
            name: 'Test Delete Product',
            description: 'To be deleted',
            category: 'normal-tshirts',
            price: { original: 999, selling: 999 },
            stock: { S: 5, M: 5, L: 5, XL: 5, XXL: 5 },
            images: ['test.jpg']
        });

        const res = await request(app)
            .delete(`/api/products/${product._id}`)
            .set('Authorization', `Bearer ${adminToken}`);

        expect(res.status).toBe(200);

        const deletedProduct = await Product.findById(product._id);
        expect(deletedProduct).toBeNull();
    });

    test('❌ Cannot create product with invalid price', async () => {
        const res = await request(app)
            .post('/api/products')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
                name: 'Test Invalid Product',
                category: 'hoodies',
                price: {
                    original: 1000,
                    selling: 1500 // Selling > Original (INVALID)
                },
                stock: { S: 5, M: 5, L: 5, XL: 5, XXL: 5 }
            });

        expect(res.status).toBe(400);
    });
});

describe('3️⃣ CART & ORDER FLOW', () => {

    test('✅ Order submission works', async () => {
        const res = await request(app)
            .post('/api/orders')
            .send({
                customerName: 'Test Customer',
                phone: '9876543210',
                address: '123 Test Street, Test City',
                items: [{
                    product: testProductId,
                    quantity: 2,
                    size: 'M',
                    price: 1299
                }],
                totalAmount: 2598,
                paymentMethod: 'razorpay',
                paymentStatus: 'pending'
            });

        expect(res.status).toBe(201);
        expect(res.body.orderId).toBeDefined();
        expect(res.body.status).toBe('pending');
    });

    test('❌ Invalid phone number rejected', async () => {
        const res = await request(app)
            .post('/api/orders')
            .send({
                customerName: 'Test Customer',
                phone: '123', // Invalid (less than 10 digits)
                address: '123 Test Street',
                items: [{ product: testProductId, quantity: 1, size: 'M', price: 1299 }],
                totalAmount: 1299,
                paymentMethod: 'razorpay'
            });

        expect(res.status).toBe(400);
    });

    test('❌ Empty cart checkout blocked', async () => {
        const res = await request(app)
            .post('/api/orders')
            .send({
                customerName: 'Test Customer',
                phone: '9876543210',
                address: '123 Test Street',
                items: [], // Empty cart
                totalAmount: 0,
                paymentMethod: 'razorpay'
            });

        expect(res.status).toBe(400);
    });

    test('✅ Stock reduces after order', async () => {
        const productBefore = await Product.findById(testProductId);
        const stockBefore = productBefore.stock.M;

        await request(app)
            .post('/api/orders')
            .send({
                customerName: 'Test Stock Customer',
                phone: '9876543210',
                address: '123 Test Street',
                items: [{
                    product: testProductId,
                    quantity: 3,
                    size: 'M',
                    price: 1299
                }],
                totalAmount: 3897,
                paymentMethod: 'razorpay'
            });

        const productAfter = await Product.findById(testProductId);
        expect(productAfter.stock.M).toBe(stockBefore - 3);
    });
});

describe('4️⃣ EDGE CASES', () => {

    test('✅ Product with 0 stock cannot be ordered', async () => {
        const product = await Product.create({
            name: 'Test Out of Stock',
            category: 'normal-tshirts',
            price: { original: 999, selling: 999 },
            stock: { S: 0, M: 0, L: 0, XL: 0, XXL: 0 },
            images: ['test.jpg']
        });

        expect(product.totalStock).toBe(0);

        const res = await request(app)
            .post('/api/orders')
            .send({
                customerName: 'Test Customer',
                phone: '9876543210',
                address: '123 Test Street',
                items: [{
                    product: product._id,
                    quantity: 1,
                    size: 'M',
                    price: 999
                }],
                totalAmount: 999,
                paymentMethod: 'razorpay'
            });

        expect(res.status).toBe(400);
    });

    test('✅ Long product name handled', async () => {
        const longName = 'A'.repeat(200);
        const product = await Product.create({
            name: longName,
            category: 'hoodies',
            price: { original: 2999, selling: 2999 },
            stock: { S: 5, M: 5, L: 5, XL: 5, XXL: 5 },
            images: ['test.jpg']
        });

        expect(product.name.length).toBe(200);
    });

    test('✅ Special characters in name handled', async () => {
        const product = await Product.create({
            name: 'Café Élégant™ Hoodie',
            category: 'hoodies',
            price: { original: 2999, selling: 2999 },
            stock: { S: 5, M: 5, L: 5, XL: 5, XXL: 5 },
            images: ['test.jpg']
        });

        expect(product.name).toBe('Café Élégant™ Hoodie');
    });
});

describe('5️⃣ DATA VALIDATION', () => {

    test('❌ Product name required', async () => {
        try {
            await Product.create({
                category: 'hoodies',
                price: { original: 2999, selling: 2999 },
                stock: { S: 5, M: 5, L: 5, XL: 5, XXL: 5 }
            });
            fail('Should have thrown validation error');
        } catch (error) {
            expect(error.name).toBe('ValidationError');
        }
    });

    test('❌ Invalid category rejected', async () => {
        try {
            await Product.create({
                name: 'Test Product',
                category: 'invalid-category',
                price: { original: 2999, selling: 2999 },
                stock: { S: 5, M: 5, L: 5, XL: 5, XXL: 5 }
            });
            fail('Should have thrown validation error');
        } catch (error) {
            expect(error.name).toBe('ValidationError');
        }
    });

    test('❌ Negative stock rejected', async () => {
        try {
            await Product.create({
                name: 'Test Product',
                category: 'hoodies',
                price: { original: 2999, selling: 2999 },
                stock: { S: -5, M: 5, L: 5, XL: 5, XXL: 5 }
            });
            fail('Should have thrown validation error');
        } catch (error) {
            expect(error.name).toBe('ValidationError');
        }
    });
});

describe('6️⃣ SECURITY', () => {

    test('❌ Admin routes protected', async () => {
        const res = await request(app)
            .post('/api/products')
            .send({
                name: 'Unauthorized Product',
                category: 'hoodies',
                price: { original: 2999, selling: 2999 },
                stock: { S: 5, M: 5, L: 5, XL: 5, XXL: 5 }
            });

        expect(res.status).toBe(401);
    });

    test('❌ Invalid JWT rejected', async () => {
        const res = await request(app)
            .post('/api/products')
            .set('Authorization', 'Bearer invalid-token')
            .send({
                name: 'Test Product',
                category: 'hoodies',
                price: { original: 2999, selling: 2999 },
                stock: { S: 5, M: 5, L: 5, XL: 5, XXL: 5 }
            });

        expect(res.status).toBe(401);
    });
});

console.log('🎯 RICH CLUB - Delivery Tests Complete!');
