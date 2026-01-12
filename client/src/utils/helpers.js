/**
 * Utility Functions
 * Common helper functions for the frontend
 */

/**
 * Format price to currency
 * @param {number} price - Price value
 * @param {string} currency - Currency code
 * @returns {string} Formatted price
 */
export const formatPrice = (price, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
    }).format(price);
};

/**
 * Truncate text to specified length
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated text
 */
export const truncateText = (text, maxLength = 100) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
};

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} Is valid email
 */
export const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

/**
 * Format date to readable string
 * @param {string|Date} date - Date to format
 * @returns {string} Formatted date
 */
export const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
};

/**
 * Debounce function
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in ms
 * @returns {Function} Debounced function
 */
export const debounce = (func, wait = 300) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

/**
 * Get display name for product category
 * @param {string} category - Category value
 * @returns {string} Display name
 */
export const getCategoryDisplayName = (category) => {
    const categoryNames = {
        'normal-tshirts': 'Normal T-Shirts',
        'oversize-tshirts': 'Oversize T-Shirts',
        'collar-tshirts': 'Collar T-Shirts',
        'hoodies': 'Hoodies',
        // Legacy categories for backward compatibility
        'men': 'Men',
        'women': 'Women',
        'kids': 'Kids',
        'accessories': 'Accessories',
        'footwear': 'Footwear',
        'other': 'Other'
    };
    return categoryNames[category] || category;
};

export default {
    formatPrice,
    truncateText,
    isValidEmail,
    formatDate,
    debounce,
    getCategoryDisplayName,
};
