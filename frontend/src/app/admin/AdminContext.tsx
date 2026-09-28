'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';

interface AdminContextType {
  stockData: any | null;
  stockLoading: boolean;
  refreshStock: () => Promise<void>;
  adjustStock: (productId: string, delta: number, reason: string) => Promise<void>;
  updateProductPrice: (productId: string, price: number) => Promise<void>;
  orders: any[];
  ordersLoading: boolean;
  refreshOrders: () => Promise<void>;
  updateOrderStatus: (orderId: string, status: string) => Promise<void>;
  auditLogs: any[];
  stockLogs: any[];
  logsLoading: boolean;
  refreshLogs: () => Promise<void>;
  selectedInvoice: any | null;
  isInvoiceOpen: boolean;
  invoiceLoading: boolean;
  openInvoice: (orderId: string) => Promise<void>;
  closeInvoice: () => void;
  toastMessage: { type: 'success' | 'error'; text: string } | null;
  showToast: (text: string, type?: 'success' | 'error') => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();

  // Stock
  const [stockData, setStockData] = useState<any | null>(null);
  const [stockLoading, setStockLoading] = useState(false);

  // Orders
  const [orders, setOrders] = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  // Logs
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [stockLogs, setStockLogs] = useState<any[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);

  // Invoice
  const [selectedInvoice, setSelectedInvoice] = useState<any | null>(null);
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);
  const [invoiceLoading, setInvoiceLoading] = useState(false);

  // Toast
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 3500);
  };

  const refreshStock = async () => {
    if (!user || user.role !== 'ADMIN') return;
    try {
      setStockLoading(true);
      const data = await api.getAdminStock();
      setStockData(data);
    } catch (err: any) {
      console.error('Failed to load admin stock:', err);
    } finally {
      setStockLoading(false);
    }
  };

  const refreshOrders = async () => {
    if (!user || user.role !== 'ADMIN') return;
    try {
      setOrdersLoading(true);
      const data = await api.getOrders();
      setOrders(data);
    } catch (err: any) {
      console.error('Failed to load global orders:', err);
    } finally {
      setOrdersLoading(false);
    }
  };

  const refreshLogs = async () => {
    if (!user || user.role !== 'ADMIN') return;
    try {
      setLogsLoading(true);
      const [aLogs, sLogs] = await Promise.all([
        api.getAuditLogs(50),
        api.getStockLogs(50),
      ]);
      setAuditLogs(aLogs);
      setStockLogs(sLogs);
    } catch (err: any) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setLogsLoading(false);
    }
  };

  useEffect(() => {
    refreshStock();
    refreshOrders();
    refreshLogs();
  }, [user]);

  const adjustStock = async (productId: string, delta: number, reason: string) => {
    try {
      await api.adjustStock(productId, delta, reason);
      await Promise.all([refreshStock(), refreshLogs()]);
      showToast(`Stock level adjusted (${delta > 0 ? `+${delta}` : delta} units).`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to adjust stock', 'error');
      throw err;
    }
  };

  const updateProductPrice = async (productId: string, price: number) => {
    try {
      await api.updateProduct(productId, { price });
      await refreshStock();
      showToast(`Product base price updated to $${price.toFixed(2)}.`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to update price', 'error');
      throw err;
    }
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      await api.updateOrderStatus(orderId, status);
      await Promise.all([refreshOrders(), refreshLogs()]);
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

  return (
    <AdminContext.Provider
      value={{
        stockData,
        stockLoading,
        refreshStock,
        adjustStock,
        updateProductPrice,
        orders,
        ordersLoading,
        refreshOrders,
        updateOrderStatus,
        auditLogs,
        stockLogs,
        logsLoading,
        refreshLogs,
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
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within AdminProvider');
  }
  return context;
}
