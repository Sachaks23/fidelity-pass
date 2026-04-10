import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { computeSegment } from "@/lib/segmentation";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const user = session.user as any;
  const business = await prisma.business.findUnique({ where: { userId: user.id } });
  if (!business) return NextResponse.json({ error: "Commerce non trouvé" }, { status: 404 });

  const { id } = await params;

  const card = await prisma.loyaltyCard.findFirst({
    where: { id, businessId: business.id },
    include: {
      customer: {
        include: { user: { select: { email: true, createdAt: true } } },
      },
      transactions: { orderBy: { createdAt: "desc" }, take: 50 },
      scanEvents: { orderBy: { scannedAt: "desc" }, take: 1, select: { scannedAt: true } },
      _count: { select: { scanEvents: true, transactions: true } },
    },
  });

  if (!card) return NextResponse.json({ error: "Client non trouvé" }, { status: 404 });

  // Calcul segmentation
  const lastScanDate = card.scanEvents[0]?.scannedAt ?? null;
  const segment = computeSegment({
    scanCount: card._count.scanEvents,
    totalPointsEarned: card.totalPointsEarned,
    issuedAt: card.issuedAt,
    lastScanDate,
  });

  // Récompenses disponibles
  const rewards = await prisma.reward.findMany({
    where: { businessId: business.id, isActive: true },
    orderBy: { pointsRequired: "asc" },
  });

  // Historique complet des scans pour la fréquence
  const allScans = await prisma.scanEvent.findMany({
    where: { cardId: card.id },
    orderBy: { scannedAt: "desc" },
    select: { scannedAt: true, amount: true, pointsEarned: true },
  });

  // Calcul montant total dépensé
  const totalSpent = allScans.reduce((sum, s) => sum + (s.amount ?? 0), 0);

  // Fréquence moyenne (jours entre visites)
  let avgFrequencyDays: number | null = null;
  if (allScans.length >= 2) {
    const gaps: number[] = [];
    for (let i = 0; i < allScans.length - 1; i++) {
      const diff =
        (new Date(allScans[i].scannedAt).getTime() -
          new Date(allScans[i + 1].scannedAt).getTime()) /
        (1000 * 60 * 60 * 24);
      gaps.push(diff);
    }
    avgFrequencyDays = Math.round(gaps.reduce((a, b) => a + b, 0) / gaps.length);
  }

  return NextResponse.json({
    ...card,
    lastScanDate,
    segment,
    rewards,
    allScans,
    totalSpent,
    avgFrequencyDays,
  });
}
