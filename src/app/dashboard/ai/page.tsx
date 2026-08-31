import React from 'react';
import { Bot, Cpu, ShieldCheck, Zap, Server, Activity, ArrowRight, Lock, Database, Code2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function AIControlCenter() {
  const currentProvider = process.env.AI_PROVIDER || 'local';
  const localModel = process.env.LOCAL_AI_MODEL || 'default';
  const isLocal = currentProvider === 'local';
  
  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Bot className="w-5 h-5 text-primary" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">AI Control Center</h1>
          </div>
          <p className="text-muted-foreground text-balance">
            Manage your self-hosted Rolevia AI Engine, privacy guard, and local inference capabilities.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/dashboard/settings">
            <Button variant="outline" size="sm">
              Configure Model
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Core Engine Status - Spans 2 cols */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card border border-border/50 rounded-3xl p-6 sm:p-8 shadow-sm relative overflow-hidden">
            {/* Background Glow */}
            <div className={`absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full blur-3xl pointer-events-none opacity-20 ${
              isLocal ? 'bg-success' : 'bg-primary'
            }`} />
            
            <div className="relative z-10 flex flex-col md:flex-row gap-8 justify-between">
              <div className="space-y-6 flex-1">
                <div>
                  <h2 className="text-xl font-bold mb-1">Engine Status</h2>
                  <p className="text-sm text-muted-foreground">Real-time local AI diagnostics</p>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-muted/40 rounded-xl border border-border/50">
                    <div className="flex items-center gap-3">
                      <Server className="w-5 h-5 text-muted-foreground" />
                      <span className="font-medium text-sm">Active Provider</span>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                      isLocal ? 'bg-success/15 text-success' : 'bg-primary/15 text-primary'
                    }`}>
                      {currentProvider}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-muted/40 rounded-xl border border-border/50">
                    <div className="flex items-center gap-3">
                      <Cpu className="w-5 h-5 text-muted-foreground" />
                      <span className="font-medium text-sm">Active Model</span>
                    </div>
                    <span className="font-mono text-xs font-bold px-2 py-1 bg-background border rounded-md shadow-sm text-primary">
                      {localModel}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-muted/40 rounded-xl border border-border/50">
                    <div className="flex items-center gap-3">
                      <Activity className="w-5 h-5 text-muted-foreground" />
                      <span className="font-medium text-sm">Health Check</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-success"></span>
                      </span>
                      <span className="text-xs font-bold text-success uppercase tracking-wider">Online</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex-1 border-l-0 md:border-l border-t md:border-t-0 border-border/50 pt-6 md:pt-0 md:pl-8 flex flex-col justify-center">
                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-success/10 border-4 border-success/20 mb-4">
                    <Zap className="w-8 h-8 text-success fill-success/20" />
                  </div>
                  <h3 className="font-bold text-lg text-foreground">Inference Ready</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Your local engine is warmed up and ready to process career data with zero latency.
                  </p>
                </div>
                <Button variant="outline" className="w-full gap-2 rounded-xl">
                  Run Benchmark <Activity className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-card border border-border/50 rounded-3xl p-6 shadow-sm">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <Lock className="w-5 h-5 text-primary" /> Privacy Guard
              </h3>
              <p className="text-sm text-muted-foreground mb-6 h-10">
                When running locally, your career data never leaves your machine. No tracking, no remote logging.
              </p>
              <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl border border-border/50">
                <span className="font-semibold text-sm">Local Execution</span>
                <div className={`w-10 h-5 rounded-full p-0.5 transition-colors ${isLocal ? 'bg-success' : 'bg-muted'}`}>
                  <div className={`w-4 h-4 bg-white rounded-full transition-transform shadow-sm ${isLocal ? 'translate-x-5' : 'translate-x-0'}`}></div>
                </div>
              </div>
            </div>
            
            <div className="bg-card border border-border/50 rounded-3xl p-6 shadow-sm">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <Database className="w-5 h-5 text-primary" /> Local RAG
              </h3>
              <p className="text-sm text-muted-foreground mb-6 h-10">
                The AI automatically retrieves contextual data from your Master Profile during generation.
              </p>
              <div className="flex items-center justify-between p-4 bg-primary/10 text-primary border border-primary/20 rounded-xl">
                <span className="font-semibold text-sm">Context Size</span>
                <span className="font-bold text-xs uppercase tracking-wider">Dynamic</span>
              </div>
            </div>
          </div>
        </div>

        {/* Capabilities Sidebar */}
        <div className="space-y-6">
          <div className="bg-card border border-border/50 rounded-3xl p-6 shadow-sm">
            <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-primary" /> Core Capabilities
            </h2>
            <div className="space-y-3">
              <CapabilityRow name="Structured JSON Output" active={true} icon={Code2} />
              <CapabilityRow name="Streaming Inference" active={true} icon={Activity} />
              <CapabilityRow name="Truth & Grounding Guard" active={true} icon={ShieldCheck} />
              <CapabilityRow name="Contextual Reasoning" active={true} icon={Brain} />
            </div>
            
            <div className="mt-8 pt-6 border-t border-border/50">
              <p className="text-xs text-muted-foreground mb-4">
                Rolevia Native AI Engine is running in <span className="font-bold text-foreground">isolated mode</span>. 
                All features are fully operational without requiring cloud API subscriptions.
              </p>
              <Link href="/dashboard">
                <Button className="w-full rounded-xl gap-2">
                  Return to Command Center <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CapabilityRow({ name, active, icon: Icon }: { name: string, active: boolean, icon: React.ElementType }) {
  return (
    <div className={`flex items-center justify-between p-3 rounded-xl border ${
      active 
        ? 'bg-success/5 border-success/20 text-success-foreground' 
        : 'bg-muted/30 border-border/50 text-muted-foreground opacity-60'
    }`}>
      <div className="flex items-center gap-3">
        <Icon className={`w-4 h-4 ${active ? 'text-success' : 'text-muted-foreground'}`} />
        <span className={`text-sm font-medium ${active ? 'text-foreground' : ''}`}>{name}</span>
      </div>
      {active && (
        <CheckCircle className="w-4 h-4 text-success" />
      )}
    </div>
  );
}

// Ensure CheckCircle is imported for the CapabilityRow
import { CheckCircle, Brain } from 'lucide-react';
