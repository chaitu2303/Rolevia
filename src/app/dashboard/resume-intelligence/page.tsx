'use client';

import { useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadZone } from '@/components/resume-intelligence/UploadZone';
import {
  Brain, ChevronDown, ChevronUp, Sparkles,
  FileText, Clock, Zap, Target, Shield, BarChart3
} from 'lucide-react';
import Link from 'next/link';

const EXPERIENCE_LEVELS = [
  { value: 'STUDENT', label: '🎓 Student' },
  { value: 'FRESHER', label: '🌱 Recent Graduate (0–1 yr)' },
  { value: 'ENTRY', label: '📈 Entry Level (0–2 yrs)' },
  { value: 'MID', label: '💼 Mid-Level (2–5 yrs)' },
  { value: 'SENIOR', label: '🚀 Senior (5–10 yrs)' },
  { value: 'LEAD', label: '⭐ Lead / Staff' },
  { value: 'MANAGER', label: '👥 Manager' },
  { value: 'EXECUTIVE', label: '🏆 Executive (C-Suite/VP)' },
];

const ANALYSIS_STAGES = [
  'READING', 'MAPPING', 'ATS_CHECK', 'EXPERIENCE', 'SKILLS', 'IMPACT', 'TARGET_ROLE', 'REPORT'
] as const;

const FEATURES = [
  { icon: Brain, label: 'ATS Compatibility', desc: '20+ format & structure checks' },
  { icon: BarChart3, label: 'Impact Evidence', desc: 'Per-bullet strength scoring' },
  { icon: Target, label: 'Job Match', desc: 'Keyword alignment with JD' },
  { icon: Zap, label: 'Recruiter Readiness', desc: 'First-impression signals' },
  { icon: Shield, label: 'Privacy Scan', desc: 'Bias & privacy flag detection' },
  { icon: Sparkles, label: 'Action Plan', desc: 'Prioritized P0/P1/P2/P3 fixes' },
];

export default function ResumeIntelligenceLanding() {
  const router = useRouter();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [jd, setJd] = useState('');
  const [showJD, setShowJD] = useState(false);
  const [targetRole, setTargetRole] = useState('');
  const [targetCompany, setTargetCompany] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('MID');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStage, setAnalysisStage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [recentReports, setRecentReports] = useState<any[]>([]);
  const [reportsLoaded, setReportsLoaded] = useState(false);
  const stageRef = useRef(0);

  // Load recent reports on mount
  useState(() => {
    fetch('/api/resume-intelligence/reports')
      .then(r => r.json())
      .then(d => {
        setRecentReports(d.reports?.slice(0, 5) ?? []);
        setReportsLoaded(true);
      })
      .catch(() => setReportsLoaded(true));
  });

  const simulate_stages = useCallback(async () => {
    for (const stage of ANALYSIS_STAGES) {
      setAnalysisStage(stage);
      await new Promise(r => setTimeout(r, 800));
    }
  }, []);

  const handleAnalyze = useCallback(async (file?: File, pastedText?: string) => {
    if (!file && !pastedText) return;
    setError(null);
    setIsAnalyzing(true);
    simulate_stages();

    try {
      const formData = new FormData();
      if (file) {
        formData.append('file', file);
      } else if (pastedText) {
        formData.append('text', pastedText);
        formData.append('fileName', 'pasted-resume.txt');
      }
      if (jd.trim()) formData.append('jobDescription', jd.trim());
      if (targetRole.trim()) formData.append('targetRole', targetRole.trim());
      if (targetCompany.trim()) formData.append('targetCompany', targetCompany.trim());
      formData.append('experienceLevel', experienceLevel);

      const res = await fetch('/api/resume-intelligence/analyze', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? 'Analysis failed. Please try again.');
        setIsAnalyzing(false);
        return;
      }

      // Navigate to report
      router.push(`/dashboard/resume-intelligence/${data.reportId}`);
    } catch (err: any) {
      setError(err?.message ?? 'Network error. Please check your connection.');
      setIsAnalyzing(false);
    }
  }, [selectedFile, jd, targetRole, targetCompany, experienceLevel, router, simulate_stages]);

  const handleFileSelect = useCallback((file: File) => {
    setSelectedFile(file);
    setError(null);
  }, []);

  const handleTextInput = useCallback((text: string) => {
    handleAnalyze(undefined, text);
  }, [handleAnalyze]);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Brain className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-foreground">Resume Intelligence</h1>
              <p className="text-sm text-muted-foreground font-medium">Know exactly what your resume is saying before a recruiter sees it.</p>
            </div>
          </div>
        </motion.div>

        {/* Feature pills */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="flex flex-wrap gap-2"
        >
          {FEATURES.map(({ icon: Icon, label, desc }) => (
            <div
              key={label}
              className="flex items-center gap-2 rounded-full border border-border bg-muted/30 px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors"
            >
              <Icon className="w-3.5 h-3.5 text-primary" />
              <span className="font-medium">{label}</span>
            </div>
          ))}
        </motion.div>

        <div className="grid lg:grid-cols-5 gap-6">
          {/* Left: Upload + Config */}
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 }}
            className="lg:col-span-3 space-y-5"
          >
            <div className="rounded-2xl border border-border bg-card p-6 space-y-5">
              <UploadZone
                onFileSelect={handleFileSelect}
                onTextInput={handleTextInput}
                isAnalyzing={isAnalyzing}
                analysisStage={analysisStage}
              />

              {/* Config fields */}
              {!isAnalyzing && (
                <AnimatePresence>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-3"
                  >
                    <div className="grid sm:grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-muted-foreground">Target Role</label>
                        <input
                          type="text"
                          value={targetRole}
                          onChange={e => setTargetRole(e.target.value)}
                          placeholder="e.g. Software Engineer"
                          className="w-full rounded-xl border border-border bg-muted/30 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-ring"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-muted-foreground">Target Company</label>
                        <input
                          type="text"
                          value={targetCompany}
                          onChange={e => setTargetCompany(e.target.value)}
                          placeholder="e.g. Google (optional)"
                          className="w-full rounded-xl border border-border bg-muted/30 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-ring"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-muted-foreground">Experience Level</label>
                      <select
                        value={experienceLevel}
                        onChange={e => setExperienceLevel(e.target.value)}
                        className="w-full rounded-xl border border-border bg-muted/30 px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                      >
                        {EXPERIENCE_LEVELS.map(l => (
                          <option key={l.value} value={l.value}>{l.label}</option>
                        ))}
                      </select>
                    </div>

                    {/* Job Description Toggle */}
                    <div className="space-y-2">
                      <button
                        onClick={() => setShowJD(v => !v)}
                        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <Target className="w-4 h-4 text-primary" />
                        <span>Add job description for Job Match score</span>
                        {showJD ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        {jd.trim() && <span className="text-xs text-success font-medium">✓ Added</span>}
                      </button>
                      <AnimatePresence>
                        {showJD && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                          >
                            <textarea
                              value={jd}
                              onChange={e => setJd(e.target.value)}
                              placeholder="Paste the full job description here for keyword alignment analysis..."
                              rows={6}
                              className="w-full rounded-xl border border-border bg-muted/30 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                            />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Error */}
                    {error && (
                      <div className="rounded-xl bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
                        {error}
                      </div>
                    )}

                    {/* Analyze button */}
                    {selectedFile && (
                      <motion.button
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        onClick={() => handleAnalyze(selectedFile)}
                        disabled={isAnalyzing}
                        className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        <Brain className="w-4 h-4" />
                        Run Resume Intelligence Analysis
                      </motion.button>
                    )}
                  </motion.div>
                </AnimatePresence>
              )}
            </div>
          </motion.div>

          {/* Right: Recent Reports */}
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2 space-y-4"
          >
            <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <h2 className="font-semibold text-foreground text-sm">Recent Analyses</h2>
              </div>

              {!reportsLoaded ? (
                <div className="space-y-2">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-14 rounded-xl bg-muted/50 animate-pulse" />
                  ))}
                </div>
              ) : recentReports.length === 0 ? (
                <div className="text-center py-6 space-y-2">
                  <FileText className="w-8 h-8 text-muted-foreground/40 mx-auto" />
                  <p className="text-sm text-muted-foreground">No previous analyses</p>
                  <p className="text-xs text-muted-foreground/60">Upload your first resume to get started</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {recentReports.map((report: any) => (
                    <Link
                      key={report.id}
                      href={`/dashboard/resume-intelligence/${report.id}`}
                      className="flex items-center gap-3 rounded-xl border border-border bg-muted/30 hover:bg-muted/60 p-3 transition-colors"
                    >
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-black text-sm flex-shrink-0 ${
                        (report.careerOsScore ?? 0) >= 70 ? 'bg-success/10 text-success' :
                        (report.careerOsScore ?? 0) >= 50 ? 'bg-warning/10 text-warning-foreground' :
                        'bg-destructive/10 text-destructive'
                      }`}>
                        {report.careerOsScore ?? '?'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{report.fileName}</p>
                        <p className="text-xs text-muted-foreground">
                          {report.targetRole ?? 'General'} · {new Date(report.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Info card */}
            <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
              <h3 className="font-semibold text-foreground text-sm">How it works</h3>
              <div className="space-y-2.5">
                {[
                  { step: '1', text: 'Upload PDF or DOCX resume' },
                  { step: '2', text: 'Set experience level & role' },
                  { step: '3', text: 'Optionally paste job description' },
                  { step: '4', text: 'Get evidence-traced report in seconds' },
                ].map(({ step, text }) => (
                  <div key={step} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold text-primary">{step}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{text}</p>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground/60">
                Scores are 100% deterministic. Same resume = same score every time.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
