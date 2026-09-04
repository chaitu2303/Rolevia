'use client';

import { useState } from 'react';
import { Share2, Download, CheckCircle, Flame, Trophy, Award, Sparkles, Copy } from 'lucide-react';
import { Logo } from '@/components/Logo';

interface ShareablePosterProps {
  userName: string;
  targetRole?: string;
  streakDays: number;
  level: number;
  totalXp: number;
  badgesCount: number;
  certificateId?: string;
}

export function ShareablePoster({
  userName,
  targetRole = 'Full Stack Software Engineer',
  streakDays = 14,
  level = 3,
  totalXp = 450,
  badgesCount = 5,
  certificateId = 'P2J-CERT-8921'
}: ShareablePosterProps) {
  const [copied, setCopied] = useState(false);
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || (typeof window !== 'undefined' ? window.location.origin : 'https://rolevia.com');
  const verifyUrl = `${baseUrl}/verify/certificate/${certificateId}`;

  const shareText = `🔥 Milestone Unlocked! I just hit a ${streakDays}-Day Learning & Career Streak on Rolevia as a ${targetRole}!

📊 Level ${level} | ${totalXp} XP | ${badgesCount} Badges Earned
Verified Certificate ID: ${certificateId}

Preparing for my next big career move! 🚀
#Rolevia #CareerGrowth #SoftwareEngineering #PlacementReady #JobSearch`;

  const handleLinkedInShare = () => {
    const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(verifyUrl)}&text=${encodeURIComponent(shareText)}`;
    window.open(linkedinUrl, '_blank', 'noopener,noreferrer');
  };

  const handleTwitterShare = () => {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(verifyUrl)}`;
    window.open(twitterUrl, '_blank', 'noopener,noreferrer');
  };

  const handleCopyPostText = () => {
    navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="bg-white border-4 border-black p-6 md:p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b-4 border-black pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-[#FF90E8] text-black border-2 border-black font-black uppercase text-xs px-2.5 py-0.5 rotate-1">
              Social Poster Generator
            </span>
            <span className="bg-[#FFE500] text-black border-2 border-black font-black uppercase text-xs px-2.5 py-0.5 -rotate-1">
              LinkedIn & X Ready
            </span>
          </div>
          <h2 className="text-3xl font-black uppercase tracking-tight">
            📢 Share Your Career Streak & Achievement Poster
          </h2>
          <p className="font-bold text-sm text-gray-700 mt-1">
            Post directly to LinkedIn & Twitter with 1-click formatted text and verifiable credentials!
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleLinkedInShare}
            className="px-4 py-2.5 bg-[#0077B5] hover:bg-[#005E93] text-white font-black uppercase text-xs border-3 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] flex items-center gap-2 transition-all"
          >
            <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24"><path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/></svg> Share on LinkedIn
          </button>
          <button
            onClick={handleTwitterShare}
            className="px-4 py-2.5 bg-black hover:bg-slate-800 text-white font-black uppercase text-xs border-3 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] flex items-center gap-2 transition-all"
          >
            <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg> Post to X
          </button>
        </div>
      </div>

      {/* Poster Display Card (Designed to look like a high-end social media graphic) */}
      <div className="bg-gradient-to-br from-[#00F2FE] via-[#4FACFE] to-[#23A094] p-6 md:p-10 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] text-black relative overflow-hidden">
        
        {/* Background Decorative Grid */}
        <div className="absolute inset-0 bg-[radial-gradient(#000000_1px,transparent_1px)] [background-size:16px_16px] opacity-10" />

        <div className="relative z-10 space-y-6">
          
          {/* Top Brand Header */}
          <div className="flex items-center justify-between border-b-4 border-black pb-4">
            <Logo size="md" />
            <span className="bg-black text-[#FFE500] border-2 border-white px-3 py-1 font-mono font-black text-xs uppercase tracking-widest">
              OFFICIAL VERIFIED BADGE
            </span>
          </div>

          {/* Main Hero Achievement Section */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            
            <div className="md:col-span-8 space-y-3">
              <span className="bg-[#FFE500] text-black border-2 border-black font-black uppercase text-xs px-3 py-1 inline-block -rotate-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                🎯 Candidate Milestone
              </span>
              <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-black leading-none">
                {userName}
              </h1>
              <p className="font-bold text-lg text-black/90 uppercase tracking-wider">
                Target Role: <span className="underline decoration-4 underline-offset-2 decoration-black">{targetRole}</span>
              </p>
            </div>

            {/* Flame Streak Badge */}
            <div className="md:col-span-4 bg-white border-4 border-black p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] text-center rotate-2">
              <div className="w-16 h-16 bg-[#FF4040] border-4 border-black mx-auto flex items-center justify-center -rotate-6 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] mb-2">
                <Flame className="w-10 h-10 text-[#FFE500] fill-[#FFE500] animate-pulse" />
              </div>
              <div className="text-4xl font-black text-black">{streakDays} DAYS</div>
              <div className="text-xs font-black uppercase tracking-wider text-black bg-[#FFE500] border-2 border-black inline-block px-2 py-0.5 mt-1">
                Active Placement Streak
              </div>
            </div>

          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-3 gap-4 pt-2">
            <div className="bg-white border-3 border-black p-3 text-center shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
              <div className="text-xs font-black uppercase text-gray-600">Level</div>
              <div className="text-2xl font-black text-black">Level {level}</div>
            </div>
            <div className="bg-white border-3 border-black p-3 text-center shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
              <div className="text-xs font-black uppercase text-gray-600">Earned XP</div>
              <div className="text-2xl font-black text-[#23A094]">{totalXp} XP</div>
            </div>
            <div className="bg-white border-3 border-black p-3 text-center shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
              <div className="text-xs font-black uppercase text-gray-600">Badges</div>
              <div className="text-2xl font-black text-[#FF90E8]">{badgesCount} Badges</div>
            </div>
          </div>

          {/* Footer Verification Code */}
          <div className="bg-black text-white p-4 border-3 border-black flex flex-col md:flex-row items-center justify-between gap-3 text-xs font-bold font-mono">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-[#ABF5D1]" />
              <span>Verifiable Credential ID: <strong className="text-[#FFE500]">{certificateId}</strong></span>
            </div>
            <span className="text-gray-400">Verify at Rolevia.com</span>
          </div>

        </div>

      </div>

      {/* Pre-Formatted Social Media Caption Box */}
      <div className="space-y-2 pt-2 border-t-4 border-black">
        <div className="flex items-center justify-between">
          <label className="text-xs font-black uppercase tracking-wider block flex items-center gap-1">
            <Sparkles className="w-4 h-4 text-[#FF90E8]" /> Pre-Formatted LinkedIn / X Post Caption
          </label>
          <button
            onClick={handleCopyPostText}
            className="px-4 py-1.5 bg-[#FFE500] hover:bg-[#E6CF00] font-black uppercase text-xs border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex items-center gap-1"
          >
            {copied ? <CheckCircle className="w-3.5 h-3.5 text-black" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied to Clipboard!' : 'Copy Caption Text'}
          </button>
        </div>

        <textarea
          readOnly
          value={shareText}
          rows={5}
          className="w-full p-4 border-4 border-black bg-[#FAF8F5] font-bold text-xs leading-relaxed resize-none font-mono"
        />
      </div>

    </div>
  );
}
