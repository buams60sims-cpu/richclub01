import React from 'react';
import { Eye, Smartphone, Calendar, CreditCard, Clock } from 'lucide-react';

const OrdersTableDesktop = ({
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
        <div className="data-table-wrapper hidden lg:block">
            <table className="data-table">
                <thead>
                    <tr>
                        <th>Invoice / Order</th>
                        <th>Customer Details</th>
                        <th>Order Date</th>
                        <th>Total Amount</th>
                        <th>Payment</th>
                        <th>Fulfillment</th>
                        <th className="text-right">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {orders.map(order => {
                        const itemsCount = (order.items || []).reduce((acc, item) => acc + (item.quantity || 1), 0);
                        const paymentClass = getStatusBadgeClass(order.paymentStatus);
                        const orderClass = getStatusBadgeClass(order.orderStatus);

                        return (
                            <tr key={order._id}>
                                <td className="order-id-cell">
                                    <span className="invoice-tag">#{order.invoiceNumber || order._id?.substring(18)}</span>
                                    <span className="items-count-sub">{itemsCount} item{itemsCount !== 1 ? 's' : ''}</span>
                                </td>
                                <td>
                                    <div className="customer-meta-row">
                                        <div
                                            className="avatar-badge"
                                            style={{ backgroundColor: getAvatarColor(order.customer?.name) }}
                                        >
                                            {getInitials(order.customer?.name)}
                                        </div>
                                        <div className="customer-text-meta">
                                            <span className="customer-name">{order.customer?.name || 'Guest User'}</span>
                                            {order.customer?.phone && (
                                                <span className="customer-phone">
                                                    <Smartphone size={12} /> {order.customer?.phone}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <div className="datetime-cell">
                                        <span className="date-main">
                                            <Calendar size={13} /> {formatDate(order.createdAt)}
                                        </span>
                                        <span className="time-sub">
                                            <Clock size={12} /> {formatTime(order.createdAt)}
                                        </span>
                                    </div>
                                </td>
                                <td>
                                    <div className="amount-cell">
                                        <span className="amount-val">{formatPrice(order.totalAmount)}</span>
                                    </div>
                                </td>
                                <td>
                                    <span className={`badge badge-with-dot ${paymentClass}`}>
                                        <span className="badge-dot"></span>
                                        {getPaymentStatusLabel(order.paymentStatus)}
                                    </span>
                                </td>
                                <td>
                                    <span className={`badge badge-with-dot ${orderClass}`}>
                                        <span className="badge-dot"></span>
                                        {getOrderStatusLabel(order.orderStatus)}
                                    </span>
                                </td>
                                <td>
                                    <div className="action-buttons justify-end">
                                        <button
                                            className="btn btn-secondary btn-sm"
                                            onClick={() => handleViewOrder(order)}
                                            title="View order details"
                                        >
                                            <Eye size={15} />
                                            <span>Manage</span>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};

export default OrdersTableDesktop;
