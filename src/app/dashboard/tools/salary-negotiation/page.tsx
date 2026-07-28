'use client';

import { useState } from 'react';
import { DollarSign, TrendingUp, Mail, Copy, CheckCircle, Sparkles, Loader2, Award, ArrowUpRight, ShieldCheck } from 'lucide-react';

export default function SalaryNegotiationPage() {
  const [companyName, setCompanyName] = useState('Tech Corp');
  const [roleTitle, setRoleTitle] = useState('Senior Full Stack Engineer');
  const [currentOfferBase, setCurrentOfferBase] = useState('120000');
  const [joiningBonus, setJoiningBonus] = useState('10000');
  const [equity, setEquity] = useState('15000');
  const [location, setLocation] = useState('San Francisco, CA');
  const [experienceYears, setExperienceYears] = useState('4');

  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [copiedScript, setCopiedScript] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!companyName || !roleTitle || !currentOfferBase) return;

    setLoading(true);
    setResults(null);

    try {
      const res = await fetch('/api/salary-negotiation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyName, roleTitle, currentOfferBase, joiningBonus, equity, location, experienceYears
        })
      });
      const data = await res.json();
      if (data.scripts) {
        setResults(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string, scriptKey: string) => {
    navigator.clipboard.writeText(text);
    setCopiedScript(scriptKey);
    setTimeout(() => setCopiedScript(null), 2500);
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8 bg-[#faf8f5] text-black font-sans min-h-[calc(100vh-4rem)]">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b-8 border-black pb-6 shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-[#ffe500] border-4 border-black flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] -rotate-2">
            <DollarSign className="w-7 h-7 text-black" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-[#FF90E8] text-black border-2 border-black font-black uppercase text-xs px-2 py-0.5">
                Offer Maximizer
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight uppercase mt-1">
              AI Salary Negotiation & Counter-Offer Copilot
            </h1>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Offer Form */}
        <div className="lg:col-span-5 bg-white border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] space-y-4">
          <h2 className="text-xl font-black uppercase flex items-center gap-2 border-b-4 border-black pb-3">
            📋 Enter Job Offer Details
          </h2>

          <div className="space-y-4 text-xs font-bold uppercase">
            <div>
              <label className="block mb-1">Target Company Name</label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Company Name..."
                className="w-full p-3 border-3 border-black bg-[#faf8f5] font-bold text-sm focus:outline-none"
              />
            </div>

            <div>
              <label className="block mb-1">Target Role Title</label>
              <input
                type="text"
                value={roleTitle}
                onChange={(e) => setRoleTitle(e.target.value)}
                placeholder="Software Engineer..."
                className="w-full p-3 border-3 border-black bg-[#faf8f5] font-bold text-sm focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block mb-1">Offered Base Salary ($)</label>
                <input
                  type="number"
                  value={currentOfferBase}
                  onChange={(e) => setCurrentOfferBase(e.target.value)}
                  className="w-full p-3 border-3 border-black bg-[#faf8f5] font-bold text-sm focus:outline-none"
                />
              </div>

              <div>
                <label className="block mb-1">Years of Exp</label>
                <input
                  type="number"
                  value={experienceYears}
                  onChange={(e) => setExperienceYears(e.target.value)}
                  className="w-full p-3 border-3 border-black bg-[#faf8f5] font-bold text-sm focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block mb-1">Sign-on Bonus ($)</label>
                <input
                  type="number"
                  value={joiningBonus}
                  onChange={(e) => setJoiningBonus(e.target.value)}
                  className="w-full p-3 border-3 border-black bg-[#faf8f5] font-bold text-sm focus:outline-none"
                />
              </div>

              <div>
                <label className="block mb-1">Equity / RSUs ($)</label>
                <input
                  type="number"
                  value={equity}
                  onChange={(e) => setEquity(e.target.value)}
                  className="w-full p-3 border-3 border-black bg-[#faf8f5] font-bold text-sm focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block mb-1">Location / Remote Status</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full p-3 border-3 border-black bg-[#faf8f5] font-bold text-sm focus:outline-none"
              />
            </div>

            <button
              onClick={handleGenerate}
              disabled={loading || !currentOfferBase}
              className="w-full py-4 bg-[#ffe500] hover:bg-yellow-400 text-black font-black uppercase text-base border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center gap-2 transition-all mt-4"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <TrendingUp className="w-5 h-5" />}
              {loading ? 'Analyzing Market Benchmarks...' : 'Generate Counter-Offer Strategy'}
            </button>
          </div>
        </div>

        {/* Right Column: Negotiation Scripts & Benchmarks */}
        <div className="lg:col-span-7 space-y-6">
          
          {results ? (
            <div className="space-y-6">
              
              {/* Benchmark Summary Bar */}
              <div className="bg-white border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] space-y-3">
                <div className="flex items-center justify-between border-b-3 border-black pb-3">
                  <span className="font-black uppercase text-sm flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-[#23a094]" /> Recommended Counter Target
                  </span>
                  <span className="bg-[#abf5d1] text-black font-black text-xs px-2.5 py-0.5 border-2 border-black">
                    +15% Target Raise
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="p-3 bg-[#faf8f5] border-2 border-black">
                    <span className="text-xs font-black uppercase text-gray-500 block">Offered Base</span>
                    <span className="text-xl font-black">${results.benchmarks.offered?.toLocaleString()}</span>
                  </div>
                  <div className="p-3 bg-[#ffe500] border-2 border-black">
                    <span className="text-xs font-black uppercase text-black block">75th Percentile</span>
                    <span className="text-xl font-black">${results.benchmarks.p75?.toLocaleString()}</span>
                  </div>
                  <div className="p-3 bg-[#ff90e8] border-2 border-black">
                    <span className="text-xs font-black uppercase text-black block">90th Percentile</span>
                    <span className="text-xl font-black">${results.benchmarks.p90?.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Email Script 1: Market Benchmark Counter */}
              <div className="bg-white border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-black uppercase text-sm flex items-center gap-2">
                    <Mail className="w-4 h-4 text-[#0077B5]" /> Script 1: Market Benchmark Counter-Offer
                  </span>
                  <button
                    onClick={() => handleCopy(results.scripts.benchmark, 's1')}
                    className="px-3 py-1 bg-[#ffe500] hover:bg-yellow-400 font-black uppercase text-xs border-2 border-black flex items-center gap-1"
                  >
                    {copiedScript === 's1' ? <CheckCircle className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedScript === 's1' ? 'Copied!' : 'Copy Script'}
                  </button>
                </div>
                <textarea
                  readOnly
                  value={results.scripts.benchmark}
                  rows={8}
                  className="w-full p-4 border-3 border-black bg-[#faf8f5] font-bold text-xs leading-relaxed font-mono resize-none"
                />
              </div>

              {/* Email Script 2: Competing Offer Leverage */}
              <div className="bg-white border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-black uppercase text-sm flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#FF90E8]" /> Script 2: Competing Offer Leverage Email
                  </span>
                  <button
                    onClick={() => handleCopy(results.scripts.competing, 's2')}
                    className="px-3 py-1 bg-[#ffe500] hover:bg-yellow-400 font-black uppercase text-xs border-2 border-black flex items-center gap-1"
                  >
                    {copiedScript === 's2' ? <CheckCircle className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedScript === 's2' ? 'Copied!' : 'Copy Script'}
                  </button>
                </div>
                <textarea
                  readOnly
                  value={results.scripts.competing}
                  rows={8}
                  className="w-full p-4 border-3 border-black bg-[#faf8f5] font-bold text-xs leading-relaxed font-mono resize-none"
                />
              </div>

              {/* Email Script 3: Bonus & Perks Negotiation */}
              <div className="bg-white border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-black uppercase text-sm flex items-center gap-2">
                    <Award className="w-4 h-4 text-[#23a094]" /> Script 3: Signing Bonus & Perks Counter
                  </span>
                  <button
                    onClick={() => handleCopy(results.scripts.perks, 's3')}
                    className="px-3 py-1 bg-[#ffe500] hover:bg-yellow-400 font-black uppercase text-xs border-2 border-black flex items-center gap-1"
                  >
                    {copiedScript === 's3' ? <CheckCircle className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedScript === 's3' ? 'Copied!' : 'Copy Script'}
                  </button>
                </div>
                <textarea
                  readOnly
                  value={results.scripts.perks}
                  rows={7}
                  className="w-full p-4 border-3 border-black bg-[#faf8f5] font-bold text-xs leading-relaxed font-mono resize-none"
                />
              </div>

            </div>
          ) : (
            <div className="bg-white border-4 border-black p-12 text-center shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] space-y-4">
              <DollarSign className="w-16 h-16 text-black/30 mx-auto" />
              <h3 className="text-2xl font-black uppercase">Maximize Your Offer & Salary</h3>
              <p className="font-bold text-gray-600 max-w-md mx-auto text-sm">
                Enter your job offer details on the left to generate market salary benchmarks (50th, 75th, 90th percentile) and 3 professionally tailored counter-offer email scripts!
              </p>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
