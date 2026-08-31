'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, Suspense, useRef } from 'react';
import { 
  FileText, Sparkles, ArrowRight, Loader2, Upload, 
  AlignLeft, CheckCircle2, ChevronRight, Briefcase, FileUp 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function NewResumeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Outer flow state: 'SELECT_PATH' | 'BUILD_FROM_SCRATCH' | 'UPLOAD_RESUME'
  const [flowPath, setFlowPath] = useState<'SELECT_PATH' | 'BUILD_FROM_SCRATCH' | 'UPLOAD_RESUME'>('SELECT_PATH');

  // Build from scratch states
  const [scratchMode, setScratchMode] = useState<'BLANK' | 'FROM_PROFILE'>('FROM_PROFILE');
  const [scratchTitle, setScratchTitle] = useState('');

  // Upload/Optimize states
  const [uploadOption, setUploadOption] = useState<'JD_OPTIMIZE' | 'EDIT_RESUME' | 'FIRST_RESUME'>('JD_OPTIMIZE');
  const [uploadTab, setUploadTab] = useState<'FILE' | 'TEXT'>('FILE');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [resumeText, setResumeText] = useState('');
  const [jobDescription, setJobDescription] = useState('');

  const [loading, setLoading] = useState(false);
  const [loadingStage, setLoadingStage] = useState('');
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  // File Drag & Drop Handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  // Submit handler for Scratch builds
  async function handleCreateScratch() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/resumes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: scratchMode,
          title: scratchTitle.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Failed to create resume');
        return;
      }
      
      const jobId = searchParams.get('jobId');
      if (jobId) {
        const tailorRes = await fetch(`/api/resumes/${data.resumeId}/tailor`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ jobId, mode: 'BALANCED' })
        });
        if (tailorRes.ok) {
          // Tailoring succeeded, navigate
        }
      }
      router.push(`/dashboard/resumes/${data.resumeId}`);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  // Submit handler for Upload/Optimize builds
  async function handleUploadAndBuild() {
    setError(null);
    setLoading(true);
    
    // Validation
    if (uploadTab === 'FILE' && !selectedFile) {
      setError('Please select or drop a PDF resume file.');
      setLoading(false);
      return;
    }
    if (uploadTab === 'TEXT' && !resumeText.trim()) {
      setError('Please paste your resume text.');
      setLoading(false);
      return;
    }
    if (uploadOption === 'JD_OPTIMIZE' && !jobDescription.trim()) {
      setError('Please provide a Job Description to optimize against.');
      setLoading(false);
      return;
    }

    try {
      let resumeId = '';

      // Stage 1: Upload / Parse Resume
      setLoadingStage('Parsing resume data...');
      if (uploadTab === 'FILE' && selectedFile) {
        const formData = new FormData();
        formData.append('file', selectedFile);
        const uploadRes = await fetch('/api/resumes/upload', {
          method: 'POST',
          body: formData,
        });
        const uploadData = await uploadRes.json();
        if (!uploadRes.ok) {
          throw new Error(uploadData.error || 'Failed to upload file');
        }
        resumeId = uploadData.resumeId;
      } else {
        const uploadRes = await fetch('/api/resumes/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: resumeText, title: 'Pasted Resume' }),
        });
        const uploadData = await uploadRes.json();
        if (!uploadRes.ok) {
          throw new Error(uploadData.error || 'Failed to create resume from text');
        }
        resumeId = uploadData.resumeId;
      }

      // Stage 2: If JD Optimize is selected, extract JD and tailor
      if (uploadOption === 'JD_OPTIMIZE') {
        setLoadingStage('Analyzing job description requirements...');
        const analyzeRes = await fetch('/api/jobs/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: jobDescription }),
        });
        const analyzeData = await analyzeRes.json();
        if (!analyzeRes.ok) {
          throw new Error(analyzeData.error || 'Failed to analyze job description');
        }
        
        const jobId = analyzeData.jobId;

        setLoadingStage('Tailoring resume sections with Truth Guard validation...');
        const tailorRes = await fetch(`/api/resumes/${resumeId}/tailor`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ jobId, mode: 'BALANCED' }),
        });
        const tailorData = await tailorRes.json();
        if (!tailorRes.ok) {
          throw new Error(tailorData.error || 'Failed to tailor resume to job requirements');
        }
      }

      setLoadingStage('Redirecting to resume studio...');
      router.push(`/dashboard/resumes/${resumeId}`);
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-6 bg-[#faf8f5] text-black">
      <AnimatePresence mode="wait">
        
        {/* PATH 1: Choose starting path */}
        {flowPath === 'SELECT_PATH' && (
          <motion.div
            key="select-path"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="w-full max-w-4xl space-y-10 py-12"
          >
            <div className="text-center space-y-3">
              <span className="text-xs font-bold uppercase tracking-widest text-primary bg-primary/10 px-3 py-1 rounded-full">
                HOW DO YOU WANT TO START?
              </span>
              <h1 className="text-4xl md:text-5xl font-serif font-bold tracking-tight">
                Pick the fastest path to your resume.
              </h1>
              <p className="font-medium text-muted-foreground text-base md:text-lg">
                Choose how you'd like to begin — both take just a few minutes.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* Option: Build from Scratch */}
              <div className="bg-white border border-border rounded-2xl p-8 premium-shadow flex flex-col justify-between hover:shadow-lg transition-all group">
                <div className="space-y-6">
                  <div className="w-16 h-16 bg-blue-50 border border-blue-100 rounded-2xl flex items-center justify-center group-hover:scale-105 transition-transform">
                    <FileText className="w-8 h-8 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold tracking-tight mb-2">Build from scratch</h2>
                    <p className="font-medium text-muted-foreground text-sm">
                      Start with a blank page and let AI write every section with you.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setFlowPath('BUILD_FROM_SCRATCH')}
                  className="mt-8 w-full h-12 flex items-center justify-center gap-2 rounded-xl bg-slate-900 text-white font-bold shadow-sm hover:bg-slate-800 transition-all"
                >
                  Continue <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              {/* Option: Upload Resume */}
              <div className="bg-white border border-border rounded-2xl p-8 premium-shadow flex flex-col justify-between hover:shadow-lg transition-all group">
                <div className="space-y-6">
                  <div className="w-16 h-16 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Upload className="w-8 h-8 text-emerald-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold tracking-tight mb-2">Upload resume</h2>
                    <p className="font-medium text-muted-foreground text-sm">
                      Drop in your existing resume and we'll tailor it to a matching job right away.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setFlowPath('UPLOAD_RESUME')}
                  className="mt-8 w-full h-12 flex items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground font-bold shadow-sm hover:bg-primary/90 transition-all"
                >
                  Continue <ChevronRight className="w-5 h-5" />
                </button>
              </div>

            </div>
          </motion.div>
        )}

        {/* PATH 2: Build from scratch details */}
        {flowPath === 'BUILD_FROM_SCRATCH' && (
          <motion.div
            key="build-scratch"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="w-full max-w-xl bg-white p-8 rounded-2xl border border-border premium-shadow space-y-8"
          >
            <div className="flex items-center justify-between border-b border-border pb-4">
              <button 
                onClick={() => setFlowPath('SELECT_PATH')}
                className="text-xs font-bold tracking-widest text-muted-foreground hover:text-foreground transition-colors"
              >
                ← Back
              </button>
              <span className="font-bold text-xs uppercase text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                SCRATCH PATH
              </span>
            </div>

            <div className="text-center space-y-2">
              <h1 className="text-3xl font-serif font-bold tracking-tight">Blank or Profile</h1>
              <p className="font-medium text-muted-foreground text-sm">Choose your baseline data source</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setScratchMode('FROM_PROFILE')}
                className={`flex flex-col items-center justify-center gap-3 p-5 rounded-xl border-2 transition-all text-center group ${
                  scratchMode === 'FROM_PROFILE'
                    ? 'border-primary bg-primary/5 text-primary'
                    : 'border-border bg-white hover:border-primary/50 text-muted-foreground hover:text-foreground'
                }`}
              >
                <Sparkles className="w-6 h-6" />
                <span className="font-bold text-sm">From Profile</span>
              </button>
              <button
                onClick={() => setScratchMode('BLANK')}
                className={`flex flex-col items-center justify-center gap-3 p-5 rounded-xl border-2 transition-all text-center group ${
                  scratchMode === 'BLANK'
                    ? 'border-primary bg-primary/5 text-primary'
                    : 'border-border bg-white hover:border-primary/50 text-muted-foreground hover:text-foreground'
                }`}
              >
                <FileText className="w-6 h-6" />
                <span className="font-bold text-sm">Start Clean</span>
              </button>
            </div>

            <div className="space-y-2">
              <label htmlFor="resumeTitle" className="text-xs font-bold text-muted-foreground">Resume Title (optional)</label>
              <input
                id="resumeTitle"
                type="text"
                value={scratchTitle}
                onChange={e => setScratchTitle(e.target.value)}
                placeholder={scratchMode === 'FROM_PROFILE' ? 'e.g. Software Engineer Resume' : 'e.g. Blank Resume'}
                className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-white"
              />
            </div>

            {error && (
              <div className="p-4 bg-destructive/10 text-destructive border border-destructive/20 rounded-lg font-medium text-sm">
                {error}
              </div>
            )}

            <button
              onClick={handleCreateScratch}
              disabled={loading}
              className="w-full h-14 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowRight className="w-5 h-5" />}
              {loading ? 'Creating...' : 'Initialize Resume'}
            </button>
          </motion.div>
        )}

        {/* PATH 3: Flashresume Style Upload & Optimize flow */}
        {flowPath === 'UPLOAD_RESUME' && (
          <motion.div
            key="upload-resume-flow"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="w-full max-w-4xl space-y-8 py-8"
          >
            <div className="flex items-center justify-between">
              <button 
                onClick={() => setFlowPath('SELECT_PATH')}
                disabled={loading}
                className="text-xs font-bold tracking-widest text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
              >
                ← Back
              </button>
              <div className="flex items-center gap-2 bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-widest">Rolevia Engine</span>
              </div>
            </div>

            <div className="text-center space-y-2">
              <h1 className="text-4xl md:text-5xl font-serif font-bold tracking-tight">
                Apply-ready resume in <span className="bg-gradient-to-r from-emerald-500 to-blue-600 bg-clip-text text-transparent">60 secs.</span>
              </h1>
            </div>

            {loading ? (
              <div className="bg-white border border-border rounded-2xl p-12 premium-shadow flex flex-col items-center justify-center space-y-6">
                <Loader2 className="w-12 h-12 animate-spin text-primary" />
                <div className="text-center space-y-2">
                  <h3 className="text-xl font-bold">{loadingStage || 'Processing...'}</h3>
                  <p className="text-sm font-medium text-muted-foreground">Please do not refresh the page.</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* Options Panel (Left) */}
                <div className="lg:col-span-5 bg-white rounded-2xl border border-border p-6 premium-shadow space-y-6">
                  <div>
                    <span className="text-xs font-bold uppercase text-muted-foreground tracking-widest">1 CHOOSE OPTION</span>
                  </div>
                  <div className="space-y-3">
                    {[
                      { id: 'JD_OPTIMIZE', title: 'JD Optimize', desc: 'Align your resume bullet points with a specific target Job Description.' },
                      { id: 'EDIT_RESUME', title: 'Edit Resume', desc: 'Import and refine your formatting, layout, and phrasing.' },
                      { id: 'FIRST_RESUME', title: 'First Resume', desc: 'Establish your default base resume structure.' }
                    ].map((opt) => (
                      <label 
                        key={opt.id}
                        className={`block p-4 rounded-xl border-2 cursor-pointer transition-all ${
                          uploadOption === opt.id ? 'border-primary bg-primary/5' : 'border-transparent hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input 
                            type="radio" 
                            name="uploadOption"
                            checked={uploadOption === opt.id}
                            onChange={() => setUploadOption(opt.id as any)}
                            className="w-4 h-4 accent-primary" 
                          />
                          <span className="font-bold text-base">{opt.title}</span>
                        </div>
                        <p className="text-sm font-medium text-muted-foreground mt-1 pl-7 leading-relaxed">{opt.desc}</p>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Upload & JD Panels (Right) */}
                <div className="lg:col-span-7 space-y-6">
                  
                  {/* Step 2: Upload Resume */}
                  <div className="bg-white rounded-2xl border border-border p-6 premium-shadow space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold uppercase text-muted-foreground tracking-widest">2 UPLOAD RESUME</span>
                      <div className="flex bg-muted/50 p-1 rounded-lg border border-border">
                        <button
                          onClick={() => setUploadTab('FILE')}
                          className={`px-3 py-1 font-bold text-xs rounded-md transition-colors ${
                            uploadTab === 'FILE' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:bg-muted'
                          }`}
                        >
                          Upload File
                        </button>
                        <button
                          onClick={() => setUploadTab('TEXT')}
                          className={`px-3 py-1 font-bold text-xs rounded-md transition-colors ${
                            uploadTab === 'TEXT' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:bg-muted'
                          }`}
                        >
                          Paste Text
                        </button>
                      </div>
                    </div>

                    {uploadTab === 'FILE' ? (
                      <div 
                        onDragEnter={handleDrag}
                        onDragOver={handleDrag}
                        onDragLeave={handleDrag}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                        className={`border-2 border-dashed border-border rounded-xl p-8 text-center cursor-pointer transition-all hover:bg-slate-50 ${
                          dragActive ? 'bg-primary/5 border-primary' : ''
                        }`}
                      >
                        <input 
                          type="file" 
                          ref={fileInputRef}
                          onChange={handleFileChange}
                          accept=".pdf,.docx"
                          className="hidden" 
                        />
                        <div className="flex flex-col items-center gap-3">
                          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                            <FileUp className="w-6 h-6 text-primary" />
                          </div>
                          {selectedFile ? (
                            <div>
                              <span className="font-bold text-sm block truncate max-w-md">{selectedFile.name}</span>
                              <span className="text-xs font-medium text-muted-foreground">{(selectedFile.size / 1024).toFixed(1)} KB • Click to replace</span>
                            </div>
                          ) : (
                            <div>
                              <span className="font-bold text-sm block">Drop your current resume</span>
                              <span className="text-xs font-medium text-muted-foreground">PDF or DOCX Format</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <textarea
                          placeholder="Paste your raw resume text here..."
                          value={resumeText}
                          onChange={(e) => setResumeText(e.target.value)}
                          className="w-full h-44 p-4 border border-border rounded-xl font-medium text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-white"
                        />
                      </div>
                    )}
                  </div>

                  {/* Step 3: Conditional Job Description Panel */}
                  {uploadOption === 'JD_OPTIMIZE' && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white rounded-2xl border border-border p-6 premium-shadow space-y-4"
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold uppercase text-primary tracking-widest">3 PASTE JOB DESCRIPTION</span>
                      </div>
                      <div className="space-y-2">
                        <textarea
                          placeholder="Paste the target Job Description (roles, responsibilities, keywords)..."
                          value={jobDescription}
                          onChange={(e) => setJobDescription(e.target.value)}
                          className="w-full h-44 p-4 border border-border rounded-xl font-medium text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-white"
                        />
                      </div>
                    </motion.div>
                  )}

                  {error && (
                    <div className="p-4 bg-destructive/10 text-destructive border border-destructive/20 rounded-lg font-medium text-sm">
                      ⚠️ {error}
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    onClick={handleUploadAndBuild}
                    className="w-full h-16 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-sm transition-all flex items-center justify-center gap-3"
                  >
                    <Briefcase className="w-6 h-6" />
                    <span>
                      {uploadOption === 'JD_OPTIMIZE' ? 'Optimize & Build Resume' : 'Upload & Build Resume'}
                    </span>
                  </button>

                </div>

              </div>
            )}
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}

export default function NewResumePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#faf8f5]">
        <Loader2 className="w-12 h-12 animate-spin text-black" />
      </div>
    }>
      <NewResumeContent />
    </Suspense>
  );
}
