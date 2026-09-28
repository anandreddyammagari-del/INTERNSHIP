'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, getRoleHomeRoute } from '@/lib/auth-context';
import { Loader2 } from 'lucide-react';

export default function RootPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (user) {
        router.replace(getRoleHomeRoute(user.role));
      } else {
        router.replace('/login');
      }
    }
  }, [user, isLoading, router]);

  return (
    <div className="min-h-screen bg-[#F1F3F5] flex items-center justify-center p-6 select-none">
      <div className="bg-[#FFFFFF] border border-[#D0D7DE] rounded p-6 shadow-none flex items-center gap-3">
        <Loader2 className="w-5 h-5 text-[#0F52BA] animate-spin shrink-0" />
        <div className="text-xs font-medium text-[#1A202C]">
          Routing to authorized workspace...
        </div>
      </div>
    </div>
  );
}
