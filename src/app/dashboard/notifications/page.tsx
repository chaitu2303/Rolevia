import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { Bell, CheckCircle, AlertCircle, Info, Brain, FileText, Briefcase } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { Button } from '@/components/ui/button';

export const dynamic = 'force-dynamic';

const getIcon = (type: string) => {
  switch (type) {
    case 'INTERVIEW': return Brain;
    case 'RESUME': return FileText;
    case 'JOB': return Briefcase;
    case 'SYSTEM': return Info;
    default: return Bell;
  }
};

const getColor = (type: string) => {
  switch (type) {
    case 'INTERVIEW': return 'text-purple-500 bg-purple-500/10';
    case 'RESUME': return 'text-blue-500 bg-blue-500/10';
    case 'JOB': return 'text-green-500 bg-green-500/10';
    case 'SYSTEM': return 'text-primary bg-primary/10';
    default: return 'text-muted-foreground bg-muted';
  }
};

export default async function NotificationsPage() {
  const session = await auth();
  if (!session?.user?.email) redirect('/');

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true }
  });

  if (!user) redirect('/');

  const notifications = await prisma.notification.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
    take: 50
  });

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-8 animate-in fade-in duration-500">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20">
            <Bell className="w-7 h-7 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
            <p className="text-muted-foreground">Stay updated on your career progress.</p>
          </div>
        </div>

        <Button variant="outline" className="rounded-xl">Mark all as read</Button>
      </div>

      <div className="bg-card rounded-3xl border border-border/50 shadow-sm overflow-hidden">
        {notifications.length > 0 ? (
          <div className="divide-y divide-border/50">
            {notifications.map((note) => {
              const Icon = getIcon(note.type);
              const colorClass = getColor(note.type);
              
              return (
                <div key={note.id} className={`p-6 flex gap-4 transition-colors hover:bg-muted/30 ${!note.isRead ? 'bg-primary/5' : ''}`}>
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${colorClass}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-start justify-between gap-4">
                      <h3 className={`font-semibold ${!note.isRead ? 'text-foreground' : 'text-muted-foreground'}`}>
                        {note.title}
                      </h3>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {new Date(note.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {note.body}
                    </p>
                  </div>
                  {!note.isRead && (
                    <div className="flex items-center shrink-0">
                      <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-12 flex flex-col items-center justify-center text-center">
            <Bell className="w-12 h-12 text-muted-foreground opacity-20 mb-4" />
            <h3 className="text-lg font-bold mb-1">All caught up!</h3>
            <p className="text-muted-foreground">You have no new notifications.</p>
          </div>
        )}
      </div>

    </div>
  );
}
