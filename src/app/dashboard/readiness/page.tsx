'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, Flame, CheckCircle2, User, 
  GraduationCap, Briefcase, Calendar, Loader2, Sparkles, 
  Award, Code2, Play, Search, Zap 
} from 'lucide-react';
import Link from 'next/link';

interface CareerModel {
  experienceLevel: string;
}

export default function CareerReadinessPage() {
  const [careerModel, setCareerModel] = useState<CareerModel | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [streak, setStreak] = useState(0);
  const [xp, setXp] = useState(0);
  const [level, setLevel] = useState(1);
  const [missions, setMissions] = useState<any[]>([]);

  useEffect(() => {
    // Fetch user career goals
    fetch('/api/personal-career')
      .then(res => res.json())
      .then(data => {
        setCareerModel(data);
      })
      .catch(err => console.error('Error loading career details:', err));

    // Fetch user gamification achievements and missions
    fetch('/api/gamification/missions')
      .then(res => res.json())
      .then(data => {
        if (data.mission) {
          const tasks = data.mission.tasks as Array<{ id: string; label: string; completed: boolean; type: string }>;
          const mappedMissions = tasks.map(t => {
            let link = '/dashboard';
            if (t.type === 'ASSESSMENT') link = '/dashboard/assess';
            if (t.type === 'CODING') link = '/dashboard/code';
            if (t.type === 'RESUME_IMPROVED') link = '/dashboard/resumes';
            if (t.type === 'INTERVIEW') link = '/dashboard/interview';
            if (t.type === 'ATS_IMPROVED') link = '/dashboard/resume-intelligence';
            
            return {
              id: t.id,
              label: t.label,
              done: t.completed,
              xp: 50,
              link
            };
          });
          setMissions(mappedMissions);
        }
        setStreak(data.streak || 0);
        setXp(data.xp || 0);
        setLevel(data.level || 1);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error loading gamification data:', err);
        setLoading(false);
      });
  }, []);

  const handleToggleMode = async (mode: 'FRESHER' | 'ENTRY') => {
    if (!careerModel) return;
    setUpdating(true);
    try {
      const res = await fetch('/api/personal-career', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...careerModel,
          experienceLevel: mode
        })
      });
      const data = await res.json();
      setCareerModel(data);
    } catch (err) {
      console.error('Failed to change mode:', err);
    } finally {
      setUpdating(false);
    }
  };

  const handleCompleteMission = async (id: string) => {
    const task = missions.find(m => m.id === id);
    if (!task || task.done) return;

    setUpdating(true);
    try {
      const res = await fetch('/api/gamification/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId: id })
      });
      const data = await res.json();
      if (data.success) {
        setMissions(prev => prev.map(m => m.id === id ? { ...m, done: true } : m));
        setXp(data.newTotalXp);
        setLevel(data.newLevel);
      }
    } catch (err) {
      console.error('Failed to complete daily mission task:', err);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  const isFresher = careerModel?.experienceLevel === 'FRESHER';

  // Calculate readiness score based on settings and checked tasks
  const completedMissionsCount = missions.filter(m => m.done).length;
  const readinessIndex = isFresher 
    ? Math.min(100, 65 + (completedMissionsCount * 10)) 
    : Math.min(100, 75 + (completedMissionsCount * 7));

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      
      <div className="space-y-1">
        <h1 className="text-2xl font-black text-foreground flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-emerald-600" />
          Career Readiness Hub
        </h1>
        <p className="text-sm text-muted-foreground">
          Track your preparation index, complete daily missions, and toggle career modes.
        </p>
      </div>

      {/* Mode selection block */}
      <div className="bg-card border border-border/80 rounded-2xl p-5 space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm text-slate-900">Career Onboarding Mode</h3>
            <p className="text-xs text-slate-500">Toggle whether Rolevia prioritizes academic or professional evidence.</p>
          </div>
          {updating && <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => handleToggleMode('FRESHER')}
            disabled={updating}
            className={`p-4 rounded-xl border text-left transition-all ${
              isFresher 
                ? 'border-emerald-500 bg-emerald-50/20 dark:bg-emerald-950/20 ring-1 ring-emerald-500' 
                : 'border-border bg-white hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <GraduationCap className={`w-5 h-5 ${isFresher ? 'text-emerald-600' : 'text-slate-500'}`} />
              <div className="text-left">
                <p className="text-sm font-bold text-slate-900">Fresher Mode</p>
                <p className="text-[10px] text-slate-500 mt-0.5 leading-relaxed">Prioritizes academic degrees, engineering projects, hackathons, and certifications.</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => handleToggleMode('ENTRY')}
            disabled={updating}
            className={`p-4 rounded-xl border text-left transition-all ${
              !isFresher 
                ? 'border-emerald-500 bg-emerald-50/20 dark:bg-emerald-950/20 ring-1 ring-emerald-500' 
                : 'border-border bg-white hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Briefcase className={`w-5 h-5 ${!isFresher ? 'text-emerald-600' : 'text-slate-500'}`} />
              <div className="text-left">
                <p className="text-sm font-bold text-slate-900">Professional Mode</p>
                <p className="text-[10px] text-slate-500 mt-0.5 leading-relaxed">Prioritizes professional work history, roles, system architecture design, and business metrics.</p>
              </div>
            </div>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Side: Score & Streaks */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Score card */}
          <Card className="border border-border/80 shadow-sm bg-gradient-to-b from-card to-muted/20">
            <CardContent className="p-6 text-center space-y-4">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">ROLEVIA READINESS INDEX</p>
              
              <div className="w-28 h-28 rounded-full border-8 border-emerald-500/20 border-t-emerald-500 flex items-center justify-center mx-auto relative">
                <span className="text-3xl font-black text-slate-900">{readinessIndex}%</span>
              </div>

              <div>
                <p className="text-sm font-bold text-slate-900">
                  {readinessIndex > 80 ? 'Highly Ready' : readinessIndex > 65 ? 'Moderately Prepared' : 'Needs Preparation'}
                </p>
                <p className="text-[10px] text-slate-500 mt-1 max-w-[200px] mx-auto">
                  {isFresher 
                    ? 'Verify projects and complete basic tests to reach 85%.' 
                    : 'Add measurable business statistics to reach 90%.'}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Streak tracker */}
          <Card className="border border-border/80 shadow-sm">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Flame className="w-5 h-5 text-amber-500 fill-amber-500 animate-pulse" />
                  <h3 className="font-bold text-sm text-slate-900">Daily Activity Streak</h3>
                </div>
                <span className="text-xs bg-amber-50 text-amber-600 px-2 py-0.5 rounded-full font-bold">{streak} DAYS active</span>
              </div>

              <div className="flex justify-between items-center gap-1.5 pt-2">
                {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => {
                  const isActive = i < streak;
                  return (
                    <div key={i} className="flex flex-col items-center gap-1">
                      <div className={`w-8 h-8 rounded-full border flex items-center justify-center font-bold text-xs ${
                        isActive 
                          ? 'bg-amber-500 border-amber-500 text-white shadow-sm' 
                          : 'border-border bg-muted/20 text-muted-foreground'
                      }`}>
                        {day}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

        </div>

        {/* Right Side: Daily Missions */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase text-slate-500 tracking-wider">Daily missions</h3>
            <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-bold uppercase">Resets in 9h</span>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {missions.map(m => (
              <div 
                key={m.id}
                className={`p-4 rounded-xl border flex items-center justify-between gap-4 transition-all ${
                  m.done 
                    ? 'bg-emerald-50/10 border-emerald-250/50 text-slate-500' 
                    : 'bg-white border-border hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <button onClick={() => handleCompleteMission(m.id)}>
                    {m.done ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    ) : (
                      <div className="w-5 h-5 rounded-full border border-slate-300 hover:border-slate-500 shrink-0" />
                    )}
                  </button>
                  <div>
                    <p className={`text-sm font-semibold ${m.done ? 'line-through' : 'text-slate-900'}`}>{m.label}</p>
                    <span className="text-[10px] text-emerald-650 bg-emerald-50 px-1.5 py-0.5 rounded font-bold">+{m.xp} XP</span>
                  </div>
                </div>
                {!m.done && (
                  <Link href={m.link}>
                    <Button variant="outline" size="sm" className="rounded-lg h-9 text-xs">
                      Start <Play className="w-3 h-3 ml-1 text-slate-500" />
                    </Button>
                  </Link>
                )}
              </div>
            ))}
          </div>

          {/* Core loop tips based on mode */}
          <div className="rounded-2xl border border-dashed border-border p-5 space-y-2">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" /> Mode Recommendations
            </h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {isFresher 
                ? 'Your account is in Fresher Mode. Ensure that your Github projects list has clear architecture explanations. Your resume is parsed primarily targeting software engineering fundamentals, coding certifications, and hackathon projects.'
                : 'Your account is in Professional Mode. Ensure that every job experience bullet contains a measurable metric. Rolevia evaluates your alignment scores based on direct corporate execution, code ownership, and past team size.'}
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}
