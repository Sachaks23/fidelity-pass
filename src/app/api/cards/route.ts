import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { computeBadges } from "@/lib/badges";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const user = session.user as any;
  const customer = await prisma.customer.findUnique({ where: { userId: user.id } });
  if (!customer) return NextResponse.json({ error: "Client non trouvé" }, { status: 404 });

  const cards = await prisma.loyaltyCard.findMany({
    where: { customerId: customer.id, isActive: true },
    include: {
      business: {
        include: {
          rewards: { where: { isActive: true }, orderBy: { pointsRequired: "asc" } },
        },
      },
      transactions: { orderBy: { createdAt: "desc" }, take: 20 },
      scanEvents: { orderBy: { scannedAt: "desc" }, take: 1, select: { scannedAt: true } },
      _count: { select: { scanEvents: true } },
    },
    orderBy: { issuedAt: "desc" },
  });

  const cardCount = cards.length;

  const enrichedCards = cards.map((card) => {
    const hasReferral = card.transactions.some((t) => t.type === "REFERRAL" && t.pointsDelta > 0 && t.note?.includes("Parrainage :"));
    const badges = computeBadges({
      scanCount: card._count.scanEvents,
      totalPointsEarned: card.totalPointsEarned,
      hasReferral,
      cardCount,
    });
    const lastScanDate = card.scanEvents[0]?.scannedAt ?? null;
    return { ...card, badges, lastScanDate, scanCount: card._count.scanEvents };
  });

  return NextResponse.json(enrichedCards);
}
