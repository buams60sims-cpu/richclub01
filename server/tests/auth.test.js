const request = require('supertest');
const app = require('../server');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/User');

let adminUser;
let normalUser;

beforeAll(async () => {
    // Cleanup
    await User.deleteMany({ email: { $in: ['admin_auth@test.com', 'user_auth@test.com'] } });

    adminUser = await User.create({ name: 'Admin', email: 'admin_auth@test.com', password: 'pw', role: 'ADMIN' });
    normalUser = await User.create({ name: 'User', email: 'user_auth@test.com', password: 'pw', role: 'USER' });
});

const adminToken = () => jwt.sign({ id: adminUser._id, role: 'ADMIN' }, process.env.JWT_SECRET, { expiresIn: '1h' });
const userToken = () => jwt.sign({ id: normalUser._id, role: 'USER' }, process.env.JWT_SECRET, { expiresIn: '1h' });

describe('Admin Authorization', () => {
    afterAll(async () => {
        await User.deleteMany({ email: { $in: ['admin_auth@test.com', 'user_auth@test.com'] } });
        await mongoose.connection.close();
    });

    it('blocks access without token', async () => {
        const res = await request(app).get('/api/coupons');
        expect(res.status).toBe(401);
    });

    it('blocks non-admin user', async () => {
        const token = userToken();
        const res = await request(app)
            .get('/api/coupons')
            .set('Authorization', `Bearer ${token}`);
        expect(res.status).toBe(403);
    });

    it('allows admin access', async () => {
        const token = adminToken();
        const res = await request(app)
            .get('/api/coupons')
            .set('Authorization', `Bearer ${token}`);

        expect([200, 201]).toContain(res.status);
    });
});
