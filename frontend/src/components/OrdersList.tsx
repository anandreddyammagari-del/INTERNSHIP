'use client';

import React, { useState } from 'react';
import { FileText, Search } from 'lucide-react';
import StatusBadge from './StatusBadge';

interface OrdersListProps {
  orders: any[];
  onViewInvoice: (orderId: string) => void;
  onUpdateStatus?: (orderId: string, status: string) => void;
  userRole: string;
  loading: boolean;
}

export default function OrdersList({
  orders,
  onViewInvoice,
  onUpdateStatus,
  userRole,
  loading,
}: OrdersListProps) {
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [search, setSearch] = useState<string>('');

  const isPrivileged = userRole === 'ADMIN' || userRole === 'SALES_REP';

  const filteredOrders = orders.filter((o) => {
    const matchesStatus = filterStatus === 'ALL' || o.status === filterStatus;
    const matchesSearch =
      search === '' ||
      (o.poNumber && o.poNumber.toLowerCase().includes(search.toLowerCase())) ||
      (o.company?.name && o.company.name.toLowerCase().includes(search.toLowerCase())) ||
      o.id.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-4">
      {/* Dense Filter & Search Toolbar */}
      <div className="bg-[#FFFFFF] border border-[#D0D7DE] rounded p-3 flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3 w-full md:w-auto flex-1">
          <div className="relative w-full max-w-sm">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#57606A]" />
            <input
              type="text"
              placeholder="Search by PO number, order ID, or company..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-[#FFFFFF] border border-[#D0D7DE] rounded text-xs text-[#1A202C] placeholder-[#8C95A0] focus:outline-none focus:border-[#0F52BA]"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-[#57606A] whitespace-nowrap">
              Status:
            </span>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-[#FFFFFF] border border-[#D0D7DE] rounded px-2.5 py-1.5 text-xs text-[#1A202C] focus:outline-none focus:border-[#0F52BA]"
            >
              <option value="ALL">All statuses</option>
              <option value="PENDING">Pending approval</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="FULFILLED">Fulfilled</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
        </div>

        <div className="text-xs font-medium text-[#57606A] tabular-nums">
          {filteredOrders.length} records registered
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-[#FFFFFF] border border-[#D0D7DE] rounded overflow-hidden">
        {filteredOrders.length === 0 ? (
          <div className="py-16 text-center space-y-2">
            <FileText className="w-10 h-10 text-[#57606A] mx-auto stroke-1" />
            <div className="text-sm font-semibold text-[#1A202C]">No orders found</div>
            <p className="text-xs text-[#57606A]">
              {orders.length === 0
                ? 'No transactions have been submitted yet.'
                : 'No orders match your filter criteria.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#1A202C]">
              <thead className="bg-[#F8F9FA] text-[#57606A] text-xs font-medium border-b border-[#D0D7DE]">
                <tr>
                  <th className="py-2.5 px-3 w-40">PO number</th>
                  <th className="py-2.5 px-3">Company / Buyer</th>
                  <th className="py-2.5 px-3 w-32">Date logged</th>
                  <th className="py-2.5 px-3 w-28">Payment terms</th>
                  <th className="py-2.5 px-3 text-right w-28">Order total</th>
                  <th className="py-2.5 px-3 w-40">Order status</th>
                  <th className="py-2.5 px-3 text-right w-52">Operational action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D0D7DE]">
                {filteredOrders.map((order) => {
                  const date = new Date(order.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  });

                  return (
                    <tr
                      key={order.id}
                      className="hover:bg-[#F8F9FA] transition-colors"
                    >
                      {/* PO Number & Order ID */}
                      <td className="py-2.5 px-3">
                        <div className="font-mono font-medium text-[#1A202C]">
                          {order.poNumber || 'N/A'}
                        </div>
                        <div className="font-mono text-[10px] text-[#57606A]">
                          {order.id.slice(0, 8)}...
                        </div>
                      </td>

                      {/* Company & User */}
                      <td className="py-2.5 px-3">
                        <div className="font-semibold text-[#1A202C]">
                          {order.company?.name || 'Client Account'}
                        </div>
                        <div className="text-[11px] text-[#57606A]">
                          {order.user?.name || order.user?.email}
                        </div>
                      </td>

                      {/* Date */}
                      <td className="py-2.5 px-3 text-[#1A202C] tabular-nums">
                        {date}
                      </td>

                      {/* Terms */}
                      <td className="py-2.5 px-3 font-mono text-[#57606A]">
                        {order.paymentTerms}
                      </td>

                      {/* Total */}
                      <td className="py-2.5 px-3 text-right font-medium tabular-nums text-[#1A202C]">
                        ${order.totalAmount.toFixed(2)}
                      </td>

                      {/* Status Indicator */}
                      <td className="py-2.5 px-3">
                        <StatusBadge status={order.status} />
                      </td>

                      {/* Actions */}
                      <td className="py-2.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onViewInvoice(order.id)}
                            className="px-2.5 py-1 rounded border border-[#D0D7DE] bg-[#FFFFFF] hover:bg-[#F1F3F5] text-xs font-medium text-[#1A202C] transition-colors cursor-pointer"
                          >
                            Review invoice
                          </button>

                          {isPrivileged && onUpdateStatus && order.status === 'PENDING' && (
                            <button
                              onClick={() => onUpdateStatus(order.id, 'CONFIRMED')}
                              className="px-2.5 py-1 rounded bg-[#0F52BA] hover:bg-[#0C4196] text-white text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap"
                            >
                              Approve order
                            </button>
                          )}

                          {isPrivileged && onUpdateStatus && order.status === 'CONFIRMED' && (
                            <button
                              onClick={() => onUpdateStatus(order.id, 'FULFILLED')}
                              className="px-2.5 py-1 rounded bg-[#0B6A52] hover:bg-[#095541] text-white text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap"
                            >
                              Mark fulfilled
                            </button>
                          )}
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
