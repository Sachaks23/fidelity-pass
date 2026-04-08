import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;
  if (!userId) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const business = await prisma.business.findUnique({ where: { userId } });
  if (!business) return NextResponse.json({ error: "Commerce introuvable" }, { status: 404 });

  const rewards = await prisma.reward.findMany({
    where: { businessId: business.id },
    orderBy: { pointsRequired: "asc" },
  });

  return NextResponse.json(rewards);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;
  if (!userId) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const business = await prisma.business.findUnique({ where: { userId } });
  if (!business) return NextResponse.json({ error: "Commerce introuvable" }, { status: 404 });

  const { name, description, pointsRequired } = await req.json();
  if (!name?.trim() || !pointsRequired) {
    return NextResponse.json({ error: "Nom et points requis" }, { status: 400 });
  }

  const reward = await prisma.reward.create({
    data: {
      businessId: business.id,
      name: name.trim(),
      description: description?.trim() || null,
      pointsRequired: parseInt(pointsRequired),
    },
  });

  return NextResponse.json(reward);
}
