'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import {
  Boxes,
  FileSpreadsheet,
  Layers,
  Building2,
  LogOut,
  FolderKanban,
} from 'lucide-react';

interface AdminSidebarProps {
  lowStockCount?: number;
}

export default function AdminSidebar({ lowStockCount = 0 }: AdminSidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const navItems = [
    {
      href: '/admin/inventory',
      label: 'Stock & inventory',
      icon: Boxes,
      exact: true,
      badge: lowStockCount > 0 ? lowStockCount : null,
    },
    {
      href: '/admin/orders',
      label: 'Global order ledger',
      icon: FileSpreadsheet,
    },
    {
      href: '/admin/catalog',
      label: 'Catalog management',
      icon: FolderKanban,
    },
    {
      href: '/admin/audit',
      label: 'System audit logs',
      icon: Layers,
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
              Distribution Center Ops
            </div>
          </div>
        </div>

        {/* Navigation Section */}
        <div className="p-3">
          <div className="text-[11px] font-medium text-[#57606A] px-2 py-1 mb-1">
            Warehouse management
          </div>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.exact
                  ? pathname === item.href || pathname === '/admin'
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
              {user?.name ? user.name.slice(0, 2).toUpperCase() : 'AD'}
            </div>
            <div className="truncate flex-1">
              <div className="text-xs font-semibold text-[#1A202C] truncate">
                {user?.name || 'Administrator'}
              </div>
              <div className="text-[10px] font-medium text-[#0B6A52] bg-[#E2F7EE] border border-[#55C8A6] px-1.5 py-0.2 rounded inline-block mt-0.5">
                Admin
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
