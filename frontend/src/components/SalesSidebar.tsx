'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import {
  Inbox,
  FileCheck2,
  Users,
  Building2,
  LogOut,
  TrendingUp,
} from 'lucide-react';

interface SalesSidebarProps {
  pendingCount?: number;
}

export default function SalesSidebar({ pendingCount = 0 }: SalesSidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const navItems = [
    {
      href: '/sales/queue',
      label: 'Order approval queue',
      icon: Inbox,
      exact: true,
      badge: pendingCount > 0 ? pendingCount : null,
    },
    {
      href: '/sales/orders',
      label: 'All client orders',
      icon: FileCheck2,
    },
    {
      href: '/sales/customers',
      label: 'Customer accounts & credit',
      icon: Users,
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
              Sales Management Portal
            </div>
          </div>
        </div>

        {/* Navigation Section */}
        <div className="p-3">
          <div className="text-[11px] font-medium text-[#57606A] px-2 py-1 mb-1">
            Accounts & dispatch
          </div>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.exact
                  ? pathname === item.href || pathname === '/sales'
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

                  {item.badge !== null && (
                    <span className="px-1.5 py-0.2 text-[10px] font-bold rounded bg-[#875200] text-[#FFF6E5] tabular-nums">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Account / Identity Card Footer */}
      <div className="p-3 border-t border-[#D0D7DE] bg-[#FFFFFF]">
        <div className="p-3 rounded border border-[#D0D7DE] bg-[#F8F9FA] mb-2">
          {/* User Row */}
          <div className="flex items-center gap-2.5 mb-2">
            <div className="w-7 h-7 rounded-full bg-[#E9ECEF] border border-[#D0D7DE] flex items-center justify-center text-[#1A202C] font-semibold text-xs shrink-0">
              {user?.name ? user.name.slice(0, 2).toUpperCase() : 'SR'}
            </div>
            <div className="truncate flex-1">
              <div className="text-xs font-semibold text-[#1A202C] truncate">
                {user?.name || 'Sales Representative'}
              </div>
              <div className="text-[10px] font-medium text-[#04589C] bg-[#E5F4FF] border border-[#68B2E8] px-1.5 py-0.2 rounded inline-block mt-0.5">
                Sales Rep
              </div>
            </div>
          </div>

          {/* Company Details */}
          {user?.companyName && (
            <div className="pt-2 border-t border-[#D0D7DE]">
              <div className="text-xs text-[#1A202C] flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-[#57606A] shrink-0" />
                <span className="truncate font-medium">{user.companyName}</span>
              </div>
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
