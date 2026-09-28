'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useBuyer } from '../BuyerContext';
import { useAuth } from '@/lib/auth-context';
import { Receipt, CreditCard, Building2, Printer, Loader2 } from 'lucide-react';
import StatusBadge from '@/components/StatusBadge';

export default function BuyerInvoicesPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { openInvoice } = useBuyer();
  const { user } = useAuth();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const data = await api.getOrders();
        setOrders(data);
      } catch (err) {
        console.error('Failed to load orders for invoice register:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const invoicedOrders = orders.filter((o) => o.invoice || o.status !== 'CANCELLED');

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="pb-2 border-b border-[#D0D7DE]">
        <h2 className="text-base font-bold text-[#1A202C]">
          Commercial invoices & credit terms
        </h2>
        <p className="text-xs text-[#57606A]">
          Official tax invoices, payment due dates, and active credit arrangements for {user?.companyName || 'your organization'}.
        </p>
      </div>

      {/* Credit Arrangement Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#FFFFFF] border border-[#D0D7DE] rounded p-4">
          <div className="flex items-center gap-2 text-xs font-medium text-[#57606A] mb-1">
            <CreditCard className="w-4 h-4 text-[#0F52BA]" />
            <span>Authorized terms</span>
          </div>
          <div className="text-lg font-bold text-[#1A202C] font-mono">
            {user?.creditTerms || 'Net 30'}
          </div>
          <div className="text-xs text-[#57606A] mt-1">
            Standard payment settlement window from invoice dispatch date
          </div>
        </div>

        <div className="bg-[#FFFFFF] border border-[#D0D7DE] rounded p-4">
          <div className="flex items-center gap-2 text-xs font-medium text-[#57606A] mb-1">
            <Building2 className="w-4 h-4 text-[#0B6A52]" />
            <span>Corporate billing entity</span>
          </div>
          <div className="text-sm font-bold text-[#1A202C] truncate">
            {user?.companyName || 'Apex Industrial Supplies'}
          </div>
          <div className="text-xs text-[#57606A] mt-1">
            Commercial Account ID: {user?.companyId?.slice(0, 12) || 'ACC-CORP-01'}
          </div>
        </div>

        <div className="bg-[#FFFFFF] border border-[#D0D7DE] rounded p-4">
          <div className="flex items-center gap-2 text-xs font-medium text-[#57606A] mb-1">
            <Receipt className="w-4 h-4 text-[#875200]" />
            <span>Credit standing</span>
          </div>
          <div className="text-sm font-bold text-[#0B6A52] flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#0B6A52]" />
            <span>In Good Standing</span>
          </div>
          <div className="text-xs text-[#57606A] mt-1">
            Credit line approved by Vortex Central Treasury
          </div>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-[#FFFFFF] border border-[#D0D7DE] rounded overflow-hidden">
        <div className="p-3 border-b border-[#D0D7DE] bg-[#F8F9FA] flex items-center justify-between">
          <span className="text-xs font-semibold text-[#1A202C]">
            Tax invoice register
          </span>
          <span className="text-xs font-medium text-[#57606A] tabular-nums">
            {invoicedOrders.length} billing records
          </span>
        </div>

        {loading ? (
          <div className="py-12 text-center flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 text-[#0F52BA] animate-spin" />
            <span className="text-xs text-[#57606A]">Loading invoice ledger...</span>
          </div>
        ) : invoicedOrders.length === 0 ? (
          <div className="py-12 text-center text-xs text-[#57606A]">
            No invoices have been issued yet. Submit an order from the catalog to generate an invoice.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#1A202C]">
              <thead className="bg-[#F8F9FA] text-[#57606A] text-xs font-medium border-b border-[#D0D7DE]">
                <tr>
                  <th className="py-2.5 px-3 w-40">Invoice reference</th>
                  <th className="py-2.5 px-3 w-36">PO number</th>
                  <th className="py-2.5 px-3 w-32">Issue date</th>
                  <th className="py-2.5 px-3 w-28">Terms</th>
                  <th className="py-2.5 px-3 text-right w-28">Invoice total</th>
                  <th className="py-2.5 px-3 w-36">Order status</th>
                  <th className="py-2.5 px-3 text-right w-36">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D0D7DE]">
                {invoicedOrders.map((order) => {
                  const invNumber = order.invoice?.invoiceNumber || `INV-${order.id.slice(0, 8).toUpperCase()}`;
                  const issueDate = new Date(order.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  });

                  return (
                    <tr key={order.id} className="hover:bg-[#F8F9FA] transition-colors">
                      <td className="py-2.5 px-3 font-mono font-medium text-[#0F52BA]">
                        {invNumber}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-[#1A202C]">
                        {order.poNumber || 'N/A'}
                      </td>
                      <td className="py-2.5 px-3 text-[#57606A] tabular-nums">
                        {issueDate}
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
                        <button
                          onClick={() => openInvoice(order.id)}
                          className="px-2.5 py-1 rounded border border-[#D0D7DE] bg-[#FFFFFF] hover:bg-[#F1F3F5] text-xs font-medium text-[#1A202C] transition-colors cursor-pointer"
                        >
                          View invoice
                        </button>
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
