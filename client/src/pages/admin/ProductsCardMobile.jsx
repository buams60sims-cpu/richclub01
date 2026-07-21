import React from 'react';
import { Link } from 'react-router-dom';
import { Edit, Trash2, Tag, Box, AlertTriangle } from 'lucide-react';

const ProductsCardMobile = ({
    products,
    formatPrice,
    getCategoryName,
    calculateDiscountPercent,
    handleDelete
}) => {
    return (
        <div className="mobile-products-list block lg:hidden">
            {products.map(product => {
                const discount = calculateDiscountPercent(product.price?.original, product.price?.selling);
                const stock = product.totalStock || 0;
                
                let stockBadgeClass = 'stock-healthy';
                let stockLabel = `${stock} in stock`;
                if (stock === 0) {
                    stockBadgeClass = 'stock-out';
                    stockLabel = 'Out of Stock';
                } else if (stock <= 10) {
                    stockBadgeClass = 'stock-low';
                    stockLabel = `Low Stock (${stock})`;
                }

                return (
                    <div className="product-card-mobile" key={product._id}>
                        <div className="product-card-header">
                            <div className="product-thumb-container">
                                <img
                                    src={product.images?.[0] || 'https://via.placeholder.com/150'}
                                    alt={product.name}
                                    className="product-card-thumb"
                                />
                                {discount > 0 && (
                                    <span className="product-discount-tag">-{discount}%</span>
                                )}
                            </div>
                            <div className="product-card-details">
                                <div className="product-card-title-row">
                                    <h3 className="product-card-title">{product.name}</h3>
                                    <span className={`badge ${product.isActive ? 'badge-success' : 'badge-danger'}`}>
                                        {product.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                                <div className="product-category-chip">
                                    <Tag size={12} />
                                    <span>{getCategoryName(product.category)}</span>
                                </div>
                            </div>
                        </div>

                        <div className="product-card-body">
                            <div className="product-info-tile">
                                <span className="tile-label">Price</span>
                                <div className="price-stack">
                                    <span className="current-price">{formatPrice(product.price?.selling)}</span>
                                    {product.price?.original > product.price?.selling && (
                                        <span className="original-price">{formatPrice(product.price?.original)}</span>
                                    )}
                                </div>
                            </div>

                            <div className="product-info-tile">
                                <span className="tile-label">Inventory</span>
                                <span className={`stock-pill ${stockBadgeClass}`}>
                                    {stock <= 10 && stock > 0 && <AlertTriangle size={12} />}
                                    {stockLabel}
                                </span>
                            </div>
                        </div>

                        <div className="product-card-actions">
                            <Link
                                to={`/admin/products/${product._id}`}
                                className="btn btn-secondary btn-full"
                            >
                                <Edit size={16} /> Edit Details
                            </Link>
                            <button
                                className="btn btn-danger-outline btn-icon-only"
                                onClick={() => handleDelete(product._id)}
                                title="Delete Product"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default ProductsCardMobile;
