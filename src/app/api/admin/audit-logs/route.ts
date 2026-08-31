import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/admin';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const authCheck = await requireAdmin();
  if ('errorResponse' in authCheck) {
    return authCheck.errorResponse;
  }

  try {
    const logs = await prisma.adminAuditLog.findMany({
      take: 100,
      orderBy: { timestamp: 'desc' },
      include: {
        adminUser: {
          select: {
            email: true,
            name: true,
            role: true
          }
        }
      }
    });

    return NextResponse.json({ success: true, logs });
  } catch (error: any) {
    console.error('[Admin Audit Logs Error]:', error);
    return NextResponse.json({ error: 'Failed to retrieve audit logs.' }, { status: 500 });
  }
}
