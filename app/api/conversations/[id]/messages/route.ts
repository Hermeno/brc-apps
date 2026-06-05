import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createNotification } from '@/lib/notifications';
import { NextRequest, NextResponse } from 'next/server';

type Params = { params: Promise<{ id: string }> };

// GET /api/conversations/[id]/messages
export async function GET(_req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;

  const conversation = await prisma.conversation.findUnique({
    where: { id },
    include: {
      messages: {
        orderBy: { createdAt: 'asc' },
        include: { sender: { select: { name: true, role: true } } },
      },
      lead:    { select: { serviceType: true, address: true, dateTime: true, status: true, estimatedMinPrice: true, estimatedMaxPrice: true, estimatedHours: true, isInstantBook: true, clientPhone: true } },
      client:  { select: { id: true, name: true, phone: true } },
      cleaner: { select: { id: true, name: true } },
    },
  });

  if (!conversation) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  // Access control: only client or cleaner of this conversation
  if (conversation.clientId !== user.id && conversation.cleanerId !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const isCleaner  = conversation.cleanerId === user.id;
  const isDeclined = conversation.status === 'declined';
  const feePaid    = conversation.feeStatus === 'charged' || conversation.feeStatus === 'waived';

  // Strip client contact until fee is paid; never gate a declined conversation
  const safeConversation = isCleaner && !feePaid && !isDeclined
    ? {
        ...conversation,
        client: { id: conversation.client.id, name: conversation.client.name, phone: null },
        lead:   { ...conversation.lead, clientPhone: null },
        messages: [],
      }
    : conversation;

  return NextResponse.json({
    conversation: safeConversation,
    userId: user.id,
    paymentRequired: isCleaner && !feePaid && !isDeclined,
    declined: isDeclined,
  });
}

// POST /api/conversations/[id]/messages — send a message
export async function POST(req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const { content } = await req.json();

  if (!content?.trim()) return NextResponse.json({ error: 'Message is empty' }, { status: 400 });

  const conversation = await prisma.conversation.findUnique({
    where: { id },
    include: { lead: { select: { status: true } } },
  });
  if (!conversation) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (conversation.clientId !== user.id && conversation.cleanerId !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // Block messages on closed conversations
  if (conversation.status !== 'active' || conversation.lead.status === 'COMPLETED' || conversation.lead.status === 'CANCELLED') {
    return NextResponse.json({ error: 'conversation_closed' }, { status: 403 });
  }

  // Cleaner cannot send messages until the lead fee is paid
  const isCleaner = conversation.cleanerId === user.id;
  const feePaid   = conversation.feeStatus === 'charged' || conversation.feeStatus === 'waived';
  if (isCleaner && !feePaid) {
    return NextResponse.json({ error: 'payment_required', leadFee: conversation.leadFee }, { status: 402 });
  }

  const message = await prisma.message.create({
    data: { conversationId: id, senderId: user.id, content: content.trim() },
    include: { sender: { select: { name: true, role: true } } },
  });

  // Update conversation updatedAt
  await prisma.conversation.update({ where: { id }, data: { updatedAt: new Date() } });

  // Notify the other party
  const recipientId = conversation.clientId === user.id ? conversation.cleanerId : conversation.clientId;
  createNotification({
    userId: recipientId,
    type:   'message_received',
    title:  'Nova mensagem',
    body:   content.trim().slice(0, 100),
    link:   `/dashboard/chat/${id}`,
  }).catch(() => {});

  return NextResponse.json({ message });
}
