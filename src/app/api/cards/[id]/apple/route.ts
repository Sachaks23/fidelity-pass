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
      customer: { include: { user: { select: { email: true } } } },
    },
  });

  if (!card) return NextResponse.json({ error: "Carte non trouvée" }, { status: 404 });

  // Apple Wallet requires real certificates (Apple Developer account).
  // Return a pass.json preview for demonstration.
  const passJson = {
    formatVersion: 1,
    passTypeIdentifier: "pass.fr.fidelitypass",
    serialNumber: card.serialNumber,
    teamIdentifier: "XXXXXXXXXX",
    organizationName: card.business.name,
    description: `Carte de fidélité ${card.business.name}`,
    backgroundColor: card.business.cardBgColor,
    foregroundColor: card.business.cardFgColor,
    labelColor: card.business.cardAccentColor,
    storeCard: {
      primaryFields: [
        {
          key: "stamps",
          label: "Tampons",
          value: `${card.stampCount}/${card.business.stampsRequired}`,
        },
      ],
      secondaryFields: [
        {
          key: "reward",
          label: "Récompense",
          value: card.business.rewardLabel,
        },
      ],
      auxiliaryFields: [
        {
          key: "customer",
          label: "Client",
          value: `${card.customer.firstName} ${card.customer.lastName}`,
        },
      ],
      backFields: [
        {
          key: "serial",
          label: "N° de carte",
          value: card.serialNumber,
        },
        {
          key: "email",
          label: "Email",
          value: card.customer.user.email,
        },
      ],
    },
    barcode: {
      message: card.serialNumber,
      format: "PKBarcodeFormatQR",
      messageEncoding: "iso-8859-1",
    },
  };

  // For production: use passkit-generator with Apple Developer certificates
  // For now, return the JSON with a note
  return new NextResponse(
    JSON.stringify({
      message: "Apple Wallet nécessite un certificat Apple Developer. Voici les données de votre carte :",
      passData: passJson,
      instructions: "Pour activer Apple Wallet, configurez vos certificats Apple Developer dans les variables d'environnement.",
    }, null, 2),
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
}
