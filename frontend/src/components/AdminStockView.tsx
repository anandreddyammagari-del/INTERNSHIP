'use client';

import React, { useState } from 'react';
import {
  Boxes,
  AlertTriangle,
  Check,
  X,
  RefreshCw,
  Edit2,
} from 'lucide-react';

interface AdminStockViewProps {
  stockData: any;
  onAdjustStock: (productId: string, delta: number, reason: string) => Promise<void>;
  onUpdatePrice: (productId: string, price: number) => Promise<void>;
  onRefresh: () => void;
  loading: boolean;
}

export default function AdminStockView({
  stockData,
  onAdjustStock,
  onUpdatePrice,
  onRefresh,
  loading,
}: AdminStockViewProps) {
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [delta, setDelta] = useState<number>(10);
  const [reason, setReason] = useState<'RESTOCK' | 'DAMAGE_WRITE_OFF' | 'MANUAL_CORRECTION'>('RESTOCK');
  const [editingPriceId, setEditingPriceId] = useState<string | null>(null);
  const [editPriceValue, setEditPriceValue] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);

  const summary = stockData?.summary || {
    totalProducts: 0,
    activeProducts: 0,
    lowStockCount: 0,
    outOfStockCount: 0,
    totalInventoryValue: 0,
  };

  const products = stockData?.products || [];

  const handleAdjustSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;
    setSubmitting(true);
    try {
      await onAdjustStock(selectedProduct.id, delta, reason);
      setSelectedProduct(null);
    } finally {
      setSubmitting(false);
    }
  };

  const handlePriceSave = async (productId: string) => {
    const val = parseFloat(editPriceValue);
    if (isNaN(val) || val < 0) return;
    try {
      await onUpdatePrice(productId, val);
      setEditingPriceId(null);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-4">
      {/* Dense Operations Summary Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-[#FFFFFF] border border-[#D0D7DE] p-3 rounded">
          <div className="text-[11px] font-medium text-[#57606A]">
            Total SKU catalog
          </div>
          <div className="text-xl font-bold text-[#1A202C] tabular-nums mt-0.5">
            {summary.totalProducts}
          </div>
          <div className="text-[11px] text-[#57606A] mt-0.5">
            {summary.activeProducts} active SKUs in distribution
          </div>
        </div>

        <div className="bg-[#FFFFFF] border border-[#D0D7DE] p-3 rounded">
          <div className="text-[11px] font-medium text-[#57606A]">
            Low stock warnings
          </div>
          <div className="text-xl font-bold text-[#875200] tabular-nums mt-0.5">
            {summary.lowStockCount}
          </div>
          <div className="text-[11px] text-[#57606A] mt-0.5">
            Under safety threshold (10 units)
          </div>
        </div>

        <div className="bg-[#FFFFFF] border border-[#D0D7DE] p-3 rounded">
          <div className="text-[11px] font-medium text-[#57606A]">
            Stockout count
          </div>
          <div className="text-xl font-bold text-[#A32338] tabular-nums mt-0.5">
            {summary.outOfStockCount}
          </div>
          <div className="text-[11px] text-[#57606A] mt-0.5">
            Requires supplier intake
          </div>
        </div>

        <div className="bg-[#FFFFFF] border border-[#D0D7DE] p-3 rounded">
          <div className="text-[11px] font-medium text-[#57606A]">
            Total inventory valuation
          </div>
          <div className="text-xl font-bold text-[#1A202C] tabular-nums mt-0.5">
            ${summary.totalInventoryValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-[#57606A] mt-0.5">
            Current warehouse asset valuation
          </div>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-[#FFFFFF] border border-[#D0D7DE] rounded overflow-hidden">
        <div className="p-3 border-b border-[#D0D7DE] flex items-center justify-between">
          <div className="text-xs font-semibold text-[#1A202C]">
            Warehouse stock control & reorder threshold ledger
          </div>
          <button
            onClick={onRefresh}
            disabled={loading}
            className="px-2.5 py-1 rounded border border-[#D0D7DE] bg-[#FFFFFF] hover:bg-[#F1F3F5] text-xs font-medium text-[#1A202C] flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh stock</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#1A202C]">
            <thead className="bg-[#F8F9FA] text-[#57606A] text-xs font-medium border-b border-[#D0D7DE]">
              <tr>
                <th className="py-2.5 px-3 w-32">SKU code</th>
                <th className="py-2.5 px-3">Item description</th>
                <th className="py-2.5 px-3 w-32">Category</th>
                <th className="py-2.5 px-3 text-right w-36">Unit price</th>
                <th className="py-2.5 px-3 text-right w-28">Stock on hand</th>
                <th className="py-2.5 px-3 w-36">Stock health</th>
                <th className="py-2.5 px-3 text-right w-36">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D0D7DE]">
              {products.map((p: any) => {
                const isEditingPrice = editingPriceId === p.id;
                return (
                  <tr key={p.id} className="hover:bg-[#F8F9FA] transition-colors">
                    <td className="py-2.5 px-3 font-mono font-medium text-[#1A202C]">
                      {p.sku}
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-[#1A202C]">
                      {p.name}
                    </td>
                    <td className="py-2.5 px-3 text-[#57606A]">{p.category}</td>

                    {/* Price with inline edit */}
                    <td className="py-2.5 px-3 text-right">
                      {isEditingPrice ? (
                        <div className="flex items-center justify-end gap-1">
                          <input
                            type="number"
                            step="0.01"
                            value={editPriceValue}
                            onChange={(e) => setEditPriceValue(e.target.value)}
                            className="w-20 px-1.5 py-0.5 bg-[#FFFFFF] border border-[#0F52BA] rounded text-xs font-mono text-right"
                          />
                          <button
                            onClick={() => handlePriceSave(p.id)}
                            className="p-1 text-[#0B6A52] hover:bg-[#E9ECEF] rounded cursor-pointer"
                            title="Save"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setEditingPriceId(null)}
                            className="p-1 text-[#A32338] hover:bg-[#E9ECEF] rounded cursor-pointer"
                            title="Cancel"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end gap-1.5">
                          <span className="tabular-nums font-medium text-[#1A202C]">
                            ${p.price.toFixed(2)}
                          </span>
                          <button
                            onClick={() => {
                              setEditingPriceId(p.id);
                              setEditPriceValue(p.price.toString());
                            }}
                            className="text-[#57606A] hover:text-[#0F52BA] p-0.5 cursor-pointer"
                            title="Edit price"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </td>

                    {/* Stock on Hand */}
                    <td className="py-2.5 px-3 text-right font-medium tabular-nums text-[#1A202C]">
                      {p.stockQty}
                    </td>

                    {/* Status */}
                    <td className="py-2.5 px-3">
                      {p.stockStatus === 'OUT_OF_STOCK' ? (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-semibold border bg-[#FDEAEB] text-[#A32338] border-[#ECA1AC]">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#A32338] shrink-0" />
                          <span>Out of stock</span>
                        </span>
                      ) : p.stockStatus === 'LOW_STOCK' ? (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-semibold border bg-[#FFF6E5] text-[#875200] border-[#E0B34C]">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#875200] shrink-0" />
                          <span>Low stock ({p.stockQty})</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-semibold border bg-[#E2F7EE] text-[#0B6A52] border-[#55C8A6]">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#0B6A52] shrink-0" />
                          <span>Adequate</span>
                        </span>
                      )}
                    </td>

                    {/* Adjust Action */}
                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={() => {
                          setSelectedProduct(p);
                          setDelta(25);
                          setReason('RESTOCK');
                        }}
                        className="px-2.5 py-1 rounded border border-[#D0D7DE] bg-[#FFFFFF] hover:bg-[#F1F3F5] text-xs font-medium text-[#0F52BA] transition-colors cursor-pointer"
                      >
                        Adjust stock
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Adjust Stock Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 bg-[#1A202C]/40 flex items-center justify-center p-4">
          <div className="bg-[#FFFFFF] border border-[#D0D7DE] rounded max-w-md w-full p-5 space-y-4 shadow-none">
            <div className="flex items-center justify-between pb-3 border-b border-[#D0D7DE]">
              <div>
                <h3 className="text-sm font-bold text-[#1A202C]">
                  Adjust stock levels
                </h3>
                <div className="text-xs text-[#57606A] mt-0.5">
                  SKU: {selectedProduct.sku} &bull; {selectedProduct.name}
                </div>
              </div>
              <button
                onClick={() => setSelectedProduct(null)}
                className="p-1 rounded text-[#57606A] hover:bg-[#F1F3F5] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAdjustSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#1A202C] mb-1">
                  Stock adjustment quantity (delta)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={delta}
                    onChange={(e) => setDelta(parseInt(e.target.value, 10) || 0)}
                    className="w-full h-8 px-2.5 bg-[#FFFFFF] border border-[#D0D7DE] rounded text-xs font-mono text-[#1A202C] focus:outline-none focus:border-[#0F52BA]"
                  />
                  <span className="text-xs text-[#57606A] whitespace-nowrap">
                    Current: <strong>{selectedProduct.stockQty}</strong> &rarr; New:{' '}
                    <strong>{selectedProduct.stockQty + delta}</strong>
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#1A202C] mb-1">
                  Operational reason
                </label>
                <select
                  value={reason}
                  onChange={(e: any) => setReason(e.target.value)}
                  className="w-full h-8 px-2.5 bg-[#FFFFFF] border border-[#D0D7DE] rounded text-xs text-[#1A202C] focus:outline-none focus:border-[#0F52BA]"
                >
                  <option value="RESTOCK">Supplier restock received</option>
                  <option value="DAMAGE_WRITE_OFF">Warehouse damage / write-off</option>
                  <option value="MANUAL_CORRECTION">Cycle count manual correction</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#D0D7DE]">
                <button
                  type="button"
                  onClick={() => setSelectedProduct(null)}
                  className="px-3 py-1.5 rounded border border-[#D0D7DE] bg-[#FFFFFF] hover:bg-[#F1F3F5] text-xs font-medium text-[#1A202C] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-3 py-1.5 rounded bg-[#0F52BA] hover:bg-[#0C4196] text-white text-xs font-semibold transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? 'Applying change...' : 'Confirm adjustment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
