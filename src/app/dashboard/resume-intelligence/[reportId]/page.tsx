'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ScoreDashboard } from '@/components/resume-intelligence/ScoreDashboard';
import { CheckList } from '@/components/resume-intelligence/CheckList';
import { BulletList } from '@/components/resume-intelligence/BulletCard';
import { KeywordMatrix } from '@/components/resume-intelligence/KeywordMatrix';
import { ActionPlan } from '@/components/resume-intelligence/ActionPlan';
import {
  Brain, ArrowLeft, FileText, Target, User, Calendar,
  Shield, Eye, ChevronDown, ChevronUp, Loader2,
  AlertTriangle, CheckCircle2, Zap, BarChart3
} from 'lucide-react';
import Link from 'next/link';

type TabKey = 'overview' | 'ats' | 'ats_preview' | 'content' | 'bullets' | 'keywords' | 'jobmatch' | 'privacy' | 'plan';

const TABS: Array<{ key: TabKey; label: string; icon: any; requiresJD?: boolean }> = [
  { key: 'overview', label: 'Overview', icon: BarChart3 },
  { key: 'ats', label: 'ATS Checklist', icon: Shield },
  { key: 'ats_preview', label: 'ATS Simulation', icon: Eye },
  { key: 'content', label: 'Content Check', icon: FileText },
  { key: 'bullets', label: 'Bullets Impact', icon: Zap },
  { key: 'keywords', label: 'Keywords', icon: Target, requiresJD: true },
  { key: 'jobmatch', label: 'Job Match', icon: Target, requiresJD: true },
  { key: 'privacy', label: 'Privacy Scan', icon: Eye },
  { key: 'plan', label: 'Action Plan', icon: CheckCircle2 },
];

function ReportHeader({ report }: { report: any }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="space-y-1">
          <h1 className="text-xl font-black text-foreground flex items-center gap-2">
            <FileText className="w-5 h-5 text-muted-foreground" />
            {report.fileName}
          </h1>
          <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
            {report.targetRole && (
              <span className="flex items-center gap-1">
                <Target className="w-3.5 h-3.5" /> {report.targetRole}
              </span>
            )}
            {report.targetCompany && (
              <span>@ {report.targetCompany}</span>
            )}
            {report.experienceLevel && (
              <span className="flex items-center gap-1">
                <User className="w-3.5 h-3.5" /> {report.experienceLevel}
              </span>
            )}
            {report.createdAt && (
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {new Date(report.createdAt).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>

        {/* Extraction status badge */}
        {report.extractionStatus !== 'SUCCESS' && (
          <div className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium ${
            report.extractionStatus === 'IMAGE_ONLY'
              ? 'bg-destructive/10 text-destructive border border-destructive/20'
              : 'bg-warning/10 text-warning-foreground border border-warning/20'
          }`}>
            <AlertTriangle className="w-4 h-4" />
            {report.extractionStatus === 'IMAGE_ONLY'
              ? 'Image-only PDF — text could not be extracted'
              : `Extraction confidence: ${report.extractionConfidence}%`
            }
          </div>
        )}
      </div>

      {/* Job description note */}
      {report.hasJobDescription ? (
        <div className="flex items-center gap-2 text-xs text-success font-medium">
          <CheckCircle2 className="w-3.5 h-3.5" />
          Analyzed with job description — Job Match score included
        </div>
      ) : (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <AlertTriangle className="w-3.5 h-3.5" />
          No job description provided — Job Match and Keyword scores not calculated.
          <Link href="/dashboard/resume-intelligence" className="text-primary underline underline-offset-2">Re-analyze with JD →</Link>
        </div>
      )}
    </div>
  );
}

function RecruiterSignals({ signals }: { signals: any[] }) {
  const statusConfig = {
    STRONG: { color: 'text-success', bg: 'bg-success/10', border: 'border-success/20' },
    NEUTRAL: { color: 'text-muted-foreground', bg: 'bg-muted/50', border: 'border-border' },
    WEAK: { color: 'text-destructive', bg: 'bg-destructive/10', border: 'border-destructive/20' },
  };

  return (
    <div className="grid sm:grid-cols-2 gap-3">
      {signals.map((signal: any) => {
        const config = statusConfig[signal.status as keyof typeof statusConfig];
        return (
          <div key={signal.id} className={`rounded-xl border p-4 space-y-2 ${config.bg} ${config.border}`}>
            <div className="flex items-center justify-between">
              <p className="font-medium text-sm text-foreground">{signal.label}</p>
              <span className={`text-xs font-semibold ${config.color}`}>{signal.status}</span>
            </div>
            <p className="text-xs text-muted-foreground">{signal.evidence}</p>
            <p className="text-xs text-foreground/80">{signal.impact}</p>
          </div>
        );
      })}
    </div>
  );
}

function JobMatchDimensions({ dimensions }: { dimensions: any[] }) {
  return (
    <div className="space-y-3">
      {dimensions.map((dim: any) => (
        <div key={dim.dimension} className={`rounded-xl border p-4 space-y-2 ${
          dim.status === 'STRONG' ? 'bg-success/5 border-success/20' :
          dim.status === 'PARTIAL' ? 'bg-warning/5 border-warning/20' :
          'bg-destructive/5 border-destructive/20'
        }`}>
          <div className="flex items-center justify-between">
            <p className="font-medium text-sm text-foreground">{dim.dimension}</p>
            <div className="flex items-center gap-2">
              <span className="text-sm font-black tabular-nums">{dim.score}</span>
              <span className={`text-xs font-medium ${
                dim.status === 'STRONG' ? 'text-success' :
                dim.status === 'PARTIAL' ? 'text-warning-foreground' : 'text-destructive'
              }`}>{dim.status}</span>
            </div>
          </div>
          <div className="h-1.5 rounded-full bg-muted overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${dim.score}%` }}
              transition={{ duration: 0.8 }}
              className={`h-full rounded-full ${
                dim.status === 'STRONG' ? 'bg-success' :
                dim.status === 'PARTIAL' ? 'bg-warning' : 'bg-destructive'
              }`}
            />
          </div>
          <p className="text-xs text-muted-foreground">{dim.evidence}</p>
          {dim.recommendation && (
            <p className="text-xs text-foreground/80">💡 {dim.recommendation}</p>
          )}
        </div>
      ))}
    </div>
  );
}

export default function ReportPage() {
  const params = useParams();
  const router = useRouter();
  const reportId = params?.reportId as string;

  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>('overview');

  useEffect(() => {
    if (!reportId) return;
    fetch(`/api/resume-intelligence/${reportId}`)
      .then(r => r.json())
      .then(data => {
        if (data.error) {
          setError(data.error);
        } else {
          setReport(data.report);
        }
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load report.');
        setLoading(false);
      });
  }, [reportId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-3 text-muted-foreground">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Loading report...</span>
        </div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-3">
          <AlertTriangle className="w-10 h-10 text-destructive mx-auto" />
          <p className="text-foreground font-semibold">{error ?? 'Report not found'}</p>
          <Link href="/dashboard/resume-intelligence" className="text-primary text-sm underline">
            ← Back to Resume Intelligence
          </Link>
        </div>
      </div>
    );
  }

  const filteredTabs = TABS.filter(t => !t.requiresJD || report.hasJobDescription);

  return (
    <div className="min-h-screen bg-background relative selection:bg-primary/20 pb-20">
      {/* Dynamic Background Effect */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/5 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8 relative z-10">
        {/* Top Navigation Bar */}
        <div className="flex items-center justify-between">
          <Link
            href="/dashboard/resume-intelligence"
            className="group flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground transition-all"
          >
            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center group-hover:bg-primary/10 group-hover:text-primary transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </div>
            Back to Intelligence Hub
          </Link>
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 text-sm font-bold bg-primary/10 text-primary rounded-xl hover:bg-primary/20 transition-colors">
              Share Report
            </button>
            <button className="px-4 py-2 text-sm font-bold bg-foreground text-background rounded-xl hover:bg-foreground/90 premium-shadow transition-all">
              Download PDF
            </button>
          </div>
        </div>

        {/* Premium Header */}
        <div className="relative overflow-hidden rounded-3xl border border-border/50 bg-card/50 backdrop-blur-xl shadow-sm">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-blue-500/5" />
          <div className="relative p-6 sm:p-8">
            <ReportHeader report={report} />
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-8">
          {/* Main Content Area */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-8 space-y-6"
          >
            {/* Elegant Tabs */}
            <div className="flex overflow-x-auto gap-2 p-1.5 rounded-2xl border border-border/50 bg-muted/20 backdrop-blur-md hide-scrollbar">
              {filteredTabs.map(tab => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.key;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all flex-shrink-0 relative overflow-hidden ${
                      isActive
                        ? 'text-foreground'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                    }`}
                  >
                    {isActive && (
                      <motion.div 
                        layoutId="activeTab" 
                        className="absolute inset-0 bg-card border border-border/50 rounded-xl shadow-sm z-0" 
                      />
                    )}
                    <span className="relative z-10 flex items-center gap-2">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-primary' : ''}`} />
                      {tab.label}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Tab panels with Glassmorphism */}
            <div className="relative">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 8, filter: 'blur(4px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, y: -8, filter: 'blur(4px)' }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="space-y-6"
                >
                {activeTab === 'overview' && (
                  <div className="space-y-4">
                    {/* Summary */}
                    <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
                      <h2 className="font-semibold text-foreground">Analysis Summary</h2>
                      <p className="text-sm text-muted-foreground">{report.dimensionBreakdown?.ats?.summary}</p>
                    </div>

                    {/* Strengths */}
                    {report.actionPlan && (
                      <ActionPlan
                        items={(report.actionPlan as any[]).slice(0, 5)}
                        criticalCount={(report.actionPlan as any[]).filter((i: any) => i.priority === 'P0').length}
                        highCount={(report.actionPlan as any[]).filter((i: any) => i.priority === 'P1').length}
                        totalCount={(report.actionPlan as any[]).length}
                        summary="Top priority fixes for this resume."
                      />
                    )}

                    {/* Recruiter signals */}
                    {report.recruiterSignals && (
                      <div className="space-y-3">
                        <h3 className="font-semibold text-foreground">Recruiter Readiness</h3>
                        <RecruiterSignals signals={report.recruiterSignals as any[]} />
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'ats' && (
                  <CheckList
                    title="ATS Compatibility Checks"
                    checks={report.checks?.filter((c: any) => c.category !== undefined) ?? []}
                    showCategories={true}
                  />
                )}

                {activeTab === 'ats_preview' && (
                  <div className="space-y-4">
                    <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
                      <div>
                        <h3 className="font-bold text-foreground">ATS Text Parser Simulation</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          This is what a typical text-based recruiting parser extracts from your document. Items missing here will not be searchable by recruiters.
                        </p>
                      </div>

                      {/* Warnings / Disappearing Highlights */}
                      <div className="space-y-2">
                        {report.atsScore !== undefined && report.atsScore < 60 && (
                          <div className="rounded-xl bg-destructive/10 border border-destructive/20 p-4 text-xs text-destructive font-medium">
                            ⚠ High Formatting Risk: Lower parser confidence suggests some text chunks may be scrambled or lost.
                          </div>
                        )}
                        {!report.parsedSections?.some((s: any) => s.type === 'skills') && (
                          <div className="rounded-xl bg-warning/10 border border-warning/20 p-4 text-xs text-warning-foreground font-medium">
                            ✕ Skills section was not mapped. Recruiter search engines won't match your technical competencies.
                          </div>
                        )}
                        {report.checks?.some((c: any) => c.id === 'tables' || c.id === 'special_chars') && (
                          <div className="rounded-xl bg-warning/10 border border-warning/20 p-4 text-xs text-warning-foreground font-medium">
                            ⚠ Table / Special Character Warning: Text inside boxes or columns may be parsed out of order.
                          </div>
                        )}
                        <div className="rounded-xl bg-muted/40 p-4 text-xs text-muted-foreground font-medium">
                          💡 Tip: Your icon-based skill labels or graphic visual rating bars may not be reliably interpreted as text by ATS parsers. Keep skill listings in plain text.
                        </div>
                      </div>

                      {/* Parser Output Simulator Panel */}
                      <div className="bg-slate-950 text-emerald-400 font-mono text-xs rounded-xl p-6 overflow-x-auto space-y-6 max-h-[500px] border border-slate-900 shadow-inner">
                        <div className="space-y-1">
                          <p className="text-white font-bold">{"// CONTACT DETAILS"}</p>
                          <p><span className="text-slate-500">NAME:</span> {report.contact?.name || '--- [UNREADABLE / MISSING]'}</p>
                          <p><span className="text-slate-550">EMAIL:</span> {report.contact?.email || '--- [UNREADABLE / MISSING]'}</p>
                          <p><span className="text-slate-550">PHONE:</span> {report.contact?.phone || '--- [UNREADABLE / MISSING]'}</p>
                          <p><span className="text-slate-550">LINKEDIN:</span> {report.contact?.linkedinUrl || '---'}</p>
                        </div>

                        <div className="space-y-2">
                          <p className="text-white font-bold">{"// WORK EXPERIENCE"}</p>
                          {report.parsedSections?.find((s: any) => s.type === 'experience') ? (
                            <div className="space-y-3 pl-4 border-l border-slate-800">
                              {report.parsedSections
                                .find((s: any) => s.type === 'experience')
                                .bullets?.map((b: string, i: number) => (
                                  <p key={i} className="text-slate-300">• {b}</p>
                                )) || <p className="text-slate-300">{report.parsedSections.find((s: any) => s.type === 'experience').content}</p>}
                            </div>
                          ) : (
                            <p className="text-red-500 pl-4">[No Work Experience section detected by parser]</p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <p className="text-white font-bold">{"// SKILLS"}</p>
                          {report.parsedSections?.find((s: any) => s.type === 'skills') ? (
                            <div className="pl-4 text-slate-300 leading-relaxed">
                              {report.parsedSections
                                .find((s: any) => s.type === 'skills')
                                .content?.split(/[,\n]/)
                                .map((sk: string) => sk.trim())
                                .filter(Boolean)
                                .join(', ')}
                            </div>
                          ) : (
                            <p className="text-red-500 pl-4">[No Skills section detected by parser]</p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <p className="text-white font-bold">{"// EDUCATION"}</p>
                          {report.parsedSections?.find((s: any) => s.type === 'education') ? (
                            <div className="space-y-2 pl-4 border-l border-slate-800 text-slate-300">
                              {report.parsedSections
                                .find((s: any) => s.type === 'education')
                                .bullets?.map((b: string, i: number) => (
                                  <p key={i}>• {b}</p>
                                )) || <p>{report.parsedSections.find((s: any) => s.type === 'education').content}</p>}
                            </div>
                          ) : (
                            <p className="text-red-500 pl-4">[No Education section detected by parser]</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'content' && (
                  <div className="space-y-4">
                    <CheckList
                      title="Content Quality Checks"
                      checks={report.checks?.filter((c: any) => c.category === 'general' || c.section !== undefined) ?? []}
                    />
                  </div>
                )}

                {activeTab === 'bullets' && (
                  <BulletList
                    analyses={report.bulletAnalyses ?? []}
                    title="Bullet Intelligence"
                  />
                )}

                {activeTab === 'keywords' && report.keywordMatches && (
                  <KeywordMatrix keywordMatches={report.keywordMatches as any[]} />
                )}

                {activeTab === 'jobmatch' && report.jobMatchDetail && (
                  <div className="space-y-4">
                    <h3 className="font-semibold text-foreground">Job Match Dimensions</h3>
                    <JobMatchDimensions dimensions={report.jobMatchDetail as any[]} />
                  </div>
                )}

                {activeTab === 'privacy' && (
                  <div className="space-y-3">
                    <h3 className="font-semibold text-foreground">Privacy & Bias Scan</h3>
                    {(report.biasPrivacyFlags as any[])?.length === 0 ? (
                      <div className="rounded-xl bg-success/10 border border-success/20 p-5 flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0" />
                        <div>
                          <p className="font-medium text-success">Clean — No privacy flags detected</p>
                          <p className="text-xs text-success/70 mt-0.5">No unnecessary personal information found.</p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {(report.biasPrivacyFlags as any[]).map((flag: any) => (
                          <div key={flag.id} className={`rounded-xl border p-4 space-y-2 ${
                            flag.severity === 'HIGH' ? 'bg-destructive/10 border-destructive/20' :
                            flag.severity === 'MEDIUM' ? 'bg-warning/10 border-warning/20' :
                            'bg-muted/50 border-border'
                          }`}>
                            <p className="font-medium text-sm text-foreground">{flag.label}</p>
                            <p className="text-xs font-mono text-muted-foreground bg-muted/50 rounded px-2 py-1">{flag.evidence}</p>
                            <p className="text-sm text-foreground/80">💡 {flag.recommendation}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'plan' && report.actionPlan && (
                  <ActionPlan
                    items={report.actionPlan as any[]}
                    criticalCount={(report.actionPlan as any[]).filter((i: any) => i.priority === 'P0').length}
                    highCount={(report.actionPlan as any[]).filter((i: any) => i.priority === 'P1').length}
                    totalCount={(report.actionPlan as any[]).length}
                    summary={`${(report.actionPlan as any[]).length} actionable items to improve your resume.`}
                  />
                )}
              </motion.div>
            </AnimatePresence>
            </div>
          </motion.div>

          {/* Sticky Score Dashboard Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-4"
          >
            <div className="sticky top-24 space-y-6">
              <ScoreDashboard
                careerOsScore={report.careerOsScore ?? 0}
                atsScore={report.atsScore ?? 0}
                contentScore={report.contentScore ?? 0}
                impactScore={report.impactScore ?? 0}
                jobMatchScore={report.jobMatchScore}
                recruiterScore={report.recruiterScore ?? 0}
                consistencyScore={report.consistencyScore}
              />
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
