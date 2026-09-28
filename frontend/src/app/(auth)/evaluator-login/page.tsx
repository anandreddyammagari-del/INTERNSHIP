'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth, getRoleHomeRoute } from '@/lib/auth-context';
import {
  Terminal,
  ShieldCheck,
  Building2,
  UserCheck,
  ArrowLeft,
  Loader2,
  KeyRound,
  CheckCircle2,
} from 'lucide-react';

interface Persona {
  id: string;
  name: string;
  role: 'BUYER' | 'SALES_REP' | 'ADMIN';
  roleDisplay: string;
  email: string;
  pass: string;
  company: string;
  terms?: string;
  description: string;
  targetPath: string;
  badgeStyle: string;
}

const PERSONAS: Persona[] = [
  {
    id: 'apex',
    name: 'Sarah Jenkins',
    role: 'BUYER',
    roleDisplay: 'Buyer (Apex Corp)',
    email: 'buyer@apexcorp.com',
    pass: 'Buyer123!',
    company: 'Apex Industrial Supplies Ltd',
    terms: 'Net 30 ($50,000 credit)',
    description: 'Tier 1 preferred wholesale buyer. Can browse custom discounted catalog, manage company cart, and submit purchase orders on credit.',
    targetPath: '/buyer',
    badgeStyle: 'bg-[#FFF6E5] text-[#875200] border-[#E0B34C]',
  },
  {
    id: 'nexa',
    name: 'Alex Rivera',
    role: 'BUYER',
    roleDisplay: 'Buyer (Nexa Corp)',
    email: 'buyer@nexa.com',
    pass: 'Buyer123!',
    company: 'Nexa Global Logistics Corp',
    terms: 'Net 60 ($25,000 credit)',
    description: 'Isolated second-tenant buyer. Completely segregated order book and credit terms from Apex Industrial.',
    targetPath: '/buyer',
    badgeStyle: 'bg-[#FFF6E5] text-[#875200] border-[#E0B34C]',
  },
  {
    id: 'sales',
    name: 'Dave Miller',
    role: 'SALES_REP',
    roleDisplay: 'Sales Representative',
    email: 'sales@distributor.com',
    pass: 'Sales123!',
    company: 'Vortex Central Wholesale',
    description: 'Wholesale sales specialist. Reviews incoming buyer purchase orders, verifies credit utilization, and confirms orders for fulfillment.',
    targetPath: '/sales',
    badgeStyle: 'bg-[#E5F4FF] text-[#04589C] border-[#68B2E8]',
  },
  {
    id: 'admin',
    name: 'Marcus Vance',
    role: 'ADMIN',
    roleDisplay: 'Platform Administrator',
    email: 'admin@distributor.com',
    pass: 'Admin123!',
    company: 'Vortex Headquarters DC-01',
    description: 'DC Operations director. Manages warehouse stock levels, monitors critical thresholds, views cross-tenant order ledger, and inspects audit trails.',
    targetPath: '/admin',
    badgeStyle: 'bg-[#E2F7EE] text-[#0B6A52] border-[#55C8A6]',
  },
];

export default function EvaluatorLoginPage() {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { login } = useAuth();
  const router = useRouter();

  const handleLaunch = async (persona: Persona) => {
    setActiveId(persona.id);
    setError(null);
    try {
      await login(persona.email, persona.pass);
      router.push(persona.targetPath);
    } catch (err: any) {
      setError(`Failed to authenticate as ${persona.name}: ${err?.message || 'Unknown error'}`);
      setActiveId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#F1F3F5] text-[#1A202C] p-4 sm:p-8 select-none">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#D0D7DE]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded bg-[#1A202C] text-white flex items-center justify-center shrink-0">
              <Terminal className="w-5 h-5 text-[#E9ECEF]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-[#1A202C]">
                  Evaluation & Testing Console
                </h1>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#E9ECEF] text-[#1A202C] border border-[#D0D7DE]">
                  Dev Utility
                </span>
              </div>
              <p className="text-xs text-[#57606A]">
                Convenience test harness for reviewers and mentors. 1-click credential switching into isolated role workspaces.
              </p>
            </div>
          </div>

          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded border border-[#D0D7DE] bg-[#FFFFFF] hover:bg-[#F8F9FA] text-xs font-medium text-[#1A202C] transition-colors shrink-0"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to corporate sign in</span>
          </Link>
        </div>

        {/* Notice Banner */}
        <div className="p-3.5 rounded border border-[#D0D7DE] bg-[#FFFFFF] flex items-start gap-3">
          <ShieldCheck className="w-4 h-4 text-[#0F52BA] shrink-0 mt-0.5" />
          <div className="text-xs text-[#57606A] leading-relaxed">
            <strong className="text-[#1A202C]">Security Model: </strong>
            Selecting any persona generates authentic JWT tokens through the NestJS backend API (<code className="text-[#1A202C] font-mono">POST /auth/login</code>). Role authorization and tenant isolation are enforced strictly server-side by <code className="text-[#1A202C] font-mono">RolesGuard</code>.
          </div>
        </div>

        {error && (
          <div className="p-3 rounded border border-[#ECA1AC] bg-[#FDEAEB] text-[#A32338] text-xs">
            {error}
          </div>
        )}

        {/* Persona Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {PERSONAS.map((p) => {
            const isProcessing = activeId === p.id;

            return (
              <div
                key={p.id}
                className="bg-[#FFFFFF] border border-[#D0D7DE] rounded p-5 flex flex-col justify-between"
              >
                <div>
                  {/* Persona Header */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <div className="text-sm font-bold text-[#1A202C]">
                        {p.name}
                      </div>
                      <div className="text-xs font-medium text-[#57606A] flex items-center gap-1.5 mt-0.5">
                        <Building2 className="w-3.5 h-3.5 text-[#57606A]" />
                        <span>{p.company}</span>
                      </div>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${p.badgeStyle}`}
                    >
                      {p.role}
                    </span>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-[#57606A] leading-relaxed mb-4">
                    {p.description}
                  </p>

                  {/* Metadata Specs */}
                  <div className="bg-[#F8F9FA] border border-[#D0D7DE] rounded p-3 text-xs space-y-1.5 mb-5 font-mono">
                    <div className="flex items-center justify-between text-[#57606A]">
                      <span>Email:</span>
                      <span className="text-[#1A202C] font-medium">{p.email}</span>
                    </div>
                    <div className="flex items-center justify-between text-[#57606A]">
                      <span>Password:</span>
                      <span className="text-[#1A202C] font-medium">{p.pass}</span>
                    </div>
                    {p.terms && (
                      <div className="flex items-center justify-between text-[#57606A]">
                        <span>Terms:</span>
                        <span className="text-[#1A202C] font-medium">{p.terms}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between text-[#57606A]">
                      <span>Workspace target:</span>
                      <span className="text-[#0F52BA] font-medium">{p.targetPath}</span>
                    </div>
                  </div>
                </div>

                {/* Launch Button */}
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={() => handleLaunch(p)}
                  className="w-full h-9 rounded bg-[#0F52BA] hover:bg-[#0C4196] text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Authenticating & routing...</span>
                    </>
                  ) : (
                    <>
                      <UserCheck className="w-4 h-4" />
                      <span>Launch {p.roleDisplay}</span>
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>

        {/* Security Note Footer */}
        <div className="pt-4 text-center text-xs text-[#57606A]">
          Vortex Logistics Test Suite &bull; All persona sessions are completely isolated.
        </div>
      </div>
    </div>
  );
}
