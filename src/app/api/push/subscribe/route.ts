import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const user = session.user as any;
  const customer = await prisma.customer.findUnique({ where: { userId: user.id } });
  if (!customer) return NextResponse.json({ error: "Client non trouvé" }, { status: 404 });

  const body = await request.json();
  const { endpoint, keys } = body;

  await prisma.pushSubscription.upsert({
    where: { endpoint },
    create: {
      customerId: customer.id,
      endpoint,
      p256dh: keys.p256dh,
      auth: keys.auth,
    },
    update: {
      p256dh: keys.p256dh,
      auth: keys.auth,
    },
  });

  return NextResponse.json({ success: true });
}
