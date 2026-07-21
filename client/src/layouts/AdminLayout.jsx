import { Link, useLocation, Outlet } from 'react-router-dom';
import {
    LayoutDashboard,
    Package,
    ShoppingBag,
    Tag,
    Image,
    LogOut,
    Menu,
    X,
    Lock
} from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import './AdminLayout.css';

const AdminLayout = () => {
    const { logout } = useAuth();
    const location = useLocation();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const isActive = (path) => {
        return location.pathname === path || location.pathname.startsWith(`${path}/`);
    };

    const navItems = [
        { path: '/admin', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
        { path: '/admin/products', icon: <Package size={20} />, label: 'Products' },
        { path: '/admin/orders', icon: <ShoppingBag size={20} />, label: 'Orders' },
        { path: '/admin/coupons', icon: <Tag size={20} />, label: 'Coupons' },
        { path: '/admin/home-content', icon: <Image size={20} />, label: 'Home Content' },
    ];

    return (
        <div className="admin-layout">
            {/* Mobile Header */}
            <div className="admin-mobile-header">
                <div className="admin-brand">Rich Club Admin</div>
                <button
                    className="admin-menu-toggle"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                    {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Sidebar */}
            <aside className={`admin-sidebar ${mobileMenuOpen ? 'open' : ''}`}>
                <div className="admin-sidebar-header">
                    <h2 className="admin-brand">Rich Club</h2>
                    <span className="admin-badge">Admin</span>
                </div>

                <nav className="admin-nav">
                    {navItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`admin-nav-link ${isActive(item.path) ? 'active' : ''}`}
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            {item.icon}
                            <span>{item.label}</span>
                        </Link>
                    ))}
                </nav>

                <div className="admin-sidebar-footer">
                    <Link
                        to="/admin/change-password"
                        className={`admin-nav-link ${isActive('/admin/change-password') ? 'active' : ''}`}
                        onClick={() => setMobileMenuOpen(false)}
                    >
                        <Lock size={20} />
                        <span>Change Password</span>
                    </Link>
                    <button onClick={logout} className="admin-logout-btn">
                        <LogOut size={20} />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="admin-main">
                <div className="admin-container">
                    <Outlet />
                </div>
            </main>

            {/* Overlay for mobile */}
            {mobileMenuOpen && (
                <div
                    className="admin-overlay"
                    onClick={() => setMobileMenuOpen(false)}
                />
            )}

            {/* Mobile Bottom Navigation */}
            <nav className="admin-mobile-bottom-nav">
                {navItems.map((item) => (
                    <Link
                        key={item.path}
                        to={item.path}
                        className={`admin-mobile-nav-item ${isActive(item.path) ? 'active' : ''}`}
                        title={item.label}
                    >
                        {item.icon}
                        <span className="admin-mobile-nav-label">{item.label}</span>
                    </Link>
                ))}
            </nav>
        </div>
    );
};

export default AdminLayout;
