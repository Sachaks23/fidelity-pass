import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

// GET — check if user has PIN
export async function GET() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;
  if (!userId) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { pinHash: true, securityQuestion: true },
  });

  return NextResponse.json({
    hasPin: !!user?.pinHash,
    securityQuestion: user?.securityQuestion ?? null,
  });
}

// POST — verify PIN
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;
  if (!userId) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { pin } = await req.json();
  if (!pin || pin.length !== 4) return NextResponse.json({ error: "PIN invalide" }, { status: 400 });

  const user = await prisma.user.findUnique({ where: { id: userId }, select: { pinHash: true } });
  if (!user?.pinHash) return NextResponse.json({ error: "Aucun PIN défini" }, { status: 400 });

  const valid = await bcrypt.compare(pin, user.pinHash);
  if (!valid) return NextResponse.json({ error: "PIN incorrect" }, { status: 401 });

  return NextResponse.json({ success: true });
}

// PUT — setup or update PIN
export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;
  if (!userId) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { pin, securityQuestion, securityAnswer } = await req.json();
  if (!pin || pin.length !== 4 || !/^\d{4}$/.test(pin)) {
    return NextResponse.json({ error: "PIN doit être 4 chiffres" }, { status: 400 });
  }
  if (!securityQuestion?.trim() || !securityAnswer?.trim()) {
    return NextResponse.json({ error: "Question et réponse secrètes requises" }, { status: 400 });
  }

  const pinHash = await bcrypt.hash(pin, 10);
  const securityAnswerHash = await bcrypt.hash(securityAnswer.trim().toLowerCase(), 10);

  await prisma.user.update({
    where: { id: userId },
    data: { pinHash, securityQuestion: securityQuestion.trim(), securityAnswerHash },
  });

  return NextResponse.json({ success: true });
}

// DELETE — remove PIN
export async function DELETE() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;
  if (!userId) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  await prisma.user.update({
    where: { id: userId },
    data: { pinHash: null, securityQuestion: null, securityAnswerHash: null },
  });

  return NextResponse.json({ success: true });
}
