'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, getRoleHomeRoute, User } from '@/lib/auth-context';
import { ShieldAlert, Loader2 } from 'lucide-react';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles?: ('BUYER' | 'SALES_REP' | 'ADMIN')[];
}

export default function RoleGuard({ children, allowedRoles }: RoleGuardProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.replace('/login');
      } else if (allowedRoles && !allowedRoles.includes(user.role)) {
        // Redirect to user's assigned role workspace if unauthorized for current path
        router.replace(getRoleHomeRoute(user.role));
      }
    }
  }, [user, isLoading, allowedRoles, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F1F3F5] flex items-center justify-center p-6 select-none">
        <div className="bg-[#FFFFFF] border border-[#D0D7DE] rounded p-6 shadow-none flex items-center gap-3">
          <Loader2 className="w-5 h-5 text-[#0F52BA] animate-spin shrink-0" />
          <div className="text-xs font-medium text-[#1A202C]">
            Verifying operator credentials and workspace security...
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <div className="min-h-screen bg-[#F1F3F5] flex items-center justify-center p-6 select-none">
        <div className="bg-[#FFFFFF] border border-[#D0D7DE] rounded p-6 max-w-md w-full">
          <div className="flex items-center gap-2 text-[#A32338] mb-2">
            <ShieldAlert className="w-5 h-5 shrink-0" />
            <span className="text-xs font-bold uppercase tracking-wider">Access Restricted</span>
          </div>
          <p className="text-xs text-[#5E6C84] mb-4">
            Your role (<strong className="text-[#1A202C]">{user.role}</strong>) does not have authorization to view this workspace. Redirecting to your assigned workspace...
          </p>
          <div className="w-full bg-[#E9ECEF] h-1 rounded overflow-hidden">
            <div className="bg-[#0F52BA] h-full animate-pulse" style={{ width: '100%' }} />
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
