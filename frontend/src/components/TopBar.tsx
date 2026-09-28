'use client';

import React from 'react';
import { Building, ShieldCheck, ChevronDown, Activity, Cpu } from 'lucide-react';

interface TopBarProps {
  currentUser: any;
  onSelectPersona: (email: string, pass: string) => void;
  loading: boolean;
  currentTab: string;
}

export default function TopBar({
  currentUser,
  onSelectPersona,
  loading,
  currentTab,
}: TopBarProps) {
  const tenants = [
    {
      id: 'apex',
      label: 'Apex Industrial Supplies Ltd',
      sublabel: 'Procurement Lead (Net 30)',
      email: 'buyer@apexcorp.com',
      pass: 'Buyer123!',
      role: 'BUYER',
    },
    {
      id: 'nexa',
      label: 'Nexa Global Logistics Corp',
      sublabel: 'Purchasing Agent (Net 60)',
      email: 'buyer@nexa.com',
      pass: 'Buyer123!',
      role: 'BUYER',
    },
    {
      id: 'sales',
      label: 'Vortex Central Wholesale',
      sublabel: 'Senior Sales Representative',
      email: 'sales@distributor.com',
      pass: 'Sales123!',
      role: 'SALES_REP',
    },
    {
      id: 'admin',
      label: 'Vortex Headquarters DC-01',
      sublabel: 'Operations Director (Admin)',
      email: 'admin@distributor.com',
      pass: 'Admin123!',
      role: 'ADMIN',
    },
  ];

  const currentTenant = tenants.find((t) => t.email === currentUser?.email) || tenants[0];

  const getModuleTitle = (tab: string) => {
    switch (tab) {
      case 'catalog':
        return 'Product Catalog & Inventory Ingestion';
      case 'orders':
        return currentUser?.role === 'BUYER' ? 'Purchase Order Register' : 'Order Fulfillment Ledger';
      case 'stock':
        return 'Warehouse Stock & Inventory Valuation';
      case 'audit':
        return 'Compliance Trail & Warehouse Stock Logs';
      default:
        return 'Operations Console';
    }
  };

  return (
    <header className="h-14 bg-[#FFFFFF] border-b border-[#D0D7DE] px-5 flex items-center justify-between shrink-0 select-none">
      {/* Current Module Breadcrumb / Title */}
      <div className="flex items-center gap-3">
        <h1 className="text-sm font-bold text-[#1A202C] tracking-tight">
          {getModuleTitle(currentTab)}
        </h1>
        <span className="hidden sm:inline-block w-px h-4 bg-[#D0D7DE]" />
        <div className="hidden sm:flex items-center gap-1.5 text-xs text-[#5E6C84]">
          <span className="w-2 h-2 rounded-full bg-[#15803D]" />
          <span>Facility: DC-01 Central Terminal</span>
        </div>
      </div>

      {/* Workplace Environment / Tenant Switcher */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-[#5E6C84] hidden md:inline">
            Active Tenant:
          </label>
          <div className="relative">
            <select
              value={currentUser?.email || ''}
              disabled={loading}
              onChange={(e) => {
                const target = tenants.find((t) => t.email === e.target.value);
                if (target) {
                  onSelectPersona(target.email, target.pass);
                }
              }}
              className="appearance-none bg-[#F8F9FA] hover:bg-[#F1F3F5] border border-[#D0D7DE] rounded px-3 py-1.5 pr-8 text-xs font-medium text-[#1A202C] focus:outline-none focus:border-[#0F52BA] cursor-pointer disabled:opacity-50"
            >
              {tenants.map((t) => (
                <option key={t.email} value={t.email}>
                  {t.label} — {t.sublabel}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-[#5E6C84] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded border border-[#D0D7DE] bg-[#F8F9FA] text-[11px] text-[#5E6C84]">
          <Activity className="w-3 h-3 text-[#15803D]" />
          <span>API 4000: Live</span>
        </div>
      </div>
    </header>
  );
}
