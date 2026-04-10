import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { computeSegment } from "@/lib/segmentation";

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const user = session.user as any;
  const business = await prisma.business.findUnique({ where: { userId: user.id } });
  if (!business) return NextResponse.json({ error: "Commerce non trouvé" }, { status: 404 });

  const { searchParams } = new URL(request.url);
  const range = searchParams.get("range") || "30d";

  const now = new Date();
  let startDate: Date;

  switch (range) {
    case "7d":
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case "6m":
      startDate = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
      break;
    case "1y":
      startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
      break;
    default:
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  }

  const [totalCards, activeCards, todayScans, allCards, allScans, allCardsForSegments] = await Promise.all([
    prisma.loyaltyCard.count({ where: { businessId: business.id } }),
    prisma.loyaltyCard.count({ where: { businessId: business.id, isActive: true } }),
    prisma.scanEvent.count({
      where: {
        businessId: business.id,
        scannedAt: { gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()) },
      },
    }),
    prisma.loyaltyCard.findMany({
      where: { businessId: business.id, issuedAt: { gte: startDate } },
      select: { issuedAt: true },
      orderBy: { issuedAt: "asc" },
    }),
    prisma.scanEvent.findMany({
      where: { businessId: business.id, scannedAt: { gte: startDate } },
      select: { scannedAt: true },
      orderBy: { scannedAt: "asc" },
    }),
    // Pour segments et top clients : toutes les cartes enrichies
    prisma.loyaltyCard.findMany({
      where: { businessId: business.id },
      include: {
        customer: true,
        scanEvents: { orderBy: { scannedAt: "desc" }, take: 1, select: { scannedAt: true } },
        _count: { select: { scanEvents: true } },
      },
    }),
  ]);

  // Segments distribution
  const segmentCounts: Record<string, number> = { nouveau: 0, régulier: 0, vip: 0, inactif: 0 };
  let inactiveCards: Array<{ id: string; name: string; points: number; lastScanDate: Date | null }> = [];

  for (const card of allCardsForSegments) {
    const lastScanDate = card.scanEvents[0]?.scannedAt ?? null;
    const seg = computeSegment({
      scanCount: card._count.scanEvents,
      totalPointsEarned: card.totalPointsEarned,
      issuedAt: card.issuedAt,
      lastScanDate,
    });
    segmentCounts[seg] = (segmentCounts[seg] || 0) + 1;
    if (seg === "inactif") {
      inactiveCards.push({
        id: card.id,
        name: `${card.customer.firstName} ${card.customer.lastName}`,
        points: card.points,
        lastScanDate,
      });
    }
  }

  // Top 5 clients par points
  const topClients = allCardsForSegments
    .sort((a, b) => b.totalPointsEarned - a.totalPointsEarned)
    .slice(0, 5)
    .map((card) => ({
      id: card.id,
      name: `${card.customer.firstName} ${card.customer.lastName}`,
      points: card.points,
      totalPointsEarned: card.totalPointsEarned,
      scanCount: card._count.scanEvents,
    }));

  // Taux de retour : clients ayant scanné au moins 2 fois / total
  const returningCount = allCardsForSegments.filter((c) => c._count.scanEvents >= 2).length;
  const returnRate = totalCards > 0 ? Math.round((returningCount / totalCards) * 100) : 0;

  // Group by day
  const cardsByDay = groupByDay(allCards.map((c) => c.issuedAt));
  const scansByDay = groupByDay(allScans.map((s) => s.scannedAt));

  const newCustomers = fillDateGaps(cardsByDay, startDate, now);
  const scansPerDay = fillDateGaps(scansByDay, startDate, now);

  return NextResponse.json({
    totalCustomers: totalCards,
    activeCards,
    totalScansToday: todayScans,
    returnRate,
    newCustomers,
    scansPerDay,
    segmentCounts,
    topClients,
    inactiveClients: inactiveCards.slice(0, 5),
    inactiveCount: inactiveCards.length,
  });
}

function groupByDay(dates: Date[]): Record<string, number> {
  const groups: Record<string, number> = {};
  for (const date of dates) {
    const key = date.toISOString().split("T")[0];
    groups[key] = (groups[key] || 0) + 1;
  }
  return groups;
}

function fillDateGaps(
  data: Record<string, number>,
  startDate: Date,
  endDate: Date
): Array<{ date: string; count: number }> {
  const result = [];
  const current = new Date(startDate);
  current.setHours(0, 0, 0, 0);

  while (current <= endDate) {
    const key = current.toISOString().split("T")[0];
    result.push({ date: key, count: data[key] || 0 });
    current.setDate(current.getDate() + 1);
  }

  return result;
}
