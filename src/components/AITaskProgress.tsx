'use client';

import React from 'react';
import { Bot, CheckCircle2, Loader2, Circle, AlertCircle } from 'lucide-react';

export type TaskStatus = 'pending' | 'active' | 'success' | 'error';

export interface AITaskStep {
  id: string;
  label: string;
  status: TaskStatus;
}

interface AITaskProgressProps {
  title?: string;
  steps: AITaskStep[];
  currentStepId?: string;
}

export function AITaskProgress({ title = 'ROLEVIA INTELLIGENCE ENGINE', steps, currentStepId }: AITaskProgressProps) {
  return (
    <div className="bg-card border border-border/50 rounded-2xl p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border/50">
        <div className="relative">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Bot className="w-5 h-5 text-primary" />
          </div>
          {steps.some(s => s.status === 'active') && (
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="motion-safe:animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
            </span>
          )}
        </div>
        <div>
          <h3 className="font-bold text-foreground text-sm tracking-tight">{title}</h3>
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold mt-0.5">Processing Pipeline</p>
        </div>
      </div>

      <div className="space-y-4">
        {steps.map((step, index) => {
          const isActive = step.status === 'active' || step.id === currentStepId;
          const isSuccess = step.status === 'success';
          const isError = step.status === 'error';
          
          return (
            <div key={step.id} className="relative">
              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className={`absolute left-4 top-8 bottom-[-16px] w-0.5 ${isSuccess ? 'bg-primary' : 'bg-muted'}`} />
              )}
              
              <div className={`flex items-start gap-4 ${isActive ? 'opacity-100' : isSuccess ? 'opacity-90' : 'opacity-40'}`}>
                <div className="relative shrink-0 mt-0.5 z-10 bg-card">
                  {isSuccess ? (
                    <CheckCircle2 className="w-8 h-8 text-success fill-success/10" />
                  ) : isError ? (
                    <AlertCircle className="w-8 h-8 text-destructive fill-destructive/10" />
                  ) : isActive ? (
                    <div className="w-8 h-8 rounded-full border-2 border-primary flex items-center justify-center bg-card shadow-[0_0_10px_rgba(var(--primary),0.3)]">
                      <Loader2 className="w-4 h-4 text-primary animate-spin" />
                    </div>
                  ) : (
                    <Circle className="w-8 h-8 text-muted-foreground stroke-1" />
                  )}
                </div>
                
                <div className="flex-1 pt-1.5 pb-2">
                  <div className={`text-sm font-semibold ${isActive ? 'text-foreground' : isError ? 'text-destructive' : 'text-foreground'}`}>
                    {step.label}
                  </div>
                  {isActive && (
                    <div className="text-xs text-muted-foreground mt-1 motion-safe:animate-pulse">
                      Processing...
                    </div>
                  )}
                  {isError && (
                    <div className="text-xs text-destructive mt-1">
                      Failed. Click to retry.
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
