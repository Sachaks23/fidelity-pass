import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import QRCode from "qrcode";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const user = session.user as any;
  const business = await prisma.business.findUnique({ where: { userId: user.id } });
  if (!business) return NextResponse.json({ error: "Commerce non trouvé" }, { status: 404 });

  // NEXT_PUBLIC_APP_URL = IP locale pour les QR codes (accessibles depuis les téléphones)
  // NEXTAUTH_URL = localhost pour que la connexion pro fonctionne sur le Mac
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || "http://localhost:3000";
  const url = `${baseUrl}/rejoindre/${business.slug}`;
  const dataUrl = await QRCode.toDataURL(url, { width: 400, margin: 2 });
  // Strip the data:image/png;base64, prefix and convert to binary
  const base64 = dataUrl.split(",")[1];
  const binaryStr = Buffer.from(base64, "base64");

  return new Response(binaryStr, {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "no-store",
    },
  });
}
