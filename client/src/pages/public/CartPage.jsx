import { Link } from 'react-router-dom';
import { Trash2, ShoppingBag } from 'lucide-react';
import PublicLayout from '../../layouts/PublicLayout';
import { useCart } from '../../context/CartContext';
import { formatPrice } from '../../utils/helpers';
import './CartPage.css';

const CartPage = () => {
    const { cartItems, updateQuantity, removeFromCart, getCartTotal } = useCart();

    const handleQuantityChange = (productId, size, newQuantity) => {
        if (newQuantity >= 1) {
            updateQuantity(productId, size, newQuantity);
        }
    };

    const handleRemove = (productId, size) => {
        if (window.confirm('Remove this item from cart?')) {
            removeFromCart(productId, size);
        }
    };

    if (cartItems.length === 0) {
        return (
            <PublicLayout>
                <div className="cart-page">
                    <div className="container py-48">
                        <div className="empty-cart">
                            <div className="empty-cart-icon">
                                <ShoppingBag size={64} />
                            </div>
                            <h2 className="empty-cart-title">Your Cart is Empty</h2>
                            <p className="empty-cart-description">
                                Looks like you haven't added anything to your cart yet.
                            </p>
                            <Link to="/shop" className="btn btn-primary btn-lg">
                                Continue Shopping
                            </Link>
                        </div>
                    </div>
                </div>
            </PublicLayout>
        );
    }

    const subtotal = getCartTotal();

    return (
        <PublicLayout>
            <div className="cart-page">
                <div className="container py-48">
                    <h1 className="cart-title">Shopping Cart</h1>

                    <div className="cart-grid">
                        {/* Cart Items */}
                        <div className="cart-items">
                            {cartItems.map((item) => (
                                <div key={`${item.productId}-${item.size}`} className="cart-item">
                                    {/* Product Image */}
                                    <Link to={`/product/${item.productId}`} className="cart-item-image">
                                        <img src={item.image} alt={item.name} />
                                    </Link>

                                    {/* Product Info */}
                                    <div className="cart-item-info">
                                        <Link to={`/product/${item.productId}`} className="cart-item-name">
                                            {item.name}
                                        </Link>
                                        <div className="cart-item-meta">
                                            <span className="cart-item-size">Size: {item.size}</span>
                                            <span className="cart-item-price">{formatPrice(item.price)}</span>
                                        </div>
                                    </div>

                                    {/* Quantity Controls */}
                                    <div className="cart-item-quantity">
                                        <label className="quantity-label">Quantity</label>
                                        <div className="quantity-input-wrapper">
                                            <button
                                                className="qty-btn"
                                                onClick={() => handleQuantityChange(item.productId, item.size, item.quantity - 1)}
                                                disabled={item.quantity <= 1}
                                            >
                                                −
                                            </button>
                                            <input
                                                type="number"
                                                className="qty-input"
                                                value={item.quantity}
                                                onChange={(e) => {
                                                    const val = parseInt(e.target.value) || 1;
                                                    handleQuantityChange(item.productId, item.size, val);
                                                }}
                                                min="1"
                                            />
                                            <button
                                                className="qty-btn"
                                                onClick={() => handleQuantityChange(item.productId, item.size, item.quantity + 1)}
                                            >
                                                +
                                            </button>
                                        </div>
                                    </div>

                                    {/* Item Total */}
                                    <div className="cart-item-total">
                                        <span className="total-label">Total</span>
                                        <span className="total-price">{formatPrice(item.price * item.quantity)}</span>
                                    </div>

                                    {/* Remove Button */}
                                    <button
                                        className="cart-item-remove"
                                        onClick={() => handleRemove(item.productId, item.size)}
                                        aria-label="Remove item"
                                    >
                                        <Trash2 size={20} />
                                    </button>
                                </div>
                            ))}
                        </div>

                        {/* Cart Summary */}
                        <div className="cart-summary-wrapper">
                            <div className="cart-summary">
                                <h3 className="summary-title">Order Summary</h3>

                                <div className="summary-row">
                                    <span>Subtotal</span>
                                    <span>{formatPrice(subtotal)}</span>
                                </div>

                                <div className="summary-row">
                                    <span>Shipping</span>
                                    <span>Calculated at checkout</span>
                                </div>

                                <div className="summary-divider"></div>

                                <div className="summary-row summary-total">
                                    <span>Total</span>
                                    <span>{formatPrice(subtotal)}</span>
                                </div>

                                <Link to="/checkout" className="btn btn-primary btn-lg checkout-btn">
                                    Proceed to Checkout
                                </Link>

                                <Link to="/shop" className="continue-shopping-link">
                                    Continue Shopping
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </PublicLayout>
    );
};

export default CartPage;
