'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Logo } from '@/components/Logo';

export default function AdminSetupPage() {
  const [passphrase, setPassphrase] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const { data: session } = useSession();
  const router = useRouter();

  if (!session?.user) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
        <p className="text-muted-foreground">You must be logged in to access this page.</p>
      </div>
    );
  }

  const handleUpgrade = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const res = await fetch('/api/admin/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passphrase }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to verify passphrase.');
      } else {
        setMessage('Success! Your account has been upgraded to ADMIN. Please sign out and sign back in to refresh your session.');
        setTimeout(() => router.push('/dashboard'), 3000);
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
      <div className="w-full max-w-md p-8 space-y-6 bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-200 dark:border-slate-800">
        <div className="flex justify-center mb-4">
          <Logo size="md" />
        </div>
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold">Secure Admin Access</h1>
          <p className="text-sm text-muted-foreground">
            Enter the secret setup passphrase to elevate your account to Admin status.
          </p>
        </div>

        {error && (
          <div className="p-3 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 rounded-md text-center">
            {error}
          </div>
        )}

        {message && (
          <div className="p-3 text-sm text-green-600 bg-green-50 dark:bg-green-900/20 rounded-md text-center">
            {message}
          </div>
        )}

        <form onSubmit={handleUpgrade} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Passphrase</label>
            <input
              type="password"
              required
              className="w-full p-2.5 border rounded-lg bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-400"
              value={passphrase}
              onChange={(e) => setPassphrase(e.target.value)}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 p-2.5 rounded-lg hover:opacity-90 disabled:opacity-50 font-medium transition-opacity"
          >
            {loading ? 'Verifying...' : 'Upgrade to Admin'}
          </button>
        </form>
      </div>
    </div>
  );
}
