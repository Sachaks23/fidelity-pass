import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body as { email: string; password: string };

    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH;
    const adminSessionSecret = process.env.ADMIN_SESSION_SECRET;

    if (!adminEmail || !adminPasswordHash || !adminSessionSecret) {
      console.error("Admin environment variables are not configured");
      return NextResponse.json(
        { error: "Configuration serveur manquante" },
        { status: 500 }
      );
    }

    // Check email
    if (email !== adminEmail) {
      return NextResponse.json(
        { error: "Identifiants incorrects" },
        { status: 401 }
      );
    }

    // Check password
    const passwordValid = await bcrypt.compare(password, adminPasswordHash);
    if (!passwordValid) {
      return NextResponse.json(
        { error: "Identifiants incorrects" },
        { status: 401 }
      );
    }

    // Generate JWT
    const token = jwt.sign(
      { role: "ADMIN", email },
      adminSessionSecret,
      { expiresIn: "8h" }
    );

    const response = NextResponse.json({ success: true });

    // Set httpOnly cookie
    response.cookies.set("admin-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 8 * 60 * 60, // 8 hours in seconds
      path: "/",
    });

    return response;
  } catch (err) {
    console.error("Admin login error:", err);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}
