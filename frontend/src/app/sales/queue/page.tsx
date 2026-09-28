'use client';

import React from 'react';
import { useSales } from '../SalesContext';
import { Inbox, CheckCircle2, Clock, DollarSign, RefreshCw, FileText } from 'lucide-react';
import StatusBadge from '@/components/StatusBadge';

export default function SalesQueuePage() {
  const {
    pendingOrders,
    loading,
    refreshOrders,
    updateOrderStatus,
    openInvoice,
  } = useSales();

  const totalPendingValue = pendingOrders.reduce(
    (acc, o) => acc + (o.totalAmount || 0),
    0
  );

  return (
    <div className="space-y-6">
      {/* Page Title & Refresh */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[#D0D7DE]">
        <div>
          <h2 className="text-base font-bold text-[#1A202C]">
            Order approval & clearance queue
          </h2>
          <p className="text-xs text-[#57606A]">
            Purchase orders awaiting sales review, credit check verification, and dispatch authorization.
          </p>
        </div>

        <button
          onClick={refreshOrders}
          disabled={loading}
          className="px-2.5 py-1.5 rounded border border-[#D0D7DE] bg-[#FFFFFF] hover:bg-[#F1F3F5] text-xs font-medium text-[#1A202C] flex items-center gap-1.5 transition-colors cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#0F52BA]' : 'text-[#57606A]'}`} />
          <span>Refresh queue</span>
        </button>
      </div>

      {/* Operational Summary Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#FFFFFF] border border-[#D0D7DE] rounded p-4">
          <div className="flex items-center gap-2 text-xs font-medium text-[#57606A] mb-1">
            <Clock className="w-4 h-4 text-[#875200]" />
            <span>Pending clearance</span>
          </div>
          <div className="text-xl font-bold text-[#875200] tabular-nums">
            {pendingOrders.length}
          </div>
          <div className="text-xs text-[#57606A] mt-1">
            Orders requiring sales representative confirmation
          </div>
        </div>

        <div className="bg-[#FFFFFF] border border-[#D0D7DE] rounded p-4">
          <div className="flex items-center gap-2 text-xs font-medium text-[#57606A] mb-1">
            <DollarSign className="w-4 h-4 text-[#0F52BA]" />
            <span>Pending pipeline value</span>
          </div>
          <div className="text-xl font-bold text-[#1A202C] tabular-nums">
            ${totalPendingValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-xs text-[#57606A] mt-1">
            Cumulative credit exposure in current queue
          </div>
        </div>

        <div className="bg-[#FFFFFF] border border-[#D0D7DE] rounded p-4">
          <div className="flex items-center gap-2 text-xs font-medium text-[#57606A] mb-1">
            <CheckCircle2 className="w-4 h-4 text-[#0B6A52]" />
            <span>Fulfillment readiness</span>
          </div>
          <div className="text-sm font-bold text-[#0B6A52] flex items-center gap-1.5 mt-1">
            <span className="w-2 h-2 rounded-full bg-[#0B6A52]" />
            <span>DC-01 Terminal Online</span>
          </div>
          <div className="text-xs text-[#57606A] mt-1">
            Warehouse dispatch ready upon confirmation
          </div>
        </div>
      </div>

      {/* Queue Table */}
      <div className="bg-[#FFFFFF] border border-[#D0D7DE] rounded overflow-hidden">
        <div className="p-3 border-b border-[#D0D7DE] bg-[#F8F9FA] flex items-center justify-between">
          <span className="text-xs font-semibold text-[#1A202C]">
            Pending requisition queue
          </span>
          <span className="text-xs font-medium text-[#57606A] tabular-nums">
            {pendingOrders.length} requisitions awaiting action
          </span>
        </div>

        {pendingOrders.length === 0 ? (
          <div className="py-16 text-center space-y-2">
            <Inbox className="w-10 h-10 text-[#57606A] mx-auto stroke-1" />
            <div className="text-sm font-semibold text-[#1A202C]">
              Queue cleared
            </div>
            <p className="text-xs text-[#57606A] max-w-sm mx-auto">
              All purchase orders have been processed and confirmed for fulfillment. Incoming buyer orders will appear here in real-time.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#1A202C]">
              <thead className="bg-[#F8F9FA] text-[#57606A] text-xs font-medium border-b border-[#D0D7DE]">
                <tr>
                  <th className="py-2.5 px-3 w-40">PO number</th>
                  <th className="py-2.5 px-3">Company / Account</th>
                  <th className="py-2.5 px-3 w-32">Date submitted</th>
                  <th className="py-2.5 px-3 w-28">Payment terms</th>
                  <th className="py-2.5 px-3 text-right w-28">Order total</th>
                  <th className="py-2.5 px-3 w-40">Status</th>
                  <th className="py-2.5 px-3 text-right w-52">Clearance action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D0D7DE]">
                {pendingOrders.map((order) => {
                  const date = new Date(order.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  });

                  return (
                    <tr key={order.id} className="hover:bg-[#F8F9FA] transition-colors">
                      <td className="py-2.5 px-3">
                        <div className="font-mono font-medium text-[#1A202C]">
                          {order.poNumber || 'N/A'}
                        </div>
                        <div className="font-mono text-[10px] text-[#57606A]">
                          {order.id.slice(0, 8)}...
                        </div>
                      </td>

                      <td className="py-2.5 px-3">
                        <div className="font-semibold text-[#1A202C]">
                          {order.company?.name || 'Wholesale Client'}
                        </div>
                        <div className="text-[11px] text-[#57606A]">
                          {order.user?.name || order.user?.email}
                        </div>
                      </td>

                      <td className="py-2.5 px-3 text-[#57606A] tabular-nums">
                        {date}
                      </td>

                      <td className="py-2.5 px-3 font-mono text-[#57606A]">
                        {order.paymentTerms}
                      </td>

                      <td className="py-2.5 px-3 text-right font-medium tabular-nums text-[#1A202C]">
                        ${order.totalAmount.toFixed(2)}
                      </td>

                      <td className="py-2.5 px-3">
                        <StatusBadge status={order.status} />
                      </td>

                      <td className="py-2.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openInvoice(order.id)}
                            className="px-2.5 py-1 rounded border border-[#D0D7DE] bg-[#FFFFFF] hover:bg-[#F1F3F5] text-xs font-medium text-[#1A202C] transition-colors cursor-pointer"
                          >
                            Review invoice
                          </button>
                          <button
                            onClick={() => updateOrderStatus(order.id, 'CONFIRMED')}
                            className="px-2.5 py-1 rounded bg-[#0F52BA] hover:bg-[#0C4196] text-white text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap"
                          >
                            Approve order
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
