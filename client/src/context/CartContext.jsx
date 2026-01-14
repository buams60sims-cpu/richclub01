import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext(null);

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within CartProvider');
    }
    return context;
};

export const CartProvider = ({ children }) => {
    // Initialize cart state directly from localStorage (lazy initialization)
    const [cartItems, setCartItems] = useState(() => {
        try {
            const savedCart = localStorage.getItem('cart');
            return savedCart ? JSON.parse(savedCart) : [];
        } catch (error) {
            console.error('Failed to parse cart data:', error);
            localStorage.removeItem('cart');
            return [];
        }
    });

    // Save cart to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(cartItems));
    }, [cartItems]);

    const addToCart = (product, size, quantity = 1) => {
        setCartItems((prevItems) => {
            // Check if item with same product and size already exists
            const existingIndex = prevItems.findIndex(
                (item) => item.productId === product._id && item.size === size
            );

            if (existingIndex > -1) {
                // Update quantity of existing item
                const updatedItems = [...prevItems];
                updatedItems[existingIndex].quantity += quantity;
                return updatedItems;
            } else {
                // Add new item
                return [
                    ...prevItems,
                    {
                        productId: product._id,
                        name: product.name,
                        price: product.price.selling,
                        originalPrice: product.price.original,
                        image: product.images[0],
                        size,
                        quantity,
                        category: product.category,
                    },
                ];
            }
        });
    };

    const removeFromCart = (productId, size) => {
        setCartItems((prevItems) =>
            prevItems.filter(
                (item) => !(item.productId === productId && item.size === size)
            )
        );
    };

    const updateQuantity = (productId, size, quantity) => {
        if (quantity <= 0) {
            removeFromCart(productId, size);
            return;
        }

        setCartItems((prevItems) =>
            prevItems.map((item) =>
                item.productId === productId && item.size === size
                    ? { ...item, quantity }
                    : item
            )
        );
    };

    const clearCart = () => {
        setCartItems([]);
        localStorage.removeItem('cart');
    };

    const getCartTotal = () => {
        return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
    };

    const getCartCount = () => {
        return cartItems.reduce((count, item) => count + item.quantity, 0);
    };

    const value = {
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartTotal,
        getCartCount,
    };

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
