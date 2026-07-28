'use client';

import { useState } from 'react';
import { Search, Building2, Cpu, Database, Cloud, BookOpen, Brain, PlayCircle, Loader2, Sparkles, DollarSign, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function CompanyIntelPage() {
  const [companyName, setCompanyName] = useState('');
  const [targetRole, setTargetRole] = useState('Full Stack Software Engineer');
  const [loading, setLoading] = useState(false);
  const [intel, setIntel] = useState<any>(null);

  const popularCompanies = ['Google', 'Amazon', 'Microsoft', 'Stripe', 'Razorpay', 'Swiggy', 'Accenture', 'Infosys'];

  const handleFetchIntel = async (selectedCompany?: string) => {
    const query = selectedCompany || companyName;
    if (!query) return;

    setLoading(true);
    setCompanyName(query);

    try {
      const res = await fetch('/api/company-intel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyName: query, roleTitle: targetRole })
      });
      const data = await res.json();
      if (data.intel) {
        setIntel(data.intel);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8 bg-[#faf8f5] text-black font-sans min-h-[calc(100vh-4rem)]">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b-8 border-black pb-6 shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-[#90c0ff] border-4 border-black flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] -rotate-2">
            <Building2 className="w-7 h-7 text-black" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-[#ffe500] text-black border-2 border-black font-black uppercase text-xs px-2 py-0.5">
                AI Company Intelligence
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight uppercase mt-1">
              Company Research & Tech Stack Intel
            </h1>
          </div>
        </div>
      </div>

      {/* Search Input & Quick Select Badges */}
      <div className="bg-white border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] space-y-4">
        <label className="text-xs font-black uppercase tracking-wider block">
          Search Any Target Company (e.g. Google, Stripe, Razorpay, Startups)
        </label>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="w-5 h-5 absolute left-4 top-4 text-gray-500" />
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleFetchIntel()}
              placeholder="Enter company name..."
              className="w-full pl-12 pr-4 py-3.5 border-4 border-black font-bold text-sm bg-[#faf8f5] focus:outline-none"
            />
          </div>
          <button
            onClick={() => handleFetchIntel()}
            disabled={loading || !companyName}
            className="px-8 py-3.5 bg-[#ff90e8] hover:bg-[#ff70dd] text-black font-black uppercase text-sm border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center gap-2 transition-all"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
            {loading ? 'Analyzing...' : 'Fetch Intel'}
          </button>
        </div>

        {/* Popular Company Shortcuts */}
        <div className="pt-2">
          <span className="text-xs font-black uppercase text-gray-600 block mb-2">Popular Targets:</span>
          <div className="flex flex-wrap gap-2">
            {popularCompanies.map(c => (
              <button
                key={c}
                onClick={() => handleFetchIntel(c)}
                className="px-3 py-1.5 bg-[#faf8f5] hover:bg-[#ffe500] font-black uppercase text-xs border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Intelligence Results Display */}
      {intel ? (
        <div className="space-y-8">
          
          {/* Company Overview & Culture Banner */}
          <div className="bg-white border-4 border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b-4 border-black pb-4">
              <div>
                <span className="bg-[#abf5d1] text-black border-2 border-black font-black uppercase text-xs px-2.5 py-0.5">
                  Verified Intel
                </span>
                <h2 className="text-4xl font-black uppercase tracking-tight mt-1">{intel.company}</h2>
                <p className="font-bold text-sm text-gray-600 uppercase">{intel.tagline}</p>
              </div>

              <Link href="/dashboard/interview">
                <button className="px-6 py-3.5 bg-[#ffe500] hover:bg-yellow-400 text-black font-black uppercase text-sm border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center gap-2">
                  <Brain className="w-5 h-5" /> Launch {intel.company} Mock Interview
                </button>
              </Link>
            </div>

            <div className="p-4 bg-[#faf8f5] border-3 border-black font-bold text-sm leading-relaxed">
              <span className="font-black uppercase block mb-1 text-black">🏛️ Engineering Culture Insights:</span>
              {intel.culture}
            </div>
          </div>

          {/* Tech Stack Breakdown Grid */}
          <div className="bg-white border-4 border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] space-y-6">
            <h3 className="text-2xl font-black uppercase flex items-center gap-2 border-b-4 border-black pb-3">
              <Cpu className="w-6 h-6 text-[#23a094]" /> Tech Stack & Architecture Breakdown
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              
              <div className="p-4 bg-[#faf8f5] border-3 border-black space-y-2">
                <span className="text-xs font-black uppercase text-gray-600 block">Frontend Frameworks</span>
                <div className="flex flex-wrap gap-1.5">
                  {intel.techStack.frontend?.map((item: string) => (
                    <span key={item} className="px-2.5 py-1 bg-[#90c0ff] text-black font-black text-xs border-2 border-black">
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-4 bg-[#faf8f5] border-3 border-black space-y-2">
                <span className="text-xs font-black uppercase text-gray-600 block">Backend & Services</span>
                <div className="flex flex-wrap gap-1.5">
                  {intel.techStack.backend?.map((item: string) => (
                    <span key={item} className="px-2.5 py-1 bg-[#ffe500] text-black font-black text-xs border-2 border-black">
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-4 bg-[#faf8f5] border-3 border-black space-y-2">
                <span className="text-xs font-black uppercase text-gray-600 block">Databases & Storage</span>
                <div className="flex flex-wrap gap-1.5">
                  {intel.techStack.databases?.map((item: string) => (
                    <span key={item} className="px-2.5 py-1 bg-[#abf5d1] text-black font-black text-xs border-2 border-black">
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-4 bg-[#faf8f5] border-3 border-black space-y-2">
                <span className="text-xs font-black uppercase text-gray-600 block">Cloud & DevOps</span>
                <div className="flex flex-wrap gap-1.5">
                  {intel.techStack.cloud?.map((item: string) => (
                    <span key={item} className="px-2.5 py-1 bg-[#ff90e8] text-black font-black text-xs border-2 border-black">
                      {item}
                    </span>
                  ))}
                </div>
              </div>

            </div>
          </div>

          {/* Expected Interview Questions & Market Salaries */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Questions */}
            <div className="lg:col-span-8 bg-white border-4 border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] space-y-4">
              <h3 className="text-2xl font-black uppercase flex items-center gap-2 border-b-4 border-black pb-3">
                <BookOpen className="w-6 h-6 text-[#ff90e8]" /> Top Expected Interview Questions
              </h3>

              <div className="space-y-4">
                {intel.interviewQuestions?.map((q: any, idx: number) => (
                  <div key={idx} className="p-4 bg-[#faf8f5] border-3 border-black space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black uppercase bg-black text-white px-2 py-0.5">
                        {q.category}
                      </span>
                      <span className="text-xs font-black uppercase text-gray-500">Question {idx + 1}</span>
                    </div>
                    <p className="font-bold text-base text-black pt-1">"{q.question}"</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Salary Breakdown */}
            <div className="lg:col-span-4 bg-white border-4 border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] space-y-4">
              <h3 className="text-xl font-black uppercase flex items-center gap-2 border-b-4 border-black pb-3">
                <DollarSign className="w-5 h-5 text-[#23a094]" /> Estimated Salary Benchmarks
              </h3>

              <div className="space-y-3">
                <div className="p-3 bg-[#faf8f5] border-2 border-black">
                  <span className="text-xs font-black uppercase text-gray-600 block">Entry Level (0-2 Yrs)</span>
                  <span className="text-lg font-black text-black">{intel.salaryRanges?.entry}</span>
                </div>
                <div className="p-3 bg-[#faf8f5] border-2 border-black">
                  <span className="text-xs font-black uppercase text-gray-600 block">Mid Level (2-5 Yrs)</span>
                  <span className="text-lg font-black text-[#23a094]">{intel.salaryRanges?.mid}</span>
                </div>
                <div className="p-3 bg-[#faf8f5] border-2 border-black">
                  <span className="text-xs font-black uppercase text-gray-600 block">Senior Level (5+ Yrs)</span>
                  <span className="text-lg font-black text-[#ff90e8]">{intel.salaryRanges?.senior}</span>
                </div>
              </div>
            </div>

          </div>

        </div>
      ) : (
        <div className="bg-white border-4 border-black p-12 text-center shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] space-y-4">
          <Building2 className="w-16 h-16 text-black/30 mx-auto" />
          <h3 className="text-2xl font-black uppercase">Search Any Target Company</h3>
          <p className="font-bold text-gray-600 max-w-md mx-auto text-sm">
            Select or type a company name above to fetch tech stack breakdowns, interview questions, culture insights, and salary benchmarks!
          </p>
        </div>
      )}

    </div>
  );
}
