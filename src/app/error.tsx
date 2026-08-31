'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-white border border-red-100 p-8 rounded-[2rem] shadow-xl flex flex-col items-center"
      >
        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-6 border border-red-100">
          <AlertTriangle className="w-10 h-10 text-red-500" />
        </div>
        <h1 className="text-2xl font-serif font-black text-slate-900 tracking-tight mb-3">Something went wrong</h1>
        <p className="text-slate-500 text-sm leading-relaxed mb-8">
          A critical error occurred while loading this page. Our team has been notified.
        </p>
        <Button 
          onClick={() => reset()}
          className="w-full bg-slate-950 hover:bg-slate-800 text-white rounded-full py-6 flex items-center justify-center gap-2 font-bold shadow-md"
        >
          <RotateCcw className="w-4 h-4" /> Try Again
        </Button>
      </motion.div>
    </main>
  );
}
