'use client';

import React from 'react';
import {
  Package,
  ShoppingCart,
  FileText,
  Boxes,
  Layers,
  LogOut,
  Building2,
  User,
  Shield,
  Truck,
} from 'lucide-react';

interface SidebarProps {
  user: any;
  currentTab: string;
  onTabChange: (tab: string) => void;
  cartCount: number;
  onOpenCart: () => void;
  onLogout: () => void;
}

export default function Sidebar({
  user,
  currentTab,
  onTabChange,
  cartCount,
  onOpenCart,
  onLogout,
}: SidebarProps) {
  const isBuyer = user?.role === 'BUYER';
  const isSalesRep = user?.role === 'SALES_REP';
  const isAdmin = user?.role === 'ADMIN';

  const navItems = [
    {
      id: 'catalog',
      label: 'Product Catalog',
      icon: Package,
      visible: true,
      badge: null,
    },
    {
      id: 'cart',
      label: 'Purchase Cart',
      icon: ShoppingCart,
      visible: isBuyer,
      badge: cartCount > 0 ? cartCount : null,
      onClick: onOpenCart,
    },
    {
      id: 'orders',
      label: isBuyer ? 'Order Register' : 'Order Fulfillment',
      icon: FileText,
      visible: true,
      badge: null,
    },
    {
      id: 'stock',
      label: 'Inventory Control',
      icon: Boxes,
      visible: isAdmin || isSalesRep,
      badge: null,
    },
    {
      id: 'audit',
      label: 'Compliance & Audit',
      icon: Layers,
      visible: isAdmin,
      badge: null,
    },
  ];

  return (
    <aside className="w-60 bg-[#E9ECEF] border-r border-[#D0D7DE] flex flex-col justify-between shrink-0 h-screen sticky top-0 select-none">
      {/* Brand Header */}
      <div>
        <div className="h-14 px-4 border-b border-[#D0D7DE] flex items-center gap-2.5 bg-[#FFFFFF]">
          <div className="w-8 h-8 rounded bg-[#1A202C] text-white flex items-center justify-center font-bold text-sm tracking-wider">
            VL
          </div>
          <div>
            <div className="font-bold text-xs text-[#1A202C] uppercase tracking-wide">
              Vortex Logistics
            </div>
            <div className="text-[10px] text-[#5E6C84] font-medium">
              B2B Operations Console
            </div>
          </div>
        </div>

        {/* Navigation Section */}
        <div className="p-3">
          <div className="text-[10px] font-semibold text-[#5E6C84] uppercase tracking-wider px-2 py-1 mb-1">
            Operations
          </div>
          <nav className="space-y-0.5">
            {navItems
              .filter((item) => item.visible)
              .map((item) => {
                const Icon = item.icon;
                const isActive = currentTab === item.id && item.id !== 'cart';

                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      if (item.onClick) {
                        item.onClick();
                      } else {
                        onTabChange(item.id);
                      }
                    }}
                    className={`w-full px-2.5 py-2 rounded text-xs font-medium flex items-center justify-between transition-colors text-left ${
                      isActive
                        ? 'bg-[#FFFFFF] text-[#0F52BA] font-semibold shadow-[inset_3px_0_0_0_#0F52BA] border border-[#D0D7DE]'
                        : 'text-[#1A202C] hover:bg-[#DEE2E6]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-[#0F52BA]' : 'text-[#5E6C84]'}`} />
                      <span>{item.label}</span>
                    </div>

                    {item.badge !== null && (
                      <span className="px-1.5 py-0.2 text-[10px] font-bold rounded bg-[#0F52BA] text-white tabular-nums">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
          </nav>
        </div>
      </div>

      {/* Operator Session Footer */}
      <div className="p-3 border-t border-[#D0D7DE] bg-[#FFFFFF]">
        <div className="p-2.5 rounded border border-[#D0D7DE] bg-[#F8F9FA] mb-2">
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-6 h-6 rounded-full bg-[#E9ECEF] border border-[#D0D7DE] flex items-center justify-center text-[#1A202C]">
              <User className="w-3.5 h-3.5" />
            </div>
            <div className="truncate">
              <div className="text-xs font-semibold text-[#1A202C] truncate">
                {user?.name || 'Authorized Operator'}
              </div>
              <div className="text-[10px] text-[#5E6C84] uppercase font-bold tracking-tight">
                {user?.role || 'OPERATOR'}
              </div>
            </div>
          </div>

          {user?.companyName && (
            <div className="text-[11px] text-[#1A202C] flex items-center gap-1.5 pt-1.5 border-t border-[#D0D7DE]">
              <Building2 className="w-3.5 h-3.5 text-[#5E6C84] shrink-0" />
              <span className="truncate font-medium">{user.companyName}</span>
            </div>
          )}
          {user?.creditTerms && (
            <div className="text-[10px] text-[#5E6C84] pl-5 font-mono">
              Credit: {user.creditTerms}
            </div>
          )}
        </div>

        <button
          onClick={onLogout}
          className="w-full px-2.5 py-1.5 rounded border border-[#D0D7DE] hover:bg-[#F1F3F5] text-xs font-medium text-[#5E6C84] hover:text-[#B91C1C] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Terminate Session</span>
        </button>
      </div>
    </aside>
  );
}
