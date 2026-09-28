'use client';

import React from 'react';
import { useAuth } from '@/lib/auth-context';
import { Building2, User, LogOut, Shield } from 'lucide-react';

interface WorkspaceTopBarProps {
  title: string;
  subtitle?: string;
  badge?: string;
}

export default function WorkspaceTopBar({
  title,
  subtitle,
  badge,
}: WorkspaceTopBarProps) {
  const { user, logout } = useAuth();

  return (
    <header className="h-14 bg-[#FFFFFF] border-b border-[#D0D7DE] px-6 flex items-center justify-between shrink-0 select-none">
      {/* Title & Context */}
      <div className="flex items-center gap-3">
        <h1 className="text-sm font-semibold text-[#1A202C] tracking-tight">
          {title}
        </h1>
        {badge && (
          <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-[#F1F3F5] text-[#57606A] border border-[#D0D7DE]">
            {badge}
          </span>
        )}
        {subtitle && (
          <>
            <span className="w-px h-4 bg-[#D0D7DE] hidden sm:inline-block" />
            <span className="text-xs text-[#57606A] hidden sm:inline">
              {subtitle}
            </span>
          </>
        )}
      </div>

      {/* Static Authenticated Identity & Sign Out */}
      <div className="flex items-center gap-4">
        {/* Read-Only Identity Card */}
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded bg-[#F8F9FA] border border-[#D0D7DE]">
            <div className="w-5 h-5 rounded-full bg-[#E9ECEF] border border-[#D0D7DE] flex items-center justify-center text-[#1A202C] font-semibold text-[10px] shrink-0">
              {user?.name ? user.name.slice(0, 2).toUpperCase() : 'OP'}
            </div>
            <div className="flex flex-col text-left">
              <div className="font-semibold text-[#1A202C] leading-none">
                {user?.name || 'Operator'}
              </div>
              <div className="text-[10px] text-[#57606A] leading-tight font-medium mt-0.5">
                {user?.role === 'BUYER'
                  ? 'Procurement Agent'
                  : user?.role === 'SALES_REP'
                  ? 'Sales Representative'
                  : 'System Administrator'}
              </div>
            </div>

            {user?.companyName && (
              <div className="hidden md:flex items-center gap-1.5 pl-3 border-l border-[#D0D7DE]">
                <Building2 className="w-3.5 h-3.5 text-[#57606A] shrink-0" />
                <span className="font-medium text-[#1A202C] truncate max-w-[160px]">
                  {user.companyName}
                </span>
                {user.creditTerms && (
                  <span className="px-1.5 py-0.5 rounded bg-[#FFFFFF] border border-[#D0D7DE] text-[10px] text-[#57606A] font-mono">
                    {user.creditTerms}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Real Sign Out Action */}
        <button
          onClick={() => logout()}
          title="Sign out of current workspace"
          className="h-8 px-3 rounded border border-[#D0D7DE] bg-[#FFFFFF] hover:bg-[#FDEAEB] text-[#57606A] hover:text-[#A32338] hover:border-[#ECA1AC] text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Sign out</span>
        </button>
      </div>
    </header>
  );
}
