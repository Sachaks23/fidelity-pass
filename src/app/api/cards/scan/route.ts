import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const user = session.user as any;
  const now = new Date();

  const business = await prisma.business.findUnique({
    where: { userId: user.id },
    include: { rewards: { where: { isActive: true }, orderBy: { pointsRequired: "asc" } } },
  });
  if (!business) return NextResponse.json({ error: "Commerce non trouvé" }, { status: 404 });

  // Promotion active
  const activePromotion = await (prisma as any).promotion.findFirst({
    where: {
      businessId: business.id,
      isActive: true,
      startDate: { lte: now },
      endDate: { gte: now },
    },
  });

  const body = await request.json();
  const { serialNumber, amount } = body;

  const card = await prisma.loyaltyCard.findUnique({
    where: { serialNumber },
    include: { customer: { include: { user: { select: { email: true } } } } },
  });

  if (!card) return NextResponse.json({ error: "Carte non trouvée" }, { status: 404 });
  if (card.businessId !== business.id) return NextResponse.json({ error: "Carte invalide pour ce commerce" }, { status: 403 });
  if (!card.isActive) return NextResponse.json({ error: "Carte inactive" }, { status: 400 });

  // Anti-abus : vérifier le délai minimum entre deux scans (30 min)
  if (amount !== undefined && amount !== null) {
    const lastScan = await prisma.scanEvent.findFirst({
      where: { cardId: card.id },
      orderBy: { scannedAt: "desc" },
    });
    if (lastScan) {
      const diffMinutes = (Date.now() - new Date(lastScan.scannedAt).getTime()) / (1000 * 60);
      if (diffMinutes < 30) {
        const remaining = Math.ceil(30 - diffMinutes);
        return NextResponse.json(
          { error: `Cette carte a déjà été scannée il y a moins de 30 minutes. Réessayez dans ${remaining} minute${remaining > 1 ? "s" : ""}.`, cooldown: true, remainingMinutes: remaining },
          { status: 429 }
        );
      }
    }
  }

  // If no amount provided, just return customer info (step 1)
  if (amount === undefined || amount === null) {
    return NextResponse.json({
      step: "info",
      customerName: `${card.customer.firstName} ${card.customer.lastName}`,
      serialNumber: card.serialNumber,
      points: card.points,
      totalPointsEarned: card.totalPointsEarned,
    });
  }

  const parsedAmount = parseFloat(amount);
  if (isNaN(parsedAmount) || parsedAmount <= 0) {
    return NextResponse.json({ error: "Montant invalide" }, { status: 400 });
  }

  // Calculate points earned (avec multiplicateur promo)
  const basePoints = Math.round(parsedAmount * business.pointsPerEuro);
  const pointsEarned = activePromotion ? Math.round(basePoints * activePromotion.multiplier) : basePoints;
  const newPoints = card.points + pointsEarned;
  const newTotalPointsEarned = card.totalPointsEarned + pointsEarned;

  // Find newly unlocked rewards
  const previouslyUnlocked = business.rewards.filter((r) => r.pointsRequired <= card.points);
  const nowUnlocked = business.rewards.filter((r) => r.pointsRequired <= newPoints);
  const newlyUnlocked = nowUnlocked.filter(
    (r) => !previouslyUnlocked.find((p) => p.id === r.id)
  );

  // Update card
  await prisma.loyaltyCard.update({
    where: { id: card.id },
    data: {
      points: newPoints,
      totalPointsEarned: newTotalPointsEarned,
      scanEvents: {
        create: { businessId: business.id, amount: parsedAmount, pointsEarned },
      },
      transactions: {
        create: {
          type: "POINTS",
          pointsDelta: pointsEarned,
          amount: parsedAmount,
          note: newlyUnlocked.length > 0
            ? `Récompense débloquée : ${newlyUnlocked.map((r) => r.name).join(", ")}`
            : activePromotion
            ? `Promo ${activePromotion.name} (x${activePromotion.multiplier})`
            : undefined,
        },
      },
    },
  });

  const nextReward = business.rewards.find((r) => r.pointsRequired > newPoints);
  const redeemableRewards = business.rewards.filter((r) => r.pointsRequired <= newPoints);

  return NextResponse.json({
    success: true,
    step: "done",
    cardId: card.id,
    customerName: `${card.customer.firstName} ${card.customer.lastName}`,
    pointsEarned,
    newPoints,
    newlyUnlocked,
    redeemableRewards,
    nextReward: nextReward ?? null,
    activePromotion: activePromotion ? { name: activePromotion.name, multiplier: activePromotion.multiplier } : null,
    googleReviewUrl: (business as any).googleReviewUrl ?? null,
    message: newlyUnlocked.length > 0
      ? `${pointsEarned} points ajoutés — Récompense débloquée : ${newlyUnlocked[0].name}`
      : activePromotion
      ? `${pointsEarned} pts ajoutés (x${activePromotion.multiplier} — ${activePromotion.name})`
      : `${pointsEarned} points ajoutés — Total : ${newPoints} pts`,
  });
}
