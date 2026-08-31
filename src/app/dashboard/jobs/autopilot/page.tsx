'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Compass, Zap, Loader2, CheckCircle, AlertTriangle, 
  ArrowRight, ShieldCheck, PlayCircle, BookOpen, FileText 
} from 'lucide-react';
import Link from 'next/link';

interface AutopilotRecommendation {
  id: string;
  company: string;
  roleTitle: string;
  autopilotScore: number;
  actionAdvice: string;
  actionBadge: 'APPLY_NOW' | 'FIX_RESUME' | 'LEARN_SKILL' | 'PRACTICE_INTERVIEW';
  actionReason: string;
  metrics: {
    jobMatch: number;
    resumeMatch: number;
    skillReadiness: number;
    interviewReadiness: number;
  };
}

export default function AutopilotPage() {
  const [recommendations, setRecommendations] = useState<AutopilotRecommendation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/jobs/autopilot')
      .then(res => res.json())
      .then(data => {
        if (data.recommendations) {
          setRecommendations(data.recommendations);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching autopilot specs:', err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  const getBadgeStyles = (badge: string) => {
    switch (badge) {
      case 'APPLY_NOW':
        return 'bg-emerald-50 text-emerald-700 border-emerald-250';
      case 'FIX_RESUME':
        return 'bg-blue-50 text-blue-700 border-blue-200/60';
      case 'LEARN_SKILL':
        return 'bg-amber-50 text-amber-700 border-amber-200/60';
      case 'PRACTICE_INTERVIEW':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200/60';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const getActionCTA = (rec: AutopilotRecommendation) => {
    switch (rec.actionBadge) {
      case 'APPLY_NOW':
        return (
          <Link href={`/dashboard/jobs/${rec.id}`}>
            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl flex items-center gap-1">
              Apply Now <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        );
      case 'FIX_RESUME':
        return (
          <Link href="/dashboard/resume-intelligence">
            <Button size="sm" variant="outline" className="text-blue-700 border-blue-200/80 hover:bg-blue-50 rounded-xl flex items-center gap-1">
              <FileText className="w-3.5 h-3.5" /> Fix Resume
            </Button>
          </Link>
        );
      case 'LEARN_SKILL':
        return (
          <Link href="/dashboard/skills/gaps">
            <Button size="sm" variant="outline" className="text-amber-700 border-amber-200/80 hover:bg-amber-50 rounded-xl flex items-center gap-1">
              <BookOpen className="w-3.5 h-3.5" /> Learn Skills
            </Button>
          </Link>
        );
      case 'PRACTICE_INTERVIEW':
        return (
          <Link href="/dashboard/interview">
            <Button size="sm" variant="outline" className="text-indigo-700 border-indigo-200/80 hover:bg-indigo-50 rounded-xl flex items-center gap-1">
              <PlayCircle className="w-3.5 h-3.5" /> Practice Mock
            </Button>
          </Link>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-slate-900 p-6 space-y-6">
      
      <div className="space-y-1">
        <h1 className="text-2xl font-serif font-black text-slate-900 flex items-center gap-2">
          <Compass className="w-6 h-6 text-emerald-600" />
          Application Autopilot
        </h1>
        <p className="text-sm text-slate-655 max-w-2xl">
          Rolevia maps your parsed Resume, Skills index, and Interview metrics to determine the optimal next steps for your saved job applications.
        </p>
      </div>

      {recommendations.length === 0 ? (
        <div className="h-64 flex flex-col items-center justify-center border border-dashed rounded-2xl text-center text-slate-500 p-6 bg-white shadow-sm">
          <Zap className="w-12 h-12 mb-2 text-slate-300" />
          <h3 className="font-semibold text-sm">No target applications saved</h3>
          <p className="text-xs max-w-xs mt-1">Please add target jobs to your application tracker to trigger autopilot ranking analytics.</p>
          <Link href="/dashboard/jobs" className="mt-4">
            <Button size="sm">Explore Jobs Board</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          
          {/* Header Action Spotlight */}
          <Card className="border border-emerald-250 bg-emerald-50/15 p-6 shadow-sm rounded-2xl">
            <CardContent className="p-0 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5" /> Best Next Move Spotlight
                </span>
                <h3 className="font-serif font-black text-xl text-slate-900">
                  {recommendations[0].roleTitle} at {recommendations[0].company}
                </h3>
                <p className="text-xs text-slate-600 max-w-lg">
                  Recommendation Index: <strong className="text-emerald-700">{recommendations[0].autopilotScore}%</strong> · {recommendations[0].actionReason}
                </p>
              </div>
              <div className="shrink-0">
                {getActionCTA(recommendations[0])}
              </div>
            </CardContent>
          </Card>

          {/* Autopilot List */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase text-slate-500 tracking-wider">All Saved Applications Ranked</h3>
            
            <div className="grid grid-cols-1 gap-4">
              {recommendations.map((rec, i) => (
                <div key={rec.id} className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-6 hover:shadow-md transition-shadow">
                  
                  <div className="space-y-3 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-bold text-slate-500">#{i + 1}</span>
                      <h4 className="font-bold text-slate-900 text-sm">{rec.roleTitle}</h4>
                      <span className="text-xs text-slate-400">at</span>
                      <span className="text-xs font-semibold text-slate-700">{rec.company}</span>
                      
                      <span className={`text-[9px] font-bold border px-2 py-0.5 rounded-full uppercase tracking-wider ${getBadgeStyles(rec.actionBadge)}`}>
                        {rec.actionAdvice}
                      </span>
                    </div>

                    <p className="text-xs text-slate-550 leading-relaxed max-w-2xl">{rec.actionReason}</p>

                    {/* Metrics Progress Bars */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-1 border-t border-slate-100/50">
                      <div>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Job Match</p>
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className="text-xs font-bold text-slate-800">{rec.metrics.jobMatch}%</span>
                          <div className="h-1.5 w-16 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-slate-800" style={{ width: `${rec.metrics.jobMatch}%` }} />
                          </div>
                        </div>
                      </div>

                      <div>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Resume Fit</p>
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className="text-xs font-bold text-slate-800">{rec.metrics.resumeMatch}%</span>
                          <div className="h-1.5 w-16 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-slate-800" style={{ width: `${rec.metrics.resumeMatch}%` }} />
                          </div>
                        </div>
                      </div>

                      <div>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Skills Readiness</p>
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className="text-xs font-bold text-slate-800">{rec.metrics.skillReadiness}%</span>
                          <div className="h-1.5 w-16 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-slate-800" style={{ width: `${rec.metrics.skillReadiness}%` }} />
                          </div>
                        </div>
                      </div>

                      <div>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Interview Score</p>
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className="text-xs font-bold text-slate-800">{rec.metrics.interviewReadiness}%</span>
                          <div className="h-1.5 w-16 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-slate-800" style={{ width: `${rec.metrics.interviewReadiness}%` }} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between lg:justify-end gap-6 shrink-0 border-t lg:border-t-0 pt-4 lg:pt-0">
                    <div className="text-right">
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Autopilot Index</p>
                      <p className="text-2xl font-serif font-black text-slate-900">{rec.autopilotScore}%</p>
                    </div>
                    {getActionCTA(rec)}
                  </div>

                </div>
              ))}
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
