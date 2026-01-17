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
            {/* Image */}
            <div className="product-image-wrapper">
                <img
                    src={(product.images?.[0] && product.images[0].startsWith('http'))
                        ? product.images[0]
                        : 'https://via.placeholder.com/400x500?text=No+Image'}
                    alt={product.name}
                    className="product-image"
                    loading="lazy"
                    onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/400x500?text=No+Image';
                    }}
                />

                {/* Badges */}
                <div className="product-badges">
                    {discountPercent > 0 && (
                        <span className="product-badge badge-discount">
                            -{discountPercent}%
                        </span>
                    )}
                    {isOutOfStock(totalStock) && (
                        <span className="product-badge badge-sold-out">
                            Sold Out
                        </span>
                    )}
                    {isLowStock(totalStock) && !isOutOfStock(totalStock) && (
                        <span className="product-badge badge-low-stock">
                            Low Stock
                        </span>
                    )}
                </div>


            </div>

            {/* Product Info */}
            <div className="product-info">
                <h3 className="product-name">{product.name}</h3>

                <div className="product-pricing">
                    {discountPercent > 0 ? (
                        <>
                            <span className="product-price-selling">
                                {formatPrice(product.price?.selling)}
                            </span>
                            <span className="product-price-original">
                                {formatPrice(product.price?.original)}
                            </span>
                        </>
                    ) : (
                        <span className="product-price-selling">
                            {formatPrice(product.price?.selling || product.price?.original)}
                        </span>
                    )}
                </div>
            </div>

            {/* Dual Action Buttons (Pinned Bottom) */}
            {!isOutOfStock(totalStock) && (
                <div className="product-actions">
                    <button
                        className="product-action-btn btn-add-to-cart"
                        onClick={handleAddToCart}
                        aria-label={`Add ${product.name} to cart`}
                    >
                        <ShoppingCart size={18} />
                        <span>Add to Cart</span>
                    </button>
                    <button
                        className="product-action-btn btn-buy-now"
                        onClick={handleBuyNow}
                        aria-label={`Buy ${product.name} now`}
                    >
                        <Zap size={18} />
                        <span>Buy Now</span>
                    </button>
                </div>
            )}
        </Link>
    );
};

export default ProductCard;

