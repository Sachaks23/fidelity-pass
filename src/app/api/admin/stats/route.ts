import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

export async function GET() {
  // Check admin-token JWT cookie first
  let isAdminJwt = false;
  try {
    const cookieStore = await cookies();
    const adminToken = cookieStore.get("admin-token")?.value;
    const secret = process.env.ADMIN_SESSION_SECRET;
    if (adminToken && secret) {
      const payload = jwt.verify(adminToken, secret) as { role: string };
      if (payload.role === "ADMIN") {
        isAdminJwt = true;
      }
    }
  } catch {
    // Invalid token — fall through to NextAuth check
  }

  if (!isAdminJwt) {
    // Fallback: NextAuth session
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  // Fetch all PROFESSIONAL users with their business and loyalty card counts
  const users = await (prisma as any).user.findMany({
    where: {
      role: "PROFESSIONAL",
    },
    select: {
      id: true,
      email: true,
      name: true,
      plan: true,
      subscriptionStatus: true,
      subscriptionId: true,
      stripeCustomerId: true,
      createdAt: true,
      business: {
        select: {
          name: true,
          slug: true,
          _count: {
            select: {
              loyaltyCards: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // Aggregate stats
  const totalPro = users.filter((u: any) => u.plan === "PRO").length;
  const totalStarter = users.filter((u: any) => u.plan !== "PRO").length;
  const totalUsers = users.length;
  const mrr = totalPro * 59;

  // Count new this week
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  const newThisWeek = users.filter(
    (u: any) => new Date(u.createdAt) >= oneWeekAgo
  ).length;

  // Enrich with Stripe data
  const clients = await Promise.all(
    users.map(async (user: any) => {
      let stripeData: {
        currentPeriodEnd: number | null;
        nextInvoiceAmount: number | null;
        latestInvoiceStatus: string | null;
        isPastDue: boolean;
      } | null = null;

      if (user.subscriptionId) {
        try {
          const sub = await stripe.subscriptions.retrieve(
            user.subscriptionId,
            { expand: ["latest_invoice"] }
          );

          const invoice = sub.latest_invoice as any;

          stripeData = {
            currentPeriodEnd: (sub as any).current_period_end ?? null,
            nextInvoiceAmount: invoice?.amount_due ?? null,
            latestInvoiceStatus: invoice?.status ?? null,
            isPastDue: sub.status === "past_due",
          };
        } catch {
          // Subscription not found or error — skip
          stripeData = null;
        }
      }

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        plan: user.plan,
        subscriptionStatus: user.subscriptionStatus,
        stripeCustomerId: user.stripeCustomerId,
        subscriptionId: user.subscriptionId,
        createdAt: user.createdAt,
        business: user.business
          ? { name: user.business.name, slug: user.business.slug }
          : null,
        clientCount: user.business?._count?.loyaltyCards ?? 0,
        stripe: stripeData,
      };
    })
  );

  return NextResponse.json({
    stats: {
      totalPro,
      totalStarter,
      totalUsers,
      mrr,
      newThisWeek,
    },
    clients,
  });
}
