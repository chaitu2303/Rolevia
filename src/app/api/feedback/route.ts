import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth/admin';

export async function POST(req: Request) {
  try {
    const session = await auth();
    let userId: string | null = null;

    if (session?.user?.email) {
      const user = await prisma.user.findUnique({ where: { email: session.user.email } });
      if (user) userId = user.id;
    }

    const { feature, rating, comment } = await req.json();

    if (!feature || !rating) {
      return NextResponse.json({ error: 'Feature and rating are required' }, { status: 400 });
    }

    const feedback = await prisma.feedback.create({
      data: {
        userId,
        feature,
        rating,
        comment: comment || null
      }
    });

    return NextResponse.json({ success: true, feedback });
  } catch (error: any) {
    console.error('[Feedback POST Error]:', error);
    return NextResponse.json({ error: 'Failed to record feedback.' }, { status: 500 });
  }
}

export async function GET() {
  const authCheck = await requireAdmin();
  if ('errorResponse' in authCheck) {
    return authCheck.errorResponse;
  }

  try {
    const feedbacks = await prisma.feedback.findMany({
      take: 50,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            email: true,
            name: true
          }
        }
      }
    });

    return NextResponse.json({ success: true, feedbacks });
  } catch (error: any) {
    console.error('[Feedback GET Error]:', error);
    return NextResponse.json({ error: 'Failed to retrieve feedbacks.' }, { status: 500 });
  }
}
