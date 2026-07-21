import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
    Package,
    ShoppingBag,
    Tag,
    MessageSquare,
    CheckCircle,
    TrendingUp,
    AlertTriangle,
    Clock,
    ChevronRight,
    RefreshCw,
    Edit,
    ArrowUpRight,
    Activity,
    CreditCard,
    Calendar,
    Smartphone
} from 'lucide-react';
import { getAllProducts, getAllOrders } from '../../services/apiService';
import { formatPrice, formatDate, getOrderStatusLabel, getPaymentStatusLabel, getStatusBadgeClass } from '../../utils/helpers';
import './AdminDashboard.css';

const AdminDashboard = () => {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalRevenue: 0,
        totalOrders: 0,
        totalProducts: 0,
        avgOrderValue: 0,
        ordersByStatus: {
            PAYMENT_PENDING: 0,
            CONFIRMED: 0,
            SHIPPED: 0,
            DELIVERED: 0,
            CANCELLED: 0
        }
    });
    const [lowStockProducts, setLowStockProducts] = useState([]);
    const [recentOrders, setRecentOrders] = useState([]);
    const [whatsappLoading, setWhatsappLoading] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);

    useEffect(() => {
        loadStats();
    }, [refreshKey]);

    const loadStats = async () => {
        try {
            setLoading(true);
            const [productsRes, ordersRes] = await Promise.all([
                getAllProducts({}),
                getAllOrders({})
            ]);

            let totalProducts = 0;
            let totalOrders = 0;
            let totalRevenue = 0;
            let avgOrderValue = 0;
            let lowStock = [];
            let latestOrders = [];
            let ordersByStatus = {
                PAYMENT_PENDING: 0,
                CONFIRMED: 0,
                SHIPPED: 0,
                DELIVERED: 0,
                CANCELLED: 0
            };

            if (productsRes.success) {
                const products = productsRes.data || [];
                totalProducts = products.length;
                lowStock = products
                    .filter(p => (p.totalStock || 0) <= 5)
                    .map(p => ({
                        ...p,
                        imagesCount: p.images?.length || 0
                    }))
                    .slice(0, 8);
            }

            if (ordersRes.success) {
                const orders = ordersRes.data || [];
                totalOrders = orders.length;

                // Count orders by status
                orders.forEach(order => {
                    if (ordersByStatus.hasOwnProperty(order.orderStatus)) {
                        ordersByStatus[order.orderStatus]++;
                    }
                });

                const paidOrders = orders.filter(
                    o => (o.paymentStatus === 'PAID' || o.paymentStatus === 'Paid') && o.orderStatus !== 'CANCELLED'
                );
                totalRevenue = paidOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
                avgOrderValue = paidOrders.length > 0 ? totalRevenue / paidOrders.length : 0;

                // Latest 5 orders sorted by creation date
                latestOrders = [...orders]
                    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                    .slice(0, 5);
            }

            setStats({
                totalRevenue,
                totalOrders,
                totalProducts,
                avgOrderValue,
                ordersByStatus
            });
            setLowStockProducts(lowStock);
            setRecentOrders(latestOrders);
        } catch (error) {
            console.error('Failed to load dashboard stats:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleWhatsAppSummary = async () => {
        try {
            setWhatsappLoading(true);
            const { getDailySummaryWhatsAppMessage } = await import('../../services/apiService');
            const response = await getDailySummaryWhatsAppMessage();

            if (response.success && response.whatsappUrl) {
                window.open(response.whatsappUrl, '_blank');
            }
        } catch (error) {
            console.error('Failed to get WhatsApp summary:', error);
            alert('Failed to generate WhatsApp summary');
        } finally {
            setWhatsappLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="admin-loading-canvas">
                <div className="loading-spinner"></div>
                <p>Loading dashboard intelligence...</p>
            </div>
        );
    }

    return (
        <div className="admin-dashboard-page">
            {/* Header Section */}
            <div className="dashboard-header-bar">
                <div className="header-text">
                    <div className="title-row">
                        <h1 className="dashboard-title">Dashboard</h1>
                        <span className="live-status-pill">
                            <span className="pulse-dot"></span> Live Store Feed
                        </span>
                    </div>
                    <p className="dashboard-subtitle">Overview of sales, inventory & recent customer activities</p>
                </div>

                <div className="header-actions">
                    <button
                        className="btn btn-secondary"
                        onClick={() => setRefreshKey(k => k + 1)}
                        title="Reload metrics"
                    >
                        <RefreshCw size={16} className={loading ? 'spinning' : ''} />
                        <span>Refresh</span>
                    </button>
                    <button
                        className="btn btn-whatsapp"
                        onClick={handleWhatsAppSummary}
                        disabled={whatsappLoading}
                        aria-label="Send daily WhatsApp summary"
                    >
                        <MessageSquare size={18} />
                        <span>{whatsappLoading ? 'Generating...' : 'Daily WhatsApp Summary'}</span>
                    </button>
                </div>
            </div>

            {/* Executive KPI Stats Grid */}
            <div className="dashboard-kpi-grid">
                <div className="kpi-card revenue-card">
                    <div className="kpi-header">
                        <span className="kpi-title">Total Revenue</span>
                        <div className="kpi-icon icon-gold">
                            <TrendingUp size={20} />
                        </div>
                    </div>
                    <div className="kpi-body">
                        <div className="kpi-value-block">
                            <span className="kpi-number">{formatPrice(stats.totalRevenue)}</span>
                            <span className="kpi-subtext">From paid store orders</span>
                        </div>
                    </div>
                </div>

                <div className="kpi-card orders-card">
                    <div className="kpi-header">
                        <span className="kpi-title">Total Orders</span>
                        <div className="kpi-icon icon-blue">
                            <ShoppingBag size={20} />
                        </div>
                    </div>
                    <div className="kpi-body">
                        <div className="kpi-value-block">
                            <span className="kpi-number">{stats.totalOrders}</span>
                            <span className="kpi-subtext">Lifetime store orders</span>
                        </div>
                        <Link to="/admin/orders" className="kpi-link">
                            View All <ArrowUpRight size={14} />
                        </Link>
                    </div>
                </div>

                <div className="kpi-card products-card">
                    <div className="kpi-header">
                        <span className="kpi-title">Total Products</span>
                        <div className="kpi-icon icon-purple">
                            <Package size={20} />
                        </div>
                    </div>
                    <div className="kpi-body">
                        <div className="kpi-value-block">
                            <span className="kpi-number">{stats.totalProducts}</span>
                            <span className="kpi-subtext">Active catalog items</span>
                        </div>
                        <Link to="/admin/products" className="kpi-link">
                            Manage <ArrowUpRight size={14} />
                        </Link>
                    </div>
                </div>

                <div className="kpi-card aov-card">
                    <div className="kpi-header">
                        <span className="kpi-title">Avg. Order Value</span>
                        <div className="kpi-icon icon-emerald">
                            <Activity size={20} />
                        </div>
                    </div>
                    <div className="kpi-body">
                        <div className="kpi-value-block">
                            <span className="kpi-number">{formatPrice(stats.avgOrderValue)}</span>
                            <span className="kpi-subtext">Per transaction</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Order Status Fulfillment Pipeline */}
            <div className="dashboard-card-section">
                <div className="card-section-header">
                    <h2>Order Fulfillment Pipeline</h2>
                    <Link to="/admin/orders" className="section-link">
                        View Orders <ChevronRight size={16} />
                    </Link>
                </div>

                <div className="fulfillment-grid">
                    <div className="fulfillment-card status-pending">
                        <div className="status-top">
                            <span className="status-name">Payment Pending</span>
                            <Clock size={16} />
                        </div>
                        <span className="status-val">{stats.ordersByStatus.PAYMENT_PENDING}</span>
                        <span className="status-foot">Awaiting payment confirmation</span>
                    </div>

                    <div className="fulfillment-card status-confirmed">
                        <div className="status-top">
                            <span className="status-name">Confirmed</span>
                            <CheckCircle size={16} />
                        </div>
                        <span className="status-val">{stats.ordersByStatus.CONFIRMED}</span>
                        <span className="status-foot">Ready for processing</span>
                    </div>

                    <div className="fulfillment-card status-shipped">
                        <div className="status-top">
                            <span className="status-name">Shipped</span>
                            <TrendingUp size={16} />
                        </div>
                        <span className="status-val">{stats.ordersByStatus.SHIPPED}</span>
                        <span className="status-foot">In transit to customer</span>
                    </div>

                    <div className="fulfillment-card status-delivered">
                        <div className="status-top">
                            <span className="status-name">Delivered</span>
                            <CheckCircle size={16} />
                        </div>
                        <span className="status-val">{stats.ordersByStatus.DELIVERED}</span>
                        <span className="status-foot">Successfully fulfilled</span>
                    </div>

                    <div className="fulfillment-card status-cancelled">
                        <div className="status-top">
                            <span className="status-name">Cancelled</span>
                            <AlertTriangle size={16} />
                        </div>
                        <span className="status-val">{stats.ordersByStatus.CANCELLED}</span>
                        <span className="status-foot">Voided / refunded</span>
                    </div>
                </div>
            </div>

            {/* Two Column Grid: Recent Orders Feed + Inventory Alerts */}
            <div className="dashboard-dual-grid mt-24">
                {/* Recent Orders Quick Feed */}
                <div className="dashboard-card-section flex-1">
                    <div className="card-section-header">
                        <h2>Recent Orders Feed</h2>
                        <Link to="/admin/orders" className="section-link">
                            View All ({stats.totalOrders}) <ChevronRight size={16} />
                        </Link>
                    </div>

                    {recentOrders.length > 0 ? (
                        <div className="recent-orders-list">
                            {recentOrders.map(order => {
                                const itemsCount = (order.items || []).reduce((acc, item) => acc + (item.quantity || 1), 0);
                                const paymentClass = getStatusBadgeClass(order.paymentStatus);
                                const orderClass = getStatusBadgeClass(order.orderStatus);

                                return (
                                    <div key={order._id} className="recent-order-item">
                                        <div className="order-item-left">
                                            <span className="invoice-badge">#{order.invoiceNumber || order._id?.substring(18)}</span>
                                            <div className="customer-text">
                                                <span className="c-name">{order.customer?.name || 'Guest User'}</span>
                                                <span className="c-meta">{formatDate(order.createdAt)} • {itemsCount} items</span>
                                            </div>
                                        </div>
                                        <div className="order-item-right">
                                            <span className="order-amount">{formatPrice(order.totalAmount)}</span>
                                            <span className={`badge badge-with-dot ${orderClass}`}>
                                                <span className="badge-dot"></span>
                                                {getOrderStatusLabel(order.orderStatus)}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="empty-state">
                            <ShoppingBag size={32} className="empty-icon" />
                            <p>No customer orders received yet.</p>
                        </div>
                    )}
                </div>

                {/* Inventory Intelligence Alerts */}
                <div className="dashboard-card-section flex-1">
                    <div className="card-section-header">
                        <h2>Inventory Stock Alerts</h2>
                        <Link to="/admin/products" className="section-link">
                            Catalog <ChevronRight size={16} />
                        </Link>
                    </div>

                    {lowStockProducts.length > 0 ? (
                        <div className="low-stock-list">
                            {lowStockProducts.map(product => {
                                const stock = product.totalStock || 0;
                                const isOut = stock === 0;

                                return (
                                    <div key={product._id} className="low-stock-item">
                                        <div className="product-item-left">
                                            <img
                                                src={product.images?.[0] || 'https://via.placeholder.com/150'}
                                                alt={product.name}
                                                className="product-mini-thumb"
                                            />
                                            <div className="product-mini-meta">
                                                <span className="p-title">{product.name}</span>
                                                <span className={`stock-chip ${isOut ? 'chip-out' : 'chip-low'}`}>
                                                    {isOut ? 'Out of Stock' : `Only ${stock} left`}
                                                </span>
                                            </div>
                                        </div>
                                        <Link to={`/admin/products/${product._id}`} className="btn-edit-shortcut" title="Edit product">
                                            <Edit size={15} />
                                        </Link>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="empty-state healthy-state">
                            <CheckCircle size={36} className="text-emerald" />
                            <h3>Inventory is Healthy</h3>
                            <p>All items have sufficient stock levels in stock.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
