'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, Target, Brain, CheckCircle, FileText, Users, Database, 
  ShieldCheck, Sparkles, BarChart3, Zap, Star, Globe, Lock
} from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.7, delay: i * 0.12, ease: "easeOut" as const }
  })
};

export default function Page() {
  const [isScanning, setIsScanning] = useState(false);
  const [scanStep, setScanStep] = useState(0);
  const [atsScore, setAtsScore] = useState(0);

  // Animated counter for ATS score in hero
  useEffect(() => {
    const target = 94;
    const step = target / 60;
    let current = 0;
    const interval = setInterval(() => {
      current += step;
      if (current >= target) {
        setAtsScore(target);
        clearInterval(interval);
      } else {
        setAtsScore(Math.floor(current));
      }
    }, 30);
    return () => clearInterval(interval);
  }, []);

  const handleScanClick = () => {
    setIsScanning(true);
    setTimeout(() => setScanStep(1), 1200); 
    setTimeout(() => setScanStep(2), 2800); 
    setTimeout(() => { window.location.href = '/register?intent=scan'; }, 4200);
  };

  if (isScanning) {
    return (
      <main className="min-h-screen bg-[#0a0a0f] flex flex-col items-center justify-center text-white overflow-hidden relative">
        {/* Mesh gradient background */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-[120px]" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-600/15 rounded-full blur-[120px]" />
        </div>
        
        <div className="relative z-10 flex flex-col items-center w-full max-w-md mx-auto space-y-10 p-6">
          <motion.div
            initial={{ scale: 0.5, opacity: 0, rotateY: 180 }}
            animate={{ scale: 1, opacity: 1, rotateY: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="relative"
          >
            <div className="w-24 h-24 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 rounded-3xl border border-white/10 flex items-center justify-center backdrop-blur-sm">
              <FileText className="w-12 h-12 text-blue-400" />
            </div>
            {/* Scanning line */}
            <motion.div
              animate={{ top: ['0%', '100%', '0%'] }}
              transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
              className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-blue-400 to-transparent"
              style={{ top: '0%' }}
            />
            {/* Pulse ring */}
            <motion.div
              animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="absolute inset-0 border-2 border-blue-400/30 rounded-3xl"
            />
          </motion.div>

          <div className="text-center space-y-3 w-full">
            <motion.h2 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-2xl font-bold tracking-tight"
            >
              Analyzing Resume
            </motion.h2>
            <div className="h-6 flex items-center justify-center">
              <AnimatePresence mode="wait">
                {scanStep === 0 && <motion.p key="0" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="text-sm text-blue-400/80 tracking-wide">Initializing scanner engine...</motion.p>}
                {scanStep === 1 && <motion.p key="1" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="text-sm text-blue-400/80 tracking-wide">Parsing document structure...</motion.p>}
                {scanStep === 2 && <motion.p key="2" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="text-sm text-emerald-400/80 tracking-wide">Running ATS compatibility checks...</motion.p>}
              </AnimatePresence>
            </div>
          </div>
          
          <div className="w-full space-y-2">
            <div className="flex justify-between text-xs text-white/50">
              <span>Progress</span>
              <span>{scanStep === 0 ? '25' : scanStep === 1 ? '60' : '100'}%</span>
            </div>
            <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden border border-white/10">
              <motion.div
                initial={{ width: '0%' }}
                animate={{ width: scanStep === 0 ? '25%' : scanStep === 1 ? '60%' : '100%' }}
                transition={{ duration: 1.2, ease: "easeInOut" }}
                className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"
              />
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white text-slate-950 font-sans overflow-x-hidden">
      
      {/* Navigation - Clean & Minimal */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <Image src="/icon.svg" alt="Rolevia" width={120} height={36} className="h-8 w-auto object-contain" priority />
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/login">
              <Button variant="ghost" className="text-sm font-medium text-slate-600 hover:text-slate-950 rounded-full px-5">
                Sign In
              </Button>
            </Link>
            <Link href="/register">
              <Button className="bg-slate-950 hover:bg-slate-800 text-white text-sm font-semibold py-5 px-6 rounded-full shadow-lg shadow-slate-950/10 transition-all hover:-translate-y-0.5">
                Get Started Free <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        {/* Background: Subtle gradient mesh */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 right-1/4 w-[600px] h-[600px] bg-blue-50 rounded-full blur-[100px] opacity-80" />
          <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-indigo-50 rounded-full blur-[100px] opacity-60" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-br from-emerald-50/30 to-transparent rounded-full blur-[120px]" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
            
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: -15, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-full mb-8"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span className="text-xs font-semibold text-blue-700 tracking-wide">AI-POWERED CAREER INTELLIGENCE PLATFORM</span>
            </motion.div>

            {/* Main Heading */}
            <motion.h1 
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="text-5xl sm:text-6xl md:text-7xl lg:text-[5.25rem] font-extrabold tracking-tight leading-[1.08] text-slate-950"
            >
              Build better resumes.
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600">
                Land dream jobs.
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.25 }}
              className="mt-7 text-lg md:text-xl text-slate-500 leading-relaxed max-w-2xl font-medium"
            >
              Rolevia uses AI to analyze your resume against ATS systems, simulate mock interviews, identify skill gaps, and track applications — all from one intelligent dashboard.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.35 }}
              className="mt-10 flex flex-col sm:flex-row items-center gap-4"
            >
              <Button 
                onClick={handleScanClick}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-base py-7 px-10 rounded-full shadow-xl shadow-blue-600/25 transition-all hover:-translate-y-0.5 hover:shadow-2xl hover:shadow-blue-600/30 flex items-center gap-2"
              >
                <FileText className="w-4.5 h-4.5" />
                Start Free ATS Scan
              </Button>
              <Link href="/register">
                <Button variant="outline" className="font-semibold text-base py-7 px-10 rounded-full border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all">
                  Explore Platform
                </Button>
              </Link>
            </motion.div>

            {/* Trust Signals */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400"
            >
              <span className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> No credit card required</span>
              <span className="flex items-center gap-1.5"><Lock className="w-3.5 h-3.5 text-slate-400" /> Data encrypted & private</span>
              <span className="flex items-center gap-1.5"><Star className="w-3.5 h-3.5 text-yellow-500" /> 50+ ATS checks</span>
            </motion.div>
          </div>

          {/* Hero Dashboard Mockup - Floating, realistic */}
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="mt-20 max-w-5xl mx-auto"
          >
            <div className="relative">
              {/* Glow behind */}
              <div className="absolute -inset-4 bg-gradient-to-b from-blue-100/50 to-transparent rounded-[2.5rem] blur-2xl" />
              
              {/* Dashboard Shell */}
              <div className="relative bg-slate-950 rounded-[1.5rem] border border-slate-800 shadow-2xl shadow-slate-950/30 overflow-hidden">
                {/* Browser Top Bar */}
                <div className="h-10 bg-slate-900 border-b border-slate-800 flex items-center px-4 gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/80"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500/80"></div>
                  </div>
                  <div className="ml-4 flex-1 h-6 bg-slate-800 rounded-md flex items-center px-3">
                    <span className="text-[10px] text-slate-500">rolevia.com/dashboard</span>
                  </div>
                </div>
                
                {/* Dashboard Content */}
                <div className="p-6 grid grid-cols-12 gap-4 min-h-[340px]">
                  {/* Sidebar */}
                  <div className="col-span-2 space-y-3">
                    <div className="flex items-center gap-2 p-2 rounded-lg bg-blue-500/10">
                      <BarChart3 className="w-4 h-4 text-blue-400" />
                      <span className="text-[10px] text-blue-400 font-medium">Overview</span>
                    </div>
                    {['Resume', 'Jobs', 'Interview', 'Skills'].map((item, i) => (
                      <div key={i} className="flex items-center gap-2 p-2 rounded-lg hover:bg-white/5">
                        <div className="w-4 h-4 rounded bg-slate-800"></div>
                        <span className="text-[10px] text-slate-500 font-medium">{item}</span>
                      </div>
                    ))}
                  </div>
                  
                  {/* Main Content */}
                  <div className="col-span-7 space-y-4">
                    {/* Score Card */}
                    <div className="bg-gradient-to-r from-blue-600/20 to-indigo-600/20 border border-blue-500/20 rounded-xl p-5 flex items-center justify-between">
                      <div>
                        <p className="text-[10px] text-blue-300 font-semibold uppercase tracking-wider">ATS Compatibility Score</p>
                        <p className="text-3xl font-black text-white mt-1">{atsScore}<span className="text-lg text-blue-400">%</span></p>
                      </div>
                      <div className="w-16 h-16 rounded-full border-4 border-blue-500/30 flex items-center justify-center">
                        <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                          <CheckCircle className="w-6 h-6 text-blue-400" />
                        </div>
                      </div>
                    </div>
                    
                    {/* Stats Row */}
                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-800">
                        <p className="text-[10px] text-slate-500 font-medium">Skills Matched</p>
                        <p className="text-lg font-bold text-emerald-400 mt-1">12/15</p>
                      </div>
                      <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-800">
                        <p className="text-[10px] text-slate-500 font-medium">Interview Score</p>
                        <p className="text-lg font-bold text-indigo-400 mt-1">87%</p>
                      </div>
                      <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-800">
                        <p className="text-[10px] text-slate-500 font-medium">Applications</p>
                        <p className="text-lg font-bold text-white mt-1">24</p>
                      </div>
                    </div>
                    
                    {/* Graph placeholder */}
                    <div className="bg-slate-800/30 rounded-xl p-4 border border-slate-800 h-24 flex items-end gap-1 px-6">
                      {[40, 55, 35, 70, 60, 85, 75, 90, 65, 80, 95, 88].map((h, i) => (
                        <motion.div 
                          key={i} 
                          initial={{ height: 0 }}
                          animate={{ height: `${h}%` }}
                          transition={{ delay: 0.8 + i * 0.05, duration: 0.5 }}
                          className="flex-1 bg-gradient-to-t from-blue-600 to-blue-400 rounded-t"
                        />
                      ))}
                    </div>
                  </div>
                  
                  {/* Right Panel */}
                  <div className="col-span-3 space-y-3">
                    <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-800">
                      <p className="text-[10px] text-slate-500 font-semibold uppercase">Quick Actions</p>
                      <div className="mt-3 space-y-2">
                        <div className="h-7 bg-blue-600/20 rounded-lg border border-blue-500/20 flex items-center px-2">
                          <span className="text-[9px] text-blue-400">↑ Upload Resume</span>
                        </div>
                        <div className="h-7 bg-emerald-600/10 rounded-lg border border-emerald-500/20 flex items-center px-2">
                          <span className="text-[9px] text-emerald-400">⚡ Run ATS Scan</span>
                        </div>
                      </div>
                    </div>
                    <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-800 space-y-2">
                      <p className="text-[10px] text-slate-500 font-semibold uppercase">Skill Gaps</p>
                      {['Docker', 'AWS', 'GraphQL'].map((skill, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-amber-400"></div>
                          <span className="text-[10px] text-slate-400">{skill}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Trusted By / Social Proof Bar */}
      <section className="py-16 border-t border-slate-100 bg-slate-50/50">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-8">Trusted by students & professionals across India</p>
          <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-4">
            {['100% Evidence-Based', '50+ ATS Checks', 'AI Interview Coach', 'Private & Secure', 'Real-time Feedback'].map((item, i) => (
              <motion.div 
                key={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={i}
                variants={fadeUp}
                className="flex items-center gap-2 text-sm font-medium text-slate-600"
              >
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                {item}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <motion.h2 
              initial="hidden" whileInView="visible" viewport={{ once: true }} custom={0} variants={fadeUp}
              className="text-4xl md:text-5xl font-extrabold text-slate-950 tracking-tight"
            >
              Everything you need to
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">ace your career.</span>
            </motion.h2>
            <motion.p 
              initial="hidden" whileInView="visible" viewport={{ once: true }} custom={1} variants={fadeUp}
              className="mt-5 text-lg text-slate-500"
            >
              Four powerful modules working together to give you an unfair advantage.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[
              {
                icon: Brain, color: 'blue', title: 'Resume Intelligence Lab',
                desc: 'Upload your resume and get a line-by-line analysis with 50+ ATS parsing checks, keyword density scoring, and a transparent compatibility report.',
                tag: 'CORE'
              },
              {
                icon: Users, color: 'violet', title: 'Mock Interview Simulator',
                desc: 'Practice with AI-powered HR, technical, and behavioral interviews that adapt to your resume, target role, and improvement areas.',
                tag: 'AI-POWERED'
              },
              {
                icon: Target, color: 'emerald', title: 'Career Gap Radar',
                desc: 'Compare your profile against target roles. Instantly see skill gaps with actionable 30/60/90-day learning plans.',
                tag: 'STRATEGIC'
              },
              {
                icon: Database, color: 'amber', title: 'Evidence-Based Matching',
                desc: 'Every matched skill is backed by real evidence from your resume. No hallucination, no guesswork — just verified facts.',
                tag: 'VERIFIED'
              },
            ].map((feature, i) => (
              <motion.div 
                key={i}
                initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i} variants={fadeUp}
                className="group bg-white border border-slate-200 p-8 md:p-10 rounded-2xl hover:border-slate-300 hover:shadow-lg hover:shadow-slate-100 transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-6">
                  <div className={`w-12 h-12 rounded-xl bg-${feature.color}-50 flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <feature.icon className={`w-6 h-6 text-${feature.color}-600`} />
                  </div>
                  <span className={`text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full bg-${feature.color}-50 text-${feature.color}-600`}>
                    {feature.tag}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-slate-950 mb-3">{feature.title}</h3>
                <p className="text-slate-500 leading-relaxed text-[15px]">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-slate-50 border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <motion.h2 
              initial="hidden" whileInView="visible" viewport={{ once: true }} custom={0} variants={fadeUp}
              className="text-4xl md:text-5xl font-extrabold text-slate-950 tracking-tight"
            >
              How it works
            </motion.h2>
            <motion.p 
              initial="hidden" whileInView="visible" viewport={{ once: true }} custom={1} variants={fadeUp}
              className="mt-5 text-lg text-slate-500"
            >
              Three steps to transform your job search.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Upload & Analyze', desc: 'Upload your resume (PDF/DOCX). Our AI extracts every detail and builds your career profile.', icon: FileText },
              { step: '02', title: 'Optimize & Practice', desc: 'Get ATS scores, fix issues, and practice interviews tailored to your target roles.', icon: Zap },
              { step: '03', title: 'Apply & Track', desc: 'Apply to matched roles with optimized resumes. Track every application in one place.', icon: Globe },
            ].map((item, i) => (
              <motion.div 
                key={i}
                initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i} variants={fadeUp}
                className="relative bg-white border border-slate-200 rounded-2xl p-8 text-center"
              >
                <div className="text-5xl font-black text-slate-100 mb-4">{item.step}</div>
                <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center mx-auto mb-5">
                  <item.icon className="w-7 h-7 text-blue-600" />
                </div>
                <h3 className="text-lg font-bold text-slate-950 mb-2">{item.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <motion.h2 
              initial="hidden" whileInView="visible" viewport={{ once: true }} custom={0} variants={fadeUp}
              className="text-4xl md:text-5xl font-extrabold text-slate-950 tracking-tight"
            >
              Simple, transparent pricing.
            </motion.h2>
            <motion.p 
              initial="hidden" whileInView="visible" viewport={{ once: true }} custom={1} variants={fadeUp}
              className="mt-5 text-lg text-slate-500"
            >
              Start free. Upgrade when you're ready.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-5 items-start">
            {[
              {
                name: 'Free', price: '₹0', period: '', desc: 'Get started instantly.',
                features: ['1 resume upload', 'Basic ATS report', '1 career audit', 'Limited job matching'],
                cta: 'Start Free', style: 'bg-white border-slate-200', btnStyle: 'bg-slate-100 hover:bg-slate-200 text-slate-700', popular: false
              },
              {
                name: 'Launch', price: '₹59', period: '/mo', desc: 'For students & freshers.',
                features: ['5 resume versions', 'Advanced ATS analysis', 'Job matching & tailoring', 'Skill gap analysis'],
                cta: 'Get Started', style: 'bg-white border-slate-200', btnStyle: 'bg-slate-950 hover:bg-slate-800 text-white', popular: false
              },
              {
                name: 'Career', price: '₹99', period: '/mo', desc: 'For active job seekers.',
                features: ['Unlimited resumes', 'Mock interviews & feedback', 'Cover letter generator', 'Application intelligence', 'Priority support'],
                cta: 'Get Started', style: 'bg-slate-950 border-slate-800 text-white', btnStyle: 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-900/30', popular: true
              },
              {
                name: 'Pro', price: '₹149', period: '/mo', desc: 'Complete prep system.',
                features: ['Everything in Career', 'Advanced mock interviews', 'Resume A/B testing', 'Company-specific prep'],
                cta: 'Get Started', style: 'bg-white border-slate-200', btnStyle: 'bg-slate-950 hover:bg-slate-800 text-white', popular: false
              },
            ].map((plan, i) => (
              <motion.div 
                key={i}
                initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i} variants={fadeUp}
                className={`relative border rounded-2xl p-8 flex flex-col justify-between ${plan.style} ${plan.popular ? 'md:-translate-y-4 shadow-2xl shadow-slate-950/10 ring-1 ring-white/10' : 'shadow-sm'}`}
              >
                {plan.popular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[10px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg shadow-blue-600/30">
                    Most Popular
                  </div>
                )}
                <div>
                  <h4 className={`font-bold text-sm uppercase tracking-wide ${plan.popular ? 'text-white' : 'text-slate-950'}`}>{plan.name}</h4>
                  <div className={`text-4xl font-black mt-2 ${plan.popular ? 'text-white' : 'text-slate-950'}`}>
                    {plan.price}<span className={`text-base font-medium ${plan.popular ? 'text-slate-400' : 'text-slate-400'}`}>{plan.period}</span>
                  </div>
                  <p className={`text-sm mt-1 ${plan.popular ? 'text-slate-400' : 'text-slate-500'}`}>{plan.desc}</p>
                  <div className="mt-6 space-y-3">
                    {plan.features.map((f, j) => (
                      <div key={j} className={`flex items-center gap-2.5 text-sm ${plan.popular ? 'text-slate-300' : 'text-slate-600'}`}>
                        <CheckCircle className={`w-4 h-4 shrink-0 ${plan.popular ? 'text-blue-400' : 'text-blue-600'}`} />
                        {f}
                      </div>
                    ))}
                  </div>
                </div>
                <Link href="https://razorpay.me/@chaitanyakumarsahu" target="_blank" className="block mt-8">
                  <Button className={`w-full rounded-full py-6 font-bold ${plan.btnStyle}`}>{plan.cta}</Button>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-24 bg-slate-950 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/3 w-96 h-96 bg-blue-600/10 rounded-full blur-[100px]" />
          <div className="absolute bottom-0 right-1/3 w-96 h-96 bg-indigo-600/10 rounded-full blur-[100px]" />
        </div>
        <div className="relative z-10 max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight">
            Ready to outsmart<br />the ATS?
          </h2>
          <p className="mt-6 text-lg text-slate-400">
            Join thousands of students and professionals who are already using Rolevia to land their dream jobs.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/register">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-base py-7 px-10 rounded-full shadow-xl shadow-blue-900/30">
                Get Started Free <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="flex flex-col md:flex-row items-start justify-between gap-10 pb-10 border-b border-slate-800">
            <div>
              <Link href="/" className="flex items-center gap-3">
                <Image src="/icon.svg" alt="Rolevia" width={120} height={36} className="h-8 w-auto object-contain brightness-0 invert" />
              </Link>
              <p className="mt-4 text-sm text-slate-500 max-w-xs">
                The AI-powered career intelligence platform. Build better. Apply smarter. Get hired.
              </p>
            </div>
            <div className="flex flex-wrap gap-10">
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Product</h4>
                <div className="space-y-3">
                  <Link href="/register" className="block text-sm text-slate-500 hover:text-white transition-colors">Resume Lab</Link>
                  <Link href="/register" className="block text-sm text-slate-500 hover:text-white transition-colors">Interviews</Link>
                  <Link href="/register" className="block text-sm text-slate-500 hover:text-white transition-colors">Job Matching</Link>
                </div>
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Company</h4>
                <div className="space-y-3">
                  <Link href="/" className="block text-sm text-slate-500 hover:text-white transition-colors">About</Link>
                  <Link href="/p/privacy" className="block text-sm text-slate-500 hover:text-white transition-colors">Privacy Policy</Link>
                  <Link href="/p/terms" className="block text-sm text-slate-500 hover:text-white transition-colors">Terms of Service</Link>
                  <Link href="/p/refund" className="block text-sm text-slate-500 hover:text-white transition-colors">Refund Policy</Link>
                </div>
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Access</h4>
                <div className="space-y-3">
                  <Link href="/login" className="block text-sm text-slate-500 hover:text-white transition-colors">Login</Link>
                  <Link href="/register" className="block text-sm text-slate-500 hover:text-white transition-colors">Register</Link>
                </div>
              </div>
            </div>
          </div>
          <div className="pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-slate-600">
            <p>© 2026 Rolevia Inc. All rights reserved.</p>
            <p className="mt-2 md:mt-0">Build Better. Apply Smarter. Get Hired.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
