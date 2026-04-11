import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  const { password } = await req.json();

  const hash = process.env.ADMIN_PASSWORD_HASH ?? "NOT_SET";
  const email = process.env.ADMIN_EMAIL ?? "NOT_SET";
  const secret = process.env.ADMIN_SESSION_SECRET ?? "NOT_SET";

  let compareResult = false;
  let compareError = "";
  try {
    compareResult = await bcrypt.compare(password, hash);
  } catch (e: unknown) {
    compareError = e instanceof Error ? e.message : String(e);
  }

  return NextResponse.json({
    emailSet: email !== "NOT_SET",
    emailLength: email.length,
    hashSet: hash !== "NOT_SET",
    hashLength: hash.length,
    hashPrefix: hash.substring(0, 7),
    secretSet: secret !== "NOT_SET",
    compareResult,
    compareError,
  });
}
