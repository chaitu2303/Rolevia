import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import {
  Briefcase, FileText, Brain, Code2,
  FlameKindling, Zap, Target, CheckCircle,
  TrendingUp, Trophy, ArrowRight, Activity, Rocket, Info, LayoutDashboard
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const dynamic = 'force-dynamic';

function getHourGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

function ReadinessBar({ score, label, colorClass }: { score: number; label: string; colorClass: string }) {
  return (
    <div className="space-y-2 mb-4">
      <div className="flex justify-between text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        <span>{label}</span>
        <span className="text-foreground">{score}%</span>
      </div>
      <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
        <div
          className={`h-full ${colorClass} transition-all duration-1000 ease-out`}
          style={{ width: `${score}%` }}
        />
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
      assessmentAttempts: {
        where: { status: 'COMPLETED' },
        orderBy: { completedAt: 'desc' },
        take: 1,
        include: { evaluationResult: true }
      },
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
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-10 bg-background min-h-[calc(100vh-4rem)]">

      {/* TOP AREA: Hero & Status */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-border pb-8">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl md:text-4xl font-black text-foreground">
              {getHourGreeting()}, {userName}
            </h1>
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-primary/10 border border-primary/20 text-primary text-xs font-bold rounded-full">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              AI CORE ONLINE
            </div>
          </div>
          <p className="text-muted-foreground text-sm max-w-2xl">
            {hasProfile
              ? `Target: ${profile.targetRole || profile.domain || 'Software Engineering'}. Profile ${completenessScore}% complete.`
              : "Welcome. Let's build your verified profile."}
          </p>
        </div>
        
        <div className="flex items-center gap-6">
          <Card className="rounded-2xl border-border shadow-sm bg-card overflow-hidden">
            <CardContent className="p-4 flex items-center gap-6">
              <div className="flex flex-col items-center">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Streak</span>
                <div className="flex items-center gap-1.5 text-orange-500">
                  <FlameKindling className="w-5 h-5" />
                  <span className="text-xl font-black">{streak}</span>
                </div>
              </div>
              <div className="w-px h-10 bg-border" />
              <div className="flex flex-col items-center">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Level</span>
                <div className="flex items-center gap-1.5 text-primary">
                  <Zap className="w-5 h-5" />
                  <span className="text-xl font-black">{level}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Feature Discovery Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: "Resume Tailor", text: "Match your resume perfectly to any Job Description in 5 seconds.", icon: FileText, color: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/20" },
          { title: "Mock Interview", text: "Practice real questions with an AI hiring manager. Get instant feedback.", icon: Brain, color: "text-purple-500", bg: "bg-purple-500/10", border: "border-purple-500/20" },
          { title: "Job Intel", text: "Track your applications and see your real ATS match scores.", icon: Briefcase, color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/20" },
          { title: "Auto-Apply", text: "Our bot fills out the boring application forms for you in the background.", icon: Rocket, color: "text-primary", bg: "bg-primary/10", border: "border-primary/20" },
        ].map((note, i) => (
          <div key={i} className={`p-5 rounded-2xl border bg-card shadow-sm hover:shadow-md transition-all cursor-pointer group ${note.border}`}>
            <div className={`w-10 h-10 rounded-xl ${note.bg} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
              <note.icon className={`w-5 h-5 ${note.color}`} />
            </div>
            <h4 className="font-semibold text-foreground text-sm mb-1">{note.title}</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">{note.text}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* PRIMARY ACTION: Next Best Action */}
          <Card className="rounded-3xl border border-primary/20 shadow-lg bg-gradient-to-br from-primary/10 via-card to-card relative overflow-hidden">
            <CardContent className="p-8">
              <div className="absolute top-6 right-6 bg-primary/10 text-primary border border-primary/20 px-3 py-1 font-bold text-[10px] uppercase tracking-wider rounded-full">
                Priority Action
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-3 flex items-center gap-2">
                <Target className="w-6 h-6 text-primary" /> Next Step
              </h2>
              <p className="text-muted-foreground mb-8 max-w-lg leading-relaxed">
                Complete your <span className="font-semibold text-foreground">{profile?.domain === 'swe' ? 'Core Engineering' : profile?.domain || 'Baseline'}</span> assessment to verify your skills and unlock advanced tailoring.
              </p>
              <Link href="/dashboard/assess">
                <Button className="h-11 px-6 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 font-medium transition-all group">
                  Start Assessment <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* PROGRESS: Career Readiness & Achievements */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Card className="rounded-2xl border-border shadow-sm bg-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-foreground">Readiness</h3>
                  <TrendingUp className="w-5 h-5 text-primary" />
                </div>
                <div className="flex items-end gap-2 mb-6 border-b border-border pb-4">
                  <span className="text-5xl font-black text-foreground leading-none">{completenessScore}</span>
                  <span className="text-sm font-medium text-muted-foreground mb-1">/ 100</span>
                </div>
                <ReadinessBar score={Math.min(100, skillCount * 10)} label="Skills" colorClass="bg-blue-500" />
                <ReadinessBar score={Math.min(100, expCount * 25)} label="Experience" colorClass="bg-purple-500" />
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-border shadow-sm bg-card flex flex-col justify-between">
              <CardContent className="p-6 flex-1 flex flex-col">
                <div className="flex items-center justify-between mb-4 border-b border-border pb-4">
                  <h3 className="font-semibold text-foreground">Latest Win</h3>
                  <Trophy className="w-5 h-5 text-amber-500" />
                </div>
                {dbUser?.userBadges && dbUser.userBadges.length > 0 ? (
                  <div className="flex-1 flex flex-col justify-center">
                    <div className="w-12 h-12 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center justify-center mb-4 text-amber-500">
                      <Trophy className="w-6 h-6" />
                    </div>
                    <div className="font-semibold text-foreground">{dbUser.userBadges[0].badge.name}</div>
                    <div className="text-xs text-muted-foreground mt-1">Earned recently. Keep pushing!</div>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-center py-6 bg-muted/20 border border-dashed border-border rounded-xl">
                    <Trophy className="w-8 h-8 text-muted-foreground/30 mb-2" />
                    <div className="font-medium text-sm text-muted-foreground">No Badges Yet</div>
                  </div>
                )}
                <Link href="/dashboard/achievements" className="mt-6 w-full">
                  <Button variant="outline" className="w-full">View Passport</Button>
                </Link>
              </CardContent>
            </Card>
          </div>
          
          {/* Weakness Insights & Quick Tools */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Quick Tools */}
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-4 uppercase tracking-wider">Quick Tools</h3>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { href: "/dashboard/ats", icon: FileText, label: "ATS Tailor", color: "text-blue-500", bg: "bg-blue-500/10" },
                  { href: "/dashboard/jobs", icon: Briefcase, label: "Job Intel", color: "text-amber-500", bg: "bg-amber-500/10" },
                  { href: "/dashboard/interview", icon: Brain, label: "Mock Chat", color: "text-purple-500", bg: "bg-purple-500/10" },
                  { href: "/dashboard/code", icon: Code2, label: "Code Arena", color: "text-primary", bg: "bg-primary/10" },
                ].map((tool, i) => (
                  <Link key={i} href={tool.href} className={`flex flex-col items-center justify-center gap-3 p-4 rounded-2xl border border-border bg-card shadow-sm hover:shadow-md hover:bg-muted/30 transition-all`}>
                    <div className={`w-8 h-8 rounded-xl ${tool.bg} flex items-center justify-center`}>
                      <tool.icon className={`w-4 h-4 ${tool.color}`} />
                    </div>
                    <span className="font-medium text-xs text-foreground">{tool.label}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Weakness Insights */}
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-4 uppercase tracking-wider">Weakness Insights</h3>
              <Card className="rounded-2xl border-border shadow-sm bg-card h-[calc(100%-2rem)]">
                <CardContent className="p-5 h-full flex flex-col justify-center">
                  {dbUser?.assessmentAttempts?.[0]?.evaluationResult?.weakestTopics ? (
                    (() => {
                      const weakest = dbUser.assessmentAttempts[0].evaluationResult.weakestTopics as any[];
                      if (weakest.length > 0) {
                        return (
                          <div className="space-y-4">
                            <div className="text-sm text-muted-foreground mb-2">Focus on improving these areas based on your last assessment:</div>
                            {weakest.slice(0, 3).map((w, i) => (
                              <div key={i} className="flex items-center gap-3">
                                <div className="w-1.5 h-1.5 rounded-full bg-destructive shrink-0" />
                                <span className="text-sm font-medium text-foreground flex-1 truncate">{w.topic || w}</span>
                              </div>
                            ))}
                          </div>
                        );
                      }
                      return (
                        <div className="flex flex-col items-center justify-center text-center py-4 opacity-70">
                          <Brain className="w-6 h-6 text-muted-foreground mb-2" />
                          <div className="text-sm font-medium text-muted-foreground">Strong performance!</div>
                          <div className="text-xs text-muted-foreground mt-1">No critical weaknesses detected.</div>
                        </div>
                      );
                    })()
                  ) : (
                    <div className="flex flex-col items-center justify-center text-center py-4 opacity-70">
                      <Target className="w-6 h-6 text-muted-foreground mb-2" />
                      <div className="text-sm font-medium text-muted-foreground">No Data Yet</div>
                      <div className="text-xs text-muted-foreground mt-1">Complete an assessment to see insights.</div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-6">
          
          {/* TODAY: Daily Missions */}
          <Card className="rounded-2xl border-border shadow-sm bg-card">
            <CardHeader className="border-b border-border bg-muted/30 pb-4">
              <CardTitle className="text-sm font-semibold flex items-center justify-between text-foreground">
                <span className="flex items-center gap-2"><Activity className="w-4 h-4 text-primary" /> Daily Missions</span>
                <span className="text-[10px] text-muted-foreground font-normal bg-card px-2 py-0.5 rounded border border-border">TODAY</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-5 space-y-3">
              {missionTasks.map((task, i) => (
                <div key={task.id} className="flex items-start gap-3 p-3 rounded-xl border border-border bg-card hover:bg-muted/20 transition-colors">
                  <div className={`mt-0.5 shrink-0 w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${task.completed ? 'bg-success border-success' : 'bg-card border-border'}`}>
                    {task.completed && <CheckCircle className="w-3.5 h-3.5 text-primary-foreground" />}
                  </div>
                  <div className={`text-sm font-medium ${task.completed ? 'line-through text-muted-foreground/60' : 'text-foreground'}`}>
                    {task.label}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* OPPORTUNITIES: Active Targets */}
          <Card className="rounded-2xl border-border shadow-sm bg-card flex flex-col">
            <CardHeader className="border-b border-border bg-muted/30 pb-4">
              <CardTitle className="text-sm font-semibold flex items-center justify-between text-foreground">
                <span className="flex items-center gap-2"><Briefcase className="w-4 h-4 text-amber-500" /> Active Targets</span>
                <Link href="/dashboard/jobs" className="text-[10px] text-primary hover:underline font-semibold uppercase tracking-wider">View All</Link>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-5 flex-1 flex flex-col">
              {recentJobs.length > 0 ? (
                <div className="space-y-3">
                  {recentJobs.map(job => (
                    <div key={job.id} className="p-4 rounded-xl border border-border bg-card hover:bg-muted/30 transition-colors cursor-pointer group">
                      <div className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors">{job.roleTitle}</div>
                      <div className="text-xs text-muted-foreground mt-1 mb-3">{job.company}</div>
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary"
                            style={{ width: `${job.matchAnalysis?.overallScore ?? 0}%` }}
                          />
                        </div>
                        <span className="font-bold text-xs text-foreground">{job.matchAnalysis?.overallScore ?? 0}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center py-8 bg-muted/10 border border-dashed border-border rounded-xl">
                  <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-3">
                    <Target className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div className="font-medium text-sm text-foreground">No Targets</div>
                  <div className="text-xs text-muted-foreground mt-1 mb-4 max-w-[200px]">Start tracking a job to see it here</div>
                  <Link href="/dashboard/jobs">
                    <Button variant="outline" size="sm">Add Target</Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
          
        </div>
      </div>
    </div>
  );
}
