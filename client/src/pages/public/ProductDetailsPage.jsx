import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronDown, ChevronUp, Minus, Plus } from 'lucide-react';
import PublicLayout from '../../layouts/PublicLayout';
import { getProductById } from '../../services/apiService';
import { useCart } from '../../context/CartContext';
import { formatPrice, calculateDiscountPercent, isOutOfStock } from '../../utils/helpers';
import './ProductDetailsPage.css';

const ProductDetailsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToCart } = useCart();

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState(0);
    const [selectedSize, setSelectedSize] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [descriptionOpen, setDescriptionOpen] = useState(true);

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
        // Show success message (you could use a toast here)
        alert(`Added ${quantity} x ${product.name} (${selectedSize}) to cart`);
    };

    const handleQuantityChange = (delta) => {
        const newQty = quantity + delta;
        const maxStock = product.sizes?.[selectedSize] || 0;

        if (newQty >= 1 && newQty <= maxStock) {
            setQuantity(newQty);
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
                                    src={product.images?.[selectedImage] || 'https://via.placeholder.com/800x1000?text=No+Image'}
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
                                                src={img || 'https://via.placeholder.com/100x120?text=No+Image'}
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
                                <h1 className="product-title">{product.name}</h1>

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

                                {/* Add to Cart Button */}
                                <button
                                    className="btn btn-primary btn-lg add-to-cart-btn"
                                    onClick={handleAddToCart}
                                    disabled={!selectedSize || isOutOfStock(totalStock)}
                                >
                                    {isOutOfStock(totalStock) ? 'Out of Stock' : 'Add to Cart'}
                                </button>

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
