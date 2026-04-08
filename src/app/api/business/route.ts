import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const user = session.user as any;
  const business = await prisma.business.findUnique({
    where: { userId: user.id },
    include: { _count: { select: { loyaltyCards: true } } },
  });

  if (!business) return NextResponse.json({ error: "Commerce non trouvé" }, { status: 404 });
  return NextResponse.json(business);
}

export async function PATCH(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const user = session.user as any;
  const body = await request.json();

  const business = await prisma.business.update({
    where: { userId: user.id },
    data: {
      name: body.name,
      address: body.address,
      phone: body.phone,
      description: body.description,
      cardBgColor: body.cardBgColor,
      cardFgColor: body.cardFgColor,
      cardAccentColor: body.cardAccentColor,
      stampsRequired: body.stampsRequired,
      rewardLabel: body.rewardLabel,
      ...(body.pointsPerEuro !== undefined && { pointsPerEuro: parseFloat(body.pointsPerEuro) }),
    },
  });

  return NextResponse.json(business);
}
