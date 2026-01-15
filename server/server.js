require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');

const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// ============================================
// ENVIRONMENT VALIDATION (FAIL FAST)
// ============================================
const requiredEnvVars = [
    'MONGO_URI',
    'JWT_SECRET',
    'NODE_ENV'
];

const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
    console.error('❌ FATAL: Missing required environment variables:');
    missingVars.forEach(varName => console.error(`   - ${varName}`));
    console.error('\n💡 Set these in your deployment platform or .env file');
    process.exit(1);
}

// Validate JWT_SECRET strength (production-grade requirement)
if (process.env.JWT_SECRET.length < 32) {
    console.error('❌ FATAL: JWT_SECRET must be at least 32 characters long');
    console.error('   Current length:', process.env.JWT_SECRET.length);
    console.error('\n💡 Generate strong secret: node -e "console.log(require(\'crypto\').randomBytes(64).toString(\'hex\'))"');
    process.exit(1);
}

// Validate MONGO_URI format
if (!process.env.MONGO_URI.includes('mongodb')) {
    console.error('❌ FATAL: MONGO_URI appears invalid (must start with mongodb:// or mongodb+srv://)');
    console.error('   Current value:', process.env.MONGO_URI.substring(0, 20) + '...');
    process.exit(1);
}

// Warn if optional but recommended vars are missing
const recommendedVars = ['CLIENT_URL', 'RAZORPAY_KEY_ID', 'RAZORPAY_KEY_SECRET'];
const missingRecommended = recommendedVars.filter(varName => !process.env[varName]);

if (missingRecommended.length > 0) {
    console.warn('⚠️  WARNING: Missing recommended environment variables:');
    missingRecommended.forEach(varName => console.warn(`   - ${varName}`));
}

console.log('✅ Environment validation passed');

// Initialize Express app
const app = express();

// Connect to MongoDB
connectDB();

// Security Middleware
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// 🔥 COMPREHENSIVE SAFETY NET - Force /api/v1 prefix on all API routes
// This middleware catches ANY request to legacy paths and rewrites them to versioned endpoints
// Prevents 404s even if frontend has bugs or uses old cached builds
app.use((req, res, next) => {
    const legacyPaths = [
        '/auth',
        '/products',
        '/orders',
        '/payments',
        '/home-content',
        '/admin',
        '/coupons',
        '/health',
        '/upload'
    ];

    // Check if path starts with any legacy path (but NOT already versioned)
    const isLegacyPath = legacyPaths.some(path => req.path.startsWith(path));
    const isAlreadyVersioned = req.path.startsWith('/api/v1/');

    if (isLegacyPath && !isAlreadyVersioned) {
        const originalUrl = req.url;
        req.url = `/api/v1${req.url}`;
        console.log(`⚠️  Auto-corrected: ${originalUrl} → ${req.url}`);
    }

    next();
});

// CORS Configuration - Production Safe (Final Fix)
const allowedOrigins = [
    "https://richclub01.vercel.app",
    "https://www.richclub01.vercel.app",
    "https://richclub01.com",
    "https://www.richclub01.com"
];

// Add local development URLs if not in production
if (process.env.NODE_ENV !== 'production') {
    allowedOrigins.push('http://localhost:3000');
    allowedOrigins.push('http://localhost:3001');
    allowedOrigins.push('http://localhost:5173');
    allowedOrigins.push('http://localhost:4173');
}

const corsOptions = {
    origin: (origin, callback) => {
        // Allow requests with no origin (Postman, server-to-server, health checks)
        if (!origin) {
            return callback(null, true);
        }

        // Allow Vercel preview deployments
        if (origin.endsWith(".vercel.app")) {
            return callback(null, true);
        }

        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }

        return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));
app.use(express.json()); // Parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Trust Proxy (Required for Render/Vercel/Heroku)
// This fixes the 'X-Forwarded-For' rate limit error and allows https detection
app.set('trust proxy', 1);

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
