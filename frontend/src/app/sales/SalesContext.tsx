'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';

interface SalesContextType {
  orders: any[];
  pendingOrders: any[];
  loading: boolean;
  refreshOrders: () => Promise<void>;
  updateOrderStatus: (orderId: string, status: string) => Promise<void>;
  selectedInvoice: any | null;
  isInvoiceOpen: boolean;
  invoiceLoading: boolean;
  openInvoice: (orderId: string) => Promise<void>;
  closeInvoice: () => void;
  toastMessage: { type: 'success' | 'error'; text: string } | null;
  showToast: (text: string, type?: 'success' | 'error') => void;
}

const SalesContext = createContext<SalesContextType | undefined>(undefined);

export function SalesProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

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

  const refreshOrders = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const data = await api.getOrders();
      setOrders(data);
    } catch (err: any) {
      console.error('Failed to load sales orders:', err);
      showToast(err.message || 'Failed to refresh orders', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshOrders();
  }, [user]);

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      await api.updateOrderStatus(orderId, status);
      await refreshOrders();
      showToast(`Order status updated to ${status}.`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to update order status', 'error');
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
      showToast(err.message || 'Failed to load invoice', 'error');
      setIsInvoiceOpen(false);
    } finally {
      setInvoiceLoading(false);
    }
  };

  const closeInvoice = () => {
    setIsInvoiceOpen(false);
    setSelectedInvoice(null);
  };

  const pendingOrders = orders.filter((o) => o.status === 'PENDING');

  return (
    <SalesContext.Provider
      value={{
        orders,
        pendingOrders,
        loading,
        refreshOrders,
        updateOrderStatus,
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
    </SalesContext.Provider>
  );
}

export function useSales() {
  const context = useContext(SalesContext);
  if (!context) {
    throw new Error('useSales must be used within SalesProvider');
  }
  return context;
}
