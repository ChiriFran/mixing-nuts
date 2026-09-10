import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const CartContext = createContext();

const CART_STORAGE_KEY = 'mixing-nuts-cart';

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [toast, setToast] = useState(null);

  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type, id: Date.now() });
  }, []);

  const addToCart = useCallback((product, quantity = 1) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        const newQty = Math.min(existing.cantidad + quantity, product.stock);
        return prev.map((item) =>
          item.id === product.id ? { ...item, cantidad: newQty } : item
        );
      }
      return [...prev, { ...product, cantidad: Math.min(quantity, product.stock) }];
    });
    showToast(`${product.nombre} agregado al carrito`);
  }, [showToast]);

  const removeFromCart = useCallback((productId) => {
    setItems((prev) => prev.filter((item) => item.id !== productId));
  }, []);

  const increaseQuantity = useCallback((productId) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === productId
          ? { ...item, cantidad: Math.min(item.cantidad + 1, item.stock) }
          : item
      )
    );
  }, []);

  const decreaseQuantity = useCallback((productId) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === productId
          ? { ...item, cantidad: Math.max(item.cantidad - 1, 1) }
          : item
      )
    );
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const getCartTotal = useCallback(() => {
    return items.reduce((total, item) => total + item.precio * item.cantidad, 0);
  }, [items]);

  const getCartCount = useCallback(() => {
    return items.reduce((count, item) => count + item.cantidad, 0);
  }, [items]);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        increaseQuantity,
        decreaseQuantity,
        clearCart,
        getCartTotal,
        getCartCount,
        toast,
      }}
    >
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
