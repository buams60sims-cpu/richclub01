import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, HeartOff, Share2 } from 'lucide-react';
import PublicLayout from '../../layouts/PublicLayout';
import { useCart } from '../../context/CartContext';
import { formatPrice } from '../../utils/helpers';
import './WishlistPage.css';

const WishlistPage = () => {
    const { wishlistItems, addToWishlist, removeFromWishlist, isInWishlist } = useCart();
    const [toastVisible, setToastVisible] = useState(false);

    const itemCount = wishlistItems.length;
    const copiedLabel = itemCount === 1 ? 'item saved' : 'items saved';

    const handleShare = async () => {
        const url = window.location.href;
        try {
            if (navigator.share) {
                await navigator.share({
                    title: 'Saved Pieces',
                    text: 'My saved items from Rich Club',
                    url,
                });
            } else if (navigator.clipboard) {
                await navigator.clipboard.writeText(url);
            } else {
                const tempInput = document.createElement('textarea');
                tempInput.value = url;
                tempInput.setAttribute('readonly', '');
                tempInput.style.position = 'absolute';
                tempInput.style.left = '-9999px';
                document.body.appendChild(tempInput);
                tempInput.select();
                document.execCommand('copy');
                document.body.removeChild(tempInput);
            }
            setToastVisible(true);
            window.setTimeout(() => setToastVisible(false), 1800);
        } catch (error) {
            console.error('Share failed:', error);
        }
    };

    const toggleWishlist = (event, item) => {
        event.preventDefault();
        event.stopPropagation();
        if (isInWishlist(item.productId)) {
            removeFromWishlist(item.productId);
        } else {
            addToWishlist(item);
        }
    };

    if (itemCount === 0) {
        return (
            <PublicLayout>
                <main className="wishlist-page">
                    <div className="container wishlist-container">
                        <div className="wishlist-empty-state">
                            <div className="empty-wishlist-icon" aria-hidden="true">
                                <HeartOff size={60} />
                            </div>
                            <div className="empty-wishlist-text">
                                <p className="wishlist-label">Your list</p>
                                <h1 className="wishlist-empty-title">Nothing saved yet</h1>
                                <p className="wishlist-empty-copy">
                                    Create your own curated edit of favorite pieces, then return when you’re ready to explore them again.
                                </p>
                                <Link to="/shop" className="btn btn-primary btn-lg wishlist-empty-cta">
                                    Browse the collection
                                </Link>
                            </div>
                        </div>
                    </div>
                </main>
            </PublicLayout>
        );
    }

    return (
        <PublicLayout>
            <main className="wishlist-page">
                <div className="container wishlist-container">
                    <section className="wishlist-hero">
                        <div>
                            <p className="wishlist-label">Your list</p>
                            <h1 className="wishlist-title">Saved Pieces</h1>
                            <p className="wishlist-subtitle">{itemCount} {copiedLabel} curated for later.</p>
                        </div>
                        <button
                            type="button"
                            className="wishlist-share-btn"
                            onClick={handleShare}
                            aria-label="Share saved items"
                        >
                            <Share2 size={16} />
                            <span>Share list</span>
                        </button>
                    </section>

                    <section className="wishlist-grid">
                        {wishlistItems.map((item) => {
                            const saved = isInWishlist(item.productId);
                            return (
                                <article key={item.productId} className="wishlist-card">
                                    <Link to={`/product/${item.productId}`} className="wishlist-card-image-link" aria-label={`View ${item.name}`}>
                                        <div className="wishlist-card-image">
                                            <img src={item.image} alt={item.name} />
                                        </div>
                                    </Link>
                                    <button
                                        type="button"
                                        className={`wishlist-card-heart ${saved ? 'saved' : ''}`}
                                        onClick={(event) => toggleWishlist(event, item)}
                                        aria-label={saved ? 'Remove from wishlist' : 'Save to wishlist'}
                                    >
                                        <Heart size={18} />
                                    </button>
                                    <div className="wishlist-card-copy">
                                        <span className="wishlist-card-meta">{item.category || 'Featured piece'}</span>
                                        <Link to={`/product/${item.productId}`} className="wishlist-card-title">
                                            {item.name}
                                        </Link>
                                        <div className="wishlist-card-pricing">
                                            <span className="wishlist-card-price">{formatPrice(item.price)}</span>
                                            {item.originalPrice > item.price && (
                                                <span className="wishlist-card-original">{formatPrice(item.originalPrice)}</span>
                                            )}
                                        </div>
                                    </div>
                                </article>
                            );
                        })}
                    </section>

                    {toastVisible && (
                        <div className="wishlist-toast" role="status" aria-live="polite">
                            List link copied to clipboard
                        </div>
                    )}
                </div>
            </main>
        </PublicLayout>
    );
};

export default WishlistPage;
