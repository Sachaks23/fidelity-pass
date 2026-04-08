import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

// POST — verify security answer + set new PIN
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;
  if (!userId) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { securityAnswer, newPin } = await req.json();

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { securityAnswerHash: true, securityQuestion: true },
  });

  if (!user?.securityAnswerHash) {
    return NextResponse.json({ error: "Aucune question secrète définie" }, { status: 400 });
  }

  const answerValid = await bcrypt.compare(
    securityAnswer.trim().toLowerCase(),
    user.securityAnswerHash
  );

  if (!answerValid) {
    return NextResponse.json({ error: "Réponse incorrecte" }, { status: 401 });
  }

  if (!newPin || newPin.length !== 4 || !/^\d{4}$/.test(newPin)) {
    return NextResponse.json({ error: "Nouveau PIN invalide" }, { status: 400 });
  }

  const pinHash = await bcrypt.hash(newPin, 10);
  await prisma.user.update({ where: { id: userId }, data: { pinHash } });

  return NextResponse.json({ success: true });
}
