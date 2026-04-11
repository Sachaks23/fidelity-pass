import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("admin-token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const secret = process.env.ADMIN_SESSION_SECRET;
    if (!secret) {
      return NextResponse.json({ error: "Configuration manquante" }, { status: 500 });
    }

    const payload = jwt.verify(token, secret) as { role: string; email: string };

    if (payload.role !== "ADMIN") {
      return NextResponse.json({ error: "Accès refusé" }, { status: 401 });
    }

    return NextResponse.json({ email: payload.email });
  } catch {
    return NextResponse.json({ error: "Token invalide" }, { status: 401 });
  }
}
