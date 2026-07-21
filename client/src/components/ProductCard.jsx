import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { formatPrice, calculateDiscountPercent, isLowStock, isOutOfStock } from '../utils/helpers';
import './ProductCard.css';

const ProductCard = ({ product }) => {
    const { addToWishlist, removeFromWishlist, isInWishlist } = useCart();
    const saved = isInWishlist(product._id);
    const totalStock = product.totalStock || 0;
    const discountPercent = product.discountPercent || calculateDiscountPercent(
        product.price?.original,
        product.price?.selling
    );

    const imageUrl = product.images?.[0]
        ? product.images[0].startsWith('http')
            ? product.images[0]
            : `${import.meta.env.VITE_API_BASE_URL.replace('/api/v1', '')}${product.images[0].startsWith('/') ? '' : '/'}${product.images[0]}`
        : 'https://via.placeholder.com/400x500?text=No+Image';

    const toggleWishlist = (event) => {
        event.preventDefault();
        event.stopPropagation();
        if (saved) {
            removeFromWishlist(product._id);
        } else {
            addToWishlist(product);
        }
    };

    return (
        <article className={`product-card ${isOutOfStock(totalStock) ? 'out-of-stock' : ''}`}>
            <div className="product-card-media">
                <Link to={`/product/${product._id}`} className="product-card-image-link" aria-label={`View ${product.name}`}>
                    <img
                        src={imageUrl}
                        alt={product.name}
                        className="product-card-image"
                        loading="lazy"
                        onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/400x500?text=No+Image';
                        }}
                    />
                </Link>

                <button
                    type="button"
                    className={`wishlist-button ${saved ? 'saved' : ''}`}
                    aria-label={saved ? 'Remove from wishlist' : 'Add to wishlist'}
                    onClick={toggleWishlist}
                >
                    <Heart size={18} fill={saved ? '#ef4444' : 'none'} color={saved ? '#ef4444' : 'currentColor'} />
                </button>

                {discountPercent > 0 && (
                    <span className="product-card-badge">-{discountPercent}%</span>
                )}
            </div>

            <div className="product-card-body">
                <Link to={`/product/${product._id}`} className="product-card-title-link">
                    {/* Line 1: Full Product Name */}
                    <h3 className="product-card-title">{product.name}</h3>

                    {/* Line 2: Category */}
                    <p className="product-card-category">
                        {product.category ? product.category.replace('-', ' ') : 'New'}
                    </p>

                    {/* Line 3: Price (Left) + Stock Status (Right) */}
                    <div className="product-card-bottom-row">
                        <div className="product-card-prices">
                            <span className="product-card-price">{formatPrice(product.price?.selling)}</span>
                            {product.price?.original > product.price?.selling && (
                                <span className="product-card-price-original">
                                    {formatPrice(product.price.original)}
                                </span>
                            )}
                        </div>

                        <div className="product-card-meta">
                            {isOutOfStock(totalStock) ? (
                                <span className="product-card-stock out">Sold out</span>
                            ) : isLowStock(totalStock) ? (
                                <span className="product-card-stock low">Low stock</span>
                            ) : (
                                <span className="product-card-stock available">In stock</span>
                            )}
                        </div>
                    </div>
                </Link>
            </div>
        </article>
    );
};

export default ProductCard;
