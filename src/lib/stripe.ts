import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-03-25.dahlia",
});

export const PLANS = {
  PRO: {
    name: "Pro",
    priceId: "price_1TKL5gCmXadPCNPCQYsO82xE",
    price: 90,
  },
  BUSINESS: {
    name: "Business",
    priceId: "price_1TKL6HCmXadPCNPCTC0Ckkoi",
    price: 130,
  },
};
