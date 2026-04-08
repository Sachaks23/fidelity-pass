import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendPushNotification } from "@/lib/push";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const user = session.user as any;
  const business = await prisma.business.findUnique({ where: { userId: user.id } });
  if (!business) return NextResponse.json({ error: "Commerce non trouvé" }, { status: 404 });

  const notifications = await prisma.pushNotification.findMany({
    where: { businessId: business.id },
    orderBy: { sentAt: "desc" },
    take: 20,
  });

  return NextResponse.json(notifications);
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const user = session.user as any;
  const business = await prisma.business.findUnique({ where: { userId: user.id } });
  if (!business) return NextResponse.json({ error: "Commerce non trouvé" }, { status: 404 });

  const body = await request.json();
  const { title, message } = body;

  if (!title || !message) {
    return NextResponse.json({ error: "Titre et message requis" }, { status: 400 });
  }

  // Get all customer subscriptions for this business
  const cards = await prisma.loyaltyCard.findMany({
    where: { businessId: business.id, isActive: true },
    include: {
      customer: {
        include: { pushSubs: true },
      },
    },
  });

  const notification = await prisma.pushNotification.create({
    data: {
      businessId: business.id,
      title,
      body: message,
      status: "SENT",
    },
  });

  let sentCount = 0;
  for (const card of cards) {
    for (const sub of card.customer.pushSubs) {
      const success = await sendPushNotification(
        { endpoint: sub.endpoint, p256dh: sub.p256dh, auth: sub.auth },
        { title, body: message, icon: "/icon-192.png" }
      );
      if (success) sentCount++;
    }
  }

  await prisma.pushNotification.update({
    where: { id: notification.id },
    data: { sentCount },
  });

  return NextResponse.json({ success: true, sentCount });
}
