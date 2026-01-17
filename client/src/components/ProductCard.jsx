import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Zap } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { formatPrice, calculateDiscountPercent, isLowStock, isOutOfStock } from '../utils/helpers';
import './ProductCard.css';

const ProductCard = ({ product }) => {
    const navigate = useNavigate();
    const { addToCart } = useCart();
    const totalStock = product.totalStock || 0;
    const discountPercent = product.discountPercent || calculateDiscountPercent(
        product.price?.original,
        product.price?.selling
    );

    const handleAddToCart = (e) => {
        e.preventDefault();

        // Find first available size
        const availableSizes = ['S', 'M', 'L', 'XL', 'XXL'].filter(
            size => product.sizes?.[size] > 0
        );

        if (availableSizes.length > 0) {
            addToCart(product, availableSizes[0], 1);
            // You could add a toast notification here
        }
    };

    const handleBuyNow = (e) => {
        e.preventDefault();

        // Find first available size
        const availableSizes = ['S', 'M', 'L', 'XL', 'XXL'].filter(
            size => product.sizes?.[size] > 0
        );

        if (availableSizes.length > 0) {
            // Add to cart
            addToCart(product, availableSizes[0], 1);
            // Immediately redirect to checkout
            navigate('/checkout');
        }
    };

    return (
        <Link
            to={`/product/${product._id}`}
            className={`product-card ${isOutOfStock(totalStock) ? 'out-of-stock' : ''}`}
        >
            {/* Image Area - Clean & Premium */}
            <div className="product-image-wrapper">
                <img
                    src={(product.images?.[0])
                        ? (product.images[0].startsWith('http')
                            ? product.images[0]
                            : `${import.meta.env.VITE_API_BASE_URL.replace('/api/v1', '')}${product.images[0].startsWith('/') ? '' : '/'}${product.images[0]}`)
                        : 'https://via.placeholder.com/400x500?text=No+Image'}
                    alt={product.name}
                    className="product-image"
                    loading="lazy"
                    onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/400x500?text=No+Image';
                    }}
                />

                {/* ONLY DISCOUNT ON IMAGE */}
                {discountPercent > 0 && (
                    <span className="product-badge badge-discount">-{discountPercent}%</span>
                )}
            </div>

            {/* Product Info */}
            <div className="product-info">
                <h3 className="product-name">{product.name}</h3>

                <div className="product-pricing-row">
                    <div className="product-pricing">
                        <span className="product-price-selling">
                            {formatPrice(product.price?.selling)}
                        </span>
                        {product.price?.original > product.price?.selling && (
                            <span className="product-price-original">
                                {formatPrice(product.price?.original)}
                            </span>
                        )}
                    </div>

                    {/* LOW STOCK / OUT OF STOCK BADGE HERE */}
                    {isOutOfStock(totalStock) ? (
                        <span className="stock-badge out-of-stock" style={{ background: '#f5f5f5', color: '#999', padding: '3px 8px', fontSize: '11px', borderRadius: '4px' }}>Sold Out</span>
                    ) : isLowStock(totalStock) ? (
                        <span className="stock-badge low-stock">Low Stock</span>
                    ) : null}
                </div>
            </div>

            {/* Action Buttons - Locked to Bottom */}
            {!isOutOfStock(totalStock) && (
                <div className="product-actions">
                    <button
                        className="btn-add-to-cart"
                        onClick={handleAddToCart}
                        aria-label="Add to cart"
                    >
                        <ShoppingCart size={16} /> Add to Cart
                    </button>
                    <button
                        className="btn-buy-now"
                        onClick={handleBuyNow}
                        aria-label="Buy now"
                    >
                        <Zap size={16} /> Buy Now
                    </button>
                </div>
            )}
        </Link>
    );
};

export default ProductCard;

