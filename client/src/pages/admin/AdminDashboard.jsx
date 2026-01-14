import { useState, useEffect } from 'react';
import { Package, ShoppingBag, Tag, Users, ArrowUpRight, ArrowDownRight, MessageSquare, CheckCircle } from 'lucide-react';
import { getAllProducts, getAllOrders } from '../../services/apiService';
import { formatPrice } from '../../utils/helpers';
import './AdminDashboard.css';

const AdminDashboard = () => {
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState({
        totalRevenue: 0,
        totalOrders: 0,
        totalProducts: 0,
        ordersByStatus: {
            PAYMENT_PENDING: 0,
            CONFIRMED: 0,
            SHIPPED: 0,
            DELIVERED: 0,
            CANCELLED: 0
        }
    });
    const [lowStockProducts, setLowStockProducts] = useState([]);
    const [topProducts, setTopProducts] = useState([]);
    const [whatsappLoading, setWhatsappLoading] = useState(false);

    useEffect(() => {
        loadStats();
    }, []);

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
            let lowStock = [];
            let ordersByStatus = {
                PAYMENT_PENDING: 0,
                CONFIRMED: 0,
                SHIPPED: 0,
                DELIVERED: 0,
                CANCELLED: 0
            };

            if (productsRes.success) {
                const products = productsRes.data;
                totalProducts = products.length;
                lowStock = products
                    .filter(p => p.totalStock <= 5)
                    .map(p => ({
                        ...p,
                        imagesCount: p.images?.length || 0
                    }))
                    .slice(0, 10);
            }

            if (ordersRes.success) {
                const orders = ordersRes.data;
                totalOrders = orders.length;

                // Count by status
                orders.forEach(order => {
                    if (ordersByStatus.hasOwnProperty(order.orderStatus)) {
                        ordersByStatus[order.orderStatus]++;
                    }
                });

                const paidOrders = orders.filter(
                    o => o.paymentStatus === 'PAID' && o.orderStatus !== 'CANCELLED'
                );
                totalRevenue = paidOrders.reduce((sum, order) => sum + order.totalAmount, 0);
            }

            setStats({
                totalRevenue,
                totalOrders,
                totalProducts,
                ordersByStatus
            });
            setLowStockProducts(lowStock);
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
                // Open WhatsApp with pre-filled message
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
            <div className="admin-loading">
                <div className="loading-spinner"></div>
            </div>
        );
    }

    return (
        <div className="admin-dashboard">
            <div className="admin-header">
                <h1 className="admin-title">Dashboard</h1>
                <button
                    className="btn btn-success"
                    onClick={handleWhatsAppSummary}
                    disabled={whatsappLoading}
                >
                    <MessageSquare size={18} />
                    {whatsappLoading ? 'Generating...' : 'Daily WhatsApp Summary'}
                </button>
            </div>

            {/* Stats Grid */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon revenue-icon">
                        <Tag size={24} />
                    </div>
                    <div className="stat-info">
                        <h3 className="stat-label">Total Revenue</h3>
                        <p className="stat-value">{formatPrice(stats.totalRevenue)}</p>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon orders-icon">
                        <ShoppingBag size={24} />
                    </div>
                    <div className="stat-info">
                        <h3 className="stat-label">Total Orders</h3>
                        <p className="stat-value">{stats.totalOrders}</p>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon products-icon">
                        <Package size={24} />
                    </div>
                    <div className="stat-info">
                        <h3 className="stat-label">Total Products</h3>
                        <p className="stat-value">{stats.totalProducts}</p>
                    </div>
                </div>
            </div>

            {/* Order Status Breakdown */}
            <div className="dashboard-section mt-8">
                <h2 className="section-title mb-4">Order Status Breakdown</h2>
                <div className="order-status-grid">
                    <div className="status-card pending">
                        <div className="status-count">{stats.ordersByStatus.PAYMENT_PENDING}</div>
                        <div className="status-label">Pending Payment</div>
                    </div>
                    <div className="status-card confirmed">
                        <div className="status-count">{stats.ordersByStatus.CONFIRMED}</div>
                        <div className="status-label">Confirmed</div>
                    </div>
                    <div className="status-card shipped">
                        <div className="status-count">{stats.ordersByStatus.SHIPPED}</div>
                        <div className="status-label">Shipped</div>
                    </div>
                    <div className="status-card delivered">
                        <div className="status-count">{stats.ordersByStatus.DELIVERED}</div>
                        <div className="status-label">Delivered</div>
                    </div>
                    <div className="status-card cancelled">
                        <div className="status-count">{stats.ordersByStatus.CANCELLED}</div>
                        <div className="status-label">Cancelled</div>
                    </div>
                </div>
            </div>

            {/* Inventory Intelligence */}
            <div className="dashboard-section mt-8">
                <h2 className="section-title mb-4">Inventory Intelligence</h2>
                {lowStockProducts.length > 0 ? (
                    <div className="table-container">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Product</th>
                                    <th>Images</th>
                                    <th>Stock Left</th>
                                    <th>Status</th>
                                    <th>Action Required</th>
                                </tr>
                            </thead>
                            <tbody>
                                {lowStockProducts.map(product => (
                                    <tr key={product._id}>
                                        <td>
                                            <div className="product-cell">
                                                <img
                                                    src={product.images[0]}
                                                    alt={product.name}
                                                />
                                                <span>{product.name}</span>
                                            </div>
                                        </td>
                                        <td>{product.imagesCount}</td>
                                        <td className="stock-low">{product.totalStock}</td>
                                        <td>
                                            <span className={`status-badge ${product.totalStock === 0 ? 'out' : 'low'}`}>
                                                {product.totalStock === 0 ? 'Out of Stock' : 'Low Stock'}
                                            </span>
                                        </td>
                                        <td className="action-text">Restock immediately</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="text-center p-8 bg-white rounded-lg border border-border">
                        <CheckCircle className="mx-auto text-success mb-2" size={32} />
                        <p className="text-secondary">Inventory is healthy! No low stock items.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;
