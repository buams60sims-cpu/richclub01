import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import ProtectedRoute from './components/ProtectedRoute';
import ScrollToTop from './components/ScrollToTop';

// Application main route configuration - v2.0-tagline-final

// Public Pages
import HomePage from './pages/public/HomePage';
import ShopPage from './pages/public/ShopPage';
import ProductDetailsPage from './pages/public/ProductDetailsPage';
import CartPage from './pages/public/CartPage';
import CheckoutPage from './pages/public/CheckoutPage';
import ThankYouPage from './pages/public/ThankYouPage';
import OrderConfirmationPage from './pages/public/OrderConfirmationPage';

// Auth Pages
import LoginPage from './pages/auth/LoginPage';

// Admin Pages
import AdminLayout from './layouts/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProducts from './pages/admin/AdminProducts';
import AdminProductForm from './pages/admin/AdminProductForm';
import AdminOrders from './pages/admin/AdminOrders';
import AdminCoupons from './pages/admin/AdminCoupons';
import AdminHomeContent from './pages/admin/AdminHomeContent';

function App() {
    return (
        <AuthProvider>
            <CartProvider>
                <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                    <ScrollToTop />
                    <Routes>
                        {/* Public Routes */}
                        <Route path="/" element={<HomePage />} />
                        <Route path="/shop" element={<ShopPage />} />
                        <Route path="/product/:id" element={<ProductDetailsPage />} />
                        <Route path="/cart" element={<CartPage />} />
                        <Route path="/checkout" element={<CheckoutPage />} />
                        <Route path="/thank-you" element={<ThankYouPage />} />
                        <Route path="/order/:id" element={<OrderConfirmationPage />} />

                        {/* Auth Routes */}
                        <Route path="/login" element={<LoginPage />} />

                        {/* Admin Routes - Protected */}
                        <Route
                            path="/admin"
                            element={
                                <ProtectedRoute>
                                    <AdminLayout />
                                </ProtectedRoute>
                            }
                        >
                            <Route index element={<AdminDashboard />} />
                            <Route path="products" element={<AdminProducts />} />
                            <Route path="products/new" element={<AdminProductForm />} />
                            <Route path="products/:id" element={<AdminProductForm />} />
                            <Route path="orders" element={<AdminOrders />} />
                            <Route path="coupons" element={<AdminCoupons />} />
                            <Route path="home-content" element={<AdminHomeContent />} />
                        </Route>

                        {/* Fallback */}
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </Router>
            </CartProvider>
        </AuthProvider>
    );
}

export default App;

