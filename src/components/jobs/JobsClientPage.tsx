'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Plus, Briefcase, CheckCircle2, AlertTriangle, Clock, 
  ArrowRight, Search, Zap, Loader2, RefreshCw, Send, Check 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';

interface JobTarget {
  id: string;
  company: string;
  roleTitle: string;
  department: string | null;
  industry: string | null;
  seniority: string | null;
  createdAt: Date | string;
  matchAnalysis: {
    overallScore: number;
  } | null;
}

interface JobsClientPageProps {
  initialJobs: JobTarget[];
  targetRole: string;
}

// Simulated synced jobs matched to target role
const PLATFORMS = ['LinkedIn', 'Indeed', 'ZipRecruiter', 'Glassdoor'];
const LOCATIONS = ['Remote', 'San Francisco, CA', 'New York, NY', 'Austin, TX', 'Seattle, WA'];

export function JobsClientPage({ initialJobs, targetRole }: JobsClientPageProps) {
  const router = useRouter();
  const [jobs, setJobs] = useState<JobTarget[]>(initialJobs);
  const [activeTab, setActiveTab] = useState<'targets' | 'sync'>('targets');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Job Syncing States
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncedJobs, setSyncedJobs] = useState<any[]>([]);
  const [hasSynced, setHasSynced] = useState(false);

  // Auto Apply execution states
  const [applyingJobId, setApplyingJobId] = useState<string | null>(null);
  const [applyStage, setApplyStage] = useState<'IDLE' | 'LAUNCHING' | 'NAVIGATING' | 'FILLING' | 'SUBMITTING' | 'DONE'>('IDLE');
  const [applyProgress, setApplyProgress] = useState(0);

  // Handle Sync related jobs from platforms
  const handleSyncJobs = () => {
    setIsSyncing(true);
    toast.loading('Syncing related jobs from job boards...', { id: 'sync' });
    
    setTimeout(() => {
      const role = targetRole || 'Software Engineer';
      const mockSynced = [
        {
          id: 'sync-1',
          roleTitle: `Senior ${role}`,
          company: 'Stripe',
          platform: 'LinkedIn',
          location: 'Remote',
          url: 'https://lever.co/stripe/senior-engineer-demo',
          matchScore: 92,
          salaryRange: '$160,000 - $210,000',
        },
        {
          id: 'sync-2',
          roleTitle: `Full Stack ${role}`,
          company: 'Vercel',
          platform: 'Indeed',
          location: 'San Francisco, CA',
          url: 'https://lever.co/vercel/fullstack-engineer-demo',
          matchScore: 88,
          salaryRange: '$150,000 - $190,000',
        },
        {
          id: 'sync-3',
          roleTitle: `Associate ${role}`,
          company: 'Supabase',
          platform: 'ZipRecruiter',
          location: 'Remote',
          url: 'https://greenhouse.io/supabase/associate-engineer-demo',
          matchScore: 84,
          salaryRange: '$120,000 - $150,000',
        },
        {
          id: 'sync-4',
          roleTitle: `${role} - AI Platforms`,
          company: 'Clerk',
          platform: 'Glassdoor',
          location: 'New York, NY',
          url: 'https://lever.co/clerk/ai-engineer-demo',
          matchScore: 78,
          salaryRange: '$140,000 - $180,000',
        },
        {
          id: 'sync-5',
          roleTitle: `Staff ${role}`,
          company: 'Linear',
          platform: 'LinkedIn',
          location: 'Remote',
          url: 'https://greenhouse.io/linear/staff-engineer-demo',
          matchScore: 95,
          salaryRange: '$180,000 - $230,000',
        }
      ];
      setSyncedJobs(mockSynced);
      setIsSyncing(false);
      setHasSynced(true);
      toast.success(`Synced 5 related ${role} jobs!`, { id: 'sync' });
    }, 2000);
  };

  // Auto Apply Trigger
  const triggerAutoApply = async (job: any) => {
    setApplyingJobId(job.id);
    setApplyStage('LAUNCHING');
    setApplyProgress(15);

    try {
      // 1. Launch stage duration
      await new Promise(resolve => setTimeout(resolve, 1500));
      setApplyStage('NAVIGATING');
      setApplyProgress(40);

      // 2. Navigation stage
      await new Promise(resolve => setTimeout(resolve, 1500));
      setApplyStage('FILLING');
      setApplyProgress(75);

      // 3. Playwright browser auto-fill call (actually execute on backend)
      const res = await fetch('/api/jobs/auto-apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: job.url })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Auto Apply session aborted');
      }

      setApplyStage('SUBMITTING');
      setApplyProgress(90);
      await new Promise(resolve => setTimeout(resolve, 1000));

      setApplyStage('DONE');
      setApplyProgress(100);
      toast.success(`Successfully applied to ${job.company}!`);

      // Automatically add this job as a targeted job in the platform
      const analyzeRes = await fetch('/api/jobs/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          text: `Position: ${job.roleTitle}\nCompany: ${job.company}\nDescription: Autogenerated matched job description for auto-apply details.` 
        })
      });
      const analyzeData = await analyzeRes.json();
      if (analyzeRes.ok && analyzeData.jobId) {
        // Refresh local job list
        router.refresh();
      }

      setTimeout(() => {
        setApplyingJobId(null);
        setApplyStage('IDLE');
      }, 2000);

    } catch (err: any) {
      toast.error(err.message || 'Auto apply failed. Check URL format.');
      setApplyingJobId(null);
      setApplyStage('IDLE');
    }
  };

  // Analyze Job Target from Synced Job
  const triggerAnalysis = async (job: any) => {
    const loadId = toast.loading('Extracting and analyzing requirements...');
    try {
      const res = await fetch('/api/jobs/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: `Position: ${job.roleTitle}\nCompany: ${job.company}\nDescription: This job was synced from ${job.platform}. Required Stack matches your core profile facts.`
        })
      });
      const data = await res.json();
      if (res.ok && data.jobId) {
        toast.success('Analysis complete!', { id: loadId });
        router.push(`/dashboard/jobs/${data.jobId}`);
      } else {
        toast.error('Could not analyze matching details.', { id: loadId });
      }
    } catch {
      toast.error('Network error during analysis.', { id: loadId });
    }
  };

  const filteredJobs = jobs.filter(job => 
    job.roleTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.company.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-8 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b pb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
              <Briefcase className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-black uppercase tracking-tight">Job Intelligence Hub</h1>
              <p className="text-muted-foreground text-sm font-semibold uppercase tracking-wider mt-0.5">
                Target Role: {targetRole || 'Not Set (Software Engineer default)'}
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/dashboard/jobs/new">
            <Button className="rounded-xl shadow-md gap-2 font-bold h-11 px-5">
              <Plus className="w-4 h-4" /> Analyze Target URL / Text
            </Button>
          </Link>
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="flex items-center justify-between gap-4 flex-wrap bg-muted/20 p-1.5 rounded-2xl border">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('targets')}
            className={`px-6 py-2.5 rounded-xl text-sm font-bold uppercase tracking-wider transition-all ${
              activeTab === 'targets' ? 'bg-background shadow text-primary' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            🎯 My Target Board ({jobs.length})
          </button>
          <button
            onClick={() => {
              setActiveTab('sync');
              if (!hasSynced) handleSyncJobs();
            }}
            className={`px-6 py-2.5 rounded-xl text-sm font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${
              activeTab === 'sync' ? 'bg-background shadow text-primary' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <span>🔄 Platforms Sync Feed</span>
            {syncedJobs.length > 0 && (
              <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full text-xs font-black">
                {syncedJobs.length}
              </span>
            )}
          </button>
        </div>

        {activeTab === 'targets' && (
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search targets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-10 pr-4 rounded-xl border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>
        )}

        {activeTab === 'sync' && (
          <Button 
            disabled={isSyncing}
            onClick={handleSyncJobs}
            variant="outline" 
            className="rounded-xl font-bold h-10 text-xs uppercase"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
            Re-sync Platforms
          </Button>
        )}
      </div>

      {/* TABS VIEWPORT */}
      <AnimatePresence mode="wait">
        
        {/* TAB 1: Target Board */}
        {activeTab === 'targets' && (
          <motion.div
            key="targets-tab"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {filteredJobs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed rounded-3xl bg-card text-center space-y-6">
                <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center">
                  <Briefcase className="w-6 h-6 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">No targeted jobs found</h3>
                  <p className="text-muted-foreground text-sm max-w-sm mt-1 mx-auto">
                    Analyze a job description text or link to populate your match analysis target list.
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredJobs.map((job) => {
                  const score = job.matchAnalysis?.overallScore;
                  return (
                    <Link
                      key={job.id}
                      href={`/dashboard/jobs/${job.id}`}
                      className="group bg-white border-3 border-black p-6 shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all flex flex-col justify-between min-h-[220px]"
                    >
                      <div className="space-y-4">
                        <div className="flex justify-between items-start gap-2">
                          <div className="w-10 h-10 bg-slate-100 border-2 border-black flex items-center justify-center rotate-3">
                            <Briefcase className="w-5 h-5 text-black" />
                          </div>
                          {score !== undefined && (
                            <span className={`text-[10px] font-black uppercase px-2 py-0.5 border-2 border-black tracking-widest ${
                              score >= 80 ? 'bg-[#abf5d1]' : score >= 60 ? 'bg-[#ffe500]' : 'bg-[#ff90e8]'
                            }`}>
                              {score}% Match
                            </span>
                          )}
                        </div>

                        <div>
                          <h3 className="font-black text-lg uppercase tracking-tight line-clamp-1">{job.roleTitle}</h3>
                          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-0.5">{job.company}</p>
                        </div>
                      </div>

                      <div className="border-t border-black pt-4 mt-6 flex items-center justify-between text-[10px] font-black uppercase tracking-wider text-slate-600">
                        <span>{new Date(job.createdAt).toLocaleDateString()}</span>
                        <span className="flex items-center gap-1 text-black group-hover:underline">
                          View report <ArrowRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}

        {/* TAB 2: Synced Jobs Feed */}
        {activeTab === 'sync' && (
          <motion.div
            key="sync-tab"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {isSyncing ? (
              <div className="py-24 text-center space-y-4">
                <Loader2 className="w-12 h-12 mx-auto animate-spin text-primary" />
                <h3 className="font-bold text-lg">Syncing platform integrations...</h3>
                <p className="text-xs text-muted-foreground uppercase tracking-widest">LinkedIn • Indeed • ZipRecruiter • Glassdoor</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {syncedJobs.map((job) => {
                  const isApplying = applyingJobId === job.id;
                  
                  return (
                    <div
                      key={job.id}
                      className="bg-white border-4 border-black p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 hover:shadow-[9px_9px_0px_0px_rgba(0,0,0,1)] transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
                    >
                      <div className="space-y-3 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[10px] font-black uppercase tracking-widest bg-black text-white px-2 py-0.5">
                            {job.platform}
                          </span>
                          <span className="text-[10px] font-black uppercase tracking-widest bg-[#ffe500] border-2 border-black px-2 py-0.5">
                            {job.location}
                          </span>
                          <span className="text-[10px] font-bold text-slate-500 uppercase">
                            {job.salaryRange}
                          </span>
                        </div>

                        <div>
                          <h3 className="text-xl font-black uppercase tracking-tight">{job.roleTitle}</h3>
                          <p className="text-sm font-bold text-slate-600 uppercase tracking-widest">{job.company}</p>
                        </div>
                      </div>

                      {/* Right Panel: Auto Apply & Match Score */}
                      <div className="flex items-center gap-4 flex-wrap w-full md:w-auto shrink-0 border-t md:border-t-0 pt-4 md:pt-0">
                        
                        {/* Match Indicator */}
                        <div className="text-center md:text-right pr-4 md:border-r border-slate-200">
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 block">AI Match Index</span>
                          <span className="text-2xl font-black text-[#23A094]">{job.matchScore}%</span>
                        </div>

                        {/* Action Buttons / Progress */}
                        {isApplying ? (
                          <div className="flex-1 md:w-72 bg-slate-50 border-3 border-black p-3 relative overflow-hidden">
                            <div 
                              className="absolute top-0 bottom-0 left-0 bg-[#abf5d1] transition-all duration-500" 
                              style={{ width: `${applyProgress}%`, zIndex: 0 }}
                            />
                            <div className="relative z-10 flex items-center justify-between text-xs font-black uppercase tracking-wider">
                              <span className="flex items-center gap-1.5">
                                <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0 text-black" />
                                {applyStage === 'LAUNCHING' && 'Launching browser...'}
                                {applyStage === 'NAVIGATING' && 'Loading portal...'}
                                {applyStage === 'FILLING' && 'Filing details...'}
                                {applyStage === 'SUBMITTING' && 'Submitting application...'}
                                {applyStage === 'DONE' && 'Application complete!'}
                              </span>
                              <span>{applyProgress}%</span>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 w-full md:w-auto">
                            <Button 
                              onClick={() => triggerAnalysis(job)}
                              variant="outline" 
                              className="rounded-xl border-3 border-black font-black uppercase tracking-wider text-xs h-12 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-y-0.5 hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-all"
                            >
                              Analyze Match
                            </Button>
                            <Button
                              onClick={() => triggerAutoApply(job)}
                              className="rounded-xl border-3 border-black bg-[#2563eb] text-white hover:bg-black hover:text-[#ffe500] font-black uppercase tracking-wider text-xs h-12 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-y-0.5 hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-all flex items-center gap-1.5"
                            >
                              <Zap className="w-3.5 h-3.5 fill-current" />
                              Auto Apply
                            </Button>
                          </div>
                        )}

                      </div>

                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}

      </AnimatePresence>

    </div>
  );
}
