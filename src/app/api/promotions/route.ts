import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;
  if (!userId) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const business = await prisma.business.findUnique({ where: { userId } });
  if (!business) return NextResponse.json({ error: "Commerce non trouvé" }, { status: 404 });

  const promotions = await (prisma as any).promotion.findMany({
    where: { businessId: business.id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(promotions);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;
  if (!userId) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const dbUser = await prisma.user.findUnique({ where: { id: userId } });
  if (dbUser?.plan === "STARTER") {
    return NextResponse.json({ error: "Les promotions sont réservées aux abonnés Pro.", upgrade: true }, { status: 403 });
  }

  const business = await prisma.business.findUnique({ where: { userId } });
  if (!business) return NextResponse.json({ error: "Commerce non trouvé" }, { status: 404 });

  const { name, multiplier, startDate, endDate } = await req.json();
  if (!name?.trim() || !startDate || !endDate) {
    return NextResponse.json({ error: "Nom, dates de début et fin requis" }, { status: 400 });
  }

  const promo = await (prisma as any).promotion.create({
    data: {
      businessId: business.id,
      name: name.trim(),
      multiplier: parseFloat(multiplier) || 2.0,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
    },
  });

  return NextResponse.json(promo, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;
  if (!userId) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const business = await prisma.business.findUnique({ where: { userId } });
  if (!business) return NextResponse.json({ error: "Commerce non trouvé" }, { status: 404 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id requis" }, { status: 400 });

  await (prisma as any).promotion.deleteMany({ where: { id, businessId: business.id } });
  return NextResponse.json({ success: true });
}
