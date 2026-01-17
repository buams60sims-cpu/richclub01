import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, LogOut, LayoutDashboard, Menu, X } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import './Header.css';

const Header = () => {
    const { getCartCount } = useCart();
    const { user, isAdmin, logout } = useAuth();
    const navigate = useNavigate();
    const cartCount = getCartCount();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/');
        setMobileMenuOpen(false);
    };

    const closeMobileMenu = () => {
        setMobileMenuOpen(false);
    };

    // Prevent body scroll when mobile menu is open
    useEffect(() => {
        if (mobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [mobileMenuOpen]);

    return (
        <header className="header">
            <div className="container">
                <div className="header-content">
                    {/* Logo */}
                    <Link to="/" className="header-logo" onClick={closeMobileMenu}>
                        <div className="logo-wrapper" data-header-id="v1-tagline">
                            <h1 className="logo-text">Rich Club</h1>
                            <span className="logo-tagline">MADE IN KARNATAKA</span>
                        </div>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="header-nav">
                        <Link to="/" className="nav-link">Home</Link>
                        <Link to="/shop" className="nav-link">Shop</Link>
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
                        ) : (
                            <Link to="/login" className="header-action-btn" aria-label="Login">
                                <User size={20} />
                            </Link>
                        )}

                        {/* Mobile Menu Toggle */}
                        <button
                            className="mobile-menu-toggle"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            aria-label="Toggle mobile menu"
                            aria-expanded={mobileMenuOpen}
                        >
                            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            {mobileMenuOpen && (
                <div
                    className="mobile-menu-overlay"
                    onClick={closeMobileMenu}
                    aria-hidden="true"
                />
            )}

            {/* Mobile Menu */}
            <nav className={`mobile-menu ${mobileMenuOpen ? 'mobile-menu-open' : ''}`}>
                <div className="mobile-menu-content">
                    <Link to="/" className="mobile-menu-link" onClick={closeMobileMenu}>
                        Home
                    </Link>
                    <Link to="/shop" className="mobile-menu-link" onClick={closeMobileMenu}>
                        Shop
                    </Link>
                    <Link to="/cart" className="mobile-menu-link" onClick={closeMobileMenu}>
                        Cart
                        {cartCount > 0 && (
                            <span className="mobile-menu-badge">{cartCount}</span>
                        )}
                    </Link>
                    {user ? (
                        <>
                            {isAdmin() && (
                                <Link to="/admin" className="mobile-menu-link" onClick={closeMobileMenu}>
                                    Admin Dashboard
                                </Link>
                            )}
                            <button
                                onClick={handleLogout}
                                className="mobile-menu-link mobile-menu-button"
                            >
                                Logout
                            </button>
                        </>
                    ) : (
                        <Link to="/login" className="mobile-menu-link" onClick={closeMobileMenu}>
                            Admin Login
                        </Link>
                    )}
                </div>
            </nav>
        </header>
    );
};

export default Header;

