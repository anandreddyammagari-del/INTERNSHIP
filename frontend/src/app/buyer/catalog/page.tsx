'use client';

import React, { useState, useEffect } from 'react';
import BuyerCatalog from '@/components/BuyerCatalog';
import { api } from '@/lib/api';
import { useBuyer } from '../BuyerContext';
import { useAuth } from '@/lib/auth-context';
import { Loader2 } from 'lucide-react';

export default function BuyerCatalogPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useBuyer();
  const { user } = useAuth();

  useEffect(() => {
    const fetchCatalog = async () => {
      try {
        setLoading(true);
        const data = await api.getProducts();
        setProducts(data);
      } catch (err) {
        console.error('Failed to load products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCatalog();
  }, []);

  if (loading && products.length === 0) {
    return (
      <div className="bg-[#FFFFFF] border border-[#D0D7DE] rounded p-8 flex items-center justify-center gap-3">
        <Loader2 className="w-5 h-5 text-[#0F52BA] animate-spin shrink-0" />
        <span className="text-xs font-medium text-[#1A202C]">
          Loading wholesale distribution catalog...
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Page Header Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[#D0D7DE]">
        <div>
          <h2 className="text-base font-bold text-[#1A202C]">
            Product catalog & pricing
          </h2>
          <p className="text-xs text-[#57606A]">
            Direct wholesale requisition for {user?.companyName || 'your organization'}. Tier discount pricing applied.
          </p>
        </div>
      </div>

      {/* Catalog Table */}
      <BuyerCatalog
        products={products}
        onAddToCart={addToCart}
        loading={loading}
        userRole="BUYER"
      />
    </div>
  );
}
