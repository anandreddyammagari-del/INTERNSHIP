'use client';

import React, { useState } from 'react';
import { X, Trash2, ShoppingCart, AlertCircle, CheckCircle2 } from 'lucide-react';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: any;
  onUpdateQty: (itemId: string, qty: number) => Promise<void>;
  onRemoveItem: (itemId: string) => Promise<void>;
  onClearCart: () => Promise<void>;
  onCheckout: (poNumber: string, terms: string) => Promise<void>;
  companyTerms?: string;
}

export default function CartDrawer({
  isOpen,
  onClose,
  cart,
  onUpdateQty,
  onRemoveItem,
  onClearCart,
  onCheckout,
  companyTerms = 'Net 30',
}: CartDrawerProps) {
  const [poNumber, setPoNumber] = useState(`PO-${Date.now().toString().slice(-6)}`);
  const [paymentTerms, setPaymentTerms] = useState(companyTerms);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const items = cart?.items || [];
  const subtotal = cart?.totalAmount || 0;
  const tax = Number((subtotal * 0.18).toFixed(2));
  const grandTotal = Number((subtotal + tax).toFixed(2));

  // Find any item where requested quantity exceeds warehouse stock
  const overStockItem = items.find((i: any) => i.qty > i.product?.stockQty);

  const handleCheckout = async () => {
    if (!poNumber.trim()) {
      setError('Please provide an official Purchase Order (PO) reference number.');
      return;
    }
    if (overStockItem) {
      setError(
        `Only ${overStockItem.product?.stockQty} units of ${overStockItem.product?.name} in warehouse stock — reduce quantity to continue.`,
      );
      return;
    }

    setError(null);
    setSubmitting(true);
    try {
      await onCheckout(poNumber, paymentTerms);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Order execution failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-[#1A202C]/40 backdrop-blur-none flex justify-end">
      <div className="w-full max-w-xl bg-[#FFFFFF] border-l border-[#D0D7DE] h-full flex flex-col justify-between shadow-none">
        {/* Drawer Header */}
        <div className="h-14 px-5 border-b border-[#D0D7DE] flex items-center justify-between bg-[#F8F9FA]">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-4 h-4 text-[#0F52BA]" />
            <h2 className="font-bold text-sm text-[#1A202C]">Purchase Order Cart</h2>
            <span className="text-xs text-[#5E6C84] tabular-nums">
              ({items.length} line items)
            </span>
          </div>

          <div className="flex items-center gap-2">
            {items.length > 0 && (
              <button
                onClick={onClearCart}
                className="text-xs text-[#5E6C84] hover:text-[#B91C1C] px-2 py-1 rounded hover:bg-[#E9ECEF] transition-colors"
              >
                Clear all
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded text-[#5E6C84] hover:text-[#1A202C] hover:bg-[#E9ECEF] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content & Line Items Table */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Validation Alert Banner */}
          {error && (
            <div className="p-3 rounded border border-[#B91C1C] bg-[#FEE2E2] text-[#B91C1C] text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="font-medium">{error}</div>
            </div>
          )}

          {overStockItem && !error && (
            <div className="p-3 rounded border border-[#B45309] bg-[#FEF3C7] text-[#B45309] text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <strong>Stock Alert:</strong> Only {overStockItem.product?.stockQty} units of{' '}
                {overStockItem.product?.name} in warehouse stock — reduce quantity to continue.
              </div>
            </div>
          )}

          {items.length === 0 ? (
            <div className="py-20 text-center space-y-2">
              <ShoppingCart className="w-10 h-10 text-[#5E6C84] mx-auto stroke-1" />
              <div className="text-sm font-semibold text-[#1A202C]">Cart is empty</div>
              <p className="text-xs text-[#5E6C84] max-w-xs mx-auto">
                Select items from the catalog to configure your purchase requisition.
              </p>
            </div>
          ) : (
            <div className="border border-[#D0D7DE] rounded overflow-hidden">
              <table className="w-full text-left text-xs text-[#1A202C]">
                <thead className="bg-[#F8F9FA] text-[#5E6C84] uppercase text-[10px] font-semibold border-b border-[#D0D7DE]">
                  <tr>
                    <th className="py-2 px-3">Item Details</th>
                    <th className="py-2 px-3 text-right">Price</th>
                    <th className="py-2 px-3 text-center w-28">Quantity</th>
                    <th className="py-2 px-3 text-right">Line Total</th>
                    <th className="py-2 px-2 text-center w-8"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D0D7DE]">
                  {items.map((item: any) => {
                    const prod = item.product;
                    const isOverStock = item.qty > prod.stockQty;

                    return (
                      <tr
                        key={item.id}
                        className={isOverStock ? 'bg-[#FFFBEB]' : 'hover:bg-[#F8F9FA]'}
                      >
                        <td className="py-2.5 px-3">
                          <div className="font-semibold text-[#1A202C]">{prod.name}</div>
                          <div className="font-mono text-[10px] text-[#5E6C84]">
                            {prod.sku} • Stock: {prod.stockQty}
                          </div>
                        </td>

                        <td className="py-2.5 px-3 text-right tabular-nums text-[#1A202C]">
                          ${prod.price.toFixed(2)}
                        </td>

                        <td className="py-2.5 px-3">
                          <div className="flex items-center justify-center border border-[#D0D7DE] bg-[#FFFFFF] rounded overflow-hidden mx-auto w-fit">
                            <button
                              onClick={() => onUpdateQty(item.id, Math.max(1, item.qty - 1))}
                              disabled={item.qty <= 1}
                              className="px-2 py-0.5 text-[#5E6C84] hover:bg-[#E9ECEF] disabled:opacity-30 text-xs font-semibold"
                            >
                              -
                            </button>
                            <span className="px-2 py-0.5 text-xs font-semibold tabular-nums text-[#1A202C]">
                              {item.qty}
                            </span>
                            <button
                              onClick={() => onUpdateQty(item.id, item.qty + 1)}
                              className="px-2 py-0.5 text-[#5E6C84] hover:bg-[#E9ECEF] text-xs font-semibold"
                            >
                              +
                            </button>
                          </div>
                        </td>

                        <td className="py-2.5 px-3 text-right font-semibold tabular-nums text-[#1A202C]">
                          ${(item.qty * prod.price).toFixed(2)}
                        </td>

                        <td className="py-2.5 px-2 text-center">
                          <button
                            onClick={() => onRemoveItem(item.id)}
                            className="text-[#5E6C84] hover:text-[#B91C1C] p-1"
                            title="Remove line item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
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

        {/* B2B Procurement Footer */}
        {items.length > 0 && (
          <div className="p-5 border-t border-[#D0D7DE] bg-[#F8F9FA] space-y-4">
            {/* Purchase Order & Terms Form */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-[#5E6C84] font-semibold mb-1">
                  PO Number <span className="text-[#B91C1C]">*</span>
                </label>
                <input
                  type="text"
                  value={poNumber}
                  onChange={(e) => setPoNumber(e.target.value)}
                  placeholder="e.g. PO-8821-APEX"
                  className="w-full px-2.5 py-1.5 bg-[#FFFFFF] border border-[#D0D7DE] rounded text-xs text-[#1A202C] font-mono focus:outline-none focus:border-[#0F52BA]"
                />
              </div>

              <div>
                <label className="block text-[#5E6C84] font-semibold mb-1">
                  Approved Terms
                </label>
                <select
                  value={paymentTerms}
                  onChange={(e) => setPaymentTerms(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-[#FFFFFF] border border-[#D0D7DE] rounded text-xs text-[#1A202C] focus:outline-none focus:border-[#0F52BA]"
                >
                  <option value="Net 30">Net 30 (Commercial Account)</option>
                  <option value="Net 60">Net 60 (Extended Wholesale)</option>
                  <option value="Advance Payment">Advance Payment</option>
                </select>
              </div>
            </div>

            {/* Financial Summary */}
            <div className="border border-[#D0D7DE] rounded bg-[#FFFFFF] p-3 space-y-1.5 text-xs">
              <div className="flex justify-between text-[#5E6C84]">
                <span>Requisition Subtotal</span>
                <span className="tabular-nums font-medium text-[#1A202C]">
                  ${subtotal.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-[#5E6C84]">
                <span>Estimated Tax (18% GST / VAT)</span>
                <span className="tabular-nums font-medium text-[#1A202C]">
                  ${tax.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between font-bold text-sm text-[#1A202C] pt-2 border-t border-[#D0D7DE]">
                <span>Total Amount Due</span>
                <span className="tabular-nums text-[#0F52BA]">
                  ${grandTotal.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Action Button */}
            <button
              disabled={submitting || !!overStockItem}
              onClick={handleCheckout}
              className="w-full py-2.5 px-4 rounded bg-[#0F52BA] hover:bg-[#0D449B] disabled:bg-[#D0D7DE] disabled:text-[#5E6C84] text-white text-xs font-semibold tracking-wide transition-colors cursor-pointer disabled:cursor-not-allowed text-center"
            >
              {submitting ? 'Executing transaction...' : 'Place purchase order'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
