import { Link } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { formatPrice, calculateDiscountPercent, isLowStock, isOutOfStock } from '../utils/helpers';
import './ProductCard.css';

const ProductCard = ({ product }) => {
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

    return (
        <Link to={`/product/${product._id}`} className="product-card">
            {/* Image */}
            <div className="product-image-wrapper">
                <img
                    src={product.images?.[0]}
                    alt={product.name}
                    className="product-image"
                    loading="lazy"
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

                {/* Add to Cart Button - ALWAYS VISIBLE */}
                {!isOutOfStock(totalStock) && (
                    <button
                        className="product-add-to-cart"
                        onClick={handleAddToCart}
                        aria-label={`Add ${product.name} to cart`}
                    >
                        <ShoppingCart size={18} />
                        <span>Add to Cart</span>
                    </button>
                )}
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
        </Link>
    );
};

export default ProductCard;
