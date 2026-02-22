import api from '../utils/api';

// ============================================
// PRODUCTS API
// ============================================

export const getAllProducts = (params = {}) => {
    return api.get('/products', { params });
};

export const getProductById = (id) => {
    return api.get(`/products/${id}`);
};

export const checkStock = (productId, size, quantity = 1) => {
    return api.get(`/products/${productId}/stock/${size}`, {
        params: { quantity },
    });
};

export const createProduct = (data) => {
    return api.post('/products', data);
};

export const updateProduct = (id, data) => {
    return api.put(`/products/${id}`, data);
};

export const deleteProduct = (id) => {
    return api.delete(`/products/${id}`);
};

// ============================================
// COUPONS API
// ============================================

export const validateCoupon = (code, subtotal) => {
    return api.post('/coupons/validate', { code, subtotal });
};

export const getAllCoupons = () => {
    return api.get('/coupons');
};

export const createCoupon = (data) => {
    return api.post('/coupons', data);
};

export const updateCoupon = (id, data) => {
    return api.put(`/coupons/${id}`, data);
};

export const deleteCoupon = (id) => {
    return api.delete(`/coupons/${id}`);
};

// ============================================
// ORDERS API
// ============================================

export const createOrder = (data) => {
    return api.post('/orders', data);
};

export const getAllOrders = (params = {}) => {
    return api.get('/orders', { params });
};

export const getOrderById = (id) => {
    return api.get(`/orders/${id}`);
};

export const getOrderByInvoice = (invoiceNumber) => {
    return api.get(`/orders/invoice/${invoiceNumber}`);
};

export const updateOrderStatus = (id, data) => {
    return api.put(`/orders/${id}/status`, data);
};

export const cancelOrder = (id) => {
    return api.put(`/orders/${id}/cancel`);
};

export const getOrderWhatsAppMessage = (id) => {
    return api.get(`/orders/${id}/whatsapp`);
};

export const getDailySummaryWhatsAppMessage = () => {
    return api.get('/admin/daily-summary/whatsapp');
};

// ============================================
// PAYMENT API (Razorpay)
// ============================================

export const createRazorpayOrder = (orderId) => {
    return api.post('/payments/create-order', { orderId });
};

export const verifyPayment = (data) => {
    return api.post('/payments/verify', data);
};

export const getRazorpayKey = () => {
    return api.get('/payments/razorpay-key');
};

// ============================================
// AUTH API
// ============================================

export const login = (email, password) => {
    return api.post('/auth/login', { email, password });
};

export const getCurrentUser = () => {
    return api.get('/auth/me');
};

export const changePassword = (currentPassword, newPassword) => {
    return api.put('/auth/change-password', { currentPassword, newPassword });
};

// ============================================
// HOME CONTENT API (CMS)
// ============================================

export const getHomeContent = () => {
    return api.get('/home-content');
};

export const updateHomeContent = (data) => {
    return api.put('/home-content/admin', data);
};
