import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { requireAdmin, logAdminAction } from '@/lib/auth/admin';

export async function POST(req: Request) {
  try {
    const session = await auth();
    let userId: string | null = null;

    if (session?.user?.email) {
      const user = await prisma.user.findUnique({ where: { email: session.user.email } });
      if (user) userId = user.id;
    }

    const { feature, description, severity, screenshotUrl } = await req.json();

    if (!feature || !description) {
      return NextResponse.json({ error: 'Feature and description are required' }, { status: 400 });
    }

    const bug = await prisma.bugReport.create({
      data: {
        userId,
        feature,
        description,
        severity: severity || 'MEDIUM',
        screenshotUrl: screenshotUrl || null
      }
    });

    return NextResponse.json({ success: true, bug });
  } catch (error: any) {
    console.error('[Bugs POST Error]:', error);
    return NextResponse.json({ error: 'Failed to submit bug report.' }, { status: 500 });
  }
}

export async function GET() {
  const authCheck = await requireAdmin();
  if ('errorResponse' in authCheck) {
    return authCheck.errorResponse;
  }

  try {
    const bugs = await prisma.bugReport.findMany({
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

    return NextResponse.json({ success: true, bugs });
  } catch (error: any) {
    console.error('[Bugs GET Error]:', error);
    return NextResponse.json({ error: 'Failed to retrieve bug reports.' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const authCheck = await requireAdmin();
  if ('errorResponse' in authCheck) {
    return authCheck.errorResponse;
  }

  try {
    const { id, status } = await req.json();

    if (!id || !status) {
      return NextResponse.json({ error: 'Bug ID and new status are required' }, { status: 400 });
    }

    const updated = await prisma.bugReport.update({
      where: { id },
      data: { status }
    });

    await logAdminAction(authCheck.user.id, 'BUG_STATUS_UPDATED', `Bug #${id}`, { status });

    return NextResponse.json({ success: true, bug: updated });
  } catch (error: any) {
    console.error('[Bugs PATCH Error]:', error);
    return NextResponse.json({ error: 'Failed to update bug report status.' }, { status: 500 });
  }
}
