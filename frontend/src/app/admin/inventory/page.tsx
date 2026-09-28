'use client';

import React from 'react';
import AdminStockView from '@/components/AdminStockView';
import { useAdmin } from '../AdminContext';
import { Loader2 } from 'lucide-react';

export default function AdminInventoryPage() {
  const {
    stockData,
    stockLoading,
    refreshStock,
    adjustStock,
    updateProductPrice,
  } = useAdmin();

  return (
    <div className="space-y-4">
      {/* Title */}
      <div className="pb-2 border-b border-[#D0D7DE]">
        <h2 className="text-base font-bold text-[#1A202C]">
          Warehouse stock control & inventory valuation
        </h2>
        <p className="text-xs text-[#57606A]">
          Master distribution inventory ledger, reorder threshold triggers, and real-time stock adjustment control.
        </p>
      </div>

      {stockLoading && !stockData ? (
        <div className="bg-[#FFFFFF] border border-[#D0D7DE] rounded p-8 flex items-center justify-center gap-3">
          <Loader2 className="w-5 h-5 text-[#0F52BA] animate-spin shrink-0" />
          <span className="text-xs font-medium text-[#1A202C]">
            Loading warehouse stock data...
          </span>
        </div>
      ) : (
        <AdminStockView
          stockData={stockData}
          onAdjustStock={adjustStock}
          onUpdatePrice={updateProductPrice}
          onRefresh={refreshStock}
          loading={stockLoading}
        />
      )}
    </div>
  );
}
