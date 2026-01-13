import { useState, useEffect } from 'react';
import { Package, ShoppingBag, Tag, Users, ArrowUpRight, ArrowDownRight, MessageSquare, CheckCircle } from 'lucide-react';
import { getAllProducts, getAllOrders } from '../../services/apiService';
import { formatPrice } from '../../utils/helpers';
import './AdminDashboard.css';

const AdminDashboard = () => {
    const [lowStockProducts, setLowStockProducts] = useState([]);
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
            let pendingOrders = 0;
            let lowStock = [];

            if (productsRes.success) {
                const products = productsRes.data;
                totalProducts = products.length;
                // Identify low stock products (Total stock <= 5)
                lowStock = products.filter(p => p.totalStock <= 5);
            }

            if (ordersRes.success) {
                const orders = ordersRes.data;
                totalOrders = orders.length;

                const paidOrders = orders.filter(
                    o => o.paymentStatus === 'PAID' && o.orderStatus !== 'CANCELLED'
                );
                totalRevenue = paidOrders.reduce((sum, order) => sum + order.totalAmount, 0);
                pendingOrders = orders.filter(o => o.orderStatus === 'CONFIRMED').length;
            }

            setStats({
                totalRevenue,
                totalOrders,
                totalProducts,
                pendingOrders
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
            // Dynamic import to avoid circular dependency issues if any, though regular import is fine
            const { getDailySummaryWhatsAppMessage } = await import('../../services/apiService');
            const response = await getDailySummaryWhatsAppMessage();

            if (response.success) {
                // Copy to clipboard
                await navigator.clipboard.writeText(response.message);
                alert('Daily summary copied to clipboard! Open WhatsApp to paste.');
                // Optional: Open WhatsApp Web
                // window.open('https://web.whatsapp.com/', '_blank');
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

                <div className="stat-card">
                    <div className="stat-icon pending-icon">
                        <Users size={24} />
                    </div>
                    <div className="stat-info">
                        <h3 className="stat-label">Processing Orders</h3>
                        <p className="stat-value">{stats.pendingOrders}</p>
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
                                    <th>Stock Left</th>
                                    <th>Status</th>
                                    <th>Action Required</th>
                                </tr>
                            </thead>
                            <tbody>
                                {lowStockProducts.map(product => (
                                    <tr key={product._id}>
                                        <td>
                                            <div className="flex items-center gap-3">
                                                <img
                                                    src={product.images[0]}
                                                    alt={product.name}
                                                    className="w-10 h-10 object-cover rounded"
                                                />
                                                <span className="font-medium">{product.name}</span>
                                            </div>
                                        </td>
                                        <td className="font-bold text-danger">{product.totalStock}</td>
                                        <td>
                                            <span className={`badge ${product.totalStock === 0 ? 'badge-danger' : 'badge-warning'}`}>
                                                {product.totalStock === 0 ? 'Out of Stock' : 'Low Stock'}
                                            </span>
                                        </td>
                                        <td>
                                            <span className="text-sm text-secondary">Restock Immediately</span>
                                        </td>
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
