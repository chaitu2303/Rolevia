import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { taskId, type } = await req.json();

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        dailyMissions: {
          where: { missionDate: new Date().toISOString().slice(0, 10) },
          take: 1
        },
        xpRecord: true
      }
    });

    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const todayMission = user.dailyMissions[0];
    if (!todayMission) {
      return NextResponse.json({ error: 'No missions found for today' }, { status: 404 });
    }

    let tasks = todayMission.tasks as Array<{ id: string; label: string; completed: boolean; type: string }>;
    
    let targetTask = null;
    if (taskId) {
       targetTask = tasks.find(t => t.id === taskId);
    } else if (type) {
       targetTask = tasks.find(t => t.type === type && !t.completed);
    }

    if (!targetTask) {
      return NextResponse.json({ error: 'Task not found or already completed' }, { status: 400 });
    }

    if (targetTask.completed) {
      return NextResponse.json({ message: 'Task already completed' }, { status: 200 });
    }

    // Mark as completed
    targetTask.completed = true;
    const allCompleted = tasks.every(t => t.completed);

    await prisma.dailyMission.update({
      where: { id: todayMission.id },
      data: {
        tasks: tasks as any,
        isCompleted: allCompleted
      }
    });

    // Grant XP
    let xpRecord = user.xpRecord;
    if (!xpRecord) {
       xpRecord = await prisma.xpRecord.create({
         data: { userId: user.id, totalXp: 0, currentLevel: 1 }
       });
    }

    const xpEarned = allCompleted ? 150 : 50; // Bonus for completing all
    const newTotalXp = xpRecord.totalXp + xpEarned;
    const newLevel = Math.max(1, Math.floor(newTotalXp / 1000) + 1);

    await prisma.xpRecord.update({
      where: { id: xpRecord.id },
      data: {
        totalXp: newTotalXp,
        currentLevel: newLevel
      }
    });

    await prisma.xpEvent.create({
      data: {
        xpRecordId: xpRecord.id,
        activity: `Completed Daily Mission: ${targetTask.label}`,
        xpEarned,
      }
    });

    return NextResponse.json({ 
      success: true, 
      xpEarned, 
      newTotalXp, 
      newLevel, 
      allCompleted 
    });

  } catch (error: any) {
    console.error('[GAMIFICATION_CLAIM_ERROR]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
