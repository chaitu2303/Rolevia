import { NextResponse } from 'next/server';
import { requireAdmin, requireOwner, logAdminAction } from '@/lib/auth/admin';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  const authCheck = await requireAdmin();
  if ('errorResponse' in authCheck) {
    return authCheck.errorResponse;
  }

  const { searchParams } = new URL(req.url);
  const query = searchParams.get('q') || '';
  const roleFilter = searchParams.get('role');

  try {
    const users = await prisma.user.findMany({
      where: {
        AND: [
          query ? {
            OR: [
              { email: { contains: query, mode: 'insensitive' } },
              { name: { contains: query, mode: 'insensitive' } }
            ]
          } : {},
          roleFilter ? { role: roleFilter } : {}
        ]
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isSuspended: true,
        createdAt: true,
        subscription: {
          select: {
            plan: true,
            status: true,
            source: true,
            isActive: true
          }
        },
        _count: {
          select: {
            resumes: true,
            applications: true,
            intelligenceReports: true,
            interviewSessions: true,
            codingSubmissions: true
          }
        }
      },
      take: 50,
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ success: true, users });
  } catch (error: any) {
    console.error('[Admin Users GET Error]:', error);
    return NextResponse.json({ error: 'Failed to search users.' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const authCheck = await requireAdmin();
  if ('errorResponse' in authCheck) {
    return authCheck.errorResponse;
  }

  const admin = authCheck.user;

  try {
    const body = await req.json();
    const { targetUserId, action, plan, role } = body;

    if (!targetUserId) {
      return NextResponse.json({ error: 'targetUserId is required' }, { status: 400 });
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
      include: { subscription: true }
    });

    if (!targetUser) {
      return NextResponse.json({ error: 'Target user not found' }, { status: 404 });
    }

    // Role escalation protection: Only OWNER can change roles or modify another ADMIN/OWNER
    if (action === 'CHANGE_ROLE') {
      if (admin.role !== 'OWNER') {
        return NextResponse.json(
          { error: 'Forbidden: Only the Platform Owner can assign or modify administrative roles.' },
          { status: 403 }
        );
      }

      await prisma.user.update({
        where: { id: targetUserId },
        data: { role }
      });

      await logAdminAction(admin.id, 'ROLE_UPDATED', targetUser.email, { oldRole: targetUser.role, newRole: role });

      return NextResponse.json({ success: true, message: `Role updated to ${role}` });
    }

    // Suspend / Restore Account
    if (action === 'SUSPEND' || action === 'RESTORE') {
      const isSuspended = action === 'SUSPEND';

      // Cannot suspend the owner
      if (targetUser.role === 'OWNER') {
        return NextResponse.json({ error: 'Cannot suspend the Platform Owner account.' }, { status: 400 });
      }

      await prisma.user.update({
        where: { id: targetUserId },
        data: { isSuspended }
      });

      await logAdminAction(admin.id, isSuspended ? 'USER_SUSPENDED' : 'USER_RESTORED', targetUser.email);

      return NextResponse.json({ success: true, isSuspended });
    }

    // Grant or Update Plan Entitlement
    if (action === 'GRANT_PLAN') {
      const updatedSub = await prisma.subscription.upsert({
        where: { userId: targetUserId },
        create: {
          userId: targetUserId,
          plan: plan || 'CAREER',
          status: 'ACTIVE',
          source: admin.role === 'OWNER' ? 'OWNER_GRANT' : 'ADMIN_GRANT',
          isActive: true
        },
        update: {
          plan: plan || 'CAREER',
          status: 'ACTIVE',
          source: admin.role === 'OWNER' ? 'OWNER_GRANT' : 'ADMIN_GRANT',
          isActive: true
        }
      });

      await logAdminAction(admin.id, 'PLAN_GRANTED', targetUser.email, {
        plan,
        source: updatedSub.source
      });

      return NextResponse.json({ success: true, subscription: updatedSub });
    }

    return NextResponse.json({ error: 'Invalid action specified' }, { status: 400 });
  } catch (error: any) {
    console.error('[Admin Users POST Error]:', error);
    return NextResponse.json({ error: 'Failed to execute user action.' }, { status: 500 });
  }
}
