'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth, getRoleHomeRoute } from '@/lib/auth-context';
import { Shield, AlertCircle, Loader2, ArrowUpRight, Lock, Mail } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide both corporate email and password.');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const user = await login(email, password);
      const destination = getRoleHomeRoute(user.role);
      router.push(destination);
    } catch (err: any) {
      setError(err?.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F1F3F5] flex flex-col justify-between p-4 sm:p-8 select-none">
      {/* Top Header */}
      <header className="max-w-5xl w-full mx-auto flex items-center justify-between py-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded bg-[#1A202C] text-white flex items-center justify-center font-bold text-xs tracking-wider">
            VL
          </div>
          <div>
            <div className="font-semibold text-xs text-[#1A202C] tracking-tight">
              Vortex Logistics
            </div>
            <div className="text-[10px] text-[#57606A] font-medium">
              Enterprise Distribution Network
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-[#57606A]">
          <span className="w-2 h-2 rounded-full bg-[#0B6A52]" />
          <span>System online (Gateway 4000)</span>
        </div>
      </header>

      {/* Main Login Card */}
      <main className="max-w-md w-full mx-auto my-auto py-8">
        <div className="bg-[#FFFFFF] border border-[#D0D7DE] rounded shadow-none overflow-hidden">
          {/* Card Header */}
          <div className="p-6 border-b border-[#D0D7DE] bg-[#FFFFFF]">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-[#F1F3F5] text-[#57606A] border border-[#D0D7DE]">
                Single Sign-On & JWT
              </span>
            </div>
            <h1 className="text-lg font-semibold text-[#1A202C]">
              Enterprise sign in
            </h1>
            <p className="text-xs text-[#57606A] mt-1 leading-relaxed">
              Authenticate with your corporate credentials to access your designated procurement or operations workspace.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {error && (
              <div className="p-3 rounded border border-[#ECA1AC] bg-[#FDEAEB] text-[#A32338] text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label
                htmlFor="email"
                className="block text-xs font-medium text-[#1A202C] mb-1.5"
              >
                Corporate email address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#57606A] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  autoComplete="email"
                  required
                  className="w-full h-9 pl-9 pr-3 rounded border border-[#D0D7DE] bg-[#FFFFFF] text-xs text-[#1A202C] placeholder:text-[#8C95A0] focus:outline-none focus:border-[#0F52BA] focus:ring-1 focus:ring-[#0F52BA]"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-xs font-medium text-[#1A202C] mb-1.5"
              >
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#57606A] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter corporate password"
                  autoComplete="current-password"
                  required
                  className="w-full h-9 pl-9 pr-3 rounded border border-[#D0D7DE] bg-[#FFFFFF] text-xs text-[#1A202C] placeholder:text-[#8C95A0] focus:outline-none focus:border-[#0F52BA] focus:ring-1 focus:ring-[#0F52BA]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-9 mt-2 rounded bg-[#0F52BA] hover:bg-[#0C4196] text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying credentials...</span>
                </>
              ) : (
                <span>Sign in to workspace</span>
              )}
            </button>
          </form>

          {/* Card Footer: Dev / Evaluator Launcher Link */}
          <div className="p-4 bg-[#F8F9FA] border-t border-[#D0D7DE] flex items-center justify-between">
            <div className="text-[11px] text-[#57606A]">
              Grading or testing the platform?
            </div>
            <Link
              href="/evaluator-login"
              className="text-xs font-semibold text-[#0F52BA] hover:underline inline-flex items-center gap-1"
            >
              <span>Launch evaluator console</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-5xl w-full mx-auto py-3 border-t border-[#D0D7DE] flex flex-col sm:flex-row items-center justify-between text-[11px] text-[#57606A] gap-2">
        <div className="flex items-center gap-1.5">
          <Shield className="w-3.5 h-3.5 text-[#57606A]" />
          <span>Role-based access control & tenant isolation enforced server-side.</span>
        </div>
        <div>
          <span>Vortex Enterprise v2.4.0</span>
        </div>
      </footer>
    </div>
  );
}
