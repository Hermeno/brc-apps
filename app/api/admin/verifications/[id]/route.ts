import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { createNotification } from '@/lib/notifications';
import { sendMail, verificationApprovedHtml, verificationRejectedHtml } from '@/lib/email';
import { logError } from '@/lib/logger';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const admin = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, role: true },
    });
    if (!admin || admin.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { id } = await params;
    const { action, note } = await req.json();

    if (action !== 'approve' && action !== 'reject') {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    const status = action === 'approve' ? 'APPROVED' : 'REJECTED';

    const verification = await prisma.cleanerVerification.update({
      where: { id },
      data: {
        status,
        adminNote:  note || null,
        reviewedBy: admin.id,
        reviewedAt: new Date(),
      },
    });

    const cleaner = await prisma.user.update({
      where: { id: verification.cleanerId },
      data: { isVerified: status === 'APPROVED' },
      select: { id: true, name: true, email: true },
    });

    const cleanerName = cleaner.name?.split(' ')[0] ?? 'there';

    if (status === 'APPROVED') {
      await createNotification({
        userId: cleaner.id,
        type: 'verification_approved',
        title: 'Documents approved!',
        body: 'Your identity documents have been verified. Your account is now fully active.',
        link: '/dashboard/cleaner',
      });
      sendMail({
        to: cleaner.email,
        subject: 'Your documents have been approved — BrazilianClean',
        html: verificationApprovedHtml(cleanerName),
      }).catch(e => console.error('[mail] verification approved:', e));
    } else {
      await createNotification({
        userId: cleaner.id,
        type: 'verification_rejected',
        title: 'Documents not approved',
        body: note ? `Reason: ${note}` : 'Your documents could not be verified. Please resubmit.',
        link: '/dashboard/cleaner/verify',
      });
      sendMail({
        to: cleaner.email,
        subject: 'Document verification update — BrazilianClean',
        html: verificationRejectedHtml(cleanerName, note),
      }).catch(e => console.error('[mail] verification rejected:', e));
    }

    return NextResponse.json({ verification });
  } catch (err: any) {
    logError('[PATCH /api/admin/verifications/[id]]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
