import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const user = session.user as any;
  const business = await prisma.business.findUnique({
    where: { userId: user.id },
    include: { rewards: { where: { isActive: true }, orderBy: { pointsRequired: "asc" } } },
  });
  if (!business) return NextResponse.json({ error: "Commerce non trouvé" }, { status: 404 });

  const body = await request.json();
  const { serialNumber, amount } = body;

  const card = await prisma.loyaltyCard.findUnique({
    where: { serialNumber },
    include: { customer: { include: { user: { select: { email: true } } } } },
  });

  if (!card) return NextResponse.json({ error: "Carte non trouvée" }, { status: 404 });
  if (card.businessId !== business.id) return NextResponse.json({ error: "Carte invalide pour ce commerce" }, { status: 403 });
  if (!card.isActive) return NextResponse.json({ error: "Carte inactive" }, { status: 400 });

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

  // Calculate points earned
  const pointsEarned = Math.round(parsedAmount * business.pointsPerEuro);
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
            : undefined,
        },
      },
    },
  });

  // Find next reward
  const nextReward = business.rewards.find((r) => r.pointsRequired > newPoints);

  // Toutes les récompenses disponibles pour ce solde
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
    message: newlyUnlocked.length > 0
      ? `${pointsEarned} points ajoutés — Récompense débloquée : ${newlyUnlocked[0].name}`
      : `${pointsEarned} points ajoutés — Total : ${newPoints} pts`,
  });
}
