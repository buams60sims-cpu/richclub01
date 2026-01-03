/**
 * API Service
 * Handles all API requests to the backend
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Generic fetch wrapper with error handling
 * @param {string} endpoint - API endpoint
 * @param {object} options - Fetch options
 * @returns {Promise} Response data
 */
const fetchAPI = async (endpoint, options = {}) => {
    try {
        const response = await fetch(`${API_URL}${endpoint}`, {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
            ...options,
        });

        const data = await response.json();

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
 * Check API health status
 * @returns {Promise} Health status data
 */
export const checkHealth = async () => {
    return fetchAPI('/health');
};

/**
 * Get all products
 * @returns {Promise} Products array
 */
export const getProducts = async () => {
    return fetchAPI('/products');
};

/**
 * Get single product by ID
 * @param {string} id - Product ID
 * @returns {Promise} Product data
 */
export const getProductById = async (id) => {
    return fetchAPI(`/products/${id}`);
};

/**
 * Create a new product (Admin only)
 * @param {object} productData - Product information
 * @returns {Promise} Created product
 */
export const createProduct = async (productData) => {
    return fetchAPI('/products', {
        method: 'POST',
        body: JSON.stringify(productData),
    });
};

/**
 * User login
 * @param {object} credentials - Email and password
 * @returns {Promise} User data and token
 */
export const login = async (credentials) => {
    return fetchAPI('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
    });
};

/**
 * User registration
 * @param {object} userData - User information
 * @returns {Promise} User data and token
 */
export const register = async (userData) => {
    return fetchAPI('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData),
    });
};

export default {
    checkHealth,
    getProducts,
    getProductById,
    createProduct,
    login,
    register,
};
