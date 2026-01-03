require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

// Initialize Express app
const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Health check route
app.get('/api/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Server is running smoothly',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// API Routes
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/coupons', require('./routes/couponRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/health', require('./routes/healthRoutes'));

// Root route
app.get('/', (req, res) => {
    res.json({
        message: 'Welcome to Rich Club eCommerce API',
        version: '1.0.0',
        endpoints: {
            health: '/api/health',
            products: '/api/products',
            coupons: '/api/coupons',
            orders: '/api/orders'
        },
        documentation: {
            products: {
                create: 'POST /api/products',
                getAll: 'GET /api/products',
                getById: 'GET /api/products/:id',
                update: 'PUT /api/products/:id',
                delete: 'DELETE /api/products/:id',
                checkStock: 'GET /api/products/:id/stock/:size'
            },
            coupons: {
                create: 'POST /api/coupons',
                getAll: 'GET /api/coupons',
                validate: 'POST /api/coupons/validate',
                update: 'PUT /api/coupons/:id',
                delete: 'DELETE /api/coupons/:id'
            },
            orders: {
                create: 'POST /api/orders',
                getAll: 'GET /api/orders',
                getById: 'GET /api/orders/:id',
                getByInvoice: 'GET /api/orders/invoice/:invoiceNumber',
                updateStatus: 'PUT /api/orders/:id/status',
                cancel: 'PUT /api/orders/:id/cancel'
            }
        }
    });
});

// 404 Handler - Must be after all other routes
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error('Error:', err.stack);

    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal Server Error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});

// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    console.log(`📡 API available at http://localhost:${PORT}`);
    console.log(`💚 Health check: http://localhost:${PORT}/api/health`);
});

module.exports = app;
