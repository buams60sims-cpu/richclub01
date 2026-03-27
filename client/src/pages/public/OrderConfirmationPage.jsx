import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle, Package, MapPin, CreditCard, Calendar } from 'lucide-react';
import PublicLayout from '../../layouts/PublicLayout';
import { getOrderById, getOrderByInvoice } from '../../services/apiService';
import { formatPrice, formatDateTime, getPaymentStatusLabel, getOrderStatusLabel, getStatusBadgeClass } from '../../utils/helpers';
import './OrderConfirmationPage.css';

const OrderConfirmationPage = () => {
    const { id } = useParams();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadOrder();
    }, [id]);

    const loadOrder = async () => {
        try {
            setLoading(true);
            let response;

            // Determine if ID is MongoID or Invoice Number
            // Invoice numbers start with INV- or strictly follow pattern
            if (id?.startsWith('INV-')) {
                // Public API for Guest Checkout
                response = await getOrderByInvoice(id);
            } else {
                // Admin/Owner API (requires auth)
                response = await getOrderById(id);
            }

            if (response.success && response.data) {
                setOrder(response.data);
            }
        } catch (error) {
            console.error('Failed to load order:', error);
        } finally {
            setLoading(false);
        }
    };


    if (loading) {
        return (
            <PublicLayout>
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                </div>
            </PublicLayout>
        );
    }

    if (!order) {
        return (
            <PublicLayout>
                <div className="container py-48">
                    <div className="order-not-found">
                        <h2>Order Not Found</h2>
                        <p>We couldn't find the order you're looking for.</p>
                        <Link to="/shop" className="btn btn-primary">
                            Continue Shopping
                        </Link>
                    </div>
                </div>
            </PublicLayout>
        );
    }

    const isPaid = order.paymentStatus === 'PAID';

    return (
        <PublicLayout>
            <div className="order-confirmation-page">
                <div className="container py-48">
                    {/* Success Header */}
                    <div className="confirmation-header">
                        <div className="success-icon">
                            <CheckCircle size={64} />
                        </div>
                        <h1 className="confirmation-title">
                            {isPaid ? 'Order Confirmed!' : 'Order Received'}
                        </h1>
                        <p className="confirmation-subtitle">
                            {isPaid
                                ? 'Thank you for your purchase. Your order has been confirmed.'
                                : 'Your order has been created. Please complete the payment to confirm.'}
                        </p>
                        <div className="invoice-number">
                            Order #{order.invoiceNumber}
                        </div>
                    </div>

                    {/* Order Details Grid */}
                    <div className="order-details-grid">
                        {/* Order Summary */}
                        <div className="order-section">
                            <h2 className="section-heading">
                                <Package size={20} />
                                Order Summary
                            </h2>

                            <div className="order-items">
                                {order.items?.map((item, index) => (
                                    <div key={index} className="order-item">
                                        <div className="order-item-info">
                                            <p className="order-item-name">{item.name}</p>
                                            <p className="order-item-meta">
                                                Size: {item.size} | Qty: {item.quantity}
                                            </p>
                                        </div>
                                        <span className="order-item-price">
                                            {formatPrice(item.price * item.quantity)}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            <div className="order-totals">
                                <div className="total-row">
                                    <span>Product Cost</span>
                                    <span>{formatPrice(order.productCost || order.subtotal)}</span>
                                </div>
                                {order.discount > 0 && (
                                    <div className="total-row discount-row">
                                        <span>Discount {order.couponCode && `(${order.couponCode})`}</span>
                                        <span>-{formatPrice(order.discount)}</span>
                                    </div>
                                )}
                                {order.taxAmount > 0 && (
                                    <div className="total-row">
                                        <span>Tax ({((order.taxRate || 0.08) * 100).toFixed(0)}%)</span>
                                        <span>{formatPrice(order.taxAmount)}</span>
                                    </div>
                                )}
                                {order.deliveryCharge > 0 && (
                                    <div className="total-row">
                                        <span>Delivery Charges</span>
                                        <span>{formatPrice(order.deliveryCharge)}</span>
                                    </div>
                                )}
                                <div className="total-divider"></div>
                                <div className="total-row total-amount">
                                    <span>Total</span>
                                    <span>{formatPrice(order.totalAmount)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Delivery & Payment Info */}
                        <div className="info-sections">
                            {/* Delivery Address */}
                            <div className="info-card">
                                <h3 className="info-heading">
                                    <MapPin size={18} />
                                    Delivery Address
                                </h3>
                                <div className="info-content">
                                    <p className="customer-name">{order.customer?.name}</p>
                                    <p className="customer-phone">{order.customer?.phone}</p>
                                    <p className="customer-address">{order.customer?.address}</p>
                                </div>
                            </div>

                            {/* Payment Information */}
                            <div className="info-card">
                                <h3 className="info-heading">
                                    <CreditCard size={18} />
                                    Payment Information
                                </h3>
                                <div className="info-content">
                                    <div className="info-row">
                                        <span>Payment Method</span>
                                        <span className="info-value">Razorpay</span>
                                    </div>
                                    <div className="info-row">
                                        <span>Payment Status</span>
                                        <span className={`badge ${getStatusBadgeClass(order.paymentStatus)}`}>
                                            {getPaymentStatusLabel(order.paymentStatus)}
                                        </span>
                                    </div>
                                    <div className="info-row">
                                        <span>Order Status</span>
                                        <span className={`badge ${getStatusBadgeClass(order.orderStatus)}`}>
                                            {getOrderStatusLabel(order.orderStatus)}
                                        </span>
                                    </div>
                                    {order.razorpayPaymentId && (
                                        <div className="info-row">
                                            <span>Payment ID</span>
                                            <span className="info-value payment-id">{order.razorpayPaymentId}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Order Date */}
                            <div className="info-card">
                                <h3 className="info-heading">
                                    <Calendar size={18} />
                                    Order Date
                                </h3>
                                <div className="info-content">
                                    <p className="order-date">{formatDateTime(order.createdAt)}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="confirmation-actions">
                        <Link to="/shop" className="btn btn-primary btn-lg">
                            Continue Shopping
                        </Link>
                        <button
                            className="btn btn-secondary btn-lg"
                            onClick={() => window.print()}
                        >
                            Print Invoice
                        </button>
                    </div>
                </div>
            </div>
        </PublicLayout>
    );
};

export default OrderConfirmationPage;
