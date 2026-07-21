import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Heart, LogOut, LayoutDashboard } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import './Header.css';

const Header = () => {
    const { getCartCount } = useCart();
    const { user, isAdmin, logout } = useAuth();
    const navigate = useNavigate();
    const cartCount = getCartCount();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <header className="header">
            <div className="container">
                <div className="header-content">
                    {/* Logo */}
                    <Link to="/" className="header-logo">
                        <div className="logo-wrapper" data-header-id="v1-tagline">
                            <h1 className="logo-text">Rich Club</h1>
                            <span className="logo-tagline">MADE IN KARNATAKA</span>
                        </div>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="header-nav">
                        <Link to="/" className="nav-link">Home</Link>
                        <Link to="/shop" className="nav-link">Shop</Link>
                        <Link to="/track-order" className="nav-link">Track Order</Link>
                    </nav>

                    {/* Actions */}
                    <div className="header-actions">
                        {/* Cart */}
                        <Link to="/cart" className="header-action-btn" aria-label="Shopping Cart">
                            <ShoppingCart size={20} />
                            {cartCount > 0 && (
                                <span className="cart-badge">{cartCount}</span>
                            )}
                        </Link>

                        {/* Wishlist */}
                        <Link to="/wishlist" className="header-action-btn" aria-label="Wishlist">
                            <Heart size={20} />
                        </Link>

                        {/* User Menu */}
                        {user ? (
                            <div className="user-menu">
                                {isAdmin() && (
                                    <Link to="/admin" className="header-action-btn" aria-label="Admin Dashboard">
                                        <LayoutDashboard size={20} />
                                    </Link>
                                )}
                                <button
                                    onClick={handleLogout}
                                    className="header-action-btn"
                                    aria-label="Logout"
                                >
                                    <LogOut size={20} />
                                </button>
                            </div>
                        ) : null}

                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;

