'use client';

import React from 'react';
import AdminAuditView from '@/components/AdminAuditView';
import { useAdmin } from '../AdminContext';

export default function AdminAuditPage() {
  const {
    auditLogs,
    stockLogs,
    logsLoading,
    refreshLogs,
  } = useAdmin();

  return (
    <div className="space-y-4">
      <AdminAuditView
        auditLogs={auditLogs}
        stockLogs={stockLogs}
        onRefresh={refreshLogs}
        loading={logsLoading}
      />
    </div>
  );
}
