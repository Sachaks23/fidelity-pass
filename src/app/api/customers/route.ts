import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { computeSegment } from "@/lib/segmentation";

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const user = session.user as any;
  const business = await prisma.business.findUnique({ where: { userId: user.id } });
  if (!business) return NextResponse.json({ error: "Commerce non trouvé" }, { status: 404 });

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") || "";
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  const skip = (page - 1) * limit;

  const cards = await prisma.loyaltyCard.findMany({
    where: {
      businessId: business.id,
      customer: search
        ? {
            OR: [
              { firstName: { contains: search } },
              { lastName: { contains: search } },
              { user: { email: { contains: search } } },
            ],
          }
        : undefined,
    },
    include: {
      customer: {
        include: { user: { select: { email: true } } },
      },
      scanEvents: { orderBy: { scannedAt: "desc" }, take: 1, select: { scannedAt: true } },
      _count: { select: { transactions: true, scanEvents: true } },
    },
    orderBy: { issuedAt: "desc" },
    skip,
    take: limit,
  });

  // Enrichir avec la segmentation
  const enrichedCards = cards.map((card) => {
    const lastScanDate = card.scanEvents[0]?.scannedAt ?? null;
    const segment = computeSegment({
      scanCount: card._count.scanEvents,
      totalPointsEarned: card.totalPointsEarned,
      issuedAt: card.issuedAt,
      lastScanDate,
    });
    return { ...card, lastScanDate, segment };
  });

  const total = await prisma.loyaltyCard.count({
    where: { businessId: business.id },
  });

  return NextResponse.json({ cards: enrichedCards, total, page, limit });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { businessSlug, firstName, lastName, email, phone, password } = body;

    if (!businessSlug || !firstName || !lastName || !email) {
      return NextResponse.json({ error: "Champs obligatoires manquants" }, { status: 400 });
    }

    const business = await prisma.business.findUnique({ where: { slug: businessSlug }, include: { user: true } });
    if (!business) return NextResponse.json({ error: "Commerce non trouvé" }, { status: 404 });

    if (business.user.plan === "STARTER") {
      const clientCount = await prisma.loyaltyCard.count({ where: { businessId: business.id } });
      if (clientCount >= 30) {
        return NextResponse.json({ error: "Ce commerce a atteint sa limite de clients. Contactez-le directement." }, { status: 403 });
      }
    }

    let user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      const passwordHash = await bcrypt.hash(password || Math.random().toString(36), 12);
      user = await prisma.user.create({
        data: {
          email,
          name: `${firstName} ${lastName}`,
          passwordHash,
          role: "CUSTOMER",
          customer: {
            create: { firstName, lastName, phone },
          },
        },
      });
    }

    let customer = await prisma.customer.findUnique({ where: { userId: user.id } });
    if (!customer) {
      customer = await prisma.customer.create({
        data: { userId: user.id, firstName, lastName, phone },
      });
    }

    const existingCard = await prisma.loyaltyCard.findUnique({
      where: { businessId_customerId: { businessId: business.id, customerId: customer.id } },
    });

    if (existingCard) {
      return NextResponse.json({ message: "Carte déjà existante", card: existingCard });
    }

    const card = await prisma.loyaltyCard.create({
      data: {
        businessId: business.id,
        customerId: customer.id,
      },
    });

    return NextResponse.json({ message: "Inscription réussie", card }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
