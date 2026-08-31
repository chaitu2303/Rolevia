'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Briefcase, Link as LinkIcon, FileText, Upload, ChevronRight, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'react-hot-toast';

export default function NewJobTargetPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'text' | 'url'>('text');
  const [jobText, setJobText] = useState('');
  const [jobUrl, setJobUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [loadingStage, setLoadingStage] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleAnalyzeText = async () => {
    if (!jobText.trim()) return;
    setIsAnalyzing(true);
    setError(null);
    setLoadingStage('Extracting job description details...');
    try {
      const res = await fetch('/api/jobs/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: jobText })
      });
      const data = await res.json();
      if (res.ok && data.jobId) {
        toast.success('Job analyzed successfully!');
        router.push(`/dashboard/jobs/${data.jobId}`);
      } else {
        setError(data.error || 'Failed to analyze job');
      }
    } catch (e) {
      setError('Network error analyzing job. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAnalyzeUrl = async () => {
    if (!jobUrl.trim()) return;
    setIsAnalyzing(true);
    setError(null);
    
    try {
      // Step 1: Extract Text from URL
      setLoadingStage('Scraping job page content...');
      const extractRes = await fetch('/api/jobs/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: jobUrl })
      });
      const extractData = await extractRes.json();
      
      if (!extractRes.ok) {
        throw new Error(extractData.error || 'Failed to extract text from URL');
      }
      
      const scrapedText = extractData.text;
      if (!scrapedText || !scrapedText.trim()) {
        throw new Error('No readable content found at the provided URL.');
      }

      // Step 2: Analyze match
      setLoadingStage('Running match evaluation...');
      const analyzeRes = await fetch('/api/jobs/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: scrapedText })
      });
      const analyzeData = await analyzeRes.json();
      
      if (!analyzeRes.ok || !analyzeData.jobId) {
        throw new Error(analyzeData.error || 'Failed to evaluate job requirements');
      }

      // Step 3: Link sourceUrl
      toast.success('Scraped and matched successfully!');
      router.push(`/dashboard/jobs/${analyzeData.jobId}`);

    } catch (err: any) {
      setError(err.message || 'Scraping failed. Try pasting the description text directly.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Job Intelligence Engine</h1>
        <p className="text-muted-foreground font-medium">Target a specific role and let our AI compare it against your Master Career Profile.</p>
      </div>

      <div className="bg-card border rounded-2xl p-2 shadow-sm">
        <div className="flex gap-2 p-2 bg-muted/30 rounded-xl">
          <button 
            disabled={isAnalyzing}
            onClick={() => setActiveTab('text')}
            className={`flex-1 py-3 text-sm font-medium rounded-lg flex items-center justify-center gap-2 transition-all ${activeTab === 'text' ? 'bg-background shadow text-primary font-bold' : 'text-muted-foreground hover:bg-muted/50'}`}
          >
            <FileText className="w-4 h-4" /> Paste Description
          </button>
          <button 
            disabled={isAnalyzing}
            onClick={() => setActiveTab('url')}
            className={`flex-1 py-3 text-sm font-medium rounded-lg flex items-center justify-center gap-2 transition-all ${activeTab === 'url' ? 'bg-background shadow text-primary font-bold' : 'text-muted-foreground hover:bg-muted/50'}`}
          >
            <LinkIcon className="w-4 h-4" /> URL Link
          </button>
        </div>

        <div className="p-6">
          {isAnalyzing ? (
            <div className="py-16 text-center space-y-6">
              <Loader2 className="w-12 h-12 mx-auto animate-spin text-primary" />
              <div className="space-y-1">
                <h3 className="font-bold text-lg">{loadingStage}</h3>
                <p className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">Analyzing target alignment</p>
              </div>
            </div>
          ) : (
            <>
              {activeTab === 'text' && (
                <div className="space-y-4">
                  <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Job Description Text</label>
                  <textarea 
                    value={jobText}
                    onChange={(e) => setJobText(e.target.value)}
                    placeholder="Paste the full job description here..."
                    className="w-full h-64 p-4 rounded-xl border bg-background resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm font-medium"
                  />
                </div>
              )}

              {activeTab === 'url' && (
                <div className="space-y-6 py-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Job Listing URL</label>
                    <input 
                      type="url"
                      value={jobUrl}
                      onChange={(e) => setJobUrl(e.target.value)}
                      placeholder="e.g. https://www.linkedin.com/jobs/view/... or https://lever.co/..."
                      className="w-full h-12 px-4 rounded-xl border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm font-medium"
                    />
                  </div>
                  <div className="p-4 bg-muted/20 border rounded-xl flex items-start gap-2 text-xs text-muted-foreground leading-relaxed">
                    <AlertCircle className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <span>Our scraper will extract details directly from LinkedIn, Lever, Greenhouse, Indeed, and public corporate boards. Private or cookie-gated portals may fail; please use manual paste in those instances.</span>
                  </div>
                </div>
              )}

              {error && (
                <div className="mt-4 p-4 bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-xl font-bold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  <span>{error}</span>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <div className="flex justify-end">
        <Button 
          size="lg" 
          onClick={activeTab === 'text' ? handleAnalyzeText : handleAnalyzeUrl} 
          disabled={isAnalyzing || (activeTab === 'text' && !jobText.trim()) || (activeTab === 'url' && !jobUrl.trim())}
          className="gap-2 rounded-xl shadow-md font-bold px-6 h-12"
        >
          {isAnalyzing ? 'Processing...' : 'Analyze Job Target'}
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
