import { Home, ShoppingBag, ShoppingCart, UserCircle2, Heart, PackageSearch } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import './MobileBottomNav.css';

const MobileBottomNav = () => {
    const { getCartCount, wishlistItems } = useCart();
    const cartCount = getCartCount();
    const wishlistCount = wishlistItems.length;

    const links = [
        { to: '/', label: 'Home', icon: Home },
        { to: '/shop', label: 'Shop', icon: ShoppingBag },
        { to: '/cart', label: 'Cart', icon: ShoppingCart, badge: cartCount },
        { to: '/wishlist', label: 'Wishlist', icon: Heart, badge: wishlistCount },
        { to: '/track-order', label: 'Track', icon: PackageSearch },
    ];

    return (
        <nav className="mobile-bottom-nav" aria-label="Mobile bottom navigation">
            {links.map(({ to, label, icon: Icon, badge }) => (
                <NavLink
                    key={to}
                    to={to}
                    className={({ isActive }) => `mobile-nav-link${isActive ? ' active' : ''}`}
                    end={to === '/'}
                >
                    <span className="mobile-nav-icon-wrap">
                        <Icon size={18} />
                        {badge > 0 && <span className="mobile-nav-badge">{badge}</span>}
                    </span>
                    <span className="mobile-nav-label">{label}</span>
                </NavLink>
            ))}
        </nav>
    );
};

export default MobileBottomNav;
