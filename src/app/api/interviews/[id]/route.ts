import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request, context: any) {
  try {
    const session = await auth();
    const user = session?.user;
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const params = await context.params;
    const sessionId = params.id as string;

    const interviewSession = await prisma.interviewSession.findUnique({
      where: { id: sessionId }
    });

    if (!interviewSession) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    if (interviewSession.userId !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Fetch past completed sessions for comparison
    const history = await prisma.interviewSession.findMany({
      where: {
        userId: user.id,
        status: 'COMPLETED',
        id: { not: sessionId }
      },
      orderBy: { createdAt: 'desc' },
      take: 5
    });

    return NextResponse.json({
      session: interviewSession,
      history
    });
  } catch (error: any) {
    console.error('[GET /api/interviews/[id]]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
