import jwt from "jsonwebtoken";

const GOOGLE_WALLET_ISSUER_ID =
  process.env.GOOGLE_WALLET_ISSUER_ID || "demo-issuer";
const GOOGLE_SERVICE_ACCOUNT_EMAIL =
  process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || "";
const GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY =
  process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY || "";

interface LoyaltyCardData {
  serialNumber: string;
  businessName: string;
  businessSlug: string;
  customerName: string;
  stampCount: number;
  stampsRequired: number;
  rewardLabel: string;
  cardBgColor: string;
}

export function generateGoogleWalletJWT(data: LoyaltyCardData): string | null {
  if (!GOOGLE_SERVICE_ACCOUNT_EMAIL || !GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY) {
    return null;
  }

  const classId = `${GOOGLE_WALLET_ISSUER_ID}.${data.businessSlug}`;
  const objectId = `${GOOGLE_WALLET_ISSUER_ID}.${data.serialNumber}`;

  const loyaltyObject = {
    id: objectId,
    classId: classId,
    state: "ACTIVE",
    accountName: data.customerName,
    accountId: data.serialNumber,
    loyaltyPoints: {
      label: "Points",
      balance: {
        int: data.stampCount,
      },
    },
    textModulesData: [
      {
        header: "Récompense",
        body: `${data.stampCount}/${data.stampsRequired} tampons - ${data.rewardLabel}`,
        id: "stamps",
      },
    ],
  };

  const payload = {
    iss: GOOGLE_SERVICE_ACCOUNT_EMAIL,
    aud: "google",
    origins: [],
    typ: "savetowallet",
    payload: {
      loyaltyObjects: [loyaltyObject],
    },
  };

  try {
    return jwt.sign(payload, GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY, {
      algorithm: "RS256",
    });
  } catch {
    return null;
  }
}

export function getGoogleWalletURL(token: string): string {
  return `https://pay.google.com/gp/v/save/${token}`;
}
