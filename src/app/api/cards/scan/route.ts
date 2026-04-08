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
  const { serialNumber } = body;

  const card = await prisma.loyaltyCard.findUnique({
    where: { serialNumber },
    include: { customer: { include: { user: { select: { email: true } } } } },
  });

  if (!card) return NextResponse.json({ error: "Carte non trouvée" }, { status: 404 });
  if (card.businessId !== business.id) return NextResponse.json({ error: "Carte invalide pour ce commerce" }, { status: 403 });
  if (!card.isActive) return NextResponse.json({ error: "Carte inactive" }, { status: 400 });

  const newStampCount = card.stampCount + 1;
  const rewardEarned = newStampCount >= business.stampsRequired;

  const updatedCard = await prisma.loyaltyCard.update({
    where: { id: card.id },
    data: {
      stampCount: rewardEarned ? 0 : newStampCount,
      totalStamps: { increment: 1 },
      scanEvents: {
        create: { businessId: business.id },
      },
      transactions: {
        create: {
          type: rewardEarned ? "REWARD" : "STAMP",
          stampsDelta: 1,
          note: rewardEarned ? `Récompense gagnée: ${business.rewardLabel}` : undefined,
        },
      },
    },
    include: {
      customer: { include: { user: { select: { email: true } } } },
    },
  });

  return NextResponse.json({
    success: true,
    rewardEarned,
    stampCount: updatedCard.stampCount,
    totalStamps: updatedCard.totalStamps,
    customerName: `${card.customer.firstName} ${card.customer.lastName}`,
    message: rewardEarned
      ? `Récompense débloquée ! ${business.rewardLabel}`
      : `Tampon ajouté ! ${newStampCount}/${business.stampsRequired}`,
  });
}
