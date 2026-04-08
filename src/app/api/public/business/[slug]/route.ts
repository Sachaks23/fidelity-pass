import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Route publique — retourne les infos visuelles d'un commerce pour la page d'inscription client
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const business = await prisma.business.findUnique({
    where: { slug },
    select: {
      name: true,
      category: true,
      address: true,
      description: true,
      cardBgColor: true,
      cardFgColor: true,
      cardAccentColor: true,
      stampsRequired: true,
      rewardLabel: true,
      logoUrl: true,
    },
  });

  if (!business) {
    return NextResponse.json({ error: "Commerce non trouvé" }, { status: 404 });
  }

  return NextResponse.json(business);
}
