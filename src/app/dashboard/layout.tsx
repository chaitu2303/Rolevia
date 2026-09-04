import { ReactNode } from 'react';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { Sidebar } from '@/components/layout/Sidebar';
import { Bell, UserCircle, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const session = await auth();
  const authUser = session?.user;

  if (!authUser) {
    redirect('/login');
  }

  // Fetch user data including gamification stats
  const dbUser = await prisma.user.findUnique({
    where: { email: authUser.email! },
    include: {
      streakRecord: true,
      xpRecord: true,
    }
  });

  if (!dbUser?.onboardingCompleted) {
    redirect('/onboarding');
  }

  const streak = dbUser?.streakRecord?.currentStreak ?? 0;
  const xp = dbUser?.xpRecord?.totalXp ?? 0;
  const level = dbUser?.xpRecord?.currentLevel ?? 1;
  const userName = dbUser?.name ?? authUser.email?.split('@')[0] ?? 'Member';
  const userRole = dbUser?.role ?? 'USER';
  const isAdminOrOwner = userRole === 'ADMIN' || userRole === 'OWNER';

  return (
    <div className="flex h-screen bg-muted/10 overflow-hidden">
      <Sidebar userName={userName} streak={streak} xp={xp} level={level} userRole={userRole} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 h-screen relative">
        {/* Top Bar - Hidden on mobile as Sidebar handles it */}
        <header className="h-14 bg-background/80 backdrop-blur-md hidden md:flex items-center justify-between px-6 shrink-0 z-10 sticky top-0 border-b border-border/40">
          <div className="flex-1 max-w-xl">
            <button className="w-full flex items-center justify-between px-4 py-2 bg-muted/30 hover:bg-muted/60 border border-border/50 rounded-xl text-sm text-muted-foreground transition-all duration-200">
              <div className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-search"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                <span>Search or jump to...</span>
              </div>
              <div className="flex items-center gap-1">
                <kbd className="inline-flex h-5 items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                  <span className="text-xs">⌘</span>K
                </kbd>
              </div>
            </button>
          </div>
          
          <div className="flex items-center gap-4 ml-4">
            <div className="flex items-center gap-2 pr-4 border-r border-border/50">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
              </span>
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">AI Ready</span>
            </div>

            {isAdminOrOwner && (
              <Link 
                href="/admin" 
                className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 rounded-lg text-xs font-bold uppercase tracking-wider transition-all"
                title="Admin Command Center"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
                <span>Admin</span>
              </Link>
            )}
            
            <Link href="/dashboard/notifications" className="relative p-2 rounded-full hover:bg-muted/80 transition-colors text-muted-foreground hover:text-foreground">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-destructive ring-2 ring-background" />
            </Link>
            
            <Link href="/dashboard/settings" className="flex items-center gap-2 pl-2">
              <div className="text-right hidden lg:block">
                <div className="text-sm font-semibold leading-tight text-foreground">{userName}</div>
                <div className="text-xs text-muted-foreground font-medium">Pro Member</div>
              </div>
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-primary to-primary/50 flex items-center justify-center premium-shadow">
                <UserCircle className="w-5 h-5 text-primary-foreground" />
              </div>
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
