'use client';

import { Check, X, Lock, ChevronDown, ChevronUp, FileText } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';

export function AtsDemo() {
  const [contentOpen, setContentOpen] = useState(true);

  return (
    <section className="w-full bg-[#90c0ff] border-t-8 border-black py-20 px-6">
      <div className="max-w-7xl mx-auto space-y-12">
        <div className="text-center space-y-4">
          <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tight">
            See Your Resume Like An ATS
          </h2>
          <p className="text-xl font-bold max-w-2xl mx-auto text-black/80">
            Find out exactly why your resume gets rejected. Our ATS AI scans your document and gives you actionable feedback instantly.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 items-start justify-center">
          
          {/* Left Sidebar (Score & Checklist) */}
          <div className="w-full lg:w-[350px] bg-white border-4 border-black rounded-none shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col p-6 space-y-8 shrink-0">
            <div className="text-center space-y-2 border-b-4 border-black pb-6">
              <h3 className="font-black text-2xl uppercase">Your Score</h3>
              <div className="text-6xl font-black text-[#FF90E8]">
                75<span className="text-3xl text-black">/100</span>
              </div>
              <p className="font-bold text-gray-500 uppercase tracking-widest text-sm">5 Issues Found</p>
            </div>

            <div className="space-y-6">
              {/* CONTENT Category */}
              <div className="space-y-4">
                <button 
                  onClick={() => setContentOpen(!contentOpen)}
                  className="w-full flex items-center justify-between font-black uppercase hover:text-[#23a094] transition-colors"
                >
                  <span>Content</span>
                  <div className="flex items-center gap-2">
                    <span className="bg-[#FFE500] border-2 border-black px-2 py-0.5 text-sm">65%</span>
                    {contentOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </div>
                </button>
                
                {contentOpen && (
                  <div className="space-y-3 pl-2">
                    <div className="flex items-center justify-between text-sm font-bold">
                      <div className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-[#23a094] stroke-[3]" />
                        <span>ATS Parse Rate</span>
                      </div>
                      <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded-full text-xs">No issues</span>
                    </div>
                    <div className="flex items-center justify-between text-sm font-bold">
                      <div className="flex items-center gap-2">
                        <X className="w-4 h-4 text-[#ff4040] stroke-[3]" />
                        <span>Quantifying Impact</span>
                      </div>
                      <span className="bg-red-100 text-red-800 px-2 py-0.5 rounded-full text-xs">2 Issues</span>
                    </div>
                    <div className="flex items-center justify-between text-sm font-bold">
                      <div className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-[#23a094] stroke-[3]" />
                        <span>Repetition</span>
                      </div>
                      <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded-full text-xs">No issues</span>
                    </div>
                    <div className="flex items-center justify-between text-sm font-bold">
                      <div className="flex items-center gap-2">
                        <X className="w-4 h-4 text-[#ff4040] stroke-[3]" />
                        <span>Spelling & Grammar</span>
                      </div>
                      <span className="bg-red-100 text-red-800 px-2 py-0.5 rounded-full text-xs">2 Issues</span>
                    </div>
                    <div className="flex items-center justify-between text-sm font-bold opacity-50">
                      <div className="flex items-center gap-2">
                        <Lock className="w-4 h-4 text-orange-500 stroke-[3]" />
                        <span>Bullets Consistency</span>
                      </div>
                      <span className="bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full text-xs">Locked</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="border-t-4 border-black pt-4">
                <button className="w-full flex items-center justify-between font-black uppercase hover:text-[#23a094] transition-colors">
                  <span>Sections</span>
                  <div className="flex items-center gap-2">
                    <span className="bg-[#23a094] text-white border-2 border-black px-2 py-0.5 text-sm">93%</span>
                    <ChevronDown className="w-5 h-5" />
                  </div>
                </button>
              </div>

              <div className="border-t-4 border-black pt-4">
                <button className="w-full flex items-center justify-between font-black uppercase hover:text-[#23a094] transition-colors">
                  <span>ATS Essentials</span>
                  <div className="flex items-center gap-2">
                    <span className="bg-[#FF90E8] border-2 border-black px-2 py-0.5 text-sm">76%</span>
                    <ChevronDown className="w-5 h-5" />
                  </div>
                </button>
              </div>
            </div>

            <button className="w-full bg-[#23a094] hover:bg-[#1a8076] text-white font-black uppercase py-4 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:translate-x-1 hover:shadow-[0px_0px_0px_0px_rgba(0,0,0,1)] transition-all">
              Unlock Full Report
            </button>
          </div>

          {/* Right Content Area */}
          <div className="w-full lg:max-w-3xl bg-[#FAF8F5] border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 md:p-10">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-black uppercase flex items-center gap-2">
                <div className="bg-[#FF90E8] border-2 border-black p-1 rotate-3">
                  <FileText className="w-6 h-6" />
                </div>
                Content
              </h2>
              <span className="font-bold text-sm bg-white border-2 border-black px-3 py-1">4 issues found</span>
            </div>

            <div className="bg-white border-4 border-black p-6 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-black uppercase flex items-center gap-2">
                  <span className="w-3 h-8 bg-[#FFE500] border-2 border-black inline-block -skew-x-12"></span>
                  ATS Parse Rate
                </h3>
                <ChevronUp className="w-6 h-6" />
              </div>
              
              <p className="font-bold text-gray-700 leading-relaxed">
                Employers and recruiters use an <span className="text-black bg-[#FFE500] px-1 border border-black">Applicant Tracking System (ATS)</span> to scan job applications at scale. 
                A high parse rate means the ATS reads your experience and skills clearly, so more recruiters see your resume.
              </p>

              <div className="bg-[#FAF8F5] border-2 border-black p-8 text-center space-y-6">
                <div className="relative h-6 bg-white border-2 border-black overflow-visible">
                  <motion.div 
                    initial={{ width: 0 }}
                    whileInView={{ width: '90%' }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, delay: 0.2 }}
                    className="h-full bg-[#23a094] border-r-2 border-black relative"
                  >
                    <div className="absolute -right-3 -top-6 text-xl">📍</div>
                  </motion.div>
                </div>
                <div className="space-y-2">
                  <h4 className="text-2xl font-black">Great!</h4>
                  <p className="font-bold text-lg max-w-md mx-auto">
                    We parsed 90% of your resume successfully using an industry-leading ATS.
                  </p>
                </div>
              </div>

              <div className="bg-[#FF90E8] border-2 border-black p-6 text-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transition-transform cursor-pointer">
                <p className="font-black text-lg">
                  Build an ATS-friendly resume using Placement2Job's Neo-Brutalist resume builder.
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
