import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  const user = session.user as any;

  const fullUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      email: true,
      customer: { select: { firstName: true, lastName: true, phone: true } },
    },
  });

  return NextResponse.json(fullUser);
}

export async function PATCH(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  const user = session.user as any;

  const body = await request.json();
  const { firstName, lastName, phone, email, currentPassword, newPassword } = body;

  // Changement de mot de passe
  if (newPassword) {
    if (!currentPassword) return NextResponse.json({ error: "Mot de passe actuel requis" }, { status: 400 });
    const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
    if (!dbUser?.passwordHash) return NextResponse.json({ error: "Erreur" }, { status: 400 });
    const valid = await bcrypt.compare(currentPassword, dbUser.passwordHash);
    if (!valid) return NextResponse.json({ error: "Mot de passe actuel incorrect" }, { status: 400 });
    const hash = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({ where: { id: user.id }, data: { passwordHash: hash } });
  }

  // Mise à jour du profil
  await prisma.user.update({
    where: { id: user.id },
    data: {
      email: email || undefined,
      name: firstName && lastName ? `${firstName} ${lastName}` : undefined,
    },
  });

  await prisma.customer.update({
    where: { userId: user.id },
    data: {
      firstName: firstName || undefined,
      lastName: lastName || undefined,
      phone: phone ?? undefined,
    },
  });

  return NextResponse.json({ success: true });
}
