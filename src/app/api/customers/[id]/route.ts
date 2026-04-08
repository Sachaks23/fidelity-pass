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
  const business = await prisma.business.findUnique({ where: { userId: user.id } });
  if (!business) return NextResponse.json({ error: "Commerce non trouvé" }, { status: 404 });

  const { id } = await params;

  const card = await prisma.loyaltyCard.findFirst({
    where: { id, businessId: business.id },
    include: {
      customer: {
        include: { user: { select: { email: true, createdAt: true } } },
      },
      transactions: { orderBy: { createdAt: "desc" } },
      _count: { select: { scanEvents: true } },
    },
  });

  if (!card) return NextResponse.json({ error: "Client non trouvé" }, { status: 404 });
  return NextResponse.json(card);
}
