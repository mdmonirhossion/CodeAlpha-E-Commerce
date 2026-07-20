import React, { createContext, useState, useEffect, useContext } from 'react';
import { useAuth, API_URL } from './AuthContext';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { token, user } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);

  // Sync / Load cart
  useEffect(() => {
    const loadCart = async () => {
      if (token) {
        setLoading(true);
        try {
          const res = await fetch(`${API_URL}/cart`, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          if (res.ok) {
            const data = await res.json();
            setCartItems(data);
          }
        } catch (err) {
          console.error('Error loading cart:', err);
        } finally {
          setLoading(false);
        }
      } else {
        // Guest user - load from localStorage
        const localCart = localStorage.getItem('guest_cart');
        if (localCart) {
          setCartItems(JSON.parse(localCart));
        } else {
          setCartItems([]);
        }
        setLoading(false);
      }
    };

    loadCart();
  }, [token, user]);

  // Save guest cart to localStorage
  useEffect(() => {
    if (!token) {
      localStorage.setItem('guest_cart', JSON.stringify(cartItems));
    }
  }, [cartItems, token]);

  const addToCart = async (product, quantity = 1) => {
    const existingItem = cartItems.find(item => item.product_id === product._id);
    const newQty = existingItem ? existingItem.quantity + quantity : quantity;

    if (product.stock < newQty) {
      throw new Error(`Cannot add more items. Only ${product.stock} left in stock.`);
    }

    if (token) {
      // Logged in user - API Call
      try {
        const res = await fetch(`${API_URL}/cart`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ product_id: product._id, quantity: newQty })
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.message || 'Failed to update cart on server.');
        }

        // Fetch refreshed cart
        const cartRes = await fetch(`${API_URL}/cart`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const refreshedData = await cartRes.json();
        setCartItems(refreshedData);
      } catch (err) {
        throw err;
      }
    } else {
      // Guest User - local state
      if (existingItem) {
        setCartItems(cartItems.map(item =>
          item.product_id === product._id ? { ...item, quantity: newQty } : item
        ));
      } else {
        setCartItems([...cartItems, {
          id: Date.now(), // dummy temporary id
          product_id: product._id,
          name: product.name,
          price: product.price,
          image_url: product.image_url,
          stock: product.stock,
          quantity: quantity
        }]);
      }
    }
  };

  const updateQuantity = async (productId, quantity) => {
    if (quantity <= 0) {
      return removeFromCart(productId);
    }

    // Find the item to check stock
    const item = cartItems.find(item => item.product_id === productId);
    if (!item) return;

    if (item.stock < quantity) {
      throw new Error(`Only ${item.stock} items left in stock.`);
    }

    if (token) {
      try {
        const res = await fetch(`${API_URL}/cart`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ product_id: productId, quantity })
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.message || 'Failed to update quantity on server.');
        }

        // Fetch refreshed cart
        const cartRes = await fetch(`${API_URL}/cart`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const refreshedData = await cartRes.json();
        setCartItems(refreshedData);
      } catch (err) {
        throw err;
      }
    } else {
      setCartItems(cartItems.map(item =>
        item.product_id === productId ? { ...item, quantity } : item
      ));
    }
  };

  const removeFromCart = async (productId) => {
    if (token) {
      try {
        const res = await fetch(`${API_URL}/cart/${productId}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.message || 'Failed to delete item from cart.');
        }

        setCartItems(cartItems.filter(item => item.product_id !== productId));
      } catch (err) {
        throw err;
      }
    } else {
      setCartItems(cartItems.filter(item => item.product_id !== productId));
    }
  };

  const clearCart = async () => {
    // Standard clear state
    setCartItems([]);
    if (!token) {
      localStorage.removeItem('guest_cart');
    }
  };

  const totalItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const totalPrice = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  return (
    <CartContext.Provider value={{
      cartItems,
      loading,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
      totalItems,
      totalPrice
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
