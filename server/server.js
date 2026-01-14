require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');

const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Initialize Express app
const app = express();

// Connect to MongoDB
connectDB();

// Security Middleware
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));
// CORS Configuration - Production-ready
const allowedOrigins = [
    'http://localhost:5173', // Vite dev
    'http://localhost:3000', // React dev
    'https://richclub.in',
    'https://www.richclub.com'
];

if (process.env.NODE_ENV === 'development') {
    allowedOrigins.push('http://localhost:5173', 'http://127.0.0.1:5173');
}

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json()); // Parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Rate Limiters
const authLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 10, // Increased slighty from 5 to 10 to prevent lockouts during normal use testing
    message: { message: 'Too many login attempts, please try again later.' }
});

const checkoutLimiter = rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 15,
    message: { message: 'Too many checkout requests. Please wait a moment.' }
});

const adminLimiter = rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 60, // 60/min for admin is safer for dashboards loading many resources
    message: { message: 'Admin rate limit exceeded.' }
});

const uploadLimiter = rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 10,
    message: { message: 'Upload limit exceeded.' }
});

// ============================================
// API v1 ROUTES (VERSIONED)
// ============================================

app.use('/api/v1/auth', authLimiter, require('./routes/authRoutes'));
app.use('/api/v1/products', require('./routes/productRoutes'));
app.use('/api/v1/coupons', checkoutLimiter, require('./routes/couponRoutes'));
app.use('/api/v1/orders', checkoutLimiter, require('./routes/orderRoutes'));
app.use('/api/v1/payments', checkoutLimiter, require('./routes/paymentRoutes'));
app.use('/api/v1/admin', adminLimiter, require('./routes/adminRoutes'));
app.use('/api/v1/upload', uploadLimiter, require('./routes/uploadRoutes'));
app.use('/api/v1/home-content', require('./routes/homeContentRoutes'));
app.use('/api/v1/health', require('./routes/healthRoutes'));

// LEGACY ROUTES (Backward compatibility - remove after frontend migration)
app.use('/api/auth', authLimiter, require('./routes/authRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/coupons', checkoutLimiter, require('./routes/couponRoutes'));
app.use('/api/orders', checkoutLimiter, require('./routes/orderRoutes'));
app.use('/api/payments', checkoutLimiter, require('./routes/paymentRoutes'));
app.use('/api/admin', adminLimiter, require('./routes/adminRoutes'));
app.use('/api/upload', uploadLimiter, require('./routes/uploadRoutes'));
app.use('/api/home-content', require('./routes/homeContentRoutes'));
app.use('/api/health', require('./routes/healthRoutes'));

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));



// Root route
app.get('/', (req, res) => {
    res.json({
        name: 'Rich Club eCommerce API',
        version: '1.0.0',
        apiVersion: 'v1',
        status: 'active',
        baseUrl: '/api/v1',
        endpoints: {
            health: 'GET /api/v1/health',
            auth: 'POST /api/v1/auth/login',
            products: 'GET /api/v1/products',
            orders: 'POST /api/v1/orders',
            payments: 'POST /api/v1/payments/create-order'
        },
        documentation: 'See API_CONTRACT.md'
    });
});

// 404 Handler - Must be after all other routes
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found',
        path: req.originalUrl,
        method: req.method
    });
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error('Error:', err.stack);

    // Mongoose Validation Error
    if (err.name === 'ValidationError') {
        return res.status(400).json({
            success: false,
            message: Object.values(err.errors).map(val => val.message).join(', ')
        });
    }

    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal Server Error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});

// Start server
// Start server only if run directly
if (require.main === module) {
    const PORT = process.env.PORT || 5000;

    const server = app.listen(PORT, () => {
        console.log(`🚀 Server RESTARTED in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
        console.log(`✅ CMS ROUTES LOADED`);
        console.log(`📡 API available at http://localhost:${PORT}`);
        console.log(`💚 Health check: http://localhost:${PORT}/api/health`);
    });

    server.on("error", (err) => {
        if (err.code === "EADDRINUSE") {
            console.error(`❌ Port ${PORT} already in use`);
            console.error(`💡 Kill the process: Task Manager → Details → End node.exe`);
            process.exit(1);
        }
        console.error('Server error:', err);
    });
}

module.exports = app;
