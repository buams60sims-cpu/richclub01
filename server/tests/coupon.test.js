const request = require('supertest');
const app = require('../server');
const mongoose = require('mongoose');
const Coupon = require('../models/Coupon');

describe('Coupon Logic', () => {
    beforeAll(async () => {
        // Cleanup potential leftovers
        await Coupon.deleteMany({ code: { $in: ['OLD10_TEST', 'SAVE20_TEST'] } });

        const oldCoupon = new Coupon({
            code: 'OLD10_TEST',
            discountType: 'percentage',
            discountValue: 10,
            expiryDate: new Date(Date.now() - 86400000)
        });
        // Bypass validation for expired coupon
        await oldCoupon.save({ validateBeforeSave: false });

        const minPurchaseCoupon = new Coupon({
            code: 'SAVE20_TEST',
            discountType: 'percentage',
            discountValue: 20,
            expiryDate: new Date(Date.now() + 86400000),
            minPurchaseAmount: 1000
        });
        await minPurchaseCoupon.save();
    });

    afterAll(async () => {
        await Coupon.deleteMany({ code: { $in: ['OLD10_TEST', 'SAVE20_TEST'] } });
        await mongoose.connection.close();
    });

    it('rejects expired coupon', async () => {
        const res = await request(app)
            .post('/api/coupons/validate')
            .send({ code: 'OLD10_TEST' });

        expect(res.status).toBe(400);
        expect(res.body.message).toMatch(/expired/i);
    });

    it('rejects coupon below min purchase', async () => {
        const res = await request(app)
            .post('/api/coupons/validate')
            .send({ code: 'SAVE20_TEST', subtotal: 500 });

        expect(res.status).toBe(400);
        expect(res.body.message).toMatch(/minimum purchase/i);
    });

    it('blocks coupon brute force', async () => {
        // 16 requests
        const promises = [];
        for (let i = 0; i < 16; i++) {
            promises.push(request(app).post('/api/coupons/validate').send({ code: 'TEST_BRUTE_' + i }));
        }

        await Promise.all(promises);

        const res = await request(app).post('/api/coupons/validate').send({ code: 'TEST_LAST' });
        expect(res.status).toBe(429);
    });
});
