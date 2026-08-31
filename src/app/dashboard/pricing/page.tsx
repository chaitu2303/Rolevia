'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  CheckCircle, Sparkles, Loader2, CreditCard, 
  ArrowLeft, Star, Heart, Award 
} from 'lucide-react';
import Link from 'next/link';

interface Subscription {
  plan: string;
  isActive: boolean;
}

export default function PricingPage() {
  const [sub, setSub] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/subscription')
      .then(res => res.json())
      .then(data => {
        setSub(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching subscription:', err);
        setLoading(false);
      });
  }, []);

  const handleUpgrade = async (plan: string) => {
    setSubmitting(plan);
    try {
      const res = await fetch('/api/subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan })
      });
      const data = await res.json();
      setSub(data);
      alert(`Checkout Simulated! Your account has been upgraded to the ${plan} tier.`);
    } catch (err) {
      console.error('Upgrade failed:', err);
    } finally {
      setSubmitting(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  const currentPlan = sub?.plan || 'FREE';

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-slate-900 p-6 space-y-6">
      
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Dashboard
        </Link>
        <span className="text-xs bg-amber-50 text-amber-600 border border-amber-200/50 px-3.5 py-1 rounded-full font-bold uppercase tracking-widest flex items-center gap-1.5 animate-pulse">
          <CreditCard className="w-3.5 h-3.5" /> Billing integration pending
        </span>
      </div>

      <div className="space-y-2 text-center max-w-2xl mx-auto py-6">
        <h1 className="text-3xl sm:text-4xl font-serif font-black text-slate-900">
          Affordable Career Prep Plans
        </h1>
        <p className="text-sm text-slate-655 max-w-md mx-auto leading-relaxed">
          Upgrade your account to unlock premium ATS parsing checklists, custom templates, and mock interviews.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-6xl mx-auto">
        
        {/* Free Plan */}
        <Card className={`border relative overflow-hidden bg-white ${
          currentPlan === 'FREE' ? 'ring-2 ring-emerald-500 border-emerald-500' : 'border-slate-200/80 shadow-sm'
        }`}>
          {currentPlan === 'FREE' && (
            <div className="bg-emerald-500 text-slate-950 text-[9px] font-bold uppercase tracking-widest text-center py-1 absolute top-0 left-0 right-0">
              Active Plan
            </div>
          )}
          <CardContent className="p-6 pt-8 space-y-6 flex flex-col justify-between h-full">
            <div className="space-y-4">
              <div>
                <h4 className="font-bold text-slate-500 text-xs uppercase tracking-wider">Free</h4>
                <div className="text-3xl font-black text-slate-900 mt-1">₹0</div>
                <p className="text-[10px] text-slate-550 mt-1">Start preparing now.</p>
              </div>
              <ul className="text-xs space-y-2.5 text-slate-655">
                <li className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> 1 complete career audit</li>
                <li className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> 1 resume upload</li>
                <li className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> Basic ATS checklist</li>
              </ul>
            </div>
            
            <Button 
              variant="outline" 
              disabled={currentPlan === 'FREE' || submitting !== null}
              onClick={() => handleUpgrade('FREE')}
              className="w-full rounded-xl mt-4"
            >
              {currentPlan === 'FREE' ? 'Current Tier' : 'Select Free'}
            </Button>
          </CardContent>
        </Card>

        {/* Launch Plan */}
        <Card className={`border relative overflow-hidden bg-white ${
          currentPlan === 'LAUNCH' ? 'ring-2 ring-emerald-500 border-emerald-500' : 'border-slate-200/80 shadow-sm'
        }`}>
          {currentPlan === 'LAUNCH' && (
            <div className="bg-emerald-500 text-slate-950 text-[9px] font-bold uppercase tracking-widest text-center py-1 absolute top-0 left-0 right-0">
              Active Plan
            </div>
          )}
          <CardContent className="p-6 pt-8 space-y-6 flex flex-col justify-between h-full">
            <div className="space-y-4">
              <div>
                <h4 className="font-bold text-slate-500 text-xs uppercase tracking-wider">Launch</h4>
                <div className="text-3xl font-black text-slate-900 mt-1">₹59<span className="text-xs text-slate-550 font-normal">/mo</span></div>
                <p className="text-[10px] text-slate-555 mt-1">For first-time job seekers.</p>
              </div>
              <ul className="text-xs space-y-2.5 text-slate-655">
                <li className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> Multiple resume uploads</li>
                <li className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> Advanced ATS checklist</li>
                <li className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> Job matching & tailoring</li>
              </ul>
            </div>
            
            <Button 
              disabled={currentPlan === 'LAUNCH' || submitting !== null}
              onClick={() => handleUpgrade('LAUNCH')}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white rounded-xl mt-4"
            >
              {submitting === 'LAUNCH' ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : currentPlan === 'LAUNCH' ? (
                'Current Tier'
              ) : (
                'Simulate Upgrade'
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Career Plan */}
        <Card className={`border-2 relative overflow-hidden bg-white ${
          currentPlan === 'CAREER' ? 'border-emerald-500 ring-2 ring-emerald-500' : 'border-emerald-400 shadow-md'
        }`}>
          <div className="bg-emerald-500 text-slate-950 text-[9px] font-bold uppercase tracking-widest text-center py-1 absolute top-0 left-0 right-0">
            {currentPlan === 'CAREER' ? 'Active Plan' : 'Most Popular'}
          </div>
          <CardContent className="p-6 pt-8 space-y-6 flex flex-col justify-between h-full">
            <div className="space-y-4">
              <div>
                <h4 className="font-bold text-slate-500 text-xs uppercase tracking-wider flex items-center gap-1">
                  Career <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                </h4>
                <div className="text-3xl font-black text-slate-900 mt-1">₹99<span className="text-xs text-slate-555 font-normal">/mo</span></div>
                <p className="text-[10px] text-slate-555 mt-1">For active applicants.</p>
              </div>
              <ul className="text-xs space-y-2.5 text-slate-655">
                <li className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> Unlimited resume versions</li>
                <li className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> Mock interviews & evaluation</li>
                <li className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> Cover letter tailoring</li>
              </ul>
            </div>
            
            <Button 
              disabled={currentPlan === 'CAREER' || submitting !== null}
              onClick={() => handleUpgrade('CAREER')}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl mt-4"
            >
              {submitting === 'CAREER' ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : currentPlan === 'CAREER' ? (
                'Current Tier'
              ) : (
                'Simulate Upgrade'
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Pro Plan */}
        <Card className={`border relative overflow-hidden bg-white ${
          currentPlan === 'PRO' ? 'ring-2 ring-emerald-500 border-emerald-500' : 'border-slate-200/80 shadow-sm'
        }`}>
          {currentPlan === 'PRO' && (
            <div className="bg-emerald-500 text-slate-950 text-[9px] font-bold uppercase tracking-widest text-center py-1 absolute top-0 left-0 right-0">
              Active Plan
            </div>
          )}
          <CardContent className="p-6 pt-8 space-y-6 flex flex-col justify-between h-full">
            <div className="space-y-4">
              <div>
                <h4 className="font-bold text-slate-500 text-xs uppercase tracking-wider flex items-center gap-1">
                  Pro <Award className="w-3.5 h-3.5 text-emerald-600" />
                </h4>
                <div className="text-3xl font-black text-slate-900 mt-1">₹149<span className="text-xs text-slate-555 font-normal">/mo</span></div>
                <p className="text-[10px] text-slate-555 mt-1">Ultimate preparation system.</p>
              </div>
              <ul className="text-xs space-y-2.5 text-slate-655">
                <li className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> Unlimited scans & evaluations</li>
                <li className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> Resume A/B comparison</li>
                <li className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> Company-specific prep rooms</li>
              </ul>
            </div>
            
            <Button 
              disabled={currentPlan === 'PRO' || submitting !== null}
              onClick={() => handleUpgrade('PRO')}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white rounded-xl mt-4"
            >
              {submitting === 'PRO' ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : currentPlan === 'PRO' ? (
                'Current Tier'
              ) : (
                'Simulate Upgrade'
              )}
            </Button>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
