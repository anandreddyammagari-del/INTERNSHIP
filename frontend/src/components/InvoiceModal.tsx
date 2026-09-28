'use client';

import React from 'react';
import { X, Printer, Building2 } from 'lucide-react';

interface InvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: any;
  loading: boolean;
}

export default function InvoiceModal({ isOpen, onClose, invoice, loading }: InvoiceModalProps) {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  if (loading || !invoice) {
    return (
      <div className="fixed inset-0 z-50 bg-[#1A202C]/40 flex items-center justify-center p-4">
        <div className="bg-[#FFFFFF] border border-[#D0D7DE] p-6 rounded text-center space-y-2">
          <div className="text-xs font-semibold text-[#1A202C]">Loading commercial tax invoice...</div>
        </div>
      </div>
    );
  }

  const order = invoice.order;
  const issueDate = new Date(invoice.issuedAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  const dueDate = new Date(invoice.dueDate).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="fixed inset-0 z-50 bg-[#1A202C]/40 flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-2xl bg-[#FFFFFF] border border-[#D0D7DE] rounded shadow-none my-8 overflow-hidden">
        {/* Actions bar (Hidden when printing) */}
        <div className="px-5 py-3 bg-[#F8F9FA] border-b border-[#D0D7DE] flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#1A202C]">Tax Invoice Statement</span>
            <span className="text-xs text-[#5E6C84]">({invoice.invoiceNumber})</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded bg-[#0F52BA] hover:bg-[#0D449B] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print invoice</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded text-[#5E6C84] hover:text-[#1A202C] hover:bg-[#E9ECEF] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Formal Invoice Sheet */}
        <div className="p-8 space-y-6 text-[#1A202C] bg-[#FFFFFF]" id="invoice-sheet">
          {/* Header */}
          <div className="flex justify-between items-start border-b border-[#D0D7DE] pb-5">
            <div>
              <div className="font-bold text-base tracking-tight text-[#1A202C]">
                VORTEX DISTRIBUTORS LTD
              </div>
              <p className="text-xs text-[#5E6C84] mt-0.5">
                Industrial Supply & Warehouse Automation
              </p>
              <p className="text-[11px] text-[#5E6C84] font-mono">
                Tax ID / GSTIN: 27AABCV8821Q1ZX
              </p>
            </div>

            <div className="text-right">
              <div className="text-xs uppercase font-bold text-[#5E6C84]">
                COMMERCIAL INVOICE
              </div>
              <div className="text-base font-mono font-bold text-[#1A202C] mt-0.5">
                {invoice.invoiceNumber}
              </div>
              <div className="text-xs text-[#5E6C84] mt-1 font-mono">
                Ref PO: <span className="font-bold text-[#1A202C]">{order?.poNumber || 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* Bill-to & Terms Grid */}
          <div className="grid grid-cols-2 gap-4 text-xs border-b border-[#D0D7DE] pb-5">
            <div>
              <span className="text-[10px] uppercase font-bold text-[#5E6C84] block mb-1">
                Billed To
              </span>
              <div className="font-bold text-sm text-[#1A202C]">
                {order?.company?.name || 'Customer Account'}
              </div>
              <div className="text-[#5E6C84] mt-0.5">
                Attention: {order?.user?.name || order?.user?.email}
              </div>
              <div className="font-mono text-[11px] text-[#5E6C84] mt-1">
                Terms: {order?.paymentTerms || 'Net 30'}
              </div>
            </div>

            <div className="text-right space-y-1">
              <div>
                <span className="text-[#5E6C84]">Issue Date: </span>
                <span className="font-medium text-[#1A202C] tabular-nums">{issueDate}</span>
              </div>
              <div>
                <span className="text-[#5E6C84]">Due Date: </span>
                <span className="font-bold text-[#B45309] tabular-nums">{dueDate}</span>
              </div>
              <div>
                <span className="text-[#5E6C84]">Payment Status: </span>
                <span className="font-bold text-[#1A202C] uppercase">{invoice.status}</span>
              </div>
            </div>
          </div>

          {/* Line Items Table with Price Snapshots */}
          <div className="border border-[#D0D7DE] rounded overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8F9FA] text-[#5E6C84] uppercase text-[10px] font-semibold border-b border-[#D0D7DE]">
                <tr>
                  <th className="py-2 px-3">SKU</th>
                  <th className="py-2 px-3">Item Description</th>
                  <th className="py-2 px-3 text-center w-16">Qty</th>
                  <th className="py-2 px-3 text-right w-28">Price (Snapshot)</th>
                  <th className="py-2 px-3 text-right w-28">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D0D7DE]">
                {order?.items?.map((item: any) => (
                  <tr key={item.id}>
                    <td className="py-2 px-3 font-mono font-medium text-[#1A202C]">
                      {item.product?.sku}
                    </td>
                    <td className="py-2 px-3 font-medium text-[#1A202C]">
                      {item.product?.name}
                    </td>
                    <td className="py-2 px-3 text-center tabular-nums font-semibold text-[#1A202C]">
                      {item.qty}
                    </td>
                    <td className="py-2 px-3 text-right font-medium tabular-nums text-[#1A202C]">
                      ${item.unitPriceSnapshot.toFixed(2)}
                    </td>
                    <td className="py-2 px-3 text-right font-bold tabular-nums text-[#1A202C]">
                      ${(item.qty * item.unitPriceSnapshot).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Financial Totals */}
          <div className="flex justify-end pt-2">
            <div className="w-64 space-y-1.5 text-xs">
              <div className="flex justify-between text-[#5E6C84]">
                <span>Requisition Subtotal</span>
                <span className="tabular-nums font-medium text-[#1A202C]">
                  ${invoice.subtotal.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-[#5E6C84]">
                <span>Applicable Tax (18%)</span>
                <span className="tabular-nums font-medium text-[#1A202C]">
                  ${invoice.taxAmount.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between font-bold text-sm text-[#1A202C] pt-2 border-t border-[#D0D7DE]">
                <span>Total Amount Due</span>
                <span className="tabular-nums text-[#0F52BA]">
                  ${invoice.totalAmount.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Footer Notice */}
          <div className="border-t border-[#D0D7DE] pt-4 text-center text-[10px] text-[#5E6C84]">
            Commercial Tax Invoice generated under Arrowstack B2B Order Management Standards.
          </div>
        </div>
      </div>
    </div>
  );
}
