/**
 * API Service
 * Handles all API requests to the backend with authentication support
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Get the auth token from local storage
 * @returns {string|null}
 */
const getToken = () => localStorage.getItem('admin_token');

/**
 * Generic fetch wrapper with error handling and auth token
 * @param {string} endpoint - API endpoint
 * @param {object} options - Fetch options
 * @returns {Promise} Response data
 */
const fetchAPI = async (endpoint, options = {}) => {
    try {
        const token = getToken();

        const headers = {
            ...options.headers,
        };

        // Only set Content-Type if not sending FormData (browser sets boundary automatically)
        if (!(options.body instanceof FormData)) {
            headers['Content-Type'] = 'application/json';
        }

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${API_URL}${endpoint}`, {
            ...options,
            headers,
        });

        // Handle 401 Unauthorized (token expired or invalid)
        if (response.status === 401 && endpoint !== '/auth/login') {
            localStorage.removeItem('admin_token');
            window.location.href = '/login';
            throw new Error('Session expired. Please login again.');
        }

        // Check if response has content before parsing JSON
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            throw new Error(`Server returned ${response.status}: ${response.statusText}`);
        }

        const text = await response.text();
        if (!text) {
            throw new Error('Empty response from server');
        }

        const data = JSON.parse(text);

        if (!response.ok) {
            throw new Error(data.message || 'Something went wrong');
        }

        return data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
};

/**
 * AUTH SERVICE
 */
export const auth = {
    login: async (credentials) => {
        const response = await fetchAPI('/auth/login', {
            method: 'POST',
            body: JSON.stringify(credentials),
        });
        if (response.success && response.data.token) {
            localStorage.setItem('admin_token', response.data.token);
        }
        return response;
    },
    logout: () => {
        localStorage.removeItem('admin_token');
    },
    getMe: () => fetchAPI('/auth/me'),
    isLoggedIn: () => !!getToken(),
};

/**
 * PRODUCTS SERVICE
 */
export const products = {
    getAll: (params = {}) => {
        const searchParams = new URLSearchParams(params);
        return fetchAPI(`/products?${searchParams.toString()}`);
    },
    getById: (id) => fetchAPI(`/products/${id}`),
    create: (data) => fetchAPI('/products', {
        method: 'POST',
        body: JSON.stringify(data),
    }),
    update: (id, data) => fetchAPI(`/products/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    }),
    delete: (id) => fetchAPI(`/products/${id}`, {
        method: 'DELETE',
    }),
    checkStock: (id, size, quantity) =>
        fetchAPI(`/products/${id}/stock/${size}?quantity=${quantity}`),
    uploadImage: (formData) => fetchAPI('/upload/product-image', {
        method: 'POST',
        body: formData,
    }),
    uploadImages: (formData) => fetchAPI('/upload/product-images', {
        method: 'POST',
        body: formData,
    }),
};

/**
 * ORDERS SERVICE
 */
export const orders = {
    create: (data) => fetchAPI('/orders', {
        method: 'POST',
        body: JSON.stringify(data),
    }),
    getAll: (params = {}) => {
        const searchParams = new URLSearchParams(params);
        return fetchAPI(`/orders?${searchParams.toString()}`);
    },
    getById: (id) => fetchAPI(`/orders/${id}`),
    getByInvoice: (invoiceNumber) => fetchAPI(`/orders/invoice/${invoiceNumber}`),
    updateStatus: (id, statusData) => fetchAPI(`/orders/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify(statusData),
    }),
    cancel: (id) => fetchAPI(`/orders/${id}/cancel`, {
        method: 'PUT',
    }),
    getWhatsAppMessage: (id) => fetchAPI(`/orders/${id}/whatsapp`),
};

/**
 * ADMIN SERVICE
 */
export const admin = {
    getDailySummaryWhatsApp: () => fetchAPI('/admin/daily-summary/whatsapp'),
};

/**
 * COUPONS SERVICE
 */
export const coupons = {
    validate: (code, subtotal) => fetchAPI('/coupons/validate', {
        method: 'POST',
        body: JSON.stringify({ code, subtotal }),
    }),
    getAll: () => fetchAPI('/coupons'),
    create: (data) => fetchAPI('/coupons', {
        method: 'POST',
        body: JSON.stringify(data),
    }),
    update: (id, data) => fetchAPI(`/coupons/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    }),
    delete: (id) => fetchAPI(`/coupons/${id}`, {
        method: 'DELETE',
    }),
};

/**
 * PAYMENTS SERVICE (RAZORPAY)
 */
export const payments = {
    createOrder: (orderId) => fetchAPI('/payments/create-order', {
        method: 'POST',
        body: JSON.stringify({ orderId }),
    }),
    verify: (paymentData) => fetchAPI('/payments/verify', {
        method: 'POST',
        body: JSON.stringify(paymentData),
    }),
    getKey: () => fetchAPI('/payments/razorpay-key'),
};

/**
 * HOME CONTENT SERVICE (CMS)
 */
export const homeContent = {
    // Public
    get: () => fetchAPI('/home-content'),

    // Admin
    getAdmin: () => fetchAPI('/home-content/admin'),
    update: (data) => fetchAPI('/home-content/admin', {
        method: 'PUT',
        body: JSON.stringify(data),
    }),

    // Hero Slides
    addHeroSlide: (data) => fetchAPI('/home-content/admin/hero', {
        method: 'POST',
        body: JSON.stringify(data),
    }),
    updateHeroSlide: (id, data) => fetchAPI(`/home-content/admin/hero/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    }),
    deleteHeroSlide: (id) => fetchAPI(`/home-content/admin/hero/${id}`, {
        method: 'DELETE',
    }),

    // Lookbook Items
    addLookbookItem: (data) => fetchAPI('/home-content/admin/lookbook', {
        method: 'POST',
        body: JSON.stringify(data),
    }),
    updateLookbookItem: (id, data) => fetchAPI(`/home-content/admin/lookbook/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    }),
    deleteLookbookItem: (id) => fetchAPI(`/home-content/admin/lookbook/${id}`, {
        method: 'DELETE',
    }),

    // Reorder
    reorder: (type, items) => fetchAPI('/home-content/admin/reorder', {
        method: 'PUT',
        body: JSON.stringify({ type, items }),
    }),
};

/**
 * UPLOAD SERVICE
 */
export const upload = {
    // Professional CMS Upload (Optimized)
    cms: (file, section) => {
        const formData = new FormData();
        formData.append('image', file);
        formData.append('section', section);

        return fetchAPI('/upload/cms', {
            method: 'POST',
            body: formData,
        });
    },

    // Product Image Upload
    product: (file) => {
        const formData = new FormData();
        formData.append('image', file);

        return fetchAPI('/upload/product-image', {
            method: 'POST',
            body: formData,
        });
    }
};

export default {
    auth,
    products,
    orders,
    coupons,
    payments,
    admin,
    homeContent,
    upload,
};


