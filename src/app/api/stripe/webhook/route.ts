import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { stripe, PLANS } from "@/lib/stripe";
import Stripe from "stripe";

export const dynamic = "force-dynamic";

function getPlanFromPriceId(priceId: string): string {
  if (priceId === PLANS.PRO.priceId) return "PRO";
  if (priceId === PLANS.PRO_ANNUAL.priceId) return "PRO";
  return "STARTER";
}

export async function POST(req: Request) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature")!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { error: `Webhook signature verification failed: ${message}` },
      { status: 400 }
    );
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.mode !== "subscription") break;

      const customerId = session.customer as string;
      const subscriptionId = session.subscription as string;

      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      const priceId = subscription.items.data[0]?.price.id ?? "";
      const plan = getPlanFromPriceId(priceId);

      await prisma.user.updateMany({
        where: { stripeCustomerId: customerId },
        data: {
          plan,
          subscriptionId,
          subscriptionStatus: subscription.status,
        },
      });
      break;
    }

    case "customer.subscription.updated": {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId = subscription.customer as string;
      const priceId = subscription.items.data[0]?.price.id ?? "";
      const plan = getPlanFromPriceId(priceId);

      await prisma.user.updateMany({
        where: { stripeCustomerId: customerId },
        data: {
          plan,
          subscriptionStatus: subscription.status,
        },
      });
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId = subscription.customer as string;

      await prisma.user.updateMany({
        where: { stripeCustomerId: customerId },
        data: {
          plan: "STARTER",
          subscriptionStatus: "inactive",
          subscriptionId: null,
        },
      });
      break;
    }

    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice;
      const customerId = invoice.customer as string;

      await prisma.user.updateMany({
        where: { stripeCustomerId: customerId },
        data: { subscriptionStatus: "past_due" },
      });
      break;
    }

    default:
      break;
  }

  return NextResponse.json({ received: true });
}
