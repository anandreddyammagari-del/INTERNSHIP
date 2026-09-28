import React from 'react';

export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'FULFILLED' | 'CANCELLED' | string;

interface StatusBadgeProps {
  status: OrderStatus;
  className?: string;
}

export default function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  const norm = (status || '').toUpperCase();

  switch (norm) {
    case 'PENDING':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-semibold tracking-normal border bg-[#FFF6E5] text-[#875200] border-[#E0B34C] select-none ${className}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#875200] shrink-0" />
          <span>Pending approval</span>
        </span>
      );
    case 'CONFIRMED':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-semibold tracking-normal border bg-[#E5F4FF] text-[#04589C] border-[#68B2E8] select-none ${className}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#04589C] shrink-0" />
          <span>Confirmed</span>
        </span>
      );
    case 'FULFILLED':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-semibold tracking-normal border bg-[#E2F7EE] text-[#0B6A52] border-[#55C8A6] select-none ${className}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#0B6A52] shrink-0" />
          <span>Fulfilled</span>
        </span>
      );
    case 'CANCELLED':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-semibold tracking-normal border bg-[#FDEAEB] text-[#A32338] border-[#ECA1AC] select-none ${className}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#A32338] shrink-0" />
          <span>Cancelled</span>
        </span>
      );
    default:
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium border bg-[#F1F3F5] text-[#475569] border-[#CBD5E1] select-none ${className}`}
        >
          <span>{status}</span>
        </span>
      );
  }
}
