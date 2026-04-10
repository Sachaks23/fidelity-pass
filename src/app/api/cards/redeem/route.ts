import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const user = session.user as any;
  const business = await prisma.business.findUnique({ where: { userId: user.id } });
  if (!business) return NextResponse.json({ error: "Commerce non trouvé" }, { status: 404 });

  const body = await request.json();
  const { cardId, rewardId } = body;

  if (!cardId || !rewardId) {
    return NextResponse.json({ error: "cardId et rewardId requis" }, { status: 400 });
  }

  const [card, reward] = await Promise.all([
    prisma.loyaltyCard.findFirst({ where: { id: cardId, businessId: business.id } }),
    prisma.reward.findFirst({ where: { id: rewardId, businessId: business.id, isActive: true } }),
  ]);

  if (!card) return NextResponse.json({ error: "Carte non trouvée" }, { status: 404 });
  if (!reward) return NextResponse.json({ error: "Récompense non trouvée" }, { status: 404 });

  if (card.points < reward.pointsRequired) {
    return NextResponse.json(
      { error: "Points insuffisants", points: card.points, required: reward.pointsRequired },
      { status: 400 }
    );
  }

  const newPoints = card.points - reward.pointsRequired;

  await prisma.loyaltyCard.update({
    where: { id: card.id },
    data: {
      points: newPoints,
      transactions: {
        create: {
          type: "REDEMPTION",
          pointsDelta: -reward.pointsRequired,
          note: `Récompense utilisée : ${reward.name}`,
        },
      },
    },
  });

  return NextResponse.json({
    success: true,
    rewardName: reward.name,
    newPoints,
    pointsUsed: reward.pointsRequired,
  });
}
