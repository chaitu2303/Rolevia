'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <main className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-white border border-slate-200 p-8 rounded-[2rem] shadow-xl flex flex-col items-center"
      >
        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-6 border border-slate-200">
          <ShieldAlert className="w-10 h-10 text-slate-400" />
        </div>
        <h1 className="text-4xl font-serif font-black text-slate-900 tracking-tight mb-3">404</h1>
        <h2 className="text-lg font-bold text-slate-700 mb-2">Page Not Found</h2>
        <p className="text-slate-500 text-sm leading-relaxed mb-8">
          The page you are looking for does not exist or has been moved. Let's get you back on track.
        </p>
        <Link href="/">
          <Button className="w-full bg-slate-950 hover:bg-slate-800 text-white rounded-full py-6 flex items-center justify-center gap-2 font-bold shadow-md">
            <ArrowLeft className="w-4 h-4" /> Return to Dashboard
          </Button>
        </Link>
      </motion.div>
    </main>
  );
}
