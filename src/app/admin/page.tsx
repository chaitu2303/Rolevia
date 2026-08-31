import { auth } from '@/auth';
import { requireAdmin } from '@/lib/auth/admin';
import { redirect } from 'next/navigation';
import { AdminDashboardClient } from '@/components/admin/AdminDashboardClient';
import { ShieldAlert } from 'lucide-react';

export default async function AdminPage() {
  const session = await auth();

  if (!session?.user?.email) {
    redirect('/login?callbackUrl=/admin');
  }

  const authCheck = await requireAdmin();

  if ('errorResponse' in authCheck) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6 text-foreground">
        <div className="max-w-md w-full bg-card border border-border rounded-xl p-8 shadow-lg text-center space-y-4">
          <div className="w-16 h-16 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mx-auto border-2 border-destructive/20 font-black text-2xl">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black uppercase tracking-tight">Access Forbidden</h1>
          <p className="text-sm text-muted-foreground font-medium">
            This administrative control system is strictly restricted to Rolevia Platform Administrators and the Platform Owner.
          </p>
          <div className="pt-4">
            <a 
              href="/dashboard"
              className="inline-flex shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground hover:bg-primary/80 h-8 px-2.5 w-full font-bold uppercase tracking-wider text-xs transition-colors"
            >
              Return to User Workstation
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <AdminDashboardClient currentUser={authCheck.user} />
  );
}
