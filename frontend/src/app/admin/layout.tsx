'use client';

import React from 'react';
import RoleGuard from '@/components/RoleGuard';
import { AdminProvider, useAdmin } from './AdminContext';
import AdminSidebar from '@/components/AdminSidebar';
import WorkspaceTopBar from '@/components/WorkspaceTopBar';
import InvoiceModal from '@/components/InvoiceModal';
import { CheckCircle2, AlertCircle } from 'lucide-react';

function AdminShell({ children }: { children: React.ReactNode }) {
  const {
    stockData,
    selectedInvoice,
    isInvoiceOpen,
    invoiceLoading,
    closeInvoice,
    toastMessage,
  } = useAdmin();

  const lowStockCount = stockData?.summary?.lowStockCount || 0;

  return (
    <div className="flex h-screen overflow-hidden bg-[#F1F3F5] text-[#1A202C]">
      {/* Role Navigation Sidebar */}
      <AdminSidebar lowStockCount={lowStockCount} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Read-Only TopBar */}
        <WorkspaceTopBar
          title="Distribution Center Operations"
          subtitle="Inventory controls, global order ledger, and audit compliance"
          badge="Platform Admin Portal"
        />

        {/* Dynamic Page Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {children}
          </div>
        </main>
      </div>

      {/* Commercial Tax Invoice Modal */}
      <InvoiceModal
        isOpen={isInvoiceOpen}
        onClose={closeInvoice}
        invoice={selectedInvoice}
        loading={invoiceLoading}
      />

      {/* Functional Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 px-3.5 py-2.5 rounded border shadow-sm text-xs font-medium bg-[#FFFFFF] border-[#D0D7DE]">
          {toastMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-[#0B6A52] shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-[#A32338] shrink-0" />
          )}
          <span className="text-[#1A202C]">{toastMessage.text}</span>
        </div>
      )}
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard allowedRoles={['ADMIN']}>
      <AdminProvider>
        <AdminShell>{children}</AdminShell>
      </AdminProvider>
    </RoleGuard>
  );
}
