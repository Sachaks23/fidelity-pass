// Constantes des plans — importable côté client ET serveur (pas de SDK Stripe ici)

export const PLANS = {
  PRO: {
    name: "Pro",
    priceId: process.env.STRIPE_PRO_MONTHLY_PRICE_ID ?? "price_1TKL5gCmXadPCNPCQYsO82xE",
    price: 59,
  },
  PRO_ANNUAL: {
    name: "Pro Annuel",
    priceId: process.env.STRIPE_PRO_ANNUAL_PRICE_ID ?? "",
    price: 564,
  },
};
