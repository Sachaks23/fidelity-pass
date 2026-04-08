import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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
    default: // 30d
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  }

  const [totalCards, activeCards, todayScans, allCards, allScans] = await Promise.all([
    prisma.loyaltyCard.count({ where: { businessId: business.id } }),
    prisma.loyaltyCard.count({ where: { businessId: business.id, isActive: true } }),
    prisma.scanEvent.count({
      where: {
        businessId: business.id,
        scannedAt: {
          gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
        },
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
  ]);

  // Group by day
  const cardsByDay = groupByDay(allCards.map((c: { issuedAt: Date }) => c.issuedAt));
  const scansByDay = groupByDay(allScans.map((s: { scannedAt: Date }) => s.scannedAt));

  // Fill date gaps
  const newCustomers = fillDateGaps(cardsByDay, startDate, now);
  const scansPerDay = fillDateGaps(scansByDay, startDate, now);

  return NextResponse.json({
    totalCustomers: totalCards,
    activeCards,
    totalScansToday: todayScans,
    newCustomers,
    scansPerDay,
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
