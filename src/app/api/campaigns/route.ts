import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { computeSegment } from "@/lib/segmentation";
import { sendBusinessNotification } from "@/lib/email";
import { sendPushNotification } from "@/lib/push";

// GET — retourne les campagnes disponibles avec leur nombre de destinataires
export async function GET() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;
  if (!userId) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const business = await prisma.business.findUnique({ where: { userId } });
  if (!business) return NextResponse.json({ error: "Commerce non trouvé" }, { status: 404 });

  const rewards = await prisma.reward.findMany({ where: { businessId: business.id, isActive: true } });

  const allCards = await prisma.loyaltyCard.findMany({
    where: { businessId: business.id, isActive: true },
    include: {
      customer: { include: { user: { select: { email: true } }, pushSubs: true } },
      scanEvents: { orderBy: { scannedAt: "desc" }, take: 1, select: { scannedAt: true } },
      _count: { select: { scanEvents: true } },
    },
  });

  // Inactifs : pas de visite depuis 60+ jours
  const inactiveCards = allCards.filter((card) => {
    const lastScan = card.scanEvents[0]?.scannedAt ?? null;
    const seg = computeSegment({ scanCount: card._count.scanEvents, totalPointsEarned: card.totalPointsEarned, issuedAt: card.issuedAt, lastScanDate: lastScan });
    return seg === "inactif";
  });

  // Proches d'une récompense : >= 80% des points requis pour la prochaine récompense
  const nearRewardCards = allCards.filter((card) => {
    const nextReward = rewards.filter((r) => r.pointsRequired > card.points).sort((a, b) => a.pointsRequired - b.pointsRequired)[0];
    if (!nextReward) return false;
    return card.points / nextReward.pointsRequired >= 0.8;
  });

  // Récompense disponible : a des points suffisants mais n'a pas encore utilisé
  const rewardReadyCards = allCards.filter((card) => {
    return rewards.some((r) => r.pointsRequired <= card.points);
  });

  return NextResponse.json([
    {
      id: "inactive",
      name: "Relance clients inactifs",
      description: "Envoyez un message aux clients qui n'ont pas visité depuis plus de 60 jours",
      icon: "clock",
      targetCount: inactiveCards.length,
      defaultSubject: "Vous nous manquez !",
      defaultMessage: `Bonjour {{prenom}},\n\nCela fait un moment que nous ne vous avons pas vu chez ${business.name}. Revenez nous rendre visite, votre carte de fidélité vous attend !\n\nÀ bientôt !`,
    },
    {
      id: "near_reward",
      name: "Proche d'une récompense",
      description: "Motivez les clients qui ont atteint 80% des points nécessaires",
      icon: "target",
      targetCount: nearRewardCards.length,
      defaultSubject: "Vous y êtes presque !",
      defaultMessage: `Bonjour {{prenom}},\n\nBonne nouvelle : vous êtes très proche d'une récompense chez ${business.name} ! Il ne vous manque plus que quelques points. Venez nous voir !\n\nÀ bientôt !`,
    },
    {
      id: "reward_ready",
      name: "Récompense disponible",
      description: "Notifiez les clients qui ont suffisamment de points pour une récompense",
      icon: "gift",
      targetCount: rewardReadyCards.length,
      defaultSubject: "Votre récompense vous attend !",
      defaultMessage: `Bonjour {{prenom}},\n\nFélicitations ! Vous avez cumulé suffisamment de points pour bénéficier d'une récompense chez ${business.name}. Venez en profiter !\n\nÀ bientôt !`,
    },
  ]);
}

// POST — exécuter une campagne
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;
  if (!userId) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const dbUser = await prisma.user.findUnique({ where: { id: userId } });
  if (dbUser?.plan === "STARTER") {
    return NextResponse.json({ error: "Les campagnes sont réservées aux abonnés Pro.", upgrade: true }, { status: 403 });
  }

  const business = await prisma.business.findUnique({ where: { userId } });
  if (!business) return NextResponse.json({ error: "Commerce non trouvé" }, { status: 404 });

  const { campaignId, subject, message, channel } = await req.json();
  if (!campaignId || !message) return NextResponse.json({ error: "Paramètres manquants" }, { status: 400 });

  const rewards = await prisma.reward.findMany({ where: { businessId: business.id, isActive: true } });

  const allCards = await prisma.loyaltyCard.findMany({
    where: { businessId: business.id, isActive: true },
    include: {
      customer: { include: { user: { select: { email: true } }, pushSubs: true } },
      scanEvents: { orderBy: { scannedAt: "desc" }, take: 1, select: { scannedAt: true } },
      _count: { select: { scanEvents: true } },
    },
  });

  // Filtrer selon le type de campagne
  let targetCards = allCards;
  if (campaignId === "inactive") {
    targetCards = allCards.filter((card) => {
      const lastScan = card.scanEvents[0]?.scannedAt ?? null;
      const seg = computeSegment({ scanCount: card._count.scanEvents, totalPointsEarned: card.totalPointsEarned, issuedAt: card.issuedAt, lastScanDate: lastScan });
      return seg === "inactif";
    });
  } else if (campaignId === "near_reward") {
    targetCards = allCards.filter((card) => {
      const nextReward = rewards.filter((r) => r.pointsRequired > card.points).sort((a, b) => a.pointsRequired - b.pointsRequired)[0];
      if (!nextReward) return false;
      return card.points / nextReward.pointsRequired >= 0.8;
    });
  } else if (campaignId === "reward_ready") {
    targetCards = allCards.filter((card) => rewards.some((r) => r.pointsRequired <= card.points));
  }

  if (targetCards.length === 0) {
    return NextResponse.json({ error: "Aucun destinataire pour cette campagne" }, { status: 400 });
  }

  let sentCount = 0;

  if (channel === "email" || channel === "both") {
    const recipients = targetCards
      .filter((c) => c.customer?.user?.email)
      .map((c) => ({ email: c.customer.user.email as string, firstName: c.customer.firstName }));

    if (recipients.length > 0) {
      const result = await sendBusinessNotification({ recipients, businessName: business.name, subject: subject || "Message de votre commerce", message });
      sentCount += result.sentCount;

      await prisma.emailNotification.create({
        data: { businessId: business.id, subject: subject || "Campagne", body: message, sentCount: result.sentCount, status: "SENT" },
      });
    }
  }

  if (channel === "push" || channel === "both") {
    let pushCount = 0;
    for (const card of targetCards) {
      for (const sub of card.customer.pushSubs) {
        const ok = await sendPushNotification(
          { endpoint: sub.endpoint, p256dh: sub.p256dh, auth: sub.auth },
          { title: subject || business.name, body: message.replace("{{prenom}}", card.customer.firstName), icon: "/icon-192.png" }
        );
        if (ok) pushCount++;
      }
    }
    if (pushCount > 0) {
      await prisma.pushNotification.create({
        data: { businessId: business.id, title: subject || "Campagne", body: message, status: "SENT", sentCount: pushCount },
      });
      sentCount += pushCount;
    }
  }

  return NextResponse.json({ success: true, sentCount, targetCount: targetCards.length });
}
