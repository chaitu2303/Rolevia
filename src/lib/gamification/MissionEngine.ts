import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

import { isAiAvailable } from '@/lib/ai/gateway';

export class MissionEngine {
  static async generateDailyMissions(userId: string) {
    const todayStr = new Date().toISOString().split('T')[0];
    
    // Check if missions already exist for today
    const existing = await prisma.dailyMission.findUnique({
      where: {
        userId_missionDate: {
          userId,
          missionDate: todayStr
        }
      }
    });

    if (existing) return existing;

    // Capability check mapping
    const hasSecureCodeExecution = true; 
    const hasAiProvider = isAiAvailable();

    const tasks = [
      { id: crypto.randomUUID(), label: 'Complete 1 Aptitude Assessment', type: 'ASSESSMENT', completed: false, status: 'AVAILABLE' }
    ];

    if (hasSecureCodeExecution) {
      tasks.push({ id: crypto.randomUUID(), label: 'Solve 1 Coding Problem', type: 'CODING', completed: false, status: 'AVAILABLE' });
    } else {
      // Don't assign a mission requiring an unavailable provider
      tasks.push({ id: crypto.randomUUID(), label: 'Tailor your Resume', type: 'RESUME_IMPROVED', completed: false, status: 'AVAILABLE' });
    }

    if (hasAiProvider) {
      tasks.push({ id: crypto.randomUUID(), label: 'Complete 1 Mock Interview', type: 'INTERVIEW', completed: false, status: 'AVAILABLE' });
    } else {
      tasks.push({ id: crypto.randomUUID(), label: 'Review your ATS Report', type: 'ATS_IMPROVED', completed: false, status: 'AVAILABLE' });
    }

    return await prisma.dailyMission.create({
      data: {
        userId,
        missionDate: todayStr,
        tasks,
        isCompleted: false
      }
    });
  }
}
