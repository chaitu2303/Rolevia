'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Target, Loader2, CheckCircle, AlertTriangle, Briefcase, Zap, Rocket } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';

export default function ATSAnalysisPage() {
  const [jobDescription, setJobDescription] = useState('');
  const [jobUrl, setJobUrl] = useState('');
  const [isFetchingUrl, setIsFetchingUrl] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [results, setResults] = useState<any>(null);

  const handleFetchUrl = async () => {
    if (!jobUrl) {
      toast.error('Please enter a job URL');
      return;
    }
    
    setIsFetchingUrl(true);
    try {
      const res = await fetch('/api/jobs/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: jobUrl }),
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || 'Failed to fetch job description');
      
      setJobDescription(data.text);
      toast.success('Job description extracted successfully!');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsFetchingUrl(false);
    }
  };

  const handleAnalyze = async () => {
    if (!jobDescription) {
      toast.error('Please paste a job description.');
      return;
    }
    
    setIsAnalyzing(true);
    setResults(null);
    
    try {
      const res = await fetch('/api/ats/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobDescription }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Analysis failed');
      
      setResults(data);
      toast.success('Resume tailored successfully!');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCloudApply = async () => {
    if (!jobUrl) {
      toast.error('Job URL is required for Cloud Auto-Apply');
      return;
    }
    
    setIsApplying(true);
    try {
      const res = await fetch('/api/jobs/auto-apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: jobUrl }),
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || 'Auto-apply failed');
      
      toast.success('Application submitted successfully!');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-8 bg-[#faf8f5] text-black font-sans min-h-screen">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-12 border-b-8 border-black pb-8">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-[#ff90e8] border-4 border-black flex items-center justify-center shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] -rotate-3">
            <Zap className="w-8 h-8 text-black" />
          </div>
          <div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase">AI Tailor</h1>
            <p className="font-bold text-lg mt-1 bg-[#ffe500] inline-block px-2 border-2 border-black -rotate-1">Target specific roles & auto-apply.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
        
        {/* Left Column: Job Input & JD */}
        <div className="xl:col-span-5 space-y-8">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white p-8 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative"
          >
            <div className="absolute -top-4 -right-4 bg-[#ffe500] px-4 py-1 border-4 border-black font-black uppercase text-sm rotate-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              Step 1
            </div>

            <h2 className="text-2xl font-black uppercase mb-6 flex items-center gap-2">
              <Briefcase className="w-6 h-6" /> Target Job
            </h2>
            
            <div className="space-y-6">
              <div>
                <label className="font-bold uppercase text-sm mb-2 block">1. Job URL (Needed for Auto-Apply)</label>
                <div className="flex gap-2">
                  <Input 
                    placeholder="https://linkedin.com/jobs/view/..." 
                    value={jobUrl}
                    onChange={(e: any) => setJobUrl(e.target.value)}
                    className="flex-1 rounded-none border-4 border-black bg-[#faf8f5] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus-visible:ring-0 focus-visible:translate-x-[2px] focus-visible:translate-y-[2px] focus-visible:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all font-mono"
                  />
                  <Button 
                    onClick={handleFetchUrl} 
                    disabled={isFetchingUrl || !jobUrl}
                    className="rounded-none border-4 border-black bg-[#90c0ff] hover:bg-[#70aaff] text-black font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:translate-x-1 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
                  >
                    {isFetchingUrl ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Fetch'}
                  </Button>
                </div>
              </div>

              <div className="flex items-center gap-4 py-2 opacity-50">
                <div className="h-1 bg-black flex-1"></div>
                <span className="text-sm font-black uppercase tracking-widest">OR PASTE JD</span>
                <div className="h-1 bg-black flex-1"></div>
              </div>

              <div>
                <label className="font-bold uppercase text-sm mb-2 block">2. Job Description Text</label>
                <Textarea 
                  placeholder="Paste the target job description here..." 
                  value={jobDescription}
                  onChange={(e: any) => setJobDescription(e.target.value)}
                  className="w-full rounded-none border-4 border-black bg-[#faf8f5] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus-visible:ring-0 focus-visible:translate-x-[2px] focus-visible:translate-y-[2px] focus-visible:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all resize-none min-h-[220px] font-mono text-sm"
                />
              </div>
            </div>

            <Button 
              className="w-full h-14 mt-8 rounded-none border-4 border-black bg-[#ff90e8] hover:bg-[#ff70dd] text-black font-black uppercase text-lg shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:translate-x-1 hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all flex gap-3"
              onClick={handleAnalyze}
              disabled={isAnalyzing || !jobDescription}
            >
              {isAnalyzing ? (
                <><Loader2 className="w-6 h-6 animate-spin" /> Crafting Resume...</>
              ) : (
                <><Target className="w-6 h-6" /> Tailor My Resume</>
              )}
            </Button>
          </motion.div>
        </div>

        {/* Right Column: Tailored Results & Auto Apply */}
        <div className="xl:col-span-7 flex flex-col space-y-8">
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white p-8 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex-1 flex flex-col relative"
          >
            <div className="absolute -top-4 -right-4 bg-[#90c0ff] px-4 py-1 border-4 border-black font-black uppercase text-sm -rotate-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              Step 2
            </div>

            <h2 className="text-2xl font-black uppercase mb-6 flex items-center gap-2">
              <CheckCircle className="w-6 h-6" /> Result & Apply
            </h2>
            
            {results ? (
              <div className="space-y-8 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between p-6 bg-[#faf8f5] border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] mb-8">
                    <div>
                      <h3 className="font-bold uppercase tracking-wider mb-1">Overall ATS Match Score</h3>
                      <p className="text-5xl font-black">{results.score}%</p>
                    </div>
                    <div className="w-20 h-20 bg-white border-4 border-black rounded-full flex items-center justify-center font-bold rotate-6">
                      {results.score >= 80 ? "🔥" : results.score >= 60 ? "👍" : "😬"}
                    </div>
                  </div>

                  {/* Multi-Dimension Breakdown */}
                  {results.breakdown && (
                    <div className="grid grid-cols-3 gap-4 mb-8">
                      <div className="p-4 bg-[#abf5d1] border-3 border-black text-black">
                        <span className="text-[11px] font-black uppercase tracking-wider block">Hard Skills Match</span>
                        <span className="text-2xl font-black">{results.breakdown.hardSkillsMatch}%</span>
                      </div>
                      <div className="p-4 bg-[#ffe500] border-3 border-black text-black">
                        <span className="text-[11px] font-black uppercase tracking-wider block">Action Verbs & Impact</span>
                        <span className="text-2xl font-black">{results.breakdown.actionVerbsMatch}%</span>
                      </div>
                      <div className="p-4 bg-[#90c0ff] border-3 border-black text-black">
                        <span className="text-[11px] font-black uppercase tracking-wider block">ATS Readability</span>
                        <span className="text-2xl font-black">{results.breakdown.atsReadability}%</span>
                      </div>
                    </div>
                  )}

                  {/* Explicit Actionable Changes Required (Eme Changes Cheyali) */}
                  {results.actionableChanges && results.actionableChanges.length > 0 && (
                    <div className="mb-8 p-6 bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] space-y-4">
                      <h3 className="font-black uppercase text-xl border-b-4 border-black pb-2 flex items-center gap-2">
                        💡 Required Resume Changes (Exact Actions)
                      </h3>
                      <div className="space-y-3">
                        {results.actionableChanges.map((change: any, idx: number) => (
                          <div key={idx} className="p-4 bg-[#faf8f5] border-3 border-black space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="font-black text-base uppercase">{change.title}</span>
                              <span className={`text-[10px] font-black uppercase px-2 py-0.5 border-2 border-black ${
                                change.severity === 'CRITICAL' ? 'bg-[#ff4040] text-white' : 'bg-[#ffe500] text-black'
                              }`}>
                                {change.severity}
                              </span>
                            </div>
                            <p className="text-xs font-bold text-gray-700">{change.description}</p>
                            <div className="mt-2 pt-2 border-t-2 border-dashed border-black/20 text-xs font-black text-[#23a094]">
                              👉 Recommended Fix: {change.action}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-6 bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                      <div className="flex items-center gap-2 mb-4 font-black uppercase">
                        <CheckCircle className="w-5 h-5 text-[#23a094]" /> Found Keywords
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {results.matchedSkills.map((s: string) => (
                          <span key={s} className="px-3 py-1 text-sm bg-[#23a094] text-white border-2 border-black font-bold">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div className="p-6 bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                      <div className="flex items-center gap-2 mb-4 font-black uppercase">
                        <AlertTriangle className="w-5 h-5 text-[#ff4040]" /> Missing Keywords
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {results.missingSkills.map((s: string) => (
                          <span key={s} className="px-3 py-1 text-sm bg-[#ff4040] text-white border-2 border-black font-bold">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {results.tailoredResume && (
                    <div className="mt-8 p-6 bg-[#faf8f5] border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-black uppercase tracking-wider">AI Tailored Resume Output</h3>
                        <Button 
                          size="sm"
                          className="rounded-none border-2 border-black bg-[#90c0ff] hover:bg-black hover:text-white font-bold"
                          onClick={() => {
                            navigator.clipboard.writeText(results.tailoredResume);
                            toast.success("Copied to clipboard!");
                          }}
                        >
                          Copy Text
                        </Button>
                      </div>
                      <Textarea 
                        readOnly
                        value={results.tailoredResume}
                        className="w-full rounded-none border-4 border-black bg-white shadow-[inset_4px_4px_0px_0px_rgba(0,0,0,0.1)] focus-visible:ring-0 min-h-[300px] font-mono text-sm"
                      />
                    </div>
                  )}
                </div>

                {/* Auto Apply Action */}
                <div className="mt-10 p-8 bg-[#ffe500] border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden -rotate-1 hover:rotate-0 transition-transform">
                  <div className="absolute -bottom-10 -right-10 opacity-20">
                    <Rocket className="w-48 h-48" />
                  </div>
                  <h3 className="text-3xl font-black uppercase mb-4 relative z-10">Deploy Agent</h3>
                  <p className="font-bold text-lg mb-8 relative z-10 max-w-sm">Let our cloud browser do the heavy lifting. We'll fill out the application automatically.</p>
                  
                  <Button 
                    className="h-16 px-10 rounded-none border-4 border-black bg-white hover:bg-[#faf8f5] text-black font-black uppercase text-xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:translate-x-1 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all flex gap-3 relative z-10"
                    onClick={handleCloudApply}
                    disabled={isApplying || !jobUrl}
                  >
                    {isApplying ? (
                      <><Loader2 className="w-6 h-6 animate-spin" /> Submitting...</>
                    ) : (
                      <><Rocket className="w-6 h-6" /> Auto-Apply Now</>
                    )}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-black/40 py-20">
                <div className="w-24 h-24 border-4 border-black/20 rounded-full flex items-center justify-center mb-6 -rotate-12">
                  <Target className="w-10 h-10" />
                </div>
                <p className="text-center font-bold max-w-sm text-lg">Paste a job link and click Tailor Resume to generate your match score.</p>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
