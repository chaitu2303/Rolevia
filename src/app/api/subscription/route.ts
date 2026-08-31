import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let sub = await prisma.subscription.findUnique({
      where: { userId: session.user.id }
    });

    if (!sub) {
      sub = await prisma.subscription.create({
        data: {
          userId: session.user.id,
          plan: 'FREE',
          isActive: true
        }
      });
    }

    return NextResponse.json(sub);
  } catch (error: any) {
    console.error('[GET /api/subscription]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { plan } = await req.json();
    if (!['FREE', 'LAUNCH', 'CAREER', 'PRO'].includes(plan)) {
      return NextResponse.json({ error: 'Invalid plan name' }, { status: 400 });
    }

    const sub = await prisma.subscription.upsert({
      where: { userId: session.user.id },
      update: {
        plan,
        isActive: true,
        startDate: new Date()
      },
      create: {
        userId: session.user.id,
        plan,
        isActive: true,
        startDate: new Date()
      }
    });

    // Log action to UsageLedger
    await prisma.usageLedger.create({
      data: {
        userId: session.user.id,
        feature: 'SUBSCRIPTION_CHANGE',
        actionType: 'SUBSCRIPTION_CHANGE',
        metadata: { action: 'SUBSCRIPTION_CHANGE', plan }
      }
    });

    return NextResponse.json(sub);
  } catch (error: any) {
    console.error('[POST /api/subscription]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
