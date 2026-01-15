import api from '../utils/api';
import { API_BASE } from '../config/api';

// ============================================
// PRODUCTS API
// ============================================

export const getAllProducts = (params = {}) => {
    return api.get(`${API_BASE}/products`, { params });
};

export const getProductById = (id) => {
    return api.get(`${API_BASE}/products/${id}`);
};

export const checkStock = (productId, size, quantity = 1) => {
    return api.get(`${API_BASE}/products/${productId}/stock/${size}`, {
        params: { quantity },
    });
};

export const createProduct = (data) => {
    return api.post(`${API_BASE}/products`, data);
};

export const updateProduct = (id, data) => {
    return api.put(`${API_BASE}/products/${id}`, data);
};

export const deleteProduct = (id) => {
    return api.delete(`${API_BASE}/products/${id}`);
};

// ============================================
// COUPONS API
// ============================================

export const validateCoupon = (code, subtotal) => {
    return api.post(`${API_BASE}/coupons/validate`, { code, subtotal });
};

export const getAllCoupons = () => {
    return api.get(`${API_BASE}/coupons`);
};

export const createCoupon = (data) => {
    return api.post(`${API_BASE}/coupons`, data);
};

export const updateCoupon = (id, data) => {
    return api.put(`${API_BASE}/coupons/${id}`, data);
};

export const deleteCoupon = (id) => {
    return api.delete(`${API_BASE}/coupons/${id}`);
};

// ============================================
// ORDERS API
// ============================================

export const createOrder = (data) => {
    return api.post(`${API_BASE}/orders`, data);
};

export const getAllOrders = (params = {}) => {
    return api.get(`${API_BASE}/orders`, { params });
};

export const getOrderById = (id) => {
    return api.get(`${API_BASE}/orders/${id}`);
};

export const getOrderByInvoice = (invoiceNumber) => {
    return api.get(`${API_BASE}/orders/invoice/${invoiceNumber}`);
};

export const updateOrderStatus = (id, data) => {
    return api.put(`${API_BASE}/orders/${id}/status`, data);
};

export const cancelOrder = (id) => {
    return api.put(`${API_BASE}/orders/${id}/cancel`);
};

export const getOrderWhatsAppMessage = (id) => {
    return api.get(`${API_BASE}/orders/${id}/whatsapp`);
};

export const getDailySummaryWhatsAppMessage = () => {
    return api.get(`${API_BASE}/admin/daily-summary/whatsapp`);
};

// ============================================
// PAYMENT API (Razorpay)
// ============================================

export const createRazorpayOrder = (orderId) => {
    return api.post(`${API_BASE}/payments/create-order`, { orderId });
};

export const verifyPayment = (data) => {
    return api.post(`${API_BASE}/payments/verify`, data);
};

export const getRazorpayKey = () => {
    return api.get(`${API_BASE}/payments/razorpay-key`);
};

// ============================================
// AUTH API
// ============================================

export const login = (email, password) => {
    return api.post(`${API_BASE}/auth/login`, { email, password });
};

export const getCurrentUser = () => {
    return api.get(`${API_BASE}/auth/me`);
};

// ============================================
// HOME CONTENT API (CMS)
// ============================================

export const getHomeContent = () => {
    return api.get(`${API_BASE}/home-content`);
};

export const updateHomeContent = (data) => {
    return api.put(`${API_BASE}/home-content/admin`, data);
};
