import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
    Plus,
    Edit,
    Trash2,
    Search,
    RefreshCw,
    Package,
    CheckCircle2,
    AlertTriangle,
    XCircle,
    Filter,
    X,
    RotateCcw
} from 'lucide-react';
import { getAllProducts, deleteProduct } from '../../services/apiService';
import { formatPrice, getCategoryName, calculateDiscountPercent } from '../../utils/helpers';
import Modal from '../../components/Modal';
import ProductsCardMobile from './ProductsCardMobile';
import './AdminProducts.css';

const AdminProducts = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('All');
    const [stockFilter, setStockFilter] = useState('All');
    const [statusFilter, setStatusFilter] = useState('All');
    const [refreshKey, setRefreshKey] = useState(0);

    // Delete Modal State
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [selectedProductForDelete, setSelectedProductForDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        loadProducts();
    }, [refreshKey]);

    const loadProducts = async () => {
        try {
            setLoading(true);
            const response = await getAllProducts({}); // Fetch all including inactive
            if (response.success) {
                setProducts(response.data);
            }
        } catch (error) {
            console.error('Failed to load products:', error);
        } finally {
            setLoading(false);
        }
    };

    const confirmDelete = (product) => {
        setSelectedProductForDelete(product);
        setDeleteModalOpen(true);
    };

    const handleDeleteExecute = async () => {
        if (!selectedProductForDelete) return;
        try {
            setIsDeleting(true);
            await deleteProduct(selectedProductForDelete._id);
            setDeleteModalOpen(false);
            setSelectedProductForDelete(null);
            setRefreshKey(prev => prev + 1);
        } catch (error) {
            alert('Failed to delete product: ' + (error.message || 'Server error'));
        } finally {
            setIsDeleting(false);
        }
    };

    // Derived category options
    const categoriesList = useMemo(() => {
        const set = new Set(products.map(p => p.category).filter(Boolean));
        return Array.from(set);
    }, [products]);

    // Derived KPI stats
    const stats = useMemo(() => {
        const total = products.length;
        const active = products.filter(p => p.isActive).length;
        const lowStock = products.filter(p => (p.totalStock || 0) > 0 && (p.totalStock || 0) <= 10).length;
        const outOfStock = products.filter(p => (p.totalStock || 0) === 0).length;
        return { total, active, lowStock, outOfStock };
    }, [products]);

    // Filtering logic
    const filteredProducts = useMemo(() => {
        return products.filter(p => {
            // Search
            const searchLower = searchTerm.toLowerCase();
            const matchesSearch =
                !searchTerm ||
                p.name?.toLowerCase().includes(searchLower) ||
                p.category?.toLowerCase().includes(searchLower) ||
                getCategoryName(p.category)?.toLowerCase().includes(searchLower);

            // Category
            const matchesCategory = categoryFilter === 'All' || p.category === categoryFilter;

            // Status
            const matchesStatus =
                statusFilter === 'All' ||
                (statusFilter === 'Active' && p.isActive) ||
                (statusFilter === 'Inactive' && !p.isActive);

            // Stock
            const stock = p.totalStock || 0;
            let matchesStock = true;
            if (stockFilter === 'In Stock') matchesStock = stock > 10;
            else if (stockFilter === 'Low Stock') matchesStock = stock > 0 && stock <= 10;
            else if (stockFilter === 'Out of Stock') matchesStock = stock === 0;

            return matchesSearch && matchesCategory && matchesStatus && matchesStock;
        });
    }, [products, searchTerm, categoryFilter, statusFilter, stockFilter]);

    const resetFilters = () => {
        setSearchTerm('');
        setCategoryFilter('All');
        setStockFilter('All');
        setStatusFilter('All');
    };

    const hasActiveFilters = searchTerm || categoryFilter !== 'All' || stockFilter !== 'All' || statusFilter !== 'All';

    return (
        <div className="admin-page admin-products-page">
            {/* Header */}
            <div className="admin-header">
                <div>
                    <h1 className="admin-title">Products Management</h1>
                    <p className="admin-subtitle">Catalog inventory & stock status</p>
                </div>
                <div className="header-actions">
                    <button
                        className="btn btn-secondary"
                        onClick={() => setRefreshKey(prev => prev + 1)}
                        title="Reload Catalog"
                    >
                        <RefreshCw size={18} className={loading ? 'spinning' : ''} />
                        <span>Refresh</span>
                    </button>
                    <Link to="/admin/products/new" className="btn btn-primary">
                        <Plus size={18} />
                        <span>Add Product</span>
                    </Link>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="products-kpi-grid">
                <div className="kpi-card">
                    <div className="kpi-icon icon-purple">
                        <Package size={22} />
                    </div>
                    <div className="kpi-content">
                        <span className="kpi-label">Total Products</span>
                        <span className="kpi-value">{stats.total}</span>
                    </div>
                </div>

                <div className="kpi-card">
                    <div className="kpi-icon icon-green">
                        <CheckCircle2 size={22} />
                    </div>
                    <div className="kpi-content">
                        <span className="kpi-label">Active Listing</span>
                        <span className="kpi-value">{stats.active}</span>
                    </div>
                </div>

                <div className="kpi-card">
                    <div className="kpi-icon icon-amber">
                        <AlertTriangle size={22} />
                    </div>
                    <div className="kpi-content">
                        <span className="kpi-label">Low Stock (≤10)</span>
                        <span className="kpi-value">{stats.lowStock}</span>
                    </div>
                </div>

                <div className="kpi-card">
                    <div className="kpi-icon icon-red">
                        <XCircle size={22} />
                    </div>
                    <div className="kpi-content">
                        <span className="kpi-label">Out of Stock</span>
                        <span className="kpi-value">{stats.outOfStock}</span>
                    </div>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="products-controls-card">
                <div className="controls-row-top">
                    <div className="search-bar-modern">
                        <Search size={18} className="search-icon" />
                        <input
                            type="text"
                            placeholder="Search product name or category..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="search-input-modern"
                        />
                        {searchTerm && (
                            <button className="clear-search-btn" onClick={() => setSearchTerm('')}>
                                <X size={16} />
                            </button>
                        )}
                    </div>

                    <div className="filters-group-row">
                        <div className="filter-select-wrapper">
                            <label className="select-label">Category</label>
                            <select
                                value={categoryFilter}
                                onChange={(e) => setCategoryFilter(e.target.value)}
                                className="filter-select"
                            >
                                <option value="All">All Categories</option>
                                {categoriesList.map(cat => (
                                    <option key={cat} value={cat}>
                                        {getCategoryName(cat)}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="filter-select-wrapper">
                            <label className="select-label">Stock Status</label>
                            <select
                                value={stockFilter}
                                onChange={(e) => setStockFilter(e.target.value)}
                                className="filter-select"
                            >
                                <option value="All">All Stock Levels</option>
                                <option value="In Stock">In Stock (&gt;10)</option>
                                <option value="Low Stock">Low Stock (1-10)</option>
                                <option value="Out of Stock">Out of Stock (0)</option>
                            </select>
                        </div>

                        <div className="filter-select-wrapper">
                            <label className="select-label">Listing Status</label>
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="filter-select"
                            >
                                <option value="All">All Statuses</option>
                                <option value="Active">Active Only</option>
                                <option value="Inactive">Inactive Only</option>
                            </select>
                        </div>

                        {hasActiveFilters && (
                            <button className="btn-reset-filters" onClick={resetFilters} title="Reset all filters">
                                <RotateCcw size={14} />
                                <span>Reset</span>
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Mobile Add Product Button */}
            <div className="mobile-add-product-button">
                <Link to="/admin/products/new" className="btn btn-primary-action">
                    <Plus size={20} />
                    <span>Add Product</span>
                </Link>
            </div>

            {/* Catalog List / Loading / Table */}
            {loading ? (
                <div className="loading-state">
                    <div className="loading-spinner"></div>
                    <p>Loading catalog items...</p>
                </div>
            ) : (
                <>
                    {/* Desktop Table View */}
                    <div className="data-table-wrapper hidden lg:block">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Product Details</th>
                                    <th>Category</th>
                                    <th>Pricing</th>
                                    <th>Inventory</th>
                                    <th>Status</th>
                                    <th className="text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredProducts.length > 0 ? (
                                    filteredProducts.map(product => {
                                        const discount = calculateDiscountPercent(
                                            product.price?.original,
                                            product.price?.selling
                                        );
                                        const stock = product.totalStock || 0;
                                        let stockBadge = 'stock-healthy';
                                        let stockLabel = `${stock} in stock`;
                                        if (stock === 0) {
                                            stockBadge = 'stock-out';
                                            stockLabel = 'Out of Stock';
                                        } else if (stock <= 10) {
                                            stockBadge = 'stock-low';
                                            stockLabel = `Low (${stock})`;
                                        }

                                        return (
                                            <tr key={product._id}>
                                                <td>
                                                    <div className="product-table-cell">
                                                        <div className="product-thumb-box">
                                                            <img
                                                                src={product.images?.[0] || 'https://via.placeholder.com/150'}
                                                                alt={product.name}
                                                                className="product-thumb-img"
                                                            />
                                                            {discount > 0 && (
                                                                <span className="thumb-discount-badge">-{discount}%</span>
                                                            )}
                                                        </div>
                                                        <div className="product-cell-meta">
                                                            <span className="product-name-title">{product.name}</span>
                                                            <span className="product-sku-id">ID: #{product._id?.substring(18)}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>
                                                    <span className="category-badge-pill">
                                                        {getCategoryName(product.category)}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div className="price-table-cell">
                                                        <span className="selling-price">{formatPrice(product.price?.selling)}</span>
                                                        {product.price?.original > product.price?.selling && (
                                                            <span className="original-price">{formatPrice(product.price?.original)}</span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td>
                                                    <span className={`stock-pill ${stockBadge}`}>
                                                        {stock <= 10 && stock > 0 && <AlertTriangle size={12} />}
                                                        {stockLabel}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className={`badge ${product.isActive ? 'badge-success' : 'badge-danger'}`}>
                                                        {product.isActive ? 'Active' : 'Inactive'}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div className="action-buttons justify-end">
                                                        <Link
                                                            to={`/admin/products/${product._id}`}
                                                            className="icon-btn"
                                                            title="Edit product details"
                                                        >
                                                            <Edit size={16} />
                                                        </Link>
                                                        <button
                                                            className="icon-btn btn-danger"
                                                            onClick={() => confirmDelete(product)}
                                                            title="Delete product"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="empty-table-state">
                                            <Package size={40} className="empty-icon" />
                                            <h3>No Products Found</h3>
                                            <p>Try adjusting your search keyword or filters to find what you are looking for.</p>
                                            {hasActiveFilters && (
                                                <button className="btn btn-secondary btn-sm mt-16" onClick={resetFilters}>
                                                    Reset Filters
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile Card View */}
                    {filteredProducts.length > 0 ? (
                        <ProductsCardMobile
                            products={filteredProducts}
                            formatPrice={formatPrice}
                            getCategoryName={getCategoryName}
                            calculateDiscountPercent={calculateDiscountPercent}
                            handleDelete={(id) => {
                                const prod = products.find(p => p._id === id);
                                if (prod) confirmDelete(prod);
                            }}
                        />
                    ) : (
                        <div className="empty-table-state block lg:hidden">
                            <Package size={40} className="empty-icon" />
                            <h3>No Products Found</h3>
                            <p>Try adjusting your search keyword or filters.</p>
                            {hasActiveFilters && (
                                <button className="btn btn-secondary btn-sm mt-16" onClick={resetFilters}>
                                    Reset Filters
                                </button>
                            )}
                        </div>
                    )}
                </>
            )}

            {/* Modal Confirmation for Deleting Product */}
            <Modal
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                title="Confirm Product Deletion"
                size="md"
            >
                <div className="delete-modal-content">
                    <div className="delete-modal-icon">
                        <Trash2 size={32} />
                    </div>
                    <h4>Delete "{selectedProductForDelete?.name}"?</h4>
                    <p>
                        Are you sure you want to remove this product from the inventory?
                        This action cannot be undone.
                    </p>
                    <div className="delete-modal-actions">
                        <button
                            className="btn btn-secondary"
                            onClick={() => setDeleteModalOpen(false)}
                            disabled={isDeleting}
                        >
                            Cancel
                        </button>
                        <button
                            className="btn btn-danger-solid"
                            onClick={handleDeleteExecute}
                            disabled={isDeleting}
                        >
                            {isDeleting ? 'Deleting...' : 'Delete Product'}
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default AdminProducts;
