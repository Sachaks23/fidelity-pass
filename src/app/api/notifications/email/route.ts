import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendBusinessNotification } from "@/lib/email";

// GET — historique des emails envoyés
export async function GET() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;
  if (!userId) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const business = await prisma.business.findUnique({ where: { userId } });
  if (!business) return NextResponse.json({ error: "Commerce introuvable" }, { status: 404 });

  const emails = await prisma.emailNotification.findMany({
    where: { businessId: business.id },
    orderBy: { sentAt: "desc" },
    take: 50,
  });

  return NextResponse.json(emails);
}

// POST — envoyer un email à tous les clients
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;
  if (!userId) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  try {
    const { subject, message } = await req.json();
    if (!subject?.trim() || !message?.trim()) {
      return NextResponse.json({ error: "Sujet et message requis" }, { status: 400 });
    }

    const business = await prisma.business.findUnique({ where: { userId } });
    if (!business) return NextResponse.json({ error: "Commerce introuvable" }, { status: 404 });

    // Récupère tous les clients avec une carte active
    const cards = await prisma.loyaltyCard.findMany({
      where: { businessId: business.id, isActive: true },
      include: {
        customer: {
          include: { user: { select: { email: true } } },
        },
      },
    });

    const recipients = cards
      .filter((c: any) => c.customer?.user?.email)
      .map((c: any) => ({
        email: c.customer.user.email as string,
        firstName: c.customer.firstName as string,
      }));

    if (recipients.length === 0) {
      return NextResponse.json({ error: "Aucun client avec une adresse email" }, { status: 400 });
    }

    const { sentCount } = await sendBusinessNotification({
      recipients,
      businessName: business.name,
      subject,
      message,
    });

    // Sauvegarde dans l'historique
    await prisma.emailNotification.create({
      data: {
        businessId: business.id,
        subject,
        body: message,
        sentCount,
        status: "SENT",
      },
    });

    return NextResponse.json({ success: true, sentCount });
  } catch (err) {
    console.error("[notifications/email]", err);
    return NextResponse.json({ error: "Erreur lors de l'envoi" }, { status: 500 });
  }
}
