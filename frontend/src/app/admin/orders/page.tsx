'use client';

import React from 'react';
import OrdersList from '@/components/OrdersList';
import { useAdmin } from '../AdminContext';
import { RefreshCw, Loader2 } from 'lucide-react';

export default function AdminOrdersPage() {
  const {
    orders,
    ordersLoading,
    refreshOrders,
    updateOrderStatus,
    openInvoice,
  } = useAdmin();

  return (
    <div className="space-y-4">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[#D0D7DE]">
        <div>
          <h2 className="text-base font-bold text-[#1A202C]">
            Cross-tenant global order register
          </h2>
          <p className="text-xs text-[#57606A]">
            Comprehensive order transactions across all enterprise wholesale customer entities.
          </p>
        </div>

        <button
          onClick={refreshOrders}
          disabled={ordersLoading}
          className="px-2.5 py-1.5 rounded border border-[#D0D7DE] bg-[#FFFFFF] hover:bg-[#F1F3F5] text-xs font-medium text-[#1A202C] flex items-center gap-1.5 transition-colors cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${ordersLoading ? 'animate-spin text-[#0F52BA]' : 'text-[#57606A]'}`} />
          <span>Refresh ledger</span>
        </button>
      </div>

      {ordersLoading && orders.length === 0 ? (
        <div className="bg-[#FFFFFF] border border-[#D0D7DE] rounded p-8 flex items-center justify-center gap-3">
          <Loader2 className="w-5 h-5 text-[#0F52BA] animate-spin shrink-0" />
          <span className="text-xs font-medium text-[#1A202C]">
            Loading global order transactions...
          </span>
        </div>
      ) : (
        <OrdersList
          orders={orders}
          onViewInvoice={openInvoice}
          onUpdateStatus={updateOrderStatus}
          userRole="ADMIN"
          loading={ordersLoading}
        />
      )}
    </div>
  );
}
