'use client';

import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload, FileText, CheckCircle, XCircle, AlertTriangle,
  ChevronDown, ChevronUp, Loader2, RotateCcw, Star, ArrowRight
} from 'lucide-react';
import Link from 'next/link';

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

const severityConfig: Record<Severity, { color: string; label: string; icon: React.ElementType }> = {
  CRITICAL: { color: 'bg-red-500 text-white', label: 'Critical', icon: XCircle },
  HIGH: { color: 'bg-orange-400 text-white', label: 'High', icon: AlertTriangle },
  MEDIUM: { color: 'bg-yellow-400 text-black', label: 'Medium', icon: AlertTriangle },
};

const scoreColor = (score: number) => {
  if (score >= 80) return 'text-[#23a094]';
  if (score >= 60) return 'text-[#FFE500]';
  return 'text-[#ff4040]';
};

const scoreBarColor = (score: number) => {
  if (score >= 80) return 'bg-[#23a094]';
  if (score >= 60) return 'bg-[#FFE500]';
  return 'bg-[#ff4040]';
};

function ScoreBar({ label, score }: { label: string; score: number }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between font-bold text-sm">
        <span>{label}</span>
        <span className={scoreColor(score)}>{score}/100</span>
      </div>
      <div className="h-3 w-full bg-gray-200 border-2 border-black">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className={`h-full ${scoreBarColor(score)}`}
        />
      </div>
    </div>
  );
}

function IssueCard({ issue }: { issue: Issue }) {
  const [open, setOpen] = useState(false);
  const cfg = severityConfig[issue.severity];
  const Icon = cfg.icon;

  return (
    <div className="border-2 border-black bg-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 p-4 text-left hover:bg-gray-50 transition-colors"
      >
        <Icon className="w-5 h-5 shrink-0" />
        <span className="font-black flex-1 text-sm">{issue.title}</span>
        <span className={`text-xs font-black px-2 py-0.5 ${cfg.color}`}>{cfg.label}</span>
        {open ? <ChevronUp className="w-4 h-4 shrink-0" /> : <ChevronDown className="w-4 h-4 shrink-0" />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="p-4 border-t-2 border-black space-y-3 bg-[#faf8f5]">
              <p className="text-sm font-medium text-gray-700">{issue.description}</p>
              <div className="flex gap-2 items-start bg-[#23a094]/10 border-l-4 border-[#23a094] p-3">
                <CheckCircle className="w-4 h-4 text-[#23a094] shrink-0 mt-0.5" />
                <p className="text-sm font-bold text-[#23a094]"><span className="text-black">Fix: </span>{issue.fix}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function AtsDemo() {
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

      const res = await fetch('/api/ats/quick-scan', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Failed to scan resume.');

      setResult(data.result);
    } catch (err: any) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setScanning(false);
    }
  }, []);

  const handleFile = useCallback((file: File) => {
    const allowed = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
    const ext = file.name.toLowerCase();
    if (!allowed.includes(file.type) && !ext.endsWith('.pdf') && !ext.endsWith('.docx') && !ext.endsWith('.txt')) {
      setError('Please upload a PDF, DOCX, or TXT file.');
      return;
    }
    runScan(file);
  }, [runScan]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const reset = () => {
    setResult(null);
    setError(null);
    setFileName(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  const filteredIssues = result?.issues?.filter(i =>
    activeCategory === 'ALL' || i.category === activeCategory
  ) || [];

  const criticalCount = result?.issues?.filter(i => i.severity === 'CRITICAL').length || 0;
  const highCount = result?.issues?.filter(i => i.severity === 'HIGH').length || 0;

  return (
    <section className="w-full bg-[#faf8f5] border-t-8 border-black py-24 px-6">
      <div className="max-w-6xl mx-auto space-y-16">

        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-block bg-[#FF90E8] border-4 border-black px-4 py-1 font-black text-sm uppercase tracking-widest shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rotate-1">
            Free Instant Scan
          </div>
          <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tight leading-none">
            Is Your Resume<br />
            <span className="text-[#23a094]">ATS-Proof?</span>
          </h2>
          <p className="text-lg font-bold max-w-2xl mx-auto text-gray-600">
            Upload your resume (PDF, DOCX, or TXT) and get a real, AI-powered ATS score in seconds. No account needed.
          </p>
        </div>

        <AnimatePresence mode="wait">

          {/* Upload State */}
          {!scanning && !result && (
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-2xl mx-auto"
            >
              <div
                onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                onDragLeave={() => setDragActive(false)}
                onDrop={handleDrop}
                onClick={() => inputRef.current?.click()}
                className={`relative cursor-pointer border-4 border-dashed border-black p-16 text-center transition-all ${
                  dragActive ? 'bg-[#FFE500] scale-105 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]' : 'bg-white hover:bg-[#f0f0f0] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]'
                }`}
              >
                <input
                  ref={inputRef}
                  type="file"
                  accept=".pdf,.docx,.txt"
                  className="hidden"
                  onChange={handleInputChange}
                />
                <div className="space-y-4">
                  <div className="flex justify-center">
                    <div className="bg-[#FFE500] border-4 border-black w-20 h-20 flex items-center justify-center shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] -rotate-3">
                      <Upload className="w-10 h-10" />
                    </div>
                  </div>
                  <div>
                    <p className="text-2xl font-black uppercase">Drop Your Resume Here</p>
                    <p className="text-gray-600 font-bold mt-2">or click to browse files</p>
                    <p className="text-sm text-gray-400 font-bold mt-1 uppercase tracking-widest">PDF · DOCX · TXT · Max 5MB</p>
                  </div>
                </div>
              </div>
              {error && (
                <div className="mt-4 p-4 bg-red-100 border-4 border-red-500 font-bold text-red-700 flex items-center gap-3">
                  <XCircle className="w-5 h-5 shrink-0" />
                  {error}
                </div>
              )}
            </motion.div>
          )}

          {/* Scanning State */}
          {scanning && (
            <motion.div
              key="scanning"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="max-w-2xl mx-auto text-center space-y-8 py-16"
            >
              <div className="flex justify-center">
                <div className="bg-[#FF90E8] border-4 border-black w-24 h-24 flex items-center justify-center shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                  <Loader2 className="w-12 h-12 animate-spin" />
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-3xl font-black uppercase">Scanning Resume...</h3>
                <p className="font-bold text-gray-600">Our AI is reading "{fileName}" like an ATS system would.</p>
                <div className="flex gap-2 justify-center pt-2">
                  {['Parsing Text', 'Checking ATS', 'Scoring Content', 'Generating Report'].map((step, i) => (
                    <motion.span
                      key={step}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.6 }}
                      className="bg-white border-2 border-black px-3 py-1 text-xs font-black uppercase"
                    >
                      {step}
                    </motion.span>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Results State */}
          {result && !scanning && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              {/* Top Stats Row */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {/* Main Score */}
                <div className="col-span-2 md:col-span-1 bg-black text-white border-4 border-black p-6 text-center shadow-[8px_8px_0px_0px_rgba(0,0,0,0.2)] flex flex-col items-center justify-center">
                  <p className="font-black uppercase text-xs tracking-widest text-gray-400 mb-1">Overall</p>
                  <div className={`text-6xl font-black ${scoreColor(result.overallScore)}`}>
                    {result.overallScore}
                  </div>
                  <p className="text-sm font-bold text-gray-400">/100</p>
                </div>
                {[
                  { label: 'Parse Rate', val: result.parseRate },
                  { label: 'Content', val: result.contentScore },
                  { label: 'Sections', val: result.sectionsScore },
                  { label: 'Formatting', val: result.formattingScore },
                ].map((item) => (
                  <div key={item.label} className="bg-white border-4 border-black p-4 text-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    <p className="font-black uppercase text-xs tracking-widest text-gray-500 mb-1">{item.label}</p>
                    <div className={`text-4xl font-black ${scoreColor(item.val)}`}>{item.val}</div>
                    <div className="mt-2 h-2 bg-gray-200 border border-black">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${item.val}%` }}
                        transition={{ duration: 0.8 }}
                        className={`h-full ${scoreBarColor(item.val)}`}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Summary Box */}
              <div className="bg-[#FFE500] border-4 border-black p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                <p className="font-black uppercase text-sm mb-2 tracking-widest">AI Summary</p>
                <p className="font-bold text-lg leading-relaxed">{result.summary}</p>
              </div>

              {/* Two Column Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* Strengths & Issues Panel */}
                <div className="lg:col-span-4 space-y-6">
                  {/* Strengths */}
                  <div className="bg-white border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                    <div className="bg-[#23a094] text-white px-4 py-3 border-b-4 border-black">
                      <h3 className="font-black uppercase flex items-center gap-2">
                        <Star className="w-5 h-5" /> What's Working
                      </h3>
                    </div>
                    <div className="p-4 space-y-3">
                      {result.strengths.map((s, i) => (
                        <div key={i} className="flex gap-2 items-start">
                          <CheckCircle className="w-5 h-5 text-[#23a094] shrink-0 mt-0.5" />
                          <p className="font-bold text-sm">{s}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Issue Stats */}
                  <div className="bg-white border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-4 space-y-3">
                    <h3 className="font-black uppercase">Issue Breakdown</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-red-500 text-white border-2 border-black p-3 text-center">
                        <div className="text-3xl font-black">{criticalCount}</div>
                        <div className="text-xs font-black uppercase">Critical</div>
                      </div>
                      <div className="bg-orange-400 text-white border-2 border-black p-3 text-center">
                        <div className="text-3xl font-black">{highCount}</div>
                        <div className="text-xs font-black uppercase">High</div>
                      </div>
                    </div>
                  </div>

                  {/* CTA */}
                  <div className="bg-[#FF90E8] border-4 border-black p-6 text-center shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                    <p className="font-black text-lg mb-3">Fix All Issues With Our AI Resume Builder</p>
                    <Link href="/register">
                      <button className="w-full bg-black text-white font-black uppercase py-3 border-2 border-black hover:bg-gray-800 transition-colors flex items-center justify-center gap-2">
                        Get Started Free <ArrowRight className="w-5 h-5" />
                      </button>
                    </Link>
                  </div>
                </div>

                {/* Issues List */}
                <div className="lg:col-span-8 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-black uppercase text-xl">Issues Found ({result.issues.length})</h3>
                    <button onClick={reset} className="flex items-center gap-2 bg-white border-2 border-black px-3 py-2 font-black text-sm hover:bg-[#FFE500] transition-colors shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                      <RotateCcw className="w-4 h-4" /> Scan Again
                    </button>
                  </div>

                  {/* Category Filter */}
                  <div className="flex flex-wrap gap-2">
                    {(['ALL', 'CONTENT', 'SECTIONS', 'ATS_ESSENTIALS'] as const).map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        className={`px-4 py-2 font-black text-xs uppercase border-2 border-black transition-all ${
                          activeCategory === cat
                            ? 'bg-black text-white shadow-[3px_3px_0px_0px_rgba(0,0,0,0.3)]'
                            : 'bg-white hover:bg-[#FFE500]'
                        }`}
                      >
                        {cat === 'ATS_ESSENTIALS' ? 'ATS Essentials' : cat.charAt(0) + cat.slice(1).toLowerCase()}
                        {cat !== 'ALL' && (
                          <span className="ml-1 opacity-70">
                            ({result.issues.filter(i => i.category === cat).length})
                          </span>
                        )}
                      </button>
                    ))}
                  </div>

                  {/* Issue Cards */}
                  <div className="space-y-3">
                    {filteredIssues.length === 0 ? (
                      <div className="p-8 text-center bg-white border-4 border-black">
                        <CheckCircle className="w-12 h-12 text-[#23a094] mx-auto mb-3" />
                        <p className="font-black text-xl">No issues in this category!</p>
                      </div>
                    ) : (
                      filteredIssues.map((issue, i) => (
                        <IssueCard key={i} issue={issue} />
                      ))
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </section>
  );
}
