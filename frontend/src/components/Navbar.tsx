'use client';

import React from 'react';
import {
  Boxes,
  ShoppingCart,
  FileText,
  Package,
  Layers,
  LogOut,
  Building,
  User,
} from 'lucide-react';

interface NavbarProps {
  user: any;
  currentTab: string;
  onTabChange: (tab: string) => void;
  cartCount: number;
  onOpenCart: () => void;
  onLogout: () => void;
}

export default function Navbar({
  user,
  currentTab,
  onTabChange,
  cartCount,
  onOpenCart,
  onLogout,
}: NavbarProps) {
  const isBuyer = user?.role === 'BUYER';
  const isSalesRep = user?.role === 'SALES_REP';
  const isAdmin = user?.role === 'ADMIN';

  return (
    <header className="bg-slate-900/90 backdrop-blur-md border-b border-slate-800 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-500 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20">
            <Boxes className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg text-white tracking-tight">VORTEX</span>
              <span className="text-xs uppercase px-2 py-0.5 rounded-full font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                B2B Distribution
              </span>
            </div>
            <p className="text-xs text-slate-400">Arrowstack Internship • Project 1</p>
          </div>
        </div>

        {/* Navigation Tabs based on Role */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-950/60 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => onTabChange('catalog')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-2 ${
              currentTab === 'catalog'
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Package className="w-4 h-4" />
            Product Catalog
          </button>

          <button
            onClick={() => onTabChange('orders')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-2 ${
              currentTab === 'orders'
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <FileText className="w-4 h-4" />
            {isBuyer ? 'My Orders & Invoices' : 'Order Processing'}
          </button>

          {(isAdmin || isSalesRep) && (
            <button
              onClick={() => onTabChange('stock')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-2 ${
                currentTab === 'stock'
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Boxes className="w-4 h-4" />
              Stock & Inventory
            </button>
          )}

          {isAdmin && (
            <button
              onClick={() => onTabChange('audit')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-2 ${
                currentTab === 'audit'
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Layers className="w-4 h-4" />
              Audit Trail & Logs
            </button>
          )}
        </nav>

        {/* User Info & Actions */}
        <div className="flex items-center gap-3">
          {isBuyer && (
            <button
              onClick={onOpenCart}
              className="relative p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition-all border border-slate-700 flex items-center gap-2"
              title="View Cart"
            >
              <ShoppingCart className="w-5 h-5 text-cyan-400" />
              <span className="text-xs font-medium hidden sm:inline">Cart</span>
              {cartCount > 0 && (
                <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-cyan-500 text-white">
                  {cartCount}
                </span>
              )}
            </button>
          )}

          <div className="hidden lg:flex flex-col items-end text-right border-l border-slate-800 pl-3">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-200">
              <User className="w-3.5 h-3.5 text-slate-400" />
              <span>{user?.name || user?.email}</span>
            </div>
            {user?.companyName && (
              <div className="flex items-center gap-1 text-[11px] text-cyan-400">
                <Building className="w-3 h-3" />
                <span>{user.companyName} ({user.creditTerms || 'Net 30'})</span>
              </div>
            )}
          </div>

          <button
            onClick={onLogout}
            className="p-2 rounded-xl bg-slate-800 hover:bg-red-950/40 text-slate-400 hover:text-red-400 transition-all border border-slate-700"
            title="Log out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
