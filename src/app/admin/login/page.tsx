'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Shield, Lock, Mail, ArrowRight, Loader2, AlertCircle } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
      const res = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        setError('Invalid credentials. Please verify your email and password.');
        setLoading(false);
        return;
      }

      // Check role authorization on the server
      const verifyRes = await fetch('/api/admin/health');
      if (verifyRes.status === 403 || verifyRes.status === 401) {
        setError('Access Forbidden: Your account is authenticated, but does not possess Administrator or Platform Owner privileges.');
        setLoading(false);
        return;
      }

      router.push('/admin');
      router.refresh();
    } catch (err) {
      setError('An unexpected error occurred during administrative authentication.');
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setOauthLoading(true);
    setError(null);
    try {
      await signIn('google', { callbackUrl: '/admin' });
    } catch (err) {
      setError('Google Authentication failed. Please try again.');
      setOauthLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0D14] flex flex-col justify-center items-center p-4 selection:bg-emerald-500 selection:text-white">
      <div className="w-full max-w-md bg-slate-900/80 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-slate-800/80">
        
        {/* Header with Admin Shield */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-inner">
            <Shield className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-black text-white uppercase tracking-tight">
            Rolevia Admin Portal
          </h1>
          <p className="text-xs text-slate-400 font-medium mt-1.5">
            Restricted to Platform Administrators & Platform Owner
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-300 p-3.5 rounded-xl text-xs mb-6 flex items-start gap-2.5 leading-relaxed">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Google OAuth Login */}
        <div className="space-y-4">
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={oauthLoading || loading}
            className="w-full flex items-center justify-center gap-3 bg-slate-800 hover:bg-slate-700/80 text-slate-200 text-xs font-semibold py-3 px-4 rounded-xl border border-slate-700/80 transition-all hover:border-slate-600 disabled:opacity-50"
          >
            {oauthLoading ? (
              <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
            ) : (
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#EA4335"
                  d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"
                />
                <path
                  fill="#4285F4"
                  d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12 0 12s.7 2.3 1.9 4.7l3.7-2.9z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 16C3.7 19.7 7.5 23 12 23z"
                />
              </svg>
            )}
            <span>Continue with Google OAuth</span>
          </button>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-800" />
            </div>
            <div className="relative flex justify-center text-[10px] uppercase tracking-wider font-bold">
              <span className="bg-slate-900 px-3 text-slate-500">Or Email Credentials</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Admin Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
                <input
                  type="email"
                  name="email"
                  required
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-colors"
                  placeholder="admin@rolevia.com"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Password
                </label>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
                <input
                  type="password"
                  name="password"
                  required
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-colors"
                  placeholder="••••••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || oauthLoading}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs uppercase tracking-wider py-3 px-4 rounded-xl transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <span>Access Command Center</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      <div className="mt-6 flex items-center gap-4 text-xs text-slate-500">
        <Link href="/login" className="hover:text-slate-300 transition-colors">
          ← Candidate Login
        </Link>
        <span>•</span>
        <Link href="/forgot-password" className="hover:text-slate-300 transition-colors">
          Forgot Password?
        </Link>
      </div>
    </div>
  );
}
