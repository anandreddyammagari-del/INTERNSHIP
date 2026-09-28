'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import {
  Package,
  ShoppingCart,
  FileText,
  Receipt,
  Building2,
  LogOut,
  CreditCard,
} from 'lucide-react';

interface BuyerSidebarProps {
  cartCount?: number;
  onOpenCart?: () => void;
}

export default function BuyerSidebar({
  cartCount = 0,
  onOpenCart,
}: BuyerSidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const navItems = [
    {
      href: '/buyer/catalog',
      label: 'Catalog & ordering',
      icon: Package,
      exact: true,
    },
    {
      href: '/buyer/orders',
      label: 'My orders',
      icon: FileText,
    },
    {
      href: '/buyer/invoices',
      label: 'Credit & invoices',
      icon: Receipt,
    },
  ];

  return (
    <aside className="w-64 bg-[#E9ECEF] border-r border-[#D0D7DE] flex flex-col justify-between shrink-0 h-screen sticky top-0 select-none">
      {/* Brand Header */}
      <div>
        <div className="h-14 px-4 border-b border-[#D0D7DE] flex items-center gap-2.5 bg-[#FFFFFF]">
          <div className="w-8 h-8 rounded bg-[#1A202C] text-white flex items-center justify-center font-bold text-xs tracking-wider">
            VL
          </div>
          <div>
            <div className="font-bold text-xs text-[#1A202C] tracking-tight">
              Vortex Logistics
            </div>
            <div className="text-[10px] text-[#57606A] font-medium">
              Buyer Procurement Workspace
            </div>
          </div>
        </div>

        {/* Navigation Section */}
        <div className="p-3">
          <div className="text-[11px] font-medium text-[#57606A] px-2 py-1 mb-1">
            Requisition & billing
          </div>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.exact
                  ? pathname === item.href || pathname === '/buyer'
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`w-full px-3 py-2 rounded text-xs font-medium flex items-center justify-between transition-colors ${
                    isActive
                      ? 'bg-[#FFFFFF] text-[#0F52BA] font-semibold border border-[#D0D7DE] shadow-none'
                      : 'text-[#1A202C] hover:bg-[#DEE2E6]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon
                      className={`w-4 h-4 ${
                        isActive ? 'text-[#0F52BA]' : 'text-[#57606A]'
                      }`}
                    />
                    <span>{item.label}</span>
                  </div>
                </Link>
              );
            })}

            {/* Quick Cart Trigger */}
            {onOpenCart && (
              <button
                type="button"
                onClick={onOpenCart}
                className="w-full px-3 py-2 rounded text-xs font-medium flex items-center justify-between transition-colors text-left text-[#1A202C] hover:bg-[#DEE2E6] cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <ShoppingCart className="w-4 h-4 text-[#57606A]" />
                  <span>Purchase cart</span>
                </div>
                {cartCount > 0 && (
                  <span className="px-1.5 py-0.2 text-[10px] font-bold rounded bg-[#0F52BA] text-white tabular-nums">
                    {cartCount}
                  </span>
                )}
              </button>
            )}
          </nav>
        </div>
      </div>

      {/* Account / Identity Card Footer */}
      <div className="p-3 border-t border-[#D0D7DE] bg-[#FFFFFF]">
        <div className="p-3 rounded border border-[#D0D7DE] bg-[#F8F9FA] mb-2">
          {/* User Row */}
          <div className="flex items-center gap-2.5 mb-2">
            <div className="w-7 h-7 rounded-full bg-[#E9ECEF] border border-[#D0D7DE] flex items-center justify-center text-[#1A202C] font-semibold text-xs shrink-0">
              {user?.name ? user.name.slice(0, 2).toUpperCase() : 'BY'}
            </div>
            <div className="truncate flex-1">
              <div className="text-xs font-semibold text-[#1A202C] truncate">
                {user?.name || 'Buyer Agent'}
              </div>
              <div className="text-[10px] font-medium text-[#875200] bg-[#FFF6E5] border border-[#E0B34C] px-1.5 py-0.2 rounded inline-block mt-0.5">
                Buyer
              </div>
            </div>
          </div>

          {/* Company Details */}
          {user?.companyName && (
            <div className="pt-2 border-t border-[#D0D7DE] space-y-1">
              <div className="text-xs text-[#1A202C] flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-[#57606A] shrink-0" />
                <span className="truncate font-medium">{user.companyName}</span>
              </div>
              {user.creditTerms && (
                <div className="text-[11px] text-[#57606A] flex items-center gap-1.5 font-mono">
                  <CreditCard className="w-3.5 h-3.5 text-[#57606A] shrink-0" />
                  <span>Terms: {user.creditTerms}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sign Out Action */}
        <button
          onClick={() => logout()}
          className="w-full px-2.5 py-1.5 rounded border border-[#D0D7DE] hover:bg-[#FDEAEB] text-xs font-medium text-[#57606A] hover:text-[#A32338] hover:border-[#ECA1AC] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign out</span>
        </button>
      </div>
    </aside>
  );
}
