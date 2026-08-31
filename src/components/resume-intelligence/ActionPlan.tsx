'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Circle, AlertCircle } from 'lucide-react';
import type { ActionItem } from '@/lib/intelligence/ActionPlanEngine';

interface ActionPlanProps {
  items: ActionItem[];
  criticalCount: number;
  highCount: number;
  totalCount: number;
  summary: string;
}

const PRIORITY_COLORS = {
  P0: { bg: 'bg-destructive/10', border: 'border-destructive/25', dot: 'bg-destructive', text: 'text-destructive' },
  P1: { bg: 'bg-warning/10', border: 'border-warning/25', dot: 'bg-warning', text: 'text-warning-foreground' },
  P2: { bg: 'bg-info/10', border: 'border-info/25', dot: 'bg-info', text: 'text-info-foreground' },
  P3: { bg: 'bg-muted/50', border: 'border-border', dot: 'bg-muted-foreground', text: 'text-muted-foreground' },
};

function ActionItemRow({ item, onToggle }: { item: ActionItem & { done: boolean }; onToggle: (id: string) => void }) {
  const colors = PRIORITY_COLORS[item.priority];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: item.done ? 0.5 : 1, y: 0 }}
      className={`rounded-xl border p-4 space-y-2 ${colors.bg} ${colors.border} ${item.done ? 'opacity-50' : ''}`}
    >
      <div className="flex items-start gap-3">
        <button
          onClick={() => onToggle(item.id)}
          className="flex-shrink-0 mt-0.5 transition-colors"
          title={item.done ? 'Mark undone' : 'Mark done'}
        >
          {item.done
            ? <CheckCircle2 className="w-5 h-5 text-success" />
            : <Circle className="w-5 h-5 text-muted-foreground hover:text-foreground" />
          }
        </button>

        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <div className={`w-2 h-2 rounded-full flex-shrink-0 ${colors.dot}`} />
            <span className={`text-xs font-semibold ${colors.text}`}>{item.priorityLabel}</span>
            <span className="text-xs text-muted-foreground">·</span>
            <span className="text-xs text-muted-foreground capitalize">{item.dimension}</span>
          </div>

          <p className={`font-medium text-sm text-foreground ${item.done ? 'line-through' : ''}`}>
            {item.title}
          </p>

          <p className="text-xs text-muted-foreground font-mono bg-muted/50 rounded px-2 py-1 leading-relaxed">
            {item.evidence}
          </p>

          <p className="text-sm text-foreground/80">{item.recommendation}</p>

          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
              {item.estimatedImpact}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export function ActionPlan({ items, criticalCount, highCount, totalCount, summary }: ActionPlanProps) {
  const [doneItems, setDoneItems] = useState<Set<string>>(new Set());
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'P0' | 'P1' | 'P2' | 'P3'>('all');

  const toggleDone = (id: string) => {
    setDoneItems(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const enriched = items.map(i => ({ ...i, done: doneItems.has(i.id) }));
  const filtered = enriched.filter(i => priorityFilter === 'all' || i.priority === priorityFilter);
  const doneCount = doneItems.size;

  const progress = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;

  return (
    <div className="space-y-5">
      {/* Summary card */}
      <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-foreground">Action Plan</h3>
          <span className="text-sm text-muted-foreground">{doneCount}/{totalCount} done</span>
        </div>

        {/* Progress bar */}
        <div className="h-2 rounded-full bg-muted overflow-hidden">
          <motion.div
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4 }}
            className="h-full bg-success rounded-full"
          />
        </div>

        <p className="text-sm text-muted-foreground">{summary}</p>

        <div className="flex items-center gap-2 flex-wrap">
          {criticalCount > 0 && (
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-destructive/10 text-destructive">
              {criticalCount} critical
            </span>
          )}
          {highCount > 0 && (
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-warning/10 text-warning-foreground">
              {highCount} high impact
            </span>
          )}
        </div>
      </div>

      {/* Priority filter */}
      <div className="flex rounded-xl border border-border overflow-hidden">
        {(['all', 'P0', 'P1', 'P2', 'P3'] as const).map(p => (
          <button
            key={p}
            onClick={() => setPriorityFilter(p)}
            className={`flex-1 py-2 text-xs font-medium transition-colors ${
              priorityFilter === p ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {p === 'all' ? 'All' : p}
          </button>
        ))}
      </div>

      {/* Items */}
      <motion.div layout className="space-y-3">
        {filtered.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">
            {doneCount === totalCount ? '🎉 All items completed!' : 'No items in this category.'}
          </p>
        ) : (
          filtered.map(item => (
            <ActionItemRow key={item.id} item={item} onToggle={toggleDone} />
          ))
        )}
      </motion.div>
    </div>
  );
}
