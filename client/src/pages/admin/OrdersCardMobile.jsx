import React from 'react';
import { Eye, Smartphone, Calendar, ShoppingBag } from 'lucide-react';

const OrdersCardMobile = ({
    orders,
    formatDate,
    formatTime,
    formatPrice,
    getInitials,
    getAvatarColor,
    getStatusBadgeClass,
    getPaymentStatusLabel,
    getOrderStatusLabel,
    handleViewOrder
}) => {
    return (
        <div className="mobile-orders-list block lg:hidden">
            {orders.map(order => {
                const itemsCount = (order.items || []).reduce((acc, item) => acc + (item.quantity || 1), 0);
                const paymentClass = getStatusBadgeClass(order.paymentStatus);
                const orderClass = getStatusBadgeClass(order.orderStatus);

                return (
                    <div className="order-card-mobile" key={order._id}>
                        <div className="order-card-header">
                            <div className="customer-info-mobile">
                                <div
                                    className="card-avatar"
                                    style={{ backgroundColor: getAvatarColor(order.customer?.name) }}
                                >
                                    {getInitials(order.customer?.name)}
                                </div>
                                <div className="card-customer-meta">
                                    <h3 className="card-customer-name">{order.customer?.name || 'Guest Customer'}</h3>
                                    <span className="card-order-id">#{order.invoiceNumber || order._id?.substring(18)}</span>
                                </div>
                            </div>
                        </div>

                        <div className="order-card-body">
                            <div className="card-meta-grid">
                                {order.customer?.phone && (
                                    <a
                                        href={`tel:${order.customer.phone}`}
                                        className="meta-pill phone-pill"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <Smartphone size={13} /> {order.customer.phone}
                                    </a>
                                )}
                                <div className="meta-pill date-pill">
                                    <Calendar size={13} /> {formatDate(order.createdAt)}
                                </div>
                            </div>

                            <div className="card-price-row">
                                <div className="price-tag-mobile">
                                    <span className="price-label">Total Paid / Due</span>
                                    <span className="price-value-mobile">{formatPrice(order.totalAmount)}</span>
                                </div>
                                <span className="items-chip">
                                    <ShoppingBag size={13} /> {itemsCount} Item{itemsCount !== 1 ? 's' : ''}
                                </span>
                            </div>

                            <div className="card-badges-row">
                                <div className="badge-group">
                                    <span className="badge-title">Payment:</span>
                                    <span className={`badge badge-with-dot ${paymentClass}`}>
                                        <span className="badge-dot"></span>
                                        {getPaymentStatusLabel(order.paymentStatus)}
                                    </span>
                                </div>

                                <div className="badge-group">
                                    <span className="badge-title">Order:</span>
                                    <span className={`badge badge-with-dot ${orderClass}`}>
                                        <span className="badge-dot"></span>
                                        {getOrderStatusLabel(order.orderStatus)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="order-card-actions">
                            <button
                                className="btn btn-primary btn-full"
                                onClick={() => handleViewOrder(order)}
                            >
                                <Eye size={16} /> Manage Order Details
                            </button>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default OrdersCardMobile;
