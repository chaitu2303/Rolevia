import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { passphrase } = body;

    const correctPassphrase = process.env.ADMIN_SETUP_SECRET;

    if (!correctPassphrase || passphrase !== correctPassphrase) {
      return NextResponse.json({ error: 'Invalid passphrase' }, { status: 403 });
    }

    // Upgrade the user to ADMIN
    await prisma.user.update({
      where: { id: session.user.id },
      data: { role: 'ADMIN' },
    });

    return NextResponse.json({ success: true, message: 'Account upgraded to ADMIN' });
  } catch (error) {
    console.error('[Admin Setup Error]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
