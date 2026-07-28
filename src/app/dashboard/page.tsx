import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import {
  Briefcase, FileText, Brain, Code2,
  FlameKindling, Zap, Target, CheckCircle,
  TrendingUp, Trophy, ArrowRight, Activity, Rocket, Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export const dynamic = 'force-dynamic';

function getHourGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

function ReadinessBar({ score, label, color }: { score: number; label: string; color: string }) {
  return (
    <div className="space-y-2 mb-4">
      <div className="flex justify-between text-sm font-black uppercase">
        <span>{label}</span>
        <span>{score}%</span>
      </div>
      <div className="h-4 w-full bg-white border-2 border-black overflow-hidden relative">
        <div
          className={`h-full ${color} border-r-2 border-black transition-all duration-700`}
          style={{ width: `${score}%` }}
        />
        <div className="absolute inset-0 opacity-20 bg-[repeating-linear-gradient(45deg,transparent,transparent_4px,black_4px,black_8px)]" />
      </div>
    </div>
  );
}

export default async function DashboardHomePage() {
  const session = await auth();
  const authUser = session?.user;
  if (!authUser) redirect('/');

  const dbUser = await prisma.user.findUnique({
    where: { email: authUser.email! },
    include: {
      streakRecord: true,
      xpRecord: true,
      careerProfile: {
        include: {
          skills: { where: { status: { in: ['USER_CONFIRMED', 'USER_CREATED'] } } },
          experiences: { where: { status: { in: ['USER_CONFIRMED', 'USER_CREATED'] } } },
          educations: { where: { status: { in: ['USER_CONFIRMED', 'USER_CREATED'] } } },
          projects: { where: { status: { in: ['USER_CONFIRMED', 'USER_CREATED'] } } },
          certifications: { where: { status: { in: ['USER_CONFIRMED', 'USER_CREATED'] } } },
        }
      },
      jobTargets: {
        orderBy: { createdAt: 'desc' },
        take: 3,
        include: { matchAnalysis: true }
      },
      userBadges: { take: 3, include: { badge: true }, orderBy: { earnedAt: 'desc' } },
      dailyMissions: {
        where: { missionDate: new Date().toISOString().slice(0, 10) },
        take: 1,
      }
    }
  });

  const userName = dbUser?.name ?? authUser.email?.split('@')[0] ?? 'there';
  const streak = dbUser?.streakRecord?.currentStreak ?? 0;
  const xp = dbUser?.xpRecord?.totalXp ?? 0;
  const level = dbUser?.xpRecord?.currentLevel ?? 1;
  const profile = dbUser?.careerProfile;

  const completenessScore = profile?.completenessScore ?? 0;
  const hasProfile = !!profile;
  const skillCount = profile?.skills.length ?? 0;
  const expCount = profile?.experiences.length ?? 0;

  let todayMission = dbUser?.dailyMissions[0];
  if (!todayMission && dbUser) {
    const { MissionEngine } = await import('@/lib/gamification/MissionEngine');
    todayMission = await MissionEngine.generateDailyMissions(dbUser.id);
  }

  const missionTasks: Array<{ id: string; label: string; completed: boolean }> = Array.isArray(todayMission?.tasks)
    ? (todayMission.tasks as Array<{ id: string; label: string; completed: boolean }>)
    : [
      { id: '1', label: 'Solve 5 aptitude questions', completed: false },
      { id: '2', label: 'Complete today\'s coding challenge', completed: false },
      { id: '3', label: 'Practice 1 interview answer', completed: false },
    ];

  const recentJobs = dbUser?.jobTargets ?? [];

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-12 bg-[#faf8f5] text-black font-sans min-h-screen">

      {/* TOP AREA: Hero & Status */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b-8 border-black pb-8">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase">
              {getHourGreeting()}, {userName}
            </h1>
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-[#23a094] border-4 border-black text-sm font-black text-white uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] -rotate-2">
              AI Core Online
            </div>
          </div>
          <p className="text-xl font-bold max-w-2xl bg-[#ffe500] inline-block px-2 border-2 border-black rotate-1">
            {hasProfile
              ? `Target: ${profile.targetRole || profile.domain || 'Software Engineering'}. Profile ${completenessScore}% complete.`
              : "Welcome. Let's build your verified profile."}
          </p>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="bg-white border-4 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center gap-4">
            <div className="flex flex-col items-center">
              <span className="text-xs font-black uppercase mb-1">Streak</span>
              <div className="flex items-center gap-1 text-[#ff4040]">
                <FlameKindling className="w-6 h-6" />
                <span className="text-2xl font-black">{streak}</span>
              </div>
            </div>
            <div className="w-1 h-12 bg-black" />
            <div className="flex flex-col items-center">
              <span className="text-xs font-black uppercase mb-1">Level</span>
              <div className="flex items-center gap-1 text-[#23a094]">
                <Zap className="w-6 h-6" />
                <span className="text-2xl font-black">{level}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* NEW: Feature Onboarding Sticky Notes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: "Resume Tailor", text: "Match your resume perfectly to any Job Description in 5 seconds.", color: "bg-[#90c0ff]", rotate: "-rotate-2" },
          { title: "Mock Interview", text: "Practice real questions with an AI hiring manager. Get instant feedback.", color: "bg-[#ff90e8]", rotate: "rotate-1" },
          { title: "Job Intel", text: "Track your applications and see your real ATS match scores.", color: "bg-[#ffe500]", rotate: "-rotate-1" },
          { title: "Cloud Auto-Apply", text: "Our bot fills out the boring application forms for you in the background.", color: "bg-[#23a094]", rotate: "rotate-2", textCol: "text-white" },
        ].map((note, i) => (
          <div key={i} className={`${note.color} border-4 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${note.rotate} hover:rotate-0 transition-all cursor-pointer relative`}>
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-8 h-8 bg-black/10 rounded-full blur-sm" />
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-6 h-6 bg-white border-2 border-black rounded-full shadow-sm" />
            <h4 className={`font-black uppercase text-lg mt-2 flex items-center gap-2 ${note.textCol || 'text-black'}`}>
              <Info className="w-5 h-5" /> {note.title}
            </h4>
            <p className={`font-bold text-sm mt-2 leading-tight ${note.textCol || 'text-black'}`}>{note.text}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* PRIMARY ACTION: Next Best Action */}
          <div className="bg-[#ff90e8] border-4 border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden group">
            <div className="absolute top-4 right-4 bg-white border-4 border-black px-3 py-1 font-black uppercase text-sm rotate-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              Priority
            </div>
            <h2 className="text-3xl font-black uppercase mb-4 relative z-10 flex items-center gap-3">
              <Target className="w-8 h-8" /> Next Action
            </h2>
            <p className="text-xl font-bold mb-8 max-w-lg relative z-10">
              Complete your {profile?.domain === 'swe' ? 'Core Engineering' : profile?.domain || 'Baseline'} assessment to verify your skills.
            </p>
            <div className="flex gap-4 relative z-10">
              <Link href="/dashboard/assess">
                <Button className="h-14 px-8 rounded-none border-4 border-black bg-white hover:bg-black hover:text-white text-black font-black uppercase text-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all">
                  Start Assessment <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </div>
            {/* Background graphic */}
            <div className="absolute -bottom-10 -right-10 w-64 h-64 border-8 border-black rounded-full opacity-20 pointer-events-none" />
          </div>

          {/* PROGRESS: Career Readiness & Achievements */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            <div className="bg-white border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-black uppercase text-xl">Readiness</h3>
                <TrendingUp className="w-6 h-6 text-[#23a094]" />
              </div>
              <div className="flex items-end gap-2 mb-6 border-b-4 border-black pb-4">
                <span className="text-6xl font-black leading-none">{completenessScore}</span>
                <span className="text-xl font-bold pb-1">/ 100</span>
              </div>
              <ReadinessBar score={Math.min(100, skillCount * 10)} label="Skills" color="bg-[#ffe500]" />
              <ReadinessBar score={Math.min(100, expCount * 25)} label="Experience" color="bg-[#90c0ff]" />
            </div>

            <div className="bg-white border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4 border-b-4 border-black pb-4">
                  <h3 className="font-black uppercase text-xl">Latest Win</h3>
                  <Trophy className="w-6 h-6 text-[#ff4040]" />
                </div>
                {dbUser?.userBadges && dbUser.userBadges.length > 0 ? (
                  <div className="mt-4 flex flex-col items-start">
                    <div className="bg-[#ffe500] border-4 border-black p-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] -rotate-3 mb-4">
                      <Trophy className="w-8 h-8" />
                    </div>
                    <div className="font-black text-xl uppercase">{dbUser.userBadges[0].badge.name}</div>
                    <div className="font-bold text-sm mt-1">Earned recently. Keep pushing!</div>
                  </div>
                ) : (
                  <div className="mt-4 flex flex-col items-center justify-center text-center py-6 bg-[#faf8f5] border-4 border-black border-dashed">
                    <Trophy className="w-10 h-10 text-black/30 mb-2" />
                    <div className="font-black uppercase">No Badges Yet</div>
                  </div>
                )}
              </div>
              <Link href="/dashboard/achievements">
                <Button className="w-full mt-6 rounded-none border-4 border-black bg-white hover:bg-black hover:text-white text-black font-black uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all">
                  View Passport
                </Button>
              </Link>
            </div>
          </div>
          
          {/* Quick Tools */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { href: "/dashboard/ats", icon: FileText, label: "ATS Tailor", color: "bg-[#90c0ff]" },
              { href: "/dashboard/jobs", icon: Briefcase, label: "Job Intel", color: "bg-[#ffe500]" },
              { href: "/dashboard/interview", icon: Brain, label: "Mock Chat", color: "bg-[#ff90e8]" },
              { href: "/dashboard/code", icon: Code2, label: "Code Arena", color: "bg-[#23a094]" },
            ].map((tool, i) => (
              <Link key={i} href={tool.href} className={`flex flex-col items-center justify-center gap-3 p-6 ${tool.color} border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all`}>
                <div className="w-12 h-12 bg-white border-4 border-black rounded-full flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  <tool.icon className="w-6 h-6 text-black" />
                </div>
                <span className="font-black uppercase text-sm text-center">{tool.label}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-8">
          
          {/* NEW: Cloud Agent Status */}
          <div className="bg-black border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] text-white">
            <div className="flex items-center justify-between mb-4 border-b-4 border-white/20 pb-4">
              <h3 className="font-black uppercase text-xl flex items-center gap-2">
                <Rocket className="w-6 h-6 text-[#ffe500]" /> Cloud Agent
              </h3>
              <div className="flex items-center gap-2">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#23a094] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-[#23a094]"></span>
                </span>
                <span className="text-sm font-bold text-[#23a094]">IDLE</span>
              </div>
            </div>
            <p className="font-bold text-sm text-white/70 mb-4">
              The Playwright automation bot is ready. Send a job URL from the ATS Tailor page to trigger auto-apply.
            </p>
            <Link href="/dashboard/ats">
              <Button className="w-full rounded-none border-4 border-white bg-[#ffe500] hover:bg-white text-black font-black uppercase shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] transition-all">
                Trigger Agent
              </Button>
            </Link>
          </div>

          {/* TODAY: Daily Missions */}
          <div className="bg-[#ffe500] border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <div className="flex items-center justify-between mb-6 border-b-4 border-black pb-4">
              <h3 className="font-black uppercase text-xl">Daily Missions</h3>
              <Activity className="w-6 h-6" />
            </div>
            <div className="space-y-4">
              {missionTasks.map((task, i) => (
                <div key={task.id} className="flex items-start gap-4 p-3 bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  <div className={`mt-0.5 shrink-0 w-6 h-6 border-4 border-black flex items-center justify-center ${task.completed ? 'bg-[#23a094]' : 'bg-white'}`}>
                    {task.completed && <CheckCircle className="w-4 h-4 text-white" />}
                  </div>
                  <div className={`font-bold ${task.completed ? 'line-through opacity-50' : ''}`}>
                    {task.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* OPPORTUNITIES: Active Targets */}
          <div className="bg-white border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <div className="flex items-center justify-between mb-6 border-b-4 border-black pb-4">
              <h3 className="font-black uppercase text-xl">Active Targets</h3>
              <Link href="/dashboard/jobs" className="text-sm font-black underline decoration-4 decoration-[#90c0ff] hover:text-[#90c0ff]">All</Link>
            </div>
            {recentJobs.length > 0 ? (
              <div className="space-y-4">
                {recentJobs.map(job => (
                  <div key={job.id} className="border-4 border-black p-4 hover:bg-[#faf8f5] transition-colors cursor-pointer">
                    <div className="font-black uppercase text-lg mb-1">{job.roleTitle}</div>
                    <div className="font-bold text-sm mb-4 bg-[#ff90e8] inline-block px-1 border-2 border-black -rotate-1">{job.company}</div>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-3 bg-white border-2 border-black relative">
                        <div 
                          className="h-full bg-[#90c0ff] border-r-2 border-black"
                          style={{ width: `${job.matchAnalysis?.overallScore ?? 0}%` }}
                        />
                      </div>
                      <span className="font-black text-lg">{job.matchAnalysis?.overallScore ?? 0}%</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 bg-[#faf8f5] border-4 border-black border-dashed">
                <div className="w-16 h-16 bg-[#90c0ff] border-4 border-black rounded-full flex items-center justify-center mx-auto mb-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  <Target className="w-8 h-8" />
                </div>
                <div className="font-black uppercase text-lg">No Targets</div>
                <div className="font-bold text-sm mt-2 mb-6 px-4">Start tracking a job to see it here</div>
                <Link href="/dashboard/jobs">
                  <Button className="rounded-none border-4 border-black bg-white text-black font-black uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    Add Target
                  </Button>
                </Link>
              </div>
            )}
          </div>
          
        </div>
      </div>
    </div>
  );
}
