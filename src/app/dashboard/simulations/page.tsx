import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Activity, Briefcase, Play, Lock, CheckCircle2, AlertTriangle, Plus } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';

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
    <div className="max-w-6xl mx-auto py-8 px-4 h-full flex flex-col min-h-[calc(100vh-4rem)] bg-[#faf8f5] text-black">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 border-b-8 border-black pb-8 shrink-0">
        <div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase">Recruitment Simulations</h1>
          <p className="font-bold text-lg mt-1 bg-[#abf5d1] text-black inline-block px-2 border-2 border-black rotate-1">End-to-end multi-round hiring journeys.</p>
        </div>
        <Button className="h-14 px-8 rounded-none border-4 border-black bg-[#ff90e8] hover:bg-[#ff70dd] text-black font-black uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:translate-x-1 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all">
          <Plus className="w-5 h-5 mr-2" /> New Simulation
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {simulations.length > 0 ? simulations.map(sim => (
          <Card key={sim.id} className="rounded-none border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-white">
            <CardHeader className="bg-[#90c0ff] border-b-4 border-black">
              <CardTitle className="font-black uppercase flex items-center gap-2">
                <Briefcase className="w-5 h-5" />
                {sim.jobId ? `Job Match: ${sim.jobId}` : `Role: ${sim.domainId || 'Software Engineer'}`}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              {sim.rounds.map((round, idx) => (
                <div key={round.id} className="flex items-center justify-between p-4 border-4 border-black bg-[#faf8f5] hover:-translate-y-1 hover:translate-x-1 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className="flex-shrink-0">
                      {round.status === 'COMPLETED' && <CheckCircle2 className="w-6 h-6 text-[#23a094]" />}
                      {round.status === 'UNAVAILABLE' && <AlertTriangle className="w-6 h-6 text-[#ff4040]" />}
                      {round.status === 'LOCKED' && <Lock className="w-6 h-6 text-slate-400" />}
                      {round.status === 'READY' && <Play className="w-6 h-6 text-[#ffe500]" />}
                    </div>
                    <div>
                      <h4 className="font-black uppercase">{round.title}</h4>
                      <p className="text-sm font-bold opacity-70 capitalize">{round.type.toLowerCase()} Round</p>
                    </div>
                  </div>
                  <div>
                    {round.status === 'READY' && <Button size="sm" className="rounded-none border-2 border-black bg-[#ffe500] hover:bg-black hover:text-[#ffe500] font-black uppercase text-xs">Start</Button>}
                    {round.status === 'COMPLETED' && <span className="font-black uppercase text-[#23a094]">Done</span>}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )) : (
          <div className="col-span-full flex flex-col items-center justify-center p-12 border-4 border-dashed border-black/20 text-center space-y-4">
            <Activity className="w-12 h-12 opacity-20" />
            <h3 className="font-black uppercase text-xl opacity-50">No Simulations Yet</h3>
            <p className="font-bold opacity-50 max-w-md">Create your first recruitment simulation to practice full interview loops.</p>
          </div>
        )}
      </div>
    </div>
  );
}
