/**
 * Price Calculation Utility
 * Reusable helpers for calculating order totals, discounts, and taxes
 */

const TAX_RATE = 0.08; // 8% GST
const DELIVERY_CHARGE = 50; // Fixed ₹50 delivery

/**
 * Calculate subtotal from order items (sum of base price × quantity)
 * @param {Array} items - Array of order items with price and quantity
 * @returns {number} Subtotal amount
 */
const calculateSubtotal = (items) => {
    if (!items || !Array.isArray(items) || items.length === 0) {
        return 0;
    }

    return items.reduce((total, item) => {
        const itemTotal = (item.price || 0) * (item.quantity || 0);
        return total + itemTotal;
    }, 0);
};

/**
 * Calculate discount amount based on coupon
 * @param {number} subtotal - Subtotal amount
 * @param {Object} coupon - Coupon object with discountType and discountValue
 * @returns {number} Discount amount
 */
const calculateDiscount = (subtotal, coupon) => {
    if (!coupon || subtotal <= 0) {
        return 0;
    }

    const { discountType, discountValue } = coupon;

    if (discountType === 'percentage') {
        const discount = (subtotal * discountValue) / 100;
        return Math.round(discount * 100) / 100;
    }

    if (discountType === 'flat') {
        return Math.min(discountValue, subtotal);
    }

    return 0;
};

/**
 * Forward-calculate price breakdown from product cost
 *
 * Formula:
 *   productCost = sum of (basePrice × quantity) for all items
 *   discount = coupon discount on productCost
 *   afterDiscount = productCost - discount
 *   taxAmount = afterDiscount × taxRate
 *   deliveryCharge = fixed ₹50
 *   totalAmount = afterDiscount + taxAmount + deliveryCharge
 *
 * @param {Array} items - Order items with price and quantity
 * @param {Object} coupon - Optional coupon object
 * @param {number} deliveryChargeOverride - Optional delivery charge override
 * @returns {Object} Complete pricing breakdown
 */
const calculateOrderPricing = (items, coupon = null, deliveryChargeOverride) => {
    const productCost = calculateSubtotal(items);
    const discount = calculateDiscount(productCost, coupon);
    const afterDiscount = Math.max(0, productCost - discount);
    const taxAmount = Math.round(afterDiscount * TAX_RATE);
    const deliveryCharge = deliveryChargeOverride !== undefined ? deliveryChargeOverride : DELIVERY_CHARGE;
    const totalAmount = afterDiscount + taxAmount + deliveryCharge;

    return {
        productCost: Math.round(productCost),
        subtotal: Math.round(productCost),
        discount: Math.round(discount),
        taxRate: TAX_RATE,
        taxAmount: Math.round(taxAmount),
        deliveryCharge: Math.round(deliveryCharge),
        totalAmount: Math.round(totalAmount)
    };
};

/**
 * Validate item pricing
 * Ensures item prices match product prices (security check)
 * @param {Array} items - Order items with productId and price
 * @param {Model} ProductModel - Mongoose Product model
 * @returns {Promise<boolean>} True if all prices are valid
 */
const validateItemPrices = async (items, ProductModel) => {
    for (const item of items) {
        const product = await ProductModel.findById(item.productId);

        if (!product) {
            throw new Error(`Product not found: ${item.productId}`);
        }

        const productPrice = typeof product.price === 'object' ? product.price.selling : product.price;

        if (Math.abs(productPrice - item.price) > 0.01) {
            throw new Error(`Price mismatch for product: ${product.name}`);
        }
    }

    return true;
};

module.exports = {
    TAX_RATE,
    DELIVERY_CHARGE,
    calculateSubtotal,
    calculateDiscount,
    calculateOrderPricing,
    validateItemPrices
};
