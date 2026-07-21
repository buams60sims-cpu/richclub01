import { useState, useEffect, useMemo } from 'react';
import {
    Eye,
    CheckCircle,
    XCircle,
    Search,
    RefreshCw,
    ShoppingBag,
    TrendingUp,
    CheckIcon,
    Clock4,
    RotateCcw,
    X,
    Phone,
    MapPin,
    PackageCheck,
    CreditCard,
    Calendar,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';
import { getAllOrders, updateOrderStatus, cancelOrder } from '../../services/apiService';
import {
    formatPrice,
    formatDate,
    getOrderStatusLabel,
    getPaymentStatusLabel,
    getStatusBadgeClass
} from '../../utils/helpers';
import Modal from '../../components/Modal';
import OrdersTableDesktop from './OrdersTableDesktop';
import OrdersCardMobile from './OrdersCardMobile';
import './AdminOrders.css';

// Helper function to get avatar initials
const getInitials = (name) => {
    if (!name) return 'UN';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
};

// Helper function to get avatar background color
const getAvatarColor = (name) => {
    const colors = [
        'rgba(219, 234, 254, 0.9)', // soft blue
        'rgba(254, 243, 199, 0.9)', // soft amber
        'rgba(252, 231, 243, 0.9)', // soft pink
        'rgba(236, 253, 245, 0.9)', // soft emerald
        'rgba(243, 232, 255, 0.9)', // soft purple
    ];
    let hash = 0;
    for (let i = 0; i < (name || '').length; i++) {
        hash = (hash << 5) - hash + (name || '').charCodeAt(i);
        hash = hash & hash;
    }
    return colors[Math.abs(hash) % colors.length];
};

// Helper function to format time
const formatTime = (date) => {
    const d = new Date(date);
    return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
};

const AdminOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);
    const [editStatus, setEditStatus] = useState('');
    const [editRemarks, setEditRemarks] = useState('');

    // Filters and search state
    const [searchTerm, setSearchTerm] = useState('');
    const [paymentStatusFilter, setPaymentStatusFilter] = useState('All');
    const [orderStatusFilter, setOrderStatusFilter] = useState('All');
    const [dateRangeFilter, setDateRangeFilter] = useState('');
    const [sortBy, setSortBy] = useState('newest');
    const [activeTab, setActiveTab] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => {
        loadOrders();
    }, [refreshKey]);

    const loadOrders = async () => {
        try {
            setLoading(true);
            const response = await getAllOrders({});
            if (response.success) {
                setOrders(response.data || []);
            }
        } catch (error) {
            console.error('Failed to load orders:', error);
        } finally {
            setLoading(false);
        }
    };

    // Derived filtering & sorting
    const filteredOrders = useMemo(() => {
        let result = [...orders];

        // Search
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            result = result.filter(order =>
                order.invoiceNumber?.toLowerCase().includes(term) ||
                order._id?.toLowerCase().includes(term) ||
                order.customer?.name?.toLowerCase().includes(term) ||
                order.customer?.phone?.includes(term)
            );
        }

        // Payment status
        if (paymentStatusFilter !== 'All') {
            result = result.filter(order => order.paymentStatus === paymentStatusFilter);
        }

        // Order status
        if (orderStatusFilter !== 'All') {
            result = result.filter(order => order.orderStatus === orderStatusFilter);
        }

        // Date filter
        if (dateRangeFilter) {
            const filterDateStr = new Date(dateRangeFilter).toDateString();
            result = result.filter(order => new Date(order.createdAt).toDateString() === filterDateStr);
        }

        // Tab filter
        if (activeTab === 'recent') {
            const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
            result = result.filter(order => new Date(order.createdAt) >= sevenDaysAgo);
        }

        // Sorting
        if (sortBy === 'newest') {
            result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        } else if (sortBy === 'oldest') {
            result.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        } else if (sortBy === 'highest') {
            result.sort((a, b) => (b.totalAmount || 0) - (a.totalAmount || 0));
        } else if (sortBy === 'lowest') {
            result.sort((a, b) => (a.totalAmount || 0) - (b.totalAmount || 0));
        }

        return result;
    }, [orders, searchTerm, paymentStatusFilter, orderStatusFilter, dateRangeFilter, activeTab, sortBy]);

    // KPI Stats calculation
    const stats = useMemo(() => {
        return {
            total: orders.length,
            revenue: orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0),
            paid: orders.filter(o => o.paymentStatus === 'Paid').length,
            pending: orders.filter(o => o.paymentStatus === 'Pending' || o.orderStatus === 'PAYMENT_PENDING').length
        };
    }, [orders]);

    // Pagination
    const indexOfLastOrder = currentPage * itemsPerPage;
    const indexOfFirstOrder = indexOfLastOrder - itemsPerPage;
    const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);
    const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);

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
            alert('Order status updated successfully');
            setIsModalOpen(false);
            setRefreshKey(prev => prev + 1);
        } catch (error) {
            alert(error.message || 'Failed to update order status');
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

    const resetFilters = () => {
        setSearchTerm('');
        setPaymentStatusFilter('All');
        setOrderStatusFilter('All');
        setDateRangeFilter('');
        setActiveTab('all');
        setSortBy('newest');
    };

    const hasActiveFilters = searchTerm || paymentStatusFilter !== 'All' || orderStatusFilter !== 'All' || dateRangeFilter || activeTab !== 'all';

    return (
        <div className="admin-page admin-orders-page">
            {/* Page Header */}
            <div className="admin-header">
                <div>
                    <h1 className="admin-title">Orders Management</h1>
                    <p className="admin-subtitle">Track, update and fulfill customer store orders</p>
                </div>
                <div className="header-actions">
                    <button
                        className="btn btn-secondary"
                        onClick={() => setRefreshKey(prev => prev + 1)}
                        title="Refresh list"
                    >
                        <RefreshCw size={18} className={loading ? 'spinning' : ''} />
                        <span>Refresh</span>
                    </button>
                </div>
            </div>

            {/* Executive Stats Bar */}
            <div className="orders-stats-grid">
                <div className="stat-card">
                    <div className="stat-icon icon-blue">
                        <ShoppingBag size={22} />
                    </div>
                    <div className="stat-info">
                        <span className="stat-label">Total Orders</span>
                        <span className="stat-value">{stats.total}</span>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon icon-gold">
                        <TrendingUp size={22} />
                    </div>
                    <div className="stat-info">
                        <span className="stat-label">Total Revenue</span>
                        <span className="stat-value">{formatPrice(stats.revenue)}</span>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon icon-emerald">
                        <CheckIcon size={22} />
                    </div>
                    <div className="stat-info">
                        <span className="stat-label">Paid Orders</span>
                        <span className="stat-value">{stats.paid}</span>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon icon-amber">
                        <Clock4 size={22} />
                    </div>
                    <div className="stat-info">
                        <span className="stat-label">Pending / Unpaid</span>
                        <span className="stat-value">{stats.pending}</span>
                    </div>
                </div>
            </div>

            {/* Filter & Controls Card */}
            <div className="orders-controls-card">
                <div className="controls-top-bar">
                    <div className="search-input-box">
                        <Search size={18} className="search-icon" />
                        <input
                            type="text"
                            placeholder="Search by Invoice #, customer name or phone..."
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="search-input-field"
                        />
                        {searchTerm && (
                            <button className="clear-btn" onClick={() => setSearchTerm('')}>
                                <X size={16} />
                            </button>
                        )}
                    </div>

                    <div className="filters-grid-row">
                        <div className="filter-wrapper">
                            <label className="filter-label">Payment Status</label>
                            <select
                                value={paymentStatusFilter}
                                onChange={(e) => {
                                    setPaymentStatusFilter(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="filter-select-input"
                            >
                                <option value="All">All Payments</option>
                                <option value="Paid">Paid</option>
                                <option value="Pending">Pending</option>
                                <option value="Failed">Failed</option>
                            </select>
                        </div>

                        <div className="filter-wrapper">
                            <label className="filter-label">Order Fulfillment</label>
                            <select
                                value={orderStatusFilter}
                                onChange={(e) => {
                                    setOrderStatusFilter(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="filter-select-input"
                            >
                                <option value="All">All Statuses</option>
                                <option value="PAYMENT_PENDING">Payment Pending</option>
                                <option value="CONFIRMED">Confirmed</option>
                                <option value="SHIPPED">Shipped</option>
                                <option value="DELIVERED">Delivered</option>
                                <option value="CANCELLED">Cancelled</option>
                            </select>
                        </div>

                        <div className="filter-wrapper">
                            <label className="filter-label">Order Date</label>
                            <input
                                type="date"
                                value={dateRangeFilter}
                                onChange={(e) => {
                                    setDateRangeFilter(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="filter-date-input"
                            />
                        </div>

                        {hasActiveFilters && (
                            <button className="btn-reset" onClick={resetFilters} title="Reset filters">
                                <RotateCcw size={14} />
                                <span>Reset</span>
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Tabs & Sort Bar */}
            <div className="tab-sort-bar">
                <div className="tabs-container">
                    <button
                        className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`}
                        onClick={() => {
                            setActiveTab('all');
                            setCurrentPage(1);
                        }}
                    >
                        All Orders ({orders.length})
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'recent' ? 'active' : ''}`}
                        onClick={() => {
                            setActiveTab('recent');
                            setCurrentPage(1);
                        }}
                    >
                        Recent (7 Days)
                    </button>
                </div>

                <div className="sort-wrapper">
                    <span className="sort-label">Sort by:</span>
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="sort-select"
                    >
                        <option value="newest">Newest First</option>
                        <option value="oldest">Oldest First</option>
                        <option value="highest">Highest Amount</option>
                        <option value="lowest">Lowest Amount</option>
                    </select>
                </div>
            </div>

            {/* Loading / Table / Cards */}
            {loading ? (
                <div className="loading-state">
                    <div className="loading-spinner"></div>
                    <p>Loading customer orders...</p>
                </div>
            ) : filteredOrders.length > 0 ? (
                <>
                    {/* Desktop Table View */}
                    <OrdersTableDesktop
                        orders={currentOrders}
                        formatDate={formatDate}
                        formatTime={formatTime}
                        formatPrice={formatPrice}
                        getInitials={getInitials}
                        getAvatarColor={getAvatarColor}
                        getStatusBadgeClass={getStatusBadgeClass}
                        getPaymentStatusLabel={getPaymentStatusLabel}
                        getOrderStatusLabel={getOrderStatusLabel}
                        handleViewOrder={handleViewOrder}
                    />

                    {/* Mobile Cards View */}
                    <OrdersCardMobile
                        orders={currentOrders}
                        formatDate={formatDate}
                        formatTime={formatTime}
                        formatPrice={formatPrice}
                        getInitials={getInitials}
                        getAvatarColor={getAvatarColor}
                        getStatusBadgeClass={getStatusBadgeClass}
                        getPaymentStatusLabel={getPaymentStatusLabel}
                        getOrderStatusLabel={getOrderStatusLabel}
                        handleViewOrder={handleViewOrder}
                    />

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="pagination-bar">
                            <span className="pagination-text">
                                Showing {indexOfFirstOrder + 1}–{Math.min(indexOfLastOrder, filteredOrders.length)} of {filteredOrders.length} orders
                            </span>
                            <div className="pagination-btns">
                                <button
                                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                    disabled={currentPage === 1}
                                    className="page-btn"
                                >
                                    <ChevronLeft size={16} />
                                </button>
                                {Array.from({ length: totalPages }, (_, i) => i + 1).slice(0, 5).map(page => (
                                    <button
                                        key={page}
                                        onClick={() => setCurrentPage(page)}
                                        className={`page-btn ${currentPage === page ? 'active' : ''}`}
                                    >
                                        {page}
                                    </button>
                                ))}
                                {totalPages > 5 && <span className="pagination-dots">...</span>}
                                <button
                                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                    disabled={currentPage === totalPages}
                                    className="page-btn"
                                >
                                    <ChevronRight size={16} />
                                </button>
                            </div>
                        </div>
                    )}
                </>
            ) : (
                <div className="empty-table-state">
                    <ShoppingBag size={44} className="empty-icon" />
                    <h3>No Orders Found</h3>
                    <p>No customer orders matched your current search filters.</p>
                    {hasActiveFilters && (
                        <button className="btn btn-secondary btn-sm mt-16" onClick={resetFilters}>
                            Clear Filters
                        </button>
                    )}
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
                    <div className="order-details-modal-body">
                        {/* Status Header Pill */}
                        <div className="modal-status-banner">
                            <div className="banner-item">
                                <span className="banner-label">Payment Status:</span>
                                <span className={`badge badge-with-dot ${getStatusBadgeClass(selectedOrder.paymentStatus)}`}>
                                    <span className="badge-dot"></span>
                                    {getPaymentStatusLabel(selectedOrder.paymentStatus)}
                                </span>
                                {selectedOrder.razorpayPaymentId && (
                                    <span className="razorpay-id">({selectedOrder.razorpayPaymentId})</span>
                                )}
                            </div>

                            <div className="banner-item">
                                <span className="banner-label">Order Fulfillment:</span>
                                <span className={`badge badge-with-dot ${getStatusBadgeClass(selectedOrder.orderStatus)}`}>
                                    <span className="badge-dot"></span>
                                    {getOrderStatusLabel(selectedOrder.orderStatus)}
                                </span>
                            </div>
                        </div>

                        <div className="order-details-grid">
                            {/* Customer Info Card */}
                            <div className="details-card">
                                <div className="card-heading">
                                    <PackageCheck size={18} />
                                    <span>Customer & Shipping</span>
                                </div>
                                <div className="customer-details-list">
                                    <div className="detail-row">
                                        <span className="field-name">Customer:</span>
                                        <span className="field-value fw-bold">{selectedOrder.customer?.name}</span>
                                    </div>
                                    <div className="detail-row">
                                        <span className="field-name">Phone:</span>
                                        <a href={`tel:${selectedOrder.customer?.phone}`} className="field-value phone-link">
                                            <Phone size={14} /> {selectedOrder.customer?.phone}
                                        </a>
                                    </div>
                                    <div className="detail-row">
                                        <span className="field-name">PIN Code:</span>
                                        <span className="field-value fw-bold">{selectedOrder.customer?.pinCode || selectedOrder.pinCode || 'N/A'}</span>
                                    </div>
                                    <div className="detail-row flex-col">
                                        <span className="field-name">Delivery Address:</span>
                                        <p className="address-box">{selectedOrder.customer?.address}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Ordered Items & Breakdown */}
                            <div className="details-card">
                                <div className="card-heading">
                                    <ShoppingBag size={18} />
                                    <span>Itemized Breakdown</span>
                                </div>

                                <div className="ordered-items-stack">
                                    {selectedOrder.items?.map((item, idx) => (
                                        <div key={idx} className="order-item-row">
                                            <div className="item-main-info">
                                                <span className="item-title">{item.name}</span>
                                                <div className="item-meta-chips">
                                                    <span className="size-chip">Size: {item.size}</span>
                                                    <span className="qty-chip">Qty: {item.quantity}</span>
                                                </div>
                                            </div>
                                            <span className="item-subtotal">{formatPrice(item.price * item.quantity)}</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="totals-breakdown-card">
                                    <div className="summary-row">
                                        <span>Product Subtotal</span>
                                        <span>{formatPrice(selectedOrder.productCost || selectedOrder.subtotal)}</span>
                                    </div>
                                    {selectedOrder.discount > 0 && (
                                        <div className="summary-row discount-row">
                                            <span>Coupon Discount ({selectedOrder.couponCode})</span>
                                            <span>-{formatPrice(selectedOrder.discount)}</span>
                                        </div>
                                    )}
                                    {selectedOrder.taxAmount > 0 && (
                                        <div className="summary-row">
                                            <span>Estimated Tax</span>
                                            <span>{formatPrice(selectedOrder.taxAmount)}</span>
                                        </div>
                                    )}
                                    {selectedOrder.deliveryCharge > 0 && (
                                        <div className="summary-row">
                                            <span>Delivery Charges</span>
                                            <span>{formatPrice(selectedOrder.deliveryCharge)}</span>
                                        </div>
                                    )}
                                    <div className="summary-row final-grand-total">
                                        <span>Total Paid / Due</span>
                                        <span>{formatPrice(selectedOrder.totalAmount)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Order Management Section */}
                        <div className="admin-management-card">
                            <h3 className="management-title">Update Order Status</h3>

                            <div className="management-form-row">
                                <div className="form-field-group">
                                    <label className="form-field-label">Order Fulfillment Status</label>
                                    <select
                                        className="form-field-select"
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

                                <div className="form-field-group">
                                    <label className="form-field-label">Internal Admin Remarks</label>
                                    <textarea
                                        className="form-field-textarea"
                                        rows="2"
                                        value={editRemarks}
                                        onChange={(e) => setEditRemarks(e.target.value)}
                                        placeholder="Add internal notes about tracking, courier, delivery instructions..."
                                    />
                                </div>
                            </div>

                            <div className="management-actions-footer">
                                <button className="btn btn-primary" onClick={handleSaveChanges}>
                                    <CheckCircle size={18} />
                                    <span>Save Status Updates</span>
                                </button>

                                {selectedOrder.orderStatus !== 'CANCELLED' && (
                                    <button className="btn btn-danger-solid" onClick={handleCancelOrder}>
                                        <XCircle size={18} />
                                        <span>Cancel Order</span>
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
