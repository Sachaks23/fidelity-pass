import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const user = session.user as any;
  const customer = await prisma.customer.findUnique({ where: { userId: user.id } });
  if (!customer) return NextResponse.json({ error: "Client non trouvé" }, { status: 404 });

  const transactions = await prisma.transaction.findMany({
    where: { card: { customerId: customer.id } },
    include: {
      card: {
        select: {
          business: { select: { name: true, cardAccentColor: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(transactions);
}
