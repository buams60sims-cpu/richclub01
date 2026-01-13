import { useState, useEffect } from 'react';
import { Eye, Clock, XCircle, CheckCircle } from 'lucide-react';
import { getAllOrders, updateOrderStatus, cancelOrder } from '../../services/apiService';
import { formatPrice, formatDate, getOrderStatusLabel, getPaymentStatusLabel, getStatusBadgeClass } from '../../utils/helpers';
import Modal from '../../components/Modal';
import './AdminOrders.css';

const AdminOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);
    const [editStatus, setEditStatus] = useState('');
    const [editRemarks, setEditRemarks] = useState('');

    useEffect(() => {
        loadOrders();
    }, [refreshKey]);

    const loadOrders = async () => {
        try {
            setLoading(true);
            const response = await getAllOrders({});
            if (response.success) {
                setOrders(response.data);
            }
        } catch (error) {
            console.error('Failed to load orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleViewOrder = (order) => {
        setSelectedOrder(order);
        setEditStatus(order.orderStatus);
        setEditRemarks(order.adminRemarks || '');
        setIsModalOpen(true);
    };

    const handleSaveChanges = async () => {
        if (!selectedOrder) return;

        try {
            await updateOrderStatus(selectedOrder._id, {
                orderStatus: editStatus,
                adminRemarks: editRemarks
            });
            alert('Order updated successfully');
            setIsModalOpen(false);
            setRefreshKey(prev => prev + 1);
        } catch (error) {
            alert(error.message || 'Failed to update order');
        }
    };

    const handleCancelOrder = async () => {
        if (!selectedOrder) return;

        if (window.confirm('Are you sure you want to cancel this order? This action cannot be undone.')) {
            try {
                await cancelOrder(selectedOrder._id);
                alert('Order cancelled successfully');
                setIsModalOpen(false);
                setRefreshKey(prev => prev + 1);
            } catch (error) {
                alert(error.message || 'Failed to cancel order');
            }
        }
    };

    return (
        <div className="admin-page">
            <div className="admin-header">
                <h1 className="admin-title">Orders Management</h1>
            </div>

            {loading ? (
                <div className="loading-spinner"></div>
            ) : (
                <div className="data-table-wrapper">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Order ID</th>
                                <th>Customer</th>
                                <th>Date</th>
                                <th>Total</th>
                                <th>Payment</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.length > 0 ? (
                                orders.map(order => (
                                    <tr key={order._id}>
                                        <td>#{order.invoiceNumber}</td>
                                        <td>
                                            <div>{order.customer?.name}</div>
                                            <div className="text-secondary">{order.customer?.phone}</div>
                                        </td>
                                        <td>{formatDate(order.createdAt)}</td>
                                        <td>{formatPrice(order.totalAmount)}</td>
                                        <td>
                                            <span className={`badge ${getStatusBadgeClass(order.paymentStatus)}`}>
                                                {getPaymentStatusLabel(order.paymentStatus)}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`badge ${getStatusBadgeClass(order.orderStatus)}`}>
                                                {getOrderStatusLabel(order.orderStatus)}
                                            </span>
                                        </td>
                                        <td>
                                            <button
                                                className="icon-btn"
                                                onClick={() => handleViewOrder(order)}
                                                title="View Details"
                                            >
                                                <Eye size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7" className="text-center p-32">
                                        No orders found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Order Details Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={`Order Details #${selectedOrder?.invoiceNumber}`}
                size="lg"
            >
                {selectedOrder && (
                    <div className="order-details-content">
                        {/* Status Bar */}
                        <div className="order-status-bar">
                            <div className="status-group">
                                <span className="status-label">Payment Status:</span>
                                <span className={`badge ${getStatusBadgeClass(selectedOrder.paymentStatus)}`}>
                                    {getPaymentStatusLabel(selectedOrder.paymentStatus)}
                                </span>
                                {selectedOrder.razorpayPaymentId && (
                                    <span className="payment-id">({selectedOrder.razorpayPaymentId})</span>
                                )}
                            </div>
                            <div className="status-group">
                                <span className="status-label">Order Status:</span>
                                <span className={`badge ${getStatusBadgeClass(selectedOrder.orderStatus)}`}>
                                    {getOrderStatusLabel(selectedOrder.orderStatus)}
                                </span>
                            </div>
                        </div>

                        <div className="order-grid-layout">
                            {/* Customer Info */}
                            <div className="order-info-card">
                                <h3>Customer Details</h3>
                                <p><strong>Name:</strong> {selectedOrder.customer?.name}</p>
                                <p><strong>Phone:</strong> {selectedOrder.customer?.phone}</p>
                                <p><strong>Address:</strong></p>
                                <p className="address-text">{selectedOrder.customer?.address}</p>
                            </div>

                            {/* Order Items */}
                            <div className="order-info-card">
                                <h3>Ordered Items</h3>
                                <div className="admin-order-items">
                                    {selectedOrder.items?.map((item, idx) => (
                                        <div key={idx} className="admin-order-item">
                                            <div className="item-details">
                                                <span className="item-name">{item.name}</span>
                                                <span className="item-meta">Size: {item.size} | Qty: {item.quantity}</span>
                                            </div>
                                            <span className="item-price">{formatPrice(item.price * item.quantity)}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="admin-order-totals">
                                    <div className="total-row">
                                        <span>Subtotal</span>
                                        <span>{formatPrice(selectedOrder.subtotal)}</span>
                                    </div>
                                    {selectedOrder.discount > 0 && (
                                        <div className="total-row discount">
                                            <span>Discount ({selectedOrder.couponCode})</span>
                                            <span>-{formatPrice(selectedOrder.discount)}</span>
                                        </div>
                                    )}
                                    <div className="total-row final">
                                        <span>Total Amount</span>
                                        <span>{formatPrice(selectedOrder.totalAmount)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Admin Action Section */}
                        <div className="admin-actions-section" style={{ marginTop: '20px', padding: '20px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
                            <h3 style={{ marginBottom: '15px' }}>Update Order</h3>

                            <div className="form-group" style={{ marginBottom: '15px' }}>
                                <label className="form-label">Order Status</label>
                                <select
                                    className="form-select"
                                    value={editStatus}
                                    onChange={(e) => setEditStatus(e.target.value)}
                                >
                                    <option value="PAYMENT_PENDING">Payment Pending</option>
                                    <option value="CONFIRMED">Confirmed</option>
                                    <option value="SHIPPED">Shipped</option>
                                    <option value="DELIVERED">Delivered</option>
                                    <option value="CANCELLED">Cancelled</option>
                                </select>
                            </div>

                            <div className="form-group" style={{ marginBottom: '15px' }}>
                                <label className="form-label">Admin Remarks (Internal Note)</label>
                                <textarea
                                    className="form-textarea"
                                    rows="3"
                                    value={editRemarks}
                                    onChange={(e) => setEditRemarks(e.target.value)}
                                    placeholder="Add notes about delivery, customer request, etc..."
                                />
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
                                <button className="btn btn-primary" onClick={handleSaveChanges}>
                                    <CheckCircle size={18} style={{ marginRight: '8px' }} />
                                    Save Changes
                                </button>

                                {selectedOrder.orderStatus !== 'CANCELLED' && (
                                    <button
                                        className="btn btn-danger"
                                        onClick={handleCancelOrder}
                                    >
                                        <XCircle size={18} style={{ marginRight: '8px' }} />
                                        Cancel Order
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default AdminOrders;
