'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeft, Loader2, BarChart2, ShieldCheck, 
  AlertTriangle, CheckCircle, Scale, Star 
} from 'lucide-react';
import Link from 'next/link';

interface ReportSummary {
  id: string;
  fileName: string;
  careerOsScore: number;
  atsScore: number;
  contentScore: number;
  impactScore: number;
  recruiterScore: number;
  createdAt: string;
}

export default function ABTestingPage() {
  const [reports, setReports] = useState<ReportSummary[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [reportAId, setReportAId] = useState('');
  const [reportBId, setReportBId] = useState('');

  const [reportA, setReportA] = useState<any>(null);
  const [reportB, setReportB] = useState<any>(null);
  const [loadingA, setLoadingA] = useState(false);
  const [loadingB, setLoadingB] = useState(false);

  // Fetch report list
  useEffect(() => {
    fetch('/api/resume-intelligence/reports')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setReports(data);
          if (data.length > 0) {
            setReportAId(data[0].id);
            if (data.length > 1) {
              setReportBId(data[1].id);
            }
          }
        }
        setLoadingList(false);
      })
      .catch(err => {
        console.error('Error fetching reports list:', err);
        setLoadingList(false);
      });
  }, []);

  // Fetch Report A details
  useEffect(() => {
    if (!reportAId) return;
    setLoadingA(true);
    fetch(`/api/resume-intelligence/${reportAId}`)
      .then(res => res.json())
      .then(data => {
        setReportA(data);
        setLoadingA(false);
      })
      .catch(err => {
        console.error('Error loading report A:', err);
        setLoadingA(false);
      });
  }, [reportAId]);

  // Fetch Report B details
  useEffect(() => {
    if (!reportBId) return;
    setLoadingB(true);
    fetch(`/api/resume-intelligence/${reportBId}`)
      .then(res => res.json())
      .then(data => {
        setReportB(data);
        setLoadingB(false);
      })
      .catch(err => {
        console.error('Error loading report B:', err);
        setLoadingB(false);
      });
  }, [reportBId]);

  const getWinner = (valA: number, valB: number) => {
    if (valA > valB) return 'A';
    if (valB > valA) return 'B';
    return 'TIE';
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-slate-900 p-6 space-y-6">
      
      <Link
        href="/dashboard/resume-intelligence"
        className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Resume Intelligence
      </Link>

      <div className="space-y-1">
        <h1 className="text-2xl font-serif font-black text-slate-900 flex items-center gap-2">
          <Scale className="w-6 h-6 text-emerald-600" />
          A/B Resume Lab
        </h1>
        <p className="text-sm text-slate-600">
          Compare two versions of your resume side-by-side to determine which one ranks higher for ATS and recruiter search algorithms.
        </p>
      </div>

      {/* Selectors */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-1">
          <label className="text-xs font-bold uppercase text-slate-500 tracking-wider">Select Resume version A</label>
          {loadingList ? (
            <div className="h-10 bg-slate-100 rounded-xl animate-pulse" />
          ) : (
            <select
              value={reportAId}
              onChange={e => setReportAId(e.target.value)}
              className="w-full p-2.5 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {reports.map(r => (
                <option key={r.id} value={r.id}>{r.fileName} ({r.careerOsScore} pts)</option>
              ))}
            </select>
          )}
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold uppercase text-slate-500 tracking-wider">Select Resume version B</label>
          {loadingList ? (
            <div className="h-10 bg-slate-100 rounded-xl animate-pulse" />
          ) : (
            <select
              value={reportBId}
              onChange={e => setReportBId(e.target.value)}
              className="w-full p-2.5 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">-- Choose Comparison Version --</option>
              {reports.filter(r => r.id !== reportAId).map(r => (
                <option key={r.id} value={r.id}>{r.fileName} ({r.careerOsScore} pts)</option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Comparison Grid */}
      {(loadingA || loadingB) ? (
        <div className="h-64 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
        </div>
      ) : reportA && reportB ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Comparison Table */}
          <div className="lg:col-span-12 bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="p-4 text-xs font-bold uppercase text-slate-500 tracking-wider">Metric Dimension</th>
                  <th className="p-4 text-xs font-bold uppercase text-slate-500 tracking-wider w-1/3">Version A ({reportA.fileName})</th>
                  <th className="p-4 text-xs font-bold uppercase text-slate-500 tracking-wider w-1/3">Version B ({reportB.fileName})</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                
                {/* Overall Score */}
                <tr className="hover:bg-slate-50/50">
                  <td className="p-4 font-bold text-slate-900">Overall Rolevia Score</td>
                  <td className={`p-4 font-black text-lg ${getWinner(reportA.careerOsScore, reportB.careerOsScore) === 'A' ? 'text-emerald-650' : 'text-slate-700'}`}>
                    {reportA.careerOsScore} / 100 {getWinner(reportA.careerOsScore, reportB.careerOsScore) === 'A' && '🏆'}
                  </td>
                  <td className={`p-4 font-black text-lg ${getWinner(reportA.careerOsScore, reportB.careerOsScore) === 'B' ? 'text-emerald-650' : 'text-slate-700'}`}>
                    {reportB.careerOsScore} / 100 {getWinner(reportA.careerOsScore, reportB.careerOsScore) === 'B' && '🏆'}
                  </td>
                </tr>

                {/* ATS Score */}
                <tr className="hover:bg-slate-50/50">
                  <td className="p-4 font-medium text-slate-700">ATS Parsing Compatibility</td>
                  <td className={`p-4 font-bold ${getWinner(reportA.atsScore, reportB.atsScore) === 'A' ? 'text-emerald-600' : 'text-slate-600'}`}>
                    {reportA.atsScore}%
                  </td>
                  <td className={`p-4 font-bold ${getWinner(reportA.atsScore, reportB.atsScore) === 'B' ? 'text-emerald-600' : 'text-slate-600'}`}>
                    {reportB.atsScore}%
                  </td>
                </tr>

                {/* Impact Score */}
                <tr className="hover:bg-slate-50/50">
                  <td className="p-4 font-medium text-slate-700">Career Evidence & Bullets</td>
                  <td className={`p-4 font-bold ${getWinner(reportA.impactScore, reportB.impactScore) === 'A' ? 'text-emerald-600' : 'text-slate-600'}`}>
                    {reportA.impactScore}%
                  </td>
                  <td className={`p-4 font-bold ${getWinner(reportA.impactScore, reportB.impactScore) === 'B' ? 'text-emerald-600' : 'text-slate-600'}`}>
                    {reportB.impactScore}%
                  </td>
                </tr>

                {/* Recruiter Score */}
                <tr className="hover:bg-slate-50/50">
                  <td className="p-4 font-medium text-slate-700">Recruiter Readiness index</td>
                  <td className={`p-4 font-bold ${getWinner(reportA.recruiterScore, reportB.recruiterScore) === 'A' ? 'text-emerald-600' : 'text-slate-600'}`}>
                    {reportA.recruiterScore}%
                  </td>
                  <td className={`p-4 font-bold ${getWinner(reportA.recruiterScore, reportB.recruiterScore) === 'B' ? 'text-emerald-600' : 'text-slate-600'}`}>
                    {reportB.recruiterScore}%
                  </td>
                </tr>

                {/* Content Score */}
                <tr className="hover:bg-slate-50/50">
                  <td className="p-4 font-medium text-slate-700">Content Completeness</td>
                  <td className={`p-4 font-bold ${getWinner(reportA.contentScore, reportB.contentScore) === 'A' ? 'text-emerald-600' : 'text-slate-600'}`}>
                    {reportA.contentScore}%
                  </td>
                  <td className={`p-4 font-bold ${getWinner(reportA.contentScore, reportB.contentScore) === 'B' ? 'text-emerald-600' : 'text-slate-600'}`}>
                    {reportB.contentScore}%
                  </td>
                </tr>

                {/* Gaps List */}
                <tr className="hover:bg-slate-50/50">
                  <td className="p-4 font-medium text-slate-700">Critical Check Issues</td>
                  <td className="p-4 text-xs space-y-1">
                    {reportA.checks?.filter((c: any) => c.status === 'FAIL').map((c: any) => (
                      <p key={c.id} className="text-red-600 font-semibold flex items-center gap-1">✕ {c.label}</p>
                    )) || 'No critical issues'}
                  </td>
                  <td className="p-4 text-xs space-y-1">
                    {reportB.checks?.filter((c: any) => c.status === 'FAIL').map((c: any) => (
                      <p key={c.id} className="text-red-600 font-semibold flex items-center gap-1">✕ {c.label}</p>
                    )) || 'No critical issues'}
                  </td>
                </tr>

                {/* Strengths List */}
                <tr className="hover:bg-slate-50/50">
                  <td className="p-4 font-medium text-slate-700">Primary Strengths</td>
                  <td className="p-4 text-xs space-y-1">
                    {reportA.checks?.filter((c: any) => c.status === 'PASS').slice(0, 3).map((c: any) => (
                      <p key={c.id} className="text-emerald-600 font-semibold flex items-center gap-1">✓ {c.label}</p>
                    )) || 'No strengths verified'}
                  </td>
                  <td className="p-4 text-xs space-y-1">
                    {reportB.checks?.filter((c: any) => c.status === 'PASS').slice(0, 3).map((c: any) => (
                      <p key={c.id} className="text-emerald-600 font-semibold flex items-center gap-1">✓ {c.label}</p>
                    )) || 'No strengths verified'}
                  </td>
                </tr>

              </tbody>
            </table>
          </div>

          {/* Winner Banner */}
          <div className="lg:col-span-12">
            <Card className="border border-emerald-250 bg-emerald-50/15 p-5 text-center flex flex-col items-center gap-2">
              <Star className="w-10 h-10 text-emerald-600 fill-emerald-600 animate-bounce" />
              <h3 className="font-serif font-black text-lg text-slate-900">
                Winner: {reportA.careerOsScore >= reportB.careerOsScore ? reportA.fileName : reportB.fileName}
              </h3>
              <p className="text-xs text-slate-600 max-w-md mx-auto">
                Based on parsing reliability, keyword frequency weight, and bullet action strength, this version provides a higher probability of passing corporate filters.
              </p>
            </Card>
          </div>

        </div>
      ) : (
        <div className="h-64 flex flex-col items-center justify-center border border-dashed rounded-2xl text-center text-muted-foreground p-6 bg-white shadow-sm">
          <Scale className="w-12 h-12 mb-2 text-slate-300" />
          <h3 className="font-semibold text-sm">Select two resume reports</h3>
          <p className="text-xs max-w-xs mt-1">Please select two parsed resume reports from the dropdown menus above to compare them side-by-side.</p>
        </div>
      )}

    </div>
  );
}
