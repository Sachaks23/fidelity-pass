import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;
  if (!userId) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const business = await prisma.business.findUnique({ where: { userId } });
  if (!business) return NextResponse.json({ error: "Commerce introuvable" }, { status: 404 });

  const reward = await prisma.reward.findUnique({ where: { id: params.id } });
  if (!reward || reward.businessId !== business.id) {
    return NextResponse.json({ error: "Récompense introuvable" }, { status: 404 });
  }

  const { name, description, pointsRequired, isActive } = await req.json();

  const updated = await prisma.reward.update({
    where: { id: params.id },
    data: {
      name: name?.trim() ?? reward.name,
      description: description?.trim() ?? reward.description,
      pointsRequired: pointsRequired ? parseInt(pointsRequired) : reward.pointsRequired,
      isActive: isActive ?? reward.isActive,
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;
  if (!userId) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const business = await prisma.business.findUnique({ where: { userId } });
  if (!business) return NextResponse.json({ error: "Commerce introuvable" }, { status: 404 });

  const reward = await prisma.reward.findUnique({ where: { id: params.id } });
  if (!reward || reward.businessId !== business.id) {
    return NextResponse.json({ error: "Récompense introuvable" }, { status: 404 });
  }

  await prisma.reward.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
