const express = require('express');
const router = express.Router();
const {
    createOrder,
    getAllOrders,
    getOrderById,
    getOrderByInvoice,
    updateOrderStatus,
    cancelOrder
} = require('../controllers/orderController');

/**
 * Order Routes
 * All routes for order management
 */

// @route   POST /api/orders
// @desc    Create a new order (COD)
// @access  Public
router.post('/', createOrder);

// @route   GET /api/orders
// @desc    Get all orders (with optional filters)
// @access  Admin
router.get('/', getAllOrders);

// @route   GET /api/orders/invoice/:invoiceNumber
// @desc    Get order by invoice number
// @access  Public (for order tracking)
router.get('/invoice/:invoiceNumber', getOrderByInvoice);

// @route   GET /api/orders/:id
// @desc    Get single order by ID
// @access  Admin
router.get('/:id', getOrderById);

// @route   PUT /api/orders/:id/status
// @desc    Update order status
// @access  Admin
router.put('/:id/status', updateOrderStatus);

// @route   PUT /api/orders/:id/cancel
// @desc    Cancel order
// @access  Admin / Customer
router.put('/:id/cancel', cancelOrder);

module.exports = router;
