import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronDown, ChevronUp, Heart, Minus, Plus, Share2 } from 'lucide-react';
import PublicLayout from '../../layouts/PublicLayout';
import { getProductById } from '../../services/apiService';
import { useCart } from '../../context/CartContext';
import { formatPrice, calculateDiscountPercent, isOutOfStock } from '../../utils/helpers';
import './ProductDetailsPage.css';

const ProductDetailsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToCart, addToWishlist, removeFromWishlist, isInWishlist } = useCart();

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState(0);
    const [selectedSize, setSelectedSize] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [descriptionOpen, setDescriptionOpen] = useState(true);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        loadProduct();
    }, [id]);

    const loadProduct = async () => {
        try {
            setLoading(true);
            const response = await getProductById(id);

            if (response.success && response.data) {
                setProduct(response.data);
                // Auto-select first available size
                const availableSizes = ['S', 'M', 'L', 'XL', 'XXL'].filter(
                    size => response.data.sizes?.[size] > 0
                );
                if (availableSizes.length > 0) {
                    setSelectedSize(availableSizes[0]);
                }
            } else {
                navigate('/shop');
            }
        } catch (error) {
            console.error('Failed to load product:', error);
            navigate('/shop');
        } finally {
            setLoading(false);
        }
    };

    const handleAddToCart = () => {
        if (!selectedSize) {
            alert('Please select a size');
            return;
        }

        if (quantity > (product.sizes?.[selectedSize] || 0)) {
            alert('Not enough stock available');
            return;
        }

        addToCart(product, selectedSize, quantity);
        alert(`Added ${quantity} x ${product.name} (${selectedSize}) to cart`);
    };

    const handleBuyNow = () => {
        if (!selectedSize) {
            alert('Please select a size');
            return;
        }

        if (quantity > (product.sizes?.[selectedSize] || 0)) {
            alert('Not enough stock available');
            return;
        }

        addToCart(product, selectedSize, quantity);
        navigate('/checkout');
    };

    const handleQuantityChange = (delta) => {
        const newQty = quantity + delta;
        const maxStock = product.sizes?.[selectedSize] || 0;

        if (newQty >= 1 && newQty <= maxStock) {
            setQuantity(newQty);
        }
    };

    const toggleFavorite = (event) => {
        event.preventDefault();
        event.stopPropagation();
        if (isInWishlist(product._id)) {
            removeFromWishlist(product._id);
        } else {
            addToWishlist(product);
        }
    };

    const handleShare = async () => {
        const productUrl = `${window.location.origin}/product/${product._id}`;
        const shareData = {
            title: product.name,
            text: `Check out ${product.name} for ${formatPrice(product.price?.selling)}`,
            url: productUrl,
        };

        if (navigator.share) {
            try {
                await navigator.share(shareData);
            } catch (err) {
                if (err.name !== 'AbortError') console.error(err);
            }
        } else if (navigator.clipboard) {
            try {
                await navigator.clipboard.writeText(productUrl);
                alert('Product link copied to clipboard');
            } catch (err) {
                console.error(err);
            }
        }
    };

    const handleSizeChange = (size) => {
        setSelectedSize(size);
        // Reset quantity if current quantity exceeds new size stock
        const maxStock = product.sizes?.[size] || 0;
        if (quantity > maxStock) {
            setQuantity(Math.min(1, maxStock));
        }
    };

    if (loading) {
        return (
            <PublicLayout>
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                </div>
            </PublicLayout>
        );
    }

    if (!product) {
        return null;
    }

    const discountPercent = product.discountPercent || calculateDiscountPercent(
        product.price?.original,
        product.price?.selling
    );
    const totalStock = product.totalStock || 0;
    const currentSizeStock = product.sizes?.[selectedSize] || 0;

    return (
        <PublicLayout>
            <div className="product-details-page">
                <div className="container py-48">
                    <div className="product-details-grid">
                        {/* Left: Image Gallery */}
                        <div className="product-gallery">
                            {/* Main Image */}
                            <div className="main-image-wrapper">
                                <img
                                    src={(product.images?.[selectedImage] && product.images[selectedImage].startsWith('http'))
                                        ? product.images[selectedImage]
                                        : 'https://via.placeholder.com/800x1000?text=No+Image'}
                                    alt={product.name}
                                    className="main-image"
                                    onError={(e) => {
                                        e.target.src = 'https://via.placeholder.com/800x1000?text=No+Image';
                                    }}
                                />
                                {discountPercent > 0 && (
                                    <span className="product-badge badge-discount">
                                        -{discountPercent}%
                                    </span>
                                )}
                            </div>

                            {/* Thumbnails */}
                            {product.images?.length > 1 && (
                                <div className="thumbnails">
                                    {product.images.map((img, idx) => (
                                        <button
                                            key={idx}
                                            className={`thumbnail ${idx === selectedImage ? 'active' : ''}`}
                                            onClick={() => setSelectedImage(idx)}
                                        >
                                            <img
                                                src={(img && img.startsWith('http'))
                                                    ? img
                                                    : 'https://via.placeholder.com/100x120?text=No+Image'}
                                                alt={`${product.name} ${idx + 1}`}
                                                onError={(e) => {
                                                    e.target.src = 'https://via.placeholder.com/100x120?text=No+Image';
                                                }}
                                            />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Right: Product Info (Sticky on desktop) */}
                        <div className="product-info-sticky">
                            <div className="product-info">
                                <div className="product-header-row">
                                    <h1 className="product-title">{product.name}</h1>
                                    <div className="product-header-actions">
                                        <button
                                            type="button"
                                            className={`icon-btn fav-btn ${isInWishlist(product._id) ? 'active' : ''}`}
                                            aria-label={isInWishlist(product._id) ? 'Remove from favorites' : 'Add to favorites'}
                                            onClick={toggleFavorite}
                                        >
                                            <Heart size={18} />
                                        </button>
                                        <button
                                            type="button"
                                            className="icon-btn share-btn"
                                            aria-label="Share product"
                                            onClick={handleShare}
                                        >
                                            <Share2 size={18} />
                                        </button>
                                    </div>
                                </div>

                                {/* Pricing */}
                                <div className="product-pricing">
                                    {discountPercent > 0 ? (
                                        <>
                                            <span className="price-selling">
                                                {formatPrice(product.price?.selling)}
                                            </span>
                                            <span className="price-original">
                                                {formatPrice(product.price?.original)}
                                            </span>
                                        </>
                                    ) : (
                                        <span className="price-selling">
                                            {formatPrice(product.price?.selling || product.price?.original)}
                                        </span>
                                    )}
                                </div>

                                {/* Size Selection */}
                                <div className="size-selection">
                                    <label className="selection-label">
                                        Size <span className="required">*</span>
                                    </label>
                                    <div className="size-options">
                                        {['S', 'M', 'L', 'XL', 'XXL'].map((size) => {
                                            const stock = product.sizes?.[size] || 0;
                                            const isAvailable = stock > 0;

                                            return (
                                                <button
                                                    key={size}
                                                    className={`size-option ${selectedSize === size ? 'active' : ''} ${!isAvailable ? 'disabled' : ''}`}
                                                    onClick={() => isAvailable && handleSizeChange(size)}
                                                    disabled={!isAvailable}
                                                >
                                                    {size}
                                                    {!isAvailable && <span className="size-unavailable">✕</span>}
                                                </button>
                                            );
                                        })}
                                    </div>
                                    {selectedSize && (
                                        <p className="stock-info">
                                            {currentSizeStock} {currentSizeStock === 1 ? 'item' : 'items'} available
                                        </p>
                                    )}
                                </div>

                                {/* Quantity Selection */}
                                <div className="quantity-selection">
                                    <label className="selection-label">Quantity</label>
                                    <div className="quantity-controls">
                                        <button
                                            className="qty-btn"
                                            onClick={() => handleQuantityChange(-1)}
                                            disabled={quantity <= 1}
                                        >
                                            <Minus size={16} />
                                        </button>
                                        <span className="qty-display">{quantity}</span>
                                        <button
                                            className="qty-btn"
                                            onClick={() => handleQuantityChange(1)}
                                            disabled={!selectedSize || quantity >= currentSizeStock}
                                        >
                                            <Plus size={16} />
                                        </button>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="action-buttons">
                                    <button
                                        className="btn btn-primary btn-lg add-to-cart-btn"
                                        onClick={handleAddToCart}
                                        disabled={!selectedSize || isOutOfStock(totalStock)}
                                    >
                                        {isOutOfStock(totalStock) ? 'Out of Stock' : 'Add to Cart'}
                                    </button>
                                    <button
                                        className="btn btn-secondary btn-lg buy-now-btn"
                                        onClick={handleBuyNow}
                                        disabled={!selectedSize || isOutOfStock(totalStock)}
                                    >
                                        Buy Now
                                    </button>
                                </div>

                                {/* Description Accordion */}
                                {product.description && (
                                    <div className="product-accordion">
                                        <button
                                            className="accordion-header"
                                            onClick={() => setDescriptionOpen(!descriptionOpen)}
                                        >
                                            <span>Description</span>
                                            {descriptionOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                        </button>
                                        {descriptionOpen && (
                                            <div className="accordion-content">
                                                <p>{product.description}</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </PublicLayout>
    );
};

export default ProductDetailsPage;
