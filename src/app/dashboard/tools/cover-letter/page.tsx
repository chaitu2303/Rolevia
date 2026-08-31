'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Sparkles, Copy, Edit, Check, AlertTriangle, 
  ArrowLeft, Loader2, FileText, ChevronRight, FileDown 
} from 'lucide-react';
import Link from 'next/link';

interface Resume {
  id: string;
  title: string;
  updatedAt: string;
}

export default function CoverLetterPage() {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState<string>('');
  const [companyName, setCompanyName] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [tone, setTone] = useState<'ambitious' | 'editorial' | 'human' | 'direct'>('editorial');
  const [jobDescription, setJobDescription] = useState('');
  
  const [loadingResumes, setLoadingResumes] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [editingLetter, setEditingLetter] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch user resumes
  useEffect(() => {
    fetch('/api/resumes')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setResumes(data);
          if (data.length > 0) {
            setSelectedResumeId(data[0].id);
          }
        }
        setLoadingResumes(false);
      })
      .catch(err => {
        console.error('Error fetching resumes:', err);
        setLoadingResumes(false);
      });
  }, []);

  const handleGenerate = async () => {
    if (!jobDescription) {
      setError('Please paste a job description.');
      return;
    }
    setError(null);
    setGenerating(true);
    setCoverLetter('');
    setIsEditing(false);

    try {
      const res = await fetch('/api/tools/cover-letter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resumeId: selectedResumeId,
          jobDescription,
          tone,
          companyName,
          recipientName
        })
      });

      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        setCoverLetter(data.coverLetter);
        setEditingLetter(data.coverLetter);
      }
    } catch (err) {
      setError('An error occurred during cover letter generation.');
    } finally {
      setGenerating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(isEditing ? editingLetter : coverLetter);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      {/* Back to Tools Link */}
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Dashboard
      </Link>

      <div className="space-y-1">
        <h1 className="text-2xl font-black text-foreground flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-emerald-600" />
          Cover Letter Intelligence Lab
        </h1>
        <p className="text-sm text-muted-foreground">
          Tailor cover letters matching your actual resume experience facts with target job keywords.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Inputs */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="border border-border/80 shadow-sm">
            <CardContent className="p-6 space-y-4">
              
              {/* Resume Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase text-slate-500 tracking-wider">Select Resume Evidence</label>
                {loadingResumes ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground p-2 bg-muted/30 rounded-lg">
                    <Loader2 className="w-4 h-4 animate-spin text-emerald-600" /> Loading resumes...
                  </div>
                ) : resumes.length === 0 ? (
                  <div className="text-xs text-muted-foreground p-3 border border-dashed rounded-lg">
                    No resumes found. We will use your primary profile facts.
                  </div>
                ) : (
                  <select
                    value={selectedResumeId}
                    onChange={e => setSelectedResumeId(e.target.value)}
                    className="w-full p-2.5 text-sm rounded-xl border border-border bg-muted/30 focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    {resumes.map(r => (
                      <option key={r.id} value={r.id}>{r.title}</option>
                    ))}
                  </select>
                )}
              </div>

              {/* Company & Recipient */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase text-slate-500 tracking-wider">Company Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Google"
                    value={companyName}
                    onChange={e => setCompanyName(e.target.value)}
                    className="w-full p-2.5 text-sm rounded-xl border border-border bg-muted/30 focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase text-slate-500 tracking-wider">Recipient Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Hiring Manager"
                    value={recipientName}
                    onChange={e => setRecipientName(e.target.value)}
                    className="w-full p-2.5 text-sm rounded-xl border border-border bg-muted/30 focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              </div>

              {/* Tone Selection */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase text-slate-500 tracking-wider">Cover Letter Tone</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { key: 'editorial', label: 'Editorial', desc: 'Narrative-driven' },
                    { key: 'ambitious', label: 'Ambitious', desc: 'Growth stats focus' },
                    { key: 'human', label: 'Human', desc: 'Warm storytelling' },
                    { key: 'direct', label: 'Direct', desc: 'Concise & blunt' },
                  ].map(t => (
                    <button
                      key={t.key}
                      onClick={() => setTone(t.key as any)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        tone === t.key 
                          ? 'border-emerald-500 bg-emerald-50/20 dark:bg-emerald-950/20 ring-1 ring-emerald-500' 
                          : 'border-border bg-muted/20 hover:bg-muted/40'
                      }`}
                    >
                      <p className="text-xs font-bold text-foreground">{t.label}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5 leading-none">{t.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Job Description Textarea */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase text-slate-500 tracking-wider">Job Description</label>
                <textarea
                  placeholder="Paste target job requirement requirements or text..."
                  value={jobDescription}
                  onChange={e => setJobDescription(e.target.value)}
                  rows={6}
                  className="w-full p-3 text-sm rounded-xl border border-border bg-muted/30 focus:outline-none focus:ring-2 focus:ring-ring resize-none font-sans"
                />
              </div>

              {error && (
                <div className="rounded-xl bg-destructive/10 border border-destructive/20 p-3 text-xs text-destructive flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <Button
                onClick={handleGenerate}
                disabled={generating}
                className="w-full bg-[#1A1A1A] hover:bg-slate-800 text-white py-6 rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-sm"
              >
                {generating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin text-emerald-400" />
                    Analyzing & Tailoring...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                    Generate Cover Letter
                  </>
                )}
              </Button>

            </CardContent>
          </Card>
        </div>

        {/* Right Side: Preview & Controls */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase text-slate-500 tracking-wider">Letter Preview</h3>
            
            {(coverLetter || isEditing) && (
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handleCopy} className="rounded-lg h-9">
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 mr-1 text-emerald-600" /> Copied
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-1" /> Copy Text
                    </>
                  )}
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => {
                    if (isEditing) {
                      setCoverLetter(editingLetter);
                    }
                    setIsEditing(!isEditing);
                  }}
                  className="rounded-lg h-9"
                >
                  <Edit className="w-4 h-4 mr-1" />
                  {isEditing ? 'View Letter' : 'Edit Mode'}
                </Button>
              </div>
            )}
          </div>

          <div className="relative min-h-[500px] w-full bg-[#FAF8F5] border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden flex flex-col">
            
            {/* Header paper decoration */}
            <div className="bg-slate-900 h-1.5 w-full shrink-0" />

            <div className="flex-1 p-8 md:p-12 overflow-y-auto">
              {generating ? (
                <div className="h-full flex flex-col items-center justify-center space-y-4 py-32">
                  <div className="relative w-full max-w-[200px] aspect-[1/1.4] bg-white rounded-lg shadow-sm border p-4 overflow-hidden relative">
                    <motion.div 
                      className="absolute left-0 right-0 h-1 bg-emerald-500 shadow-[0_0_8px_2px_rgba(16,185,129,0.5)] z-20"
                      animate={{ top: ["5%", "95%", "5%"] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    />
                    <div className="space-y-3">
                      <div className="h-2 bg-slate-200 rounded w-2/3" />
                      <div className="h-1 bg-slate-100 rounded w-full" />
                      <div className="h-1 bg-slate-100 rounded w-5/6" />
                      <div className="h-1 bg-slate-100 rounded w-full" />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground animate-pulse font-medium">Aligning experiences to skills...</p>
                </div>
              ) : coverLetter ? (
                isEditing ? (
                  <textarea
                    value={editingLetter}
                    onChange={e => setEditingLetter(e.target.value)}
                    className="w-full h-full min-h-[400px] bg-transparent border-0 focus:outline-none focus:ring-0 text-slate-800 font-serif text-sm leading-relaxed resize-none"
                  />
                ) : (
                  <div className="font-serif text-sm text-slate-800 leading-relaxed whitespace-pre-line select-text">
                    {coverLetter}
                  </div>
                )
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-2 py-32 text-muted-foreground select-none">
                  <FileText className="w-12 h-12 text-slate-300" />
                  <p className="text-sm font-semibold">No Letter Generated Yet</p>
                  <p className="text-xs max-w-xs">Fill out the target details and click generate to build your cover letter.</p>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
