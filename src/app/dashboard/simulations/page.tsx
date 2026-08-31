import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Activity, Briefcase, Play, Lock, CheckCircle2, AlertTriangle, Plus, LayoutDashboard } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { motion } from 'framer-motion';

export const dynamic = 'force-dynamic';

export default async function SimulationsHub() {
  const session = await auth();
  if (!session?.user?.email) redirect('/');

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true }
  });

  if (!user) redirect('/');

  const simulations = await prisma.recruitmentSimulation.findMany({
    where: { userId: user.id },
    include: { rounds: { orderBy: { orderIndex: 'asc' } } },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 h-full flex flex-col min-h-[calc(100vh-4rem)] bg-background">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 pb-8 border-b border-border">
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-foreground flex items-center gap-2">
            <LayoutDashboard className="w-6 h-6 text-primary" />
            Recruitment Simulations
          </h1>
          <p className="text-sm text-muted-foreground">
            End-to-end multi-round hiring journeys to practice real-world interview scenarios.
          </p>
        </div>
        <Button className="h-10 px-6 bg-primary text-primary-foreground hover:bg-primary/90 font-medium rounded-lg">
          <Plus className="w-4 h-4 mr-2" /> New Simulation
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {simulations.length > 0 ? simulations.map(sim => (
          <Card key={sim.id} className="rounded-2xl border border-border shadow-sm bg-card overflow-hidden transition-all hover:shadow-md">
            <CardHeader className="bg-muted/30 border-b border-border pb-4">
              <CardTitle className="text-sm font-semibold flex items-center gap-2 text-foreground">
                <Briefcase className="w-4 h-4 text-primary" />
                {sim.jobId ? `Job Match: ${sim.jobId}` : `Role: ${sim.domainId || 'Software Engineer'}`}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {sim.rounds.map((round, idx) => (
                  <div key={round.id} className="flex items-center justify-between p-4 bg-card hover:bg-muted/20 transition-colors group">
                    <div className="flex items-center gap-4">
                      <div className="flex-shrink-0">
                        {round.status === 'COMPLETED' && <CheckCircle2 className="w-5 h-5 text-success" />}
                        {round.status === 'UNAVAILABLE' && <AlertTriangle className="w-5 h-5 text-destructive" />}
                        {round.status === 'LOCKED' && <Lock className="w-5 h-5 text-muted-foreground" />}
                        {round.status === 'READY' && <Play className="w-5 h-5 text-warning-foreground" />}
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm text-foreground">{round.title}</h4>
                        <p className="text-xs text-muted-foreground capitalize mt-0.5">{round.type.toLowerCase()} Round</p>
                      </div>
                    </div>
                    <div>
                      {round.status === 'READY' && (
                        <Button size="sm" variant="secondary" className="h-8 rounded-lg font-medium text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                          Start
                        </Button>
                      )}
                      {round.status === 'COMPLETED' && <span className="font-semibold text-xs text-success">Done</span>}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )) : (
          <div className="col-span-full flex flex-col items-center justify-center py-20 px-4 border border-dashed border-border rounded-2xl bg-muted/10 text-center space-y-4">
            <div className="p-4 bg-primary/10 rounded-full">
              <Activity className="w-8 h-8 text-primary" />
            </div>
            <div className="space-y-1">
              <h3 className="font-semibold text-foreground text-lg">No Simulations Yet</h3>
              <p className="text-sm text-muted-foreground max-w-sm">Create your first recruitment simulation to practice full interview loops.</p>
            </div>
            <Button variant="outline" className="mt-4">
              <Plus className="w-4 h-4 mr-2" /> Create Simulation
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
