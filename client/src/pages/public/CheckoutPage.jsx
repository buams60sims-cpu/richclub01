import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tag, Loader } from 'lucide-react';
import PublicLayout from '../../layouts/PublicLayout';
import { useCart } from '../../context/CartContext';
import { createOrder, validateCoupon, createRazorpayOrder, verifyPayment, getRazorpayKey } from '../../services/apiService';
import { formatPrice, validatePhone, loadRazorpayScript } from '../../utils/helpers';
import './CheckoutPage.css';

const CheckoutPage = () => {
    const navigate = useNavigate();
    const { cartItems, getCartTotal, clearCart } = useCart();

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        address: '',
    });
    const [couponCode, setCouponCode] = useState('');
    const [appliedCoupon, setAppliedCoupon] = useState(null);
    const [couponLoading, setCouponLoading] = useState(false);
    const [couponError, setCouponError] = useState('');

    // UI state
    const [formErrors, setFormErrors] = useState({});
    const [processing, setProcessing] = useState(false);

    // Redirect if cart is empty
    useEffect(() => {
        if (cartItems.length === 0) {
            navigate('/cart');
        }
    }, [cartItems, navigate]);

    // Admin sets total (₹405), system breaks it down
    const total = getCartTotal(); // ₹405 from admin
    const deliveryCharge = 50;
    const taxRate = 0.08;
    
    // Calculate backwards from total
    const amountWithoutDelivery = total - deliveryCharge; // 355
    const productCost = Math.round(amountWithoutDelivery / (1 + taxRate)); // 329
    const taxAmount = Math.round(amountWithoutDelivery - productCost); // 26
    
    // With coupon: discount reduces total, recalculate breakdown
    const discount = appliedCoupon?.discountAmount || 0;
    const finalTotal = total - discount;
    const finalAmountWithoutDelivery = finalTotal - deliveryCharge;
    const finalProductCost = Math.round(finalAmountWithoutDelivery / (1 + taxRate));
    const finalTaxAmount = Math.round(finalAmountWithoutDelivery - finalProductCost);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Clear error for this field
        if (formErrors[name]) {
            setFormErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validateForm = () => {
        const errors = {};

        if (!formData.name.trim()) {
            errors.name = 'Name is required';
        }

        if (!formData.phone.trim()) {
            errors.phone = 'Phone number is required';
        } else if (!validatePhone(formData.phone)) {
            errors.phone = 'Please enter a valid 10-digit phone number';
        }

        if (!formData.address.trim()) {
            errors.address = 'Address is required';
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleApplyCoupon = async () => {
        if (!couponCode.trim()) {
            setCouponError('Please enter a coupon code');
            return;
        }

        try {
            setCouponLoading(true);
            setCouponError('');

            const response = await validateCoupon(couponCode.toUpperCase(), total);

            if (response.success) {
                setAppliedCoupon(response.data);
                setCouponError('');
            } else {
                setCouponError(response.message || 'Invalid coupon code');
                setAppliedCoupon(null);
            }
        } catch (error) {
            setCouponError(error.message || 'Failed to validate coupon');
            setAppliedCoupon(null);
        } finally {
            setCouponLoading(false);
        }
    };

    const handleRemoveCoupon = () => {
        setAppliedCoupon(null);
        setCouponCode('');
        setCouponError('');
    };

    const handlePayment = async () => {
        // Validate form
        if (!validateForm()) {
            return;
        }

        try {
            setProcessing(true);

            // Step 1: Create order in backend
            const orderData = {
                customer: {
                    name: formData.name,
                    phone: formData.phone,
                    address: formData.address,
                },
                items: cartItems.map(item => ({
                    productId: item.productId || item._id, // Fallback for legacy cart items
                    size: item.size,
                    quantity: Number(item.quantity),
                })),
                couponCode: appliedCoupon?.code || undefined,
                paymentMethod: 'RAZORPAY',
            };

            const orderResponse = await createOrder(orderData);

            if (!orderResponse.success) {
                throw new Error(orderResponse.message || 'Failed to create order');
            }

            const order = orderResponse.data;

            // Step 2: Load Razorpay script
            const scriptLoaded = await loadRazorpayScript();
            if (!scriptLoaded) {
                throw new Error('Failed to load payment gateway. Please try again.');
            }

            // Step 3: Create Razorpay order
            const razorpayOrderResponse = await createRazorpayOrder(order._id);

            if (!razorpayOrderResponse.success) {
                throw new Error(razorpayOrderResponse.message || 'Failed to initialize payment');
            }

            const { razorpayOrderId, amount, currency, keyId } = razorpayOrderResponse.data;

            // Step 4: Open Razorpay checkout
            const options = {
                key: keyId,
                amount: amount,
                currency: currency,
                name: 'Rich Club',
                description: `Order #${order.invoiceNumber}`,
                order_id: razorpayOrderId,
                handler: async function (response) {
                    try {
                        console.log('✅ Razorpay success callback triggered', response);

                        // Step 5: Verify payment
                        const verifyResponse = await verifyPayment({
                            orderId: order._id,
                            razorpayOrderId: response.razorpay_order_id,
                            razorpayPaymentId: response.razorpay_payment_id,
                            razorpaySignature: response.razorpay_signature,
                        });

                        console.log('✅ Payment Verification Response:', verifyResponse);

                        if (verifyResponse && verifyResponse.success) {
                            // Extract order details
                            const orderDetails = verifyResponse.data;

                            // Clear cart
                            console.log('🧹 Clearing cart...');
                            clearCart();

                            // Redirect with multiple fallbacks if state is lost
                            const targetPath = `/order/${orderDetails.orderId || order._id}`;
                            console.log('🚚 Redirecting to:', targetPath);

                            navigate(targetPath, {
                                state: {
                                    invoiceNumber: orderDetails.invoiceNumber,
                                    justPaid: true
                                },
                                replace: true
                            });
                        } else {
                            throw new Error(verifyResponse?.message || 'Payment verification failed');
                        }
                    } catch (error) {
                        console.error('❌ Payment verification error:', error);
                        alert('Payment verification failed. Please contact support. ' + (error.message || ''));
                    }
                },
                prefill: {
                    name: formData.name,
                    contact: formData.phone,
                },
                theme: {
                    color: '#c9a44c', // Gold color
                },
                modal: {
                    ondismiss: function () {
                        setProcessing(false);
                    }
                }
            };

            const razorpay = new window.Razorpay(options);
            razorpay.open();

        } catch (error) {
            console.error('Checkout error detail:', error);
            const errorMessage = error.response?.data?.message || (typeof error === 'string' ? error : error.message) || 'Failed to process checkout';
            console.error('Validation failure:', errorMessage);
            alert(`Unable to proceed: ${errorMessage}`);
            setProcessing(false);
        }
    };

    if (cartItems.length === 0) {
        return null;
    }

    return (
        <PublicLayout>
            <div className="checkout-page">
                <div className="container py-48">
                    <h1 className="checkout-title">Checkout</h1>

                    <div className="checkout-grid">
                        {/* Left: Delivery Information */}
                        <div className="checkout-form-section">
                            <h2 className="section-title">Delivery Information</h2>

                            <form className="checkout-form" onSubmit={(e) => e.preventDefault()}>
                                <div className="form-group">
                                    <label className="form-label">Full Name *</label>
                                    <input
                                        type="text"
                                        name="name"
                                        className={`form-input ${formErrors.name ? 'error' : ''}`}
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        placeholder="Enter your full name"
                                    />
                                    {formErrors.name && <span className="form-error">{formErrors.name}</span>}
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Phone Number *</label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        className={`form-input ${formErrors.phone ? 'error' : ''}`}
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        placeholder="10-digit mobile number"
                                        maxLength="10"
                                    />
                                    {formErrors.phone && <span className="form-error">{formErrors.phone}</span>}
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Delivery Address *</label>
                                    <textarea
                                        name="address"
                                        className={`form-textarea ${formErrors.address ? 'error' : ''}`}
                                        value={formData.address}
                                        onChange={handleInputChange}
                                        placeholder="House No., Street, Area, City, State, PIN Code"
                                        rows="4"
                                    />
                                    {formErrors.address && <span className="form-error">{formErrors.address}</span>}
                                </div>
                            </form>
                        </div>

                        {/* Right: Order Summary (Sticky) */}
                        <div className="order-summary-wrapper">
                            <div className="order-summary">
                                <h2 className="section-title">Order Summary</h2>

                                {/* Cart Items */}
                                <div className="summary-items">
                                    {cartItems.map((item) => (
                                        <div key={`${item.productId}-${item.size}`} className="summary-item">
                                            <img src={item.image} alt={item.name} className="summary-item-image" />
                                            <div className="summary-item-info">
                                                <p className="summary-item-name">{item.name}</p>
                                                <p className="summary-item-meta">
                                                    Size: {item.size} | Qty: {item.quantity}
                                                </p>
                                            </div>
                                            <span className="summary-item-price">
                                                {formatPrice(item.price * item.quantity)}
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                {/* Coupon Section */}
                                <div className="coupon-section">
                                    <label className="form-label">
                                        <Tag size={16} /> Have a Coupon?
                                    </label>
                                    {!appliedCoupon ? (
                                        <div className="coupon-input-group">
                                            <input
                                                type="text"
                                                className="form-input"
                                                value={couponCode}
                                                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                                placeholder="Enter coupon code"
                                                disabled={couponLoading}
                                            />
                                            <button
                                                className="btn btn-secondary"
                                                onClick={handleApplyCoupon}
                                                disabled={couponLoading}
                                            >
                                                {couponLoading ? <Loader size={16} className="spin" /> : 'Apply'}
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="coupon-applied">
                                            <span className="coupon-code">{appliedCoupon.code}</span>
                                            <button className="coupon-remove" onClick={handleRemoveCoupon}>
                                                Remove
                                            </button>
                                        </div>
                                    )}
                                    {couponError && <span className="form-error">{couponError}</span>}
                                </div>

                                {/* Price Breakdown */}
                                <div className="price-breakdown">
                                    <div className="price-row">
                                        <span>Product Cost</span>
                                        <span>{formatPrice(appliedCoupon ? finalProductCost : productCost)}</span>
                                    </div>
                                    {appliedCoupon && (
                                        <div className="price-row discount-row">
                                            <span>Discount ({appliedCoupon.code})</span>
                                            <span>-{formatPrice(discount)}</span>
                                        </div>
                                    )}
                                    <div className="price-row">
                                        <span>Tax (8%)</span>
                                        <span>{formatPrice(appliedCoupon ? finalTaxAmount : taxAmount)}</span>
                                    </div>
                                    <div className="price-row">
                                        <span>Delivery Charges</span>
                                        <span>{formatPrice(deliveryCharge)}</span>
                                    </div>
                                    <div className="price-divider"></div>
                                    <div className="price-row total-row">
                                        <span>Total</span>
                                        <span>{formatPrice(finalTotal)}</span>
                                    </div>
                                </div>

                                {/* Pay Now Button */}
                                <button
                                    className="btn btn-primary btn-lg pay-now-btn"
                                    onClick={handlePayment}
                                    disabled={processing}
                                >
                                    {processing ? (
                                        <>
                                            <Loader size={20} className="spin" />
                                            Processing...
                                        </>
                                    ) : (
                                        `Pay ${formatPrice(finalTotal)}`
                                    )}
                                </button>

                                <p className="payment-note">
                                    Secure payment powered by Razorpay
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </PublicLayout>
    );
};

export default CheckoutPage;
