import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const user = session.user as any;
  const { id } = await params;

  const card = await prisma.loyaltyCard.findFirst({
    where: {
      id,
      customer: { userId: user.id },
    },
    include: {
      business: true,
      customer: true,
    },
  });

  if (!card) return NextResponse.json({ error: "Carte non trouvée" }, { status: 404 });

  // For production: import generateGoogleWalletJWT from @/lib/wallet/google
  // and configure GOOGLE_SERVICE_ACCOUNT_EMAIL + GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY
  return NextResponse.json({
    message: "Google Wallet nécessite un compte Google Cloud avec l'API Wallet activée.",
    instructions: "Configurez GOOGLE_SERVICE_ACCOUNT_EMAIL et GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY dans .env",
    cardData: {
      serialNumber: card.serialNumber,
      businessName: card.business.name,
      stampCount: card.stampCount,
      stampsRequired: card.business.stampsRequired,
      rewardLabel: card.business.rewardLabel,
    },
  });
}
