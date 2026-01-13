const request = require('supertest');
const app = require('../server');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

const User = require('../models/User');

let adminUser;

beforeAll(async () => {
    // Clear user if exists
    await User.deleteMany({ email: 'admin_prod_test@test.com' });

    adminUser = await User.create({
        name: 'Test Admin',
        email: 'admin_prod_test@test.com',
        password: 'password123',
        role: 'ADMIN'
    });
});

const adminToken = () => {
    return jwt.sign({ id: adminUser._id, role: 'ADMIN' }, process.env.JWT_SECRET, { expiresIn: '1h' });
};

describe('Product Validation', () => {
    afterAll(async () => {
        await User.deleteMany({ email: 'admin_prod_test@test.com' });
        await mongoose.connection.close();
    });

    it('rejects negative stock', async () => {
        const res = await request(app)
            .post('/api/products')
            .send({
                name: 'Test Product',
                price: { original: 1000, selling: 800 },
                category: 'hoodies',
                sizes: { S: -2 }
            })
            .set('Authorization', `Bearer ${adminToken()}`);

        expect(res.status).toBe(400);
    });

    it('rejects more than 8 images', async () => {
        const res = await request(app)
            .post('/api/products')
            .send({
                name: 'Test Product',
                price: { original: 1000, selling: 800 },
                category: 'hoodies',
                images: Array(9).fill('valid.jpg')
            })
            .set('Authorization', `Bearer ${adminToken()}`);

        expect(res.status).toBe(400);
    });
});
