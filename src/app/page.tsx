'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Logo } from '@/components/Logo';
import { 
  Sparkles, ArrowRight, Target, Brain, Briefcase, Award, 
  CheckCircle, FileText, Zap, BookOpen, ShieldCheck, TrendingUp, Users 
} from 'lucide-react';

export default function Home() {
  return (
    <main className="min-h-screen bg-[#FAF8F5] text-slate-900 font-sans selection:bg-[#FF90E8] overflow-x-hidden">
      
      {/* Dynamic Top Announcement Banner */}
      <div className="bg-black text-white py-2.5 px-4 text-center font-black text-xs uppercase tracking-widest border-b-4 border-black flex items-center justify-center gap-2">
        <span className="bg-[#FFE500] text-black px-2 py-0.5 font-black text-[10px] rounded-none">NEW</span>
        🚀 Placement2Job AI Operating System 2.0 is Live! Prepare, Tailor, Auto-Fill & Get Placed.
      </div>

      {/* Glassmorphic Navigation Header */}
      <nav className="w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between border-b-4 border-black bg-white/80 backdrop-blur-md sticky top-0 z-50 shadow-[0_4px_20px_rgba(0,0,0,0.06)]">
        <Link href="/">
          <Logo size="md" />
        </Link>
        <div className="flex items-center gap-3 md:gap-6">
          <Link 
            href="/login" 
            className="font-black text-sm md:text-base uppercase hover:text-[#23A094] transition-colors underline-offset-4 hover:underline hidden sm:block"
          >
            Sign In
          </Link>
          <Link href="/register">
            <Button className="bg-[#FF90E8] hover:bg-[#FF70DD] text-black font-black text-sm md:text-base py-4 md:py-6 px-4 md:px-8 rounded-none border-4 border-black shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] hover:translate-y-0.5 hover:translate-x-0.5 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all">
              Get Placed Now <ArrowRight className="w-4 h-4 md:w-5 md:h-5 ml-1 md:ml-2" />
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="w-full max-w-7xl mx-auto px-6 py-16 md:py-24 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        
        <div className="lg:col-span-7 flex flex-col items-start relative z-10">
          
          <motion.div
            initial={{ opacity: 0, y: -10, rotate: -3 }}
            animate={{ opacity: 1, y: 0, rotate: -2 }}
            transition={{ duration: 0.4 }}
            className="px-4 py-2 bg-[#23A094] text-white border-4 border-black font-black text-xs uppercase tracking-widest shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] mb-6 flex items-center gap-2"
          >
            <ShieldCheck className="w-4 h-4 text-[#FFE500]" /> 100% Placement Preparation & Care System
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-5xl sm:text-6xl md:text-7xl font-black uppercase tracking-tighter leading-[0.95] mb-6"
          >
            From <span className="text-[#23A094]">Preparation</span> <br />
            To <span className="inline-block bg-[#FF90E8] px-4 py-2 border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] rotate-1 mt-2">
              Job Offer!
            </span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg md:text-xl font-bold text-slate-700 leading-relaxed mb-8 max-w-2xl border-l-8 border-[#FFE500] pl-4"
          >
            <strong>Placement2Job</strong> automates your entire career journey: Learn skills from scratch, tailor resumes to recruitment details, auto-fill applications, master Technical & HR mock interviews, and track post-placement goals!
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-wrap items-center gap-4 w-full sm:w-auto"
          >
            <Link href="/register" className="w-full sm:w-auto">
              <Button className="w-full sm:w-auto bg-[#FFE500] hover:bg-[#E6CF00] text-black font-black text-lg sm:text-xl py-5 sm:py-7 px-6 sm:px-10 rounded-none border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:translate-x-1 hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all">
                Start Free Preparation <Zap className="w-5 h-5 sm:w-6 sm:h-6 ml-2 sm:ml-3 fill-black" />
              </Button>
            </Link>
            <Link href="/login" className="w-full sm:w-auto">
              <Button variant="outline" className="w-full sm:w-auto bg-white hover:bg-slate-100 text-black font-black text-lg sm:text-xl py-5 sm:py-7 px-6 sm:px-8 rounded-none border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all">
                Candidate Login
              </Button>
            </Link>
          </motion.div>

          {/* Social Proof Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-12 border-t-4 border-black mt-12 w-full">
            <div>
              <div className="text-3xl md:text-4xl font-black text-black">98.4%</div>
              <div className="text-xs font-black uppercase text-slate-600 mt-1">ATS Match Accuracy</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-black text-[#23A094]">10x</div>
              <div className="text-xs font-black uppercase text-slate-600 mt-1">Faster Auto Applications</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-black text-[#FF90E8]">100%</div>
              <div className="text-xs font-black uppercase text-slate-600 mt-1">Mock Interview Feedback</div>
            </div>
          </div>

        </div>

        {/* Visual Interactive Placement Dashboard Mockup */}
        <div className="lg:col-span-5 relative">
          
          {/* Main Card */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="bg-white border-4 border-black p-8 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] relative z-10 space-y-6"
          >
            <div className="flex items-center justify-between border-b-4 border-black pb-4">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-full bg-[#FF4040] border-2 border-black" />
                <div className="w-4 h-4 rounded-full bg-[#FFE500] border-2 border-black" />
                <div className="w-4 h-4 rounded-full bg-[#23A094] border-2 border-black" />
              </div>
              <span className="font-black text-xs uppercase bg-[#90C0FF] text-black px-3 py-1 border-2 border-black">
                Placement Readiness Engine
              </span>
            </div>

            {/* Score Ring / Gauge */}
            <div className="bg-[#FAF8F5] border-4 border-black p-6 flex items-center justify-between">
              <div>
                <span className="text-xs font-black uppercase text-gray-600 block">Overall Placement Index</span>
                <span className="text-5xl font-black text-black">95<span className="text-2xl text-[#23A094]">/100</span></span>
              </div>
              <div className="w-16 h-16 bg-[#FFE500] border-4 border-black flex items-center justify-center font-black text-2xl rotate-6 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                🏆
              </div>
            </div>

            {/* Dynamic Checklist Items */}
            <div className="space-y-3">
              <div className="p-3 bg-[#ABF5D1] border-3 border-black font-black text-sm flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-black" /> Recruitment Details Resume Tailored
                </span>
                <span className="bg-black text-white text-[10px] px-2 py-0.5">98% ATS</span>
              </div>

              <div className="p-3 bg-[#90C0FF] border-3 border-black font-black text-sm flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Brain className="w-5 h-5 text-black" /> Tech & HR Mock Interview Passed
                </span>
                <span className="bg-black text-white text-[10px] px-2 py-0.5">Score 92%</span>
              </div>

              <div className="p-3 bg-[#FF90E8] border-3 border-black font-black text-sm flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-black" /> Auto Application Assistant Active
                </span>
                <span className="bg-black text-white text-[10px] px-2 py-0.5">24 Logged</span>
              </div>
            </div>

            <div className="p-4 bg-black text-white font-mono text-xs flex items-center justify-between">
              <span>System Status: 🟢 Placement Pipeline Active</span>
              <span className="text-[#FFE500] font-bold">Ready</span>
            </div>

          </motion.div>

          {/* Decorative Floating Badges */}
          <div className="absolute -top-6 -left-6 bg-[#FFE500] text-black font-black text-xs uppercase px-4 py-2 border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] -rotate-6 z-20">
            ✨ Technical & HR Interviews Ready
          </div>
          <div className="absolute -bottom-6 -right-6 bg-[#FF90E8] text-black font-black text-xs uppercase px-4 py-2 border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] rotate-6 z-20">
            🎯 Learn Skills from Scratch
          </div>

        </div>

      </section>

      {/* Pipeline 5-Step Execution Grid */}
      <section className="w-full max-w-7xl mx-auto px-6 py-20 border-t-8 border-black">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <span className="bg-[#90C0FF] text-black border-2 border-black font-black uppercase text-xs px-3 py-1 inline-block rotate-1">
            End-to-End Career Architecture
          </span>
          <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tight">
            5 Steps to Your Dream Job Offer
          </h2>
          <p className="text-slate-700 font-bold text-lg">
            Everything you need from your first learning module to your post-placement appraisal!
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Step 1 */}
          <div className="bg-white border-4 border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transition-transform space-y-4">
            <div className="w-14 h-14 bg-[#FFE500] border-4 border-black flex items-center justify-center font-black text-2xl -rotate-3">
              1
            </div>
            <h3 className="text-2xl font-black uppercase">Learn Skills & Exams</h3>
            <p className="font-bold text-slate-700 text-sm leading-relaxed">
              Master Frontend, Backend, SQL, and DSA from scratch with interactive lessons, code runners, and timed skill exams.
            </p>
            <div className="pt-2">
              <span className="bg-[#FAF8F5] border-2 border-black text-xs font-black px-2 py-1 uppercase inline-block">
                📚 Learning Roadmaps
              </span>
            </div>
          </div>

          {/* Step 2 */}
          <div className="bg-white border-4 border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transition-transform space-y-4">
            <div className="w-14 h-14 bg-[#FF90E8] border-4 border-black flex items-center justify-center font-black text-2xl rotate-3">
              2
            </div>
            <h3 className="text-2xl font-black uppercase">Resume Tailoring & ATS</h3>
            <p className="font-bold text-slate-700 text-sm leading-relaxed">
              Paste recruitment details or job descriptions. AI automatically rewrites bullet points, highlights missing keywords, and exports PDF/DOCX.
            </p>
            <div className="pt-2">
              <span className="bg-[#FAF8F5] border-2 border-black text-xs font-black px-2 py-1 uppercase inline-block">
                ⚡ 98%+ ATS Optimization
              </span>
            </div>
          </div>

          {/* Step 3 */}
          <div className="bg-white border-4 border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transition-transform space-y-4">
            <div className="w-14 h-14 bg-[#90C0FF] border-4 border-black flex items-center justify-center font-black text-2xl -rotate-2">
              3
            </div>
            <h3 className="text-2xl font-black uppercase">Auto-Fill & Job Finder</h3>
            <p className="font-bold text-slate-700 text-sm leading-relaxed">
              Find matching jobs, pre-fill application fields with 1-click, generate custom cover letters, and log applications in your Kanban tracker.
            </p>
            <div className="pt-2">
              <span className="bg-[#FAF8F5] border-2 border-black text-xs font-black px-2 py-1 uppercase inline-block">
                📌 Auto Application Record
              </span>
            </div>
          </div>

          {/* Step 4 */}
          <div className="bg-white border-4 border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transition-transform space-y-4 md:col-span-2 lg:col-span-1">
            <div className="w-14 h-14 bg-[#23A094] text-white border-4 border-black flex items-center justify-center font-black text-2xl rotate-2">
              4
            </div>
            <h3 className="text-2xl font-black uppercase">Technical & HR Mocks</h3>
            <p className="font-bold text-slate-700 text-sm leading-relaxed">
              Practice real-time interactive technical coding questions and STAR framework behavioral interviews with detailed evaluator scorecards.
            </p>
            <div className="pt-2">
              <span className="bg-[#FAF8F5] border-2 border-black text-xs font-black px-2 py-1 uppercase inline-block">
                🎙️ Voice & Text AI Simulator
              </span>
            </div>
          </div>

          {/* Step 5 */}
          <div className="bg-white border-4 border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transition-transform space-y-4 md:col-span-3 lg:col-span-2">
            <div className="w-14 h-14 bg-[#ABF5D1] border-4 border-black flex items-center justify-center font-black text-2xl -rotate-1">
              5
            </div>
            <h3 className="text-2xl font-black uppercase">Post-Placement Growth Hub</h3>
            <p className="font-bold text-slate-700 text-sm leading-relaxed">
              Achieved your job? Track 30-60-90 day onboarding goals, first production code shipments, and annual appraisal performance reviews!
            </p>
            <div className="pt-2 flex gap-2">
              <span className="bg-[#FAF8F5] border-2 border-black text-xs font-black px-2 py-1 uppercase inline-block">
                🎉 Onboarding Checklist
              </span>
              <span className="bg-[#FAF8F5] border-2 border-black text-xs font-black px-2 py-1 uppercase inline-block">
                📈 Salary & Appraisal Tracking
              </span>
            </div>
          </div>

        </div>
      </section>

      {/* Call to Action */}
      <section className="w-full bg-[#FFE500] border-t-8 border-black py-20 px-6">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tight">
            Ready To Get Placed?
          </h2>
          <p className="text-xl font-bold text-black max-w-2xl mx-auto">
            Join thousands of candidates using Placement2Job to accelerate their career from preparation to offer letter.
          </p>
          <Link href="/register" className="inline-block w-full sm:w-auto">
            <Button className="w-full sm:w-auto bg-[#FF90E8] hover:bg-[#FF70DD] text-black font-black text-lg md:text-2xl py-6 md:py-8 px-6 md:px-12 rounded-none border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] md:shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:translate-x-1 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all">
              Create Your Account Now <ArrowRight className="w-6 h-6 md:w-8 md:h-8 ml-2 md:ml-3" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full bg-black text-white py-12 px-6 border-t-8 border-black">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <Logo size="sm" />
          <div className="text-xs font-black uppercase text-gray-400">
            © 2026 Placement2Job Inc. All Rights Reserved. Complete Career Operating System.
          </div>
          <div className="flex gap-6 font-black text-xs uppercase">
            <Link href="/login" className="hover:text-[#FFE500]">Login</Link>
            <Link href="/register" className="hover:text-[#FFE500]">Register</Link>
          </div>
        </div>
      </footer>

    </main>
  );
}
