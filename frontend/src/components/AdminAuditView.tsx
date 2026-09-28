'use client';

import React, { useState } from 'react';
import { RefreshCw } from 'lucide-react';

interface AdminAuditViewProps {
  auditLogs: any[];
  stockLogs: any[];
  onRefresh: () => void;
  loading: boolean;
}

export default function AdminAuditView({
  auditLogs,
  stockLogs,
  onRefresh,
  loading,
}: AdminAuditViewProps) {
  const [activeSubTab, setActiveSubTab] = useState<'audit' | 'stock'>('audit');

  return (
    <div className="space-y-4">
      {/* Header and Subtab Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-[#1A202C]">
            Compliance & operational audit ledger
          </h2>
          <p className="text-xs text-[#57606A]">
            Immutable transaction history capturing authentications, stock deltas, and state transitions
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="border border-[#D0D7DE] bg-[#FFFFFF] rounded p-0.5 flex items-center">
            <button
              onClick={() => setActiveSubTab('audit')}
              className={`px-3 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
                activeSubTab === 'audit'
                  ? 'bg-[#0F52BA] text-white font-semibold'
                  : 'text-[#57606A] hover:text-[#1A202C]'
              }`}
            >
              System activity log ({auditLogs.length})
            </button>
            <button
              onClick={() => setActiveSubTab('stock')}
              className={`px-3 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
                activeSubTab === 'stock'
                  ? 'bg-[#0F52BA] text-white font-semibold'
                  : 'text-[#57606A] hover:text-[#1A202C]'
              }`}
            >
              Warehouse stock logs ({stockLogs.length})
            </button>
          </div>

          <button
            onClick={onRefresh}
            className="p-1.5 rounded border border-[#D0D7DE] bg-[#FFFFFF] hover:bg-[#F1F3F5] text-[#1A202C] transition-colors cursor-pointer"
            title="Refresh logs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#0F52BA]' : 'text-[#57606A]'}`} />
          </button>
        </div>
      </div>

      {activeSubTab === 'audit' ? (
        <div className="bg-[#FFFFFF] border border-[#D0D7DE] rounded overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#1A202C]">
              <thead className="bg-[#F8F9FA] text-[#57606A] text-xs font-medium border-b border-[#D0D7DE]">
                <tr>
                  <th className="py-2.5 px-3 w-48">Timestamp</th>
                  <th className="py-2.5 px-3 w-56">Operator / role</th>
                  <th className="py-2.5 px-3 w-36">Action</th>
                  <th className="py-2.5 px-3 w-32">Entity</th>
                  <th className="py-2.5 px-3">Transaction payload</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D0D7DE]">
                {auditLogs.map((log) => {
                  const rawDate = log.timestamp || log.createdAt;
                  const date = rawDate
                    ? new Date(rawDate).toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      })
                    : 'Recorded';

                  const actor = log.actor || log.user;
                  const detailsText =
                    typeof log.details === 'string'
                      ? log.details
                      : log.details
                      ? JSON.stringify(log.details)
                      : 'N/A';

                  return (
                    <tr key={log.id} className="hover:bg-[#F8F9FA] transition-colors">
                      <td className="py-2.5 px-3 font-mono text-[#57606A] tabular-nums whitespace-nowrap">
                        {date}
                      </td>
                      <td className="py-2.5 px-3 font-medium text-[#1A202C]">
                        <div>{actor?.name || actor?.email || 'System Daemon'}</div>
                        <div className="text-[10px] text-[#57606A] font-mono">{actor?.role || 'SYSTEM'}</div>
                      </td>
                      <td className="py-2.5 px-3 font-mono font-semibold text-[#0F52BA]">
                        {log.action}
                      </td>
                      <td className="py-2.5 px-3 font-medium text-[#57606A]">
                        {log.entity}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-[11px] text-[#57606A] break-all">
                        {detailsText}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-[#FFFFFF] border border-[#D0D7DE] rounded overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#1A202C]">
              <thead className="bg-[#F8F9FA] text-[#57606A] text-xs font-medium border-b border-[#D0D7DE]">
                <tr>
                  <th className="py-2.5 px-3 w-48">Timestamp</th>
                  <th className="py-2.5 px-3 w-32">SKU code</th>
                  <th className="py-2.5 px-3">Product description</th>
                  <th className="py-2.5 px-3 text-right w-28">Delta units</th>
                  <th className="py-2.5 px-3 w-48">Operational reason</th>
                  <th className="py-2.5 px-3 w-36">Reference ID</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D0D7DE]">
                {stockLogs.map((log) => {
                  const rawDate = log.createdAt || log.timestamp;
                  const date = rawDate
                    ? new Date(rawDate).toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      })
                    : 'Recorded';

                  const isPositive = log.delta > 0;

                  return (
                    <tr key={log.id} className="hover:bg-[#F8F9FA] transition-colors">
                      <td className="py-2.5 px-3 font-mono text-[#57606A] tabular-nums whitespace-nowrap">
                        {date}
                      </td>
                      <td className="py-2.5 px-3 font-mono font-medium text-[#1A202C]">
                        {log.product?.sku || 'N/A'}
                      </td>
                      <td className="py-2.5 px-3 font-medium text-[#1A202C]">
                        {log.product?.name || 'N/A'}
                      </td>
                      <td
                        className={`py-2.5 px-3 text-right font-bold tabular-nums ${
                          isPositive ? 'text-[#0B6A52]' : 'text-[#A32338]'
                        }`}
                      >
                        {isPositive ? `+${log.delta}` : log.delta}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-[11px] text-[#57606A]">
                        {log.reason}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-[11px] text-[#57606A]">
                        {log.refOrderId ? log.refOrderId.slice(0, 8) + '...' : 'Direct intake'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
