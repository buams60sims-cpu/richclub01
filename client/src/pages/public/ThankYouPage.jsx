import { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import {
    CheckCircle2,
    Home,
    ShoppingBag,
    MessageSquare,
    Copy,
    Check,
    Truck,
    CreditCard,
    MapPin,
    Calendar,
    ChevronRight,
    ShieldCheck,
    Phone
} from 'lucide-react';
import PublicLayout from '../../layouts/PublicLayout';
import { getOrderByInvoice } from '../../services/apiService';
import { formatPrice, formatDate, getOrderStatusLabel, getPaymentStatusLabel, getStatusBadgeClass } from '../../utils/helpers';
import './ThankYouPage.css';

const ThankYouPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const searchParams = new URLSearchParams(location.search);
    const rawQueryInvoice = searchParams.get('invoice');
    const queryInvoice = rawQueryInvoice && rawQueryInvoice !== 'undefined' ? rawQueryInvoice : null;

    const {
        invoiceNumber,
        orderId,
        orderStatus,
        totalAmount,
        paymentStatus,
        paymentMethod,
        customerName,
        customerPhone,
        address,
        pinCode,
        razorpayPaymentId: razorpayPaymentIdProp
    } = location.state || {};

    const [orderData, setOrderData] = useState(
        location.state
            ? {
                  invoiceNumber,
                  orderId,
                  orderStatus: orderStatus || 'CONFIRMED',
                  totalAmount,
                  paymentStatus,
                  paymentMethod,
                  customer: {
                      name: customerName,
                      phone: customerPhone,
                      address
                  },
                  pinCode,
                  razorpayPaymentId: razorpayPaymentIdProp
              }
            : null
    );
    const [loading, setLoading] = useState(!location.state && Boolean(queryInvoice));
    const [error, setError] = useState('');
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (!orderData && queryInvoice) {
            setLoading(true);
            getOrderByInvoice(queryInvoice)
                .then((response) => {
                    if (response.success) {
                        setOrderData(response.data);
                    } else {
                        setError(response.message || 'Order could not be loaded.');
                    }
                })
                .catch((err) => {
                    setError(err.response?.data?.message || err.message || 'Order could not be loaded.');
                })
                .finally(() => {
                    setLoading(false);
                });
        }

        if (!orderData && !queryInvoice) {
            navigate('/', { replace: true });
        }
    }, [orderData, queryInvoice, navigate]);

    const displayId = orderData?.invoiceNumber || orderData?.orderId || queryInvoice || 'N/A';

    const copyOrderId = () => {
        if (displayId && displayId !== 'N/A') {
            navigator.clipboard.writeText(displayId);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleTrackOrder = () => {
        if (orderData) {
            navigate('/track-order/result', { state: { order: orderData } });
        } else {
            navigate('/track-order');
        }
    };

    if (loading) {
        return (
            <PublicLayout>
                <div className="thank-you-page py-48">
                    <div className="container">
                        <div className="thank-you-loading-box">
                            <div className="loading-spinner"></div>
                            <p>Fetching your order confirmation...</p>
                        </div>
                    </div>
                </div>
            </PublicLayout>
        );
    }

    if (!orderData) {
        return (
            <PublicLayout>
                <div className="thank-you-page py-48">
                    <div className="container">
                        <div className="thank-you-card error-card">
                            <h2>Order Not Found</h2>
                            <p>{error || 'We could not locate this order. Please check your invoice number.'}</p>
                            <Link to="/" className="btn btn-primary">
                                Return to Home
                            </Link>
                        </div>
                    </div>
                </div>
            </PublicLayout>
        );
    }

    return (
        <PublicLayout>
            <div className="thank-you-page py-48">
                <div className="container">
                    <div className="thank-you-wrapper">
                        {/* Success Celebration Header */}
                        <div className="thank-you-hero">
                            <div className="success-icon-badge">
                                <CheckCircle2 size={54} className="icon-check" />
                            </div>
                            <h1 className="thank-you-title">Order Confirmed!</h1>
                            <p className="thank-you-subtitle">
                                Thank you for shopping with Rich Club. Your payment was successful and your order is now being processed.
                            </p>

                            <div className="invoice-copy-chip" onClick={copyOrderId} title="Click to copy Order ID">
                                <span className="chip-label">Invoice ID:</span>
                                <span className="chip-code">#{displayId}</span>
                                {copied ? <Check size={14} className="copied-icon" /> : <Copy size={14} />}
                            </div>
                        </div>

                        {/* Order Details Grid */}
                        <div className="thank-you-grid">
                            {/* Card 1: Order & Payment Details */}
                            <div className="details-card">
                                <div className="card-header">
                                    <CreditCard size={18} className="card-header-icon" />
                                    <h2>Order & Payment Summary</h2>
                                </div>
                                <div className="card-body-rows">
                                    <div className="info-row">
                                        <span className="info-label">Order ID</span>
                                        <span className="info-val font-mono">#{displayId}</span>
                                    </div>
                                    <div className="info-row">
                                        <span className="info-label">Amount Paid</span>
                                        <span className="info-val highlight-gold">
                                            {formatPrice(orderData.totalAmount)}
                                        </span>
                                    </div>
                                    <div className="info-row">
                                        <span className="info-label">Payment Status</span>
                                        <span className={`badge-pill ${getStatusBadgeClass(orderData.paymentStatus || 'PAID')}`}>
                                            <span className="badge-dot"></span>
                                            {getPaymentStatusLabel(orderData.paymentStatus || 'PAID')}
                                        </span>
                                    </div>
                                    <div className="info-row">
                                        <span className="info-label">Payment Method</span>
                                        <span className="info-val">{orderData.paymentMethod || 'Razorpay Prepaid'}</span>
                                    </div>
                                    {orderData.razorpayPaymentId && (
                                        <div className="info-row">
                                            <span className="info-label">Reference ID</span>
                                            <span className="info-val font-mono text-sm">{orderData.razorpayPaymentId}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Card 2: Delivery & Shipping Details */}
                            <div className="details-card">
                                <div className="card-header">
                                    <MapPin size={18} className="card-header-icon" />
                                    <h2>Shipping & Customer Info</h2>
                                </div>
                                <div className="card-body-rows">
                                    <div className="info-row">
                                        <span className="info-label">Customer Name</span>
                                        <span className="info-val font-bold">{orderData.customer?.name || 'Customer'}</span>
                                    </div>
                                    {orderData.customer?.phone && (
                                        <div className="info-row">
                                            <span className="info-label">Phone Number</span>
                                            <span className="info-val phone-link">
                                                <Phone size={13} /> {orderData.customer.phone}
                                            </span>
                                        </div>
                                    )}
                                    <div className="info-row flex-col">
                                        <span className="info-label">Delivery Address</span>
                                        <p className="address-box">
                                            {orderData.customer?.address
                                                ? `${orderData.customer.address}${orderData.pinCode ? `, Pincode: ${orderData.pinCode}` : ''}`
                                                : 'Address provided during checkout'}
                                        </p>
                                    </div>
                                    <div className="info-row">
                                        <span className="info-label">Estimated Delivery</span>
                                        <span className="info-val text-emerald font-bold">
                                            {orderData.estimatedDelivery ? formatDate(orderData.estimatedDelivery) : '3-5 Business Days'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Itemized Products (if available) */}
                        {orderData.items && orderData.items.length > 0 && (
                            <div className="details-card items-card-full">
                                <div className="card-header">
                                    <ShoppingBag size={18} className="card-header-icon" />
                                    <h2>Ordered Products ({orderData.items.length})</h2>
                                </div>
                                <div className="ordered-items-list">
                                    {orderData.items.map((item, idx) => (
                                        <div key={idx} className="item-row">
                                            <div className="item-left">
                                                <img
                                                    src={item.image || item.productId?.images?.[0] || 'https://via.placeholder.com/150'}
                                                    alt={item.name}
                                                    className="item-thumb"
                                                />
                                                <div className="item-meta">
                                                    <span className="item-name">{item.name}</span>
                                                    <div className="item-chips">
                                                        {item.size && <span className="chip">Size: {item.size}</span>}
                                                        <span className="chip">Qty: {item.quantity}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <span className="item-price">{formatPrice(item.price * item.quantity)}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* CTA Actions Bar */}
                        <div className="thank-you-actions-bar">
                            <button className="btn btn-gold btn-lg" onClick={handleTrackOrder}>
                                <Truck size={18} />
                                <span>Track Live Order</span>
                                <ChevronRight size={16} />
                            </button>

                            <Link to="/shop" className="btn btn-secondary btn-lg">
                                <ShoppingBag size={18} />
                                <span>Continue Shopping</span>
                            </Link>

                            <a
                                href={`https://wa.me/918660538107?text=Hi,%20I%20have%20a%20query%20regarding%20my%20order%20%23${displayId}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn-whatsapp btn-lg"
                            >
                                <MessageSquare size={18} />
                                <span>WhatsApp Support</span>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </PublicLayout>
    );
};

export default ThankYouPage;
