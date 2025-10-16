import React, { createContext, useState, useContext, useEffect } from 'react';
import { api } from '../services/api';
import { CartItem, CartResponse, CartContextType } from '../types';

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);
  const [loading, setLoading] = useState(true);

  // Load cart data from backend
  const refreshCart = async () => {
    try {
      setLoading(true);
      const cartData: CartResponse = await api.cart.get();
      setItems(cartData.items || []);
      setTotalItems(cartData.total_items || 0);
      setTotalPrice(cartData.total_price || 0);
    } catch (error) {
      console.error('Failed to fetch cart from API:', error);
      setItems([]);
      setTotalItems(0);
      setTotalPrice(0);
    } finally {
      setLoading(false);
    }
  };

  // Initialize cart on mount
  useEffect(() => {
    refreshCart();
  }, []);

  // Add item to cart
  const addToCart = async (productId: string, quantity: number = 1) => {
    try {
      await api.cart.add(productId, quantity);
      await refreshCart();
    } catch (error) {
      console.error('Error adding item to cart:', error);
      throw error;
    }
  };

  // Remove item from cart
  const removeItem = async (productId: string) => {
    try {
      await api.cart.remove(productId);
      await refreshCart();
    } catch (error) {
      console.error('Error removing item from cart:', error);
      throw error;
    }
  };

  // Update item quantity
  const updateQuantity = async (productId: string, quantity: number) => {
    if (quantity <= 0) {
      await removeItem(productId);
      return;
    }

    try {
      await api.cart.update(productId, quantity);
      await refreshCart();
    } catch (error) {
      console.error('Error updating item quantity:', error);
      throw error;
    }
  };

  // Clear cart
  const clearCart = async () => {
    try {
      await api.cart.clear();
      setItems([]);
      setTotalItems(0);
      setTotalPrice(0);
    } catch (error) {
      console.error('Error clearing cart:', error);
      throw error;
    }
  };

  // Get total amount
  const getTotalAmount = () => {
    return totalPrice;
  };

  return (
    <CartContext.Provider
      value={{
        items,
        totalItems,
        totalPrice,
        loading,
        addToCart,
        removeItem,
        updateQuantity,
        clearCart,
        refreshCart,
        getTotalAmount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};