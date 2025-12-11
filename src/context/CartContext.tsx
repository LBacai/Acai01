import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, Addon } from '../lib/supabase';

export type CartItem = Product & {
  quantity: number;
  selectedAddons: Addon[];
  instanceId: string; // Unique ID for cart item (product + addons combo)
};

type CartContextType = {
  items: CartItem[];
  addToCart: (product: Product, quantity: number, addons: Addon[]) => void;
  removeFromCart: (instanceId: string) => void;
  updateQuantity: (instanceId: string, quantity: number) => void;
  clearCart: () => void;
  total: number;
  count: number;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    const savedCart = localStorage.getItem('toledos-cart');
    if (savedCart) {
      setItems(JSON.parse(savedCart));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('toledos-cart', JSON.stringify(items));
  }, [items]);

  const addToCart = (product: Product, quantity = 1, addons: Addon[] = []) => {
    const newItem: CartItem = {
      ...product,
      quantity,
      selectedAddons: addons,
      instanceId: crypto.randomUUID(), // Create a unique ID for this specific combination
    };
    setItems(prev => [...prev, newItem]);
  };

  const removeFromCart = (instanceId: string) => {
    setItems(prev => prev.filter(item => item.instanceId !== instanceId));
  };

  const updateQuantity = (instanceId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(instanceId);
      return;
    }
    setItems(prev => prev.map(item => 
      item.instanceId === instanceId ? { ...item, quantity } : item
    ));
  };

  const clearCart = () => setItems([]);

  const total = items.reduce((acc, item) => {
    const addonsTotal = item.selectedAddons.reduce((sum, addon) => sum + addon.price, 0);
    return acc + ((item.price + addonsTotal) * item.quantity);
  }, 0);

  const count = items.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, updateQuantity, clearCart, total, count }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};
