import { Loader2 } from 'lucide-react';

export default function Loading() {
  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center">
      <div className="relative flex items-center justify-center">
        <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse" />
        <div className="w-16 h-16 border-4 border-muted rounded-full animate-spin border-t-primary shadow-lg" />
        <Loader2 className="absolute w-6 h-6 text-primary animate-pulse" />
      </div>
      <p className="mt-4 text-sm font-semibold text-muted-foreground animate-pulse tracking-widest uppercase">
        Initializing Rolevia...
      </p>
    </div>
  );
}
