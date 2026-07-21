// Format price in Indian Rupees
export const formatPrice = (price) => {
    if (price === null || price === undefined || isNaN(price)) return '₹0';
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
    }).format(price);
};

// Calculate discount percentage
export const calculateDiscountPercent = (original, selling) => {
    if (!original || !selling || original <= selling) return 0;
    return Math.round(((original - selling) / original) * 100);
};

// Format date
export const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
};

// Format date with time
export const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};

// Get human-readable order status
export const getOrderStatusLabel = (status) => {
    const labels = {
        PAYMENT_PENDING: 'Payment Pending',
        CONFIRMED: 'Confirmed',
        PROCESSING: 'Processing',
        PACKED: 'Packed',
        SHIPPED: 'Shipped',
        OUT_FOR_DELIVERY: 'Out for Delivery',
        DELIVERED: 'Delivered',
        CANCELLED: 'Cancelled',
    };
    return labels[status] || status;
};

// Get human-readable payment status
export const getPaymentStatusLabel = (status) => {
    const labels = {
        PENDING: 'Pending',
        PAID: 'Paid',
        FAILED: 'Failed',
    };
    return labels[status] || status;
};

// Get status badge class
export const getStatusBadgeClass = (status) => {
    const classes = {
        CONFIRMED: 'badge-success',
        PROCESSING: 'badge-info',
        PACKED: 'badge-info',
        SHIPPED: 'badge-warning',
        OUT_FOR_DELIVERY: 'badge-warning',
        DELIVERED: 'badge-success',
        PAYMENT_PENDING: 'badge-warning',
        PENDING: 'badge-warning',
        PAID: 'badge-success',
        CANCELLED: 'badge-danger',
        FAILED: 'badge-danger',
    };
    return classes[status] || 'badge-info';
};

// Validate Indian phone number
export const validatePhone = (phone) => {
    return /^[6-9]\d{9}$/.test(phone);
};

// Validate email
export const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

// Get category display name
export const getCategoryName = (category) => {
    const names = {
        'normal-tshirts': 'Normal T-Shirts',
        'oversize-tshirts': 'Oversize T-Shirts',
        'collar-tshirts': 'Collar T-Shirts',
        'hoodies': 'Hoodies',
    };
    return names[category] || category;
};

// Calculate cart totals
export const calculateCartTotals = (cartItems) => {
    const subtotal = cartItems.reduce((sum, item) => {
        return sum + item.price * item.quantity;
    }, 0);

    return {
        subtotal,
        itemCount: cartItems.reduce((sum, item) => sum + item.quantity, 0),
    };
};

// Check if product is low stock
export const isLowStock = (stock) => {
    return stock > 0 && stock <= 5;
};

// Check if product is out of stock
export const isOutOfStock = (stock) => {
    return stock === 0;
};

// Truncate text
export const truncateText = (text, maxLength) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
};

// Load Razorpay script
export const loadRazorpayScript = () => {
    return new Promise((resolve) => {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });
};
