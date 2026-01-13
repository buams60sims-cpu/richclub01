const request = require('supertest');
const app = require('../server');
const mongoose = require('mongoose');

describe('Order Integrity', () => {
    afterAll(async () => {
        await mongoose.connection.close();
    });

    it('does NOT place order without payment verification (rejects manual status)', async () => {
        const res = await request(app)
            .post('/api/orders')
            .send({
                customer: { name: 'Test', phone: '1234567890', address: 'Test' },
                items: [{ productId: 'dummy', size: 'M', quantity: 1 }],
                paymentStatus: 'PAID'
            });

        expect(res.status).toBe(400);
        expect(res.body.message).toMatch(/cannot manually set/i);
    });
});
