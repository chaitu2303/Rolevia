'use client';

import { motion } from 'framer-motion';
import { getScoreLabel, getScoreColor } from '@/lib/intelligence/scoring.config';

interface ScoreCardProps {
  label: string;
  score: number | null;
  subtitle?: string;
  size?: 'sm' | 'md' | 'lg';
  animate?: boolean;
  showNA?: boolean; // show N/A when score is null
}

function RadialGauge({ score, size = 'md', color }: {
  score: number;
  size: 'sm' | 'md' | 'lg';
  color: 'success' | 'warning' | 'destructive';
}) {
  const sizes = { sm: 64, md: 96, lg: 140 };
  const px = sizes[size];
  const strokeWidth = size === 'lg' ? 10 : 7;
  const radius = (px - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (score / 100) * circumference * 0.75;
  const startAngle = 135; // degrees — start from bottom-left

  const colorMap = {
    success: 'stroke-success',
    warning: 'stroke-warning',
    destructive: 'stroke-destructive',
  };

  const fontSizes = { sm: 'text-lg', md: 'text-2xl', lg: 'text-4xl' };

  return (
    <div className="relative" style={{ width: px, height: px }}>
      <svg
        width={px}
        height={px}
        viewBox={`0 0 ${px} ${px}`}
        className="-rotate-[135deg]"
      >
        {/* Background track */}
        <circle
          cx={px / 2}
          cy={px / 2}
          r={radius}
          fill="none"
          className="stroke-muted"
          strokeWidth={strokeWidth}
          strokeDasharray={`${circumference * 0.75} ${circumference}`}
          strokeLinecap="round"
        />
        {/* Animated progress */}
        <motion.circle
          cx={px / 2}
          cy={px / 2}
          r={radius}
          fill="none"
          className={colorMap[color]}
          strokeWidth={strokeWidth}
          strokeDasharray={`${circumference * 0.75} ${circumference}`}
          strokeLinecap="round"
          initial={{ strokeDashoffset: circumference * 0.75 }}
          animate={{ strokeDashoffset: dashOffset }}
          transition={{ duration: 1.2, ease: 'easeOut', delay: 0.2 }}
        />
      </svg>
      {/* Score label centered */}
      <div className="absolute inset-0 flex items-center justify-center mt-2">
        <span className={`font-black tabular-nums ${fontSizes[size]} text-foreground`}>
          {score}
        </span>
      </div>
    </div>
  );
}

export function ScoreCard({
  label,
  score,
  subtitle,
  size = 'md',
  animate = true,
  showNA = true,
}: ScoreCardProps) {
  if (score === null) {
    if (!showNA) return null;
    return (
      <div className="flex flex-col items-center gap-2 rounded-2xl border border-border bg-card p-5 opacity-60">
        <div className="w-16 h-16 rounded-full border-2 border-dashed border-border flex items-center justify-center">
          <span className="text-sm font-semibold text-muted-foreground">N/A</span>
        </div>
        <span className="text-sm font-medium text-muted-foreground">{label}</span>
        <span className="text-xs text-muted-foreground/60">Requires job description</span>
      </div>
    );
  }

  const color = getScoreColor(score);
  const label2 = getScoreLabel(score);

  const borderColors = {
    success: 'border-success/30 hover:border-success/60',
    warning: 'border-warning/30 hover:border-warning/60',
    destructive: 'border-destructive/30 hover:border-destructive/60',
  };

  const bgColors = {
    success: 'bg-success/5',
    warning: 'bg-warning/5',
    destructive: 'bg-destructive/5',
  };

  return (
    <motion.div
      initial={animate ? { opacity: 0, y: 20 } : {}}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`
        flex flex-col items-center gap-3 rounded-2xl border p-5 transition-all duration-200
        ${borderColors[color]} ${bgColors[color]}
      `}
    >
      <RadialGauge score={score} size={size} color={color} />
      <div className="text-center space-y-0.5">
        <p className="font-semibold text-foreground text-sm">{label}</p>
        <p className={`text-xs font-medium ${
          color === 'success' ? 'text-success' :
          color === 'warning' ? 'text-warning-foreground' :
          'text-destructive'
        }`}>{label2}</p>
        {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
      </div>
    </motion.div>
  );
}

interface ScoreDashboardProps {
  careerOsScore: number;
  atsScore: number;
  contentScore: number;
  impactScore: number;
  jobMatchScore: number | null;
  recruiterScore: number;
  consistencyScore?: number;
}

export function ScoreDashboard({
  careerOsScore,
  atsScore,
  contentScore,
  impactScore,
  jobMatchScore,
  recruiterScore,
  consistencyScore,
}: ScoreDashboardProps) {
  return (
    <div className="space-y-6">
      {/* Hero score */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center gap-4 rounded-3xl border border-border bg-gradient-to-b from-card to-muted/30 p-8 shadow-sm"
      >
        <div className="text-center space-y-1">
          <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Rolevia Resume Score</p>
          <p className="text-xs text-muted-foreground">Overall candidate readiness out of 100</p>
        </div>
        <RadialGauge score={careerOsScore} size="lg" color={getScoreColor(careerOsScore)} />
        <div className="text-center space-y-1">
          <p className="text-lg font-bold text-foreground">{getScoreLabel(careerOsScore)}</p>
          <p className="text-sm text-muted-foreground">{careerOsScore} / 100</p>
        </div>
      </motion.div>

      {/* Dimension scores */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <ScoreCard
          label="ATS Compatibility"
          score={atsScore}
          subtitle="File & layout check"
          size="sm"
        />
        <ScoreCard
          label="Career Evidence"
          score={impactScore}
          subtitle="Impact & bullets"
          size="sm"
        />
        <ScoreCard
          label="Job Match"
          score={jobMatchScore}
          subtitle="Keyword overlap"
          size="sm"
          showNA={true}
        />
        <ScoreCard
          label="Recruiter Readiness"
          score={recruiterScore}
          subtitle="Professional signal"
          size="sm"
        />
        <ScoreCard
          label="Content Quality"
          score={contentScore}
          subtitle="Sections completeness"
          size="sm"
        />
        {consistencyScore !== undefined && (
          <ScoreCard
            label="Consistency"
            score={consistencyScore}
            subtitle="Format alignment"
            size="sm"
          />
        )}
      </div>
    </div>
  );
}
