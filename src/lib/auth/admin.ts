import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export const OWNER_EMAIL = 'chaitanyakumarsahu00@gmail.com';

export type UserRole = 'USER' | 'ADMIN' | 'OWNER';

export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string | null;
  role: UserRole;
  isSuspended: boolean;
  subscription?: {
    plan: string;
    status: string;
    source: string;
    isActive: boolean;
  } | null;
}

/**
 * Resolves current session user from database and ensures proper role & entitlement.
 * Enforces database-backed OWNER grant for product owner account without fake payments.
 */
export async function getAuthenticatedUser(): Promise<AuthenticatedUser | null> {
  const session = await auth();
  if (!session?.user?.email) return null;

  const email = session.user.email.toLowerCase();

  let user = await prisma.user.findUnique({
    where: { email },
    include: { subscription: true }
  });

  if (!user) return null;

  // Auto-bootstrap Owner Account entitlement in DB
  if (email === OWNER_EMAIL.toLowerCase()) {
    let needsUpdate = false;
    let newRole = user.role;

    if (user.role !== 'OWNER') {
      newRole = 'OWNER';
      needsUpdate = true;
    }

    if (needsUpdate) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { role: 'OWNER' },
        include: { subscription: true }
      });
    }

    // Ensure PRO subscription with OWNER_GRANT source
    if (!user.subscription || user.subscription.plan !== 'PRO' || user.subscription.source !== 'OWNER_GRANT') {
      const updatedSub = await prisma.subscription.upsert({
        where: { userId: user.id },
        create: {
          userId: user.id,
          plan: 'PRO',
          status: 'ACTIVE',
          source: 'OWNER_GRANT',
          isActive: true
        },
        update: {
          plan: 'PRO',
          status: 'ACTIVE',
          source: 'OWNER_GRANT',
          isActive: true
        }
      });
      user.subscription = updatedSub;
    }
  }

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: (user.role as UserRole) || 'USER',
    isSuspended: user.isSuspended || false,
    subscription: user.subscription ? {
      plan: user.subscription.plan,
      status: user.subscription.status,
      source: user.subscription.source,
      isActive: user.subscription.isActive
    } : null
  };
}

/**
 * Server-side Admin check. Throws or returns 403 Response if not OWNER or ADMIN.
 */
export async function requireAdmin(): Promise<{ user: AuthenticatedUser } | { errorResponse: NextResponse }> {
  const user = await getAuthenticatedUser();

  if (!user) {
    return {
      errorResponse: NextResponse.json(
        { error: 'Unauthorized: Authentication required' },
        { status: 401 }
      )
    };
  }

  if (user.isSuspended) {
    return {
      errorResponse: NextResponse.json(
        { error: 'Forbidden: Account suspended' },
        { status: 403 }
      )
    };
  }

  if (user.role !== 'ADMIN' && user.role !== 'OWNER') {
    return {
      errorResponse: NextResponse.json(
        { error: 'Forbidden: Insufficient administrative privileges' },
        { status: 403 }
      )
    };
  }

  return { user };
}

/**
 * Server-side Owner check.
 */
export async function requireOwner(): Promise<{ user: AuthenticatedUser } | { errorResponse: NextResponse }> {
  const user = await getAuthenticatedUser();

  if (!user || user.role !== 'OWNER') {
    return {
      errorResponse: NextResponse.json(
        { error: 'Forbidden: Platform Owner authorization required' },
        { status: 403 }
      )
    };
  }

  return { user };
}

/**
 * Record administrative actions in the persistent database audit log.
 */
export async function logAdminAction(
  adminUserId: string,
  action: string,
  target: string,
  metadata?: Record<string, any>,
  result: string = 'SUCCESS'
) {
  try {
    await prisma.adminAuditLog.create({
      data: {
        adminUserId,
        action,
        target,
        metadata: metadata || {},
        result
      }
    });
  } catch (err) {
    console.error('[AdminAuditLog] Failed to record action:', err);
  }
}
