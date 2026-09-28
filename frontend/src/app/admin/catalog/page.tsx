'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Search, FolderKanban, Loader2, CheckCircle2 } from 'lucide-react';

export default function AdminCatalogPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchCatalog = async () => {
    try {
      setLoading(true);
      const data = await api.getProducts({ includeInactive: true });
      setProducts(data);
    } catch (err) {
      console.error('Failed to load master catalog:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCatalog();
  }, []);

  const filtered = products.filter(
    (p) =>
      p.sku.toLowerCase().includes(search.toLowerCase()) ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Title */}
      <div className="pb-2 border-b border-[#D0D7DE]">
        <h2 className="text-base font-bold text-[#1A202C]">
          Master product catalog & specification registry
        </h2>
        <p className="text-xs text-[#57606A]">
          Central distribution product directory, technical specifications, and baseline wholesale pricing.
        </p>
      </div>

      {/* Toolbar */}
      <div className="bg-[#FFFFFF] border border-[#D0D7DE] rounded p-3 flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full max-w-sm">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#57606A]" />
          <input
            type="text"
            placeholder="Search by SKU, product name, or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-[#FFFFFF] border border-[#D0D7DE] rounded text-xs text-[#1A202C] placeholder-[#8C95A0] focus:outline-none focus:border-[#0F52BA]"
          />
        </div>
        <div className="text-xs font-medium text-[#57606A] tabular-nums">
          {filtered.length} master SKUs registered
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#FFFFFF] border border-[#D0D7DE] rounded overflow-hidden">
        {loading ? (
          <div className="py-12 text-center flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 text-[#0F52BA] animate-spin" />
            <span className="text-xs text-[#57606A]">Loading catalog directory...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#1A202C]">
              <thead className="bg-[#F8F9FA] text-[#57606A] text-xs font-medium border-b border-[#D0D7DE]">
                <tr>
                  <th className="py-2.5 px-3 w-32">SKU code</th>
                  <th className="py-2.5 px-3">Product name & specification</th>
                  <th className="py-2.5 px-3 w-32">Category</th>
                  <th className="py-2.5 px-3 text-right w-28">Base price</th>
                  <th className="py-2.5 px-3 text-right w-28">Stock on hand</th>
                  <th className="py-2.5 px-3 w-32">Catalog status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D0D7DE]">
                {filtered.map((prod) => (
                  <tr key={prod.id} className="hover:bg-[#F8F9FA] transition-colors">
                    <td className="py-2.5 px-3 font-mono font-medium text-[#1A202C]">
                      {prod.sku}
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="font-semibold text-[#1A202C]">{prod.name}</div>
                      <div className="text-[11px] text-[#57606A] line-clamp-1">{prod.description}</div>
                    </td>
                    <td className="py-2.5 px-3 text-[#57606A]">{prod.category}</td>
                    <td className="py-2.5 px-3 text-right font-medium tabular-nums text-[#1A202C]">
                      ${prod.price.toFixed(2)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-medium tabular-nums text-[#1A202C]">
                      {prod.stockQty}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-semibold border bg-[#E2F7EE] text-[#0B6A52] border-[#55C8A6]">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#0B6A52] shrink-0" />
                        <span>Active</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
