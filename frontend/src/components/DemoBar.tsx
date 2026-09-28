'use client';

import React from 'react';
import { UserCheck, ShieldAlert, ShoppingBag, Briefcase } from 'lucide-react';

interface DemoBarProps {
  currentUser: any;
  onSelectPersona: (email: string, pass: string) => void;
  loading: boolean;
}

export default function DemoBar({ currentUser, onSelectPersona, loading }: DemoBarProps) {
  const personas = [
    {
      label: 'Buyer @ Apex Corp',
      role: 'BUYER',
      email: 'buyer@apexcorp.com',
      pass: 'Buyer123!',
      company: 'Apex Industrial',
      icon: ShoppingBag,
      color: 'bg-emerald-600/20 text-emerald-400 border-emerald-500/30 hover:bg-emerald-600/30',
      activeColor: 'bg-emerald-600 text-white border-emerald-400',
    },
    {
      label: 'Buyer @ Nexa Logistics',
      role: 'BUYER',
      email: 'buyer@nexa.com',
      pass: 'Buyer123!',
      company: 'Nexa Global',
      icon: ShoppingBag,
      color: 'bg-teal-600/20 text-teal-400 border-teal-500/30 hover:bg-teal-600/30',
      activeColor: 'bg-teal-600 text-white border-teal-400',
    },
    {
      label: 'Senior Sales Rep',
      role: 'SALES_REP',
      email: 'sales@distributor.com',
      pass: 'Sales123!',
      company: 'Distributor HQ',
      icon: Briefcase,
      color: 'bg-blue-600/20 text-blue-400 border-blue-500/30 hover:bg-blue-600/30',
      activeColor: 'bg-blue-600 text-white border-blue-400',
    },
    {
      label: 'Operations Admin',
      role: 'ADMIN',
      email: 'admin@distributor.com',
      pass: 'Admin123!',
      company: 'Distributor HQ',
      icon: ShieldAlert,
      color: 'bg-purple-600/20 text-purple-400 border-purple-500/30 hover:bg-purple-600/30',
      activeColor: 'bg-purple-600 text-white border-purple-400',
    },
  ];

  return (
    <div className="bg-slate-900 border-b border-slate-800 px-4 py-2 text-xs">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-slate-400">
          <UserCheck className="w-4 h-4 text-cyan-400" />
          <span className="font-semibold text-slate-200">Evaluation Role Switcher:</span>
          <span className="text-slate-500 hidden sm:inline">1-Click persona for Arrowstack mentor review:</span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {personas.map((p) => {
            const Icon = p.icon;
            const isActive = currentUser?.email === p.email;
            return (
              <button
                key={p.email}
                disabled={loading}
                onClick={() => onSelectPersona(p.email, p.pass)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium border transition-all flex items-center gap-1.5 ${
                  isActive ? p.activeColor : p.color
                } ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{p.label}</span>
                {isActive && <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
