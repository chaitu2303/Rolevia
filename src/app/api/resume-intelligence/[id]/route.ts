/**
 * GET /api/resume-intelligence/[id]
 * Load a saved intelligence report by ID (ownership verified).
 */

import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    const authUser = session?.user;
    if (!authUser?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const dbUser = await prisma.user.findUnique({ where: { email: authUser.email } });
    if (!dbUser) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const report = await prisma.resumeIntelligenceReport.findFirst({
      where: { id, userId: dbUser.id },
      include: {
        bulletAnalyses: { orderBy: { bulletIndex: 'asc' } },
      },
    });

    if (!report) return NextResponse.json({ error: 'Report not found' }, { status: 404 });

    return NextResponse.json({ report });
  } catch (err) {
    console.error('[GET /api/resume-intelligence/[id]]', err);
    return NextResponse.json({ error: 'Failed to load report' }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    const authUser = session?.user;
    if (!authUser?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const dbUser = await prisma.user.findUnique({ where: { email: authUser.email } });
    if (!dbUser) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const body = await req.json();
    const { label, status } = body;

    const existing = await prisma.resumeIntelligenceReport.findFirst({
      where: { id, userId: dbUser.id },
    });
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const updated = await prisma.resumeIntelligenceReport.update({
      where: { id },
      data: {
        ...(label !== undefined && { label }),
        ...(status !== undefined && { status }),
      },
    });

    return NextResponse.json({ ok: true, report: updated });
  } catch (err) {
    console.error('[PATCH /api/resume-intelligence/[id]]', err);
    return NextResponse.json({ error: 'Failed to update report' }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    const authUser = session?.user;
    if (!authUser?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const dbUser = await prisma.user.findUnique({ where: { email: authUser.email } });
    if (!dbUser) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    await prisma.resumeIntelligenceReport.deleteMany({
      where: { id, userId: dbUser.id },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[DELETE /api/resume-intelligence/[id]]', err);
    return NextResponse.json({ error: 'Failed to delete report' }, { status: 500 });
  }
}
