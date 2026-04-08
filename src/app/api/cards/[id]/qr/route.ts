import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import QRCode from "qrcode";

// Génère le QR code d'une carte de fidélité (contient le serialNumber)
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const user = session.user as any;
  const { id } = await params;

  // Accessible par le client propriétaire OU par le professionnel du commerce
  const card = await prisma.loyaltyCard.findFirst({
    where: {
      id,
      OR: [
        { customer: { userId: user.id } },
        { business: { userId: user.id } },
      ],
    },
  });

  if (!card) return NextResponse.json({ error: "Carte non trouvée" }, { status: 404 });

  const dataUrl = await QRCode.toDataURL(card.serialNumber, {
    width: 300,
    margin: 2,
    color: { dark: "#000000", light: "#ffffff" },
  });

  const base64 = dataUrl.split(",")[1];
  const binary = Buffer.from(base64, "base64");

  return new Response(binary, {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "private, max-age=3600",
    },
  });
}
