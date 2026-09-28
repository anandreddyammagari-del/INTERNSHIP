'use client';

import React, { useMemo } from 'react';
import { useSales } from '../SalesContext';
import { Building2, CreditCard, DollarSign, CheckCircle2, ShieldAlert } from 'lucide-react';

interface CustomerSummary {
  id: string;
  name: string;
  terms: string;
  creditLimit: number;
  totalOrders: number;
  totalSpend: number;
  pendingCount: number;
  status: 'HEALTHY' | 'REVIEW';
}

export default function SalesCustomersPage() {
  const { orders } = useSales();

  const customers: CustomerSummary[] = useMemo(() => {
    const map = new Map<string, CustomerSummary>();

    // Seed known accounts
    map.set('Apex Industrial Supplies Ltd', {
      id: 'ACC-APEX-01',
      name: 'Apex Industrial Supplies Ltd',
      terms: 'Net 30',
      creditLimit: 50000,
      totalOrders: 0,
      totalSpend: 0,
      pendingCount: 0,
      status: 'HEALTHY',
    });

    map.set('Nexa Global Logistics Corp', {
      id: 'ACC-NEXA-02',
      name: 'Nexa Global Logistics Corp',
      terms: 'Net 60',
      creditLimit: 25000,
      totalOrders: 0,
      totalSpend: 0,
      pendingCount: 0,
      status: 'HEALTHY',
    });

    // Aggregate real orders
    orders.forEach((o) => {
      const companyName = o.company?.name;
      if (companyName && map.has(companyName)) {
        const item = map.get(companyName)!;
        item.totalOrders += 1;
        item.totalSpend += o.totalAmount || 0;
        if (o.status === 'PENDING') {
          item.pendingCount += 1;
        }
      }
    });

    return Array.from(map.values());
  }, [orders]);

  const totalPortfolioSpend = customers.reduce((acc, c) => acc + c.totalSpend, 0);

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="pb-2 border-b border-[#D0D7DE]">
        <h2 className="text-base font-bold text-[#1A202C]">
          Corporate customer accounts & credit ledger
        </h2>
        <p className="text-xs text-[#57606A]">
          Commercial distribution credit limits, terms approval status, and account exposure.
        </p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#FFFFFF] border border-[#D0D7DE] rounded p-4">
          <div className="flex items-center gap-2 text-xs font-medium text-[#57606A] mb-1">
            <Building2 className="w-4 h-4 text-[#0F52BA]" />
            <span>Active corporate accounts</span>
          </div>
          <div className="text-xl font-bold text-[#1A202C] tabular-nums">
            {customers.length}
          </div>
          <div className="text-xs text-[#57606A] mt-1">
            Designated distribution clients
          </div>
        </div>

        <div className="bg-[#FFFFFF] border border-[#D0D7DE] rounded p-4">
          <div className="flex items-center gap-2 text-xs font-medium text-[#57606A] mb-1">
            <DollarSign className="w-4 h-4 text-[#0B6A52]" />
            <span>Total portfolio revenue</span>
          </div>
          <div className="text-xl font-bold text-[#1A202C] tabular-nums">
            ${totalPortfolioSpend.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-xs text-[#57606A] mt-1">
            Gross invoiced order volume
          </div>
        </div>

        <div className="bg-[#FFFFFF] border border-[#D0D7DE] rounded p-4">
          <div className="flex items-center gap-2 text-xs font-medium text-[#57606A] mb-1">
            <CreditCard className="w-4 h-4 text-[#875200]" />
            <span>Aggregate credit facility</span>
          </div>
          <div className="text-xl font-bold text-[#1A202C] tabular-nums">
            $75,000.00
          </div>
          <div className="text-xs text-[#57606A] mt-1">
            Vortex Commercial Credit Facility
          </div>
        </div>
      </div>

      {/* Customer Accounts Table */}
      <div className="bg-[#FFFFFF] border border-[#D0D7DE] rounded overflow-hidden">
        <div className="p-3 border-b border-[#D0D7DE] bg-[#F8F9FA] flex items-center justify-between">
          <span className="text-xs font-semibold text-[#1A202C]">
            Customer account registry
          </span>
          <span className="text-xs font-medium text-[#57606A] tabular-nums">
            {customers.length} verified corporate clients
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#1A202C]">
            <thead className="bg-[#F8F9FA] text-[#57606A] text-xs font-medium border-b border-[#D0D7DE]">
              <tr>
                <th className="py-2.5 px-3 w-36">Account ID</th>
                <th className="py-2.5 px-3">Organization name</th>
                <th className="py-2.5 px-3 w-32">Credit terms</th>
                <th className="py-2.5 px-3 text-right w-32">Credit limit</th>
                <th className="py-2.5 px-3 text-right w-28">Total orders</th>
                <th className="py-2.5 px-3 text-right w-36">Invoiced revenue</th>
                <th className="py-2.5 px-3 w-36">Credit health</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D0D7DE]">
              {customers.map((c) => {
                const utilizationPct = Math.min(100, Math.round((c.totalSpend / c.creditLimit) * 100));

                return (
                  <tr key={c.id} className="hover:bg-[#F8F9FA] transition-colors">
                    <td className="py-2.5 px-3 font-mono font-medium text-[#0F52BA]">
                      {c.id}
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-[#1A202C]">
                      {c.name}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[#57606A]">
                      {c.terms}
                    </td>
                    <td className="py-2.5 px-3 text-right font-medium tabular-nums text-[#1A202C]">
                      ${c.creditLimit.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-2.5 px-3 text-right font-medium tabular-nums text-[#1A202C]">
                      {c.totalOrders}
                    </td>
                    <td className="py-2.5 px-3 text-right font-medium tabular-nums text-[#1A202C]">
                      ${c.totalSpend.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-semibold border bg-[#E2F7EE] text-[#0B6A52] border-[#55C8A6]">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#0B6A52] shrink-0" />
                        <span>Good Standing ({utilizationPct}%)</span>
                      </span>
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
