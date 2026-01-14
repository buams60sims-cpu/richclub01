const express = require('express');
const router = express.Router();
const {
    createOrder,
    getAllOrders,
    getOrderById,
    getOrderByInvoice,
    updateOrderStatus,
    cancelOrder,
    getOrderWhatsAppMessage
} = require('../controllers/orderController');
const { verifyJWT, isAdmin } = require('../middlewares/auth');

/**
 * Order Routes
 * All routes for order management
 */

const { body } = require('express-validator');
const validate = require('../middlewares/validate');

// @route   POST /api/orders
// @desc    Create a new order (Online Payment)
// @access  Public
router.post(
    '/',
    [
        body('products').isArray({ min: 1 }).withMessage('Order must have at least one product'),
        body('products.*.product').isMongoId().withMessage('Invalid product ID'),
        body('products.*.size').notEmpty().withMessage('Size is required'),
        body('products.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
        body('totalAmount').isFloat({ min: 0 }).withMessage('Invalid total amount'),
        body('shippingAddress.name').notEmpty().withMessage('Name is required').trim().escape(),
        body('shippingAddress.email').isEmail().withMessage('Valid email is required').normalizeEmail(),
        body('shippingAddress.phone').matches(/^[0-9]{10}$/).withMessage('Valid 10-digit phone number is required'),
        body('shippingAddress.address').notEmpty().withMessage('Address is required').trim().escape(),
        body('shippingAddress.city').notEmpty().withMessage('City is required').trim().escape(),
        body('shippingAddress.state').notEmpty().withMessage('State is required').trim().escape(),
        body('shippingAddress.pincode').matches(/^[0-9]{6}$/).withMessage('Valid 6-digit pincode is required'),
        body('payment.razorpayOrderId').notEmpty().withMessage('Razorpay Order ID is required'),
        body('payment.razorpayPaymentId').notEmpty().withMessage('Razorpay Payment ID is required'),
        body('payment.razorpaySignature').notEmpty().withMessage('Razorpay Signature is required'),
    ],
    validate,
    createOrder
);

// @route   GET /api/orders
// @desc    Get all orders (with optional filters)
// @access  Admin
router.get('/', verifyJWT, isAdmin, getAllOrders);

// @route   GET /api/orders/invoice/:invoiceNumber
// @desc    Get order by invoice number
// @access  Public (for order tracking)
router.get('/invoice/:invoiceNumber', getOrderByInvoice);

// @route   GET /api/orders/:id
// @desc    Get single order by ID
// @access  Admin
router.get('/:id', verifyJWT, isAdmin, getOrderById);

// @route   PUT /api/orders/:id/status
// @desc    Update order status
// @access  Admin
router.put('/:id/status', verifyJWT, isAdmin, updateOrderStatus);

// @route   PUT /api/orders/:id/cancel
// @desc    Cancel order
// @access  Admin
router.put('/:id/cancel', verifyJWT, isAdmin, cancelOrder);

// @route   GET /api/orders/:id/whatsapp
// @desc    Get order details formatted for WhatsApp
// @access  Admin
router.get('/:id/whatsapp', verifyJWT, isAdmin, getOrderWhatsAppMessage);

module.exports = router;
