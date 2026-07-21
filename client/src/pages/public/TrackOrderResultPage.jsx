import { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import {
    ArrowLeft,
    MapPin,
    Clock,
    Package,
    CheckCircle2,
    Truck,
    Home,
    Copy,
    Check,
    ExternalLink,
    ShieldCheck,
    CreditCard,
    Calendar,
    AlertCircle,
    ShoppingBag,
    Phone
} from 'lucide-react';
import PublicLayout from '../../layouts/PublicLayout';
import { formatPrice, formatDate, getOrderStatusLabel, getPaymentStatusLabel, getStatusBadgeClass } from '../../utils/helpers';
import './TrackOrderResultPage.css';

const TrackOrderResultPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const order = location.state?.order;
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (!order) {
            navigate('/track-order', { replace: true });
        }
    }, [order, navigate]);

    if (!order) {
        return null;
    }

    const copyOrderId = () => {
        if (order?.orderId) {
            navigator.clipboard.writeText(order.orderId);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    // Calculate Progress Stepper Stage Index
    const getStepStage = (status) => {
        switch (status) {
            case 'CANCELLED':
                return -1;
            case 'PAYMENT_PENDING':
                return 0;
            case 'CONFIRMED':
            case 'PROCESSING':
            case 'PACKED':
                return 1;
            case 'SHIPPED':
            case 'OUT_FOR_DELIVERY':
                return 2;
            case 'DELIVERED':
                return 3;
            default:
                return 1;
        }
    };

    const currentStep = getStepStage(order.orderStatus);

    const steps = [
        { title: 'Order Placed', desc: 'Order received', icon: <Package size={20} /> },
        { title: 'Processing', desc: 'Packed & ready', icon: <ShieldCheck size={20} /> },
        { title: 'In Transit', desc: 'Dispatched via courier', icon: <Truck size={20} /> },
        { title: 'Delivered', desc: 'Handed over to customer', icon: <Home size={20} /> }
    ];

    return (
        <PublicLayout>
            <div className="track-order-result-page py-48">
                <div className="container">
                    <div className="result-wrapper">
                        {/* Top Action Bar */}
                        <div className="top-action-bar">
                            <Link to="/track-order" className="back-btn">
                                <ArrowLeft size={16} /> Back to Tracker
                            </Link>

                            <div className="order-id-chip" onClick={copyOrderId} title="Click to copy Order ID">
                                <span className="id-label">Order ID:</span>
                                <span className="id-value">#{order.orderId}</span>
                                {copied ? <Check size={14} className="copied-icon" /> : <Copy size={14} />}
                            </div>
                        </div>

                        {/* Order Progress Stepper Card */}
                        <div className="stepper-card">
                            <div className="stepper-header">
                                <div>
                                    <h1 className="stepper-title">Order Status</h1>
                                    <p className="stepper-subtitle">
                                        Placed on {order.createdAt ? formatDate(order.createdAt) : 'Recent'}
                                    </p>
                                </div>
                                <div className="status-badges-group">
                                    <span className={`status-badge-pill ${getStatusBadgeClass(order.orderStatus)}`}>
                                        <span className="badge-dot"></span>
                                        {getOrderStatusLabel(order.orderStatus)}
                                    </span>
                                    <span className={`status-badge-pill ${getStatusBadgeClass(order.paymentStatus)}`}>
                                        <span className="badge-dot"></span>
                                        {getPaymentStatusLabel(order.paymentStatus)}
                                    </span>
                                </div>
                            </div>

                            {/* Stepper Steps (Active only if not cancelled) */}
                            {currentStep >= 0 ? (
                                <div className="stepper-bar-container">
                                    <div className="stepper-progress-track">
                                        <div
                                            className="stepper-progress-fill"
                                            style={{
                                                width: `${(Math.max(0, currentStep) / (steps.length - 1)) * 100}%`
                                            }}
                                        ></div>
                                    </div>

                                    <div className="stepper-steps-grid">
                                        {steps.map((step, idx) => {
                                            const isDone = idx < currentStep;
                                            const isCurrent = idx === currentStep;

                                            return (
                                                <div
                                                    key={idx}
                                                    className={`step-node ${isDone ? 'step-completed' : ''} ${isCurrent ? 'step-active' : ''}`}
                                                >
                                                    <div className="step-icon-bubble">
                                                        {isDone ? <CheckCircle2 size={20} /> : step.icon}
                                                    </div>
                                                    <div className="step-label-box">
                                                        <span className="step-title">{step.title}</span>
                                                        <span className="step-desc">{step.desc}</span>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ) : (
                                <div className="cancelled-banner">
                                    <AlertCircle size={24} />
                                    <div>
                                        <h3>Order Cancelled</h3>
                                        <p>This order has been cancelled. If you have questions, please contact customer support.</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Details Grid: Shipping & Summary */}
                        <div className="result-details-grid">
                            {/* Shipping Information */}
                            <div className="info-card">
                                <div className="info-card-header">
                                    <MapPin size={18} className="info-card-icon" />
                                    <h2>Delivery Address</h2>
                                </div>
                                <div className="info-card-body">
                                    <p className="customer-name">{order.customer?.name}</p>
                                    <p className="address-text">{order.customer?.address}</p>
                                    {order.customer?.phone && (
                                        <div className="contact-phone">
                                            <Phone size={14} /> {order.customer.phone}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Logistics & Partner */}
                            <div className="info-card">
                                <div className="info-card-header">
                                    <Truck size={18} className="info-card-icon" />
                                    <h2>Courier & Logistics</h2>
                                </div>
                                <div className="info-card-body">
                                    <div className="info-row">
                                        <span className="row-label">Courier Partner</span>
                                        <span className="row-val">{order.courier || order.shippingPartner || 'Processing'}</span>
                                    </div>
                                    {order.trackingNumber && (
                                        <div className="info-row">
                                            <span className="row-label">Tracking AWB</span>
                                            <span className="row-val awb-tag">{order.trackingNumber}</span>
                                        </div>
                                    )}
                                    <div className="info-row">
                                        <span className="row-label">Est. Delivery</span>
                                        <span className="row-val highlight-gold">
                                            {order.estimatedDelivery ? formatDate(order.estimatedDelivery) : '3-5 Business Days'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Payment Summary */}
                            <div className="info-card">
                                <div className="info-card-header">
                                    <CreditCard size={18} className="info-card-icon" />
                                    <h2>Payment Overview</h2>
                                </div>
                                <div className="info-card-body">
                                    <div className="info-row">
                                        <span className="row-label">Total Amount</span>
                                        <span className="row-val total-amount">{formatPrice(order.totalAmount)}</span>
                                    </div>
                                    <div className="info-row">
                                        <span className="row-label">Payment Mode</span>
                                        <span className="row-val">{order.paymentMethod || 'Razorpay / Prepaid'}</span>
                                    </div>
                                    <div className="info-row">
                                        <span className="row-label">Payment Status</span>
                                        <span className={`badge-pill ${getStatusBadgeClass(order.paymentStatus)}`}>
                                            {getPaymentStatusLabel(order.paymentStatus)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Order Items Breakdown */}
                        {order.items && order.items.length > 0 && (
                            <div className="items-card">
                                <div className="items-card-header">
                                    <ShoppingBag size={18} />
                                    <h2>Ordered Products ({order.items.length})</h2>
                                </div>
                                <div className="items-list">
                                    {order.items.map((item, idx) => (
                                        <div key={idx} className="item-row">
                                            <div className="item-info">
                                                <img
                                                    src={item.image || item.productId?.images?.[0] || 'https://via.placeholder.com/150'}
                                                    alt={item.name}
                                                    className="item-thumb"
                                                />
                                                <div className="item-meta">
                                                    <span className="item-name">{item.name}</span>
                                                    <div className="item-specs">
                                                        {item.size && <span className="spec-chip">Size: {item.size}</span>}
                                                        <span className="spec-chip">Qty: {item.quantity}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <span className="item-price">{formatPrice(item.price * item.quantity)}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Vertical Timeline */}
                        <div className="timeline-card">
                            <div className="timeline-header">
                                <Clock size={18} />
                                <h2>Tracking Activity Timeline</h2>
                            </div>

                            {order.timeline?.length > 0 ? (
                                <div className="activity-timeline">
                                    {order.timeline.map((event, index) => (
                                        <div key={index} className="timeline-node">
                                            <div className="timeline-bullet"></div>
                                            <div className="timeline-content">
                                                <div className="timeline-top">
                                                    <span className="event-status">{event.status}</span>
                                                    <span className="event-time">
                                                        {event.date} {event.time ? `• ${event.time}` : ''}
                                                    </span>
                                                </div>
                                                {event.remarks && <p className="event-remarks">{event.remarks}</p>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="empty-timeline">
                                    <p>Order is being processed. Detailed timeline updates will appear here soon.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </PublicLayout>
    );
};

export default TrackOrderResultPage;
