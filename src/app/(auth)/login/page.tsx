'use client';
import { useState, Suspense } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff } from 'lucide-react';
import { Logo } from '@/components/Logo';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const isRegistered = searchParams.get('registered') === 'true';
  const isReset = searchParams.get('reset') === 'true';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });

      setLoading(false);

      if (res?.error) {
        setError('Invalid email or password');
      } else {
        router.push('/dashboard');
      }
    } catch {
      setError('An error occurred. Please try again.');
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setError('');
    try {
      await signIn('google', { callbackUrl: '/dashboard' });
    } catch {
      setError('Google sign-in failed. Please try again.');
      setGoogleLoading(false);
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
      <div className="w-full max-w-md p-8 space-y-6 bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-200 dark:border-slate-800 flex flex-col items-center">
        <Logo size="md" className="mb-2" />
        <div className="text-center space-y-1 w-full">
          <h1 className="text-3xl font-bold">Welcome Back</h1>
          <p className="text-sm text-muted-foreground">Sign in to continue to Rolevia</p>
        </div>

        {isRegistered && (
          <div className="text-emerald-600 dark:text-emerald-400 text-sm text-center bg-emerald-50 dark:bg-emerald-950/20 rounded-lg p-3 w-full">
            Account created successfully! Please sign in below.
          </div>
        )}

        {isReset && (
          <div className="text-emerald-600 dark:text-emerald-400 text-sm text-center bg-emerald-50 dark:bg-emerald-950/20 rounded-lg p-3 w-full">
            Password reset successfully! Please sign in with your new password.
          </div>
        )}

        {error && (
          <div className="text-red-600 dark:text-red-400 text-sm text-center bg-red-50 dark:bg-red-900/20 rounded-lg p-3 w-full">
            {error}
          </div>
        )}

        <div className="w-full">
          <button
            onClick={handleGoogleSignIn}
            disabled={googleLoading || loading}
            data-testid="google-signin-button"
            className="w-full border border-slate-200 dark:border-slate-700 p-2.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors font-medium cursor-pointer"
          >
            {googleLoading ? (
              'Wait...'
            ) : (
              <>
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Google
              </>
            )}
          </button>
        </div>

        <div className="relative w-full">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-slate-200 dark:border-slate-700" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white dark:bg-slate-900 px-2 text-muted-foreground">Or with email</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 w-full" data-testid="login-form">
          <div>
            <label htmlFor="email-input" className="block text-sm font-medium mb-1">Email</label>
            <input
              id="email-input"
              type="email"
              required
              autoComplete="email"
              className="w-full p-2.5 border rounded-lg bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-400"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>
          <div>
            <div className="flex justify-between items-center mb-1">
              <label htmlFor="password-input" className="block text-sm font-medium">Password</label>
              <Link href="/forgot-password" className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <input
                id="password-input"
                data-testid="password-input"
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="current-password"
                className="w-full p-2.5 pr-10 border rounded-lg bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-400"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
              <button
                type="button"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                onClick={() => setShowPassword(v => !v)}
                className="absolute inset-y-0 right-0 flex items-center px-3 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 p-2.5 rounded-lg hover:opacity-90 disabled:opacity-50 font-medium transition-opacity cursor-pointer mt-4"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="text-center text-sm text-muted-foreground w-full">
          Don't have an account?{' '}
          <Link href="/register" className="text-slate-900 dark:text-white font-medium hover:underline">
            Create account
          </Link>
        </div>

        <div className="text-xs text-slate-400 hover:text-emerald-600 transition-colors w-full text-center">
          <Link href="/admin/login">
            Admin Portal
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}
