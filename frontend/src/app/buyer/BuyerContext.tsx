'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';

interface BuyerContextType {
  cart: any | null;
  cartCount: number;
  cartLoading: boolean;
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addToCart: (productId: string, qty: number) => Promise<void>;
  updateCartItem: (itemId: string, qty: number) => Promise<void>;
  removeCartItem: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  checkout: (poNumber: string, terms: string) => Promise<any>;
  selectedInvoice: any | null;
  isInvoiceOpen: boolean;
  invoiceLoading: boolean;
  openInvoice: (orderId: string) => Promise<void>;
  closeInvoice: () => void;
  toastMessage: { type: 'success' | 'error'; text: string } | null;
  showToast: (text: string, type?: 'success' | 'error') => void;
}

const BuyerContext = createContext<BuyerContextType | undefined>(undefined);

export function BuyerProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [cart, setCart] = useState<any | null>(null);
  const [cartLoading, setCartLoading] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Invoice modal
  const [selectedInvoice, setSelectedInvoice] = useState<any | null>(null);
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);
  const [invoiceLoading, setInvoiceLoading] = useState(false);

  // Toast
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadCart = async () => {
    if (!user || user.role !== 'BUYER') return;
    try {
      setCartLoading(true);
      const c = await api.getCart();
      setCart(c);
    } catch (err) {
      console.warn('Could not load cart:', err);
    } finally {
      setCartLoading(false);
    }
  };

  useEffect(() => {
    loadCart();
  }, [user]);

  const addToCart = async (productId: string, qty: number) => {
    try {
      const updated = await api.addToCart(productId, qty);
      setCart(updated);
      showToast(`Added ${qty} item(s) to requisition cart.`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to add item to cart', 'error');
      throw err;
    }
  };

  const updateCartItem = async (itemId: string, qty: number) => {
    try {
      const updated = await api.updateCartItem(itemId, qty);
      setCart(updated);
    } catch (err: any) {
      showToast(err.message || 'Failed to update item quantity', 'error');
    }
  };

  const removeCartItem = async (itemId: string) => {
    try {
      const updated = await api.removeCartItem(itemId);
      setCart(updated);
      showToast('Item removed from cart', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to remove item', 'error');
    }
  };

  const clearCart = async () => {
    try {
      const updated = await api.clearCart();
      setCart(updated);
      showToast('Cart cleared', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to clear cart', 'error');
    }
  };

  const checkout = async (poNumber: string, terms: string) => {
    try {
      const order = await api.checkout(poNumber, terms);
      await loadCart();
      showToast(`Purchase order ${poNumber} submitted successfully. Status: PENDING`, 'success');
      return order;
    } catch (err: any) {
      showToast(err.message || 'Checkout failed', 'error');
      throw err;
    }
  };

  const openInvoice = async (orderId: string) => {
    setIsInvoiceOpen(true);
    setInvoiceLoading(true);
    try {
      const inv = await api.getInvoice(orderId);
      setSelectedInvoice(inv);
    } catch (err: any) {
      showToast(err.message || 'Failed to load commercial invoice', 'error');
      setIsInvoiceOpen(false);
    } finally {
      setInvoiceLoading(false);
    }
  };

  const closeInvoice = () => {
    setIsInvoiceOpen(false);
    setSelectedInvoice(null);
  };

  const cartCount = cart?.items?.reduce((acc: number, item: any) => acc + item.qty, 0) || 0;

  return (
    <BuyerContext.Provider
      value={{
        cart,
        cartCount,
        cartLoading,
        isCartOpen,
        openCart: () => setIsCartOpen(true),
        closeCart: () => setIsCartOpen(false),
        addToCart,
        updateCartItem,
        removeCartItem,
        clearCart,
        checkout,
        selectedInvoice,
        isInvoiceOpen,
        invoiceLoading,
        openInvoice,
        closeInvoice,
        toastMessage,
        showToast,
      }}
    >
      {children}
    </BuyerContext.Provider>
  );
}

export function useBuyer() {
  const context = useContext(BuyerContext);
  if (!context) {
    throw new Error('useBuyer must be used within BuyerProvider');
  }
  return context;
}
