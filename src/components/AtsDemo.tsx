'use client';

import { useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload, FileText, CheckCircle, XCircle, AlertTriangle,
  Loader2, RotateCcw, Star, ArrowRight, ChevronDown, ChevronUp,
  Copy, Check, Lightbulb, TrendingUp, Info, Shield, Zap, LogIn, Download
} from 'lucide-react';
import Link from 'next/link';
import { saveAtsPendingResult } from '@/lib/ats/AtsPersistence';

type Severity = 'CRITICAL' | 'HIGH' | 'MEDIUM';
type Category = 'CONTENT' | 'SECTIONS' | 'ATS_ESSENTIALS';

interface Issue {
  category: Category;
  severity: Severity;
  title: string;
  description: string;
  fix: string;
}

interface ScanResult {
  overallScore: number;
  parseRate: number;
  contentScore: number;
  sectionsScore: number;
  formattingScore: number;
  issues: Issue[];
  strengths: string[];
  summary: string;
}

// ── Grade Utilities ────────────────────────────────────────────────────────────

function getGrade(score: number): { grade: string; label: string; color: string } {
  if (score >= 90) return { grade: 'A+', label: 'Excellent', color: '#23a094' };
  if (score >= 80) return { grade: 'A', label: 'Great', color: '#23a094' };
  if (score >= 70) return { grade: 'B+', label: 'Good', color: '#7ec800' };
  if (score >= 60) return { grade: 'B', label: 'Fair', color: '#FFE500' };
  if (score >= 50) return { grade: 'C', label: 'Needs Work', color: '#FF9500' };
  return { grade: 'D', label: 'Poor', color: '#ff4040' };
}

function getBarColor(score: number) {
  if (score >= 80) return 'bg-[#23a094]';
  if (score >= 60) return 'bg-[#FFE500]';
  return 'bg-[#ff4040]';
}

// ── Severity Config ────────────────────────────────────────────────────────────
const SEV: Record<Severity, { bg: string; text: string; icon: React.ElementType; label: string; borderColor: string }> = {
  CRITICAL: { bg: 'bg-red-500', text: 'text-white', icon: XCircle, label: 'Critical', borderColor: 'border-red-500' },
  HIGH: { bg: 'bg-orange-400', text: 'text-white', icon: AlertTriangle, label: 'High Priority', borderColor: 'border-orange-400' },
  MEDIUM: { bg: 'bg-[#FFE500]', text: 'text-black', icon: Info, label: 'Medium', borderColor: 'border-yellow-400' },
};

// ── Category explanations ──────────────────────────────────────────────────────
const CAT_INFO: Record<Category, { label: string; description: string; icon: React.ElementType }> = {
  CONTENT: {
    label: 'Content Quality',
    description: 'How well your achievements, action verbs, and bullet points read to both ATS and human recruiters.',
    icon: FileText,
  },
  SECTIONS: {
    label: 'Resume Sections',
    description: 'Whether all critical resume sections (Experience, Education, Skills, Contact) are present and correctly labeled.',
    icon: Shield,
  },
  ATS_ESSENTIALS: {
    label: 'ATS Compatibility',
    description: 'Technical formatting factors that determine if an ATS robot can even read your resume correctly.',
    icon: Zap,
  },
};

// ── Score Meter ────────────────────────────────────────────────────────────────
function ScoreMeter({ score, label, description }: { score: number; label: string; description: string }) {
  const [tip, setTip] = useState(false);
  const grade = getGrade(score);
  return (
    <div className="bg-white border-4 border-black p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-black uppercase text-xs tracking-widest text-gray-500">{label}</p>
          <div className="flex items-end gap-2 mt-1">
            <span className="text-4xl font-black" style={{ color: grade.color }}>{score}</span>
            <span className="text-sm font-bold text-gray-400 pb-1">/100</span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-black" style={{ color: grade.color }}>{grade.grade}</div>
          <div className="text-xs font-black uppercase" style={{ color: grade.color }}>{grade.label}</div>
        </div>
      </div>
      <div className="relative h-3 w-full bg-gray-100 border-2 border-black">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 0.9, ease: 'easeOut' }}
          className={`h-full ${getBarColor(score)}`}
        />
      </div>
      <button
        onClick={() => setTip(!tip)}
        className="text-xs font-bold text-gray-400 flex items-center gap-1 hover:text-black transition-colors"
      >
        <Info className="w-3 h-3" /> What does this measure?
      </button>
      {tip && (
        <p className="text-xs text-gray-600 font-medium bg-gray-50 border-l-4 border-black p-2">{description}</p>
      )}
    </div>
  );
}

// ── Issue Card ─────────────────────────────────────────────────────────────────
function IssueCard({ issue, index }: { issue: Issue; index: number }) {
  const [open, setOpen] = useState(index === 0); // first one open by default
  const [copied, setCopied] = useState(false);
  const cfg = SEV[issue.severity];
  const Icon = cfg.icon;
  const catInfo = CAT_INFO[issue.category];

  const copyFix = () => {
    navigator.clipboard.writeText(issue.fix);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`border-4 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden`}>
      {/* Header */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 p-4 text-left hover:bg-gray-50 transition-colors"
      >
        <div className={`w-8 h-8 flex items-center justify-center shrink-0 ${cfg.bg}`}>
          <Icon className={`w-4 h-4 ${cfg.text}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-black text-sm leading-tight">{issue.title}</div>
          <div className="text-xs font-bold text-gray-500 mt-0.5">{catInfo.label}</div>
        </div>
        <span className={`text-xs font-black px-2 py-1 shrink-0 ${cfg.bg} ${cfg.text}`}>
          {cfg.label}
        </span>
        {open ? <ChevronUp className="w-4 h-4 shrink-0 text-gray-400" /> : <ChevronDown className="w-4 h-4 shrink-0 text-gray-400" />}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="border-t-4 border-black">
              {/* Why it matters */}
              <div className="p-4 bg-[#faf8f5] space-y-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-1">Why This Matters</p>
                  <p className="text-sm font-medium text-gray-700 leading-relaxed">{issue.description}</p>
                </div>

                {/* How to fix it */}
                <div className="bg-white border-4 border-black p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="bg-[#23a094] w-6 h-6 flex items-center justify-center">
                      <Lightbulb className="w-3.5 h-3.5 text-white" />
                    </div>
                    <p className="font-black text-sm uppercase">How to Fix It</p>
                  </div>
                  <p className="text-sm font-medium leading-relaxed text-gray-800">{issue.fix}</p>
                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={copyFix}
                      className="flex items-center gap-1.5 bg-black text-white text-xs font-black px-3 py-2 border-2 border-black hover:bg-gray-800 transition-colors"
                    >
                      {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      {copied ? 'Copied!' : 'Copy Fix Tip'}
                    </button>
                    <Link href="/register">
                      <button className="flex items-center gap-1.5 bg-[#FF90E8] text-black text-xs font-black px-3 py-2 border-2 border-black hover:bg-[#ff70dd] transition-colors">
                        <Zap className="w-3 h-3" />
                        Auto-Fix in Builder
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Overall Score Ring ─────────────────────────────────────────────────────────
function ScoreRing({ score }: { score: number }) {
  const grade = getGrade(score);
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const dash = (score / 100) * circumference;

  return (
    <div className="relative w-40 h-40 mx-auto">
      <svg viewBox="0 0 140 140" className="w-full h-full -rotate-90">
        <circle cx="70" cy="70" r={radius} stroke="#e5e7eb" strokeWidth="12" fill="none" />
        <motion.circle
          cx="70" cy="70" r={radius}
          stroke={grade.color}
          strokeWidth="12"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference - dash }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-black" style={{ color: grade.color }}>{score}</span>
        <span className="text-xs font-black text-gray-400 uppercase tracking-widest">/100</span>
        <span className="text-sm font-black mt-1" style={{ color: grade.color }}>{grade.grade} — {grade.label}</span>
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────
const SUGGESTED_CHECKS = [
  '✓ ATS Parse Rate',
  '✓ Contact Information',
  '✓ Action Verbs',
  '✓ Quantified Achievements',
  '✓ Section Completeness',
  '✓ Formatting Rules',
];

export function AtsDemo() {
  const router = useRouter();
  const [dragActive, setDragActive] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<Category | 'ALL'>('ALL');
  const inputRef = useRef<HTMLInputElement>(null);

  const runScan = useCallback(async (file: File) => {
    setFileName(file.name);
    setScanning(true);
    setResult(null);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/ats/quick-scan', { method: 'POST', body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to analyze resume.');
      setResult(data.result);
      // Persist result so it survives login redirect
      saveAtsPendingResult({ ...data.result, fileName: file.name });
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setScanning(false);
    }
  }, []);

  // Save result and redirect to login → after login lands on ATS dashboard
  const handleGoFix = () => {
    if (result) saveAtsPendingResult({ ...result, fileName: fileName || undefined });
    router.push('/login?callbackUrl=/dashboard/ats&reason=ats_fix');
  };

  // Download a plain text report
  const handleDownloadReport = () => {
    if (!result) return;
    const lines = [
      `ATS ANALYSIS REPORT — Placement2Job`,
      `File: ${fileName || 'Unknown'}`,
      `Date: ${new Date().toLocaleDateString()}`,
      ``,
      `═══════════════════════════════`,
      `OVERALL SCORE: ${result.overallScore}/100`,
      `═══════════════════════════════`,
      `Parse Rate:    ${result.parseRate}/100`,
      `Content:       ${result.contentScore}/100`,
      `Sections:      ${result.sectionsScore}/100`,
      `Formatting:    ${result.formattingScore}/100`,
      ``,
      `SUMMARY`,
      `───────`,
      result.summary,
      ``,
      `WHAT'S WORKING`,
      `──────────────`,
      ...result.strengths.map(s => `✓ ${s}`),
      ``,
      `ISSUES TO FIX (${result.issues.length} found)`,
      `────────────────────────────────`,
      ...result.issues.map((issue, i) => [
        ``,
        `${i + 1}. [${issue.severity}] ${issue.title}`,
        `   Category: ${issue.category}`,
        `   Problem: ${issue.description}`,
        `   Fix: ${issue.fix}`,
      ].join('\n')),
      ``,
      `─────────────────────────────────────────`,
      `Generated by Placement2Job · placement2job.vercel.app`,
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ATS_Report_${fileName?.replace(/\.[^.]+$/, '') || 'resume'}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFile = useCallback((file: File) => {
    const ext = file.name.toLowerCase();
    if (!ext.endsWith('.pdf') && !ext.endsWith('.docx') && !ext.endsWith('.doc') && !ext.endsWith('.txt')) {
      setError('Please upload a PDF, DOCX, or TXT file.');
      return;
    }
    runScan(file);
  }, [runScan]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
  }, [handleFile]);

  const reset = () => { setResult(null); setError(null); setFileName(null); if (inputRef.current) inputRef.current.value = ''; };

  const filteredIssues = result?.issues?.filter(i => activeCategory === 'ALL' || i.category === activeCategory) || [];

  const critCount = result?.issues?.filter(i => i.severity === 'CRITICAL').length || 0;
  const highCount = result?.issues?.filter(i => i.severity === 'HIGH').length || 0;
  const midCount = result?.issues?.filter(i => i.severity === 'MEDIUM').length || 0;

  return (
    <section className="w-full bg-[#faf8f5] border-t-8 border-black py-24 px-6">
      <div className="max-w-6xl mx-auto space-y-16">

        {/* Header */}
        <div className="text-center space-y-5">
          <div className="inline-flex items-center gap-2 bg-[#FF90E8] border-4 border-black px-4 py-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rotate-1">
            <Zap className="w-4 h-4" />
            <span className="font-black text-sm uppercase tracking-widest">Free · Instant · No Login</span>
          </div>
          <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tight leading-none">
            Is Your Resume<br /><span className="text-[#23a094]">ATS-Proof?</span>
          </h2>
          <p className="text-lg font-bold max-w-xl mx-auto text-gray-600">
            Upload your resume and get a real, detailed ATS report — exactly what hiring companies see when they scan your application.
          </p>
          {/* What we check */}
          <div className="flex flex-wrap justify-center gap-2 pt-2">
            {SUGGESTED_CHECKS.map((c) => (
              <span key={c} className="bg-white border-2 border-black px-3 py-1 text-xs font-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">{c}</span>
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">

          {/* ── Upload State ─────────────────────────────────── */}
          {!scanning && !result && (
            <motion.div key="upload" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="max-w-2xl mx-auto space-y-4">
              <div
                onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                onDragLeave={() => setDragActive(false)}
                onDrop={handleDrop}
                onClick={() => inputRef.current?.click()}
                className={`relative cursor-pointer border-4 border-dashed border-black p-16 text-center transition-all ${
                  dragActive ? 'bg-[#FFE500] shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] scale-105' : 'bg-white hover:bg-gray-50 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]'
                }`}
              >
                <input ref={inputRef} type="file" accept=".pdf,.docx,.doc,.txt" className="hidden" onChange={(e) => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }} />
                <div className="space-y-4">
                  <div className="flex justify-center">
                    <div className="bg-[#FFE500] border-4 border-black w-20 h-20 flex items-center justify-center shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] -rotate-2">
                      <Upload className="w-10 h-10" />
                    </div>
                  </div>
                  <div>
                    <p className="text-2xl font-black uppercase">Drop Your Resume Here</p>
                    <p className="text-gray-500 font-bold mt-1">or click to browse</p>
                    <p className="text-xs font-black uppercase tracking-widest text-gray-400 mt-2">PDF · DOCX · TXT · Max 5MB</p>
                  </div>
                </div>
              </div>
              {error && (
                <div className="p-4 bg-red-50 border-4 border-red-500 font-bold text-red-700 flex items-center gap-3">
                  <XCircle className="w-5 h-5 shrink-0" />{error}
                </div>
              )}
            </motion.div>
          )}

          {/* ── Scanning State ───────────────────────────────── */}
          {scanning && (
            <motion.div key="scanning" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="max-w-xl mx-auto text-center py-16 space-y-8">
              <div className="flex justify-center">
                <div className="bg-black border-4 border-black w-24 h-24 flex items-center justify-center shadow-[8px_8px_0px_0px_rgba(255,144,232,1)]">
                  <Loader2 className="w-12 h-12 text-[#FF90E8] animate-spin" />
                </div>
              </div>
              <div>
                <h3 className="text-3xl font-black uppercase">Analyzing Resume...</h3>
                <p className="font-bold text-gray-600 mt-2">Running "{fileName}" through our ATS engine</p>
              </div>
              <div className="grid grid-cols-2 gap-2 text-left max-w-sm mx-auto">
                {['Extracting Text', 'Checking Sections', 'Scoring Content', 'Detecting Issues', 'Measuring Parse Rate', 'Generating Report'].map((step, i) => (
                  <motion.div key={step} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.3 }}
                    className="flex items-center gap-2 bg-white border-2 border-black px-3 py-2 text-xs font-black">
                    <Loader2 className="w-3 h-3 animate-spin text-[#23a094]" />{step}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* ── Results State ────────────────────────────────── */}
          {result && !scanning && (
            <motion.div key="result" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">

              {/* ── TOP SECTION: Score + Summary ──────────────── */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Big Score */}
                <div className="bg-black text-white border-4 border-black p-8 text-center shadow-[8px_8px_0px_0px_rgba(0,0,0,0.2)] flex flex-col items-center justify-center gap-4">
                  <p className="font-black uppercase text-xs tracking-widest text-gray-400">Overall ATS Score</p>
                  <ScoreRing score={result.overallScore} />
                  <div className="flex gap-3 text-xs font-black">
                    <span className="bg-red-500 px-2 py-1">{critCount} Critical</span>
                    <span className="bg-orange-400 px-2 py-1">{highCount} High</span>
                    <span className="bg-[#FFE500] text-black px-2 py-1">{midCount} Medium</span>
                  </div>
                </div>

                {/* Sub Scores */}
                <div className="lg:col-span-2 grid grid-cols-2 gap-4">
                  <ScoreMeter score={result.parseRate} label="Parse Rate" description="How well an ATS robot can extract and read your text. Tables, images, and graphics destroy this score." />
                  <ScoreMeter score={result.contentScore} label="Content Quality" description="Strength of action verbs, quantified achievements, and bullet points. The #1 factor recruiters evaluate." />
                  <ScoreMeter score={result.sectionsScore} label="Sections" description="Whether all critical resume sections exist with standard ATS-readable headings." />
                  <ScoreMeter score={result.formattingScore} label="Formatting" description="Layout, date consistency, name placement, and other ATS-essential formatting rules." />
                </div>
              </div>

              {/* ── AI Summary Banner ──────────────────────────── */}
              <div className="bg-[#FFE500] border-4 border-black p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                <div className="flex items-start gap-4">
                  <div className="bg-black w-10 h-10 flex items-center justify-center shrink-0">
                    <TrendingUp className="w-5 h-5 text-[#FFE500]" />
                  </div>
                  <div>
                    <p className="font-black uppercase text-sm tracking-widest mb-1">Detailed Summary</p>
                    <p className="font-bold text-lg leading-relaxed">{result.summary}</p>
                  </div>
                </div>
              </div>

              {/* ── MAIN REPORT BODY ──────────────────────────── */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* Left: Strengths + CTA */}
                <div className="lg:col-span-4 space-y-5">
                  {/* Strengths */}
                  <div className="bg-white border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                    <div className="bg-[#23a094] text-white px-5 py-4 border-b-4 border-black flex items-center gap-2">
                      <Star className="w-5 h-5" />
                      <h3 className="font-black uppercase">What's Working Well</h3>
                    </div>
                    <div className="p-5 space-y-4">
                      {result.strengths.length === 0 ? (
                        <p className="text-sm font-bold text-gray-500">No major strengths detected. Focus on fixing the issues listed.</p>
                      ) : result.strengths.map((s, i) => (
                        <div key={i} className="flex gap-3 items-start border-l-4 border-[#23a094] pl-3">
                          <CheckCircle className="w-5 h-5 text-[#23a094] shrink-0 mt-0.5" />
                          <p className="font-bold text-sm leading-snug">{s}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Category breakdown */}
                  <div className="bg-white border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-5 space-y-4">
                    <h3 className="font-black uppercase">Issues by Type</h3>
                    {(['CONTENT', 'SECTIONS', 'ATS_ESSENTIALS'] as Category[]).map(cat => {
                      const count = result.issues.filter(i => i.category === cat).length;
                      const catInfo = CAT_INFO[cat];
                      const CatIcon = catInfo.icon;
                      return (
                        <button
                          key={cat}
                          onClick={() => setActiveCategory(activeCategory === cat ? 'ALL' : cat)}
                          className={`w-full flex items-center gap-3 p-3 border-2 border-black text-left transition-all hover:bg-[#FFE500] ${activeCategory === cat ? 'bg-[#FFE500]' : 'bg-white'}`}
                        >
                          <CatIcon className="w-5 h-5 shrink-0" />
                          <div className="flex-1">
                            <p className="font-black text-sm">{catInfo.label}</p>
                            <p className="text-xs text-gray-500 font-bold">{catInfo.description.slice(0, 50)}…</p>
                          </div>
                          <span className="bg-black text-white text-xs font-black w-6 h-6 flex items-center justify-center">{count}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* CTA */}
                  <div className="bg-[#FF90E8] border-4 border-black p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] space-y-3">
                    <p className="font-black text-xl">Fix All Issues — Free</p>
                    <p className="font-bold text-sm text-black/70">Sign in and our AI auto-applies every fix to your resume. Your scan results carry over automatically.</p>
                    <button
                      onClick={handleGoFix}
                      className="w-full bg-black text-white font-black uppercase py-3 border-2 border-black hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
                    >
                      <LogIn className="w-5 h-5" /> Login & Auto-Fix
                    </button>
                    <button
                      onClick={handleDownloadReport}
                      className="w-full bg-white text-black font-black uppercase py-3 border-2 border-black hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
                    >
                      <Download className="w-5 h-5" /> Download Report (.txt)
                    </button>
                  </div>

                  {/* Scan again */}
                  <button onClick={reset} className="w-full flex items-center justify-center gap-2 bg-white border-4 border-black py-3 font-black text-sm hover:bg-gray-100 transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    <RotateCcw className="w-4 h-4" /> Scan a Different Resume
                  </button>
                </div>

                {/* Right: Issues */}
                <div className="lg:col-span-8 space-y-4">
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <h3 className="font-black uppercase text-xl">
                      Detailed Issues Report
                      <span className="ml-2 text-base font-bold text-gray-400">({filteredIssues.length} shown)</span>
                    </h3>
                    {/* Filter chips */}
                    <div className="flex flex-wrap gap-2">
                      {(['ALL', 'CONTENT', 'SECTIONS', 'ATS_ESSENTIALS'] as const).map(cat => (
                        <button
                          key={cat}
                          onClick={() => setActiveCategory(cat)}
                          className={`px-3 py-1.5 text-xs font-black border-2 border-black uppercase transition-all ${activeCategory === cat ? 'bg-black text-white' : 'bg-white hover:bg-[#FFE500]'}`}
                        >
                          {cat === 'ATS_ESSENTIALS' ? 'ATS' : cat === 'ALL' ? 'All Issues' : cat.charAt(0) + cat.slice(1).toLowerCase()}
                          {cat !== 'ALL' && <span className="ml-1 opacity-70">({result.issues.filter(i => i.category === cat).length})</span>}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Instructions */}
                  <div className="bg-blue-50 border-2 border-blue-300 p-3 flex items-start gap-2">
                    <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                    <p className="text-xs font-bold text-blue-700">Click each issue to expand it and see exactly what to fix. Use "Copy Fix Tip" to copy the exact text, or click "Auto-Fix in Builder" to let our AI apply it automatically.</p>
                  </div>

                  {filteredIssues.length === 0 ? (
                    <div className="p-12 text-center bg-white border-4 border-black">
                      <CheckCircle className="w-16 h-16 text-[#23a094] mx-auto mb-4" />
                      <p className="font-black text-2xl">No issues in this category!</p>
                      <p className="font-bold text-gray-500 mt-2">Your resume performs well here. Check other categories for improvement areas.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {filteredIssues.map((issue, i) => (
                        <IssueCard key={i} issue={issue} index={i} />
                      ))}
                    </div>
                  )}
                </div>

              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </section>
  );
}
