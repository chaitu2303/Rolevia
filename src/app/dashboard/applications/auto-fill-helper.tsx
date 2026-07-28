'use client';

import { useState } from 'react';
import { Sparkles, Copy, CheckCircle, Send, FileText, Globe, User, Briefcase, Zap } from 'lucide-react';

interface AutoFillHelperProps {
  onApplicationCreated?: (appData: any) => void;
}

export function AutoFillHelper({ onApplicationCreated }: AutoFillHelperProps) {
  const [jobUrl, setJobUrl] = useState('');
  const [company, setCompany] = useState('');
  const [roleTitle, setRoleTitle] = useState('');
  const [candidateName, setCandidateName] = useState('Alex Morgan');
  const [candidateEmail, setCandidateEmail] = useState('alex.morgan@example.com');
  const [phone, setPhone] = useState('+1 (555) 019-2834');
  const [linkedIn, setLinkedIn] = useState('https://linkedin.com/in/alexmorgan');
  const [status, setStatus] = useState('APPLIED');
  const [customCoverLetter, setCustomCoverLetter] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleParseUrl = () => {
    if (!jobUrl) return;
    try {
      const url = new URL(jobUrl);
      const host = url.hostname.replace('www.', '');
      if (host.includes('linkedin')) {
        setCompany('TechCorp Inc.');
        setRoleTitle('Senior Software Engineer');
      } else if (host.includes('indeed')) {
        setCompany('DataDrive Labs');
        setRoleTitle('Full Stack Developer');
      } else {
        const parts = host.split('.');
        const name = parts[0];
        setCompany(name.charAt(0).toUpperCase() + name.slice(1));
        setRoleTitle('Software Engineer');
      }
    } catch (e) {
      setCompany('Target Enterprise');
      setRoleTitle('Software Engineer');
    }
  };

  const handleGenerateCoverLetter = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setCustomCoverLetter(
        `Dear Hiring Team at ${company || 'your organization'},\n\nI am writing to express my strong enthusiasm for the ${roleTitle || 'Software Engineer'} role. With hands-on experience in full-stack architecture, API optimization, and scalable database systems, I have delivered production features that improved performance by 35%.\n\nMy background aligns closely with your recruitment criteria, and I am excited about the opportunity to contribute immediately to your team.\n\nBest regards,\n${candidateName}`
      );
      setIsGenerating(false);
    }, 1000);
  };

  const handleSaveAndLog = async () => {
    try {
      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company: company || 'New Company',
          roleTitle: roleTitle || 'Target Role',
          status: status,
          jobUrl: jobUrl,
          notes: `Auto-filled application. Cover letter generated: ${customCoverLetter.slice(0, 80)}...`
        })
      });
      const data = await res.json();
      setSavedSuccess(true);
      if (onApplicationCreated && data.application) {
        onApplicationCreated(data.application);
      }
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (e) {
      console.error('Failed to log application', e);
    }
  };

  return (
    <div className="bg-white border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] space-y-6">
      
      <div className="flex items-center justify-between border-b-4 border-black pb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-[#ffe500] border-4 border-black flex items-center justify-center -rotate-2">
            <Zap className="w-6 h-6 text-black" />
          </div>
          <div>
            <h3 className="text-2xl font-black uppercase tracking-tight">Auto-Fill Application Assistant</h3>
            <p className="font-bold text-xs text-gray-600 uppercase">One-Click Auto Fill & Job Application Logging</p>
          </div>
        </div>
        <span className="bg-[#abf5d1] text-black border-2 border-black font-black uppercase text-xs px-2.5 py-1">
          Active Sync
        </span>
      </div>

      {/* URL Quick Fetch */}
      <div className="space-y-2">
        <label className="text-xs font-black uppercase tracking-wider block">
          1. Job Application URL / Link
        </label>
        <div className="flex gap-2">
          <input
            type="url"
            value={jobUrl}
            onChange={(e) => setJobUrl(e.target.value)}
            placeholder="https://linkedin.com/jobs/view/... or any job board link"
            className="flex-1 px-4 py-3 border-4 border-black font-bold text-sm bg-[#faf8f5] focus:outline-none"
          />
          <button
            onClick={handleParseUrl}
            className="px-6 py-3 bg-[#90c0ff] hover:bg-blue-400 font-black uppercase text-sm border-4 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all"
          >
            Extract Fields
          </button>
        </div>
      </div>

      {/* Auto-Filled Applicant Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
        <div>
          <label className="text-xs font-black uppercase tracking-wider block mb-1">Company Name</label>
          <input
            type="text"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            placeholder="e.g. Google, Amazon, Startup Corp"
            className="w-full px-4 py-2.5 border-4 border-black font-bold text-sm bg-white"
          />
        </div>
        <div>
          <label className="text-xs font-black uppercase tracking-wider block mb-1">Job Role Title</label>
          <input
            type="text"
            value={roleTitle}
            onChange={(e) => setRoleTitle(e.target.value)}
            placeholder="e.g. Full Stack Engineer"
            className="w-full px-4 py-2.5 border-4 border-black font-bold text-sm bg-white"
          />
        </div>
        <div>
          <label className="text-xs font-black uppercase tracking-wider block mb-1">Applicant Name</label>
          <input
            type="text"
            value={candidateName}
            onChange={(e) => setCandidateName(e.target.value)}
            className="w-full px-4 py-2.5 border-4 border-black font-bold text-sm bg-white"
          />
        </div>
        <div>
          <label className="text-xs font-black uppercase tracking-wider block mb-1">Applicant Email</label>
          <input
            type="email"
            value={candidateEmail}
            onChange={(e) => setCandidateEmail(e.target.value)}
            className="w-full px-4 py-2.5 border-4 border-black font-bold text-sm bg-white"
          />
        </div>
      </div>

      {/* Cover Letter Auto-Generator */}
      <div className="space-y-2 pt-2 border-t-4 border-black">
        <div className="flex items-center justify-between">
          <label className="text-xs font-black uppercase tracking-wider block flex items-center gap-1">
            <Sparkles className="w-4 h-4 text-[#ff90e8]" /> Tailored Cover Letter Generator
          </label>
          <button
            onClick={handleGenerateCoverLetter}
            disabled={isGenerating}
            className="px-4 py-1.5 bg-[#ff90e8] hover:bg-[#ff70dd] font-black uppercase text-xs border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
          >
            {isGenerating ? 'Generating...' : '✨ Generate Letter'}
          </button>
        </div>
        
        {customCoverLetter && (
          <div className="relative">
            <textarea
              value={customCoverLetter}
              onChange={(e) => setCustomCoverLetter(e.target.value)}
              rows={4}
              className="w-full p-4 border-4 border-black bg-[#faf8f5] font-bold text-xs leading-relaxed resize-none"
            />
            <button
              onClick={() => {
                navigator.clipboard.writeText(customCoverLetter);
                setIsCopied(true);
                setTimeout(() => setIsCopied(false), 2000);
              }}
              className="absolute top-3 right-3 bg-black text-white px-3 py-1 text-xs font-black uppercase border border-white flex items-center gap-1"
            >
              {isCopied ? <CheckCircle className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
              {isCopied ? 'Copied' : 'Copy'}
            </button>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t-4 border-black">
        {savedSuccess && (
          <span className="text-xs font-black uppercase bg-[#abf5d1] text-black px-3 py-1.5 border-2 border-black flex items-center gap-1">
            <CheckCircle className="w-4 h-4" /> Application Successfully Logged!
          </span>
        )}
        <button
          onClick={handleSaveAndLog}
          className="ml-auto px-8 py-3.5 bg-[#23a094] hover:bg-teal-600 text-white font-black uppercase text-sm border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center gap-2"
        >
          <Send className="w-4 h-4" /> Auto-Fill & Save to Application Tracker
        </button>
      </div>

    </div>
  );
}
