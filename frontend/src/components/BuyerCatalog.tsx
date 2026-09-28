'use client';

import React, { useState } from 'react';
import { Search, ShoppingCart, Check, AlertCircle } from 'lucide-react';

interface BuyerCatalogProps {
  products: any[];
  onAddToCart: (productId: string, qty: number) => Promise<void>;
  loading: boolean;
  userRole: string;
}

const CATEGORIES = [
  'All',
  'Automation',
  'Pneumatics',
  'Hydraulics',
  'Electrical',
  'Mechanical',
  'Instrumentation',
];

export default function BuyerCatalog({
  products,
  onAddToCart,
  loading,
  userRole,
}: BuyerCatalogProps) {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [addingId, setAddingId] = useState<string | null>(null);

  const filteredProducts = products.filter((prod) => {
    const matchesCategory =
      selectedCategory === 'All' || prod.category === selectedCategory;
    const matchesSearch =
      search === '' ||
      prod.name.toLowerCase().includes(search.toLowerCase()) ||
      prod.sku.toLowerCase().includes(search.toLowerCase()) ||
      prod.description?.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getQuantity = (id: string) => quantities[id] || 1;

  const handleQtyChange = (id: string, delta: number, max: number) => {
    const current = getQuantity(id);
    const next = Math.max(1, Math.min(max, current + delta));
    setQuantities((prev) => ({ ...prev, [id]: next }));
  };

  const handleAdd = async (product: any) => {
    const qty = getQuantity(product.id);
    setAddingId(product.id);
    try {
      await onAddToCart(product.id, qty);
      setQuantities((prev) => ({ ...prev, [product.id]: 1 }));
    } finally {
      setAddingId(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Dense Filter & Search Toolbar */}
      <div className="bg-[#FFFFFF] border border-[#D0D7DE] rounded p-3 flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3 w-full md:w-auto flex-1">
          <div className="relative w-full max-w-sm">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#57606A]" />
            <input
              type="text"
              placeholder="Search by SKU, product name, or specification..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-[#FFFFFF] border border-[#D0D7DE] rounded text-xs text-[#1A202C] placeholder-[#8C95A0] focus:outline-none focus:border-[#0F52BA]"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-[#57606A] whitespace-nowrap">
              Category:
            </span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-[#FFFFFF] border border-[#D0D7DE] rounded px-2.5 py-1.5 text-xs text-[#1A202C] focus:outline-none focus:border-[#0F52BA]"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="text-xs font-medium text-[#57606A] tabular-nums self-end md:self-center">
          Showing {filteredProducts.length} of {products.length} catalog items
        </div>
      </div>

      {/* High-Density Data Table */}
      <div className="bg-[#FFFFFF] border border-[#D0D7DE] rounded overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#1A202C]">
            <thead className="bg-[#F8F9FA] text-[#57606A] text-xs font-medium border-b border-[#D0D7DE]">
              <tr>
                <th className="py-2.5 px-3 w-32">SKU code</th>
                <th className="py-2.5 px-3">Item description & specification</th>
                <th className="py-2.5 px-3 w-32">Category</th>
                <th className="py-2.5 px-3 text-right w-28">Unit price</th>
                <th className="py-2.5 px-3 text-right w-28">Warehouse stock</th>
                <th className="py-2.5 px-3 w-40">Availability status</th>
                <th className="py-2.5 px-3 text-right w-48">Procurement action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D0D7DE]">
              {filteredProducts.map((product) => {
                const isOutOfStock = product.stockQty <= 0;
                const isLowStock = product.stockQty > 0 && product.stockQty <= 10;
                const qty = getQuantity(product.id);

                return (
                  <tr
                    key={product.id}
                    className="hover:bg-[#F8F9FA] transition-colors"
                  >
                    {/* SKU */}
                    <td className="py-2.5 px-3 font-mono font-medium text-[#1A202C]">
                      {product.sku}
                    </td>

                    {/* Name & Description */}
                    <td className="py-2.5 px-3">
                      <div className="font-semibold text-[#1A202C]">
                        {product.name}
                      </div>
                      <div className="text-[11px] text-[#57606A] line-clamp-1">
                        {product.description || 'Standard industrial component.'}
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-2.5 px-3 text-[#57606A]">
                      {product.category}
                    </td>

                    {/* Unit Price */}
                    <td className="py-2.5 px-3 text-right font-medium text-[#1A202C] tabular-nums">
                      ${product.price.toFixed(2)}
                    </td>

                    {/* Stock on Hand */}
                    <td className="py-2.5 px-3 text-right font-medium tabular-nums text-[#1A202C]">
                      {product.stockQty}
                    </td>

                    {/* Availability Status */}
                    <td className="py-2.5 px-3">
                      {isOutOfStock ? (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-semibold border bg-[#FDEAEB] text-[#A32338] border-[#ECA1AC]">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#A32338] shrink-0" />
                          <span>Out of stock</span>
                        </span>
                      ) : isLowStock ? (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-semibold border bg-[#FFF6E5] text-[#875200] border-[#E0B34C]">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#875200] shrink-0" />
                          <span>Low stock ({product.stockQty})</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-semibold border bg-[#E2F7EE] text-[#0B6A52] border-[#55C8A6]">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#0B6A52] shrink-0" />
                          <span>In stock</span>
                        </span>
                      )}
                    </td>

                    {/* Quantity & Procurement Button */}
                    <td className="py-2.5 px-3 text-right">
                      {userRole === 'BUYER' ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <div className="flex items-center border border-[#D0D7DE] bg-[#FFFFFF] rounded overflow-hidden">
                            <button
                              disabled={qty <= 1 || isOutOfStock}
                              onClick={() => handleQtyChange(product.id, -1, product.stockQty)}
                              className="px-2 py-1 text-[#57606A] hover:bg-[#E9ECEF] disabled:opacity-30 text-xs font-semibold"
                            >
                              -
                            </button>
                            <span className="px-2 py-1 text-xs font-semibold text-[#1A202C] tabular-nums min-w-[28px] text-center">
                              {qty}
                            </span>
                            <button
                              disabled={qty >= product.stockQty || isOutOfStock}
                              onClick={() => handleQtyChange(product.id, 1, product.stockQty)}
                              className="px-2 py-1 text-[#57606A] hover:bg-[#E9ECEF] disabled:opacity-30 text-xs font-semibold"
                            >
                              +
                            </button>
                          </div>

                          <button
                            disabled={isOutOfStock || addingId === product.id}
                            onClick={() => handleAdd(product)}
                            className="px-3 py-1.5 rounded bg-[#0F52BA] hover:bg-[#0C4196] disabled:bg-[#E9ECEF] disabled:text-[#8C95A0] text-white text-xs font-semibold transition-colors cursor-pointer disabled:cursor-not-allowed whitespace-nowrap"
                          >
                            {addingId === product.id ? 'Adding...' : 'Add to order'}
                          </button>
                        </div>
                      ) : (
                        <span className="text-[11px] text-[#57606A] italic">
                          Catalog view mode
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
