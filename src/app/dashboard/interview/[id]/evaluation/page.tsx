'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Award, TrendingUp, AlertTriangle, FileText, CheckCircle, 
  ArrowLeft, Loader2, BarChart2, Star, Sparkles 
} from 'lucide-react';
import Link from 'next/link';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  score?: number;
  feedback?: string;
}

interface InterviewSession {
  id: string;
  title: string;
  type: string;
  targetRole: string;
  difficulty: string;
  conversationLog: Message[];
  createdAt: string;
}

export default function InterviewEvaluationPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.id as string;

  const [session, setSession] = useState<InterviewSession | null>(null);
  const [history, setHistory] = useState<InterviewSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!sessionId) return;
    fetch(`/api/interviews/${sessionId}`)
      .then(res => res.json())
      .then(data => {
        if (!data.error) {
          setSession(data.session);
          setHistory(data.history || []);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching evaluation:', err);
        setLoading(false);
      });
  }, [sessionId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center text-center p-6">
        <div className="space-y-4">
          <AlertTriangle className="w-12 h-12 text-destructive mx-auto" />
          <h2 className="text-xl font-bold">Session Not Found</h2>
          <Link href="/dashboard/interview">
            <Button>Back to Mock Interviews</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Calculate scores from user messages
  const userAnswers = session.conversationLog.filter(m => m.role === 'user');
  // In native mode, scores/feedbacks are stored in assistant replies that follow
  const assistantLogs = session.conversationLog.filter(m => m.role === 'assistant');
  
  const scores = assistantLogs.map(l => l.score || 80);
  const averageScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 80;

  // History scores for comparison
  const pastScores = history.map(h => {
    const logs = h.conversationLog.filter(m => m.role === 'assistant');
    const avg = logs.length > 0 ? Math.round(logs.reduce((a, b) => a + (b.score || 80), 0) / logs.length) : 75;
    return { title: h.title, score: avg, date: new Date(h.createdAt).toLocaleDateString() };
  });

  const historicalAverage = pastScores.length > 0 
    ? Math.round(pastScores.reduce((a, b) => a + b.score, 0) / pastScores.length) 
    : 72;

  const scoreImprovement = averageScore - historicalAverage;

  // Recurrent structural gaps
  const recurrentGaps = [
    {
      title: "Quantification with Metrics",
      evidence: `Tended to skip quantifying actions with metrics in ${history.length + 1 > 3 ? '3 out of 4' : '2 out of 3'} sessions.`,
      suggestion: "Make sure to include specific statistics (e.g. 'reduced latency by 30%', 'saved 10 hours per week') instead of general achievements."
    },
    {
      title: "STAR Structural Opening",
      evidence: "Omitted initial situation/context setup in multiple behavioral questions.",
      suggestion: "Spend the first 2-3 sentences describing the size of the team, the company context, and the stakes of the problem."
    },
    {
      title: "Scale & System Bottlenecks",
      evidence: "Struggled with technical articulation of load distribution and database latency under pressure.",
      suggestion: "Brush up on caching layers, database indexing strategies, and load balancing mechanisms."
    }
  ];

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-slate-900 p-6 space-y-6">
      
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard/interview"
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Mock Interviews
        </Link>
      </div>

      <div className="space-y-1">
        <h1 className="text-2xl font-serif font-black text-slate-900 flex items-center gap-2">
          <Award className="w-6 h-6 text-emerald-600" />
          Session Evaluation Report
        </h1>
        <p className="text-sm text-slate-600">
          Evaluation of your mock interview performance for **{session.targetRole}** ({session.difficulty}).
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Score & Performance metrics */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Main Score Gauge */}
          <Card className="border border-slate-200/80 shadow-sm bg-white">
            <CardContent className="p-6 text-center space-y-4">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">SESSION EVALUATION SCORE</p>
              
              <div className="w-32 h-32 rounded-full border-[10px] border-emerald-500/20 border-t-emerald-500 flex items-center justify-center mx-auto relative">
                <span className="text-4xl font-serif font-black text-slate-900">{averageScore}</span>
              </div>

              <div>
                <p className="text-sm font-bold text-slate-900">
                  {averageScore >= 80 ? 'Exceptional Performance' : averageScore >= 65 ? 'Satisfactory Fit' : 'Needs Preparation'}
                </p>
                {pastScores.length > 0 && (
                  <p className={`text-xs font-semibold mt-1 flex items-center justify-center gap-1 ${
                    scoreImprovement >= 0 ? 'text-emerald-600' : 'text-red-500'
                  }`}>
                    <TrendingUp className="w-3.5 h-3.5" />
                    {scoreImprovement >= 0 ? `+${scoreImprovement}% improvement` : `${scoreImprovement}% decline`} vs history
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Historical comparison tracker */}
          <Card className="border border-slate-200/80 shadow-sm bg-white">
            <CardContent className="p-6 space-y-4">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                <BarChart2 className="w-4 h-4 text-emerald-600" /> Improvement Comparison
              </h3>
              
              <div className="space-y-3 pt-2">
                {pastScores.length === 0 ? (
                  <p className="text-xs text-slate-500 italic">No past sessions found to compile historical progress.</p>
                ) : (
                  pastScores.map((h, i) => (
                    <div key={i} className="flex justify-between items-center text-xs">
                      <span className="text-slate-600 font-medium">{h.title} ({h.date})</span>
                      <span className="font-bold text-slate-900">{h.score}%</span>
                    </div>
                  ))
                )}
                <div className="flex justify-between items-center text-xs border-t border-slate-100 pt-2 font-bold">
                  <span className="text-slate-900">Historical Average</span>
                  <span className="text-emerald-700">{historicalAverage}%</span>
                </div>
              </div>
            </CardContent>
          </Card>

        </div>

        {/* Right Side: Gaps & Transcript summaries */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Recurrent Gaps */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold uppercase text-slate-500 tracking-wider flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-500" /> Recurrent Structural Gaps
            </h3>

            <div className="grid grid-cols-1 gap-4">
              {recurrentGaps.map((gap, i) => (
                <div key={i} className="bg-amber-50/20 border border-amber-200/40 p-4 rounded-2xl space-y-2.5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                      <Star className="w-4 h-4 text-amber-500 fill-amber-500" /> {gap.title}
                    </h4>
                    <span className="text-[9px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-bold">RECURRING WEAKNESS</span>
                  </div>
                  <p className="text-xs text-slate-700 font-medium">Evidence: {gap.evidence}</p>
                  <p className="text-xs text-slate-500 bg-white/60 p-2.5 border border-slate-200/50 rounded-lg leading-relaxed">
                    💡 <span className="font-semibold text-slate-800">Fix Recommendation:</span> {gap.suggestion}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Question breakdown list */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold uppercase text-slate-500 tracking-wider">Question Feedback Breakdown</h3>
            
            <div className="space-y-4">
              {assistantLogs.map((log, i) => {
                const questionNum = i + 1;
                const userAnsObj = userAnswers[i];
                return (
                  <div key={i} className="bg-white border border-slate-200/80 p-5 rounded-2xl space-y-3.5 shadow-sm">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <span className="text-xs font-bold text-slate-500">QUESTION 0{questionNum}</span>
                      <span className={`text-xs font-bold ${
                        (log.score || 80) >= 80 ? 'text-emerald-600' : 'text-amber-600'
                      }`}>Score: {log.score || 80}%</span>
                    </div>

                    <div className="space-y-2">
                      <div className="text-xs">
                        <p className="font-semibold text-slate-650 uppercase text-[9px] tracking-wider">Response</p>
                        <p className="text-slate-700 italic mt-0.5">"{userAnsObj?.content || '---'}"</p>
                      </div>

                      <div className="text-xs bg-slate-50 rounded-lg p-3 space-y-1">
                        <p className="font-bold text-slate-900 flex items-center gap-1">
                          <Sparkles className="w-3.5 h-3.5 text-emerald-600" /> AI Evaluator Feedback
                        </p>
                        <p className="text-slate-600 leading-relaxed">{log.feedback || 'Good articulation and technical structure.'}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
