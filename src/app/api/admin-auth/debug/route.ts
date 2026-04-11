import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { password } = await req.json();

  const adminEmail = process.env.ADMIN_EMAIL ?? "NOT_SET";
  const adminPassword = process.env.ADMIN_PASSWORD ?? "NOT_SET";
  const secret = process.env.ADMIN_SESSION_SECRET ?? "NOT_SET";

  return NextResponse.json({
    emailSet: adminEmail !== "NOT_SET",
    emailLength: adminEmail.length,
    passwordSet: adminPassword !== "NOT_SET",
    passwordMatch: password === adminPassword,
    secretSet: secret !== "NOT_SET",
  });
}
