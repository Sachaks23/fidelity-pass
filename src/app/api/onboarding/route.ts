import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;
  if (!userId) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const business = await prisma.business.findUnique({
    where: { userId },
    include: {
      _count: { select: { loyaltyCards: true, rewards: true } },
    },
  });
  if (!business) return NextResponse.json({ error: "Commerce non trouvé" }, { status: 404 });

  const profileComplete = !!(business.name && business.address);
  const cardCustomized = business.cardBgColor !== "#1a1a2e" || (business as any).cardLogoUrl !== null;
  const rewardCreated = business._count.rewards > 0;
  const firstClient = business._count.loyaltyCards > 0;

  const steps = [
    { id: "profile", label: "Compléter le profil", done: profileComplete, href: "/dashboard/parametres" },
    { id: "card", label: "Personnaliser la carte", done: cardCustomized, href: "/dashboard/carte" },
    { id: "reward", label: "Créer une récompense", done: rewardCreated, href: "/dashboard/recompenses" },
    { id: "client", label: "Inscrire le premier client", done: firstClient, href: "/dashboard/clients" },
  ];

  const completedCount = steps.filter((s) => s.done).length;
  const allDone = completedCount === steps.length;

  return NextResponse.json({ steps, completedCount, total: steps.length, allDone });
}
