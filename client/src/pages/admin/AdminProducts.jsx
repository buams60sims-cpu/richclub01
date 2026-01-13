import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit, Trash2, Search, RefreshCw } from 'lucide-react';
import { getAllProducts, deleteProduct } from '../../services/apiService';
import { formatPrice, getCategoryName } from '../../utils/helpers';
import './AdminProducts.css';

const AdminProducts = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [refreshKey, setRefreshKey] = useState(0);

    useEffect(() => {
        loadProducts();
    }, [refreshKey]);

    const loadProducts = async () => {
        try {
            setLoading(true);
            const response = await getAllProducts({}); // Fetch all, including inactive
            if (response.success) {
                setProducts(response.data);
            }
        } catch (error) {
            console.error('Failed to load products:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            try {
                await deleteProduct(id);
                setRefreshKey(prev => prev + 1); // Reload list
            } catch (error) {
                alert('Failed to delete product');
            }
        }
    };

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="admin-page">
            <div className="admin-header">
                <h1 className="admin-title">Products management</h1>
                <Link to="/admin/products/new" className="btn btn-primary">
                    <Plus size={20} />
                    Add Product
                </Link>
            </div>

            <div className="admin-actions">
                <div className="search-wrapper">
                    <input
                        type="text"
                        placeholder="Search products..."
                        className="form-input search-input"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <button className="icon-btn" onClick={() => setRefreshKey(prev => prev + 1)} title="Refresh">
                    <RefreshCw size={20} />
                </button>
            </div>

            {loading ? (
                <div className="loading-spinner"></div>
            ) : (
                <div className="data-table-wrapper">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Product</th>
                                <th>Category</th>
                                <th>Price</th>
                                <th>Stock</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredProducts.length > 0 ? (
                                filteredProducts.map(product => (
                                    <tr key={product._id}>
                                        <td>
                                            <div className="product-cell">
                                                <img
                                                    src={product.images?.[0]}
                                                    alt={product.name}
                                                    className="product-thumb"
                                                />
                                                <span>{product.name}</span>
                                            </div>
                                        </td>
                                        <td>{getCategoryName(product.category)}</td>
                                        <td>
                                            {formatPrice(product.price?.selling)}
                                            {product.price?.original > product.price?.selling && (
                                                <div style={{ textDecoration: 'line-through', color: '#777', fontSize: '0.8em' }}>
                                                    {formatPrice(product.price?.original)}
                                                </div>
                                            )}
                                        </td>
                                        <td>{product.totalStock}</td>
                                        <td>
                                            <span className={`badge ${product.isActive ? 'badge-success' : 'badge-danger'}`}>
                                                {product.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="action-buttons">
                                                <Link to={`/admin/products/${product._id}`} className="icon-btn" title="Edit">
                                                    <Edit size={18} />
                                                </Link>
                                                <button
                                                    className="icon-btn btn-danger"
                                                    onClick={() => handleDelete(product._id)}
                                                    title="Delete"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" style={{ textAlign: 'center', padding: '32px' }}>
                                        No products found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default AdminProducts;
