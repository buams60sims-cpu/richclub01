const express = require('express');
const router = express.Router();
const {
    createOrder,
    getAllOrders,
    getOrderById,
    getOrderByInvoice,
    trackOrder,
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
        body('items').isArray({ min: 1 }).withMessage('Order must have at least one item'),
        body('items.*.productId').isMongoId().withMessage('Invalid product ID'),
        body('items.*.size').notEmpty().withMessage('Size is required'),
        body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
        body('customer.name').notEmpty().withMessage('Name is required').trim().escape(),
        body('customer.phone').matches(/^[0-9]{10}$/).withMessage('Valid 10-digit phone number is required'),
        body('customer.address').notEmpty().withMessage('Address is required').trim().escape()
    ],
    validate,
    createOrder
);

// @route   GET /api/orders
// @desc    Get all orders (with optional filters)
// @access  Admin
router.get('/', verifyJWT, isAdmin, getAllOrders);

// @route   POST /api/orders/track
// @desc    Track order as guest using Order ID and mobile number
// @access  Public
router.post(
    '/track',
    [
        body('orderId').notEmpty().withMessage('Order ID is required').trim().escape(),
        body('mobile').matches(/^[6-9][0-9]{9}$/).withMessage('Valid 10-digit mobile number is required')
    ],
    validate,
    trackOrder
);

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
