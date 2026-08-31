export interface InterviewSessionMetadata {
  sessionId: string;
  date: Date;
  score: number;
  type: 'HR' | 'TECHNICAL' | 'BEHAVIORAL' | 'RESUME';
  strengths: string[];
  weaknesses: string[];
  mistakes: string[];
}

export interface InterviewMemoryProfile {
  totalSessions: number;
  averageScore: number;
  scoreTrend: 'IMPROVING' | 'DECLINING' | 'STABLE' | 'NOT_ENOUGH_DATA';
  persistentWeaknesses: string[];
  persistentMistakes: string[];
  topStrengths: string[];
  recommendedFocusAreas: string[];
}

export function synthesizeInterviewMemory(sessions: InterviewSessionMetadata[]): InterviewMemoryProfile {
  if (sessions.length === 0) {
    return {
      totalSessions: 0,
      averageScore: 0,
      scoreTrend: 'NOT_ENOUGH_DATA',
      persistentWeaknesses: [],
      persistentMistakes: [],
      topStrengths: [],
      recommendedFocusAreas: ['Start your first mock interview to get baseline metrics.']
    };
  }

  // Sort sessions by date (oldest to newest)
  const sorted = [...sessions].sort((a, b) => a.date.getTime() - b.date.getTime());
  
  const totalScore = sorted.reduce((sum, s) => sum + s.score, 0);
  const averageScore = Math.round(totalScore / sorted.length);

  let scoreTrend: InterviewMemoryProfile['scoreTrend'] = 'STABLE';
  if (sorted.length >= 3) {
    const firstHalfAvg = sorted.slice(0, Math.floor(sorted.length / 2)).reduce((sum, s) => sum + s.score, 0) / Math.floor(sorted.length / 2);
    const secondHalfAvg = sorted.slice(Math.floor(sorted.length / 2)).reduce((sum, s) => sum + s.score, 0) / Math.ceil(sorted.length / 2);
    if (secondHalfAvg > firstHalfAvg + 5) scoreTrend = 'IMPROVING';
    else if (secondHalfAvg < firstHalfAvg - 5) scoreTrend = 'DECLINING';
  } else {
    scoreTrend = 'NOT_ENOUGH_DATA';
  }

  // Aggregate weaknesses and mistakes
  const weaknessCounts: Record<string, number> = {};
  const mistakeCounts: Record<string, number> = {};
  const strengthCounts: Record<string, number> = {};

  sorted.forEach(s => {
    s.weaknesses.forEach(w => weaknessCounts[w] = (weaknessCounts[w] || 0) + 1);
    s.mistakes.forEach(m => mistakeCounts[m] = (mistakeCounts[m] || 0) + 1);
    s.strengths.forEach(st => strengthCounts[st] = (strengthCounts[st] || 0) + 1);
  });

  const persistentWeaknesses = Object.entries(weaknessCounts)
    .filter(([_, count]) => count > 1)
    .sort((a, b) => b[1] - a[1])
    .map(([w]) => w);

  const persistentMistakes = Object.entries(mistakeCounts)
    .filter(([_, count]) => count > 1)
    .sort((a, b) => b[1] - a[1])
    .map(([m]) => m);

  const topStrengths = Object.entries(strengthCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([s]) => s);

  const recommendedFocusAreas = [
    ...persistentWeaknesses.slice(0, 2),
    ...persistentMistakes.slice(0, 1)
  ];

  if (recommendedFocusAreas.length === 0 && averageScore < 70) {
    recommendedFocusAreas.push('General communication and structure');
  }

  return {
    totalSessions: sorted.length,
    averageScore,
    scoreTrend,
    persistentWeaknesses,
    persistentMistakes,
    topStrengths,
    recommendedFocusAreas
  };
}
