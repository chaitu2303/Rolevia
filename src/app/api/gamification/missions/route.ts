import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { MissionEngine } from '@/lib/gamification/MissionEngine';

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        dailyMissions: {
          where: { missionDate: new Date().toISOString().slice(0, 10) },
          take: 1
        },
        streakRecord: true,
        xpRecord: true
      }
    });

    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    let todayMission = user.dailyMissions[0];
    if (!todayMission) {
      todayMission = await MissionEngine.generateDailyMissions(user.id);
    }

    return NextResponse.json({
      mission: todayMission,
      streak: user.streakRecord?.currentStreak || 0,
      xp: user.xpRecord?.totalXp || 0,
      level: user.xpRecord?.currentLevel || 1
    });

  } catch (error: any) {
    console.error('[GAMIFICATION_MISSIONS_ERROR]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
