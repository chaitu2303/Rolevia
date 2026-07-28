'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Target, Loader2, CheckCircle, AlertTriangle, Briefcase, Zap, Rocket,
  Upload, XCircle, RotateCcw, Star, ChevronDown, ChevronUp, Info,
  Copy, Check, Lightbulb, TrendingUp, Shield, FileText, Download, LogOut, RefreshCw
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { getAtsPendingResult, clearAtsPendingResult, saveAtsPendingResult, StoredAtsResult } from '@/lib/ats/AtsPersistence';

// ── Shared Score Utilities ────────────────────────────────────────────────────
function getGrade(score: number) {
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

type Severity = 'CRITICAL' | 'HIGH' | 'MEDIUM';
type Category = 'CONTENT' | 'SECTIONS' | 'ATS_ESSENTIALS';

const SEV: Record<Severity, { bg: string; text: string; icon: React.ElementType; label: string }> = {
  CRITICAL: { bg: 'bg-red-500', text: 'text-white', icon: XCircle, label: 'Critical' },
  HIGH: { bg: 'bg-orange-400', text: 'text-white', icon: AlertTriangle, label: 'High' },
  MEDIUM: { bg: 'bg-[#FFE500]', text: 'text-black', icon: Info, label: 'Medium' },
};

const CAT_LABEL: Record<Category, string> = {
  CONTENT: 'Content Quality',
  SECTIONS: 'Resume Sections',
  ATS_ESSENTIALS: 'ATS Compatibility',
};

// ── ScoreCard ─────────────────────────────────────────────────────────────────
function ScoreCard({ label, score }: { label: string; score: number }) {
  const grade = getGrade(score);
  return (
    <div className="bg-white border-2 border-black p-4 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
      <p className="font-black uppercase text-xs tracking-widest text-gray-500 mb-1">{label}</p>
      <div className="flex items-end gap-1.5">
        <span className="text-3xl font-black" style={{ color: grade.color }}>{score}</span>
        <span className="text-xs font-bold text-gray-400 pb-1">/100</span>
        <span className="ml-auto text-lg font-black" style={{ color: grade.color }}>{grade.grade}</span>
      </div>
      <div className="mt-2 h-2 bg-gray-100 border border-black">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 0.7 }}
          className={`h-full ${getBarColor(score)}`}
        />
      </div>
    </div>
  );
}

// ── Issue Card ────────────────────────────────────────────────────────────────
function IssueCard({ issue, index }: { issue: StoredAtsResult['issues'][0]; index: number }) {
  const [open, setOpen] = useState(index === 0);
  const [copied, setCopied] = useState(false);
  const cfg = SEV[issue.severity as Severity];
  const Icon = cfg.icon;

  const copyFix = () => {
    navigator.clipboard.writeText(issue.fix);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="border-4 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center gap-3 p-4 text-left hover:bg-gray-50">
        <div className={`w-8 h-8 flex items-center justify-center shrink-0 ${cfg.bg}`}>
          <Icon className={`w-4 h-4 ${cfg.text}`} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-black text-sm">{issue.title}</p>
          <p className="text-xs font-bold text-gray-500">{CAT_LABEL[issue.category as Category]}</p>
        </div>
        <span className={`text-xs font-black px-2 py-1 shrink-0 ${cfg.bg} ${cfg.text}`}>{cfg.label}</span>
        {open ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="border-t-4 border-black p-4 bg-[#faf8f5] space-y-3">
              <div>
                <p className="text-xs font-black uppercase text-gray-400 mb-1">Why This Matters</p>
                <p className="text-sm font-medium text-gray-700 leading-relaxed">{issue.description}</p>
              </div>
              <div className="bg-white border-4 border-black p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="bg-[#23a094] w-6 h-6 flex items-center justify-center">
                    <Lightbulb className="w-3.5 h-3.5 text-white" />
                  </div>
                  <p className="font-black text-sm uppercase">Exact Fix</p>
                </div>
                <p className="text-sm font-medium leading-relaxed">{issue.fix}</p>
                <button onClick={copyFix} className="flex items-center gap-1.5 bg-black text-white text-xs font-black px-3 py-2 border-2 border-black hover:bg-gray-800 transition-colors">
                  {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  {copied ? 'Copied!' : 'Copy Fix Text'}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Score Ring ────────────────────────────────────────────────────────────────
function ScoreRing({ score }: { score: number }) {
  const grade = getGrade(score);
  const r = 44;
  const c = 2 * Math.PI * r;
  const dash = (score / 100) * c;
  return (
    <div className="relative w-28 h-28">
      <svg viewBox="0 0 110 110" className="w-full h-full -rotate-90">
        <circle cx="55" cy="55" r={r} stroke="#e5e7eb" strokeWidth="10" fill="none" />
        <motion.circle cx="55" cy="55" r={r} stroke={grade.color} strokeWidth="10" fill="none" strokeLinecap="round"
          strokeDasharray={c} initial={{ strokeDashoffset: c }} animate={{ strokeDashoffset: c - dash }}
          transition={{ duration: 1, ease: 'easeOut' }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-black" style={{ color: grade.color }}>{score}</span>
        <span className="text-[10px] font-black" style={{ color: grade.color }}>{grade.grade}</span>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// TAB 1: Resume Scanner — uses pending result OR allows re-upload
// ═══════════════════════════════════════════════════════════════════
function ResumeScanner() {
  const [result, setResult] = useState<StoredAtsResult | null>(null);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [filter, setFilter] = useState<Category | 'ALL'>('ALL');
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-load pending result from homepage scan
  useEffect(() => {
    const pending = getAtsPendingResult();
    if (pending) {
      setResult(pending);
      setFileName(pending.fileName || null);
    }
  }, []);

  const runScan = useCallback(async (file: File) => {
    setFileName(file.name);
    setScanning(true);
    setResult(null);
    setError(null);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/ats/quick-scan', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Scan failed.');
      const stored: StoredAtsResult = { ...data.result, fileName: file.name, scannedAt: Date.now() };
      setResult(stored);
      saveAtsPendingResult(stored);
      toast.success('Resume scanned successfully!');
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setScanning(false);
    }
  }, []);

  const handleFile = (file: File) => {
    const ext = file.name.toLowerCase();
    if (!ext.endsWith('.pdf') && !ext.endsWith('.docx') && !ext.endsWith('.txt')) {
      setError('Please upload PDF, DOCX, or TXT.');
      return;
    }
    runScan(file);
  };

  const downloadReport = () => {
    if (!result) return;
    const lines = [
      'ATS ANALYSIS REPORT — Placement2Job',
      `File: ${fileName || 'Unknown'}`,
      `Date: ${new Date().toLocaleDateString()}`,
      '',
      `OVERALL SCORE: ${result.overallScore}/100`,
      `Parse Rate: ${result.parseRate}/100`,
      `Content: ${result.contentScore}/100`,
      `Sections: ${result.sectionsScore}/100`,
      `Formatting: ${result.formattingScore}/100`,
      '',
      'SUMMARY',
      result.summary,
      '',
      "WHAT'S WORKING",
      ...result.strengths.map(s => `✓ ${s}`),
      '',
      `ISSUES TO FIX (${result.issues.length})`,
      ...result.issues.map((issue, i) =>
        `\n${i + 1}. [${issue.severity}] ${issue.title}\n   Problem: ${issue.description}\n   Fix: ${issue.fix}`
      ),
      '',
      '—————————————————————————————',
      'Generated by Placement2Job · placement2job.vercel.app',
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ATS_Report_${fileName?.replace(/\.[^.]+$/, '') || 'resume'}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const reset = () => {
    setResult(null);
    setError(null);
    setFileName(null);
    clearAtsPendingResult();
    if (inputRef.current) inputRef.current.value = '';
  };

  const filteredIssues = result?.issues?.filter(i => filter === 'ALL' || i.category === filter) || [];

  if (scanning) {
    return (
      <div className="text-center py-24 space-y-6">
        <div className="flex justify-center">
          <div className="bg-black border-4 border-black w-20 h-20 flex items-center justify-center shadow-[8px_8px_0px_0px_rgba(255,144,232,1)]">
            <Loader2 className="w-10 h-10 text-[#FF90E8] animate-spin" />
          </div>
        </div>
        <h3 className="text-2xl font-black uppercase">Analyzing "{fileName}"...</h3>
        <p className="font-bold text-gray-500">Running through our ATS engine. This takes a few seconds.</p>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="space-y-4 max-w-xl mx-auto py-8">
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={e => e.preventDefault()}
          onDrop={e => { e.preventDefault(); if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]); }}
          className="cursor-pointer border-4 border-dashed border-black p-16 text-center bg-white hover:bg-gray-50 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-colors"
        >
          <input ref={inputRef} type="file" accept=".pdf,.docx,.txt" className="hidden" onChange={e => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }} />
          <div className="bg-[#FFE500] border-4 border-black w-16 h-16 flex items-center justify-center mx-auto mb-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <Upload className="w-8 h-8" />
          </div>
          <p className="text-xl font-black uppercase">Upload Your Resume</p>
          <p className="font-bold text-gray-500 mt-1 text-sm">PDF · DOCX · TXT · Max 5MB</p>
        </div>
        {error && <div className="p-4 bg-red-50 border-4 border-red-500 text-red-700 font-bold flex items-center gap-2"><XCircle className="w-5 h-5 shrink-0" />{error}</div>}
      </div>
    );
  }

  // Full report view
  return (
    <div className="space-y-6">
      {/* Top banner if loaded from homepage */}
      {result.fileName && (
        <div className="bg-[#FFE500] border-4 border-black p-4 flex items-center gap-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <CheckCircle className="w-6 h-6 shrink-0" />
          <div className="flex-1">
            <p className="font-black">Results loaded from your homepage scan!</p>
            <p className="text-sm font-bold text-black/70">File: {result.fileName}</p>
          </div>
          <button onClick={reset} className="flex items-center gap-1.5 bg-black text-white font-black px-3 py-2 text-xs border-2 border-black hover:bg-gray-800">
            <RefreshCw className="w-3.5 h-3.5" /> Scan New
          </button>
        </div>
      )}

      {/* Score grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="col-span-2 md:col-span-1 bg-black text-white border-4 border-black p-5 flex flex-col items-center justify-center gap-2 shadow-[6px_6px_0px_0px_rgba(0,0,0,0.2)]">
          <p className="font-black uppercase text-xs tracking-widest text-gray-400">Overall</p>
          <ScoreRing score={result.overallScore} />
        </div>
        <ScoreCard label="Parse Rate" score={result.parseRate} />
        <ScoreCard label="Content" score={result.contentScore} />
        <ScoreCard label="Sections" score={result.sectionsScore} />
        <ScoreCard label="Formatting" score={result.formattingScore} />
      </div>

      {/* Summary */}
      <div className="bg-[#FFE500] border-4 border-black p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex gap-4">
        <TrendingUp className="w-6 h-6 shrink-0 mt-0.5" />
        <p className="font-bold">{result.summary}</p>
      </div>

      {/* Main body */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left panel */}
        <div className="lg:col-span-4 space-y-4">
          {/* Strengths */}
          <div className="bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <div className="bg-[#23a094] text-white px-4 py-3 border-b-4 border-black flex items-center gap-2">
              <Star className="w-5 h-5" />
              <h3 className="font-black uppercase">What's Working</h3>
            </div>
            <div className="p-4 space-y-3">
              {result.strengths.length === 0 ? (
                <p className="text-sm font-bold text-gray-500">No notable strengths found. Focus on fixing the issues.</p>
              ) : result.strengths.map((s, i) => (
                <div key={i} className="flex gap-2 items-start border-l-4 border-[#23a094] pl-3">
                  <CheckCircle className="w-4 h-4 text-[#23a094] shrink-0 mt-0.5" />
                  <p className="font-bold text-sm">{s}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-2">
            <button onClick={downloadReport} className="w-full flex items-center justify-center gap-2 bg-black text-white font-black uppercase py-3 border-4 border-black hover:bg-gray-800 transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <Download className="w-4 h-4" /> Download Full Report
            </button>
            <button onClick={reset} className="w-full flex items-center justify-center gap-2 bg-white font-black uppercase py-3 border-4 border-black hover:bg-gray-100 transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-sm">
              <RefreshCw className="w-4 h-4" /> Scan a Different Resume
            </button>
          </div>
        </div>

        {/* Right: Issues */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h3 className="font-black uppercase text-xl">Issues Found ({result.issues.length})</h3>
            <div className="flex flex-wrap gap-2">
              {(['ALL', 'CONTENT', 'SECTIONS', 'ATS_ESSENTIALS'] as const).map(cat => (
                <button key={cat} onClick={() => setFilter(cat)}
                  className={`px-3 py-1.5 text-xs font-black border-2 border-black uppercase ${filter === cat ? 'bg-black text-white' : 'bg-white hover:bg-[#FFE500]'}`}>
                  {cat === 'ATS_ESSENTIALS' ? 'ATS' : cat === 'ALL' ? 'All' : cat.charAt(0) + cat.slice(1).toLowerCase()}
                  {cat !== 'ALL' && <span className="ml-1 opacity-60">({result.issues.filter(i => i.category === cat).length})</span>}
                </button>
              ))}
            </div>
          </div>
          <div className="bg-blue-50 border-2 border-blue-300 p-3 flex gap-2">
            <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
            <p className="text-xs font-bold text-blue-700">Click each issue to expand. Use "Copy Fix Text" to copy the exact change needed.</p>
          </div>
          <div className="space-y-3">
            {filteredIssues.length === 0 ? (
              <div className="p-10 text-center bg-white border-4 border-black">
                <CheckCircle className="w-12 h-12 text-[#23a094] mx-auto mb-3" />
                <p className="font-black text-xl">No issues in this category!</p>
              </div>
            ) : filteredIssues.map((issue, i) => <IssueCard key={i} issue={issue} index={i} />)}
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// TAB 2: AI Tailor — match resume to specific JD
// ═══════════════════════════════════════════════════════════════════
function AiTailor() {
  const [jobDescription, setJobDescription] = useState('');
  const [jobUrl, setJobUrl] = useState('');
  const [isFetchingUrl, setIsFetchingUrl] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [results, setResults] = useState<any>(null);

  const handleFetchUrl = async () => {
    if (!jobUrl) { toast.error('Please enter a job URL'); return; }
    setIsFetchingUrl(true);
    try {
      const res = await fetch('/api/jobs/extract', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ url: jobUrl }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch job description');
      setJobDescription(data.text);
      toast.success('Job description extracted!');
    } catch (err: any) { toast.error(err.message); } finally { setIsFetchingUrl(false); }
  };

  const handleAnalyze = async () => {
    if (!jobDescription) { toast.error('Please paste a job description.'); return; }
    setIsAnalyzing(true); setResults(null);
    try {
      const res = await fetch('/api/ats/analyze', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ jobDescription }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Analysis failed');
      setResults(data);
      toast.success('Resume tailored!');
    } catch (err: any) { toast.error(err.message); } finally { setIsAnalyzing(false); }
  };

  const handleCloudApply = async () => {
    if (!jobUrl) { toast.error('Job URL is required for Auto-Apply'); return; }
    setIsApplying(true);
    try {
      const res = await fetch('/api/jobs/auto-apply', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ url: jobUrl }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Auto-apply failed');
      toast.success('Application submitted!');
    } catch (err: any) { toast.error(err.message); } finally { setIsApplying(false); }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
      {/* Input */}
      <div className="xl:col-span-5 space-y-6">
        <div className="bg-white p-8 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative">
          <div className="absolute -top-4 -right-4 bg-[#FFE500] px-3 py-1 border-4 border-black font-black uppercase text-sm rotate-6 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">Step 1</div>
          <h2 className="text-xl font-black uppercase mb-5 flex items-center gap-2"><Briefcase className="w-5 h-5" /> Target Job</h2>
          <div className="space-y-5">
            <div>
              <label className="font-bold uppercase text-xs mb-2 block tracking-widest">Job URL (for Auto-Apply)</label>
              <div className="flex gap-2">
                <Input placeholder="https://linkedin.com/jobs/view/..." value={jobUrl} onChange={(e: any) => setJobUrl(e.target.value)}
                  className="flex-1 rounded-none border-4 border-black bg-[#faf8f5] focus-visible:ring-0 font-mono text-sm" />
                <Button onClick={handleFetchUrl} disabled={isFetchingUrl || !jobUrl}
                  className="rounded-none border-4 border-black bg-[#90c0ff] hover:bg-[#70aaff] text-black font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:translate-x-1 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all">
                  {isFetchingUrl ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Fetch'}
                </Button>
              </div>
            </div>
            <div className="flex items-center gap-3 opacity-40">
              <div className="h-0.5 bg-black flex-1" />
              <span className="text-xs font-black uppercase tracking-widest">OR PASTE JD</span>
              <div className="h-0.5 bg-black flex-1" />
            </div>
            <div>
              <label className="font-bold uppercase text-xs mb-2 block tracking-widest">Job Description Text</label>
              <Textarea placeholder="Paste the target job description here..." value={jobDescription} onChange={(e: any) => setJobDescription(e.target.value)}
                className="w-full rounded-none border-4 border-black bg-[#faf8f5] focus-visible:ring-0 resize-none min-h-[200px] font-mono text-sm" />
            </div>
          </div>
          <Button className="w-full h-14 mt-6 rounded-none border-4 border-black bg-[#FF90E8] hover:bg-[#ff70dd] text-black font-black uppercase text-lg shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:translate-x-1 hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all flex gap-3"
            onClick={handleAnalyze} disabled={isAnalyzing || !jobDescription}>
            {isAnalyzing ? <><Loader2 className="w-5 h-5 animate-spin" /> Analyzing...</> : <><Target className="w-5 h-5" /> Tailor My Resume</>}
          </Button>
        </div>
      </div>

      {/* Results */}
      <div className="xl:col-span-7">
        <div className="bg-white p-8 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative min-h-[400px]">
          <div className="absolute -top-4 -right-4 bg-[#90c0ff] px-3 py-1 border-4 border-black font-black uppercase text-sm -rotate-6 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">Step 2</div>
          <h2 className="text-xl font-black uppercase mb-5 flex items-center gap-2"><CheckCircle className="w-5 h-5" /> Match Results</h2>
          {results ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between p-5 bg-[#faf8f5] border-4 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                <div>
                  <p className="font-black uppercase text-xs tracking-widest mb-1 text-gray-500">ATS Match Score</p>
                  <p className="text-5xl font-black" style={{ color: results.score >= 80 ? '#23a094' : results.score >= 60 ? '#FFE500' : '#ff4040' }}>{results.score}%</p>
                </div>
                <div className="text-5xl">{results.score >= 80 ? '🔥' : results.score >= 60 ? '👍' : '😬'}</div>
              </div>
              {results.breakdown && (
                <div className="grid grid-cols-3 gap-3">
                  {[['Hard Skills', results.breakdown.hardSkillsMatch, '#abf5d1'], ['Action Verbs', results.breakdown.actionVerbsMatch, '#FFE500'], ['ATS Readability', results.breakdown.atsReadability, '#90c0ff']].map(([label, val, bg]) => (
                    <div key={label as string} className="p-3 border-2 border-black text-center" style={{ backgroundColor: bg as string }}>
                      <p className="text-[10px] font-black uppercase tracking-widest">{label}</p>
                      <p className="text-2xl font-black">{val}%</p>
                    </div>
                  ))}
                </div>
              )}
              {results.actionableChanges?.length > 0 && (
                <div className="space-y-2">
                  <h3 className="font-black uppercase">Required Changes ({results.actionableChanges.length})</h3>
                  {results.actionableChanges.map((c: any, i: number) => (
                    <div key={i} className="p-3 bg-[#faf8f5] border-2 border-black space-y-1">
                      <div className="flex items-center justify-between">
                        <p className="font-black text-sm">{c.title}</p>
                        <span className={`text-[9px] font-black px-2 py-0.5 border border-black ${c.severity === 'CRITICAL' ? 'bg-red-500 text-white' : 'bg-[#FFE500]'}`}>{c.severity}</span>
                      </div>
                      <p className="text-xs font-bold text-gray-600">{c.description}</p>
                      <p className="text-xs font-black text-[#23a094]">👉 {c.action}</p>
                    </div>
                  ))}
                </div>
              )}
              {results.tailoredResume && (
                <div className="p-4 bg-[#faf8f5] border-4 border-black space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-black uppercase text-sm">AI Tailored Resume</h3>
                    <Button size="sm" className="rounded-none border-2 border-black bg-[#90c0ff] hover:bg-black hover:text-white font-bold text-xs"
                      onClick={() => { navigator.clipboard.writeText(results.tailoredResume); toast.success('Copied!'); }}>Copy</Button>
                  </div>
                  <Textarea readOnly value={results.tailoredResume}
                    className="w-full rounded-none border-4 border-black bg-white focus-visible:ring-0 min-h-[200px] font-mono text-xs" />
                </div>
              )}
              <Button className="w-full h-14 rounded-none border-4 border-black bg-[#FFE500] hover:bg-[#f5d800] text-black font-black uppercase text-lg shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:translate-x-1 hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all flex gap-3"
                onClick={handleCloudApply} disabled={isApplying || !jobUrl}>
                {isApplying ? <><Loader2 className="w-5 h-5 animate-spin" /> Submitting...</> : <><Rocket className="w-5 h-5" /> Auto-Apply Now</>}
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
              <Target className="w-12 h-12 mb-4 opacity-30" />
              <p className="font-bold text-center">Paste a job description and click "Tailor My Resume" to see your match score.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════════
export default function ATSAnalysisPage() {
  const [tab, setTab] = useState<'scanner' | 'tailor'>('scanner');

  // Auto-switch to scanner tab if pending result exists
  useEffect(() => {
    const pending = getAtsPendingResult();
    if (pending) setTab('scanner');
  }, []);

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-8 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b-8 border-black pb-8">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 bg-[#FF90E8] border-4 border-black flex items-center justify-center shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] -rotate-3">
            <Target className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-4xl font-black uppercase tracking-tight">ATS Center</h1>
            <p className="font-bold text-gray-600">Scan your resume · Tailor for specific jobs · Auto-Apply</p>
          </div>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex gap-0 border-4 border-black w-fit shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <button
          onClick={() => setTab('scanner')}
          className={`px-6 py-3 font-black uppercase text-sm transition-colors flex items-center gap-2 ${tab === 'scanner' ? 'bg-black text-white' : 'bg-white hover:bg-gray-100'}`}
        >
          <FileText className="w-4 h-4" /> Resume Scanner
        </button>
        <button
          onClick={() => setTab('tailor')}
          className={`px-6 py-3 font-black uppercase text-sm transition-colors flex items-center gap-2 border-l-4 border-black ${tab === 'tailor' ? 'bg-black text-white' : 'bg-white hover:bg-gray-100'}`}
        >
          <Zap className="w-4 h-4" /> AI Tailor
        </button>
      </div>

      {/* Tab step guide */}
      {tab === 'scanner' && (
        <div className="flex gap-2 flex-wrap">
          {['1. Upload resume', '2. Get instant ATS score', '3. Read detailed issues', '4. Apply fixes', '5. Download report'].map((step, i) => (
            <div key={step} className="flex items-center gap-2">
              <span className="bg-[#FFE500] border-2 border-black px-3 py-1 text-xs font-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">{step}</span>
              {i < 4 && <span className="font-black text-gray-400">→</span>}
            </div>
          ))}
        </div>
      )}
      {tab === 'tailor' && (
        <div className="flex gap-2 flex-wrap">
          {['1. Paste job URL or JD', '2. Click "Tailor My Resume"', '3. Review match score', '4. Copy tailored resume', '5. Auto-Apply with 1 click'].map((step, i) => (
            <div key={step} className="flex items-center gap-2">
              <span className="bg-[#90c0ff] border-2 border-black px-3 py-1 text-xs font-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">{step}</span>
              {i < 4 && <span className="font-black text-gray-400">→</span>}
            </div>
          ))}
        </div>
      )}

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {tab === 'scanner' ? (
          <motion.div key="scanner" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <ResumeScanner />
          </motion.div>
        ) : (
          <motion.div key="tailor" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <AiTailor />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
