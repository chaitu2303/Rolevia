import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { BarChart3, TrendingUp, TrendingDown, Target, Zap, Clock, Activity } from 'lucide-react';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

function StatCard({ title, value, trend, trendValue, icon: Icon, colorClass, borderStyle = "" }: any) {
  return (
    <div className={`bg-white p-6 border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between h-48 transition-transform hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] ${borderStyle}`}>
      <div className="flex justify-between items-start mb-4">
        <div className={`w-14 h-14 border-4 border-black ${colorClass} flex items-center justify-center -rotate-3`}>
          <Icon className="w-8 h-8 text-black" />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-sm font-black uppercase px-2 py-1 border-2 border-black ${trend === 'up' ? 'bg-[#abf5d1]' : 'bg-[#ff4040] text-white'}`}>
            {trend === 'up' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            {trendValue}
          </div>
        )}
      </div>
      <div>
        <h3 className="text-5xl font-black">{value}</h3>
        <p className="text-sm font-black uppercase tracking-widest mt-2 bg-black text-white inline-block px-2">{title}</p>
      </div>
    </div>
  );
}

export default async function AnalyticsPage() {
  const session = await auth();
  if (!session?.user?.email) redirect('/');

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      xpRecord: true,
      streakRecord: true,
    }
  });

  if (!user) redirect('/');

  const appsCount = await prisma.jobApplication.count({ where: { userId: user.id } });
  const interviewsCount = await prisma.jobApplication.count({ 
    where: { userId: user.id, status: { in: ['INTERVIEW', 'OFFER', 'HIRED'] } } 
  });
  
  const winRate = appsCount > 0 ? Math.round((interviewsCount / appsCount) * 100) + '%' : '0%';
  const xp = user.xpRecord?.totalXp || 0;
  const hoursSpent = Math.floor(xp / 50); // Rough estimate: 50 XP per hour

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-10 min-h-[calc(100vh-4rem)] bg-[#faf8f5] text-black">
      
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b-8 border-black pb-8 shrink-0">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-[#ff90e8] border-4 border-black flex items-center justify-center shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] rotate-3">
            <BarChart3 className="w-8 h-8 text-black" />
          </div>
          <div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase">Performance</h1>
            <p className="font-bold text-lg mt-1 bg-[#23a094] text-white inline-block px-2 border-2 border-black -rotate-1">Track your job search velocity.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        <StatCard 
          title="Applications" 
          value={appsCount} 
          trend="up" 
          trendValue="+3"
          icon={Target}
          colorClass="bg-[#90c0ff]"
          borderStyle="rotate-1"
        />
        <StatCard 
          title="Interview Rate" 
          value={winRate} 
          trend="up"
          trendValue="+2%"
          icon={Activity}
          colorClass="bg-[#abf5d1]"
          borderStyle="-rotate-1"
        />
        <StatCard 
          title="Active Streak" 
          value={`${user.streakRecord?.currentStreak || 0}D`} 
          icon={Zap}
          colorClass="bg-[#ffe500]"
          borderStyle="rotate-2"
        />
        <StatCard 
          title="Hours Practicing" 
          value={`${hoursSpent}h`} 
          icon={Clock}
          colorClass="bg-[#ff90e8]"
          borderStyle="-rotate-2"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-12">
        
        {/* Placeholder for real charts */}
        <div className="bg-white p-8 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] min-h-[400px] flex flex-col relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-[#ffe500] border-b-4 border-l-4 border-black px-4 py-2 font-black uppercase">Activity</div>
          <h2 className="text-2xl font-black uppercase mb-8 flex items-center gap-2"><Activity className="w-6 h-6"/> Timeline</h2>
          <div className="flex-1 flex flex-col items-center justify-center border-4 border-dashed border-black bg-[#faf8f5]">
            <BarChart3 className="w-16 h-16 text-black opacity-20 mb-4" />
            <p className="font-black uppercase tracking-widest text-center text-xl opacity-20 px-8">Feed me more data to draw charts.</p>
          </div>
        </div>

        <div className="bg-white p-8 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] min-h-[400px] flex flex-col relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-[#90c0ff] border-b-4 border-l-4 border-black px-4 py-2 font-black uppercase">Skills</div>
          <h2 className="text-2xl font-black uppercase mb-8 flex items-center gap-2"><Target className="w-6 h-6"/> Proficiency</h2>
          <div className="flex-1 flex flex-col items-center justify-center border-4 border-dashed border-black bg-[#faf8f5]">
            <Target className="w-16 h-16 text-black opacity-20 mb-4" />
            <p className="font-black uppercase tracking-widest text-center text-xl opacity-20 px-8">Complete coding assessments to view proficiency radar.</p>
          </div>
        </div>

      </div>

    </div>
  );
}
