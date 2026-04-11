import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-03-25.dahlia",
});

// TODO: Créer dans le dashboard Stripe :
//   - Un prix récurrent mensuel à 59 € → mettre le priceId dans STRIPE_PRO_MONTHLY_PRICE_ID
//   - Un prix unique annuel à 564 €    → mettre le priceId dans STRIPE_PRO_ANNUAL_PRICE_ID
export const PLANS = {
  PRO: {
    name: "Pro",
    priceId: process.env.STRIPE_PRO_MONTHLY_PRICE_ID ?? "price_1TKL5gCmXadPCNPCQYsO82xE",
    price: 59,
  },
  PRO_ANNUAL: {
    name: "Pro Annuel",
    priceId: process.env.STRIPE_PRO_ANNUAL_PRICE_ID ?? "",
    price: 564, // 47 € × 12 mois (−20 %)
  },
};
